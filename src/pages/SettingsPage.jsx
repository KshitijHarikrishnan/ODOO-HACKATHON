import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import PageHeader from "@/components/shared/PageHeader";

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    base44.auth.me().then(u => { setUser(u); setLoading(false); });
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-gray-200 border-t-amber-500 rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <PageHeader title="Settings & RBAC" subtitle="Manage your account and role-based access" />

      <div className="max-w-2xl">
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">User Profile</h3>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={user?.full_name || ""} disabled className="bg-gray-50" />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={user?.email || ""} disabled className="bg-gray-50" />
            </div>
            <div>
              <Label>Role</Label>
              <Input value={user?.role || "admin"} disabled className="bg-gray-50" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Role-Based Access Control</h3>
          <div className="space-y-3">
            {[
              { role: "Fleet Manager", access: "Full access to Vehicles, Maintenance, Global Metrics" },
              { role: "Dispatcher", access: "Full access to Trip Lifecycle — create, dispatch, complete, cancel" },
              { role: "Safety Officer", access: "Access to Driver Management, compliance, license checks" },
              { role: "Financial Analyst", access: "Read-only operations; full access to Fuel, Expenses, ROI Reports" },
            ].map(r => (
              <div key={r.role} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm flex-shrink-0">
                  {r.role.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{r.role}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{r.access}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}