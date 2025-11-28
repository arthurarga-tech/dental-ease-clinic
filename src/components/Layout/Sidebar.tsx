import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Users, 
  FileText, 
  CreditCard, 
  LayoutDashboard,
  Stethoscope,
  UserRoundPlus,
  LogOut,
  FileSpreadsheet,
  Calculator,
  UserCog
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const adminMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Users, label: "Pacientes", path: "/pacientes" },
  { icon: Calendar, label: "Agenda", path: "/agenda" },
  { icon: FileSpreadsheet, label: "Orçamento", path: "/orcamento" },
  { icon: FileText, label: "Prontuário", path: "/prontuario" },
  { icon: UserRoundPlus, label: "Dentistas", path: "/dentistas" },
  { icon: CreditCard, label: "Financeiro", path: "/financeiro" },
  { icon: Calculator, label: "Fechamento", path: "/fechamento" },
  { icon: UserCog, label: "Usuários", path: "/usuarios" },
];

const dentistMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dentist-dashboard" },
  { icon: Users, label: "Pacientes", path: "/pacientes" },
  { icon: Calendar, label: "Agenda", path: "/agenda" },
  { icon: FileText, label: "Prontuário", path: "/prontuario" },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export const Sidebar = ({ onNavigate }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, userRole } = useAuth();

  // Select menu items based on user role
  const menuItems = userRole === 'dentist' ? dentistMenuItems : adminMenuItems;

  const handleNavigation = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  const handleSignOut = () => {
    signOut();
    onNavigate?.();
  };

  return (
    <div className="w-full h-full bg-card border-r border-border flex flex-col md:w-64 md:h-screen">
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
              onClick={() => handleNavigation(item.path)}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start gap-3 h-12"
          onClick={handleSignOut}
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