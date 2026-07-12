import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Truck, Users, Route, Wrench,
  Fuel, BarChart3, Settings, LogOut, ChevronLeft, ChevronRight } from
"lucide-react";
import { base44 } from "@/api/base44Client";

const navItems = [
{ label: "Dashboard", icon: LayoutDashboard, path: "/" },
{ label: "Vehicles", icon: Truck, path: "/vehicles" },
{ label: "Drivers", icon: Users, path: "/drivers" },
{ label: "Trip Dispatch", icon: Route, path: "/trips" },
{ label: "Maintenance", icon: Wrench, path: "/maintenance" },
{ label: "Fuel & Expenses", icon: Fuel, path: "/finance" },
{ label: "Reports", icon: BarChart3, path: "/reports" },
{ label: "Settings", icon: Settings, path: "/settings" }];


export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();

  return (
    <aside className={`fixed left-0 top-0 h-full bg-[#1a1a2e] text-white flex flex-col z-50 transition-all duration-300 ${collapsed ? "w-16" : "w-60"}`}>
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10">
        <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <Truck className="w-5 h-5 text-white" />
        </div>
        {!collapsed && <span className="font-bold text-lg tracking-tight">TransitOps</span>}
      </div>

      <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
          item.path !== "/" && location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 mx-2 text-sm transition-all rounded-2xl
                ${isActive ?
              "bg-amber-500/20 text-amber-400 font-medium" :
              "text-gray-400 hover:text-white hover:bg-white/5"}`
              }>
              
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>);

        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <button
          onClick={() => base44.auth.logout("/")}
          className="flex items-center gap-3 px-2 py-2 text-gray-400 hover:text-white text-sm w-full rounded-lg hover:bg-white/5 transition-all">
          
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 bg-[#1a1a2e] border border-white/20 rounded-full flex items-center justify-center text-gray-400 hover:text-white">
        
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>);

}