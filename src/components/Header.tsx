import { ShoppingCart, Menu, Package, User, LogOut, Shield, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "./Logo";
import { useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface HeaderProps {
  cartItemsCount: number;
  onCartClick: () => void;
  isCartBouncing: boolean;
}

const Header = ({ cartItemsCount, onCartClick, isCartBouncing }: HeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [userFullName, setUserFullName] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();

  // Fetch user profile and set up realtime updates
  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        
        if (data?.full_name) {
          setUserFullName(data.full_name);
        }
      };

      fetchProfile();

      // Set up realtime subscription for profile updates
      const channel = supabase
        .channel(`profile-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.new && 'full_name' in payload.new) {
              setUserFullName(payload.new.full_name as string);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setUserFullName(null);
    }
  }, [user]);

  const categories = [
    { name: "T-SHIRTS", href: "#t-shirts" },
    { name: "SHIRTS", href: "#shirts" },
    { name: "TROUSERS", href: "#trousers" },
    { name: "FORMALS", href: "#formals" },
    { name: "POLO TSHIRT", href: "#polo-tshirt" },
  ];

  const handleCategoryClick = (href: string) => {
    setIsOpen(false);
    if (window.location.pathname !== '/') {
      navigate('/', { state: { scrollTo: href } });
    } else {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <div onClick={() => navigate('/')} className="cursor-pointer">
            <Logo />
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => handleCategoryClick(category.href)}
                className="text-sm font-bold tracking-wide hover:text-primary transition-colors"
              >
                {category.name}
              </button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/my-orders")}
              className="font-bold"
            >
              <Package className="w-4 h-4 mr-2" />
              MY ORDERS
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/wishlist")}
              className="font-bold"
            >
              <Heart className="w-4 h-4 mr-2" />
              WISHLIST
            </Button>

            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/admin")}
                className="font-bold"
              >
                <Shield className="w-4 h-4 mr-2" />
                ADMIN
              </Button>
            )}
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="font-bold">
                    <User className="w-4 h-4 mr-2" />
                    {userFullName || user.email?.split('@')[0] || 'ACCOUNT'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {userFullName || user.email}
                    {isAdmin && <span className="block text-xs text-muted-foreground">Admin</span>}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="w-4 h-4 mr-2" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/auth")}
                className="font-bold"
              >
                <User className="w-4 h-4 mr-2" />
                LOGIN
              </Button>
            )}
          </nav>

          {/* Mobile & Cart Actions */}
          <div className="flex items-center gap-2">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="hover:bg-secondary">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <nav className="flex flex-col gap-4 mt-8">
                  {categories.map((category) => (
                    <button
                      key={category.name}
                      onClick={() => handleCategoryClick(category.href)}
                      className="text-left text-lg font-bold tracking-wide hover:text-primary transition-colors"
                    >
                      {category.name}
                    </button>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsOpen(false);
                      navigate("/my-orders");
                    }}
                    className="justify-start font-bold mt-4"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    MY ORDERS
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsOpen(false);
                      navigate("/wishlist");
                    }}
                    className="justify-start font-bold"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    WISHLIST
                  </Button>

                  {isAdmin && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsOpen(false);
                        navigate("/admin");
                      }}
                      className="justify-start font-bold"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      ADMIN PORTAL
                    </Button>
                  )}
                  
                  {user ? (
                    <>
                      <div className="px-2 py-2 mt-4 border-t border-border">
                        <p className="text-sm font-bold">{userFullName || user.email}</p>
                        {isAdmin && <p className="text-xs text-muted-foreground">Admin</p>}
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsOpen(false);
                          navigate("/profile");
                        }}
                        className="justify-start font-bold w-full mt-2"
                      >
                        <User className="w-4 h-4 mr-2" />
                        PROFILE SETTINGS
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsOpen(false);
                          signOut();
                        }}
                        className="justify-start font-bold w-full mt-2"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        LOGOUT
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsOpen(false);
                        navigate("/auth");
                      }}
                      className="justify-start font-bold mt-4"
                    >
                      <User className="w-4 h-4 mr-2" />
                      LOGIN
                    </Button>
                  )}
                </nav>
              </SheetContent>
            </Sheet>

            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-secondary group"
              onClick={onCartClick}
            >
              <ShoppingCart 
                className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110 ${
                  isCartBouncing ? "animate-cart-bounce" : ""
                }`} 
              />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
