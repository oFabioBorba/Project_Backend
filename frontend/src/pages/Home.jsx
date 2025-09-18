import React, { useState, useEffect } from "react";
import MarketplaceNavbar from "../components/navbar";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import AdCard from "../components/AdCard";
import "../styles/home.css";

export default function Home() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [photo, setPhoto] = useState(null);
  const user = { photoUrl: photo };
  const [allCategories, setAllCategories] = useState([]);
  const [adsByCity, setAdsByCity] = useState([]);
  const [adsByRating, setAdsByRating] = useState([]);
  const [city, setCity] = useState();
  const [pageCity, setPageCity] = useState(1);
  const [pageRating, setPageRating] = useState(1);
  const [disablePaginationCity, setDisablePaginationCity] = useState(false);
  const [disablePaginationRating, setDisablePaginationRating] = useState(false);

  async function checkNextPageCity() {
    if (!city) return false;
    const limit = getCardsPerPage();
    const nextPage = pageCity + 1;
    try {
      const response = await fetch(
        `http://localhost:8080/ad?city=${city}&page=${nextPage}&limit=${limit}`
      );
      const data = await response.json();
      return Array.isArray(data) && data.length > 0;
    } catch (error) {
      return false;
    }
  }

  async function checkNextPageRating() {
    const limit = getCardsPerPage();
    const nextPage = pageRating + 1;
    try {
      const response = await fetch(
        `http://localhost:8080/ad?sort=rating&page=${nextPage}&limit=${limit}`
      );
      const data = await response.json();
      return Array.isArray(data) && data.length > 0;
    } catch (error) {
      return false;
    }
  }

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
          setCity(profile.city);
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

  function getCardsPerPage() {
    const cardWidth = 220 + 32;
    const containerPadding = 0;
    const width = window.innerWidth - containerPadding;
    return Math.max(1, Math.floor(width / cardWidth));
  }

  function debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  useEffect(() => {
    async function fetchAdsByCity() {
      if (!city) return;
      const limit = getCardsPerPage();
      try {
        const response = await fetch(
          `http://localhost:8080/ad?city=${city}&page=${pageCity}&limit=${limit}`
        );
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setDisablePaginationCity(false);
          setAdsByCity(data);
        } else {
          setDisablePaginationCity(true);
        }
      } catch (error) {
        console.log("Erro ao buscar anúncios da cidade", error);
      }
    }
    fetchAdsByCity();
    const handleResize = debounce(fetchAdsByCity, 500);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [city, pageCity]);

  useEffect(() => {
    async function fetchBestRated() {
      const limit = getCardsPerPage();
      try {
        const response = await fetch(
          `http://localhost:8080/ad?sort=rating&page=${pageRating}&limit=${limit}`
        );
        const data = await response.json();
        setAdsByRating(data);
      } catch (error) {
        console.log("Erro ao buscar melhores avaliados", error);
      }
    }
    fetchBestRated();
    const handleResize = debounce(fetchBestRated, 500);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [pageRating]);

  return (
    <>
      <MarketplaceNavbar user={user} theme={theme} setTheme={setTheme} />
      <div className="page-content">
        <div className="categories-options">
          {allCategories.map((category) => (
            <div key={category.id_category} className="category-card">
              <button
                alt={category.name}
                onClick={() =>
                  navigate(`/buscar?categoriaId=${category.id_category}`)
                }
              >
                {category.name}
              </button>
            </div>
          ))}
        </div>
        <div className="ads-sections">
          <div className="FilterCity">
            <h2>Na sua cidade</h2>
            <div className="ads-container" style={{ alignItems: "center" }}>
              {adsByCity.length === 0 ? (
                <div className="no-ads-message">
                  Nenhum anúncio encontrado na sua cidade.
                </div>
              ) : (
                <>
                  <button
                    className="nav-arrow-btn"
                    onClick={() => setPageCity((prev) => Math.max(1, prev - 1))}
                    disabled={pageCity === 1}
                  >
                    {" "}
                    {"<"}{" "}
                  </button>
                  {adsByCity.map((ad) => (
                    <AdCard
                      key={ad.id_advertisement}
                      ad={ad}
                      onClick={() => navigate(`/ad/${ad.id_advertisement}`)}
                    />
                  ))}
                  <button
                    className="nav-arrow-btn"
                    onClick={async () => {
                      if (await checkNextPageCity()) setPageCity(pageCity + 1);
                    }}
                    disabled={disablePaginationCity === true}
                  >
                    {">"}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="FilterRating">
            <h2>Melhores Avaliados</h2>
            <div className="ads-container" style={{ alignItems: "center" }}>
              {adsByRating.length === 0 ? (
                <div className="no-ads-message">
                  Nenhum anúncio encontrado nos melhores avaliados.
                </div>
              ) : (
                <>
                  <button
                    className="nav-arrow-btn"
                    onClick={() =>
                      setPageRating((prev) => Math.max(1, prev - 1))
                    }
                    disabled={pageRating === 1}
                  >
                    {" "}
                    {"<"}{" "}
                  </button>
                  {adsByRating.map((ad) => (
                    <AdCard
                      key={ad.id_advertisement}
                      ad={ad}
                      onClick={() => navigate(`/ad/${ad.id_advertisement}`)}
                    />
                  ))}
                  <button
                    className="nav-arrow-btn"
                    onClick={async () => {
                      if (await checkNextPageRating())
                        setPageRating(pageRating + 1);
                    }}
                    disabled={disablePaginationRating === true}
                  >
                    {">"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        <button className="Newad" onClick={() => navigate("/ad")}>
          +
        </button>
      </div>
    </>
  );
}
