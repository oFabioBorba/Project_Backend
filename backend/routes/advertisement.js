import express from "express";
import db from "../db.js";
import multer from "multer";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get("/categories", async (req, res) => {
  try {
    const response = await db.many("SELECT * FROM categories");
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Erro ao consultar categorias" });
  }
});

router.post("/", (req, res) => {
  upload.array("photos", 4)(req, res, async (err) => {
    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "Arquivo muito grande, máximo 5MB" });
    } else if (err) {
      return res.status(500).json({ error: "Erro ao processar arquivo" });
    }

    const { idUser, idCategory, title, description } = req.body;
    const files = req.files || [];

    const photos = [null, null, null, null];
    files.forEach((file, index) => {
      photos[index] = file.buffer;
    });

    try {
      await db.none(
        "INSERT INTO advertisement (id_user, id_category, title, description, photo, photo2, photo3, photo4) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)",
        [idUser, idCategory, title, description, photos[0], photos[1], photos[2], photos[3]]
      );
      res.status(201).json({ message: "Anúncio criado com sucesso" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao criar o anúncio" });
    }
  });
});

router.get('/', async (req, res) => {
  try {
    const { idcategory, city, name, date } = req.query;

    const filtros = [];
    const valores = {};

    if (idcategory) {
      filtros.push('a.id_category = ${idcategory}');
      valores.idcategory = idcategory;
    }
    if (city) {
      filtros.push('up.city ILIKE ${city}');
      valores.city = `%${city}%`;
    }
    if (name) {
      filtros.push('a.title ILIKE ${name}');
      valores.name = `%${name}%`;
    }
    if (date) {
      filtros.push('a.created_at::date = ${date}');
      valores.date = date;
    }

    const whereClause = filtros.length ? 'WHERE ' + filtros.join(' AND ') : '';

    const query = `
      SELECT 
        a.id_advertisement,
        a.title,
        a.description,
        a.created_at,
        c.name AS category,
        u.username,
        up.city,
        up.UF
      FROM advertisement a
      JOIN Users u ON a.id_user = u.id_user
      JOIN User_Profile up ON u.id_user = up.id_user
      JOIN categories c ON a.id_category = c.id_category
      ${whereClause}
      ORDER BY a.created_at DESC
    `;

    const resultado = await db.any(query, valores);
    res.json(resultado);
  } catch (error) {
    console.error('Erro ao buscar anúncios:', error);
    res.status(500).json({ erro: 'Erro interno ao buscar anúncios' });
  }
});


export default router;
