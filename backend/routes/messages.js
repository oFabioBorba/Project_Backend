import express from "express";
import db from "../db.js";
import multer from "multer";

const router = express.Router();

router.get("/conversation/:conversation_id", async (req, res) => {
  const { conversation_id } = req.params; 
  
  try {
    const messages =
      await db.manyOrNone(`
        SELECT 
            m.id, 
            m.conversation_id,
            m.sender_id, 
            m.content, 
            m.created_at, 
            m.is_read
        FROM messages m
        WHERE m.conversation_id = $1
        ORDER BY m.created_at ASC;`, [conversation_id]);
        
    res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar mensagens" });
  }
});

router.post("/startconversation", async (req, res) => {
  const { user_one_id, user_two_id } = req.body;

  try {
    const convesationexist = await db.oneOrNone(
      "SELECT * FROM conversations WHERE (user_one_id = $1 AND user_two_id = $2) OR (user_one_id = $2 AND user_two_id = $1)",
      [user_one_id, user_two_id]
    );
    if (convesationexist) {
      return res.status(400).json({ error: "Conversa já existe" });
    }
    const response = await db.none(
      "INSERT INTO conversations (user_one_id, user_two_id) VALUES ($1, $2)",
      [user_one_id, user_two_id]
    );
    res.status(201).json({ message: "Conversa iniciada com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao iniciar conversa" });
  }
});

router.post("/sendmessage", async (req, res) => {
  const { conversation_id, sender_id, content } = req.body;

  try {
    await db.none(
      "INSERT INTO messages (conversation_id, sender_id, content) VALUES ($1, $2, $3)",
      [conversation_id, sender_id, content]
    );

    const conversation = await db.one(
      "SELECT user_one_id, user_two_id FROM conversations WHERE id = $1",
      [conversation_id]
    );

    const receiver_id =
      conversation.user_one_id === sender_id
        ? conversation.user_two_id
        : conversation.user_one_id;

    const sendToUser = req.app.get("sendToUser");
    sendToUser(receiver_id, {
      type: "NEW_MESSAGE",
      data: { conversation_id, sender_id, content, created_at: new Date() },
    });

    res.status(200).json({ message: "Mensagem enviada com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Houve um erro ao enviar a mensagem" });
  }
});


router.put("/readmessage", async (req, res) => {
  const { id } = req.body;
  try{
    const response = await db.none ("UPDATE messages SET is_read = true WHERE id = $1", [id])
    res.status(200).json ({message: "Mensagens visualizadas"})
  }catch(error){
    res.status(500).json({error: "Falha ao ler as mensagens"})
  }
})

router.get("/conversations/:user_id", async (req, res) => {
  const { user_id } = req.params; 

  try {
    const conversations = await db.manyOrNone(`
      SELECT
        c.id AS conversation_id,
        c.created_at,
        CASE
          WHEN c.user_one_id = $1 THEN c.user_two_id
          ELSE c.user_one_id
        END AS other_user_id,
        u.username,
        p.profile_photo
        
      FROM conversations c
      
      JOIN User_Profile p ON p.id_user = 
        CASE
          WHEN c.user_one_id = $1 THEN c.user_two_id
          ELSE c.user_one_id
        END
        
      JOIN Users u ON u.id_user = 
        CASE
          WHEN c.user_one_id = $1 THEN c.user_two_id
          ELSE c.user_one_id
        END
        
      WHERE c.user_one_id = $1 OR c.user_two_id = $1
      
      ORDER BY c.created_at DESC; 
    `, [user_id]);
    
    const formattedConversations = conversations.map(conv => ({
        ...conv,
        profile_photo: conv.profile_photo 
          ? conv.profile_photo.toString('base64') 
          : null 
    }));

    res.status(200).json(formattedConversations);

  } catch (error) {
    console.error("Erro ao buscar conversas:", error);
    res.status(500).json({ error: "Erro ao buscar a lista de conversas" });
  }
});


export default router;
