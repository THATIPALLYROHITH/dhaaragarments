-- Create order returns table
CREATE TABLE public.order_returns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.order_returns ENABLE ROW LEVEL SECURITY;

-- RLS Policies for order_returns
CREATE POLICY "Users can create returns for their orders"
ON public.order_returns
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own returns"
ON public.order_returns
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all returns"
ON public.order_returns
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update returns"
ON public.order_returns
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_order_returns_updated_at
BEFORE UPDATE ON public.order_returns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for performance
CREATE INDEX idx_order_returns_order_id ON public.order_returns(order_id);
CREATE INDEX idx_order_returns_user_id ON public.order_returns(user_id);