import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Package, Download, X, RotateCcw } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { generateInvoiceHTML, downloadInvoiceAsPDF } from "@/utils/invoiceGenerator";

interface ShipmentUpdate {
  date: string;
  status: string;
  location: string;
  description: string;
}

interface DbOrder {
  id: string;
  items: any;
  total: number;
  subtotal?: number;
  tax?: number;
  delivery_charge?: number;
  discount_amount?: number;
  shipping_info: any;
  payment_method: string;
  order_date: string;
  status: string;
  tracking_number?: string | null;
  shipment_updates?: ShipmentUpdate[];
}

interface ReturnRequest {
  id: string;
  order_id: string;
  user_id: string;
  reason: string;
  status: string;
  refund_amount: number | null;
  admin_notes: string | null;
  created_at: string;
  processed_at: string | null;
}

const MyOrders = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [shopSettings, setShopSettings] = useState<any>(null);
  const [returnReason, setReturnReason] = useState("");
  const [selectedReturnOrder, setSelectedReturnOrder] = useState<DbOrder | null>(null);
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState<DbOrder | null>(null);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<DbOrder | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [returns, setReturns] = useState<Map<string, ReturnRequest>>(new Map());

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Please login to view your orders");
      navigate("/auth");
      return;
    }

    if (user) {
      fetchOrders();

      // Subscribe to realtime updates on order_returns
      const channel = supabase
        .channel('my-order-returns')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'order_returns',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              const updated = payload.new as ReturnRequest;
              setReturns(prev => {
                const next = new Map(prev);
                next.set(updated.order_id, updated);
                return next;
              });
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, authLoading, navigate]);

  const fetchOrders = async () => {
    try {
      const [ordersResult, settingsResult] = await Promise.all([
        supabase
          .from('orders')
          .select('*')
          .order('order_date', { ascending: false }),
        supabase
          .from('shop_settings')
          .select('*')
          .single()
      ]);

      if (ordersResult.error) throw ordersResult.error;
      const ordersData = (ordersResult.data as unknown as DbOrder[]) || [];
      setOrders(ordersData);
      
      if (!settingsResult.error) {
        setShopSettings(settingsResult.data);
      }

      // Fetch return requests for all orders
      if (ordersData.length > 0) {
        const orderIds = ordersData.map(order => order.id);
        const { data: returnsData } = await supabase
          .from('order_returns')
          .select('*')
          .in('order_id', orderIds);

        if (returnsData) {
          const returnsMap = new Map(returnsData.map(ret => [ret.order_id, ret as ReturnRequest]));
          setReturns(returnsMap);
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (order: DbOrder) => {
    if (!user || !shopSettings) return;

    const invoiceData = {
      orderId: order.id,
      orderDate: order.order_date,
      customerName: order.shipping_info.name,
      customerEmail: user.email || '',
      items: order.items.map((item: any) => ({
        name: `${item.name} (${item.selectedSize})`,
        quantity: item.quantity,
        price: item.price,
      })),
      subtotal: order.subtotal || 0,
      tax: order.tax || 0,
      deliveryCharge: order.delivery_charge || 0,
      total: order.total,
      shopName: shopSettings.shop_name || 'Dhaara Garments',
      shopEmail: shopSettings.contact_email,
      shopPhone: shopSettings.contact_phone,
    };

    const invoiceHTML = generateInvoiceHTML(invoiceData);
    downloadInvoiceAsPDF(invoiceHTML, order.id);
    toast.success("Invoice downloaded successfully!");
  };

  const canCancelOrder = (order: DbOrder) => {
    const orderDate = new Date(order.order_date);
    const currentDate = new Date();
    const hoursSinceOrder = Math.floor((currentDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60));
    
    return hoursSinceOrder <= 24 && order.status !== "cancelled" && order.status !== "delivered";
  };

  const canReturnOrder = (order: DbOrder) => {
    const orderDate = new Date(order.order_date);
    const currentDate = new Date();
    const daysSinceOrder = Math.floor((currentDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Check if return already exists
    const existingReturn = returns.get(order.id);
    
    return order.status === "delivered" && daysSinceOrder <= 7 && !existingReturn;
  };

  const handleCancelOrder = async (order: DbOrder) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', order.id);

      if (error) throw error;

      toast.success("Order cancelled successfully");
      fetchOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error("Failed to cancel order");
    }
  };

  const handleReturnOrder = async () => {
    if (!selectedReturnOrder || !user) return;

    if (!returnReason.trim()) {
      toast.error("Please provide a reason for return");
      return;
    }

    try {
      const { error } = await supabase
        .from('order_returns')
        .insert({
          order_id: selectedReturnOrder.id,
          user_id: user.id,
          reason: returnReason,
          status: 'pending'
        });

      if (error) throw error;

      toast.success("Return request submitted successfully");
      setReturnDialogOpen(false);
      setReturnReason("");
      fetchOrders();
    } catch (error) {
      console.error('Error submitting return request:', error);
      toast.error("Failed to submit return request");
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      placed: "bg-blue-500",
      processing: "bg-yellow-500",
      shipped: "bg-purple-500",
      delivered: "bg-green-500",
      cancelled: "bg-red-500",
    };
    return colors[status] || "bg-gray-500";
  };

  const getReturnStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      pending: { variant: "secondary", label: "Return Pending" },
      approved: { variant: "default", label: "Return Approved" },
      rejected: { variant: "destructive", label: "Return Rejected" },
      refunded: { variant: "outline", label: "Refunded" },
    };
    const { variant, label } = config[status] || config.pending;
    return <Badge variant={variant}>{label}</Badge>;
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header cartItemsCount={0} onCartClick={() => {}} isCartBouncing={false} />
        <div className="flex-1 flex items-center justify-center">
          <p>Loading orders...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header cartItemsCount={0} onCartClick={() => {}} isCartBouncing={false} />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">You haven't placed any orders yet.</p>
            <Button onClick={() => navigate("/")} className="mt-4">
              Start Shopping
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const returnRequest = returns.get(order.id);
              
              return (
                <Card key={order.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Order ID: {order.id.slice(0, 8)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Order Date: {new Date(order.order_date).toLocaleDateString("en-IN")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Total: ₹{order.total}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-col sm:flex-row">
                      <span className={`px-3 py-1 rounded-full text-white text-sm ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      {returnRequest && getReturnStatusBadge(returnRequest.status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {order.items.map((item: any, index: number) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Size: {item.selectedSize}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedOrder(order);
                        setDetailsDialogOpen(true);
                      }}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadInvoice(order)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Invoice
                    </Button>
                    {order.tracking_number && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTrackingOrder(order);
                          setTrackingDialogOpen(true);
                        }}
                      >
                        <Package className="w-4 h-4 mr-2" />
                        Track Order
                      </Button>
                    )}
                    {canCancelOrder(order) && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel Order
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancel Order</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to cancel this order? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>No, keep order</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleCancelOrder(order)}>
                              Yes, cancel order
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    {canReturnOrder(order) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedReturnOrder(order);
                          setReturnDialogOpen(true);
                        }}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Return Order
                      </Button>
                    )}
                  </div>

                  {/* Return Details Section */}
                  {returnRequest && (
                    <div className="mt-4 p-4 bg-muted rounded-lg border">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <RotateCcw className="w-4 h-4" />
                        Return Request Details
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Status: </span>
                          {getReturnStatusBadge(returnRequest.status)}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Reason: </span>
                          <span>{returnRequest.reason}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Submitted: </span>
                          <span>{new Date(returnRequest.created_at).toLocaleDateString("en-IN")}</span>
                        </div>
                        {returnRequest.refund_amount && (
                          <div>
                            <span className="text-muted-foreground">Refund Amount: </span>
                            <span className="font-semibold">₹{returnRequest.refund_amount}</span>
                          </div>
                        )}
                        {returnRequest.admin_notes && (
                          <div>
                            <span className="text-muted-foreground">Admin Notes: </span>
                            <span>{returnRequest.admin_notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Order Details Dialog */}
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Order Information</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Order ID:</span> {selectedOrder.id}</p>
                    <p><span className="text-muted-foreground">Order Date:</span> {new Date(selectedOrder.order_date).toLocaleString("en-IN")}</p>
                    <p><span className="text-muted-foreground">Status:</span> {selectedOrder.status}</p>
                    <p><span className="text-muted-foreground">Payment Method:</span> {selectedOrder.payment_method}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Shipping Information</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Name:</span> {selectedOrder.shipping_info.name}</p>
                    <p><span className="text-muted-foreground">Address:</span> {selectedOrder.shipping_info.address}</p>
                    <p><span className="text-muted-foreground">City:</span> {selectedOrder.shipping_info.city}</p>
                    <p><span className="text-muted-foreground">State:</span> {selectedOrder.shipping_info.state}</p>
                    <p><span className="text-muted-foreground">Pincode:</span> {selectedOrder.shipping_info.pincode}</p>
                    <p><span className="text-muted-foreground">Phone:</span> {selectedOrder.shipping_info.phone}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Items</h3>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item: any, index: number) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">Size: {item.selectedSize}</p>
                          <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                          <p className="text-sm text-muted-foreground">Price: ₹{item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Order Summary</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span>₹{selectedOrder.subtotal || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax:</span>
                      <span>₹{selectedOrder.tax || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery Charge:</span>
                      <span>₹{selectedOrder.delivery_charge || 0}</span>
                    </div>
                    {selectedOrder.discount_amount && selectedOrder.discount_amount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount:</span>
                        <span>-₹{selectedOrder.discount_amount}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total:</span>
                      <span>₹{selectedOrder.total}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Return Dialog */}
        <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Return Order</DialogTitle>
              <DialogDescription>
                Please provide a reason for returning this order
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="return-reason">Reason for Return</Label>
                <Textarea
                  id="return-reason"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="Enter your reason for return..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReturnDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleReturnOrder}>
                Submit Return Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Tracking Dialog */}
        <Dialog open={trackingDialogOpen} onOpenChange={setTrackingDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Track Your Order</DialogTitle>
            </DialogHeader>
            {selectedTrackingOrder && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Tracking Number</p>
                  <p className="font-mono font-bold text-lg">{selectedTrackingOrder.tracking_number}</p>
                </div>

                {selectedTrackingOrder.shipment_updates && selectedTrackingOrder.shipment_updates.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Shipment History</h3>
                    <div className="space-y-3">
                      {selectedTrackingOrder.shipment_updates.map((update, index) => (
                        <div key={index} className="flex gap-4 pb-3 border-b last:border-b-0">
                          <div className="flex flex-col items-center">
                            <div className="w-3 h-3 rounded-full bg-primary" />
                            {index !== selectedTrackingOrder.shipment_updates!.length - 1 && (
                              <div className="w-0.5 h-full bg-border mt-1" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{update.status}</p>
                                <p className="text-sm text-muted-foreground">{update.location}</p>
                                <p className="text-sm text-muted-foreground mt-1">{update.description}</p>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {new Date(update.date).toLocaleString("en-IN")}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
};

export default MyOrders;
