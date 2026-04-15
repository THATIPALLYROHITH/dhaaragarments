import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Package, Users, ShoppingBag, TrendingUp, Tag, Settings, FileText, MessageSquare, Truck, RotateCcw } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { ProductManagement } from "@/components/admin/ProductManagement";
import { SalesAnalytics } from "@/components/admin/SalesAnalytics";
import { DiscountManagement } from "@/components/admin/DiscountManagement";
import { ShopSettings } from "@/components/admin/ShopSettings";
import { ActivityLogs } from "@/components/admin/ActivityLogs";
import { SupportTicketsManagement } from "@/components/admin/SupportTicketsManagement";
import { OrderTrackingManagement } from "@/components/admin/OrderTrackingManagement";
import { ReturnRequestsManagement } from "@/components/admin/ReturnRequestsManagement";

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
  user_id: string;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
}

interface UserWithRole extends UserProfile {
  role: string;
}

const AdminPortal = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [userProfiles, setUserProfiles] = useState<Map<string, UserProfile>>(new Map());
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Please login to access admin portal");
      navigate("/auth");
      return;
    }

    if (!authLoading && !isAdmin) {
      toast.error("Access denied. Admin privileges required.");
      navigate("/");
      return;
    }

    if (isAdmin) {
      fetchData();
    }
  }, [user, isAdmin, authLoading, navigate]);

  const fetchData = async () => {
    try {
      await Promise.all([fetchOrders(), fetchUsers(), fetchStats()]);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('order_date', { ascending: false });

    if (error) throw error;
    setOrders(data || []);

    // Fetch user profiles for orders
    if (data) {
      const userIds = [...new Set(data.map(order => order.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, email, full_name, created_at')
        .in('id', userIds);

      if (profilesData) {
        const profileMap = new Map(profilesData.map(profile => [profile.id, profile]));
        setUserProfiles(profileMap);
      }
    }
  };

  const fetchUsers = async () => {
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) throw profilesError;

    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role');

    if (rolesError) throw rolesError;

    // Combine profiles with their roles
    const usersWithRoles: UserWithRole[] = (profilesData || []).map(profile => {
      const userRole = rolesData?.find(role => role.user_id === profile.id);
      return {
        ...profile,
        role: userRole?.role || 'customer'
      };
    });

    setUsers(usersWithRoles);
  };

  const fetchStats = async () => {
    const { data: ordersData } = await supabase.from('orders').select('total');
    const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

    const totalRevenue = ordersData?.reduce((sum, order) => sum + order.total, 0) || 0;

    setStats({
      totalOrders: ordersData?.length || 0,
      totalUsers: usersCount || 0,
      totalRevenue,
    });
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      // Log the activity
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("admin_logs").insert({
          admin_id: user.id,
          action: "UPDATE_ORDER_STATUS",
          details: { order_id: orderId, new_status: newStatus }
        });
      }

      toast.success("Order status updated successfully");
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error("Failed to update order status");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      placed: "default",
      processing: "secondary",
      shipped: "outline",
      delivered: "outline",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status.toUpperCase()}</Badge>;
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header cartItemsCount={0} onCartClick={() => {}} isCartBouncing={false} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading admin portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header cartItemsCount={0} onCartClick={() => {}} isCartBouncing={false} />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 flex-1">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Shop
        </Button>

        <h1 className="text-3xl sm:text-4xl font-bold mb-8 tracking-tighter">ADMIN PORTAL</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className="grid grid-cols-11 w-full overflow-x-auto">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="discounts">Discounts</TabsTrigger>
            <TabsTrigger value="tracking">Tracking</TabsTrigger>
            <TabsTrigger value="returns">Returns</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalOrders}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <ProductManagement />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <SalesAnalytics />
          </TabsContent>

          <TabsContent value="discounts" className="space-y-4">
            <DiscountManagement />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <ShopSettings />
          </TabsContent>

          <TabsContent value="tracking" className="space-y-4">
            <OrderTrackingManagement />
          </TabsContent>

          <TabsContent value="returns" className="space-y-4">
            <ReturnRequestsManagement />
          </TabsContent>

          <TabsContent value="support" className="space-y-4">
            <SupportTicketsManagement />
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <ActivityLogs />
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Orders</CardTitle>
                <CardDescription>Manage and track all customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No orders yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
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
                            <TableCell>{order.items.length} items</TableCell>
                            <TableCell className="font-bold">₹{order.total}</TableCell>
                            <TableCell>
                              {new Date(order.order_date).toLocaleDateString("en-IN")}
                            </TableCell>
                            <TableCell>{getStatusBadge(order.status)}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Select
                                  value={order.status}
                                  onValueChange={(value) => handleStatusChange(order.id, value)}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="placed">Placed</SelectItem>
                                    <SelectItem value="processing">Processing</SelectItem>
                                    <SelectItem value="shipped">Shipped</SelectItem>
                                    <SelectItem value="delivered">Delivered</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={async () => {
                                    const { data: settings } = await supabase
                                      .from("shop_settings")
                                      .select("*")
                                      .limit(1)
                                      .single();
                                    
                                    const profile = userProfiles.get(order.user_id);
                                    const invoiceData = {
                                      orderId: order.id,
                                      orderDate: order.order_date,
                                      customerName: profile?.full_name || 'Customer',
                                      customerEmail: profile?.email || '',
                                      items: order.items.map((item: any) => ({
                                        name: item.name,
                                        quantity: item.quantity,
                                        price: item.price
                                      })),
                                      subtotal: order.subtotal || order.total,
                                      tax: order.tax || 0,
                                      deliveryCharge: order.delivery_charge || settings?.delivery_charge || 50,
                                      total: order.total,
                                      shopName: settings?.shop_name || 'Dhaara Garments',
                                      shopEmail: settings?.contact_email,
                                      shopPhone: settings?.contact_phone
                                    };
                                    
                                    const { generateInvoiceHTML, printInvoice } = await import('@/utils/invoiceGenerator');
                                    const html = generateInvoiceHTML(invoiceData);
                                    printInvoice(html);
                                  }}
                                >
                                  <FileText className="w-4 h-4" />
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
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>View all registered users and their roles</CardDescription>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No users yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Joined</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">
                              {user.full_name || 'N/A'}
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(user.created_at).toLocaleDateString("en-IN")}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default AdminPortal;
