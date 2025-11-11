-- Add keterangan field to jurusan table
ALTER TABLE public.jurusan ADD COLUMN IF NOT EXISTS keterangan TEXT;

-- Add nama_jabatan and keterangan to honor_tarif table
ALTER TABLE public.honor_tarif ADD COLUMN IF NOT EXISTS nama_jabatan TEXT;
ALTER TABLE public.honor_tarif ADD COLUMN IF NOT EXISTS keterangan TEXT;

-- Add trigger for updated_at on jurusan
CREATE TRIGGER update_jurusan_updated_at
  BEFORE UPDATE ON public.jurusan
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();