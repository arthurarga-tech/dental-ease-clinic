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
  UserCog,
  Database,
  User
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
  { icon: Database, label: "Backups", path: "/backups" },
  { icon: UserCog, label: "Usuários", path: "/usuarios" },
  { icon: User, label: "Perfil", path: "/perfil" },
];

// Visualizador: same as admin but read-only (no backups, no users management)
const visualizadorMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Users, label: "Pacientes", path: "/pacientes" },
  { icon: Calendar, label: "Agenda", path: "/agenda" },
  { icon: FileSpreadsheet, label: "Orçamento", path: "/orcamento" },
  { icon: FileText, label: "Prontuário", path: "/prontuario" },
  { icon: UserRoundPlus, label: "Dentistas", path: "/dentistas" },
  { icon: CreditCard, label: "Financeiro", path: "/financeiro" },
  { icon: Calculator, label: "Fechamento", path: "/fechamento" },
  { icon: User, label: "Perfil", path: "/perfil" },
];

const dentistMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dentist-dashboard" },
  { icon: Users, label: "Pacientes", path: "/pacientes" },
  { icon: Calendar, label: "Agenda", path: "/agenda" },
  { icon: FileSpreadsheet, label: "Orçamento", path: "/orcamento" },
  { icon: FileText, label: "Prontuário", path: "/prontuario" },
  { icon: User, label: "Perfil", path: "/perfil" },
];

const secretaryMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/secretary-dashboard" },
  { icon: Users, label: "Pacientes", path: "/pacientes" },
  { icon: Calendar, label: "Agenda", path: "/agenda" },
  { icon: FileSpreadsheet, label: "Orçamento", path: "/orcamento" },
  { icon: FileText, label: "Prontuário", path: "/prontuario" },
  { icon: CreditCard, label: "Lançamentos", path: "/financeiro-lancamento" },
  { icon: User, label: "Perfil", path: "/perfil" },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export const Sidebar = ({ onNavigate }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, userRole } = useAuth();

  // Select menu items based on user role
  const menuItems = 
    userRole === 'dentist' || userRole === 'dentista' 
      ? dentistMenuItems 
      : userRole === 'secretaria' 
      ? secretaryMenuItems 
      : userRole === 'visualizador'
      ? visualizadorMenuItems
      : adminMenuItems;

  const handleNavigation = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  const handleSignOut = () => {
    signOut();
    onNavigate?.();
  };

  return (
    <div className="w-full h-full bg-card border-r border-border flex flex-col lg:w-64 lg:h-screen">
      <div className="p-4 lg:p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-lg">
            <Stethoscope className="w-5 h-5 lg:w-6 lg:h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg lg:text-xl font-bold text-foreground">DentalCare</h1>
            <p className="text-xs lg:text-sm text-muted-foreground">Sistema Odontológico</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 lg:p-4 space-y-1 lg:space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Button
              key={item.path}
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-11 lg:h-12 text-sm lg:text-base",
                isActive && "bg-accent text-accent-foreground"
              )}
              onClick={() => handleNavigation(item.path)}
            >
              <Icon className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </Button>
          );
        })}
      </nav>

      <div className="p-3 lg:p-4 border-t border-border space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start gap-3 h-11 lg:h-12 text-sm lg:text-base"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
          Sair
        </Button>
        <div className="text-xs text-muted-foreground text-center pt-2">
          © 2024 DentalCare System
        </div>
      </div>
    </div>
  );
};