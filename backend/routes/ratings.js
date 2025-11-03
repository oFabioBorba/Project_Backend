import express from "express";
import db from "../db.js";

const router = express.Router();

// Envia uma avaliação
router.post("/", async (req, res) => {
  const { conversation_id, from_user, to_user, rating } = req.body;

  try {
    await db.none(
      "INSERT INTO ratings (conversation_id, from_user, to_user, rating, created_at) VALUES ($1, $2, $3, $4, NOW())",
      [conversation_id, from_user, to_user, rating]
    );

    // Verifica se os dois já avaliaram
    const total = await db.one(
      "SELECT COUNT(*) FROM ratings WHERE conversation_id = $1",
      [conversation_id]
    );

    if (parseInt(total.count) >= 2) {
      // Reseta conversa (ambos avaliaram)
      await db.none(
        "UPDATE conversations SET finished = 'false' WHERE id = $1",
        [conversation_id]
      );
    }

    res.status(200).json({ message: "Avaliação registrada com sucesso" });
  } catch (err) {
    console.error("Erro ao registrar avaliação:", err);
    res.status(500).json({ error: "Falha ao registrar avaliação" });
  }
});

export default router;
