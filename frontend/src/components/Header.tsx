"use client";

import React, { useState, useEffect, useRef } from "react";
import icons from "../utils/icons";
import { Button } from "./ui/button";
import { InputCustom } from "./InputCustom";
import noneAvatar from "../assets/none.png";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { FileUser, LogOut, Settings } from "lucide-react";
import { FaGrinStars } from "react-icons/fa";
import actionTypes from "@/stores/actions/actionTypes";
import { getDataSearch } from "@/stores/actions/searchActions";
import { jwtDecode } from "jwt-decode";

const {
  FaSpotify,
  GoHomeFill,
  IoFileTrayFullOutline,
  CiSearch,
  FaRegBell,
  GrGroup,
} = icons;

const Header: React.FC = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state: any) => state.auth);
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState<any[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const { searchAll } = useSelector((state: any) => state.search);

  const token = localStorage.getItem("accessToken");

  let role = null;

  try {
    if (token) {
      const decoded: any = jwtDecode(token);
      role = decoded?.role;
    }
  } catch (err) {
    role = null; // token lỗi
  }

  // console.log(searchAll);
  useEffect(() => {
    dispatch(getDataSearch() as any);
  }, []);

  // Xử lý tìm kiếm
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && keyword.trim() !== "") {
      navigate(`/search?q=${keyword}`);
      setFilteredSuggestions([]);
    }
  };

  // Xử lý nhập input và gợi ý
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setKeyword(value);

    if (value.trim() === "") {
      setFilteredSuggestions([]);
    } else {
      const filtered = searchAll.filter((s: any) =>
        s.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    }
  };

  // Click ra ngoài để đóng gợi ý
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setFilteredSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch({
      type: actionTypes.LOGOUT,
    });
  };

  return (
    <header className="bg-[#000000] h-[64px] flex items-center justify-between px-4 relative z-50">
      <div className="flex items-center gap-3">
        <Link to="/">
          <FaSpotify fontSize={38} className="text-white ml-[11px]" />
        </Link>
      </div>

      <div
        className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-3"
        ref={searchRef}
      >
        <Link to="/">
          <Button
            variant="ghost"
            className="rounded-full h-[48px] w-[48px] flex items-center justify-center bg-[#1f1f1f] hover:bg-[#2a2a2a] transition cursor-pointer"
          >
            <GoHomeFill className="text-white" size={22} />
          </Button>
        </Link>

        <div className="relative flex items-center bg-[#1f1f1f] rounded-full h-[48px] w-[400px] px-3 focus-within:ring-2 focus-within:ring-[#1DB954] transition">
          <CiSearch className="text-white" size={22} />
          <InputCustom
            name="search"
            placeholder="Search for songs, artists, or albums..."
            className="flex-1 text-white bg-transparent border-none outline-none px-3 placeholder-gray-400 
              focus:bg-transparent active:bg-transparent hover:bg-transparent
              focus:ring-0 focus:outline-none"
            value={keyword}
            onChange={handleChange}
            onKeyDown={handleSearch}
            autoComplete="off"
            autoCorrect="off"
          />
          <Button
            variant="ghost"
            className="text-white rounded-full h-[36px] w-[36px] hover:bg-[#2a2a2a] transition"
          >
            <IoFileTrayFullOutline size={18} />
          </Button>

          {filteredSuggestions.length > 0 && (
            <div className="absolute top-full left-0 mt-1 w-full bg-[#1f1f1f] rounded-md shadow-lg max-h-60 overflow-y-auto scrollbar-hidden">
              {filteredSuggestions.map((s, index) => (
                <div
                  key={index}
                  className="px-3 py-2 hover:bg-[#2a2a2a] cursor-pointer flex justify-between"
                  onClick={() => {
                    setKeyword(s.name);
                    setFilteredSuggestions([]);
                    navigate(`/search?q=${s.name}`);
                  }}
                >
                  <span>{s.name}</span>
                  <span className="text-gray-400 text-sm">{s.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 pr-3">
        {!auth.user ? (
          <>
            <Button className="rounded-full bg-white text-black font-semibold hover:bg-white hover:scale-105 cursor-pointer">
              Explore Premium
            </Button>
            <Button className="text-white bg-[#2a2a2a00] hover:scale-110 hover:bg-[#2a2a2a00] rounded-full">
              Install App
            </Button>
            <Link
              to="/login"
              className="text-black font-bold p-1 bg-white rounded-full hover:scale-110"
            >
              Log in
            </Link>
          </>
        ) : (
          <>
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <img
                  className="w-10 h-10 rounded-full object-cover cursor-pointer ring-2 ring-blue-500 hover:ring-blue-400 transition"
                  src={ auth.user?.avatar &&
                    auth?.user?.avatar.includes("/uploads/")
                      ? `${import.meta.env.VITE_SERVER_API}${auth.user.avatar}`
                      : auth.user.avatar || noneAvatar
                  }
                  alt="User avatar"
                />
              </DropdownMenuTrigger>

              <DropdownMenuContent className="bg-[#2c2c2c] text-white rounded-lg shadow-lg w-55 p-2 flex flex-col gap-1 mt-3 z-50">
                <DropdownMenuSeparator className="border-gray-600" />
                {/* <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-700 cursor-pointer">
                  <FileUser className="text-lg" /> Account
                </DropdownMenuItem> */}

                <Link to="/profile">
                <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-700 cursor-pointer">
                  <div className="flex items-center gap-2">
                      <Settings className="text-lg" /> Profile
                    </div>
                </DropdownMenuItem>
                </Link>
                {role === "admin" && (
                <Link to="/admin">
                  <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-700 cursor-pointer">
                    <GrGroup className="text-lg" /> Admin Dashboard
                  </DropdownMenuItem>
                </Link>
                )}

                <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-700 cursor-pointer">
                  <FaGrinStars className="text-lg" /> Update Premium
                </DropdownMenuItem>

                <DropdownMenuSeparator className="border-gray-600" />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded hover:bg-red-600 cursor-pointer transition"
                >
                  <LogOut className="text-lg" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
