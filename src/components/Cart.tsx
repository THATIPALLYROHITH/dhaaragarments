import { CartItem } from "@/types/product";
import { Button } from "@/components/ui/button";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";

interface CartProps {
  items: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
}

const Cart = ({ items, isOpen, onClose, onUpdateQuantity, onRemove, onCheckout }: CartProps) => {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-primary/50 z-50 animate-fade-in backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-background z-50 animate-slide-in-right flex flex-col border-l border-border shadow-2xl">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tighter">YOUR CART</h2>
            <p className="text-xs text-muted-foreground tracking-wider mt-1">
              {items.length} {items.length === 1 ? "ITEM" : "ITEMS"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-secondary"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-sm sm:text-base">Your cart is empty</p>
              <p className="text-xs text-muted-foreground mt-2">Add items to get started</p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-border last:border-0">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-secondary flex-shrink-0 border border-border">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground font-bold tracking-wider">
                          {item.category}
                        </p>
                        <h3 className="font-bold text-sm sm:text-base truncate">{item.name}</h3>
                        {item.selectedSize && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Size: <span className="font-bold text-foreground">{item.selectedSize}</span>
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 sm:h-8 sm:w-8 hover:bg-destructive hover:text-destructive-foreground flex-shrink-0"
                        onClick={() => onRemove(item.id)}
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 bg-secondary p-1 rounded border border-border">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 sm:h-7 sm:w-7 hover:bg-primary hover:text-primary-foreground"
                          onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                        >
                          <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                        <span className="w-6 sm:w-8 text-center font-bold text-sm sm:text-base">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 sm:h-7 sm:w-7 hover:bg-primary hover:text-primary-foreground"
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                      <p className="font-bold text-sm sm:text-base">₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {items.length > 0 && (
          <div className="p-4 sm:p-6 border-t border-border bg-secondary/50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg sm:text-xl font-bold tracking-wider">TOTAL</span>
              <span className="text-xl sm:text-2xl font-bold tracking-tighter">₹{total}</span>
            </div>
            <Button 
              onClick={onCheckout}
              className="w-full bg-primary hover:bg-accent text-primary-foreground font-bold transition-all duration-300 h-11 sm:h-12 text-sm sm:text-base"
            >
              PROCEED TO CHECKOUT
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default Cart;
