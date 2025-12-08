import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { UserProfile } from "@/hooks/useUsers";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Mail, Calendar, Shield, User } from "lucide-react";

interface UserViewDialogProps {
  user: UserProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserViewDialog = ({ user, open, onOpenChange }: UserViewDialogProps) => {
  if (!user) return null;

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-primary text-primary-foreground";
      case "dentista":
        return "bg-success text-success-foreground";
      case "secretaria":
        return "bg-warning text-warning-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getRoleLabel = (role: string | null | undefined) => {
    if (!role) return "Sem role";
    switch (role) {
      case "admin":
        return "Administrador";
      case "dentista":
        return "Dentista";
      case "secretaria":
        return "Secretária";
      default:
        return role;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Detalhes do Usuário
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground">
                {user.full_name || "Nome não informado"}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getRoleBadgeColor(user.role || "")}>
                  {getRoleLabel(user.role)}
                </Badge>
                <Badge 
                  variant={user.status === "Ativo" ? "default" : "secondary"}
                  className={user.status === "Ativo" ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}
                >
                  {user.status}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground text-xs">Email</p>
                <p className="text-foreground">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground text-xs">Função</p>
                <p className="text-foreground">{getRoleLabel(user.role)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground text-xs">Data de Cadastro</p>
                <p className="text-foreground">
                  {format(new Date(user.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserViewDialog;
