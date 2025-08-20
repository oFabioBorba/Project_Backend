import express from 'express';
import db from '../db.js';
import bcrypt from 'bcrypt';

const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  const saltRounds = 10;

  try {
    const hash = await bcrypt.hash(password, saltRounds);

    const response = await db.one(
      'INSERT INTO users (username, email, hash_password) VALUES ($1, $2, $3) RETURNING id_user',
      [username, email, hash]
    );

    res.status(201).json({ message: `Usuário ${response.id_user} cadastrado com sucesso!` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao cadastrar usuário." });
  }
});

export default router;
