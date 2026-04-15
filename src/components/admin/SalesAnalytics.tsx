import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, DollarSign, ShoppingCart, Users } from "lucide-react";

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

interface ProductSales {
  name: string;
  sales: number;
}

export const SalesAnalytics = () => {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [topProducts, setTopProducts] = useState<ProductSales[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    growthRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch orders for analytics
      const { data: orders } = await supabase
        .from("orders")
        .select("*")
        .order("order_date", { ascending: true });

      if (orders) {
        // Calculate daily sales
        const dailySales = orders.reduce((acc: any, order: any) => {
          const date = new Date(order.order_date).toLocaleDateString("en-IN");
          if (!acc[date]) {
            acc[date] = { date, revenue: 0, orders: 0 };
          }
          acc[date].revenue += order.total;
          acc[date].orders += 1;
          return acc;
        }, {});

        setSalesData(Object.values(dailySales));

        // Calculate top products
        const productSales: { [key: string]: number } = {};
        orders.forEach((order: any) => {
          order.items?.forEach((item: any) => {
            if (!productSales[item.name]) {
              productSales[item.name] = 0;
            }
            productSales[item.name] += item.quantity;
          });
        });

        const topProds = Object.entries(productSales)
          .map(([name, sales]) => ({ name, sales }))
          .sort((a, b) => b.sales - a.sales)
          .slice(0, 5);

        setTopProducts(topProds);

        // Calculate overall stats
        const totalRevenue = orders.reduce((sum, order: any) => sum + order.total, 0);
        const uniqueCustomers = new Set(orders.map((o: any) => o.user_id)).size;

        // Calculate growth rate (last 7 days vs previous 7 days)
        const now = new Date();
        const last7Days = orders.filter((o: any) => {
          const orderDate = new Date(o.order_date);
          const daysDiff = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
          return daysDiff <= 7;
        });
        const prev7Days = orders.filter((o: any) => {
          const orderDate = new Date(o.order_date);
          const daysDiff = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
          return daysDiff > 7 && daysDiff <= 14;
        });

        const lastWeekRevenue = last7Days.reduce((sum, o: any) => sum + o.total, 0);
        const prevWeekRevenue = prev7Days.reduce((sum, o: any) => sum + o.total, 0);
        const growth = prevWeekRevenue > 0
          ? ((lastWeekRevenue - prevWeekRevenue) / prevWeekRevenue) * 100
          : 0;

        setStats({
          totalRevenue,
          totalOrders: orders.length,
          totalCustomers: uniqueCustomers,
          growthRate: growth,
        });
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ["#000000", "#333333", "#666666", "#999999", "#CCCCCC"];

  if (loading) {
    return <p className="text-muted-foreground">Loading analytics...</p>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Growth (7d)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.growthRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Daily Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#000000" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={topProducts}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="sales"
                >
                  {topProducts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Daily Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#000000" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};