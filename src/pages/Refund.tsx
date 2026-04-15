import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

const Refund = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header cartItemsCount={0} onCartClick={() => {}} isCartBouncing={false} />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 flex-1">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tighter">REFUND POLICY</h1>
          <p className="text-muted-foreground mb-12">Understanding our return and refund process</p>

          <div className="space-y-8">
            <div className="bg-secondary p-8 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 tracking-tight">7-DAY RETURN POLICY</h2>
              <p className="text-muted-foreground mb-4">
                We want you to be completely satisfied with your purchase. If you're not happy with your order, 
                we accept returns within 7 days of delivery.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
                  <p className="text-sm">Items must be unworn, unwashed, and with original tags attached</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
                  <p className="text-sm">Products should be in their original packaging</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
                  <p className="text-sm">Return shipping costs are borne by the customer</p>
                </div>
              </div>
            </div>

            <div className="bg-secondary p-8 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 tracking-tight">HOW TO INITIATE A RETURN</h2>
              <ol className="space-y-3 list-decimal list-inside text-muted-foreground">
                <li>Contact our customer support within 7 days of delivery</li>
                <li>Provide your order number and reason for return</li>
                <li>Pack the items securely in original packaging</li>
                <li>Ship the package to our return address</li>
                <li>Refund will be processed within 7-10 business days after receiving the items</li>
              </ol>
            </div>

            <div className="bg-secondary p-8 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 tracking-tight">REFUND TIMELINE</h2>
              <p className="text-muted-foreground mb-4">
                Once we receive and inspect your return:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Quality check: 2-3 business days</li>
                <li>• Refund initiation: 1-2 business days after approval</li>
                <li>• Credit to original payment method: 5-7 business days</li>
              </ul>
            </div>

            <div className="bg-secondary p-8 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 tracking-tight">EXCHANGE POLICY</h2>
              <p className="text-muted-foreground">
                We also offer exchanges for different sizes or colors within 7 days of delivery, 
                subject to product availability. Exchange shipping is free for size/color exchanges.
              </p>
            </div>

            <div className="bg-secondary p-8 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 tracking-tight">NON-RETURNABLE ITEMS</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Items marked as "Final Sale"</li>
                <li>• Customized or personalized products</li>
                <li>• Items damaged due to misuse</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex gap-4 justify-center flex-wrap">
            <Button onClick={() => navigate("/support")}>Contact Support</Button>
            <Button variant="outline" onClick={() => navigate("/")}>
              Back to Shop
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Refund;
