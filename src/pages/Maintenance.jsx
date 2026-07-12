import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, CheckCircle, Search, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";

export default function Maintenance() {
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ vehicle_id: "", title: "", description: "", cost: 0 });
  const { toast } = useToast();

  const load = () => {
    Promise.all([
      base44.entities.MaintenanceLog.list(),
      base44.entities.Vehicle.list(),
    ]).then(([m, v]) => {
      setLogs(m);
      setVehicles(v);
      setLoading(false);
    });
  };
  useEffect(() => { load(); }, []);

  const getVehicleName = (id) => {
    const v = vehicles.find(v => v.id === id);
    return v ? `${v.registration_number} (${v.model})` : id;
  };

  const eligibleVehicles = vehicles.filter(v => v.status === "Available");

  const handleOpen = async () => {
    try {
      await base44.entities.MaintenanceLog.create({
        ...form,
        status: "Open",
        opened_date: new Date().toISOString().split("T")[0],
      });
      await base44.entities.Vehicle.update(form.vehicle_id, { status: "In Shop" });
      toast({ title: "Maintenance ticket opened" });
      setOpen(false);
      setForm({ vehicle_id: "", title: "", description: "", cost: 0 });
      load();
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleClose = async (log) => {
    try {
      await base44.entities.MaintenanceLog.update(log.id, {
        status: "Closed",
        closed_date: new Date().toISOString().split("T")[0],
      });
      const vehicle = vehicles.find(v => v.id === log.vehicle_id);
      if (vehicle && vehicle.status !== "Retired") {
        await base44.entities.Vehicle.update(log.vehicle_id, { status: "Available" });
      }
      toast({ title: "Maintenance closed — vehicle released" });
      load();
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const filtered = logs.filter(l =>
    l.title?.toLowerCase().includes(search.toLowerCase()) ||
    getVehicleName(l.vehicle_id).toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-gray-200 border-t-amber-500 rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <PageHeader title="Maintenance" subtitle="Fleet health management">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search logs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-56" />
        </div>
        <Button onClick={() => setOpen(true)} className="bg-amber-500 hover:bg-amber-600">
          <Plus className="w-4 h-4 mr-2" /> Open Ticket
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Open Tickets</p>
              <p className="text-2xl font-bold">{logs.filter(l => l.status === "Open").length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">In Progress</p>
              <p className="text-2xl font-bold">{logs.filter(l => l.status === "In Progress").length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Closed</p>
              <p className="text-2xl font-bold">{logs.filter(l => l.status === "Closed").length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Title</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Vehicle</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Cost</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Opened</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Closed</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-medium">{l.title}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{getVehicleName(l.vehicle_id)}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">₹{l.cost?.toLocaleString() || 0}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{l.opened_date || "—"}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{l.closed_date || "—"}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={l.status} /></td>
                  <td className="px-5 py-3.5 text-right">
                    {l.status !== "Closed" && (
                      <button onClick={() => handleClose(l)} className="text-emerald-500 hover:text-emerald-700" title="Close ticket">
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400">No maintenance logs</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Open Maintenance Ticket</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Vehicle</Label>
              <Select value={form.vehicle_id} onValueChange={v => setForm({ ...form, vehicle_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                <SelectContent>
                  {eligibleVehicles.map(v => (
                    <SelectItem key={v.id} value={v.id}>{v.registration_number} — {v.model}</SelectItem>
                  ))}
                  {eligibleVehicles.length === 0 && (
                    <div className="px-3 py-2 text-sm text-gray-400">No available vehicles</div>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Engine Overhaul" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <Label>Estimated Cost (₹)</Label>
              <Input type="number" value={form.cost} onChange={e => setForm({ ...form, cost: Number(e.target.value) })} />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleOpen} className="bg-amber-500 hover:bg-amber-600" disabled={!form.vehicle_id || !form.title}>
              Open Ticket
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}