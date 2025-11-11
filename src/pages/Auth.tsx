import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { z } from 'zod';
import { Building2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Email tidak valid').trim(),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate input
      loginSchema.parse({ email, password });
      
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Email atau password salah');
        } else {
          toast.error('Gagal login: ' + error.message);
        }
        return;
      }

      if (data.user) {
        toast.success('Berhasil login!');
        navigate('/');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error('Terjadi kesalahan');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInitialAdmin = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-initial-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Super admin berhasil dibuat! Silakan login.');
      } else {
        toast.error(data.error || 'Gagal membuat super admin');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <Building2 className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl">Sistem Honorarium</CardTitle>
            <CardDescription>
              Masuk ke sistem perhitungan honorarium kampus
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@kampus.ac.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Memproses...' : 'Masuk'}
            </Button>
          </form>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              {/* <span className="bg-background px-2 text-muted-foreground">
                Setup Awal
              </span> */}
            </div>
          </div>

          {/* <Button 
            type="button" 
            variant="outline" 
            className="w-full" 
            onClick={handleCreateInitialAdmin}
            disabled={loading}
          >
            Buat Super Admin Pertama
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Email: admin@gmail.com | Password: admin1234
          </p> */}
        </CardContent>
      </Card>
    </div>
  );
}