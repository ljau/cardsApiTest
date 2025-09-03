import React, { useEffect, useState } from "react";

function App() {
  const [query, setQuery] = useState("Gemstone Caverns"); // búsqueda inicial
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCards = async (searchTerm) => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:4000/api/search?q=${encodeURIComponent(searchTerm)}`
      );
      const json = await res.json();
      setCards(json);
    } catch (err) {
      console.error("Error fetching cards:", err);
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  // Buscar la carta inicial
  useEffect(() => {
    fetchCards(query);
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Card Kingdom Prices</h1>

      {/* Barra de búsqueda */}
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
          style={{
            padding: "8px 12px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Search
        </button>
      </div>

      {/* Resultados */}
      {loading ? (
        <p>Loading...</p>
      ) : cards.length > 0 ? (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {cards.map((card, idx) => (
            <li
              key={idx}
              style={{
                marginBottom: "15px",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "5px",
              }}
            >
              <strong>{card.title}</strong> <br />
              💲 {card.price} <br />
              📦 {card.available}
            </li>
          ))}
        </ul>
      ) : (
        <p>No results found.</p>
      )}
    </div>
  );
}

export default App;
