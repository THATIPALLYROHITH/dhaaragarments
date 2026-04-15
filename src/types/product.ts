export type Size = "S" | "M" | "L" | "XL";
export type Color = "Black" | "White" | "Navy" | "Grey" | "Red" | "Blue" | "Green";

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  sizes: Size[];
  colors: Color[];
  images?: string[];
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: Size;
  selectedColor?: Color;
}
