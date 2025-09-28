import express from "express";
import db from "../db.js";

const router = express.Router();

router.get("/conversation", async (req, res) => {
  const { user_one_id, user_two_id } = req.query;
  try {
    const messages =
      await db.manyOrNone(`SELECT m.id, m.sender_id, m.content, m.created_at, m.is_read
   FROM messages m
   JOIN conversations c ON c.id = m.conversation_id
   WHERE (c.user_one_id = $1 AND c.user_two_id = $2)
   OR (c.user_one_id = $2 AND c.user_two_id = $1)
   ORDER BY m.created_at DESC;`, [user_one_id, user_two_id]);
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
  const {conversation_id, sender_id, content} = req.body;
  try{
    const response = await db.oneOrNone("INSERT INTO messages (conversation_id, sender_id, content) VALUES ($1, $2, $3)", [conversation_id, sender_id, content])
    res.status(200).json({message: "Mensagem enviada com sucesso"})
  }catch(error){
    console.error(error)
    res.status(500).json({error: "Houve um erro ao enviar a mensagem"})
  }
})

router.put("/readmessage", async (req, res) => {
  const { id } = req.body;
  try{
    const response = await db.none ("UPDATE messages SET is_read = true WHERE id = $1", [id])
    res.status(200).json ({message: "Mensagens visualizadas"})
  }catch(error){
    res.status(500).json({error: "Falha ao ler as mensagens"})
  }
})


export default router;
