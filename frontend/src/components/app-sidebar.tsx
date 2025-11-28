"use client"

import * as React from "react"
import {
  SquareTerminal,
  Users,
  PlayCircleIcon,
  Music,
  Album,
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
import { useSelector } from "react-redux"


const data = {
  navMain: [
    {
      title: "Artists",
      url: "artist",
      icon: Users,
      isActive: true,
      items: [
        // {
        //   title: "Create artist",
        //   url: "artist",
        // },
        // {
        //   title: "Update artist",
        //   url: "#",
        // },
        // {
        //   title: "Artist details",
        //   url: "#",
        // },
      ],
    },
    {
      title: "Albums",
      url: "album",
      icon: Album,
      items: [
        // {
        //   title: "Create album",
        //   url: "album",
        // },
        // {
        //   title: "Update album",
        //   url: "#",
        // },
        // {
        //   title: "Details album",
        //   url: "#",
        // },
      ],
    },
    {
      title: "Tracks",
      url: "track",
      icon: Music,
      items: [
        // {
        //   title: "Create track",
        //   url: "#",
        // },
        // {
        //   title: "Update track",
        //   url: "#",
        // },
        // {
        //   title: "Details track",
        //   url: "#",
        // }
      ],
    },
    {
      title: "Users",
      url: "user",
      icon: Users,
      items: [
        // {
        //   title: "Create track",
        //   url: "#",
        // },
        // {
        //   title: "Update track",
        //   url: "#",
        // },
        // {
        //   title: "Details track",
        //   url: "#",
        // }
      ],
    },
    {
      title: "Playlists",
      url: "playlist",
      icon: PlayCircleIcon,
      items: [
        // {
        //   title: "Create track",
        //   url: "#",
        // },
        // {
        //   title: "Update track",
        //   url: "#",
        // },
        // {
        //   title: "Details track",
        //   url: "#",
        // }
      ],
    }
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useSelector((state: any) => state.auth.user || {});
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
