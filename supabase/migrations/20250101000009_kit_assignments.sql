-- Kit assignments table to link clients to kits
CREATE TABLE IF NOT EXISTS public.kit_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    kit_id UUID REFERENCES public.kits(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
    assigned_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'started', 'completed', 'cancelled')),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    custom_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(kit_id, client_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_kit_assignments_kit_id ON public.kit_assignments(kit_id);
CREATE INDEX IF NOT EXISTS idx_kit_assignments_client_id ON public.kit_assignments(client_id);
CREATE INDEX IF NOT EXISTS idx_kit_assignments_assigned_by ON public.kit_assignments(assigned_by);
CREATE INDEX IF NOT EXISTS idx_kit_assignments_status ON public.kit_assignments(status);

-- Enable RLS
ALTER TABLE public.kit_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view assignments for their kits" ON public.kit_assignments
    FOR SELECT USING (
        assigned_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.kits 
            WHERE kits.id = kit_assignments.kit_id AND kits.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create assignments for their kits" ON public.kit_assignments
    FOR INSERT WITH CHECK (
        assigned_by = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.kits 
            WHERE kits.id = kit_assignments.kit_id AND kits.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update assignments for their kits" ON public.kit_assignments
    FOR UPDATE USING (
        assigned_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.kits 
            WHERE kits.id = kit_assignments.kit_id AND kits.user_id = auth.uid()
        )
    );

-- Grant permissions
GRANT ALL ON public.kit_assignments TO authenticated;