import express from 'express';
import db from '../db.js'
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

const router = express.Router();
const JWT_SECRET = "lsdfknaba213n12475lfsd" // ALTERAR E ESCONDER NO .ENV QUANDO O PROJETO ESTIVER PRONTO

router.post("/verifylogin", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await db.oneOrNone(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (!user) {
            return res.status(401).json({ error: "Credenciais inválidas." });
        }
        const userid = user.id_user

        const match = await bcrypt.compare(password, user.hash_password);

        if (match) {
            const token = jwt.sign(
                {userid, email}, JWT_SECRET, {expiresIn: "1h"}
            )
            res.status(200).json({ message: token});
        } else {
            res.status(401).json({ error: "Credenciais inválidas." });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao verificar usuário." });
    }
});


export default router;


