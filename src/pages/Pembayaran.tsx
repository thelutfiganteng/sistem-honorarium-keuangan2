import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function Pembayaran() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Data Pembayaran</h1>
            <p className="text-muted-foreground mt-1">
              Kelola pembayaran honorarium
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Tambah Pembayaran
          </Button>
        </div>
        
        <div className="text-center py-12 text-muted-foreground">
          Fitur manajemen pembayaran akan segera tersedia
        </div>
      </div>
    </Layout>
  );
}