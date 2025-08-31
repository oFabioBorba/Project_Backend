import "../styles/add.css";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MarketplaceNavbar from "../components/navbar";
import { jwtDecode } from "jwt-decode";

export default function Ad() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [photo, setPhoto] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const user = { photoUrl: photo };
  const [allCategories, setAllCategories] = useState([]);
  const [categories, setCateogries] = useState();
  const [form, setForm] = useState({
    cep: "",
    neighbourhood: "",
    city: "",
    uf: "",
    about: "",
    photo: null,
  });
  const navigate = useNavigate();

  function handlePhoto(e) {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files).slice(0, 4 - photos.length);

    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

    setPhotos((prev) => [...prev, ...newFiles]);
    setPhotoPreviews((prev) => [...prev, ...newPreviews]);
  }

  function removePhoto(index) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
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
      <form className="form">
        <div className="sendphoto">
          <div className="photopreview" aria-label="Pré-visualização das fotos">
            {photoPreviews.length > 0 ? (
              photoPreviews.map((src, index) => (
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
            className={`btn-outlined ${photos.length >= 4 ? "disabled" : ""}`}
          >
            Enviar foto
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhoto}
              style={{ display: "none" }}
              disabled={photos.length >= 4}
            />
          </label>
        </div>

        <label htmlFor="title">Título</label>
        <textarea
          id="title"
          name="title"
          placeholder="Escreva seu título aqui…"
          rows={1}
          value={form.title}
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
          required
          style={{ resize: "none" }}
        />
        <div>
<div className="select-container">
  <select
    value={categories}
    onChange={(e) => setCateogries(e.target.value)}
  >
    <option value="">Selecione...</option>
    {allCategories.map((cat) => (
      <option key={cat.id} value={cat.id}>
        {cat.name}
      </option>
    ))}
  </select>
</div>

        </div>
      </form>
    </>
  );
}
