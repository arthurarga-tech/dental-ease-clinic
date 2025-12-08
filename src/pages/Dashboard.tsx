import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Calendar, 
  FileText, 
  CreditCard,
  TrendingUp,
  Clock,
  AlertCircle,
  Gift,
  LogOut
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useDentists } from "@/hooks/useDentists";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Dashboard = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { stats, todayAppointments, birthdayPatients, birthdayDentists, isLoading } = useDashboardStats();
  const { dentists, isLoading: isLoadingDentists } = useDentists();

  const activeDentists = dentists.filter(d => d.status === "Ativo");

  const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const statsCards = [
    {
      title: "Pacientes Ativos",
      value: stats.activePatients.toString(),
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10"
    },
    {
      title: "Consultas Hoje",
      value: stats.appointmentsToday.toString(),
      icon: Calendar,
      color: "text-success",
      bg: "bg-success/10"
    },
    {
      title: "Receitas (Pago)",
      value: `R$ ${stats.totalReceitas?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00'}`,
      icon: TrendingUp,
      color: "text-success",
      bg: "bg-success/10"
    },
    {
      title: "Saldo Atual",
      value: `R$ ${stats.saldoAtual?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00'}`,
      icon: CreditCard,
      color: stats.saldoAtual && stats.saldoAtual >= 0 ? "text-success" : "text-destructive",
      bg: stats.saldoAtual && stats.saldoAtual >= 0 ? "bg-success/10" : "bg-destructive/10"
    }
  ];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">Carregando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground">Visão geral do consultório</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => navigate("/agenda")}
            className="bg-primary hover:bg-primary/90 flex-1 sm:flex-none text-xs sm:text-sm h-9 sm:h-10"
          >
            <Calendar className="w-4 h-4 mr-1.5 sm:mr-2" />
            Nova Consulta
          </Button>
          <Button 
            onClick={signOut}
            variant="outline"
            className="flex-1 sm:flex-none text-xs sm:text-sm h-9 sm:h-10"
          >
            <LogOut className="w-4 h-4 mr-1.5 sm:mr-2" />
            Sair
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-3 sm:p-4 md:p-6">
                <div className="flex items-start sm:items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{stat.title}</p>
                    <p className="text-lg sm:text-xl md:text-3xl font-bold text-foreground truncate">{stat.value}</p>
                  </div>
                  <div className={`p-2 sm:p-3 rounded-lg ${stat.bg} flex-shrink-0`}>
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Consultas de Hoje - Destaque Principal */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Consultas de Hoje
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          {todayAppointments.length > 0 ? (
            todayAppointments.map((appointment) => (
              <div 
                key={appointment.id}
                className="flex items-center justify-between p-2.5 sm:p-3 bg-secondary rounded-lg gap-2"
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="text-xs sm:text-sm font-medium text-primary flex-shrink-0">
                    {appointment.appointment_time.slice(0, 5)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground text-sm truncate">{appointment.patients.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{appointment.type}</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-md text-xs font-medium flex-shrink-0 ${
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
            <div className="text-center py-6 sm:py-8 text-muted-foreground">
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma consulta agendada para hoje</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ações Rápidas */}
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
              onClick={() => navigate("/pacientes")}
            >
              <Users className="w-4 h-4 mr-2" />
              Cadastrar Paciente
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate("/agenda")}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Agendar Consulta
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate("/prontuario")}
            >
              <FileText className="w-4 h-4 mr-2" />
              Novo Prontuário
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate("/financeiro")}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Registrar Pagamento
            </Button>
          </CardContent>
        </Card>

        {/* Dentists availability */}
        {activeDentists.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Dentistas Disponíveis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeDentists.map((dentist) => (
                <div key={dentist.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                  <p className="font-medium text-foreground mb-2">{dentist.name}</p>
                  <div className="space-y-1">
                    {dentist.dentist_availability.length > 0 ? (
                      Object.entries(
                        dentist.dentist_availability.reduce((acc, slot) => {
                          if (!acc[slot.day_of_week]) {
                            acc[slot.day_of_week] = [];
                          }
                          acc[slot.day_of_week].push(slot);
                          return acc;
                        }, {} as Record<number, typeof dentist.dentist_availability>)
                      )
                      .sort(([a], [b]) => Number(a) - Number(b))
                      .map(([day, slots]) => (
                        <div key={day} className="text-sm flex items-start gap-2">
                          <span className="text-muted-foreground font-medium min-w-[35px]">
                            {daysOfWeek[Number(day)]}:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {slots.map((slot, idx) => (
                              <span key={idx} className="text-foreground">
                                {slot.start_time.slice(0, 5)}-{slot.end_time.slice(0, 5)}
                                {idx < slots.length - 1 && ","}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Sem horários definidos</p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Birthday reminder card */}
      {(birthdayPatients.length > 0 || birthdayDentists.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              Aniversariantes de Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {birthdayPatients.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Pacientes</p>
                  {birthdayPatients.map((patient) => (
                    <div 
                      key={patient.id}
                      className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <Gift className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{patient.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {patient.phone}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-primary font-medium">
                        🎉 Parabéns!
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {birthdayDentists.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Dentistas</p>
                  {birthdayDentists.map((dentist) => (
                    <div 
                      key={dentist.id}
                      className="flex items-center justify-between p-3 bg-success/5 rounded-lg border border-success/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
                          <Gift className="w-4 h-4 text-success" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{dentist.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {dentist.phone}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-success font-medium">
                        🎉 Parabéns!
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;