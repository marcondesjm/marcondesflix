DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum
    WHERE enumlabel = 'producer'
      AND enumtypid = 'public.app_role'::regtype
  ) THEN
    ALTER TYPE public.app_role ADD VALUE 'producer';
  END IF;
END $$;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS account_type TEXT NOT NULL DEFAULT 'student'
  CHECK (account_type IN ('student', 'producer'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  selected_type TEXT := COALESCE(NEW.raw_user_meta_data ->> 'account_type', 'student');
BEGIN
  IF selected_type NOT IN ('student', 'producer') THEN
    selected_type := 'student';
  END IF;

  INSERT INTO public.profiles (id, full_name, account_type)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', selected_type);

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student')
  ON CONFLICT (user_id, role) DO NOTHING;

  IF selected_type = 'producer' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'producer')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS public.producer_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  cover_url TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  headline TEXT,
  benefits TEXT[] NOT NULL DEFAULT '{}',
  checkout_button TEXT NOT NULL DEFAULT 'Comprar agora',
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.producer_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone views published producer products" ON public.producer_products;
CREATE POLICY "Anyone views published producer products"
ON public.producer_products FOR SELECT
USING (is_published = true);

DROP POLICY IF EXISTS "Owners view own producer products" ON public.producer_products;
CREATE POLICY "Owners view own producer products"
ON public.producer_products FOR SELECT TO authenticated
USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Producers create own products" ON public.producer_products;
CREATE POLICY "Producers create own products"
ON public.producer_products FOR INSERT TO authenticated
WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners update own producer products" ON public.producer_products;
CREATE POLICY "Owners update own producer products"
ON public.producer_products FOR UPDATE TO authenticated
USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Owners delete own producer products" ON public.producer_products;
CREATE POLICY "Owners delete own producer products"
ON public.producer_products FOR DELETE TO authenticated
USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS producer_products_updated_at ON public.producer_products;
CREATE TRIGGER producer_products_updated_at BEFORE UPDATE ON public.producer_products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.producer_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.producer_products(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.producer_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone creates producer orders" ON public.producer_orders;
CREATE POLICY "Anyone creates producer orders"
ON public.producer_orders FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Product owners view orders" ON public.producer_orders;
CREATE POLICY "Product owners view orders"
ON public.producer_orders FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.producer_products p
    WHERE p.id = producer_orders.product_id
      AND (p.owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  )
);
