import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const MyTickets = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndFetchTickets = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please login to view your tickets");
        navigate("/auth");
        return;
      }

      await fetchTickets();
    };

    checkAuthAndFetchTickets();
  }, [navigate]);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setTickets(data || []);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="default">Open</Badge>;
      case "in_progress":
        return <Badge variant="secondary">In Progress</Badge>;
      case "closed":
        return <Badge variant="outline">Closed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header cartItemsCount={0} onCartClick={() => {}} isCartBouncing={false} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading tickets...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header cartItemsCount={0} onCartClick={() => {}} isCartBouncing={false} />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 flex-1">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/support")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Support
          </Button>

          <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tighter">MY SUPPORT TICKETS</h1>
          <p className="text-muted-foreground mb-8">View and track your support requests</p>

          {tickets.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-bold mb-2">No tickets yet</h3>
                <p className="text-muted-foreground mb-6">
                  You haven't submitted any support tickets. Need help? Create a new ticket!
                </p>
                <Button onClick={() => navigate("/support")}>
                  Submit New Ticket
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <Card key={ticket.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{ticket.subject}</CardTitle>
                        <CardDescription>
                          Submitted on {formatDate(ticket.created_at)}
                        </CardDescription>
                      </div>
                      {getStatusBadge(ticket.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">{ticket.message}</p>
                    {ticket.updated_at !== ticket.created_at && (
                      <p className="text-sm text-muted-foreground mt-4">
                        Last updated: {formatDate(ticket.updated_at)}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-8">
            <Button onClick={() => navigate("/support")} className="w-full">
              Submit New Ticket
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MyTickets;
