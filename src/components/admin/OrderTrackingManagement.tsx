import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Package, Plus } from "lucide-react";

interface ShipmentUpdate {
  date: string;
  status: string;
  location: string;
  description: string;
}

interface Order {
  id: string;
  user_id: string;
  order_date: string;
  total: number;
  status: string;
  tracking_number: string | null;
  shipment_updates: ShipmentUpdate[];
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
}

export const OrderTrackingManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [userProfiles, setUserProfiles] = useState<Map<string, UserProfile>>(new Map());
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [updateStatus, setUpdateStatus] = useState("");
  const [updateLocation, setUpdateLocation] = useState("");
  const [updateDescription, setUpdateDescription] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select('*')
        .in('status', ['processing', 'shipped'])
        .order('order_date', { ascending: false });

      if (error) throw error;

      setOrders((ordersData as unknown as Order[]) || []);

      // Fetch user profiles
      if (ordersData) {
        const userIds = [...new Set(ordersData.map(order => order.user_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .in('id', userIds);

        if (profilesData) {
          const profileMap = new Map(profilesData.map(profile => [profile.id, profile]));
          setUserProfiles(profileMap);
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (order: Order) => {
    setSelectedOrder(order);
    setTrackingNumber(order.tracking_number || "");
    setDialogOpen(true);
  };

  const handleUpdateTracking = async () => {
    if (!selectedOrder) return;

    try {
      const { error } = await supabase
        .from('orders')
        .update({ tracking_number: trackingNumber })
        .eq('id', selectedOrder.id);

      if (error) throw error;

      toast.success("Tracking number updated successfully");
      setDialogOpen(false);
      fetchOrders();
    } catch (error) {
      console.error('Error updating tracking:', error);
      toast.error("Failed to update tracking number");
    }
  };

  const handleAddShipmentUpdate = async () => {
    if (!selectedOrder || !updateStatus || !updateLocation) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const newUpdate: ShipmentUpdate = {
        date: new Date().toISOString(),
        status: updateStatus,
        location: updateLocation,
        description: updateDescription
      };

      const currentUpdates = selectedOrder.shipment_updates || [];
      const updatedShipments = [...currentUpdates, newUpdate];

      const { error } = await supabase
        .from('orders')
        .update({ shipment_updates: updatedShipments as any })
        .eq('id', selectedOrder.id);

      if (error) throw error;

      // Log admin activity
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("admin_logs").insert([{
          admin_id: user.id,
          action: "ADD_SHIPMENT_UPDATE",
          details: { order_id: selectedOrder.id, update: newUpdate } as any
        }]);
      }

      toast.success("Shipment update added successfully");
      setUpdateStatus("");
      setUpdateLocation("");
      setUpdateDescription("");
      fetchOrders();
    } catch (error) {
      console.error('Error adding shipment update:', error);
      toast.error("Failed to add shipment update");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      processing: "secondary",
      shipped: "outline",
    };
    return <Badge variant={variants[status] || "default"}>{status.toUpperCase()}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Loading orders...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Tracking Management</CardTitle>
        <CardDescription>Update tracking numbers and shipment status for customer orders</CardDescription>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No orders to track</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tracking</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">
                      {order.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{userProfiles.get(order.user_id)?.full_name || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">{userProfiles.get(order.user_id)?.email || 'N/A'}</p>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(order.order_date).toLocaleDateString("en-IN")}</TableCell>
                    <TableCell>₹{order.total}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      {order.tracking_number ? (
                        <span className="text-xs font-mono">{order.tracking_number}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Not set</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Dialog open={dialogOpen && selectedOrder?.id === order.id} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => handleOpenDialog(order)}>
                            <Package className="w-4 h-4 mr-2" />
                            Manage
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Manage Order Tracking</DialogTitle>
                            <DialogDescription>
                              Update tracking information for order {order.id.slice(0, 8)}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-6">
                            {/* Tracking Number Section */}
                            <div className="space-y-2">
                              <Label htmlFor="tracking">Tracking Number</Label>
                              <div className="flex gap-2">
                                <Input
                                  id="tracking"
                                  value={trackingNumber}
                                  onChange={(e) => setTrackingNumber(e.target.value)}
                                  placeholder="Enter tracking number"
                                />
                                <Button onClick={handleUpdateTracking}>Update</Button>
                              </div>
                            </div>

                            {/* Add Shipment Update Section */}
                            <div className="space-y-4 border-t pt-4">
                              <h4 className="font-semibold flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                Add Shipment Update
                              </h4>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="status">Status</Label>
                                  <Input
                                    id="status"
                                    value={updateStatus}
                                    onChange={(e) => setUpdateStatus(e.target.value)}
                                    placeholder="e.g., In Transit, Out for Delivery"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="location">Location</Label>
                                  <Input
                                    id="location"
                                    value={updateLocation}
                                    onChange={(e) => setUpdateLocation(e.target.value)}
                                    placeholder="e.g., Mumbai Hub"
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Textarea
                                  id="description"
                                  value={updateDescription}
                                  onChange={(e) => setUpdateDescription(e.target.value)}
                                  placeholder="Additional details..."
                                  rows={2}
                                />
                              </div>
                              <Button onClick={handleAddShipmentUpdate} className="w-full">
                                Add Update
                              </Button>
                            </div>

                            {/* Existing Updates */}
                            {order.shipment_updates && order.shipment_updates.length > 0 && (
                              <div className="space-y-2 border-t pt-4">
                                <h4 className="font-semibold">Shipment History</h4>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                  {order.shipment_updates.map((update, index) => (
                                    <div key={index} className="border rounded-lg p-3 space-y-1">
                                      <div className="flex justify-between items-start">
                                        <Badge variant="outline">{update.status}</Badge>
                                        <span className="text-xs text-muted-foreground">
                                          {new Date(update.date).toLocaleString("en-IN")}
                                        </span>
                                      </div>
                                      <p className="text-sm font-medium">{update.location}</p>
                                      {update.description && (
                                        <p className="text-xs text-muted-foreground">{update.description}</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
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
