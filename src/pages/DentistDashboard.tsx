import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  FileText, 
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  LogOut,
  User
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAppointments } from "@/hooks/useAppointments";
import { useDentistProfile } from "@/hooks/useDentistProfile";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";

const DentistDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [selectedDate] = useState(new Date());
  const selectedDateString = format(selectedDate, 'yyyy-MM-dd');
  
  const { dentist, isLoading: isDentistLoading } = useDentistProfile();
  const { appointments, isLoading } = useAppointments(selectedDateString);

  // Filter appointments for today and for this dentist
  const todayAppointments = (appointments || []).filter(apt => 
    apt.appointment_date === selectedDateString && 
    (!dentist || apt.dentist_id === dentist.id)
  );

  const confirmedAppointments = (todayAppointments || []).filter(apt => 
    apt.status === "Confirmado"
  ).length;

  const inProgressAppointments = (todayAppointments || []).filter(apt => 
    apt.status === "Em andamento"
  ).length;

  const completedAppointments = (todayAppointments || []).filter(apt => 
    apt.status === "Concluído"
  ).length;

  const statsCards = [
    {
      title: "Consultas Hoje",
      value: todayAppointments.length.toString(),
      icon: Calendar,
      color: "text-primary",
      bg: "bg-primary/10"
    },
    {
      title: "Confirmadas",
      value: confirmedAppointments.toString(),
      icon: CheckCircle2,
      color: "text-success",
      bg: "bg-success/10"
    },
    {
      title: "Em Andamento",
      value: inProgressAppointments.toString(),
      icon: AlertCircle,
      color: "text-warning",
      bg: "bg-warning/10"
    },
    {
      title: "Concluídas",
      value: completedAppointments.toString(),
      icon: CheckCircle2,
      color: "text-primary",
      bg: "bg-primary/10"
    }
  ];

  if (isLoading || isDentistLoading) {
    return (
      <div className="p-6">
        <div className="text-center">Carregando dashboard...</div>
      </div>
    );
  }

  if (!dentist) {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-destructive" />
          <p className="text-lg font-semibold mb-2">Perfil de dentista não encontrado</p>
          <p className="text-muted-foreground mb-4">
            Seu usuário não está vinculado a um cadastro de dentista. Entre em contato com o administrador.
          </p>
          <Button onClick={signOut} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard do Dentista</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Bem-vindo, Dr(a). {dentist.name}
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button 
            onClick={() => navigate("/agenda")}
            className="bg-primary hover:bg-primary/90 flex-1 md:flex-none"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Ver Agenda Completa
          </Button>
          <Button 
            onClick={signOut}
            variant="outline"
            className="flex-1 md:flex-none"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bg}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Today's Appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Consultas de Hoje
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando consultas...
            </div>
          ) : todayAppointments.length > 0 ? (
            todayAppointments.map((appointment) => (
              <div 
                key={appointment.id}
                className="flex items-center justify-between p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="text-sm font-medium text-primary min-w-[60px]">
                    {appointment.appointment_time.slice(0, 5)}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{appointment.patients.name}</p>
                    <p className="text-sm text-muted-foreground">{appointment.type}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-md text-xs font-medium ${
                  appointment.status === "Confirmado" 
                    ? "bg-success/10 text-success"
                    : appointment.status === "Em andamento"
                    ? "bg-warning/10 text-warning"
                    : appointment.status === "Concluído"
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {appointment.status}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma consulta agendada para hoje</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate("/agenda")}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Ver Agenda Completa
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate("/prontuario")}
            >
              <FileText className="w-4 h-4 mr-2" />
              Acessar Prontuários
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate("/pacientes")}
            >
              <Users className="w-4 h-4 mr-2" />
              Ver Pacientes
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Suas Informações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">CRO</p>
                <p className="font-medium">{dentist.cro}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Telefone</p>
                <p className="font-medium">{dentist.phone}</p>
              </div>
              {dentist.commission_percentage && (
                <div>
                  <p className="text-sm text-muted-foreground">Comissão</p>
                  <p className="font-medium">{dentist.commission_percentage}%</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium">{dentist.status}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 mt-4 pt-4 border-t">
              <AlertCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-foreground">Acesso Limitado</p>
                <p className="text-muted-foreground">
                  Você tem acesso às suas consultas, prontuários e pacientes. 
                  Informações financeiras e administrativas são restritas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DentistDashboard;
