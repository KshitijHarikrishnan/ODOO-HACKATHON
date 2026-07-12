import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";

const emptyVehicle = {
  registration_number: "", model: "", vehicle_type: "Van", max_load_capacity: 0,
  current_odometer: 0, acquisition_cost: 0, status: "Available", region: "", revenue_generated: 0,
};

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyVehicle);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const load = () => base44.entities.Vehicle.list().then(v => { setVehicles(v); setLoading(false); });
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    try {
      if (editing) {
        await base44.entities.Vehicle.update(editing.id, form);
        toast({ title: "Vehicle updated" });
      } else {
        await base44.entities.Vehicle.create(form);
        toast({ title: "Vehicle added" });
      }
      setOpen(false);
      setEditing(null);
      setForm(emptyVehicle);
      load();
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this vehicle?")) return;
    await base44.entities.Vehicle.delete(id);
    toast({ title: "Vehicle deleted" });
    load();
  };

  const openEdit = (v) => {
    setEditing(v);
    setForm({ ...v });
    setOpen(true);
  };

  const filtered = vehicles.filter(v =>
    v.registration_number?.toLowerCase().includes(search.toLowerCase()) ||
    v.model?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-gray-200 border-t-amber-500 rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <PageHeader title="Vehicle Registry" subtitle={`${vehicles.length} vehicles registered`}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search vehicles..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-56" />
        </div>
        <Button onClick={() => { setEditing(null); setForm(emptyVehicle); setOpen(true); }} className="bg-amber-500 hover:bg-amber-600">
          <Plus className="w-4 h-4 mr-2" /> Add Vehicle
        </Button>
      </PageHeader>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Reg. No.</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Model</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Type</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Max Load</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Odometer</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Region</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => (
                <tr key={v.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-medium">{v.registration_number}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{v.model}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{v.vehicle_type}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{v.max_load_capacity} kg</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{v.current_odometer?.toLocaleString()} km</td>
                  <td className="px-5 py-3.5"><StatusBadge status={v.status} /></td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{v.region || "—"}</td>
                  <td className="px-5 py-3.5 text-right">
                    <button onClick={() => openEdit(v)} className="text-gray-400 hover:text-blue-600 mr-2"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(v.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-gray-400">No vehicles found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Vehicle" : "Add New Vehicle"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <Label>Registration Number</Label>
              <Input value={form.registration_number} onChange={e => setForm({ ...form, registration_number: e.target.value })} />
            </div>
            <div>
              <Label>Model</Label>
              <Input value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} />
            </div>
            <div>
              <Label>Vehicle Type</Label>
              <Select value={form.vehicle_type} onValueChange={v => setForm({ ...form, vehicle_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Van", "Truck", "Bus", "SUV", "Sedan"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Max Load Capacity (kg)</Label>
              <Input type="number" value={form.max_load_capacity} onChange={e => setForm({ ...form, max_load_capacity: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Current Odometer (km)</Label>
              <Input type="number" value={form.current_odometer} onChange={e => setForm({ ...form, current_odometer: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Acquisition Cost</Label>
              <Input type="number" value={form.acquisition_cost} onChange={e => setForm({ ...form, acquisition_cost: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Available", "On Trip", "In Shop", "Retired"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Region</Label>
              <Input value={form.region || ""} onChange={e => setForm({ ...form, region: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-amber-500 hover:bg-amber-600">
              {editing ? "Update" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}