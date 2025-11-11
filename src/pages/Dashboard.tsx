import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, DollarSign, CheckCircle } from 'lucide-react';

export default function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [pegawaiCount, kegiatanCount, pembayaranData] = await Promise.all([
        supabase.from('pegawai').select('*', { count: 'exact', head: true }),
        supabase.from('kegiatan').select('*', { count: 'exact', head: true }),
        supabase.from('pembayaran').select('netto, status_validasi'),
      ]);

      const totalHonor = pembayaranData.data?.reduce((sum, item) => sum + Number(item.netto || 0), 0) || 0;
      const validatedCount = pembayaranData.data?.filter(
        item => item.status_validasi === 'completed'
      ).length || 0;

      return {
        pegawai: pegawaiCount.count || 0,
        kegiatan: kegiatanCount.count || 0,
        totalHonor,
        validated: validatedCount,
      };
    },
  });

  const statCards = [
    {
      title: 'Total Pegawai',
      value: stats?.pegawai || 0,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Kegiatan Aktif',
      value: stats?.kegiatan || 0,
      icon: Calendar,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Total Honor',
      value: `Rp ${(stats?.totalHonor || 0).toLocaleString('id-ID')}`,
      icon: DollarSign,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Pembayaran Tervalidasi',
      value: stats?.validated || 0,
      icon: CheckCircle,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Ringkasan sistem perhitungan honorarium
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Selamat Datang di Sistem Honorarium</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Sistem ini dirancang untuk mengelola perhitungan honorarium kampus dengan fitur:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Manajemen data pegawai dan jurusan</li>
            <li>Pengaturan tarif honorarium berdasarkan jenis kegiatan</li>
            <li>Pencatatan kegiatan dan pembayaran</li>
            <li>Perhitungan otomatis pajak PPh Pasal 21</li>
            <li>Workflow validasi bertingkat (Keuangan → Kepegawaian → Jurusan)</li>
            <li>Laporan dan export data pembayaran</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}