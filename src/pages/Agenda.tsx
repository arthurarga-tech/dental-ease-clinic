import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface Appointment {
  id: string;
  time: string;
  patient: string;
  phone: string;
  type: string;
  status: "Agendado" | "Confirmado" | "Em andamento" | "Concluído" | "Cancelado";
  duration: number;
}

const Agenda = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Dados simulados de consultas
  const appointments: Appointment[] = [
    {
      id: "1",
      time: "08:00",
      patient: "Maria Silva Santos",
      phone: "(11) 99999-1234",
      type: "Consulta de rotina",
      status: "Confirmado",
      duration: 60
    },
    {
      id: "2",
      time: "09:30",
      patient: "João Pedro Costa", 
      phone: "(11) 98888-5678",
      type: "Limpeza dental",
      status: "Em andamento",
      duration: 45
    },
    {
      id: "3",
      time: "11:00",
      patient: "Ana Carolina Lima",
      phone: "(11) 97777-9012",
      type: "Extração de siso",
      status: "Agendado",
      duration: 90
    },
    {
      id: "4", 
      time: "14:00",
      patient: "Carlos Roberto Silva",
      phone: "(11) 96666-3456",
      type: "Tratamento de canal",
      status: "Confirmado",
      duration: 120
    },
    {
      id: "5",
      time: "16:30",
      patient: "Fernanda Oliveira",
      phone: "(11) 95555-7890",
      type: "Consulta de avaliação",
      status: "Agendado", 
      duration: 30
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmado":
        return "bg-success text-success-foreground";
      case "Em andamento":
        return "bg-warning text-warning-foreground";
      case "Concluído":
        return "bg-primary text-primary-foreground";
      case "Cancelado":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const changeDate = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Agenda</h1>
          <p className="text-muted-foreground">Gerenciamento de consultas e horários</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Nova Consulta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Agendar Nova Consulta</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="patient-select">Paciente</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maria">Maria Silva Santos</SelectItem>
                    <SelectItem value="joao">João Pedro Costa</SelectItem>
                    <SelectItem value="ana">Ana Carolina Lima</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date">Data</Label>
                <Input id="date" type="date" defaultValue={selectedDate} />
              </div>
              <div>
                <Label htmlFor="time">Horário</Label>
                <Input id="time" type="time" />
              </div>
              <div>
                <Label htmlFor="type">Tipo de Consulta</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consulta">Consulta de rotina</SelectItem>
                    <SelectItem value="limpeza">Limpeza dental</SelectItem>
                    <SelectItem value="extracao">Extração</SelectItem>
                    <SelectItem value="canal">Tratamento de canal</SelectItem>
                    <SelectItem value="avaliacao">Consulta de avaliação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="duration">Duração (minutos)</Label>
                <Input id="duration" type="number" placeholder="60" />
              </div>
              <div className="flex gap-2 pt-4">
                <Button className="flex-1" onClick={() => setIsDialogOpen(false)}>
                  Agendar
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              Consultas do Dia
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => changeDate(-1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="px-4 py-2 bg-secondary rounded-md text-sm font-medium">
                {new Date(selectedDate).toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <Button variant="outline" size="sm" onClick={() => changeDate(1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-primary">{appointment.time}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {appointment.duration}min
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{appointment.patient}</h3>
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {appointment.type}
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {appointment.phone}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                      <Button 
                        variant={appointment.status === "Agendado" ? "default" : "secondary"} 
                        size="sm"
                      >
                        {appointment.status === "Agendado" ? "Iniciar" : 
                         appointment.status === "Em andamento" ? "Finalizar" : "Visualizar"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {appointments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma consulta agendada para este dia.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Agenda;