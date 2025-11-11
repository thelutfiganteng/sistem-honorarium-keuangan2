-- Create table for incentive calculations
CREATE TABLE IF NOT EXISTS public.perhitungan_insentif (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  id_pegawai UUID NOT NULL REFERENCES public.pegawai(id) ON DELETE CASCADE,
  jabatan_kepanitiaan TEXT NOT NULL,
  golongan TEXT NOT NULL,
  tarif_bruto NUMERIC NOT NULL,
  pph_pasal_21 NUMERIC NOT NULL DEFAULT 0,
  pendapatan_netto NUMERIC NOT NULL,
  jumlah_hari INTEGER NOT NULL DEFAULT 1,
  total_insentif NUMERIC NOT NULL,
  status_validasi validation_status DEFAULT 'pending',
  validated_by_jurusan UUID REFERENCES auth.users(id),
  validated_by_kepegawaian UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.perhitungan_insentif ENABLE ROW LEVEL SECURITY;

-- Everyone can view incentive calculations
CREATE POLICY "Everyone can view incentive calculations"
ON public.perhitungan_insentif
FOR SELECT
USING (true);

-- Admin Keuangan can create calculations
CREATE POLICY "Admin keuangan can create calculations"
ON public.perhitungan_insentif
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin_keuangan'::app_role) OR is_super_admin(auth.uid()));

-- Admins can update calculations (for validation)
CREATE POLICY "Admins can update calculations"
ON public.perhitungan_insentif
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin_keuangan'::app_role) OR
  has_role(auth.uid(), 'admin_kepegawaian'::app_role) OR
  has_role(auth.uid(), 'admin_jurusan'::app_role) OR
  is_super_admin(auth.uid())
);

-- Super admin can delete calculations
CREATE POLICY "Super admin can delete calculations"
ON public.perhitungan_insentif
FOR DELETE
USING (is_super_admin(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_perhitungan_insentif_updated_at
BEFORE UPDATE ON public.perhitungan_insentif
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();