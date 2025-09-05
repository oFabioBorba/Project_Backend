import React, { useState, useEffect } from "react";
import MarketplaceNavbar from "../components/navbar";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import AdCard from "../components/AdCard";
import "../styles/home.css";
import { useSearchParams } from "react-router-dom";


export default function SearcAds() {
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
    const [photo, setPhoto] = useState(null);
    const user = { photoUrl: photo };
    const [allCategories, setAllCategories] = useState([]);
    const [searchParams] = useSearchParams();
    const categoryId = searchParams.get("categoriaId");
    const title = searchParams.get("titulo");
    const city = searchParams.get("cidade");
    const UF = searchParams.get("estado");

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
    </>
  );
}
