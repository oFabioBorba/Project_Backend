import React from "react";
import "../styles/adcard.css";

export default function AdCard({ ad, onClick }) {
  const photoUrl = ad.photo
    ? `data:image/jpeg;base64,${ad.photo}`
    : "/placeholder.jpg";

  return (
    <div className="ad-card" onClick={onClick}>
      <img src={photoUrl} alt={ad.title} className="ad-card-photo" />
      <div className="ad-card-content">
        <h3>{ad.title}</h3>
        <p>{ad.description?.slice(0, 53)}...</p>
        <button>Ver mais</button>
      </div>
    </div>
  );
}
