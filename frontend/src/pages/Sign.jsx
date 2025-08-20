import '../styles/sign.css';
import React, { useState } from 'react';

export default function Sign() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState(""); 
    const [isError, setIsError] = useState(false); 

    const verifyAndInsertLogins = async (username, email, password) => {
        try {
            setMessage("");
            setIsError(false);

            const verifyResponse = await fetch('http://localhost:8080/sign/verifylogins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, username })
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.error) {
                setMessage(verifyData.error);
                setIsError(true);
                return;
            }

            const registerResponse = await fetch('http://localhost:8080/sign/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            const registerData = await registerResponse.json();

            if (registerData.error) {
                setMessage(registerData.error);
                setIsError(true);
            } else if (registerData.message) {
                setMessage(registerData.message);
                setIsError(false);
                setTimeout(() => {
                    window.location.href = '/';
                }, 1500);
            } else {
                setMessage("Resposta inesperada do servidor.");
                setIsError(true);
            }

        } catch (error) {
            console.error("Erro ao verificar ou cadastrar usuário:", error);
            setMessage("Erro ao processar cadastro.");
            setIsError(true);
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage("As senhas não coincidem!");
            setIsError(true);
            return;
        }
        verifyAndInsertLogins(username, email, password);
    }

    return (
        <div className="container">
            <form className="sign-form" onSubmit={handleSubmit}>
                <h2>Cadastro</h2>

                <label htmlFor="username">Usuário</label>
                <input
                    type="text"
                    id="username"
                    required
                    placeholder="Digite seu usuário"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <label htmlFor="email">E-mail</label>
                <input
                    type="email"
                    id="email"
                    required
                    placeholder="Digite seu e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <label htmlFor="password">Senha</label>
                <input
                    type="password"
                    id="password"
                    required
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <label htmlFor="confirm-password">Confirmar Senha</label>
                <input
                    type="password"
                    id="confirm-password"
                    required
                    placeholder="Confirme sua senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                {password !== confirmPassword && (
                    <p className="error-message">As senhas não coincidem.</p>
                )}

                <button type="submit" disabled={password !== confirmPassword}>
                    Registrar
                </button>

                {message && (
                    <p className={isError ? "error-message" : "success-message"}>
                        {message}
                    </p>
                )}

                <p className="register-text">
                    Já tem conta? <a href="/">Faça login</a>
                </p>
            </form>
        </div>
    );
}
