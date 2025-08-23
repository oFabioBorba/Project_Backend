import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Sign from "./pages/Sign";
import Profile from "./pages/Profile"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path = "/" element= {<Login />}/>
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/sign" element={<Sign />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}
