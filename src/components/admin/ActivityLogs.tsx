import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Package, Tag, Settings as SettingsIcon, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

interface AdminLog {
  id: string;
  admin_id: string;
  action: string;
  details: any;
  created_at: string;
}

interface AdminProfile {
  id: string;
  email: string;
  full_name: string | null;
}

export const ActivityLogs = () => {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [adminProfiles, setAdminProfiles] = useState<Map<string, AdminProfile>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data: logsData, error } = await supabase
        .from("admin_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      if (logsData) {
        setLogs(logsData);

        // Fetch admin profiles
        const adminIds = [...new Set(logsData.map(log => log.admin_id))];
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, email, full_name")
          .in("id", adminIds);

        if (profilesData) {
          const profileMap = new Map(profilesData.map(profile => [profile.id, profile]));
          setAdminProfiles(profileMap);
        }
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast.error("Failed to load activity logs");
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes("PRODUCT")) return <Package className="w-4 h-4" />;
    if (action.includes("DISCOUNT")) return <Tag className="w-4 h-4" />;
    if (action.includes("SETTINGS")) return <SettingsIcon className="w-4 h-4" />;
    if (action.includes("ORDER")) return <ShoppingBag className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const getActionBadge = (action: string) => {
    if (action.includes("ADD") || action.includes("CREATE")) {
      return <Badge variant="outline">CREATE</Badge>;
    }
    if (action.includes("UPDATE")) {
      return <Badge variant="secondary">UPDATE</Badge>;
    }
    if (action.includes("DELETE")) {
      return <Badge variant="destructive">DELETE</Badge>;
    }
    return <Badge variant="default">{action}</Badge>;
  };

  const formatDetails = (details: any) => {
    if (!details) return "No details";
    const keys = Object.keys(details);
    if (keys.length === 0) return "No details";
    return keys.slice(0, 3).map(key => `${key}: ${JSON.stringify(details[key])}`).join(", ");
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading activity logs...</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Admin Activity Logs
        </CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No activity logs yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs">
                      {new Date(log.created_at).toLocaleString("en-IN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">
                          {adminProfiles.get(log.admin_id)?.full_name || "Admin"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {adminProfiles.get(log.admin_id)?.email || ""}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        <span className="text-sm">{log.action.replace(/_/g, " ")}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getActionBadge(log.action)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-md truncate">
                      {formatDetails(log.details)}
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