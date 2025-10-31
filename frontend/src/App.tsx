import { useState } from "react";
import { Home, HomePage, Login, Playlist } from "./Page/Public";
import { Route, Routes } from "react-router-dom";
import Google from "./Page/Public/Google";

function App() {
  return (
    <>
      <div className="h-screen">
        <Routes>
          <Route path="/" element={<Home />}>
            <Route index element={<HomePage />} />
            <Route path="/playlist/:id" element={<Playlist />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/google/callback" element={<Google />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
