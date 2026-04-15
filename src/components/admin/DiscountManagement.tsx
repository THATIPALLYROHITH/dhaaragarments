import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Tag } from "lucide-react";
import { toast } from "sonner";

interface Discount {
  id: string;
  code: string;
  percentage: number;
  applies_to: string | null;
  expires_at: string | null;
  usage_count: number;
  max_usage: number | null;
  created_at: string;
}

export const DiscountManagement = () => {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "synced">("idle");
  const [formData, setFormData] = useState({
    code: "",
    percentage: "",
    applies_to: "all",
    expires_at: "",
    max_usage: "",
  });

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      const { data, error } = await supabase
        .from("discounts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDiscounts(data || []);
    } catch (error) {
      console.error("Error fetching discounts:", error);
      toast.error("Failed to load discounts");
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
    setSyncStatus("syncing");

    try {
      const discountData = {
        code: formData.code.toUpperCase(),
        percentage: parseFloat(formData.percentage),
        applies_to: formData.applies_to,
        expires_at: formData.expires_at || null,
        max_usage: formData.max_usage ? parseInt(formData.max_usage) : null,
      };

      if (editingDiscount) {
        const { error } = await supabase
          .from("discounts")
          .update(discountData)
          .eq("id", editingDiscount.id);

        if (error) throw error;
        
        await logActivity("UPDATE_DISCOUNT", { discount_id: editingDiscount.id, ...discountData });
        toast.success("Discount updated successfully");
      } else {
        const { error } = await supabase
          .from("discounts")
          .insert([discountData]);

        if (error) throw error;
        
        await logActivity("ADD_DISCOUNT", discountData);
        toast.success("Discount created successfully");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchDiscounts();
      setSyncStatus("synced");
      setTimeout(() => setSyncStatus("idle"), 3000);
    } catch (error) {
      console.error("Error saving discount:", error);
      toast.error("Failed to save discount");
      setSyncStatus("idle");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this discount?")) return;
    setSyncStatus("syncing");

    try {
      const { error } = await supabase
        .from("discounts")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      await logActivity("DELETE_DISCOUNT", { discount_id: id });
      toast.success("Discount deleted successfully");
      fetchDiscounts();
      setSyncStatus("synced");
      setTimeout(() => setSyncStatus("idle"), 3000);
    } catch (error) {
      console.error("Error deleting discount:", error);
      toast.error("Failed to delete discount");
      setSyncStatus("idle");
    }
  };

  const openEditDialog = (discount: Discount) => {
    setEditingDiscount(discount);
    setFormData({
      code: discount.code,
      percentage: discount.percentage.toString(),
      applies_to: discount.applies_to || "all",
      expires_at: discount.expires_at ? new Date(discount.expires_at).toISOString().split('T')[0] : "",
      max_usage: discount.max_usage?.toString() || "",
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingDiscount(null);
    setFormData({
      code: "",
      percentage: "",
      applies_to: "all",
      expires_at: "",
      max_usage: "",
    });
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const isMaxedOut = (discount: Discount) => {
    if (!discount.max_usage) return false;
    return discount.usage_count >= discount.max_usage;
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading discounts...</p>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <CardTitle>Discount & Offer Management</CardTitle>
          {syncStatus === "syncing" && (
            <Badge variant="secondary" className="animate-pulse">Syncing...</Badge>
          )}
          {syncStatus === "synced" && (
            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
              Up to date
            </Badge>
          )}
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Discount
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingDiscount ? "Edit Discount" : "Create New Discount"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Discount Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="SAVE20"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="percentage">Discount Percentage (%) *</Label>
                <Input
                  id="percentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.percentage}
                  onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expires">Expiry Date</Label>
                <Input
                  id="expires"
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_usage">Max Usage (leave empty for unlimited)</Label>
                <Input
                  id="max_usage"
                  type="number"
                  min="1"
                  value={formData.max_usage}
                  onChange={(e) => setFormData({ ...formData, max_usage: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingDiscount ? "Update" : "Create"} Discount
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {discounts.length === 0 ? (
          <div className="text-center py-12">
            <Tag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No discounts yet. Create your first discount!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {discounts.map((discount) => (
                  <TableRow key={discount.id}>
                    <TableCell className="font-mono font-bold">{discount.code}</TableCell>
                    <TableCell>{discount.percentage}% OFF</TableCell>
                    <TableCell>
                      {discount.usage_count} / {discount.max_usage || "∞"}
                    </TableCell>
                    <TableCell>
                      {discount.expires_at
                        ? new Date(discount.expires_at).toLocaleDateString("en-IN")
                        : "No expiry"}
                    </TableCell>
                    <TableCell>
                      {isExpired(discount.expires_at) ? (
                        <Badge variant="destructive">Expired</Badge>
                      ) : isMaxedOut(discount) ? (
                        <Badge variant="secondary">Maxed Out</Badge>
                      ) : (
                        <Badge variant="outline">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(discount)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(discount.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};