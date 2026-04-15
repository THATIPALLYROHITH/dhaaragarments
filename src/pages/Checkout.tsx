import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { CartItem } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Smartphone, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import mastercardLogo from "@/assets/mastercard.png";

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const cartItems: CartItem[] = JSON.parse(localStorage.getItem("dhaara-cart") || "[]");
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Check authentication and redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Please login to proceed with checkout");
      navigate(`/auth?redirect=${encodeURIComponent(location.pathname)}`);
    }
  }, [user, authLoading, navigate, location.pathname]);

  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  const [paymentData, setPaymentData] = useState({
    upiId: "",
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });

  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
  const [discountError, setDiscountError] = useState("");
  const [shopSettings, setShopSettings] = useState<any>(null);

  // Fetch shop settings for tax and delivery
  useEffect(() => {
    const fetchShopSettings = async () => {
      const { data } = await supabase.from('shop_settings').select('*').single();
      setShopSettings(data);
    };
    fetchShopSettings();
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = appliedDiscount ? (subtotal * appliedDiscount.percentage) / 100 : 0;
  const taxRate = shopSettings?.tax_rate || 0;
  const deliveryCharge = shopSettings?.delivery_charge || 0;
  const tax = (subtotal - discountAmount) * (taxRate / 100);
  const finalTotal = subtotal - discountAmount + tax + deliveryCharge;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePaymentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentData({ ...paymentData, [e.target.name]: e.target.value });
  };

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountError("Please enter a discount code");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('discounts')
        .select('*')
        .eq('code', discountCode.toUpperCase())
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setDiscountError("Invalid discount code");
        return;
      }

      // Check if expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        setDiscountError("This discount code has expired");
        return;
      }

      // Check if maxed out
      if (data.max_usage && data.usage_count >= data.max_usage) {
        setDiscountError("This discount code has reached its usage limit");
        return;
      }

      setAppliedDiscount(data);
      setDiscountError("");
      toast.success(`Discount applied! ${data.percentage}% off`);
    } catch (error) {
      console.error('Error applying discount:', error);
      setDiscountError("Failed to apply discount");
    }
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode("");
    setDiscountError("");
    toast.info("Discount removed");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please login to place an order");
      return;
    }
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.phone || !formData.address) {
      toast.error("Please fill all required fields");
      return;
    }

    if (paymentMethod === "upi" && !paymentData.upiId) {
      toast.error("Please enter UPI ID");
      return;
    }

    if ((paymentMethod === "credit" || paymentMethod === "debit") && 
        (!paymentData.cardNumber || !paymentData.cardName || !paymentData.expiryDate || !paymentData.cvv)) {
      toast.error("Please fill all card details");
      return;
    }

    try {
      // Save order to database
      const { error } = await supabase
        .from('orders')
        .insert([{
          user_id: user.id,
          items: cartItems as any,
          total: finalTotal,
          subtotal: subtotal,
          tax: tax,
          delivery_charge: deliveryCharge,
          discount_amount: discountAmount,
          shipping_info: formData as any,
          payment_method: paymentMethod,
          status: 'placed'
        }]);

      if (error) throw error;

      // Update discount usage count if discount was applied
      if (appliedDiscount) {
        await supabase
          .from('discounts')
          .update({ usage_count: appliedDiscount.usage_count + 1 })
          .eq('id', appliedDiscount.id);
      }

      // Clear cart
      localStorage.removeItem("dhaara-cart");

      toast.success("Order placed successfully!");
      setTimeout(() => navigate("/my-orders"), 2000);
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error("Failed to place order. Please try again.");
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header cartItemsCount={0} onCartClick={() => {}} isCartBouncing={false} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">No items in cart</h2>
            <Button onClick={() => navigate("/")}>Continue Shopping</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header cartItemsCount={cartItems.length} onCartClick={() => {}} isCartBouncing={false} />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 flex-1">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Shop
        </Button>

        <h1 className="text-3xl sm:text-4xl font-bold mb-8 tracking-tighter">CHECKOUT</h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shipping Information */}
              <div className="bg-secondary p-6 rounded-lg border border-border">
                <h2 className="text-xl font-bold mb-4 tracking-tight">SHIPPING INFORMATION</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
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
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input
                        id="pincode"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-secondary p-6 rounded-lg border border-border">
                <h2 className="text-xl font-bold mb-4 tracking-tight">PAYMENT METHOD</h2>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2 mb-3">
                    <RadioGroupItem value="upi" id="upi" />
                    <Label htmlFor="upi" className="flex items-center cursor-pointer">
                      <Smartphone className="w-4 h-4 mr-2" />
                      UPI
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 mb-3">
                    <RadioGroupItem value="credit" id="credit" />
                    <Label htmlFor="credit" className="flex items-center cursor-pointer">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Credit Card
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="debit" id="debit" />
                    <Label htmlFor="debit" className="flex items-center cursor-pointer">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Debit Card
                    </Label>
                  </div>
                </RadioGroup>

                {/* Payment Details */}
                <div className="mt-6 space-y-4">
                  {paymentMethod === "upi" && (
                    <div>
                      <Label htmlFor="upiId">UPI ID *</Label>
                      <Input
                        id="upiId"
                        name="upiId"
                        placeholder="username@upi"
                        value={paymentData.upiId}
                        onChange={handlePaymentInputChange}
                        required
                      />
                    </div>
                  )}

                  {(paymentMethod === "credit" || paymentMethod === "debit") && (
                    <>
                      <div className="flex items-center gap-2 mb-4">
                        <img src={mastercardLogo} alt="Mastercard" className="h-8 w-auto" />
                        <span className="text-sm text-muted-foreground">We accept major cards</span>
                      </div>
                      <div>
                        <Label htmlFor="cardNumber">Card Number *</Label>
                        <Input
                          id="cardNumber"
                          name="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={paymentData.cardNumber}
                          onChange={handlePaymentInputChange}
                          maxLength={19}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="cardName">Cardholder Name *</Label>
                        <Input
                          id="cardName"
                          name="cardName"
                          placeholder="Name on card"
                          value={paymentData.cardName}
                          onChange={handlePaymentInputChange}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate">Expiry Date *</Label>
                          <Input
                            id="expiryDate"
                            name="expiryDate"
                            placeholder="MM/YY"
                            value={paymentData.expiryDate}
                            onChange={handlePaymentInputChange}
                            maxLength={5}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV *</Label>
                          <Input
                            id="cvv"
                            name="cvv"
                            placeholder="123"
                            type="password"
                            value={paymentData.cvv}
                            onChange={handlePaymentInputChange}
                            maxLength={3}
                            required
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full h-12 text-base font-bold">
                PLACE ORDER - ₹{finalTotal.toFixed(2)}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-secondary p-6 rounded-lg border border-border sticky top-24">
              <h2 className="text-xl font-bold mb-4 tracking-tight">ORDER SUMMARY</h2>
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-border">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover border border-border"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-sm">{item.name}</h3>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                      <p className="text-sm mt-1">
                        ₹{item.price} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Discount Code Section */}
              <div className="mb-6 pb-6 border-b border-border">
                <Label htmlFor="discount">Discount Code</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="discount"
                    placeholder="Enter code"
                    value={discountCode}
                    onChange={(e) => {
                      setDiscountCode(e.target.value.toUpperCase());
                      setDiscountError("");
                    }}
                    disabled={!!appliedDiscount}
                  />
                  {appliedDiscount ? (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleRemoveDiscount}
                    >
                      Remove
                    </Button>
                  ) : (
                    <Button 
                      type="button" 
                      onClick={handleApplyDiscount}
                    >
                      Apply
                    </Button>
                  )}
                </div>
                {discountError && (
                  <p className="text-xs text-destructive mt-1">{discountError}</p>
                )}
                {appliedDiscount && (
                  <p className="text-xs text-primary mt-1 font-medium">
                    ✓ {appliedDiscount.percentage}% discount applied!
                  </p>
                )}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {appliedDiscount && (
                  <div className="flex justify-between text-sm text-primary">
                    <span>Discount ({appliedDiscount.percentage}%)</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                {tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Tax ({taxRate}%)</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Delivery</span>
                  <span>{deliveryCharge > 0 ? `₹${deliveryCharge.toFixed(2)}` : 'FREE'}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Checkout;
