import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MessageSquare, Send } from "lucide-react";

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
}

export const SupportTicketsManagement = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [userProfiles, setUserProfiles] = useState<Map<string, UserProfile>>(new Map());
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState("");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const { data: ticketsData, error: ticketsError } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (ticketsError) throw ticketsError;

      setTickets(ticketsData || []);

      // Fetch user profiles
      if (ticketsData) {
        const userIds = [...new Set(ticketsData.map(ticket => ticket.user_id))];
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, email, full_name")
          .in("id", userIds);

        if (profilesData) {
          const profileMap = new Map(profilesData.map(profile => [profile.id, profile]));
          setUserProfiles(profileMap);
        }
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("support_tickets")
        .update({ status: newStatus })
        .eq("id", ticketId);

      if (error) throw error;

      // Log admin activity
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("admin_logs").insert({
          admin_id: user.id,
          action: "UPDATE_TICKET_STATUS",
          details: { ticket_id: ticketId, new_status: newStatus }
        });
      }

      toast.success("Ticket status updated");
      fetchTickets();
    } catch (error) {
      console.error("Error updating ticket status:", error);
      toast.error("Failed to update ticket status");
    }
  };

  const handleReply = async (ticketId: string) => {
    if (!replyMessage.trim()) {
      toast.error("Please enter a reply message");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("ticket_messages")
        .insert({
          ticket_id: ticketId,
          user_id: user.id,
          message: replyMessage,
          is_admin_reply: true
        });

      if (error) throw error;

      // Update ticket status to in_progress if it's open
      const ticket = tickets.find(t => t.id === ticketId);
      if (ticket?.status === "open") {
        await handleStatusChange(ticketId, "in_progress");
      }

      // Log admin activity
      await supabase.from("admin_logs").insert({
        admin_id: user.id,
        action: "REPLY_TO_TICKET",
        details: { ticket_id: ticketId }
      });

      toast.success("Reply sent successfully");
      setReplyMessage("");
      setSelectedTicketId(null);
    } catch (error) {
      console.error("Error sending reply:", error);
      toast.error("Failed to send reply");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      open: "default",
      in_progress: "secondary",
      closed: "outline"
    };
    return <Badge variant={variants[status] || "default"}>{status.toUpperCase().replace("_", " ")}</Badge>;
  };

  if (loading) {
    return <div className="text-center py-8">Loading tickets...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Support Tickets</CardTitle>
        <CardDescription>View and respond to customer support requests</CardDescription>
      </CardHeader>
      <CardContent>
        {tickets.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No support tickets yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => {
                  const profile = userProfiles.get(ticket.user_id);
                  return (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-mono text-xs">
                        {ticket.id.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{profile?.full_name || "N/A"}</p>
                          <p className="text-xs text-muted-foreground">{profile?.email || "N/A"}</p>
                        </div>
                      </TableCell>
                      <TableCell>{ticket.subject}</TableCell>
                      <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                      <TableCell>
                        {new Date(ticket.created_at).toLocaleDateString("en-IN")}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Select
                            value={ticket.status}
                            onValueChange={(value) => handleStatusChange(ticket.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open">Open</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Dialog open={selectedTicketId === ticket.id} onOpenChange={(open) => {
                            if (!open) {
                              setSelectedTicketId(null);
                              setReplyMessage("");
                            }
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedTicketId(ticket.id)}
                              >
                                <Send className="w-4 h-4 mr-2" />
                                Reply
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Reply to Ticket</DialogTitle>
                                <DialogDescription>
                                  <div className="mt-2">
                                    <p className="font-medium">Subject: {ticket.subject}</p>
                                    <p className="text-sm mt-2">Customer Message:</p>
                                    <p className="text-sm bg-secondary p-3 rounded mt-1">{ticket.message}</p>
                                  </div>
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 mt-4">
                                <Textarea
                                  placeholder="Type your reply here..."
                                  value={replyMessage}
                                  onChange={(e) => setReplyMessage(e.target.value)}
                                  rows={6}
                                />
                                <Button
                                  onClick={() => handleReply(ticket.id)}
                                  className="w-full"
                                >
                                  <Send className="w-4 h-4 mr-2" />
                                  Send Reply
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};