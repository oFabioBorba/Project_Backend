import "../styles/login.css";
import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export default function Login() {
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const [Message, setMessage] = useState("");
  const [theme, setTheme] = useState(() => {
   return localStorage.getItem("theme") || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);


  async function loginUser(Email, Password) {
    try {
      const response = await fetch("http://localhost:8080/login/verifylogin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: Email, password: Password }),
      });

      const data = await response.json();

      if (response.ok) {
        try {
          const token = data.message;
          const decoded = jwtDecode(token);

          const profile = await fetch(
            `http://localhost:8080/profile/getprofile/${decoded.userid}`,
            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            }
          );

          localStorage.setItem("token", token);

          if (profile.status === 200) {
            setMessage("");
            setTimeout(() => {
              window.location.href = "/home";
            }, 1500);
          } else if (profile.status === 404) {
            setMessage("");
            setTimeout(() => {
              window.location.href = "/profile";
            }, 1500);
          } else {
            setMessage("Erro desconhecido.");
          }
        } catch (error) {
          console.error("Erro ao decodificar token:", error);
        }
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      setMessage("Falha na conexão.");
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    loginUser(Email, Password);
  };

  return (
    <div className="container">
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="header">
          <h2>Login</h2>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? "🌞 Claro" : "🌙 Escuro"}
          </button>
        </div>


        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          placeholder="Digite seu email"
          value={Email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="password">Senha</label>
        <input
          type="password"
          id="password"
          placeholder="Digite sua senha"
          value={Password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" className="btn-primary">Entrar</button>

        {Message && <p className="error-message">{Message}</p>}

        <p className="register-text">
          Não tem conta? <a href="/sign">Cadastre-se</a>
        </p>
      </form>
    </div>
  );
}
