import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Fuel, Receipt, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import PageHeader from "@/components/shared/PageHeader";

export default function Finance() {
  const [fuelLogs, setFuelLogs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fuelOpen, setFuelOpen] = useState(false);
  const [expOpen, setExpOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const [fuelForm, setFuelForm] = useState({ vehicle_id: "", liters: 0, unit_cost: 0, date: "" });
  const [expForm, setExpForm] = useState({ vehicle_id: "", category: "Toll", amount: 0, description: "", date: "" });

  const load = () => {
    Promise.all([
      base44.entities.FuelLog.list(),
      base44.entities.Expense.list(),
      base44.entities.Vehicle.list(),
    ]).then(([f, e, v]) => {
      setFuelLogs(f);
      setExpenses(e);
      setVehicles(v);
      setLoading(false);
    });
  };
  useEffect(() => { load(); }, []);

  const getVehicleName = (id) => {
    const v = vehicles.find(v => v.id === id);
    return v ? `${v.registration_number}` : id;
  };

  const handleAddFuel = async () => {
    try {
      const totalCost = fuelForm.liters * fuelForm.unit_cost;
      await base44.entities.FuelLog.create({ ...fuelForm, total_cost: totalCost });
      toast({ title: "Fuel log added" });
      setFuelOpen(false);
      setFuelForm({ vehicle_id: "", liters: 0, unit_cost: 0, date: "" });
      load();
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleAddExpense = async () => {
    try {
      await base44.entities.Expense.create(expForm);
      toast({ title: "Expense added" });
      setExpOpen(false);
      setExpForm({ vehicle_id: "", category: "Toll", amount: 0, description: "", date: "" });
      load();
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const totalFuelCost = fuelLogs.reduce((sum, f) => sum + (f.total_cost || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  if (loading) {
    return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-gray-200 border-t-amber-500 rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <PageHeader title="Fuel & Expenses" subtitle="Financial operations tracking" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Fuel Cost</p>
          <p className="text-2xl font-bold text-amber-600">₹{totalFuelCost.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Expenses</p>
          <p className="text-2xl font-bold text-blue-600">₹{totalExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <p className="text-sm text-gray-500">Combined Costs</p>
          <p className="text-2xl font-bold text-red-600">₹{(totalFuelCost + totalExpenses).toLocaleString()}</p>
        </div>
      </div>

      <Tabs defaultValue="fuel" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="fuel" className="flex items-center gap-2"><Fuel className="w-4 h-4" /> Fuel Logs</TabsTrigger>
          <TabsTrigger value="expenses" className="flex items-center gap-2"><Receipt className="w-4 h-4" /> Expenses</TabsTrigger>
        </TabsList>

        <TabsContent value="fuel">
          <div className="flex items-center justify-between mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-56" />
            </div>
            <Button onClick={() => setFuelOpen(true)} className="bg-amber-500 hover:bg-amber-600">
              <Plus className="w-4 h-4 mr-2" /> Add Fuel Log
            </Button>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Vehicle</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Liters</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Unit Cost</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Total</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {fuelLogs.map(f => (
                  <tr key={f.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                    <td className="px-5 py-3.5 text-sm font-medium">{getVehicleName(f.vehicle_id)}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{f.liters} L</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">₹{f.unit_cost}</td>
                    <td className="px-5 py-3.5 text-sm font-medium">₹{f.total_cost?.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{f.date}</td>
                  </tr>
                ))}
                {fuelLogs.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-400">No fuel logs</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="expenses">
          <div className="flex items-center justify-between mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-56" />
            </div>
            <Button onClick={() => setExpOpen(true)} className="bg-amber-500 hover:bg-amber-600">
              <Plus className="w-4 h-4 mr-2" /> Add Expense
            </Button>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Vehicle</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Category</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Amount</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Description</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map(e => (
                  <tr key={e.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                    <td className="px-5 py-3.5 text-sm font-medium">{getVehicleName(e.vehicle_id)}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{e.category}</td>
                    <td className="px-5 py-3.5 text-sm font-medium">₹{e.amount?.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{e.description || "—"}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{e.date}</td>
                  </tr>
                ))}
                {expenses.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-400">No expenses</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={fuelOpen} onOpenChange={setFuelOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Fuel Log</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="col-span-2">
              <Label>Vehicle</Label>
              <Select value={fuelForm.vehicle_id} onValueChange={v => setFuelForm({ ...fuelForm, vehicle_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                <SelectContent>
                  {vehicles.map(v => <SelectItem key={v.id} value={v.id}>{v.registration_number} — {v.model}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Liters</Label>
              <Input type="number" value={fuelForm.liters} onChange={e => setFuelForm({ ...fuelForm, liters: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Unit Cost (₹/L)</Label>
              <Input type="number" value={fuelForm.unit_cost} onChange={e => setFuelForm({ ...fuelForm, unit_cost: Number(e.target.value) })} />
            </div>
            <div className="col-span-2">
              <Label>Date</Label>
              <Input type="date" value={fuelForm.date} onChange={e => setFuelForm({ ...fuelForm, date: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setFuelOpen(false)}>Cancel</Button>
            <Button onClick={handleAddFuel} className="bg-amber-500 hover:bg-amber-600">Add</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={expOpen} onOpenChange={setExpOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Expense</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="col-span-2">
              <Label>Vehicle</Label>
              <Select value={expForm.vehicle_id} onValueChange={v => setExpForm({ ...expForm, vehicle_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                <SelectContent>
                  {vehicles.map(v => <SelectItem key={v.id} value={v.id}>{v.registration_number} — {v.model}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Category</Label>
              <Select value={expForm.category} onValueChange={v => setExpForm({ ...expForm, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Toll", "Driver Allowance", "Parking", "Insurance", "Other"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Amount (₹)</Label>
              <Input type="number" value={expForm.amount} onChange={e => setExpForm({ ...expForm, amount: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={expForm.description} onChange={e => setExpForm({ ...expForm, description: e.target.value })} />
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" value={expForm.date} onChange={e => setExpForm({ ...expForm, date: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setExpOpen(false)}>Cancel</Button>
            <Button onClick={handleAddExpense} className="bg-amber-500 hover:bg-amber-600">Add</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}