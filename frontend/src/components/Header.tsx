"use client";

import React from "react";
import icons from "../utils/icons";
import { Button } from "./ui/button";
import { InputCustom } from "./InputCustom";
import noneAvatar from "../assets/none.png";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

const { FaSpotify, GoHomeFill, IoFileTrayFullOutline, CiSearch, FaRegBell, GrGroup } = icons;

const Header: React.FC = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state: any) => state.auth);
  console.log(auth);

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
  };
  
  return (
    <header className="bg-[#000000] h-[64px] flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <FaSpotify fontSize={38} className="text-white" />
      </div>

      <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-3">
        <Button
          variant="ghost"
          className="rounded-full h-[48px] w-[48px] flex items-center justify-center bg-[#1f1f1f] hover:bg-[#2a2a2a] transition"
        >
          <GoHomeFill className="text-white" size={22} />
        </Button>

        <div className="flex items-center bg-[#1f1f1f] rounded-full h-[48px] w-[400px] px-3 focus-within:ring-2 focus-within:ring-[#1DB954] transition">
          <CiSearch className="text-white" size={22} />
          <InputCustom
            name="search"
            placeholder="Search for songs, artists, or albums..."
            className="flex-1 text-white bg-transparent border-none outline-none px-3 placeholder-gray-400"
          />
          <Button
            variant="ghost"
            className="text-white rounded-full h-[36px] w-[36px] hover:bg-[#2a2a2a] transition"
          >
            <IoFileTrayFullOutline size={18} />
          </Button>
        </div>
      </div>

      {/* <div className="flex items-center gap-3 pr-3">
        <Button className="rounded-full bg-white text-black font-semibold hover:bg-white hover:scale-105 cursor-pointer">
          Explore Premium
        </Button>
        <Button className="text-white bg-[#2a2a2a00] hover:scale-110 hover:bg-[#2a2a2a00] rounded-full">
          Install App
        </Button>
        <Button className="text-white hover:bg-[#2a2a2a] rounded-full">
          <FaRegBell size={22} />
        </Button>
        <Button className="text-white hover:bg-[#2a2a2a] rounded-full">
          <GrGroup size={22} />
        </Button>
        <img
          className="w-[40px] h-[40px] rounded-full object-cover"
          src={noneAvatar}
          alt="User avatar"
        />
        <Button className="text-white bg-[#2a2a2a00] hover:bg-[#2a2a2a00] rounded-full hover:scale-110">
          Sign up
        </Button>
        <Link to="/login" className="text-black font-bold p-1 bg-white hover:text-black hover:bg-white text-black rounded-full hover:scale-110">
          Log in
        </Link>
        <Button onClick={()=>dispatch({type:"LOGOUT"})} className="text-white bg-[#2a2a2a00] hover:bg-[#2a2a2a00] rounded-full hover:scale-110">
          Sign up
        </Button>
      </div> */}

      <div className="flex items-center gap-3 pr-3">
        {!auth.user ? (
          <>
            <Button className="rounded-full bg-white text-black font-semibold hover:bg-white hover:scale-105 cursor-pointer">
              Explore Premium
            </Button>
            <Link to="/login" className="text-black font-bold p-1 bg-white rounded-full hover:scale-110">
              Log in
            </Link>
            <Button className="text-white bg-[#2a2a2a00] hover:scale-110 rounded-full">
              Sign up
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleLogout} className="text-white bg-[#2a2a2a00] hover:scale-110 rounded-full">
              Logout
            </Button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
