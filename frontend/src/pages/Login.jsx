import '../styles/login.css';
import React, { useState } from 'react';

export default function Login() {
    const [Email, setEmail] = useState("");
    const [Password, setPassword] = useState("");
    const [Message, setMessage] = useState(false)

    async function loginUser(Email, Password){
      try{
        const response = await fetch('http://localhost:8080/login/verifylogin', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({email: Email, password: Password})
        });
        const data = await response.json()

        if(response.ok){
          localStorage.setItem("token", data.message)
          setMessage("")
        }
        else{
          setMessage(data.error)
        }

    }catch(error){
        console.error("Erro ao fazer login:", error);
      }
  }
      const handleSubmit = (e) => {
        e.preventDefault();
        loginUser(Email, Password)
    }
    return (
    <div className="container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>

        <label htmlFor="email">Email</label>
        <input type="email" id="email" placeholder="Digite seu email" value={Email} onChange={(e) => setEmail(e.target.value)} />

        <label htmlFor="password">Senha</label>
        <input type="password" id="password" placeholder="Digite sua senha" value={Password} onChange={(e) => setPassword(e.target.value)}/>

        <button type="submit">Entrar</button>
        
        {Message && <p className="error-message">{Message}</p>}

        <p className="register-text">
          Não tem conta? <a href="Sign">Cadastre-se</a>
        </p>
      </form>
    </div>
        
    )
}
