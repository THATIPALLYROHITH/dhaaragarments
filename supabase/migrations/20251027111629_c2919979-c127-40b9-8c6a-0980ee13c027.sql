-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric NOT NULL,
  category text NOT NULL,
  description text,
  image text,
  stock_count integer NOT NULL DEFAULT 0,
  barcode text UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create discounts table
CREATE TABLE IF NOT EXISTS public.discounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  percentage numeric NOT NULL,
  applies_to text, -- 'all', 'category', or specific product ids (json array)
  expires_at timestamp with time zone,
  usage_count integer DEFAULT 0,
  max_usage integer,
  created_at timestamp with time zone DEFAULT now()
);

-- Create admin activity logs table
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id) NOT NULL,
  action text NOT NULL,
  details jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Create shop settings table
CREATE TABLE IF NOT EXISTS public.shop_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_name text DEFAULT 'Dhaara Garments',
  shop_logo text,
  contact_email text,
  contact_phone text,
  tax_rate numeric DEFAULT 0,
  delivery_charge numeric DEFAULT 0,
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_settings ENABLE ROW LEVEL SECURITY;

-- Products policies
CREATE POLICY "Anyone can view products"
  ON public.products FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Discounts policies
CREATE POLICY "Admins can manage discounts"
  ON public.discounts FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active discounts"
  ON public.discounts FOR SELECT
  USING (expires_at IS NULL OR expires_at > now());

-- Admin logs policies
CREATE POLICY "Admins can view logs"
  ON public.admin_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert logs"
  ON public.admin_logs FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Shop settings policies
CREATE POLICY "Anyone can view shop settings"
  ON public.shop_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage shop settings"
  ON public.shop_settings FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default shop settings
INSERT INTO public.shop_settings (shop_name, tax_rate, delivery_charge)
VALUES ('Dhaara Garments', 0, 50)
ON CONFLICT DO NOTHING;

-- Create trigger for updating updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shop_settings_updated_at
  BEFORE UPDATE ON public.shop_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate barcode
CREATE OR REPLACE FUNCTION generate_barcode()
RETURNS text AS $$
BEGIN
  RETURN 'DG' || LPAD(FLOOR(RANDOM() * 1000000000)::text, 10, '0');
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate barcode for products
CREATE OR REPLACE FUNCTION set_product_barcode()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.barcode IS NULL THEN
    NEW.barcode := generate_barcode();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_product_barcode
  BEFORE INSERT ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION set_product_barcode();