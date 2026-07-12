import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Truck, Users, Route, Wrench, TrendingUp, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import KPICard from "@/components/shared/KPICard";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#6b7280"];

export default function Dashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    Promise.all([
    base44.entities.Vehicle.list(),
    base44.entities.Driver.list(),
    base44.entities.Trip.list(),
    base44.entities.MaintenanceLog.list()]
    ).then(([v, d, t, m]) => {
      setVehicles(v);
      setDrivers(d);
      setTrips(t);
      setMaintenance(m);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-amber-500 rounded-full animate-spin" />
      </div>);

  }

  const filteredVehicles = vehicles.filter((v) =>
  (filterType === "all" || v.vehicle_type === filterType) && (
  filterStatus === "all" || v.status === filterStatus)
  );

  const activeVehicles = filteredVehicles.filter((v) => v.status !== "Retired").length;
  const availableVehicles = filteredVehicles.filter((v) => v.status === "Available").length;
  const inShopVehicles = filteredVehicles.filter((v) => v.status === "In Shop").length;
  const onTripVehicles = filteredVehicles.filter((v) => v.status === "On Trip").length;
  const activeTrips = trips.filter((t) => t.status === "In Progress").length;
  const pendingTrips = trips.filter((t) => t.status === "Pending").length;
  const driversOnDuty = drivers.filter((d) => d.status === "On Trip").length;
  const fleetUtilization = activeVehicles > 0 ? (onTripVehicles / activeVehicles * 100).toFixed(1) : 0;

  const vehicleStatusData = [
  { name: "Available", value: availableVehicles },
  { name: "On Trip", value: onTripVehicles },
  { name: "In Shop", value: inShopVehicles },
  { name: "Retired", value: filteredVehicles.filter((v) => v.status === "Retired").length }].
  filter((d) => d.value > 0);

  const tripStatusData = [
  { name: "Completed", value: trips.filter((t) => t.status === "Completed").length },
  { name: "In Progress", value: activeTrips },
  { name: "Pending", value: pendingTrips },
  { name: "Cancelled", value: trips.filter((t) => t.status === "Cancelled").length }].
  filter((d) => d.value > 0);

  const recentTrips = [...trips].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 5);

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Fleet operations overview">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-36 text-[hsl(var(--foreground))] bg-[hsl(var(--background))]">
            <SelectValue placeholder="Vehicle Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Van">Van</SelectItem>
            <SelectItem value="Truck">Truck</SelectItem>
            <SelectItem value="Bus">Bus</SelectItem>
            <SelectItem value="SUV">SUV</SelectItem>
            <SelectItem value="Sedan">Sedan</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36 bg-[hsl(var(--background))]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Available">Available</SelectItem>
            <SelectItem value="On Trip">On Trip</SelectItem>
            <SelectItem value="In Shop">In Shop</SelectItem>
            <SelectItem value="Retired">Retired</SelectItem>
          </SelectContent>
        </Select>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard title="Active Vehicles" value={activeVehicles} icon={Truck} accent="text-emerald-500" />
        <KPICard title="Active Trips" value={`${activeTrips} / ${pendingTrips} pending`} icon={Route} accent="text-blue-500" />
        <KPICard title="Drivers On Duty" value={driversOnDuty} icon={Users} accent="text-purple-500" />
        <KPICard title="Fleet Utilization" value={`${fleetUtilization}%`} icon={TrendingUp} accent="text-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl border border-gray-100 p-6 shadow-sm bg-[#6c9993] opacity-85">
          <h3 className="mb-4 italic text-[hsl(var(--card-foreground))] [font-family:'Albert_Sans',_sans-serif] font-bold text-3xl">Vehicle Status Distribution</h3>
          {vehicleStatusData.length > 0 ?
          <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={vehicleStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {vehicleStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer> :

          <div className="h-[250px] flex items-center justify-center text-gray-400">No vehicle data</div>
          }
        </div>

        <div className="rounded-xl border border-gray-100 p-6 shadow-sm bg-[#6c9993] opacity-85">
          <h3 className="mb-4 italic text-[#000000] [font-family:'Albert_Sans',_sans-serif] font-bold text-3xl">Trip Overview</h3>
          {tripStatusData.length > 0 ?
          <ResponsiveContainer width="100%" height={250}>
              <BarChart data={tripStatusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer> :

          <div className="h-[250px] flex items-center justify-center text-gray-400">No trip data</div>
          }
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-gray-100 p-6 shadow-sm bg-[#6c9993] opacity-85">
          <h3 className="mb-4 text-[hsl(var(--foreground))] text-3xl [font-family:'Albert_Sans',_sans-serif] font-bold">Recent Trips</h3>
          {recentTrips.length > 0 ?
          <div className="space-y-3">
              {recentTrips.map((trip) =>
            <div key={trip.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="font-medium text-[hsl(var(--foreground))] text-2xl">{trip.source} → {trip.destination}</p>
                    <p className="text-[hsl(var(--popover-foreground))] text-sm">{trip.cargo_weight} kg</p>
                  </div>
                  <StatusBadge status={trip.status} />
                </div>
            )}
            </div> :

          <p className="text-gray-400 text-sm">No trips yet</p>
          }
        </div>

        <div className="rounded-xl border border-gray-100 p-6 shadow-sm bg-[#6c9993] opacity-80">
          <h3 className="mb-4 text-[hsl(var(--foreground))] [font-family:'Alegreya',_serif] font-bold text-3xl">Maintenance Alerts</h3>
          {maintenance.filter((m) => m.status !== "Closed").length > 0 ?
          <div className="space-y-3">
              {maintenance.filter((m) => m.status !== "Closed").slice(0, 5).map((m) =>
            <div key={m.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{m.title}</p>
                    <p className="text-xs text-[hsl(var(--foreground))]">Vehicle: {m.vehicle_id}</p>
                  </div>
                  <StatusBadge status={m.status} />
                </div>
            )}
            </div> :

          <p className="text-gray-400 text-sm">No active maintenance</p>
          }
        </div>
      </div>
    </div>);

}