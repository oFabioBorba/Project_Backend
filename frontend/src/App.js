import { BrowserRouter, Routes, Route } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import Home from "./pages/Home";
import Login from "./pages/Login";
import Sign from "./pages/Sign";
import Profile from "./pages/Profile"
import Ad from "./pages/Ad"
import SearcAds from "./pages/SearchAds"; 
import OpendAd from "./pages/OpenAd";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path = "/" element= {<Login />}/>
        <Route path="/home" element={<Home />} />
        <Route path="/sign" element={<Sign />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/ad" element={<Ad />} />
        <Route path="/buscar" element={<SearcAds />} />
        <Route path="/ad/:id_advertisement" element={<OpendAd />} />
      </Routes>
    </BrowserRouter>
  );
}
