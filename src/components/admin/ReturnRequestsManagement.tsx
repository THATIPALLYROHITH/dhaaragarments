import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

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

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
}

interface Order {
  id: string;
  total: number;
  order_date: string;
}

export const ReturnRequestsManagement = () => {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [userProfiles, setUserProfiles] = useState<Map<string, UserProfile>>(new Map());
  const [orders, setOrders] = useState<Map<string, Order>>(new Map());
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReturnRequests();
  }, []);

  const fetchReturnRequests = async () => {
    try {
      const { data: returnsData, error } = await supabase
        .from('order_returns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReturns(returnsData || []);

      // Fetch user profiles
      if (returnsData) {
        const userIds = [...new Set(returnsData.map(ret => ret.user_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .in('id', userIds);

        if (profilesData) {
          const profileMap = new Map(profilesData.map(profile => [profile.id, profile]));
          setUserProfiles(profileMap);
        }

        // Fetch order details
        const orderIds = [...new Set(returnsData.map(ret => ret.order_id))];
        const { data: ordersData } = await supabase
          .from('orders')
          .select('id, total, order_date')
          .in('id', orderIds);

        if (ordersData) {
          const orderMap = new Map(ordersData.map(order => [order.id, order]));
          setOrders(orderMap);
        }
      }
    } catch (error) {
      console.error('Error fetching return requests:', error);
      toast.error("Failed to load return requests");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (returnReq: ReturnRequest) => {
    setSelectedReturn(returnReq);
    setRefundAmount(returnReq.refund_amount?.toString() || "");
    setAdminNotes(returnReq.admin_notes || "");
    setNewStatus(returnReq.status);
    setDialogOpen(true);
  };

  const handleProcessReturn = async () => {
    if (!selectedReturn) return;

    try {
      const updateData: any = {
        status: newStatus,
        admin_notes: adminNotes || null,
        processed_at: new Date().toISOString()
      };

      if (refundAmount && !isNaN(parseFloat(refundAmount))) {
        updateData.refund_amount = parseFloat(refundAmount);
      }

      const { error } = await supabase
        .from('order_returns')
        .update(updateData)
        .eq('id', selectedReturn.id);

      if (error) throw error;

      // Log admin activity
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("admin_logs").insert([{
          admin_id: user.id,
          action: "PROCESS_RETURN",
          details: { 
            return_id: selectedReturn.id,
            order_id: selectedReturn.order_id,
            status: newStatus,
            refund_amount: refundAmount
          }
        }]);
      }

      toast.success("Return request processed successfully");
      setDialogOpen(false);
      fetchReturnRequests();
    } catch (error) {
      console.error('Error processing return:', error);
      toast.error("Failed to process return request");
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
      pending: { variant: "secondary", icon: AlertCircle },
      approved: { variant: "default", icon: CheckCircle },
      rejected: { variant: "destructive", icon: XCircle },
      refunded: { variant: "outline", icon: CheckCircle },
    };
    const { variant, icon: Icon } = config[status] || config.pending;
    return (
      <Badge variant={variant} className="flex items-center gap-1 w-fit">
        <Icon className="w-3 h-3" />
        {status.toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Loading return requests...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Return Requests Management</CardTitle>
        <CardDescription>Review and process customer return requests</CardDescription>
      </CardHeader>
      <CardContent>
        {returns.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No return requests</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Order Amount</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {returns.map((returnReq) => {
                  const order = orders.get(returnReq.order_id);
                  const profile = userProfiles.get(returnReq.user_id);
                  
                  return (
                    <TableRow key={returnReq.id}>
                      <TableCell className="font-mono text-xs">
                        {returnReq.id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {returnReq.order_id.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{profile?.full_name || 'N/A'}</p>
                          <p className="text-xs text-muted-foreground">{profile?.email || 'N/A'}</p>
                        </div>
                      </TableCell>
                      <TableCell>₹{order?.total || 0}</TableCell>
                      <TableCell className="max-w-xs truncate">{returnReq.reason}</TableCell>
                      <TableCell>{getStatusBadge(returnReq.status)}</TableCell>
                      <TableCell>
                        {new Date(returnReq.created_at).toLocaleDateString("en-IN")}
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleOpenDialog(returnReq)}
                        >
                          Process
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Process Return Request</DialogTitle>
              <DialogDescription>
                Review and process the customer's return request
              </DialogDescription>
            </DialogHeader>

            {selectedReturn && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Order Amount</p>
                    <p className="text-lg font-bold">₹{orders.get(selectedReturn.order_id)?.total || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Current Status</p>
                    <div className="mt-1">{getStatusBadge(selectedReturn.status)}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Customer Reason</Label>
                  <p className="text-sm p-3 bg-muted rounded-lg">{selectedReturn.reason}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Update Status</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(newStatus === 'approved' || newStatus === 'refunded') && (
                  <div className="space-y-2">
                    <Label htmlFor="refund">Refund Amount (₹)</Label>
                    <Input
                      id="refund"
                      type="number"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      placeholder="Enter refund amount"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="notes">Admin Notes</Label>
                  <Textarea
                    id="notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add internal notes or customer communication..."
                    rows={3}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleProcessReturn}>
                Process Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};