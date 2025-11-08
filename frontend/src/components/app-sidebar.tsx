"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import icons from "@/utils/icons"


const auth = localStorage.getItem("persist:auth");
const user = auth ? JSON.parse(JSON.parse(auth).user) : null;
// This is sample data.
const data = {
  navMain: [
    {
      title: "Artists",
      url: "artist",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Create artist",
          url: "artist",
        },
        {
          title: "Update artist",
          url: "#",
        },
        {
          title: "Artist details",
          url: "#",
        },
      ],
    },
    {
      title: "Albums",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Create album",
          url: "album",
        },
        {
          title: "Update album",
          url: "#",
        },
        {
          title: "Details album",
          url: "#",
        },
      ],
    },
    {
      title: "Tracks",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Create track",
          url: "#",
        },
        {
          title: "Update track",
          url: "#",
        },
        {
          title: "Details track",
          url: "#",
        }
      ],
    }
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={[{ name: "Spotify", logo: icons.FaSpotify, plan: "Admin" }]} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
