import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";

const DEFAULT_BG = "https://media.base44.com/images/public/6a5311bf589ebb224a1b694b/39858f73b_A_dark_high-tech_background_template_optimized_fo-1783832869725.png";
const DASHBOARD_BG = "https://media.base44.com/images/public/6a5311bf589ebb224a1b694b/690edc1d1_A_wide-angle_cinematic_background_template_for_a_c-1783834138960.png";
const VEHICLES_BG = "https://media.base44.com/images/public/6a5311bf589ebb224a1b694b/38636c1d0_WhatsAppImage2026-07-12at100858AM.jpg";
const DRIVERS_BG = "https://media.base44.com/images/public/6a5311bf589ebb224a1b694b/916344bb4_WhatsAppImage2026-07-12at115443AM.jpeg";
const FINANCE_BG = "https://media.base44.com/images/public/6a5311bf589ebb224a1b694b/44ad93aa7_WhatsAppImage2026-07-12at115822AM.jpeg";
const REPORTS_BG = "https://media.base44.com/images/public/6a5311bf589ebb224a1b694b/a3544eec1_WhatsAppImage2026-07-12at120018PM.jpeg";
const TRIPS_BG = "https://media.base44.com/images/public/6a5311bf589ebb224a1b694b/ab5149121_A_wide-angle_cinematic_background_template_for_a_c-1783834138960.png";
const MAINTENANCE_BG = "https://media.base44.com/images/public/6a5311bf589ebb224a1b694b/eb31a230d_A_website_background_template_for_a_vehicle_mainte-1783834119989.png";

const routeBackgrounds = {
  "/": DASHBOARD_BG,
  "/vehicles": VEHICLES_BG,
  "/drivers": DRIVERS_BG,
  "/finance": FINANCE_BG,
  "/reports": REPORTS_BG,
  "/trips": TRIPS_BG,
  "/maintenance": MAINTENANCE_BG,
};

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const bgImage = routeBackgrounds[location.pathname] || DEFAULT_BG;

  return (
    <div
      className="min-h-screen relative bg-fixed bg-cover bg-center sm:bg-cover md:bg-cover bg-no-repeat"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "scroll"
      }}>
      
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className={`transition-all duration-300 ${collapsed ? "ml-16" : "ml-60"} min-h-screen`}>
        <div className="p-6 max-w-[1400px] mx-auto opacity-80">
          <Outlet />
        </div>
      </main>
    </div>);

}