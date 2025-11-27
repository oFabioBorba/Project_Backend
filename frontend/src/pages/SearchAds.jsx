import React, { useState, useEffect } from "react";
import MarketplaceNavbar from "../components/navbar";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import "../styles/home.css";
import { useSearchParams } from "react-router-dom";
import AdSearchCards from "../components/AdSearchCards";

export default function SearcAds() {
    const [unreadCount, setUnreadCount] = useState(0);
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
    const [photo, setPhoto] = useState(null);
    const user = { photoUrl: photo };
    const [allCategories, setAllCategories] = useState([]);
    const [searchParams] = useSearchParams();
    const categoryId = searchParams.get("categoriaId");
    const title = searchParams.get("titulo");
    const city = searchParams.get("cidade");
    const UF = searchParams.get("estado");
    const [cards, setCards] = useState([]);

  const navigate = useNavigate();

  async function fetchUnreadCount(uid) {
  if (!uid) return;

  try {
    const res = await fetch(`http://localhost:8080/messages/unread/${uid}`);
    const data = await res.json();

    setUnreadCount(Number(data[0]?.unread_count || 0));
  } catch (err) {
    console.error("Erro ao buscar mensagens não lidas:", err);
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
          fetchUnreadCount(decoded.userid);
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

  useEffect(() => {
    async function fetchAds() {
      try {
        let url = "http://localhost:8080/ad?";
        if (categoryId) url += `idcategory=${categoryId}&`;
        if (title) url += `name=${title}&`;
        if (city) url += `city=${city}&`;
        if (UF) url += `uf=${UF}&`;

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setCards(data);
          console.log(data);
        } else {
          console.log("Erro ao buscar anúncios");
        }
      } catch (error) {
        console.log("Erro ao buscar anúncios", error);
      }
  }
fetchAds();}, [])

  return (
    <>
      <MarketplaceNavbar user={user} theme={theme} setTheme={setTheme} unreadCount={unreadCount} />
      <main style={{ paddingTop: "200px" }}>
      <div className="page-content">
        <div className="ad-search-list">
          {cards.map((ad) => (
            <AdSearchCards
              key={ad.id_advertisement}
              ad={ad}
              onClick={() => navigate(`/ad/${ad.id_advertisement}`)}
            />
          ))}
        </div>
      </div>
      </main>
    </>
  );
}
