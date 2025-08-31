import React, { useState, useEffect } from "react";
import MarketplaceNavbar from "../components/navbar";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom"; 
import "../styles/home.css";

export default function Home() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [photo, setPhoto] = useState(null);
  const user = { photoUrl: photo };

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
        } if(response.status === 404){
          navigate('/profile')
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

  return (
    <>
      <MarketplaceNavbar user={user} theme={theme} setTheme={setTheme} />
      <button className="Newad" onClick={() => {navigate ('/ad')}}>+</button>
    </>
  );
}
