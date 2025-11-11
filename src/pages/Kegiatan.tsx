import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Plus, Eye } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

interface KegiatanWithDetails {
  id: string;
  nama_kegiatan: string;
  jenis_kegiatan: string;
  tanggal: string;
  status_validasi: 'pending' | 'validated_keuangan' | 'validated_kepegawaian' | 'validated_jurusan' | 'completed';
  jurusan: {
    nama_jurusan: string;
  } | null;
}

interface InsentifDetail {
  id: string;
  pegawai: {
    nama: string;
    golongan: string;
  };
  jabatan_kepanitiaan: string;
  total_insentif: number;
  status_validasi: string;
}

export default function Kegiatan() {
  const { userRole } = useAuth();
  const [selectedKegiatan, setSelectedKegiatan] = useState<KegiatanWithDetails | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const canManage = userRole === 'super_admin';

  // Fetch kegiatan list
  const { data: kegiatanList = [], isLoading } = useQuery({
    queryKey: ['kegiatan-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kegiatan')
        .select(`
          *,
          jurusan:id_jurusan (
            nama_jurusan
          )
        `)
        .order('tanggal', { ascending: false });

      if (error) throw error;
      return data as KegiatanWithDetails[];
    },
  });

  // Fetch insentif details for selected kegiatan
  const { data: insentifDetails = [] } = useQuery({
    queryKey: ['kegiatan-insentif-details', selectedKegiatan?.id],
    queryFn: async () => {
      if (!selectedKegiatan) return [];

      const { data, error } = await supabase
        .from('perhitungan_insentif')
        .select(`
          *,
          pegawai:id_pegawai (
            nama,
            golongan
          )
        `)
        .eq('status_validasi', 'completed');

      if (error) throw error;
      return data as InsentifDetail[];
    },
    enabled: !!selectedKegiatan,
  });

  const handleViewDetails = (kegiatan: KegiatanWithDetails) => {
    setSelectedKegiatan(kegiatan);
    setIsDetailDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    if (status === 'completed') {
      return <Badge className="bg-green-500">🟢 Tercatat/Selesai</Badge>;
    }
    if (status === 'validated_jurusan' || status === 'validated_kepegawaian') {
      return <Badge className="bg-orange-500">🟠 Divalidasi Sebagian</Badge>;
    }
    return <Badge className="bg-yellow-500">🟡 Menunggu Validasi</Badge>;
  };

  const totalHonorarium = insentifDetails.reduce(
    (sum, item) => sum + Number(item.total_insentif),
    0
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Data Kegiatan</h1>
            <p className="text-muted-foreground mt-1">
              Kelola kegiatan honorarium
            </p>
          </div>
          {canManage && (
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Tambah Kegiatan
            </Button>
          )}
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Kegiatan</TableHead>
                <TableHead>Jenis Kegiatan</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Jurusan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : kegiatanList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Belum ada data kegiatan
                  </TableCell>
                </TableRow>
              ) : (
                kegiatanList.map((kegiatan) => (
                  <TableRow key={kegiatan.id}>
                    <TableCell className="font-medium">{kegiatan.nama_kegiatan}</TableCell>
                    <TableCell>{kegiatan.jenis_kegiatan}</TableCell>
                    <TableCell>
                      {format(new Date(kegiatan.tanggal), 'dd MMMM yyyy', { locale: localeId })}
                    </TableCell>
                    <TableCell>{kegiatan.jurusan?.nama_jurusan || '-'}</TableCell>
                    <TableCell>{getStatusBadge(kegiatan.status_validasi)}</TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(kegiatan)}
                        className="gap-2"
                      >
                        <Eye className="h-3 w-3" />
                        Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Detail Kegiatan: {selectedKegiatan?.nama_kegiatan}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Jenis Kegiatan</p>
                  <p className="font-medium">{selectedKegiatan?.jenis_kegiatan}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tanggal Pelaksanaan</p>
                  <p className="font-medium">
                    {selectedKegiatan && format(new Date(selectedKegiatan.tanggal), 'dd MMMM yyyy', { locale: localeId })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Jurusan</p>
                  <p className="font-medium">{selectedKegiatan?.jurusan?.nama_jurusan || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1">{selectedKegiatan && getStatusBadge(selectedKegiatan.status_validasi)}</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Daftar Pegawai & Honorarium Tervalidasi</h3>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama Pegawai</TableHead>
                        <TableHead>Golongan</TableHead>
                        <TableHead>Jabatan</TableHead>
                        <TableHead className="text-right">Total Insentif</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {insentifDetails.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                            Belum ada data honorarium tervalidasi
                          </TableCell>
                        </TableRow>
                      ) : (
                        insentifDetails.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.pegawai.nama}</TableCell>
                            <TableCell>{item.pegawai.golongan}</TableCell>
                            <TableCell>{item.jabatan_kepanitiaan}</TableCell>
                            <TableCell className="text-right">
                              Rp {Number(item.total_insentif).toLocaleString('id-ID')}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                      {insentifDetails.length > 0 && (
                        <TableRow className="font-bold bg-muted">
                          <TableCell colSpan={3} className="text-right">Total Honorarium:</TableCell>
                          <TableCell className="text-right">
                            Rp {totalHonorarium.toLocaleString('id-ID')}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}