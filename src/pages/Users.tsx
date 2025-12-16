import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users as UsersIcon, Mail, Calendar, Loader2 } from "lucide-react";
import { useUsers, UserProfile } from "@/hooks/useUsers";
import { useDentists } from "@/hooks/useDentists";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import UserViewDialog from "@/components/UserViewDialog";
import { useToast } from "@/hooks/use-toast";

const Users = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { users, isLoading, updateUserRole, toggleUserStatus } = useUsers();
  const { dentists } = useDentists();
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-primary text-primary-foreground";
      case "visualizador":
        return "bg-blue-500 text-white";
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
      case "visualizador":
        return "Visualizador";
      case "dentista":
        return "Dentista";
      case "secretaria":
        return "Secretária";
      default:
        return role;
    }
  };

  const handleEditRole = (user: UserProfile) => {
    setEditingUserId(user.id);
    setSelectedRole(user.role || "");
  };

  const handleSaveRole = (userId: string) => {
    if (selectedRole) {
      updateUserRole.mutate({ userId, newRole: selectedRole });
      setEditingUserId(null);
      setSelectedRole("");
    }
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setSelectedRole("");
  };

  const handleToggleStatus = (user: UserProfile) => {
    const currentStatus = user.status;
    const newStatus = currentStatus === "Ativo" ? "Inativo" : "Ativo";
    
    // If trying to activate a dentist user, check if they have a dentist record
    if (newStatus === "Ativo" && user.role === "dentista") {
      const hasDentistRecord = dentists.some(d => d.email === user.email);
      
      if (!hasDentistRecord) {
        toast({
          title: "Cadastro de dentista necessário",
          description: "Este usuário precisa ter um cadastro como dentista antes de ser ativado.",
          variant: "destructive",
        });
        navigate(`/dentistas?name=${encodeURIComponent(user.full_name || "")}&email=${encodeURIComponent(user.email)}`);
        return;
      }
    }
    
    toggleUserStatus.mutate({ userId: user.id, newStatus });
  };

  const handleCardClick = (user: UserProfile) => {
    if (editingUserId !== user.id) {
      setSelectedUser(user);
      setIsViewDialogOpen(true);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Gerenciar Usuários</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Gerencie os usuários e suas permissões no sistema
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-primary" />
            Usuários do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Carregando usuários...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <UsersIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum usuário cadastrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <Card 
                  key={user.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleCardClick(user)}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-foreground">
                            {user.full_name || "Nome não informado"}
                          </h3>
                          {editingUserId !== user.id && (
                            <>
                              <Badge className={getRoleBadgeColor(user.role || "")}>
                                {getRoleLabel(user.role)}
                              </Badge>
                              <Badge 
                                variant={user.status === "Ativo" ? "default" : "secondary"}
                                className={user.status === "Ativo" ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}
                              >
                                {user.status}
                              </Badge>
                            </>
                          )}
                        </div>

                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {user.email}
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Cadastrado em{" "}
                            {format(new Date(user.created_at), "dd/MM/yyyy", { locale: ptBR })}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 items-center flex-wrap" onClick={(e) => e.stopPropagation()}>
                        {editingUserId === user.id ? (
                          <>
                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Selecione a role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Administrador</SelectItem>
                                <SelectItem value="visualizador">Visualizador</SelectItem>
                                <SelectItem value="dentista">Dentista</SelectItem>
                                <SelectItem value="secretaria">Secretária</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              size="sm"
                              onClick={() => handleSaveRole(user.id)}
                              disabled={updateUserRole.isPending}
                            >
                              {updateUserRole.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                "Salvar"
                              )}
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                              Cancelar
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleEditRole(user)}>
                              Alterar Role
                            </Button>
                            <Button
                              size="sm"
                              variant={user.status === "Ativo" ? "destructive" : "default"}
                              onClick={() => handleToggleStatus(user)}
                              disabled={toggleUserStatus.isPending}
                            >
                              {toggleUserStatus.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : user.status === "Ativo" ? (
                                "Desativar"
                              ) : (
                                "Reativar"
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <UserViewDialog
        user={selectedUser}
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
      />
    </div>
  );
};

export default Users;
