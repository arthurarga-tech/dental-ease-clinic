import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Calendar, 
  FileText, 
  CreditCard,
  TrendingUp,
  Clock,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const stats = [
    {
      title: "Pacientes Ativos",
      value: "248",
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10"
    },
    {
      title: "Consultas Hoje",
      value: "12",
      icon: Calendar,
      color: "text-success",
      bg: "bg-success/10"
    },
    {
      title: "Faturamento Mensal",
      value: "R$ 15.240",
      icon: TrendingUp,
      color: "text-warning",
      bg: "bg-warning/10"
    },
    {
      title: "Pendências",
      value: "3",
      icon: AlertCircle,
      color: "text-destructive",
      bg: "bg-destructive/10"
    }
  ];

  const recentAppointments = [
    { time: "09:00", patient: "Maria Silva", type: "Consulta", status: "Confirmado" },
    { time: "10:30", patient: "João Santos", type: "Limpeza", status: "Em andamento" },
    { time: "14:00", patient: "Ana Costa", type: "Extração", status: "Agendado" },
    { time: "15:30", patient: "Carlos Lima", type: "Canal", status: "Agendado" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do consultório</p>
        </div>
        <Button 
          onClick={() => navigate("/agenda")}
          className="bg-primary hover:bg-primary/90"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Nova Consulta
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Consultas de Hoje
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentAppointments.map((appointment, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 bg-secondary rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium text-primary">
                    {appointment.time}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{appointment.patient}</p>
                    <p className="text-sm text-muted-foreground">{appointment.type}</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-md text-xs font-medium ${
                  appointment.status === "Confirmado" 
                    ? "bg-success/10 text-success"
                    : appointment.status === "Em andamento"
                    ? "bg-warning/10 text-warning"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {appointment.status}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

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
      </div>
    </div>
  );
};

export default Dashboard;