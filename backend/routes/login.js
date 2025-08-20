import express from 'express';
import db from '../db.js'

const router = express.Router();

router.get('/api', (req, res) => {
    res.send({name: "Gabriel Barros", idade: 20});
});


export default router;
