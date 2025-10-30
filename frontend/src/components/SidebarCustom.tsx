import { Plus } from "lucide-react";
import React, { useState } from "react";
import { FaPlus, FaMusic } from "react-icons/fa";
import { GoHomeFill } from "react-icons/go";
import { IoMenu } from "react-icons/io5";

const SidebarCustom = () => {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { icon: <GoHomeFill size={20} />, label: "Home" },
    { icon: <FaMusic size={18} />, label: "Your Library" },
    { icon: <FaPlus size={16} />, label: "Create Playlist" },
  ];

  return (
    <div className="bg-[#121212] h-full text-white rounded-xl">
      <aside
        className={`bg-[#121212] border-r border-[#1f1f1f] flex flex-col transition-all duration-300 rounded-xl ${
          collapsed ? "w-[72px]" : "w-[280px]"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-[64px] px-4 gap-3 border-b border-[#1f1f1f]">
          <div className="flex items-center">
            <button
            className="p-2 rounded hover:bg-[#1f1f1f] transition flex-shrink-0"
            onClick={() => setCollapsed(!collapsed)}
          >
            <IoMenu size={24} />
          </button>
          <span
            className={`text-sm font-semibold transition-all duration-300 ease-in-out whitespace-nowrap ${
              collapsed ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            Your Library
          </span>
          </div>
          <button
            className="p-1 rounded-full hover:bg-[#3f3f3f] bg-[#1f1f1f] transition flex-shrink-0 cursor-pointer"
          >
            <Plus size={24} /> 
          </button>
        </div>
        
        {/* Menu */}
        <nav className="flex-1 mt-2">
          <ul>
            {menuItems.map((item, index) => (
              <li key={index}>
                <button
                  className="flex items-center gap-3 w-full px-6 py-3 hover:bg-[#1f1f1f] rounded transition relative"
                  title={collapsed ? item.label : ""}
                >
                  <span className="flex-shrink-0 w-6 flex justify-center">
                    {item.icon}
                  </span>

                  {/* Text */}
                  <span
                    className={`text-sm font-medium transition-all duration-300 ease-in-out whitespace-nowrap ${
                      collapsed ? "opacity-0 pointer-events-none" : "opacity-100"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </div>
  );
};

export default SidebarCustom;
