import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  Calendar, 
  CreditCard,
  Building2,
  UserCog,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { 
    label: 'Dashboard', 
    href: '/', 
    icon: LayoutDashboard, 
    roles: ['super_admin', 'admin_kepegawaian', 'admin_jurusan', 'admin_keuangan'] 
  },
  { 
    label: 'Pegawai', 
    href: '/pegawai', 
    icon: Users, 
    roles: ['super_admin', 'admin_kepegawaian'] 
  },
  { 
    label: 'Jurusan', 
    href: '/jurusan', 
    icon: Building2, 
    roles: ['super_admin', 'admin_kepegawaian'] 
  },
  { 
    label: 'Tarif Honorarium', 
    href: '/pembayaran', 
    icon: CreditCard, 
    roles: ['super_admin', 'admin_kepegawaian', 'admin_jurusan', 'admin_keuangan'] 
  },
  { 
    label: 'Kegiatan', 
    href: '/kegiatan', 
    icon: Calendar, 
    roles: ['super_admin', 'admin_kepegawaian', 'admin_jurusan', 'admin_keuangan'] 
  },
  { 
    label: 'Pembayaran',//change into tarif pembayaran 
    href: '/tarif', 
    icon: DollarSign, 
    roles: ['super_admin', 'admin_keuangan', 'admin_jurusan', 'admin_kepegawaian'] 
  },
  { 
    label: 'Laporan', 
    href: '/laporan', 
    icon: FileText, 
    roles: ['super_admin', 'admin_kepegawaian', 'admin_keuangan'] 
  },
  { 
    label: 'Manajemen User', 
    href: '/users', 
    icon: UserCog, 
    roles: ['super_admin'] 
  },
];

export default function Sidebar() {
  const location = useLocation();
  const { userRole } = useAuth();

  const filteredMenuItems = menuItems.filter(item => 
    !item.roles || (userRole && item.roles.includes(userRole))
  );

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-foreground">
          Sistem Honorarium
        </h1>
        <p className="text-sm text-sidebar-foreground/70 mt-1">
          Kampus
        </p>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                isActive 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}