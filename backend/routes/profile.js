import express from 'express';
import db from '../db.js';
import multer from 'multer';

const router = express.Router();
const upload = multer(); 

router.post('/saveprofile', upload.single('profile_photo'), async (req, res) => {
    const { id_user, neighbourhood, city, CEP, UF, about } = req.body;
    const profile_photo = req.file ? req.file.buffer : null; 

    try {
        await db.none(
            'INSERT INTO User_Profile (id_user, neighbourhood, city, CEP, UF, profile_photo, about) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [id_user, neighbourhood, city, CEP, UF, profile_photo, about]
        );

        res.status(201).json({ message: "Usuário inserido no banco" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Falha ao salvar usuário" });
    }
});

router.get('/getprofile/:iduser', async (req, res) => {
    const { iduser } = req.params;
    try {
        const response = await db.oneOrNone('SELECT * FROM User_Profile WHERE id_user = $1', [iduser]);

        if (response) {
            if (response.profile_photo) {
                response.profile_photo = response.profile_photo.toString('base64'); 
            }
            res.status(200).json({ response });
        } else {
            res.status(404).json({ message: "Usuário não encontrado" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Falha ao consultar usuário" });
    }
});


export default router;