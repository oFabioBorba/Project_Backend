import React, { useState, useEffect } from "react";
import MarketplaceNavbar from "../components/navbar";
import { jwtDecode } from "jwt-decode";
import "../styles/home.css";

export default function Home() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [photo, setPhoto] = useState(null);
  const [userId, setUserId] = useState();
  const user = { photoUrl: photo };

  useEffect(() => {
    async function checkAuthAndLoadProfile() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          window.location.href = "/";
          return;
        }

        const decoded = jwtDecode(token);
        const now = Date.now() / 1000;

        if (decoded.exp && decoded.exp < now) {
          window.location.href = "/";
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
      } catch (error) {
        console.log("Erro ao autenticar ou carregar perfil", error);
      }
    }
    checkAuthAndLoadProfile();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <>
      <MarketplaceNavbar user={user} theme={theme} setTheme={setTheme} />
        Conteúdo do Market Place
    </>
  );
}
