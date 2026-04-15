-- Add tracking fields to orders table
ALTER TABLE public.orders 
ADD COLUMN tracking_number text,
ADD COLUMN shipment_updates jsonb DEFAULT '[]'::jsonb;

-- Add refund fields to order_returns table
ALTER TABLE public.order_returns
ADD COLUMN refund_amount numeric,
ADD COLUMN admin_notes text,
ADD COLUMN processed_at timestamp with time zone;

-- Create index for faster queries
CREATE INDEX idx_orders_tracking_number ON public.orders(tracking_number);
CREATE INDEX idx_order_returns_status ON public.order_returns(status);