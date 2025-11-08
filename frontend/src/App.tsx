import { useState } from "react";
import { Album, Artist, Home, HomePage, Login, Playlist, Search } from "./Page/Public";
import { Route, Routes } from "react-router-dom";
import Google from "./Page/Public/Google";
import { useSelector } from "react-redux";
import { AddAlbum, AddArtist, Admin } from "./Page/System";

function App() {
  return (
    <>
      <div className="h-screen">
        <Routes>
          <Route path="/" element={<Home />}>
            <Route index element={<HomePage />} />
            <Route path="/artist/:id" element={<Artist />} />
            <Route path="/playlist/:id" element={<Playlist/>} />
            <Route path="/album/:id" element={<Album />} />
            <Route path="/search" element={<Search />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/google/callback" element={<Google />} />
          <Route path="/admin" element={<Admin />}>
            <Route path="artist" element={<AddArtist />} />
            <Route path="album" element={<AddAlbum />} />
          </Route>

        </Routes>
      </div>
    </>
  );
}

export default App;
