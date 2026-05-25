
CREATE TABLE public.affiliate_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  cover_url text,
  commission_pct numeric NOT NULL DEFAULT 0,
  price numeric NOT NULL DEFAULT 0,
  product_type text NOT NULL DEFAULT 'Um Manual',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.affiliate_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage affiliate_products" ON public.affiliate_products FOR ALL USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Authenticated view active products" ON public.affiliate_products FOR SELECT TO authenticated USING (is_active = true);

CREATE TABLE public.affiliations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES public.affiliate_products(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);
ALTER TABLE public.affiliations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage affiliations" ON public.affiliations FOR ALL USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Users view own affiliations" ON public.affiliations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users request own affiliation" ON public.affiliations FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.affiliate_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.affiliate_payouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage payouts" ON public.affiliate_payouts FOR ALL USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Users view own payouts" ON public.affiliate_payouts FOR SELECT USING (auth.uid() = user_id);

CREATE TABLE public.protection_data (
  user_id uuid PRIMARY KEY,
  full_name text,
  document text,
  phone text,
  address text,
  pix_key text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.protection_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage protection" ON public.protection_data FOR ALL USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Users view own protection" ON public.protection_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own protection" ON public.protection_data FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own protection" ON public.protection_data FOR UPDATE USING (auth.uid() = user_id);

INSERT INTO public.affiliate_products (title, cover_url, commission_pct, price, product_type) VALUES
('Saas Express Módulo Iniciante', 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800', 25, 27.90, 'Um Manual'),
('Curso Confiança Plena', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800', 25, 297.80, 'Um Manual'),
('Marketing Digital Pro', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800', 30, 197.00, 'Um Manual'),
('Domine o Instagram', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800', 40, 97.00, 'Um Manual');
