import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useCardCache } from "./CardCacheContext.js";

function CardDetail() {
  const navigate = useNavigate();
  const { encodedLink } = useParams();
  const { getCardDetailCache, setCardDetailCache } = useCardCache();
  const location = useLocation();

  const [card, setCard] = useState(location.state?.card || null);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCardDetail = async (link) => {
    const cached = getCardDetailCache(link);
    if (cached) {
      setDetails(cached);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:4000/api/cardDetail?link=${encodeURIComponent(link)}`
      );
      const json = await res.json();
      setDetails(json);
      setCardDetailCache(link, json);
    } catch (err) {
      console.error("Error fetching card detail:", err);
      setDetails(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (card && card.link) fetchCardDetail(card.link);
  }, [card]);

  if (!card) return <p>No card selected.</p>;

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <button onClick={() => navigate(-1)}>← Back</button>
      <h1>{card.title}</h1>
      {card.img && (
        <img src={card.img} alt={card.title} style={{ width: "200px" }} />
      )}
      <p>Set: {card.set || "N/A"}</p>
      <p>Language: {card.language || "N/A"}</p>
      <p>Foil: {card.foil || "N/A"}</p>

      {loading && <p>Loading details...</p>}

      {details?.conditions?.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Condition</th>
              <th>Price</th>
              <th>Stock</th>
            </tr>
          </thead>
          <tbody>
            {details.conditions.map((c, idx) => (
              <tr key={idx}>
                <td>{c.condition}</td>
                <td>{c.price}</td>
                <td>{c.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </div>
  );
}

export default CardDetail;
