import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";
import { toast } from "sonner";

interface ShopSettings {
  id: string;
  shop_name: string;
  shop_logo: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  tax_rate: number;
  delivery_charge: number;
}

export const ShopSettings = () => {
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    shop_name: "",
    shop_logo: "",
    contact_email: "",
    contact_phone: "",
    tax_rate: "",
    delivery_charge: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("shop_settings")
        .select("*")
        .limit(1)
        .single();

      if (error) throw error;
      
      if (data) {
        setSettings(data);
        setFormData({
          shop_name: data.shop_name,
          shop_logo: data.shop_logo || "",
          contact_email: data.contact_email || "",
          contact_phone: data.contact_phone || "",
          tax_rate: data.tax_rate.toString(),
          delivery_charge: data.delivery_charge.toString(),
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const logActivity = async (action: string, details: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("admin_logs").insert({
        admin_id: user.id,
        action,
        details,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updateData = {
        shop_name: formData.shop_name,
        shop_logo: formData.shop_logo || null,
        contact_email: formData.contact_email || null,
        contact_phone: formData.contact_phone || null,
        tax_rate: parseFloat(formData.tax_rate),
        delivery_charge: parseFloat(formData.delivery_charge),
      };

      const { error } = await supabase
        .from("shop_settings")
        .update(updateData)
        .eq("id", settings!.id);

      if (error) throw error;
      
      await logActivity("UPDATE_SETTINGS", updateData);
      toast.success("Settings updated successfully");
      fetchSettings();
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading settings...</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Shop Settings & Configuration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shop_name">Shop Name *</Label>
              <Input
                id="shop_name"
                value={formData.shop_name}
                onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shop_logo">Shop Logo URL</Label>
              <Input
                id="shop_logo"
                value={formData.shop_logo}
                onChange={(e) => setFormData({ ...formData, shop_logo: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                placeholder="contact@dhaaragarments.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_phone">Contact Phone</Label>
              <Input
                id="contact_phone"
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                placeholder="+91 XXXXXXXXXX"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tax_rate">Tax Rate (%)</Label>
              <Input
                id="tax_rate"
                type="number"
                step="0.01"
                value={formData.tax_rate}
                onChange={(e) => setFormData({ ...formData, tax_rate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delivery_charge">Delivery Charge (₹)</Label>
              <Input
                id="delivery_charge"
                type="number"
                step="0.01"
                value={formData.delivery_charge}
                onChange={(e) => setFormData({ ...formData, delivery_charge: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};