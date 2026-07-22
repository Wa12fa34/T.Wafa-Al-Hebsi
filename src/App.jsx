import { BrowserRouter, Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";

import Home from "./pages/Home.jsx";
import Reading from "./pages/Reading.jsx";
import ReadingLevel from "./pages/ReadingLevel.jsx";
import Writing from "./pages/Writing.jsx";
import Vocabulary from "./pages/Vocabulary.jsx";
import Grammar from "./pages/Grammar.jsx";
import Login from "./pages/Login.jsx";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reading" element={<Reading />} />
        <Route path="/reading/:level" element={<ReadingLevel />} />
        <Route path="/writing" element={<Writing />} />
        <Route path="/vocabulary" element={<Vocabulary />} />
        <Route path="/grammar" element={<Grammar />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;