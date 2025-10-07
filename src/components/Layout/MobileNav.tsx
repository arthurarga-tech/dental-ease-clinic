import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Calendar,
  Users,
  FileText,
  CreditCard,
  LayoutDashboard,
  Stethoscope,
  UserRoundPlus,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const allMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/", roles: ['admin', 'socio', 'dentista', 'secretaria'] },
  { icon: Users, label: "Pacientes", path: "/pacientes", roles: ['admin', 'socio', 'secretaria'] },
  { icon: Calendar, label: "Agenda", path: "/agenda", roles: ['admin', 'socio', 'dentista', 'secretaria'] },
  { icon: FileText, label: "Prontuário", path: "/prontuario", roles: ['admin', 'socio', 'dentista'] },
  { icon: UserRoundPlus, label: "Dentistas", path: "/dentistas", roles: ['admin', 'socio'] },
  { icon: CreditCard, label: "Financeiro", path: "/financeiro", roles: ['admin', 'socio'] },
];

export const MobileNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { hasAnyRole, signOut, user } = useAuth();

  const menuItems = allMenuItems.filter(item => 
    hasAnyRole(item.roles as any)
  );

  const handleNavigate = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="w-6 h-6" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[85vh]">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Stethoscope className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <DrawerTitle className="text-lg">DentalCare</DrawerTitle>
                <p className="text-sm text-muted-foreground">Sistema Odontológico</p>
              </div>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X className="w-5 h-5" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Button
                key={item.path}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-12 text-base",
                  isActive && "bg-accent text-accent-foreground"
                )}
                onClick={() => handleNavigate(item.path)}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Button>
            );
          })}
        </nav>

        <div className="p-4 border-t space-y-3">
          <Separator />
          {user?.email && (
            <div className="px-2 py-1 text-sm text-muted-foreground">
              {user.email}
            </div>
          )}
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-12 text-base text-muted-foreground hover:text-foreground"
            onClick={() => {
              signOut();
              setOpen(false);
            }}
          >
            <LogOut className="w-5 h-5" />
            Sair
          </Button>
          <div className="text-xs text-muted-foreground text-center pt-2">
            © 2024 DentalCare System
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
