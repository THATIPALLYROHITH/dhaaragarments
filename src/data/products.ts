import { Product } from "@/types/product";

// T-Shirts
import tshirtBlack from "@/assets/tshirt-black.jpg";
import tshirtWhite from "@/assets/tshirt-white.jpg";
import tshirtNavy from "@/assets/tshirt-navy.jpg";

// Shirts
import shirtWhite from "@/assets/shirt-white.jpg";
import shirtBlue from "@/assets/shirt-blue.jpg";
import shirtBlack from "@/assets/shirt-black.jpg";

// Trousers
import trouserBlack from "@/assets/trouser-black.jpg";
import trouserGrey from "@/assets/trouser-grey.jpg";
import trouserNavy from "@/assets/trouser-navy.jpg";

// Formals
import formalBlack from "@/assets/formal-black.jpg";
import formalNavy from "@/assets/formal-navy.jpg";
import formalGrey from "@/assets/formal-grey.jpg";

// Polos
import poloBlack from "@/assets/polo-black.jpg";
import poloWhite from "@/assets/polo-white.jpg";
import poloRed from "@/assets/polo-red.jpg";

export const products: Product[] = [
  // T-Shirts
  {
    id: "t1",
    name: "CLASSIC BLACK TEE",
    price: 499,
    image: tshirtBlack,
    category: "T-SHIRTS",
    description: "Premium cotton t-shirt with perfect fit and comfort",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "White", "Navy"],
  },
  {
    id: "t2",
    name: "PURE WHITE TEE",
    price: 499,
    image: tshirtWhite,
    category: "T-SHIRTS",
    description: "Crisp white cotton t-shirt for everyday wear",
    sizes: ["S", "M", "L", "XL"],
    colors: ["White", "Black", "Navy"],
  },
  {
    id: "t3",
    name: "NAVY ESSENTIAL TEE",
    price: 499,
    image: tshirtNavy,
    category: "T-SHIRTS",
    description: "Timeless navy t-shirt with superior quality",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Navy", "Black", "White"],
  },

  // Shirts
  {
    id: "s1",
    name: "WHITE FORMAL SHIRT",
    price: 899,
    image: shirtWhite,
    category: "SHIRTS",
    description: "Crisp white formal shirt for professional occasions",
    sizes: ["S", "M", "L", "XL"],
    colors: ["White", "Blue", "Black"],
  },
  {
    id: "s2",
    name: "BLUE DRESS SHIRT",
    price: 899,
    image: shirtBlue,
    category: "SHIRTS",
    description: "Elegant blue shirt perfect for business meetings",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Blue", "White", "Black"],
  },
  {
    id: "s3",
    name: "BLACK FORMAL SHIRT",
    price: 899,
    image: shirtBlack,
    category: "SHIRTS",
    description: "Sophisticated black shirt for formal events",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "White", "Blue"],
  },

  // Trousers
  {
    id: "tr1",
    name: "CLASSIC BLACK TROUSERS",
    price: 1299,
    image: trouserBlack,
    category: "TROUSERS",
    description: "Elegant black trousers with perfect drape",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Grey", "Navy"],
  },
  {
    id: "tr2",
    name: "GREY FORMAL TROUSERS",
    price: 1299,
    image: trouserGrey,
    category: "TROUSERS",
    description: "Versatile grey trousers for professional wear",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Grey", "Black", "Navy"],
  },
  {
    id: "tr3",
    name: "NAVY DRESS TROUSERS",
    price: 1299,
    image: trouserNavy,
    category: "TROUSERS",
    description: "Premium navy trousers with tailored fit",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Navy", "Black", "Grey"],
  },

  // Formals
  {
    id: "f1",
    name: "BLACK EXECUTIVE BLAZER",
    price: 2499,
    image: formalBlack,
    category: "FORMALS",
    description: "Tailored black blazer for sophisticated style",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Navy", "Grey"],
  },
  {
    id: "f2",
    name: "NAVY BUSINESS BLAZER",
    price: 2499,
    image: formalNavy,
    category: "FORMALS",
    description: "Professional navy blazer for corporate occasions",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Navy", "Black", "Grey"],
  },
  {
    id: "f3",
    name: "GREY FORMAL BLAZER",
    price: 2499,
    image: formalGrey,
    category: "FORMALS",
    description: "Elegant grey blazer with premium finish",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Grey", "Black", "Navy"],
  },

  // Polo T-Shirts
  {
    id: "p1",
    name: "BLACK POLO SHIRT",
    price: 699,
    image: poloBlack,
    category: "POLO TSHIRT",
    description: "Classic black polo with refined details",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "White", "Red"],
  },
  {
    id: "p2",
    name: "WHITE POLO SHIRT",
    price: 699,
    image: poloWhite,
    category: "POLO TSHIRT",
    description: "Fresh white polo for casual elegance",
    sizes: ["S", "M", "L", "XL"],
    colors: ["White", "Black", "Red"],
  },
  {
    id: "p3",
    name: "RED POLO SHIRT",
    price: 699,
    image: poloRed,
    category: "POLO TSHIRT",
    description: "Bold red polo shirt for standout style",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Red", "Black", "White"],
  },
];
