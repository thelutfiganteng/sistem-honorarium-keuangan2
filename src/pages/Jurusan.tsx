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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Jurusan {
  id: string;
  kode_jurusan: string;
  nama_jurusan: string;
  keterangan: string | null;
  created_at: string;
}

export default function Jurusan() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedJurusan, setSelectedJurusan] = useState<Jurusan | null>(null);
  const [formData, setFormData] = useState({
    kode_jurusan: '',
    nama_jurusan: '',
    keterangan: '',
  });

  const queryClient = useQueryClient();

  // Fetch jurusan
  const { data: jurusanList, isLoading } = useQuery({
    queryKey: ['jurusan'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jurusan')
        .select('*')
        .order('nama_jurusan');
      
      if (error) throw error;
      return data as Jurusan[];
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from('jurusan').insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jurusan'] });
      toast.success('Jurusan berhasil ditambahkan');
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Gagal menambahkan jurusan');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from('jurusan')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jurusan'] });
      toast.success('Jurusan berhasil diperbarui');
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Gagal memperbarui jurusan');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('jurusan').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jurusan'] });
      toast.success('Jurusan berhasil dihapus');
      setIsDeleteDialogOpen(false);
      setSelectedJurusan(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Gagal menghapus jurusan');
    },
  });

  const handleOpenDialog = (jurusan?: Jurusan) => {
    if (jurusan) {
      setSelectedJurusan(jurusan);
      setFormData({
        kode_jurusan: jurusan.kode_jurusan,
        nama_jurusan: jurusan.nama_jurusan,
        keterangan: jurusan.keterangan || '',
      });
    } else {
      setSelectedJurusan(null);
      setFormData({
        kode_jurusan: '',
        nama_jurusan: '',
        keterangan: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedJurusan(null);
    setFormData({
      kode_jurusan: '',
      nama_jurusan: '',
      keterangan: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedJurusan) {
      updateMutation.mutate({ id: selectedJurusan.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = () => {
    if (selectedJurusan) {
      deleteMutation.mutate(selectedJurusan.id);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Data Jurusan</h1>
            <p className="text-muted-foreground mt-1">
              Kelola data jurusan
            </p>
          </div>
          <Button className="gap-2" onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4" />
            Tambah Jurusan
          </Button>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode Jurusan</TableHead>
                <TableHead>Nama Jurusan</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : jurusanList && jurusanList.length > 0 ? (
                jurusanList.map((jurusan) => (
                  <TableRow key={jurusan.id}>
                    <TableCell className="font-medium">
                      {jurusan.kode_jurusan}
                    </TableCell>
                    <TableCell>{jurusan.nama_jurusan}</TableCell>
                    <TableCell>{jurusan.keterangan || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(jurusan)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSelectedJurusan(jurusan);
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
                  <TableCell colSpan={4} className="text-center py-8">
                    Belum ada data jurusan
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedJurusan ? 'Edit Jurusan' : 'Tambah Jurusan'}
            </DialogTitle>
            <DialogDescription>
              {selectedJurusan
                ? 'Perbarui data jurusan'
                : 'Tambahkan jurusan baru'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="kode_jurusan">Kode Jurusan</Label>
                <Input
                  id="kode_jurusan"
                  value={formData.kode_jurusan}
                  onChange={(e) =>
                    setFormData({ ...formData, kode_jurusan: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nama_jurusan">Nama Jurusan</Label>
                <Input
                  id="nama_jurusan"
                  value={formData.nama_jurusan}
                  onChange={(e) =>
                    setFormData({ ...formData, nama_jurusan: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="keterangan">Keterangan</Label>
                <Textarea
                  id="keterangan"
                  value={formData.keterangan}
                  onChange={(e) =>
                    setFormData({ ...formData, keterangan: e.target.value })
                  }
                  rows={3}
                />
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
              Apakah Anda yakin ingin menghapus jurusan{' '}
              <strong>{selectedJurusan?.nama_jurusan}</strong>? Tindakan ini
              tidak dapat dibatalkan.
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