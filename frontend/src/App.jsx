import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Predict from "./pages/Predict";
import About from "./pages/About";
import History from "./pages/History";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/predict" element={<Predict />} />
          <Route path="/about" element={<About />} />
          <Route path="/history" element={<History />} />
        </Routes>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;