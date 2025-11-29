import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Users, 
  FileText, 
  Plus,
  Clock,
  ClipboardList,
  CreditCard,
  LogOut
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAppointments } from "@/hooks/useAppointments";
import { useBudgets } from "@/hooks/useBudgets";
import { format, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";

const SecretaryDashboard = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { appointments } = useAppointments();
  const { budgets } = useBudgets();

  // Filter today's appointments
  const todayAppointments = (appointments || []).filter(apt => 
    isToday(new Date(apt.appointment_date))
  ).sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));

  // Filter pending budgets
  const pendingBudgets = (budgets || []).filter(b => b.status === "Pendente");

  // Filter waiting appointments (scheduled for today)
  const waitingPatients = todayAppointments.filter(apt => 
    apt.status === "Agendado"
  );

  const stats = [
    {
      title: "Consultas Hoje",
      value: todayAppointments.length,
      icon: Calendar,
      color: "text-primary",
      bg: "bg-primary/10"
    },
    {
      title: "Pacientes Aguardando",
      value: waitingPatients.length,
      icon: Clock,
      color: "text-warning",
      bg: "bg-warning/10"
    },
    {
      title: "Orçamentos Pendentes",
      value: pendingBudgets.length,
      icon: ClipboardList,
      color: "text-accent",
      bg: "bg-accent/10"
    }
  ];

  const quickActions = [
    {
      label: "Agendar Consulta",
      icon: Calendar,
      onClick: () => navigate("/agenda"),
      color: "bg-primary hover:bg-primary/90"
    },
    {
      label: "Novo Paciente",
      icon: Users,
      onClick: () => navigate("/pacientes"),
      color: "bg-success hover:bg-success/90"
    },
    {
      label: "Ver Orçamentos",
      icon: FileText,
      onClick: () => navigate("/orcamento"),
      color: "bg-accent hover:bg-accent/90"
    },
    {
      label: "Novo Lançamento",
      icon: CreditCard,
      onClick: () => navigate("/financeiro-lancamento"),
      color: "bg-secondary hover:bg-secondary/90"
    }
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard Secretária</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Visão geral das atividades do consultório
          </p>
        </div>
        <Button 
          onClick={signOut}
          variant="outline"
          className="w-full md:w-auto"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
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

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  onClick={action.onClick}
                  className={`${action.color} h-24 flex flex-col items-center justify-center gap-2`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-sm font-medium">{action.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Today's Appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Consultas de Hoje</span>
            <Button variant="outline" size="sm" onClick={() => navigate("/agenda")}>
              Ver Agenda Completa
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayAppointments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma consulta agendada para hoje</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">
                      {appointment.patients?.name || "Paciente"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.type}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">
                      {appointment.appointment_time}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.duration} min
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SecretaryDashboard;
