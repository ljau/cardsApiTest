import React, { useEffect, useState } from "react";

function App() {
  const [query, setQuery] = useState("Gemstone Caverns");
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cardDetail, setCardDetail] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

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

      {cards.length > 0 ? (
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
              onClick={() => {
                setCardDetail(card);
                setModalOpen(true);
              }}
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
      ) : null}

      {/* Modal */}
      {modalOpen && cardDetail && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "8px",
              minWidth: "300px",
              maxWidth: "90%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>{cardDetail.title}</h2>
            {cardDetail.img && (
              <img
                src={cardDetail.img}
                alt={cardDetail.title}
                style={{ width: "150px", marginBottom: "10px" }}
              />
            )}
            <p>Price: {cardDetail.price}</p>
            <p>Stock: {cardDetail.stock}</p>
            <p>Set: {cardDetail.set || "N/A"}</p>
            <p>Language: {cardDetail.language || "N/A"}</p>
            <p>Foil: {cardDetail.foil || "N/A"}</p>

            <button
              style={{ marginTop: "10px", padding: "5px 10px" }}
              onClick={() => setModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
