import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCardCache } from "./CardCacheContext.js";

function Search() {
  const navigate = useNavigate();
  const { getCardsForQuery, setCardsForQuery } = useCardCache();
  const [query, setQuery] = useState("Gemstone Caverns");
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCards = async (searchTerm) => {
    const cached = getCardsForQuery(searchTerm);
    if (cached) {
      setCards(cached);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:4000/api/search?q=${encodeURIComponent(searchTerm)}`
      );
      const json = await res.json();
      setCards(json);
      setCardsForQuery(searchTerm, json); // guardar en cache
    } catch (err) {
      console.error("Error fetching cards:", err);
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards(query);
  }, [query]);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Hareruya Cards</h1>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a card..."
          style={{
            padding: "8px",
            fontSize: "16px",
            width: "250px",
            marginRight: "10px",
          }}
        />
        <button
          onClick={() => fetchCards(query)}
          style={{ padding: "8px 12px", fontSize: "16px", cursor: "pointer" }}
        >
          Search
        </button>
      </div>

      {loading && <p>Loading...</p>}

      {cards.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {cards.map((card, idx) => (
            <li
              key={idx}
              style={{
                marginBottom: "15px",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "5px",
                cursor: "pointer",
              }}
              onClick={() =>
                navigate(`/card/${encodeURIComponent(card.link)}`, {
                  state: { card },
                })
              }
            >
              <strong>{card.title}</strong>
              <br />
              💲 {card.price}
              <br />
              📦 {card.stock}
              <br />
              {card.img && (
                <img
                  src={card.img}
                  alt={card.title}
                  style={{ width: "120px", marginTop: "10px" }}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Search;
