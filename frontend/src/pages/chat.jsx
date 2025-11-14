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
  const [tradeStatus, setTradeStatus] = useState("false");

  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);
  const navigate = useNavigate();

  const user = { photoUrl: photo };

  useEffect(() => {
    async function loadProfile() {
      try {
        const token = localStorage.getItem("token");
        if (!token) navigate("/");

        const decoded = jwtDecode(token);
        const now = Date.now() / 1000;
        if (decoded.exp && decoded.exp < now) navigate("/");

        setUserId(decoded.userid);

        const res = await fetch(
          `http://localhost:8080/profile/getprofile/${decoded.userid}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.response.profile_photo)
            setPhoto(`data:image/jpeg;base64,${data.response.profile_photo}`);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadProfile();
  }, [navigate]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!userId) return;
    async function fetchConversations() {
      const res = await fetch(
        `http://localhost:8080/messages/conversations/${userId}`
      );
      if (!res.ok) return setConversations([]);
      const data = await res.json();
      setConversations(
        data.map((conv) => ({
          ...conv,
          avatar: conv.profile_photo
            ? `data:image/jpeg;base64,${conv.profile_photo}`
            : "/default-avatar.png",
        }))
      );
    }
    fetchConversations();
  }, [userId]);

  useEffect(() => {
    if (!selectedConv || !userId) return;
    async function fetchMessages() {
      const res = await fetch(
        `http://localhost:8080/messages/conversation/${selectedConv.conversation_id}`
      );
      if (!res.ok) return setMessages([]);
      const data = await res.json();
      setMessages(
        data.map((msg) => ({
          ...msg,
          isMine: msg.sender_id === userId,
          text: msg.content,
        }))
      );
      setTradeStatus(selectedConv.finished || "false");
    }
    fetchMessages();
  }, [selectedConv, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!userId) return;
    const ws = new WebSocket("ws://localhost:8080");
    wsRef.current = ws;

    ws.onopen = () => ws.send(JSON.stringify({ type: "SET_USER", userId }));

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "NEW_MESSAGE") {
        const newMsg = msg.data;
        if (
          selectedConv &&
          newMsg.conversation_id === selectedConv.conversation_id
        ) {
          setMessages((prev) => {
            if (
              prev.some(
                (m) =>
                  m.content === newMsg.content &&
                  m.created_at === newMsg.created_at
              )
            )
              return prev;
            return [
              ...prev,
              {
                sender_id: newMsg.sender_id,
                content: newMsg.content,
                isMine: newMsg.sender_id === userId,
                created_at: newMsg.created_at,
                text: newMsg.content,
              },
            ];
          });
        }
      }

      if (msg.type === "TRADE_UPDATE") {
        const { conversation_id, finished } = msg.data;
        if (
          selectedConv &&
          parseInt(conversation_id) === selectedConv.conversation_id
        ) {
          setTradeStatus(finished);
          setSelectedConv((prev) => ({ ...prev, finished }));
        }
      }
    };
    ws.onclose = () => console.log("WS fechado");
    return () => ws.close();
  }, [userId, selectedConv]);

  async function sendMessage(e) {
    e.preventDefault();
    if (!input.trim() || !selectedConv || !userId) return;
    await fetch(`http://localhost:8080/messages/sendmessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversation_id: selectedConv.conversation_id,
        sender_id: userId,
        content: input,
      }),
    });
    setMessages((prev) => [
      ...prev,
      { content: input, isMine: true, text: input, created_at: new Date() },
    ]);
    setInput("");
  }

  async function handleStartTrade() {
    if (!selectedConv) return;
    try {
      await fetch(
        `http://localhost:8080/messages/updatetrade/${selectedConv.conversation_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ finished: "pending", sender_id: userId }),
        }
      );
      setTradeStatus("pending");
      setSelectedConv((prev) => ({ ...prev, finished: "pending" }));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAcceptTrade() {
    if (!selectedConv) return;
    try {
      await fetch(
        `http://localhost:8080/messages/updatetrade/${selectedConv.conversation_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ finished: "true", sender_id: userId }),
        }
      );
      setTradeStatus("true");
      setSelectedConv((prev) => ({ ...prev, finished: "true" }));

      setMessages((prev) => [
        ...prev,
        {
          content: "✅ Troca aceita!",
          isMine: true,
          text: "✅ Troca aceita!",
          created_at: new Date(),
        },
      ]);
    } catch (err) {
      console.error(err);
    }
  }

async function handleRatingSubmit(stars) {
  try {
    await fetch("http://localhost:8080/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to_user: selectedConv.other_user_id,
        from_user: userId,
        rating: stars,
        conversation_id: selectedConv.conversation_id,
      }),
    });
    const convsRes = await fetch(
      `http://localhost:8080/messages/conversations/${userId}`
    );
    if (convsRes.ok) {
      const convs = await convsRes.json();
      const updated = convs.find(
        (c) => c.conversation_id === selectedConv.conversation_id
      );
      if (updated) {
        setConversations(
          convs.map((conv) => ({
            ...conv,
            avatar: conv.profile_photo
              ? `data:image/jpeg;base64,${conv.profile_photo}`
              : "/default-avatar.png",
          }))
        );
        setSelectedConv((prev) => ({ ...prev, ...updated }));
        setTradeStatus(updated.finished || "false");
      }
    }

    setMessages((prev) => [
      ...prev,
      { text: `⭐ Você avaliou ${stars} estrelas!`, isMine: true },
    ]);
  } catch (err) {
    console.error(err);
  }
}


  function StarRating({ onRate }) {
  const [rating, setRating] = useState(0);
  return (
    <div className="stars">
      {[1.0, 2.0, 3.0, 4.0, 5.0].map((star) => (
        <span
          key={star}
          onClick={() => {
            setRating(star);
            onRate(star);
          }}
          style={{
            cursor: "pointer",
            fontSize: "24px",
            color: star <= rating ? "gold" : "gray",
            marginRight: "4px",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

  return (
    <>
      <MarketplaceNavbar user={user} theme={theme} setTheme={setTheme} />
      <div
        className="main-content-wrapper"
        style={{ paddingTop: "56px", width: "300%", marginLeft: "-300px" }}
      >
        <div className="chatpage-container">
          <div className="chatpage-sidebar">
            <h3>Conversas</h3>
            <ul>
              {conversations.map((conv) => (
                <li
                  key={conv.conversation_id}
                  className={
                    selectedConv?.conversation_id === conv.conversation_id
                      ? "active"
                      : ""
                  }
                  onClick={() => setSelectedConv(conv)}
                >
                  <img
                    src={conv.avatar}
                    alt={conv.username}
                    className="chatpage-avatar"
                  />
                  <span>{conv.username}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="chatpage-main">
            {selectedConv ? (
              <>
                <div className="chatpage-header">
                  <img
                    src={selectedConv.avatar}
                    alt={selectedConv.username}
                    className="chatpage-avatar"
                  />
                  <span>{selectedConv.username}</span>
                  {tradeStatus === "false" && (
                    <button onClick={handleStartTrade} className="trade-btn">
                      Iniciar troca
                    </button>
                  )}
                </div>

                <div className="chatpage-messages">
                  {messages.map((msg, idx) => {
                    const isTradeMsg = msg?.content && msg.content.includes("Pedido de troca enviado");

                    const isLastTradeMsg = isTradeMsg
                      ? messages
                          .slice()
                          .reverse()
                          .find((m) =>
                            m.content?.includes("Pedido de troca enviado")
                          ) === msg
                      : false;

                    return (
                      <div
                        key={idx}
                        className={`chatpage-message ${
                          msg.isMine ? "mine" : ""
                        }`}
                      >
                        <span>{msg.text}</span>
                        {isLastTradeMsg &&
                          !msg.isMine &&
                          tradeStatus === "pending" && (
                            <button
                              className="trade-btn accept-inline"
                              onClick={handleAcceptTrade}
                              style={{ display: "block", marginTop: "8px" }}
                            >
                              Aceitar troca
                            </button>
                          )}
                      </div>
                    );
                  })}
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

                {tradeStatus === "true" && (() => {
                  const hasRated = (() => {
                    if (!selectedConv) return false;
                    if (userId === selectedConv.user_one_id) return selectedConv.rated_user1;
                    if (userId === selectedConv.user_two_id) return selectedConv.rated_user2;
                    return false;
                  })();

                  if (hasRated) {
                    return (
                      <div className="rating-section">
                        <p>✅ Troca finalizada — você já avaliou este participante.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="rating-section">
                      <p>✅ Troca finalizada — avalie o outro participante!</p>
                      <StarRating onRate={handleRatingSubmit} />
                    </div>
                  );
                })()}
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

