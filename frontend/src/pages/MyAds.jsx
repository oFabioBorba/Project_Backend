import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import MarketplaceNavbar from "../components/navbar";
import "../styles/home.css";
import AdCard from "../components/AdCard";
import "../styles/myAds.css";

export default function MyAds() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [photo, setPhoto] = useState(null);
  const user = { photoUrl: photo };
  const [userId, setUserId] = useState(null);
  const [MyAds, setMyAds] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

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
          setUserId(decoded.userid);
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
    async function fetchMyAds() {
      if (!userId) return;
      try {
        const response = await fetch(
          `http://localhost:8080/ad?id_user=${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        setMyAds(data);
      } catch (error) {
        console.log("Erro ao buscar meus anúncios", error);
      }
    }
    fetchMyAds();
  }, [userId]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  function handleDeleteClick(id) {
    setDeleteId(id);
    setShowConfirm(true);
  }

  async function confirmDelete() {
    await fetch(`http://localhost:8080/ad/${deleteId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    setMyAds((ads) => ads.filter((ad) => ad.id_advertisement !== deleteId));
    setShowConfirm(false);
    setDeleteId(null);
  }

  function cancelDelete() {
    setShowConfirm(false);
    setDeleteId(null);
  }

  return (
    <>
      <MarketplaceNavbar user={user} theme={theme} setTheme={setTheme} />
      <div className="myads-adcard-list">
        {MyAds.map((ad) => (
          <div key={ad.id_advertisement} className="myads-adcard-wrapper">
            <AdCard
              key={ad.id_advertisement}
              ad={ad}
              onClick={() => navigate(`/ad/${ad.id_advertisement}`)}
            />
            <button
              className="delete-ad-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(ad.id_advertisement);
              }}
              title="Deletar anúncio"
            >
              <span
                role="img"
                aria-label="lixeira"
                style={{ fontSize: "1.5em", color: "#d64545" }}
              >
                🗑️
              </span>
            </button>
          </div>
        ))}
      </div>
      {showConfirm && (
        <div className="delete-popup-bg">
          <div className="delete-popup">
            <p>Tem certeza que deseja deletar este anúncio?</p>
            <button onClick={confirmDelete} className="confirm-btn">
              Sim, deletar
            </button>
            <button onClick={cancelDelete} className="cancel-btn">
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
