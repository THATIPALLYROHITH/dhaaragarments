import { Instagram } from "lucide-react";
import Logo from "./Logo";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  const handleWhatsApp = () => {
    window.open("https://wa.me/1234567890", "_blank");
  };

  const handleCategoryClick = (href: string) => {
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
    <footer className="bg-secondary border-t border-border mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div>
            <Logo />
            <p className="text-sm text-muted-foreground mt-4">
              Premium clothing with timeless Swiss design elegance.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4 tracking-tight">SHOP</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => handleCategoryClick("#t-shirts")} className="text-muted-foreground hover:text-foreground transition-colors">
                  T-Shirts
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryClick("#shirts")} className="text-muted-foreground hover:text-foreground transition-colors">
                  Shirts
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryClick("#trousers")} className="text-muted-foreground hover:text-foreground transition-colors">
                  Trousers
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryClick("#formals")} className="text-muted-foreground hover:text-foreground transition-colors">
                  Formals
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryClick("#polo-tshirt")} className="text-muted-foreground hover:text-foreground transition-colors">
                  Polo Tshirt
                </button>
              </li>
            </ul>
          </div>

          {/* Support Section */}
          <div>
            <h3 className="font-bold text-lg mb-4 tracking-tight">SUPPORT</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/support" className="text-muted-foreground hover:text-foreground transition-colors">
                  Customer Support
                </a>
              </li>
              <li>
                <a href="/refund" className="text-muted-foreground hover:text-foreground transition-colors">
                  Refund Policy
                </a>
              </li>
              <li>
                <a href="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
                  FAQs
                </a>
              </li>
              <li>
                <a href="/feedback" className="text-muted-foreground hover:text-foreground transition-colors">
                  Feedback
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-bold text-lg mb-4 tracking-tight">STAY CONNECTED</h3>
            <div className="flex gap-4">
              <button
                onClick={handleWhatsApp}
                className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-accent transition-colors"
                aria-label="WhatsApp"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
              </button>
              <a
                href="https://www.instagram.com/dhaara_garments?igsh=MW1ibzVveG9yMXVzeg=="
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-accent transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Dhaara Garments. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
