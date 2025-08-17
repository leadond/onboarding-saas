CREATE TABLE IF NOT EXISTS public.clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    status TEXT DEFAULT 'invited' CHECK (status IN ('invited', 'active', 'completed', 'cancelled')),
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL DEFAULT auth.uid(),
    metadata JSONB DEFAULT '{}',
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    activated_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_owner_id ON public.clients(owner_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their clients" ON public.clients;
CREATE POLICY "Users can view their clients" ON public.clients
    FOR SELECT USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can create clients" ON public.clients;  
CREATE POLICY "Users can create clients" ON public.clients
    FOR INSERT WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their clients" ON public.clients;
CREATE POLICY "Users can update their clients" ON public.clients
    FOR UPDATE USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their clients" ON public.clients;
CREATE POLICY "Users can delete their clients" ON public.clients
    FOR DELETE USING (owner_id = auth.uid());

GRANT ALL ON public.clients TO authenticated;