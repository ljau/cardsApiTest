import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CardCacheProvider } from "./CardCacheContext.js";
import Search from "./Search.js";
import CardDetail from "./CardDetail.js";

function App() {
  return (
    <CardCacheProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Search />} />
          <Route path="/card/:encodedLink" element={<CardDetail />} />
        </Routes>
      </Router>
    </CardCacheProvider>
  );
}

export default App;
