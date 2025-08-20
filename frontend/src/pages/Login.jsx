import '../styles/login.css';

export default function Login() {
    return (


    <div className="container">
      <form className="login-form">
        <h2>Login</h2>

        <label htmlFor="username">Usuário</label>
        <input type="text" id="username" placeholder="Digite seu usuário" />

        <label htmlFor="password">Senha</label>
        <input type="password" id="password" placeholder="Digite sua senha" />

        <button type="submit">Entrar</button>

        <p className="register-text">
          Não tem conta? <a href="Sign">Cadastre-se</a>
        </p>
      </form>
    </div>
        
    )
}
