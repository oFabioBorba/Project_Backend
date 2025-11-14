import express from "express";
import db from "../db.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { to_user, from_user, rating, conversation_id } = req.body;

  try {
    await db.none(
      `UPDATE User_Profile 
       SET feedback = ((feedback * feedback_count) + $1) / (feedback_count + 1),
           feedback_count = feedback_count + 1
       WHERE id_user = $2`,
      [rating, to_user]
    );

    const conv = await db.one(
      `SELECT user_one_id, user_two_id, rated_user1, rated_user2
       FROM conversations 
       WHERE id = $1`,
      [conversation_id]
    );

    const fromUserId = Number(from_user);
    const evaluatorField =
      fromUserId === conv.user_one_id ? "rated_user1" : "rated_user2";

    await db.none(
      `UPDATE conversations 
       SET ${evaluatorField} = true 
       WHERE id = $1`,
      [conversation_id]
    );

    await db.none(
      `UPDATE conversations 
       SET finished = 'false'
       WHERE id = $1 
         AND rated_user1 = true 
         AND rated_user2 = true`,
      [conversation_id]
    );


    const updated = await db.one(
      `SELECT id AS conversation_id, finished, rated_user1, rated_user2 FROM conversations WHERE id = $1`,
      [conversation_id]
    );

    res.status(200).json({ message: "Avaliação registrada com sucesso", conversation: updated });
  } catch (err) {
    console.error("Erro ao registrar avaliação:", err);
    res.status(500).json({ error: "Falha ao registrar avaliação" });
  }
});

export default router;
