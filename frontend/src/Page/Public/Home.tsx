"use client";

import React from "react";
import { Header, Playbar, SidebarCustom } from "../../components";
import HomePage from "./HomePage";

const Home: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-[#000000] text-white overflow-hidden">
      <Header />

      <div className="flex flex-1 overflow-hidden p-2 pb-[90px] gap-2 mb-3">
        <SidebarCustom />

        <div className="flex-1 overflow-y-auto rounded-xl bg-[#121212]">
          <HomePage />
        </div>
      </div>

      <Playbar />
    </div>
  );
};

export default Home;
