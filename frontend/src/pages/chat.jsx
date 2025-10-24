import React, { useState, useEffect, useRef } from "react";
import MarketplaceNavbar from "../components/navbar"; 
import { jwtDecode } from "jwt-decode"; 
import { useNavigate } from "react-router-dom";
import "../styles/chat.css";

export default function Chat() {
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [photo, setPhoto] = useState(null); 
  const [userId, setUserId] = useState(null); 
  
  const messagesEndRef = useRef(null);
  const user = { photoUrl: photo };
  const navigate = useNavigate();

  useEffect(() => {
    async function checkAuthAndLoadProfile() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }

        const decoded = jwtDecode(token);
        const now = Date.now() / 1000;

        if (decoded.exp && decoded.exp < now) {
          navigate("/");
          return;
        }
        
        setUserId(decoded.userid);

        const response = await fetch(
          `http://localhost:8080/profile/getprofile/${decoded.userid}`,
          {
            method: "GET",
            headers: { "content-type": "application/json" },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const profile = data.response;
          if (profile.profile_photo) {
            const photoUrl = `data:image/jpeg;base64,${profile.profile_photo}`;
            setPhoto(photoUrl);
          }
        }
        if (response.status === 404) {
          navigate("/profile");
        }
      } catch (error) {
        console.log("Erro ao autenticar ou carregar perfil", error);
      }
    }
    checkAuthAndLoadProfile();
  }, [navigate]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!userId) return; 
    async function fetchConversations() {
      try {
        const response = await fetch(`http://localhost:8080/messages/conversations/${userId}`);
        
        if (!response.ok) throw new Error("Falha ao buscar conversas");

        const data = await response.json();

        const formattedConversations = data.map(conv => ({
          ...conv,
          avatar: conv.profile_photo ? `data:image/jpeg;base64,${conv.profile_photo}` : '/default-avatar.png',
          username: conv.username 
        }));

        setConversations(formattedConversations);
      } catch (error) {
        console.error("Erro ao buscar conversas", error);
        setConversations([]);
      }
    }
    fetchConversations();
  }, [userId]); 

  useEffect(() => {
    if (!selectedConv || !userId) return;
    
    async function fetchMessages() {
      try {
        const response = await fetch(`http://localhost:8080/messages/conversation/${selectedConv.conversation_id}`);
        
        if (!response.ok) throw new Error("Falha ao buscar mensagens");
        
        const data = await response.json();
        
        const formattedMessages = data.map(msg => ({
          ...msg,
          isMine: msg.sender_id === userId,
          text: msg.content, 
        }));

        setMessages(formattedMessages); 
        
      } catch (error) {
        console.error("Erro ao buscar mensagens", error);
        setMessages([]);
      }
    }
    fetchMessages();
  }, [selectedConv, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
useEffect(() => {
    if (!userId) return;

    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => {
      console.log("✅ Conectado ao WebSocket");
      ws.send(JSON.stringify({ type: "SET_USER", userId }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "NEW_MESSAGE") {
          const newMsg = msg.data;

          if (selectedConv && newMsg.conversation_id === selectedConv.conversation_id) {
            setMessages((prev) => [
              ...prev,
              {
                sender_id: newMsg.sender_id,
                content: newMsg.content,
                isMine: newMsg.sender_id === userId,
                created_at: newMsg.created_at,
                text: newMsg.content,
              },
            ]);
          } else {
            console.log("Nova mensagem em outra conversa:", newMsg);
          }
        }
      } catch (err) {
        console.error("Erro ao processar mensagem WS:", err);
      }
    };

    ws.onclose = () => console.log("🔌 Conexão WebSocket fechada");

    return () => ws.close();
  }, [userId, selectedConv]);
  async function sendMessage(e) {
    e.preventDefault();
    const conversationId = selectedConv?.conversation_id;
    if (!input.trim() || !conversationId || !userId) return;

    try {
      const response = await fetch(`http://localhost:8080/messages/sendmessage`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          conversation_id: conversationId,
          sender_id: userId,
          content: input,
        }),
      });

      if (!response.ok) throw new Error("Falha ao enviar mensagem");

      const tempNewMessage = { 
          sender_id: userId, 
          content: input, 
          isMine: true, 
          created_at: new Date().toISOString(),
          text: input 
      };
      setMessages((prev) => [...prev, tempNewMessage]); 
      
      setInput("");

    } catch (error) {
      console.error("Erro ao enviar mensagem", error);
    }
  }

  return (
    <>
      <MarketplaceNavbar user={user} theme={theme} setTheme={setTheme} />
      
      <div className="main-content-wrapper" style={{ paddingTop: '56px', width: '300%', marginLeft: '-300px' }}>
        <div className="chatpage-container"> 
          <div className="chatpage-sidebar">
            <h3>Conversas</h3>
            <ul>
              {conversations.map((conv) => (
                <li
                  key={conv.conversation_id} 
                  className={selectedConv?.conversation_id === conv.conversation_id ? "active" : ""}
                  onClick={() => setSelectedConv(conv)}
                >
                  <img src={conv.avatar} alt={conv.username} className="chatpage-avatar" />
                  <span>{conv.username}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="chatpage-main">
            {selectedConv ? (
              <>
                <div className="chatpage-header">
                  <img src={selectedConv.avatar} alt={selectedConv.username} className="chatpage-avatar" />
                  <span>{selectedConv.username}</span>
                </div>
                <div className="chatpage-messages">
                  {messages.map((msg, idx) => (
                    <div
                      key={msg.id || idx} 
                      className={`chatpage-message ${msg.isMine ? "mine" : ""}`}
                    >
                      <span>{msg.text}</span>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>  
                <form className="chatpage-inputbar" onSubmit={sendMessage}>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Digite sua mensagem..."
                  />
                  <button type="submit">Enviar</button>
                </form>
              </>
            ) : (
              <div className="chatpage-empty">Selecione uma conversa</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
