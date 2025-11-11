-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin_kepegawaian', 'admin_jurusan', 'admin_keuangan');

-- Create enum for status
CREATE TYPE public.status_type AS ENUM ('aktif', 'nonaktif');

-- Create enum for validation status
CREATE TYPE public.validation_status AS ENUM ('pending', 'validated_keuangan', 'validated_kepegawaian', 'validated_jurusan', 'completed');

-- Create user_roles table (security best practice - roles in separate table)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create jurusan table
CREATE TABLE public.jurusan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_jurusan TEXT NOT NULL,
  kode_jurusan TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create pegawai table
CREATE TABLE public.pegawai (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  nip TEXT UNIQUE NOT NULL,
  jabatan TEXT NOT NULL,
  golongan TEXT NOT NULL,
  nomor_rekening TEXT NOT NULL,
  status status_type DEFAULT 'aktif',
  id_jurusan UUID REFERENCES public.jurusan(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create honor_tarif table
CREATE TABLE public.honor_tarif (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jenis_kegiatan TEXT NOT NULL,
  tarif_bruto DECIMAL(15,2) NOT NULL,
  potongan_pajak_persen DECIMAL(5,2) NOT NULL DEFAULT 0,
  tarif_netto DECIMAL(15,2) GENERATED ALWAYS AS (tarif_bruto - (tarif_bruto * potongan_pajak_persen / 100)) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create kegiatan table
CREATE TABLE public.kegiatan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_kegiatan TEXT NOT NULL,
  tanggal DATE NOT NULL,
  jenis_kegiatan TEXT NOT NULL,
  id_jurusan UUID REFERENCES public.jurusan(id),
  id_honor_tarif UUID REFERENCES public.honor_tarif(id),
  status_validasi validation_status DEFAULT 'pending',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create pembayaran table
CREATE TABLE public.pembayaran (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_pegawai UUID REFERENCES public.pegawai(id) NOT NULL,
  id_kegiatan UUID REFERENCES public.kegiatan(id) NOT NULL,
  bruto DECIMAL(15,2) NOT NULL,
  pajak DECIMAL(15,2) NOT NULL,
  netto DECIMAL(15,2) GENERATED ALWAYS AS (bruto - pajak) STORED,
  status_validasi validation_status DEFAULT 'pending',
  tanggal_pembayaran TIMESTAMP WITH TIME ZONE DEFAULT now(),
  validated_by_keuangan UUID REFERENCES auth.users(id),
  validated_by_kepegawaian UUID REFERENCES auth.users(id),
  validated_by_jurusan UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jurusan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pegawai ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.honor_tarif ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kegiatan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pembayaran ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'super_admin')
$$;

-- Create function to get user's jurusan
CREATE OR REPLACE FUNCTION public.get_user_jurusan(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id_jurusan FROM public.pegawai WHERE id = (
    SELECT id FROM public.profiles WHERE id = _user_id
  )
$$;

-- RLS Policies for profiles table
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Super admin can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admin can manage all profiles"
  ON public.profiles FOR ALL
  USING (public.is_super_admin(auth.uid()));

-- RLS Policies for user_roles table
CREATE POLICY "Super admin can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies for jurusan table
CREATE POLICY "Everyone can view jurusan"
  ON public.jurusan FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin kepegawaian and super admin can manage jurusan"
  ON public.jurusan FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin_kepegawaian') OR
    public.is_super_admin(auth.uid())
  );

-- RLS Policies for pegawai table
CREATE POLICY "Everyone can view pegawai"
  ON public.pegawai FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin kepegawaian and super admin can manage pegawai"
  ON public.pegawai FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin_kepegawaian') OR
    public.is_super_admin(auth.uid())
  );

-- RLS Policies for honor_tarif table
CREATE POLICY "Everyone can view tarif"
  ON public.honor_tarif FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin keuangan and super admin can manage tarif"
  ON public.honor_tarif FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin_keuangan') OR
    public.is_super_admin(auth.uid())
  );

-- RLS Policies for kegiatan table
CREATE POLICY "Everyone can view kegiatan"
  ON public.kegiatan FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin kepegawaian can create kegiatan"
  ON public.kegiatan FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin_kepegawaian'));

CREATE POLICY "Admin jurusan can create kegiatan for their jurusan"
  ON public.kegiatan FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin_jurusan') AND
    id_jurusan = public.get_user_jurusan(auth.uid())
  );

CREATE POLICY "Admins can update kegiatan"
  ON public.kegiatan FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin_kepegawaian') OR
    public.has_role(auth.uid(), 'admin_jurusan') OR
    public.is_super_admin(auth.uid())
  );

CREATE POLICY "Super admin can delete kegiatan"
  ON public.kegiatan FOR DELETE
  USING (public.is_super_admin(auth.uid()));

-- RLS Policies for pembayaran table
CREATE POLICY "Everyone can view pembayaran"
  ON public.pembayaran FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin keuangan can create pembayaran"
  ON public.pembayaran FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin_keuangan'));

CREATE POLICY "Admins can update pembayaran"
  ON public.pembayaran FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin_keuangan') OR
    public.has_role(auth.uid(), 'admin_kepegawaian') OR
    public.has_role(auth.uid(), 'admin_jurusan') OR
    public.is_super_admin(auth.uid())
  );

CREATE POLICY "Super admin can delete pembayaran"
  ON public.pembayaran FOR DELETE
  USING (public.is_super_admin(auth.uid()));

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pegawai_updated_at
  BEFORE UPDATE ON public.pegawai
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_honor_tarif_updated_at
  BEFORE UPDATE ON public.honor_tarif
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kegiatan_updated_at
  BEFORE UPDATE ON public.kegiatan
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pembayaran_updated_at
  BEFORE UPDATE ON public.pembayaran
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nama, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nama', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();