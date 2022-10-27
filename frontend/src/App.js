import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import "./index.css";
import Loader from "./pages/Loader";

function App() {
  const [init, setInit] = useState(false);

  return (
    <Router>
      <Routes>
        <Route
          exact
          path="/"
          element={<Loader init={init} setInit={setInit} />}
        />
        <Route exact path="/home" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
