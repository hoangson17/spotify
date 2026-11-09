import PermissionGate from "./Middleware/PermissionGate";
import Home from "./Page/Public/Home";
import { Route, Routes } from "react-router-dom";
import AuthMiddlewares from "./Middleware/AuthMiddlewares";
import { Toaster } from "@/components/ui/sonner";
import AdminMiddlewares from "./Middleware/AdminMiddlewares";
import { lazy, Suspense, type ComponentType } from "react";
import { CardGridSkeleton } from "@/components/CatalogSkeleton";

function lazyPage<T extends object>(
  loader: () => Promise<{ default: ComponentType<T> }>,
) {
  const Page = lazy(loader);
  return function LazyPage(props: T) {
    return (
      <Suspense
        fallback={
          <div className="min-h-[50vh] p-6 text-white">
            <CardGridSkeleton count={12} />
          </div>
        }
      >
        <Page {...props} />
      </Suspense>
    );
  };
}

const HomePage = lazyPage(() => import("./Page/Public/HomePage"));
const Browse = lazyPage(() => import("./Page/Public/Browse"));
const CategoryTracks = lazyPage(() => import("./Page/Public/CategoryTracks"));
const Artist = lazyPage(() => import("./Page/Public/Artist"));
const Playlist = lazyPage(() => import("./Page/Public/Playlist"));
const Album = lazyPage(() => import("./Page/Public/Album"));
const Search = lazyPage(() => import("./Page/Public/Search"));
const LikeTracks = lazyPage(() => import("./Page/Public/LikeTracks"));
const Profile = lazyPage(() => import("./Page/Public/Profile"));
const Auth = lazyPage(() => import("./Page/Public/Auth"));
const Google = lazyPage(() => import("./Page/Public/Google"));

const Admin = lazyPage(() => import("./Page/System/Admin"));
const AdminHome = lazyPage(() => import("./Page/System/AdminHome"));
const AdminPermissions = lazyPage(() => import("./Page/System/AdminPermissions"));
const AddAlbum = lazyPage(() => import("./Page/System/AddAlbum"));
const AddArtist = lazyPage(() => import("./Page/System/AddArtist"));
const AddCategory = lazyPage(() => import("./Page/System/AddCategory"));
const AddPlayList = lazyPage(() => import("./Page/System/AddPlayList"));
const AddTrack = lazyPage(() => import("./Page/System/AddTrack"));
const AdminProfile = lazyPage(() => import("./Page/System/AdminProfile"));
const User = lazyPage(() => import("./Page/System/User"));
const LockUser = lazyPage(() => import("./Page/System/LockUser"));

function App() {
  return (
    <>
      <div className="h-screen">
        <Routes>
          <Route path="/" element={<Home />}>
            <Route index element={<HomePage />} />
            <Route path="browse/:type" element={<Browse />} />
            <Route path="category/:id" element={<CategoryTracks />} />
            <Route element={<AuthMiddlewares />}>
              <Route path="/artist/:id" element={<Artist />} />
              <Route path="/playlist/:id" element={<Playlist />} />
              <Route path="/album/:id" element={<Album />} />
              <Route path="/search" element={<Search />} />
              <Route path="/like-tracks" element={<LikeTracks />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>
          <Route path="/login" element={<Auth type="login" />} />
          <Route path="/register" element={<Auth type="register" />} />
          <Route path="/auth/google/callback" element={<Google />} />
          <Route path="/admin" element={<AuthMiddlewares />}>
            <Route element={<AdminMiddlewares />}>
              <Route element={<Admin />}>
                <Route index element={<AdminHome />} />
                <Route
                  path="artist"
                  element={
                    <PermissionGate permission="artists:read">
                      <AddArtist />
                    </PermissionGate>
                  }
                />
                <Route
                  path="album"
                  element={
                    <PermissionGate permission="albums:read">
                      <AddAlbum />
                    </PermissionGate>
                  }
                />
                <Route
                  path="track"
                  element={
                    <PermissionGate permission="tracks:read">
                      <AddTrack />
                    </PermissionGate>
                  }
                />
                <Route
                  path="category"
                  element={
                    <PermissionGate permission="categories:read">
                      <AddCategory />
                    </PermissionGate>
                  }
                />
                <Route
                  path="user"
                  element={
                    <PermissionGate permission="users:read">
                      <User />
                    </PermissionGate>
                  }
                />
                <Route
                  path="playlist"
                  element={
                    <PermissionGate permission="playlists:read">
                      <AddPlayList />
                    </PermissionGate>
                  }
                />
                <Route
                  path="lock-user"
                  element={
                    <PermissionGate permission="users:read">
                      <LockUser />
                    </PermissionGate>
                  }
                />
                <Route path="profile" element={<AdminProfile />} />
                <Route
                  path="permissions"
                  element={
                    <PermissionGate permission="rbac:manage">
                      <AdminPermissions />
                    </PermissionGate>
                  }
                />
              </Route>
            </Route>
          </Route>
        </Routes>
      </div>
      <Toaster position="top-center" toastOptions={{ duration: 2000 }} />
    </>
  );
}

export default App;
