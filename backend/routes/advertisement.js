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

router.get("/", async (req, res) => {
  try {
    const { idcategory, city, id_advertisement, uf, name, date, page, id_user, limit: queryLimit } = req.query;
    const limit = queryLimit ? parseInt(queryLimit) : 7;
    const offset = page ? (parseInt(page) - 1) * limit : 0;

    const filtros = [];
    const valores = {};

    if (id_user){
      filtros.push("a.id_user = ${id_user}");
      valores.id_user = id_user;
    }

    if (id_advertisement) {
      filtros.push("a.id_advertisement = ${id_advertisement}");
      valores.id_advertisement = id_advertisement;
    }
    
    if (idcategory) {
      filtros.push("a.id_category = ${idcategory}");
      valores.idcategory = idcategory;
    }
    if (city) {
      filtros.push("up.city ILIKE ${city}");
      valores.city = `%${city}%`;
    }
    if (name) {
      filtros.push("a.title ILIKE ${name}");
      valores.name = `%${name}%`;
    }
    if (date) {
      filtros.push("a.created_at::date = ${date}");
      valores.date = date;
    }
    if (uf) {
      filtros.push("up.UF ILIKE ${uf}");
      valores.uf = `%${uf}%`;
    }

    const whereClause = filtros.length ? "WHERE " + filtros.join(" AND ") : "";

    const query = `
      SELECT 
        a.id_advertisement,
        a.title,
        a.description,
        a.created_at,
        a.photo,
        a.photo2,
        a.photo3,
        a.photo4,
        c.name AS category,
        u.username,
        up.city,
        up.profile_photo,
        up.feedback,
        up.UF as UF
      FROM advertisement a
      JOIN Users u ON a.id_user = u.id_user
      JOIN User_Profile up ON u.id_user = up.id_user
      JOIN categories c ON a.id_category = c.id_category
      ${whereClause}
      ORDER BY a.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    const resultado = await db.any(query, valores);
    
    const anuncios = resultado.map((ad) => ({
      ...ad,
      profile_photo: ad.profile_photo ? ad.profile_photo.toString("base64") : null,
      photo: ad.photo ? ad.photo.toString("base64") : null,
      photo2: ad.photo2 ? ad.photo2.toString("base64") : null,
      photo3: ad.photo3 ? ad.photo3.toString("base64") : null,
      photo4: ad.photo4 ? ad.photo4.toString("base64") : null,
    }));

    res.json(anuncios);
  } catch (error) {
    console.error("Erro ao buscar anúncios:", error);
    res.status(500).json({ erro: "Erro interno ao buscar anúncios" });
  }
});

router.delete("/:id_advertisement", async (req, res) => {
  const { id_advertisement } = req.params;
  try {
    const result = await db.result("DELETE FROM advertisement WHERE id_advertisement = $1", [id_advertisement]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Anúncio não encontrado" });
    }
    res.status(200).json({ message: "Anúncio deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar anúncio:", error);
    res.status(500).json({ error: "Erro interno ao deletar anúncio" });
  }
});

export default router;
