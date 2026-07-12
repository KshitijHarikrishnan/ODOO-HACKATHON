import React from "react";

const statusColors = {
  "Available": "bg-emerald-100 text-emerald-700",
  "On Trip": "bg-blue-100 text-blue-700",
  "In Shop": "bg-amber-100 text-amber-700",
  "Retired": "bg-gray-100 text-gray-600",
  "Off Duty": "bg-gray-100 text-gray-600",
  "Suspended": "bg-red-100 text-red-700",
  "Pending": "bg-yellow-100 text-yellow-700",
  "In Progress": "bg-blue-100 text-blue-700",
  "Completed": "bg-emerald-100 text-emerald-700",
  "Cancelled": "bg-red-100 text-red-700",
  "Open": "bg-amber-100 text-amber-700",
  "Closed": "bg-emerald-100 text-emerald-700",
};

export default function StatusBadge({ status }) {
  const color = statusColors[status] || "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {status}
    </span>
  );
}