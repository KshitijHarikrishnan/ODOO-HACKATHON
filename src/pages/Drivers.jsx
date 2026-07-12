import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, Search, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";

const emptyDriver = {
  name: "", license_number: "", license_category: "B", license_expiry: "",
  contact: "", safety_score: 100, status: "Available",
};

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyDriver);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const load = () => base44.entities.Driver.list().then(d => { setDrivers(d); setLoading(false); });
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    try {
      if (editing) {
        await base44.entities.Driver.update(editing.id, form);
        toast({ title: "Driver updated" });
      } else {
        await base44.entities.Driver.create(form);
        toast({ title: "Driver added" });
      }
      setOpen(false);
      setEditing(null);
      setForm(emptyDriver);
      load();
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this driver?")) return;
    await base44.entities.Driver.delete(id);
    toast({ title: "Driver deleted" });
    load();
  };

  const isExpired = (date) => new Date(date) < new Date();

  const filtered = drivers.filter(d =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.license_number?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-gray-200 border-t-amber-500 rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <PageHeader title="Driver Registry" subtitle={`${drivers.length} drivers registered`}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search drivers..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-56" />
        </div>
        <Button onClick={() => { setEditing(null); setForm(emptyDriver); setOpen(true); }} className="bg-amber-500 hover:bg-amber-600">
          <Plus className="w-4 h-4 mr-2" /> Add Driver
        </Button>
      </PageHeader>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Name</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">License</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Category</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Expiry</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Safety Score</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Contact</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-medium">{d.name}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{d.license_number}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{d.license_category}</td>
                  <td className="px-5 py-3.5 text-sm">
                    <span className={`flex items-center gap-1 ${isExpired(d.license_expiry) ? "text-red-600" : "text-gray-600"}`}>
                      {isExpired(d.license_expiry) && <AlertTriangle className="w-3 h-3" />}
                      {d.license_expiry}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${d.safety_score >= 80 ? "bg-emerald-500" : d.safety_score >= 50 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${d.safety_score}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{d.safety_score}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5"><StatusBadge status={d.status} /></td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{d.contact}</td>
                  <td className="px-5 py-3.5 text-right">
                    <button onClick={() => { setEditing(d); setForm({ ...d }); setOpen(true); }} className="text-gray-400 hover:text-blue-600 mr-2"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(d.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-gray-400">No drivers found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Driver" : "Add New Driver"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>License Number</Label>
              <Input value={form.license_number} onChange={e => setForm({ ...form, license_number: e.target.value })} />
            </div>
            <div>
              <Label>License Category</Label>
              <Select value={form.license_category} onValueChange={v => setForm({ ...form, license_category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["A", "B", "C", "D", "E"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>License Expiry</Label>
              <Input type="date" value={form.license_expiry} onChange={e => setForm({ ...form, license_expiry: e.target.value })} />
            </div>
            <div>
              <Label>Contact</Label>
              <Input value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} />
            </div>
            <div>
              <Label>Safety Score</Label>
              <Input type="number" min={0} max={100} value={form.safety_score} onChange={e => setForm({ ...form, safety_score: Number(e.target.value) })} />
            </div>
            <div className="col-span-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Available", "On Trip", "Off Duty", "Suspended"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
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