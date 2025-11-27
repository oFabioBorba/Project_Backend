import { BrowserRouter, Routes, Route } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

import Home from "./pages/Home";
import Login from "./pages/Login";
import Sign from "./pages/Sign";
import Profile from "./pages/Profile";
import Ad from "./pages/Ad";
import SearchAds from "./pages/SearchAds";
import OpenAd from "./pages/OpenAd";
import MyAds from "./pages/MyAds";
import Chat from "./pages/chat";

import { NotificationProvider } from "./context/NotificationContext";

export default function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/sign" element={<Sign />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/ad" element={<Ad />} />
          <Route path="/buscar" element={<SearchAds />} />
          <Route path="/ad/:id_advertisement" element={<OpenAd />} />
          <Route path="/myads" element={<MyAds />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </NotificationProvider>
    </BrowserRouter>
  );
}
