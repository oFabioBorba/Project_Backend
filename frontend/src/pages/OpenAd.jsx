import React, { useState, useEffect } from "react";
import MarketplaceNavbar from "../components/navbar";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import "../styles/openad.css";

export default function Home() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [photo, setPhoto] = useState(null);
  const [ad, setAd] = useState({});
  const [photoAdUser, setPhotoAdUser] = useState(null);
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const user = { photoUrl: photo };
  const { id_advertisement } = useParams();

  const navigate = useNavigate();

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
    async function getAd(){
        try{
            const response = await fetch(`http://localhost:8080/ad?id_advertisement=${id_advertisement}`);
            const data = await response.json();
            setAd(data[0]);
            const AdphotoUrl = `data:image/jpeg;base64,${data[0].profile_photo}`;
            setPhotoAdUser(AdphotoUrl);
        }catch(error){
            console.log("Erro ao carregar o anúncio", error);  
        }
    } getAd();
  },[id_advertisement])

    const photos = [ad.photo, ad.photo2, ad.photo3, ad.photo4].filter(Boolean).map(p => `data:image/jpeg;base64,${p}`);

  function nextPhoto() {
    setCurrentPhoto((prev) => (prev + 1) % photos.length);
  }
  function prevPhoto() {
    setCurrentPhoto((prev) => (prev - 1 + photos.length) % photos.length);
  }

  function renderStars(feedback) {
    const stars = [];
    const rating = Math.round(Number(feedback) || 0);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} style={{ color: i <= rating ? '#FFD700' : '#ccc', fontSize: '1.3em' }}>★</span>
      );
    }
    return stars;
  }

  return( 
    <div>
      <MarketplaceNavbar user={user} theme={theme} setTheme={setTheme}/>
      <div className="openadpage-container">
        <div className="openadpage-carousel">
          {photos.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <button className="openadpage-carousel-btn" onClick={prevPhoto} disabled={photos.length <= 1}>{'<'}</button>
              <img src={photos[currentPhoto]} alt="Foto do anúncio" className="openadpage-photo" />
              <button className="openadpage-carousel-btn" onClick={nextPhoto} disabled={photos.length <= 1}>{'>'}</button>
            </div>
          )}
        </div>
        <div className="openadpage-info">
          <h2>{ad.title}</h2>
          <p className="openadpage-desc">{ad.description}</p>
          <div className="openadpage-meta">
            <div className="openadpage-userblock">
              {photoAdUser && <img src={photoAdUser} alt={ad.username} className="openadpage-userphoto" />}
              <span><b>Usuário:</b> {ad.username}</span>
              <span>{renderStars(ad.feedback)}</span>
            </div>
            <span><b>Categoria:</b> {ad.category}</span>
            <span><b>Cidade:</b> {ad.city} - {ad.UF}</span>
            <span><b>Data:</b> {new Date(ad.created_at).toLocaleDateString('pt-BR')}</span>
          </div>
          <button className="openadpage-chat-btn">Iniciar conversa</button>
        </div>
      </div>
    </div>
  )
}
