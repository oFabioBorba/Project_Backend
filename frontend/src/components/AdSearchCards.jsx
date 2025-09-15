import React from "react";
import "../styles/adcard.css";

export default function AdSearchCard({ ad, onClick }) {
  const photoUrl = ad.photo
    ? `data:image/jpeg;base64,${ad.photo}`
    : "/placeholder.jpg";

  function formatDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR');
  }

  return (
    <div className="ad-search-card" onClick={onClick}>
      <img src={photoUrl} alt={ad.title} className="ad-search-card-photo" />
      <div className="ad-search-card-content">
        <h3>{ad.title}</h3> 
        <p className="ad-search-desc">{ad.description?.slice(0, 200)}...</p>
        <div className="ad-search-info">
          <span className="ad-search-date">{formatDate(ad.created_at)}</span>
          <span className="ad-search-user">{ad.username}</span>
        </div>
        <button>Ver mais</button>
      </div>
    </div>
  );
}
