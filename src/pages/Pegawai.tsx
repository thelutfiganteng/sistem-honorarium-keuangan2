import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface Pegawai {
  id: string;
  nip: string;
  nama: string;
  jabatan: string;
  golongan: string;
  nomor_rekening: string;
  id_jurusan: string | null;
  status: 'aktif' | 'nonaktif';
  created_at: string;
  jurusan?: {
    nama_jurusan: string;
  };
}

interface Jurusan {
  id: string;
  nama_jurusan: string;
}

export default function Pegawai() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPegawai, setSelectedPegawai] = useState<Pegawai | null>(null);
  const [formData, setFormData] = useState({
    nip: '',
    nama: '',
    jabatan: '',
    golongan: '',
    nomor_rekening: '',
    id_jurusan: 'none',
    status: 'aktif' as 'aktif' | 'nonaktif',
  });

  const queryClient = useQueryClient();

  // Fetch pegawai with jurusan
  const { data: pegawaiList, isLoading } = useQuery({
    queryKey: ['pegawai'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pegawai')
        .select(`
          *,
          jurusan:id_jurusan (
            nama_jurusan
          )
        `)
        .order('nama');
      
      if (error) throw error;
      return data as Pegawai[];
    },
  });

  // Fetch jurusan list
  const { data: jurusanList } = useQuery({
    queryKey: ['jurusan'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jurusan')
        .select('id, nama_jurusan')
        .order('nama_jurusan');
      
      if (error) throw error;
      return data as Jurusan[];
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from('pegawai').insert([{
        ...data,
        id_jurusan: data.id_jurusan === 'none' ? null : data.id_jurusan,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pegawai'] });
      toast.success('Pegawai berhasil ditambahkan');
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Gagal menambahkan pegawai');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from('pegawai')
        .update({
          ...data,
          id_jurusan: data.id_jurusan === 'none' ? null : data.id_jurusan,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pegawai'] });
      toast.success('Pegawai berhasil diperbarui');
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Gagal memperbarui pegawai');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('pegawai').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pegawai'] });
      toast.success('Pegawai berhasil dihapus');
      setIsDeleteDialogOpen(false);
      setSelectedPegawai(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Gagal menghapus pegawai');
    },
  });

  const handleOpenDialog = (pegawai?: Pegawai) => {
    if (pegawai) {
      setSelectedPegawai(pegawai);
      setFormData({
        nip: pegawai.nip,
        nama: pegawai.nama,
        jabatan: pegawai.jabatan,
        golongan: pegawai.golongan,
        nomor_rekening: pegawai.nomor_rekening,
        id_jurusan: pegawai.id_jurusan || 'none',
        status: pegawai.status,
      });
    } else {
      setSelectedPegawai(null);
      setFormData({
        nip: '',
        nama: '',
        jabatan: '',
        golongan: '',
        nomor_rekening: '',
        id_jurusan: 'none',
        status: 'aktif',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedPegawai(null);
    setFormData({
      nip: '',
      nama: '',
      jabatan: '',
      golongan: '',
      nomor_rekening: '',
      id_jurusan: 'none',
      status: 'aktif',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPegawai) {
      updateMutation.mutate({ id: selectedPegawai.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = () => {
    if (selectedPegawai) {
      deleteMutation.mutate(selectedPegawai.id);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Data Pegawai</h1>
            <p className="text-muted-foreground mt-1">
              Kelola data pegawai kampus
            </p>
          </div>
          <Button className="gap-2" onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4" />
            Tambah Pegawai
          </Button>
        </div>

        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NIP</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Jabatan</TableHead>
                <TableHead>Golongan</TableHead>
                <TableHead>Jurusan</TableHead>
                <TableHead>No. Rekening</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : pegawaiList && pegawaiList.length > 0 ? (
                pegawaiList.map((pegawai) => (
                  <TableRow key={pegawai.id}>
                    <TableCell className="font-medium">{pegawai.nip}</TableCell>
                    <TableCell>{pegawai.nama}</TableCell>
                    <TableCell>{pegawai.jabatan}</TableCell>
                    <TableCell>{pegawai.golongan}</TableCell>
                    <TableCell>
                      {pegawai.jurusan?.nama_jurusan || '-'}
                    </TableCell>
                    <TableCell>{pegawai.nomor_rekening}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          pegawai.status === 'aktif' ? 'default' : 'secondary'
                        }
                      >
                        {pegawai.status === 'aktif' ? 'Aktif' : 'Non-Aktif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(pegawai)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSelectedPegawai(pegawai);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Belum ada data pegawai
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPegawai ? 'Edit Pegawai' : 'Tambah Pegawai'}
            </DialogTitle>
            <DialogDescription>
              {selectedPegawai
                ? 'Perbarui data pegawai'
                : 'Tambahkan pegawai baru'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nip">NIP</Label>
                <Input
                  id="nip"
                  value={formData.nip}
                  onChange={(e) =>
                    setFormData({ ...formData, nip: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Lengkap</Label>
                <Input
                  id="nama"
                  value={formData.nama}
                  onChange={(e) =>
                    setFormData({ ...formData, nama: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jabatan">Jabatan</Label>
                <Input
                  id="jabatan"
                  value={formData.jabatan}
                  onChange={(e) =>
                    setFormData({ ...formData, jabatan: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="golongan">Golongan</Label>
                <Input
                  id="golongan"
                  value={formData.golongan}
                  onChange={(e) =>
                    setFormData({ ...formData, golongan: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jurusan">Jurusan</Label>
                <Select
                  value={formData.id_jurusan}
                  onValueChange={(value) =>
                    setFormData({ ...formData, id_jurusan: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jurusan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak ada</SelectItem>
                    {jurusanList?.map((jurusan) => (
                      <SelectItem key={jurusan.id} value={jurusan.id}>
                        {jurusan.nama_jurusan}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nomor_rekening">Nomor Rekening</Label>
                <Input
                  id="nomor_rekening"
                  value={formData.nomor_rekening}
                  onChange={(e) =>
                    setFormData({ ...formData, nomor_rekening: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'aktif' | 'nonaktif') =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aktif">Aktif</SelectItem>
                    <SelectItem value="nonaktif">Non-Aktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Menyimpan...'
                  : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus pegawai{' '}
              <strong>{selectedPegawai?.nama}</strong>? Tindakan ini tidak dapat
              dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
