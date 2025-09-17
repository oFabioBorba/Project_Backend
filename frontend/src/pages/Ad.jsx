import "../styles/add.css";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MarketplaceNavbar from "../components/navbar";
import { jwtDecode } from "jwt-decode";

export default function Ad() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [photo, setPhoto] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [userId, setUserId] = useState();
  const [message, setMessage] = useState();
  const [isError, setIsError] = useState();

  const [form, setForm] = useState({
    photos: [],
    photoPreviews: [],
    userId: "",
    title: "",
    description: "",
    categories: "",
  });

  const user = { photoUrl: photo };

  const navigate = useNavigate();

  function handlePhoto(e) {
    const files = e.target.files;
    if (!files) return;

    const availableSlots = 4 - form.photos.length;
    const newFiles = Array.from(files).slice(0, availableSlots);

    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

    setForm((prev) => ({
      ...prev,
      photos: [...prev.photos, ...newFiles],
      photoPreviews: [...prev.photoPreviews, ...newPreviews],
    }));
  }

  function removePhoto(index) {
    const url = form.photoPreviews[index];
    if (url) URL.revokeObjectURL(url);

    setForm((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
      photoPreviews: prev.photoPreviews.filter((_, i) => i !== index),
    }));
  }

  async function saveAd(e) {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("idUser", userId);
      formData.append("idCategory", form.categories);
      formData.append("title", form.title);
      formData.append("description", form.description);

      form.photos.forEach((file) => {
        formData.append("photos", file);
      });

      const response = await fetch("http://localhost:8080/ad", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setMessage("Anúncio criado com sucesso!");
        setIsError(false);
        setTimeout(() => navigate("/home"), 1500);
      } else {
        const data = await response.json();
        setMessage("Erro: " + (data.error || "Erro desconhecido"));
        setIsError(true);
      }
    } catch (error) {
      console.error(error);
      setIsError(true);
      setMessage("Erro ao criar anúncio: " + error.message);
    }
  }

  useEffect(() => {
    async function checkAuthAndLoadProfile() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }

        const decoded = jwtDecode(token);
        const now = Date.now() / 1000;

        if (decoded.exp && decoded.exp < now) {
          navigate("/");
          return;
        }
        setUserId(decoded.userid);
        const response = await fetch(
          `http://localhost:8080/profile/getprofile/${decoded.userid}`,
          {
            method: "GET",
            headers: { "content-type": "application/json" },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const profile = data.response;
          if (profile.profile_photo) {
            const photoUrl = `data:image/jpeg;base64,${profile.profile_photo}`;
            setPhoto(photoUrl);
          }
        }
        if (response.status === 404) {
          navigate("/profile");
        }
      } catch (error) {
        console.log("Erro ao autenticar ou carregar perfil", error);
      }
    }
    checkAuthAndLoadProfile();
  }, [navigate]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    async function listcategories() {
      try {
        const response = await fetch("http://localhost:8080/ad/categories");
        const data = await response.json();
        setAllCategories(data);
      } catch (error) {
        console.log("Erro ao carregar as categorias", error);
      }
    }
    listcategories();
  }, []);

  return (
    <>
      <MarketplaceNavbar user={user} theme={theme} setTheme={setTheme} />
      <form className="card" style={{ width: 1000 }} onSubmit={saveAd}>
        <div className="sendphoto">
          <div className="photopreview" aria-label="Pré-visualização das fotos">
            {form.photoPreviews.length > 0 ? (
              form.photoPreviews.map((src, index) => (
                <div key={index} className="photo-container">
                  <img key={index} src={src} alt={`Foto ${index + 1}`} />
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removePhoto(index)}
                  >
                    ✕
                  </button>
                </div>
              ))
            ) : (
              <span>Fotos</span>
            )}
          </div>

          <label
            className={`btn-outlined ${
              form.photos.length >= 4 ? "disabled" : ""
            }`}
          >
            Enviar foto
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhoto}
              style={{ display: "none" }}
              disabled={form.photos.length >= 4}
            />
          </label>
        </div>

        <label htmlFor="title">Título</label>
        <textarea
          id="title"
          name="title"
          placeholder="Escreva seu títulotos aqui…"
          rows={1}
          value={form.title}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, title: e.target.value }))
          }
          required
          style={{ resize: "none" }}
        />

        <label htmlFor="description">Descrição</label>
        <textarea
          id="description"
          name="description"
          placeholder="Escreva sua descrição aqui…"
          rows={7}
          value={form.description}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, description: e.target.value }))
          }
          required
          style={{ resize: "none" }}
        />
        <div className="select-container">
          <select
            value={form.categories}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, categories: e.target.value }))
            }
          >
            <option value="">Selecione...</option>
            {allCategories.map((cat) => (
              <option key={cat.id_category} value={cat.id_category}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="actions">
          <button
            type="submit"
            className="btn-primary"
            disabled={
              form.title === "" ||
              form.description === "" ||
              form.categories === "" ||
              form.photos.length === 0
            }
          >
            Criar Anúncio
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              navigate("/home");
            }}
          >
            Retornar
          </button>
        </div>
      </form>
    </>
  );
}
