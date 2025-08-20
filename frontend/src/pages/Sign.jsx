import '../styles/sign.css';

export default function Sign() {
    return (
        <div className="container">
            <form className="sign-form">
                <h2>Cadastro</h2>

                <label htmlFor="username">Usuário</label>
                <input type="text" id="username" placeholder="Digite seu usuário" />

                <label htmlFor="email">E-mail</label>
                <input type="email" id="email" placeholder="Digite seu e-mail" />

                <label htmlFor="password">Senha</label>
                <input type="password" id="password" placeholder="Digite sua senha" />

                <label htmlFor="confirm-password">Confirmar Senha</label>
                <input type="password" id="confirm-password" placeholder="Confirme sua senha" />

                <button type="submit">Cadastrar</button>

                <p className="register-text">
                    Já tem conta? <a href="/">Faça login</a>
                </p>
            </form>
        </div>
    )
}
