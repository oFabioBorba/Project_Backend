import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Sign from "./pages/Sign";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path = "/" element= {<Login />}/>
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/sign" element={<Sign />} />
      </Routes>
    </BrowserRouter>
  );
}
