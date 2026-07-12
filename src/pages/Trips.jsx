import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Play, CheckCircle, XCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    source: "", destination: "", cargo_weight: 0, planned_distance: 0,
    vehicle_id: "", driver_id: "", revenue: 0
  });
  const [formError, setFormError] = useState("");
  const { toast } = useToast();

  const load = () => {
    Promise.all([
    base44.entities.Trip.list(),
    base44.entities.Vehicle.list(),
    base44.entities.Driver.list()]
    ).then(([t, v, d]) => {
      setTrips(t);
      setVehicles(v);
      setDrivers(d);
      setLoading(false);
    });
  };
  useEffect(() => {load();}, []);

  const availableVehicles = vehicles.filter((v) => v.status === "Available");
  const availableDrivers = drivers.filter((d) => d.status === "Available" && new Date(d.license_expiry) > new Date());

  const getVehicleName = (id) => {
    const v = vehicles.find((v) => v.id === id);
    return v ? `${v.registration_number} (${v.model})` : id;
  };
  const getDriverName = (id) => {
    const d = drivers.find((d) => d.id === id);
    return d ? d.name : id;
  };

  const handleDispatch = async () => {
    setFormError("");
    const selectedVehicle = vehicles.find((v) => v.id === form.vehicle_id);
    if (selectedVehicle && form.cargo_weight > selectedVehicle.max_load_capacity) {
      setFormError(`Cargo weight exceeds vehicle max load capacity of ${selectedVehicle.max_load_capacity} kg`);
      return;
    }
    try {
      await base44.entities.Trip.create({
        ...form,
        status: "In Progress",
        dispatch_date: new Date().toISOString()
      });
      await base44.entities.Vehicle.update(form.vehicle_id, { status: "On Trip" });
      await base44.entities.Driver.update(form.driver_id, { status: "On Trip" });
      toast({ title: "Trip dispatched successfully" });
      setOpen(false);
      setForm({ source: "", destination: "", cargo_weight: 0, planned_distance: 0, vehicle_id: "", driver_id: "", revenue: 0 });
      load();
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleComplete = async (trip) => {
    try {
      await base44.entities.Trip.update(trip.id, { status: "Completed", completion_date: new Date().toISOString() });
      await base44.entities.Vehicle.update(trip.vehicle_id, { status: "Available" });
      await base44.entities.Driver.update(trip.driver_id, { status: "Available" });
      const vehicle = vehicles.find((v) => v.id === trip.vehicle_id);
      if (vehicle) {
        await base44.entities.Vehicle.update(trip.vehicle_id, {
          current_odometer: (vehicle.current_odometer || 0) + (trip.planned_distance || 0),
          revenue_generated: (vehicle.revenue_generated || 0) + (trip.revenue || 0)
        });
      }
      toast({ title: "Trip completed" });
      load();
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleCancel = async (trip) => {
    try {
      await base44.entities.Trip.update(trip.id, { status: "Cancelled" });
      await base44.entities.Vehicle.update(trip.vehicle_id, { status: "Available" });
      await base44.entities.Driver.update(trip.driver_id, { status: "Available" });
      toast({ title: "Trip cancelled" });
      load();
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const filtered = trips.filter((t) =>
  t.source?.toLowerCase().includes(search.toLowerCase()) ||
  t.destination?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-gray-200 border-t-amber-500 rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <PageHeader title="Trip Dispatch" subtitle={`${trips.length} total trips`}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search trips..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 w-56 text-[hsl(var(--background))]" />
        </div>
        <Button onClick={() => setOpen(true)} className="bg-amber-500 hover:bg-amber-600">
          <Plus className="w-4 h-4 mr-2" /> New Trip
        </Button>
      </PageHeader>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Route</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Vehicle</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Driver</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Cargo</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Distance</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Revenue</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) =>
              <tr key={t.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-medium">{t.source} → {t.destination}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{getVehicleName(t.vehicle_id)}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{getDriverName(t.driver_id)}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{t.cargo_weight} kg</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{t.planned_distance} km</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">₹{t.revenue?.toLocaleString() || 0}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={t.status} /></td>
                  <td className="px-5 py-3.5 text-right">
                    {t.status === "In Progress" &&
                  <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleComplete(t)} className="text-emerald-500 hover:text-emerald-700" title="Complete">
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleCancel(t)} className="text-red-400 hover:text-red-600" title="Cancel">
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                  }
                  </td>
                </tr>
              )}
              {filtered.length === 0 &&
              <tr><td colSpan={8} className="px-5 py-12 text-center text-gray-400">No trips found</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Dispatch New Trip</DialogTitle>
          </DialogHeader>
          {formError &&
          <div className="bg-red-50 text-red-700 text-sm px-4 py-2 rounded-lg">{formError}</div>
          }
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <Label>Source</Label>
              <Input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
            </div>
            <div>
              <Label>Destination</Label>
              <Input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} />
            </div>
            <div>
              <Label>Cargo Weight (kg)</Label>
              <Input type="number" value={form.cargo_weight} onChange={(e) => setForm({ ...form, cargo_weight: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Planned Distance (km)</Label>
              <Input type="number" value={form.planned_distance} onChange={(e) => setForm({ ...form, planned_distance: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Vehicle</Label>
              <Select value={form.vehicle_id} onValueChange={(v) => setForm({ ...form, vehicle_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                <SelectContent>
                  {availableVehicles.map((v) =>
                  <SelectItem key={v.id} value={v.id}>
                      {v.registration_number} — {v.model} ({v.max_load_capacity} kg)
                    </SelectItem>
                  )}
                  {availableVehicles.length === 0 &&
                  <div className="px-3 py-2 text-sm text-gray-400">No available vehicles</div>
                  }
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Driver</Label>
              <Select value={form.driver_id} onValueChange={(v) => setForm({ ...form, driver_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select driver" /></SelectTrigger>
                <SelectContent>
                  {availableDrivers.map((d) =>
                  <SelectItem key={d.id} value={d.id}>
                      {d.name} — Cat. {d.license_category}
                    </SelectItem>
                  )}
                  {availableDrivers.length === 0 &&
                  <div className="px-3 py-2 text-sm text-gray-400">No available drivers</div>
                  }
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Revenue (₹)</Label>
              <Input type="number" value={form.revenue} onChange={(e) => setForm({ ...form, revenue: Number(e.target.value) })} />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleDispatch} className="bg-amber-500 hover:bg-amber-600" disabled={!form.source || !form.destination || !form.vehicle_id || !form.driver_id}>
              <Play className="w-4 h-4 mr-2" /> Dispatch
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>);

}