-- Create otps table for phone authentication
CREATE TABLE IF NOT EXISTS public.otps (
    phone TEXT PRIMARY KEY,
    otp_hash TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    attempt_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    send_count INTEGER DEFAULT 1 NOT NULL
);

-- Enable RLS
ALTER TABLE public.otps ENABLE ROW LEVEL SECURITY;

-- Service role has full access (backend only)
CREATE POLICY "Service role has full access to otps" ON public.otps
    FOR ALL USING (auth.role() = 'service_role');
