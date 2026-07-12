import React from "react";

export default function KPICard({ title, value, icon: Icon, color = "bg-white", accent = "text-amber-500" }) {
  return (
    <div className="border border-blue-100 p-5 shadow-sm hover:shadow-md transition-shadow rounded-xl bg-[#6c9993] opacity-90">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-[#000614] text-2xl">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        {Icon &&
        <div className={`w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center ${accent}`}>
            <Icon className="w-6 h-6" />
          </div>
        }
      </div>
    </div>);

}