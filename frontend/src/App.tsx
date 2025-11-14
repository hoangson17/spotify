import {
  Album,
  Artist,
  Home,
  HomePage,
  LikeTracks,
  Playlist,
  Search,
} from "./Page/Public";
import { Route, Routes } from "react-router-dom";
import Google from "./Page/Public/Google";
import { AddAlbum, AddArtist, Admin } from "./Page/System";
import AuthMiddlewares from "./Middleware/AuthMiddlewares";
import { Toaster } from "@/components/ui/sonner";
import Auth from "./Page/Public/Auth";

function App() {
  return (
    <>
      <div className="h-screen">
        <Routes>
          <Route path="/" element={<Home />}>
            <Route index element={<HomePage />} />
            <Route element={<AuthMiddlewares />}>
              <Route path="/artist/:id" element={<Artist />} />
              <Route path="/playlist/:id" element={<Playlist />} />
              <Route path="/album/:id" element={<Album />} />
              <Route path="/search" element={<Search />} />
              <Route path="/like-tracks" element={<LikeTracks />} />
            </Route>
          </Route>
          <Route path="/login" element={<Auth type="login" />} />
          <Route path="/register" element={<Auth type="register" />} />
          <Route path="/auth/google/callback" element={<Google />} />
          <Route path="/admin" element={<Admin />}>
            <Route path="artist" element={<AddArtist />} />
            <Route path="album" element={<AddAlbum />} />
          </Route>
        </Routes>
      </div>
      <Toaster position="top-center" toastOptions={{ duration: 2000 }} />
    </>
  );
}

export default App;
