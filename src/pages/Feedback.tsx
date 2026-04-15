import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Star } from "lucide-react";

const Feedback = () => {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill all required fields");
      return;
    }
    toast.success("Thank you for your feedback!");
    setFormData({ name: "", email: "", subject: "", message: "" });
    setRating(0);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header cartItemsCount={0} onCartClick={() => {}} isCartBouncing={false} />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 flex-1">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tighter">FEEDBACK</h1>
          <p className="text-muted-foreground mb-12">
            We value your feedback and suggestions to improve our service
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-secondary p-8 rounded-lg border border-border">
              <div className="mb-6">
                <Label className="text-base mb-3 block">Rate Your Experience</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= (hoveredRating || rating)
                            ? "fill-primary stroke-primary"
                            : "stroke-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label htmlFor="message">Your Feedback *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={6}
                    required
                    className="resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="flex-1">
                Submit Feedback
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/")}>
                Back to Shop
              </Button>
            </div>
          </form>

          <div className="mt-12 bg-secondary p-8 rounded-lg border border-border text-center">
            <h3 className="font-bold text-xl mb-2 tracking-tight">THANK YOU!</h3>
            <p className="text-muted-foreground">
              Your feedback helps us improve and provide better service to all our customers.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Feedback;
