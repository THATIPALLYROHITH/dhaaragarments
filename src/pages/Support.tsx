import { Phone, Mail, Clock, MapPin, Send } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const Support = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkAuth();
  }, []);

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please login to submit a support ticket");
      navigate("/auth");
      return;
    }

    if (!subject.trim() || !message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("support_tickets")
        .insert({
          user_id: user.id,
          subject: subject.trim(),
          message: message.trim(),
          status: "open"
        });

      if (error) throw error;

      toast.success("Support ticket submitted successfully! We'll get back to you soon.");
      setSubject("");
      setMessage("");
    } catch (error) {
      console.error("Error submitting ticket:", error);
      toast.error("Failed to submit ticket. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header cartItemsCount={0} onCartClick={() => {}} isCartBouncing={false} />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 flex-1">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tighter">CUSTOMER SUPPORT</h1>
          <p className="text-muted-foreground mb-12">We're here to help you with any questions or concerns</p>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-secondary p-6 rounded-lg border border-border">
              <Phone className="w-8 h-8 mb-4" />
              <h3 className="font-bold text-lg mb-2">PHONE</h3>
              <p className="text-muted-foreground">+91 1234567890</p>
            </div>

            <div className="bg-secondary p-6 rounded-lg border border-border">
              <Mail className="w-8 h-8 mb-4" />
              <h3 className="font-bold text-lg mb-2">EMAIL</h3>
              <p className="text-muted-foreground">support@dhaaragarments.com</p>
            </div>

            <div className="bg-secondary p-6 rounded-lg border border-border">
              <Clock className="w-8 h-8 mb-4" />
              <h3 className="font-bold text-lg mb-2">HOURS</h3>
              <p className="text-muted-foreground">Mon-Sat: 9:00 AM - 7:00 PM</p>
              <p className="text-muted-foreground">Sunday: Closed</p>
            </div>

            <div className="bg-secondary p-6 rounded-lg border border-border">
              <MapPin className="w-8 h-8 mb-4" />
              <h3 className="font-bold text-lg mb-2">ADDRESS</h3>
              <p className="text-muted-foreground">123 Fashion Street, Mumbai, India</p>
            </div>
          </div>

          <div className="bg-secondary p-8 rounded-lg border border-border mb-6">
            <h2 className="text-2xl font-bold mb-4 tracking-tight">HOW CAN WE HELP?</h2>
            <p className="text-muted-foreground mb-6">
              Our customer support team is dedicated to providing you with the best shopping experience. 
              Whether you have questions about products, orders, or need assistance with anything else, 
              we're here to help.
            </p>
            <ul className="space-y-2 text-muted-foreground mb-6">
              <li>• Order tracking and status updates</li>
              <li>• Product information and recommendations</li>
              <li>• Size and fit guidance</li>
              <li>• Returns and exchanges</li>
              <li>• Payment and shipping queries</li>
            </ul>
          </div>

          <div className="bg-secondary p-8 rounded-lg border border-border">
            <h2 className="text-2xl font-bold mb-4 tracking-tight">SUBMIT A SUPPORT TICKET</h2>
            <p className="text-muted-foreground mb-6">
              Fill out the form below and our support team will get back to you as soon as possible.
            </p>
            
            <form onSubmit={handleSubmitTicket} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  placeholder="Brief description of your issue"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  disabled={loading}
                  maxLength={200}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  placeholder="Provide detailed information about your issue"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  disabled={loading}
                  rows={6}
                  className="resize-none"
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  <Send className="w-4 h-4 mr-2" />
                  {loading ? "Submitting..." : "Submit Ticket"}
                </Button>
                {user && (
                  <Button type="button" variant="outline" onClick={() => navigate("/my-tickets")}>
                    View My Tickets
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Support;
