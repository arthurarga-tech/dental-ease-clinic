import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  Users, 
  FileText, 
  CreditCard, 
  LayoutDashboard,
  Stethoscope,
  UserRoundPlus,
  LogOut
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const allMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/", roles: ['admin', 'socio', 'dentista', 'secretaria'] },
  { icon: Users, label: "Pacientes", path: "/pacientes", roles: ['admin', 'socio', 'secretaria'] },
  { icon: Calendar, label: "Agenda", path: "/agenda", roles: ['admin', 'socio', 'dentista', 'secretaria'] },
  { icon: FileText, label: "Prontuário", path: "/prontuario", roles: ['admin', 'socio', 'dentista'] },
  { icon: UserRoundPlus, label: "Dentistas", path: "/dentistas", roles: ['admin', 'socio'] },
  { icon: CreditCard, label: "Financeiro", path: "/financeiro", roles: ['admin', 'socio'] },
];

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasAnyRole, signOut, user } = useAuth();

  const menuItems = allMenuItems.filter(item => 
    hasAnyRole(item.roles as any)
  );

  return (
    <div className="w-64 h-screen bg-card border-r border-border flex flex-col shrink-0">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-lg">
            <Stethoscope className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">DentalCare</h1>
            <p className="text-sm text-muted-foreground">Sistema Odontológico</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Button
              key={item.path}
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-12",
                isActive && "bg-accent text-accent-foreground"
              )}
              onClick={() => navigate(item.path)}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-3">
        <Separator />
        {user?.email && (
          <div className="px-2 py-1 text-xs text-muted-foreground truncate">
            {user.email}
          </div>
        )}
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
          onClick={() => signOut()}
        >
          <LogOut className="w-5 h-5" />
          Sair
        </Button>
        <div className="text-xs text-muted-foreground text-center pt-2">
          © 2024 DentalCare System
        </div>
      </div>
    </div>
  );
};