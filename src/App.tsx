import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Pegawai from "./pages/Pegawai";
import Jurusan from "./pages/Jurusan";
import Tarif from "./pages/Tarif";
import Kegiatan from "./pages/Kegiatan";
import Pembayaran from "./pages/Pembayaran";
import Laporan from "./pages/Laporan";
import Users from "./pages/Users";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Layout><Dashboard /></Layout>} />
            <Route path="/pegawai" element={<Pegawai />} />
            <Route path="/jurusan" element={<Jurusan />} />
            <Route path="/tarif" element={<Tarif />} />
            <Route path="/kegiatan" element={<Kegiatan />} />
            <Route path="/pembayaran" element={<Pembayaran />} />
            <Route path="/laporan" element={<Laporan />} />
            <Route path="/users" element={<Users />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
