import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
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

// Rate matrix based on position and grade
const RATE_MATRIX = {
  'Penanggung Jawab': {
    '4': { bruto: 450000, pph: 67500, netto: 382500 },
    '3': { bruto: 402500, pph: 20125, netto: 382375 },
    '1-2': { bruto: 382375, pph: 0, netto: 382375 },
  },
  'Ketua': {
    '4': { bruto: 400000, pph: 60000, netto: 340000 },
    '3': { bruto: 357500, pph: 17875, netto: 339625 },
    '1-2': { bruto: 339625, pph: 0, netto: 339625 },
  },
  'Wakil Ketua/Koordinator': {
    '4': { bruto: 350000, pph: 52500, netto: 297500 },
    '3': { bruto: 318000, pph: 15650, netto: 297350 },
    '1-2': { bruto: 297350, pph: 0, netto: 297350 },
  },
  'Sekretaris/Wakil Koordinator': {
    '4': { bruto: 300000, pph: 45000, netto: 255000 },
    '3': { bruto: 268000, pph: 13400, netto: 254600 },
    '1-2': { bruto: 254600, pph: 0, netto: 254600 },
  },
  'Anggota': {
    '4': { bruto: 285000, pph: 42750, netto: 242250 },
    '3': { bruto: 255000, pph: 12750, netto: 242250 },
    '1-2': { bruto: 242250, pph: 0, netto: 242250 },
  },
};

interface PerhitunganInsentif {
  id: string;
  id_pegawai: string;
  jabatan_kepanitiaan: string;
  golongan: string;
  tarif_bruto: number;
  pph_pasal_21: number;
  pendapatan_netto: number;
  jumlah_hari: number;
  total_insentif: number;
  status_validasi: 'pending' | 'validated_keuangan' | 'validated_kepegawaian' | 'validated_jurusan' | 'completed';
  validated_by_jurusan: string | null;
  validated_by_kepegawaian: string | null;
  created_at: string;
  pegawai: {
    nama: string;
    golongan: string;
  };
}

interface Pegawai {
  id: string;
  nama: string;
  golongan: string;
}

export default function Tarif() {
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedInsentif, setSelectedInsentif] = useState<PerhitunganInsentif | null>(null);
  
  const [formData, setFormData] = useState({
    id_pegawai: '',
    jabatan_kepanitiaan: '',
    golongan: '',
    jumlah_hari: 1,
  });

  const canCreate = userRole === 'super_admin' || userRole === 'admin_keuangan';
  const canValidateJurusan = userRole === 'super_admin' || userRole === 'admin_jurusan';
  const canValidateKepegawaian = userRole === 'super_admin' || userRole === 'admin_kepegawaian';

  // Fetch incentive calculations
  const { data: insentifList = [], isLoading } = useQuery({
    queryKey: ['perhitungan-insentif'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('perhitungan_insentif')
        .select(`
          *,
          pegawai:id_pegawai (
            nama,
            golongan
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PerhitunganInsentif[];
    },
  });

  // Fetch pegawai list for dropdown
  const { data: pegawaiList = [] } = useQuery({
    queryKey: ['pegawai-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pegawai')
        .select('id, nama, golongan')
        .eq('status', 'aktif')
        .order('nama');

      if (error) throw error;
      return data as Pegawai[];
    },
  });

  // Create mutation
  const createInsentifMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const rates = RATE_MATRIX[data.jabatan_kepanitiaan as keyof typeof RATE_MATRIX]?.[data.golongan as '4' | '3' | '1-2'];
      
      if (!rates) throw new Error('Invalid position or grade combination');

      const totalInsentif = rates.netto * data.jumlah_hari;

      const { error } = await supabase
        .from('perhitungan_insentif')
        .insert({
          id_pegawai: data.id_pegawai,
          jabatan_kepanitiaan: data.jabatan_kepanitiaan,
          golongan: data.golongan,
          tarif_bruto: rates.bruto,
          pph_pasal_21: rates.pph,
          pendapatan_netto: rates.netto,
          jumlah_hari: data.jumlah_hari,
          total_insentif: totalInsentif,
          created_by: user?.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['perhitungan-insentif'] });
      toast({
        title: 'Berhasil',
        description: 'Perhitungan insentif berhasil ditambahkan',
      });
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Validate mutation
  const validateMutation = useMutation({
    mutationFn: async ({ id, type }: { id: string; type: 'jurusan' | 'kepegawaian' }) => {
      const insentif = insentifList.find(i => i.id === id);
      if (!insentif) throw new Error('Data not found');

      const updateData: any = {};
      
      if (type === 'jurusan') {
        updateData.validated_by_jurusan = user?.id;
        // Check if kepegawaian already validated
        if (insentif.validated_by_kepegawaian) {
          updateData.status_validasi = 'completed';
        } else {
          updateData.status_validasi = 'validated_jurusan';
        }
      } else if (type === 'kepegawaian') {
        updateData.validated_by_kepegawaian = user?.id;
        // Check if jurusan already validated
        if (insentif.validated_by_jurusan) {
          updateData.status_validasi = 'completed';
        } else {
          updateData.status_validasi = 'validated_kepegawaian';
        }
      }

      const { error } = await supabase
        .from('perhitungan_insentif')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['perhitungan-insentif'] });
      toast({
        title: 'Berhasil',
        description: 'Validasi berhasil dilakukan',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete mutation
  const deleteInsentifMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('perhitungan_insentif')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['perhitungan-insentif'] });
      toast({
        title: 'Berhasil',
        description: 'Data berhasil dihapus',
      });
      setIsDeleteDialogOpen(false);
      setSelectedInsentif(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleOpenDialog = () => {
    setFormData({
      id_pegawai: '',
      jabatan_kepanitiaan: '',
      golongan: '',
      jumlah_hari: 1,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData({
      id_pegawai: '',
      jabatan_kepanitiaan: '',
      golongan: '',
      jumlah_hari: 1,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createInsentifMutation.mutate(formData);
  };

  const handleValidate = (id: string, type: 'jurusan' | 'kepegawaian') => {
    validateMutation.mutate({ id, type });
  };

  const handleDelete = () => {
    if (selectedInsentif) {
      deleteInsentifMutation.mutate(selectedInsentif.id);
    }
  };

  const getStatusBadge = (insentif: PerhitunganInsentif) => {
    if (insentif.status_validasi === 'completed') {
      return <Badge className="bg-green-500">🟢 Tercatat/Selesai</Badge>;
    }
    
    if (insentif.status_validasi === 'validated_jurusan' || insentif.status_validasi === 'validated_kepegawaian') {
      return <Badge className="bg-orange-500">🟠 Divalidasi Sebagian</Badge>;
    }
    
    return <Badge className="bg-yellow-500">🟡 Menunggu Validasi</Badge>;
  };

  const calculateRates = () => {
    if (formData.jabatan_kepanitiaan && formData.golongan) {
      const rates = RATE_MATRIX[formData.jabatan_kepanitiaan as keyof typeof RATE_MATRIX]?.[formData.golongan as '4' | '3' | '1-2'];
      return rates;
    }
    return null;
  };

  const rates = calculateRates();
  const totalInsentif = rates ? rates.netto * formData.jumlah_hari : 0;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Perhitungan Insentif Honorarium</h1>
            <p className="text-muted-foreground mt-1">
              Kelola perhitungan insentif berdasarkan jabatan dan golongan
            </p>
          </div>
          {canCreate && (
            <Button onClick={handleOpenDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              Tambah Perhitungan
            </Button>
          )}
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Pegawai</TableHead>
                <TableHead>Jabatan Kepanitiaan</TableHead>
                <TableHead>Golongan</TableHead>
                <TableHead className="text-right">Tarif Bruto</TableHead>
                <TableHead className="text-right">PPh Pasal 21</TableHead>
                <TableHead className="text-right">Pendapatan Netto</TableHead>
                <TableHead className="text-center">Jumlah Hari</TableHead>
                <TableHead className="text-right">Total Insentif</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : insentifList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    Belum ada data perhitungan insentif
                  </TableCell>
                </TableRow>
              ) : (
                insentifList.map((insentif) => (
                  <TableRow key={insentif.id}>
                    <TableCell className="font-medium">{insentif.pegawai.nama}</TableCell>
                    <TableCell>{insentif.jabatan_kepanitiaan}</TableCell>
                    <TableCell>{insentif.golongan}</TableCell>
                    <TableCell className="text-right">
                      Rp {insentif.tarif_bruto.toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell className="text-right">
                      Rp {insentif.pph_pasal_21.toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell className="text-right">
                      Rp {insentif.pendapatan_netto.toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell className="text-center">{insentif.jumlah_hari}</TableCell>
                    <TableCell className="text-right font-semibold">
                      Rp {insentif.total_insentif.toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell>{getStatusBadge(insentif)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2 justify-center">
                        {canValidateJurusan && !insentif.validated_by_jurusan && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleValidate(insentif.id, 'jurusan')}
                            className="gap-1"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Validasi Jurusan
                          </Button>
                        )}
                        {canValidateKepegawaian && !insentif.validated_by_kepegawaian && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleValidate(insentif.id, 'kepegawaian')}
                            className="gap-1"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Validasi Kepegawaian
                          </Button>
                        )}
                        {userRole === 'super_admin' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedInsentif(insentif);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Add Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tambah Perhitungan Insentif</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="id_pegawai">Pegawai</Label>
                  <Select
                    value={formData.id_pegawai}
                    onValueChange={(value) => setFormData({ ...formData, id_pegawai: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih pegawai" />
                    </SelectTrigger>
                    <SelectContent>
                      {pegawaiList.map((pegawai) => (
                        <SelectItem key={pegawai.id} value={pegawai.id}>
                          {pegawai.nama} - Gol. {pegawai.golongan}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jabatan_kepanitiaan">Jabatan Kepanitiaan</Label>
                  <Select
                    value={formData.jabatan_kepanitiaan}
                    onValueChange={(value) => setFormData({ ...formData, jabatan_kepanitiaan: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jabatan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Penanggung Jawab">Penanggung Jawab</SelectItem>
                      <SelectItem value="Ketua">Ketua</SelectItem>
                      <SelectItem value="Wakil Ketua/Koordinator">Wakil Ketua/Koordinator</SelectItem>
                      <SelectItem value="Sekretaris/Wakil Koordinator">Sekretaris/Wakil Koordinator</SelectItem>
                      <SelectItem value="Anggota">Anggota</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="golongan">Golongan</Label>
                  <Select
                    value={formData.golongan}
                    onValueChange={(value) => setFormData({ ...formData, golongan: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih golongan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">Golongan 4</SelectItem>
                      <SelectItem value="3">Golongan 3</SelectItem>
                      <SelectItem value="1-2">Golongan 1 dan 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jumlah_hari">Jumlah Hari</Label>
                  <Input
                    id="jumlah_hari"
                    type="number"
                    min="1"
                    value={formData.jumlah_hari}
                    onChange={(e) => setFormData({ ...formData, jumlah_hari: parseInt(e.target.value) || 1 })}
                    required
                  />
                </div>
              </div>

              {rates && (
                <div className="border rounded-lg p-4 bg-muted/50 space-y-2">
                  <h3 className="font-semibold">Perhitungan Otomatis:</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Tarif Bruto:</span>
                      <p className="font-semibold">Rp {rates.bruto.toLocaleString('id-ID')}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">PPh Pasal 21:</span>
                      <p className="font-semibold">Rp {rates.pph.toLocaleString('id-ID')}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Pendapatan Netto:</span>
                      <p className="font-semibold">Rp {rates.netto.toLocaleString('id-ID')}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Insentif:</span>
                      <p className="font-semibold text-lg">Rp {totalInsentif.toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Batal
                </Button>
                <Button type="submit" disabled={createInsentifMutation.isPending}>
                  {createInsentifMutation.isPending ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Perhitungan Insentif</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus perhitungan insentif untuk{' '}
                <strong>{selectedInsentif?.pegawai.nama}</strong>? Tindakan ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}