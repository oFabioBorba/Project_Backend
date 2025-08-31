import { useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom"; 
import "../styles/profile.css";

export default function Profile() {
  const [userId, setUserId] = useState("")
  const [form, setForm] = useState({
    cep: "",
    neighbourhood: "",
    city: "",
    uf: "",
    about: "",
    photo: null,
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [status, setStatus] = useState({ loading: false, error: "" });
  const [message, setMessage] = useState ("")
  const [isError, setIsError] = useState (false);
  const [hasProfile, setHasProfile] = useState (false)
  const [theme, setTheme] = useState(() => {
   return localStorage.getItem("theme") || "dark";
  });
  const [statusProfile, setStatusProfile] = useState ("")

  const navigate = useNavigate();
  
 useEffect(() => {
  async function checkAuthAndLoadProfile() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/")
        return;
      }

      const decoded = jwtDecode(token);
      const now = Date.now() / 1000;

      if (decoded.exp && decoded.exp < now) {
        navigate("/")
        return;
      }

      setUserId(decoded.userid);

      const response = await fetch(`http://localhost:8080/profile/getprofile/${decoded.userid}`, {
        method: 'GET',
        headers: { 'content-type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        const profile = data.response; 
        setStatusProfile(1);
        setForm({
          cep: profile.cep || "",
          neighbourhood: profile.neighbourhood || "",
          city: profile.city || "",
          uf: profile.uf || "",
          about: profile.about || "",
          photo: profile.profile_photo || null,
        });

        if (profile.profile_photo) {
          const photoUrl = `data:image/jpeg;base64,${profile.profile_photo}`;
          setPhotoPreview(photoUrl);
        }
        setHasProfile(true)
      }
    } catch (error) {
      console.log("Erro ao autenticar ou carregar perfil", error);
    }
  }

  checkAuthAndLoadProfile();
}, [navigate]);


  useEffect(() => {
  if (form.cep.length === 8) {
    setStatus({ loading: true, error: "" });

    fetch(`https://viacep.com.br/ws/${form.cep}/json/`)
      .then(res => res.json())
      .then(data => {
        if (data.erro) {
          setStatus({ loading: false, error: "CEP não encontrado" });
        } else {
          setForm(f => ({
            ...f,
            neighbourhood: data.bairro,
            city: data.localidade,
            uf: data.uf,
          }));
          setStatus({ loading: false, error: "" });
        }
      })
      .catch(() => setStatus({ loading: false, error: "Erro ao consultar CEP" }));
  }
}, [form.cep]);


  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const maskedCep = useMemo(() => {
    const digits = form.cep.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }, [form.cep]);

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "cep") {
      setForm((f) => ({ ...f, cep: value.replace(/\D/g, "") }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  }

  function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((f) => ({ ...f, photo: file }));
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
  }

async function handleSubmit(e) {
  e.preventDefault();

  const formData = new FormData();
  formData.append("id_user", userId);
  formData.append("CEP", form.cep);
  formData.append("neighbourhood", form.neighbourhood);
  formData.append("city", form.city);
  formData.append("UF", form.uf);
  formData.append("about", form.about);

  if (form.photo instanceof File) {
  formData.append("profile_photo", form.photo);
}


  if (statusProfile === 1){
      try {
      const response = await fetch('http://localhost:8080/profile/updateprofile', {
        method: 'PUT',
        body: formData
      });

      if (response.ok) {
        setMessage("Perfil salvo com sucesso! Redirecionando...");
        setTimeout(() => navigate('/home'), 1500); 
      } else {
        const data = await response.json();
        setMessage("Erro: " + data.error);
        setIsError(true);
      }
    } catch (error) {
      console.error(error);
      setMessage("Erro ao atualizar perfil");
      setIsError(true);
    }
  }else{
      try {
      const response = await fetch('http://localhost:8080/profile/saveprofile', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        setMessage("Perfil salvo com sucesso! Redirecionando...");
        setIsError(false);
        setTimeout(() => navigate('/home'), 1500); 

      } else {
        const data = await response.json();
        setMessage("Erro: " + data.error);
        setIsError(true)
      }
    } catch (error) {
      console.error(error);
      setMessage("Erro ao enviar perfil");
      setIsError(true);
    }
  }
}


  return (
    <div className="profile-wrap">
      <form className="card" onSubmit={handleSubmit}>
        <div className="header">
          <h1>Perfil</h1>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? "🌞 Claro" : "🌙 Escuro"}
          </button>
        </div>

        <div className="avatar-block">
          <div className="avatar" aria-label="Pré-visualização da foto">
            {photoPreview ? (
              <img src={photoPreview} alt="Pré-visualização do perfil" />
            ) : (
              <span>Foto</span>
            )}
          </div>
          <label className="btn-outlined">
            Enviar foto
            <input
              type="file"
              accept="image/*"
              onChange={handlePhoto}
              style={{ display: "none" }}
            />
          </label>
        </div>

        <div className="grid">
          <div className="field">
            <label htmlFor="cep">CEP</label>
            <input
              id="cep"
              name="cep"
              inputMode="numeric"
              placeholder="00000-000"
              value={maskedCep}
              onChange={handleChange}
              aria-describedby="cepHelp"
              maxLength={9}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="neighbourhood">Bairro</label>
            <input
              id="neighbourhood"
              name="neighbourhood"
              placeholder="Seu bairro"
              value={form.neighbourhood}
              onChange={handleChange}
              disabled
            />
          </div>

          <div className="field">
            <label htmlFor="city">Cidade</label>
            <input
              id="city"
              name="city"
              placeholder="Sua cidade"
              value={form.city}
              onChange={handleChange}
              disabled
            />
          </div>

          <div className="field">
            <label htmlFor="uf">UF</label>
            <input
              id="uf"
              name="uf"
              placeholder="UF"
              value={form.uf}AR Baby
              onChange={handleChange}
              disabled
            />
          </div>

          <div className="field field-full">
            <label htmlFor="about">Fale sobre você</label>
            <textarea
              id="about"
              name="about"
              placeholder="Fale um pouco sobre você…"
              rows={5}
              value={form.about}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {status.loading && <div className="info">Consultando CEP…</div>}
        {status.error && <div className="error">{status.error}</div>}
        {message && (
          <p className={isError ? "error-message" : "success-message"}>
            {message}
          </p>
        )}
        <div className="actions">
          <button
            type="submit"
            className="btn-primary"
            disabled={!!status.error || form.cep.length !== 8 || form.about === "" || form.photo === null}
          >
            Salvar
          </button>

          {hasProfile ? (<button type="button" className="btn-ghost" onClick={() => {navigate('/home')}}>
            Retornar
          </button>): ( 
          <button type="button" className="btn-ghost" onClick={() => {localStorage.removeItem("token") ; navigate('/')}}>
            Sair
          </button>
        )}
        </div>
      </form>
    </div>
  );
}
