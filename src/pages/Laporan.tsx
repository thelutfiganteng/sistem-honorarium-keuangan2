import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';

export default function Laporan() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Laporan</h1>
            <p className="text-muted-foreground mt-1">
              Export dan cetak laporan pembayaran
            </p>
          </div>
          <Button className="gap-2">
            <FileDown className="h-4 w-4" />
            Export Laporan
          </Button>
        </div>
        
        <div className="text-center py-12 text-muted-foreground">
          Fitur laporan akan segera tersedia
        </div>
      </div>
    </Layout>
  );
}