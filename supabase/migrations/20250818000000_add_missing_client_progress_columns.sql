-- Add missing columns to client_progress table
ALTER TABLE public.client_progress 
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS current_step_id UUID REFERENCES public.kit_steps(id);

-- Create a function to update last_activity_at
CREATE OR REPLACE FUNCTION public.update_last_activity_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_activity_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update last_activity_at
CREATE TRIGGER update_client_progress_last_activity_at
  BEFORE UPDATE ON public.client_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_last_activity_at();