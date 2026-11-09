import {
  Album,
  Home,
  Music,
  PlayCircleIcon,
  ShieldCheck,
  Tags,
  User,
  Users,
} from "lucide-react";
import type { ComponentProps } from "react";
import { useSelector } from "react-redux";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import icons from "@/utils/icons";
import { hasPermission } from "@/utils/roles";

const navigation = [
  { title: "Trang quản trị", url: "/admin", icon: Home },
  {
    title: "Phân quyền admin",
    url: "/admin/permissions",
    icon: ShieldCheck,
    permission: "rbac:manage",
  },
  {
    title: "Artists",
    url: "/admin/artist",
    icon: Users,
    permission: "artists:read",
  },
  {
    title: "Albums",
    url: "/admin/album",
    icon: Album,
    permission: "albums:read",
  },
  {
    title: "Tracks",
    url: "/admin/track",
    icon: Music,
    permission: "tracks:read",
  },
  {
    title: "Categories",
    url: "/admin/category",
    icon: Tags,
    permission: "categories:read",
  },
  { title: "Users", url: "/admin/user", icon: Users, permission: "users:read" },
  {
    title: "Playlists",
    url: "/admin/playlist",
    icon: PlayCircleIcon,
    permission: "playlists:read",
  },
  { title: "My Profile", url: "/admin/profile", icon: User },
];

export function AppSidebar(props: ComponentProps<typeof Sidebar>) {
  const user = useSelector((state: any) => state.auth.user || {});
  const items = navigation.filter(
    (item) => !item.permission || hasPermission(user, item.permission),
  );
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher
          teams={[
            {
              name: "Spotify",
              logo: icons.FaSpotify,
              plan: user.role === "super_admin" ? "Super Admin" : "Admin",
            },
          ]}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={items} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
