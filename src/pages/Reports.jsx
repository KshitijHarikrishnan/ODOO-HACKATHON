import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import PageHeader from "@/components/shared/PageHeader";

const COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#ef4444", "#8b5cf6"];

export default function Reports() {
  const [vehicles, setVehicles] = useState([]);
  const [fuelLogs, setFuelLogs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Vehicle.list(),
      base44.entities.FuelLog.list(),
      base44.entities.Expense.list(),
      base44.entities.MaintenanceLog.list(),
      base44.entities.Trip.list(),
    ]).then(([v, f, e, m, t]) => {
      setVehicles(v);
      setFuelLogs(f);
      setExpenses(e);
      setMaintenance(m);
      setTrips(t);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-gray-200 border-t-amber-500 rounded-full animate-spin" /></div>;
  }

  const totalRevenue = vehicles.reduce((s, v) => s + (v.revenue_generated || 0), 0);
  const totalFuelCost = fuelLogs.reduce((s, f) => s + (f.total_cost || 0), 0);
  const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const totalMaintCost = maintenance.reduce((s, m) => s + (m.cost || 0), 0);

  // Per-vehicle ROI
  const vehicleROI = vehicles.map(v => {
    const vFuel = fuelLogs.filter(f => f.vehicle_id === v.id).reduce((s, f) => s + (f.total_cost || 0), 0);
    const vMaint = maintenance.filter(m => m.vehicle_id === v.id).reduce((s, m) => s + (m.cost || 0), 0);
    const vExp = expenses.filter(e => e.vehicle_id === v.id).reduce((s, e) => s + (e.amount || 0), 0);
    const roi = v.acquisition_cost > 0
      ? (((v.revenue_generated || 0) - (vMaint + vFuel + vExp)) / v.acquisition_cost * 100).toFixed(1)
      : 0;
    return {
      name: v.registration_number,
      roi: Number(roi),
      revenue: v.revenue_generated || 0,
      costs: vFuel + vMaint + vExp,
    };
  });

  const expenseByCategory = ["Toll", "Driver Allowance", "Parking", "Insurance", "Other"].map(cat => ({
    name: cat,
    value: expenses.filter(e => e.category === cat).reduce((s, e) => s + (e.amount || 0), 0),
  })).filter(d => d.value > 0);

  const costBreakdown = [
    { name: "Fuel", value: totalFuelCost },
    { name: "Maintenance", value: totalMaintCost },
    { name: "Expenses", value: totalExpenses },
  ].filter(d => d.value > 0);

  return (
    <div>
      <PageHeader title="Reports & Analytics" subtitle="Financial insights and fleet performance" />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold text-emerald-600">₹{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Costs</p>
          <p className="text-2xl font-bold text-red-600">₹{(totalFuelCost + totalMaintCost + totalExpenses).toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <p className="text-sm text-gray-500">Net Profit</p>
          <p className="text-2xl font-bold text-blue-600">₹{(totalRevenue - totalFuelCost - totalMaintCost - totalExpenses).toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Trips</p>
          <p className="text-2xl font-bold">{trips.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Vehicle ROI (%)</h3>
          {vehicleROI.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={vehicleROI}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val) => `${val}%`} />
                <Bar dataKey="roi" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">No vehicle data</div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Cost Breakdown</h3>
          {costBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={costBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={110} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ₹${value.toLocaleString()}`}>
                  {costBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(val) => `₹${val.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">No cost data</div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Expense Distribution by Category</h3>
        {expenseByCategory.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={expenseByCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(val) => `₹${val.toLocaleString()}`} />
              <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-400">No expense data</div>
        )}
      </div>
    </div>
  );
}