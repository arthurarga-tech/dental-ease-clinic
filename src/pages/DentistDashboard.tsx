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
  User,
  Gift,
  DollarSign,
  History,
  ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAppointments } from "@/hooks/useAppointments";
import { useDentistProfile } from "@/hooks/useDentistProfile";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useDentistReceivables } from "@/hooks/useDentistReceivables";
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
  const { birthdayPatients, birthdayDentists } = useDashboardStats();
  const { pendingReceivables, paidReceivables, totalPending, totalPaid, isLoading: isLoadingReceivables } = useDentistReceivables(dentist?.id);

  // Filter appointments for today and for this dentist
  const todayAppointments = (appointments || []).filter(apt => 
    apt.appointment_date === selectedDateString && 
    (!dentist || apt.dentist_id === dentist.id)
  );

  if (isLoading || isDentistLoading) {
    return (
      <div className="p-4 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dentist) {
    return (
      <div className="p-4 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-sm">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-destructive" />
          <p className="text-lg font-semibold mb-2">Perfil não encontrado</p>
          <p className="text-sm text-muted-foreground mb-4">
            Seu usuário não está vinculado a um cadastro de dentista.
          </p>
          <Button onClick={signOut} variant="outline" className="w-full">
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header - Mobile optimized */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground truncate">
              Olá, Dr(a). {dentist.name.split(' ')[0]}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </p>
          </div>
          <Button 
            onClick={signOut}
            variant="ghost"
            size="icon"
            className="shrink-0"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>

        {/* Quick Action Buttons - Mobile grid */}
        <div className="grid grid-cols-4 gap-2">
          <Button 
            onClick={() => navigate("/agenda")}
            className="flex-col h-auto py-3 px-2 gap-1"
            size="sm"
          >
            <Calendar className="w-5 h-5" />
            <span className="text-xs">Agenda</span>
          </Button>
          <Button 
            onClick={() => navigate("/prontuario")}
            variant="secondary"
            className="flex-col h-auto py-3 px-2 gap-1"
            size="sm"
          >
            <FileText className="w-5 h-5" />
            <span className="text-xs">Prontuários</span>
          </Button>
          <Button 
            onClick={() => navigate("/orcamento")}
            variant="secondary"
            className="flex-col h-auto py-3 px-2 gap-1"
            size="sm"
          >
            <DollarSign className="w-5 h-5" />
            <span className="text-xs">Orçamentos</span>
          </Button>
          <Button 
            onClick={() => navigate("/pacientes")}
            variant="secondary"
            className="flex-col h-auto py-3 px-2 gap-1"
            size="sm"
          >
            <Users className="w-5 h-5" />
            <span className="text-xs">Pacientes</span>
          </Button>
        </div>
      </div>

      {/* Today's Appointments */}
      <Card>
        <CardHeader className="pb-2 sm:pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              Consultas de Hoje
            </CardTitle>
            <span className="text-xs sm:text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">
              {todayAppointments.length} consulta{todayAppointments.length !== 1 ? 's' : ''}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-3">
          {isLoading ? (
            <div className="text-center py-6 text-muted-foreground">
              Carregando consultas...
            </div>
          ) : todayAppointments.length > 0 ? (
            todayAppointments.map((appointment) => (
              <div 
                key={appointment.id}
                className="flex items-center gap-3 p-3 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors active:scale-[0.99]"
              >
                <div className="text-center min-w-[50px] sm:min-w-[60px]">
                  <p className="text-sm sm:text-base font-bold text-primary">
                    {appointment.appointment_time.slice(0, 5)}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm sm:text-base truncate">
                    {appointment.patients.name}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    {appointment.type}
                  </p>
                </div>
                <div className={`shrink-0 px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
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
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma consulta para hoje</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Financial Summary Cards - Stacked on mobile, side by side on tablet+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Pending Receivables */}
        <Card className="bg-success/5 border-success/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="w-4 h-4 text-success" />
              A Receber
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingReceivables ? (
              <div className="text-center py-3 text-muted-foreground text-sm">
                Carregando...
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <p className="text-2xl sm:text-3xl font-bold text-success">
                    R$ {totalPending.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {pendingReceivables.length} fechamento{pendingReceivables.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {pendingReceivables.length > 0 && (
                  <div className="space-y-2 max-h-[150px] overflow-y-auto">
                    {pendingReceivables.slice(0, 3).map((receivable) => (
                      <div 
                        key={receivable.id}
                        className="flex items-center justify-between p-2 bg-background rounded-lg border text-xs sm:text-sm"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground truncate">
                            {format(new Date(receivable.period_start), "dd/MM", { locale: ptBR })} - {format(new Date(receivable.period_end), "dd/MM/yy", { locale: ptBR })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {receivable.commission_percentage}% comissão
                          </p>
                        </div>
                        <p className="font-semibold text-success shrink-0 ml-2">
                          R$ {receivable.net_amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {pendingReceivables.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    Nenhum valor pendente
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Paid History */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <History className="w-4 h-4 text-primary" />
              Recebido
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingReceivables ? (
              <div className="text-center py-3 text-muted-foreground text-sm">
                Carregando...
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <p className="text-2xl sm:text-3xl font-bold text-primary">
                    R$ {totalPaid.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {paidReceivables.length} pagamento{paidReceivables.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {paidReceivables.length > 0 && (
                  <div className="space-y-2 max-h-[150px] overflow-y-auto">
                    {paidReceivables.slice(0, 3).map((receivable) => (
                      <div 
                        key={receivable.id}
                        className="flex items-center justify-between p-2 bg-background rounded-lg border text-xs sm:text-sm"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground truncate">
                            {format(new Date(receivable.period_start), "dd/MM", { locale: ptBR })} - {format(new Date(receivable.period_end), "dd/MM/yy", { locale: ptBR })}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-success" />
                            {receivable.payment_date ? format(new Date(receivable.payment_date), "dd/MM/yy") : "Pago"}
                          </p>
                        </div>
                        <p className="font-semibold text-primary shrink-0 ml-2">
                          R$ {receivable.net_amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {paidReceivables.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    Nenhum pagamento recebido
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dentist Info Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="w-4 h-4 text-primary" />
            Suas Informações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="bg-muted/50 rounded-lg p-2.5">
              <p className="text-xs text-muted-foreground">CRO</p>
              <p className="font-medium truncate">{dentist.cro}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-2.5">
              <p className="text-xs text-muted-foreground">Telefone</p>
              <p className="font-medium truncate">{dentist.phone}</p>
            </div>
            {dentist.commission_percentage && (
              <div className="bg-muted/50 rounded-lg p-2.5">
                <p className="text-xs text-muted-foreground">Comissão</p>
                <p className="font-medium">{dentist.commission_percentage}%</p>
              </div>
            )}
            <div className="bg-muted/50 rounded-lg p-2.5">
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="font-medium">{dentist.status}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Birthday reminder card */}
      {(birthdayPatients.length > 0 || birthdayDentists.length > 0) && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Gift className="w-4 h-4 text-primary" />
              Aniversariantes de Hoje 🎉
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {birthdayPatients.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pacientes</p>
                  {birthdayPatients.map((patient) => (
                    <div 
                      key={patient.id}
                      className="flex items-center gap-3 p-2.5 bg-background rounded-lg border"
                    >
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                        <Gift className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground text-sm truncate">{patient.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{patient.phone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {birthdayDentists.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Colegas</p>
                  {birthdayDentists.map((dentist) => (
                    <div 
                      key={dentist.id}
                      className="flex items-center gap-3 p-2.5 bg-background rounded-lg border"
                    >
                      <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center shrink-0">
                        <Gift className="w-4 h-4 text-success" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground text-sm truncate">Dr(a). {dentist.name}</p>
                        <p className="text-xs text-muted-foreground">CRO: {dentist.cro}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Access Notice - Compact on mobile */}
      <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg text-xs sm:text-sm">
        <AlertCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <p className="text-muted-foreground">
          <span className="font-medium text-foreground">Acesso restrito: </span>
          Você pode acessar suas consultas, prontuários e pacientes.
        </p>
      </div>
    </div>
  );
};

export default DentistDashboard;
