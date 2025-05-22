-- Supabase Migration: Initial Schema

-- Create the 'etfs' table
CREATE TABLE public.etfs (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    symbol text NOT NULL,
    name text,
    description text,
    category text,
    exchange text,
    inception_date date,
    total_assets numeric,
    volume numeric,
    ten_year_return numeric,
    returns_12m numeric,
    returns_24m numeric,
    returns_36m numeric,
    volatility_12m numeric,
    volatility_24m numeric,
    volatility_36m numeric,
    ten_year_volatility numeric,
    sharpe_12m numeric,
    sharpe_24m numeric,
    sharpe_36m numeric,
    ten_year_sharpe numeric,
    max_drawdown numeric,
    dividends_12m numeric,
    dividends_24m numeric,
    dividends_36m numeric,
    dividends_all_time numeric,
    dividend_yield numeric,
    start_date date,
    end_date date,
    updated_at timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX idx_etfs_symbol ON public.etfs USING btree (symbol);
ALTER TABLE public.etfs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public etfs are viewable by everyone." ON public.etfs FOR SELECT USING (true);
CREATE POLICY "Users can insert their own etfs." ON public.etfs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL); -- Adjust if only admins can insert
CREATE POLICY "Users can update their own etfs." ON public.etfs FOR UPDATE USING (auth.uid() IS NOT NULL); -- Adjust if only admins can update

-- Create the 'profiles' table (extending Supabase Auth users)
CREATE TABLE public.profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    updated_at timestamptz DEFAULT now(),
    plan text DEFAULT 'free'::text,
    ref_code text UNIQUE,
    referred_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    lifetime boolean DEFAULT false,
    stripe_customer_id text UNIQUE,
    stripe_subscription_id text UNIQUE,
    stripe_price_id text,
    stripe_current_period_end timestamptz
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by users who created them." ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Function to create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, ref_code)
  VALUES (new.id, gen_random_uuid()); -- Or a more sophisticated ref_code generation
  RETURN new;
END;
$$;

-- Trigger to call the function when a new user is created in auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create the 'affiliates' table (placeholder for now)
CREATE TABLE public.affiliates (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    ref_code text NOT NULL UNIQUE, -- This is the affiliate's own referral code they share
    created_at timestamptz DEFAULT now(),
    -- Potentially add columns for tracking clicks, signups, revenue share, etc.
    total_referred integer DEFAULT 0,
    total_revenue_generated numeric DEFAULT 0
);
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
-- Define RLS policies for affiliates as needed
CREATE POLICY "Affiliates can view their own data." ON public.affiliates FOR SELECT USING (auth.uid() = user_id);

-- Create the 'presets' table (placeholder for now, for Pro+ users)
CREATE TABLE public.presets (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name text NOT NULL,
    filters jsonb NOT NULL, -- Store filter criteria as JSON
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.presets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own presets." ON public.presets FOR ALL USING (auth.uid() = user_id);

-- Create the 'lifetime_codes' table (placeholder for AppSumo, outside MVP)
CREATE TABLE public.lifetime_codes (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY, -- This is the unique code itself
    is_redeemed boolean DEFAULT false,
    redeemed_at timestamptz,
    redeemed_by_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now()
);
ALTER TABLE public.lifetime_codes ENABLE ROW LEVEL SECURITY;
-- Define RLS policies for lifetime_codes as needed (likely admin only for insert/update)
CREATE POLICY "Admins can manage lifetime codes." ON public.lifetime_codes FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND plan = 'admin')); -- Example admin check

-- RPC function for filtering ETFs (to be refined)
CREATE OR REPLACE FUNCTION rpc_filter_etfs(params jsonb)
RETURNS SETOF public.etfs AS $$
BEGIN
  -- Basic implementation, to be expanded with dynamic filters from params
  RETURN QUERY SELECT * FROM public.etfs;
END;
$$ LANGUAGE plpgsql STABLE;

-- Storage policies (example, adjust as needed)
-- Create a bucket for ETF spreadsheets if it doesn't exist
-- This would typically be done via Supabase UI or another script, but for completeness:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('etf_spreadsheets', 'etf_spreadsheets', false) ON CONFLICT (id) DO NOTHING;

-- Policy: Allow authenticated users to upload to 'etf_spreadsheets' bucket (admin only)
-- This needs to be created in the Supabase dashboard under Storage -> Policies
-- Example (conceptual, actual policy creation is UI-driven or via specific Supabase client commands):
-- CREATE POLICY "Admin uploads for etf_spreadsheets" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'etf_spreadsheets' AND (SELECT plan FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Seed initial data (optional, for testing)
-- INSERT INTO public.etfs (symbol, name, category) VALUES ('IVV', 'iShares CORE S&P 500 ETF', 'US Equity');
-- INSERT INTO public.etfs (symbol, name, category) VALUES ('IXN', 'iShares Global Tech ETF', 'Global Equity');


