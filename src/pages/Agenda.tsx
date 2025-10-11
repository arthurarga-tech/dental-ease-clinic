import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Plus, 
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Trash2
} from "lucide-react";
import { useAppointments, Appointment } from "@/hooks/useAppointments";
import { AppointmentForm } from "@/components/AppointmentForm";
import { AppointmentViewDialog } from "@/components/AppointmentViewDialog";
import { AppointmentDeleteDialog } from "@/components/AppointmentDeleteDialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Agenda = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [viewingAppointment, setViewingAppointment] = useState<Appointment | null>(null);
  const [deletingAppointment, setDeletingAppointment] = useState<Appointment | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const selectedDateString = format(selectedDate, 'yyyy-MM-dd');
  
  const { 
    appointments, 
    isLoading, 
    createAppointment, 
    updateAppointment, 
    deleteAppointment,
    isCreating,
    isUpdating,
    isDeleting
  } = useAppointments(selectedDateString);

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
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const handleCreateAppointment = (data: any) => {
    createAppointment(data);
    setIsDialogOpen(false);
  };

  const handleEditAppointment = (data: any) => {
    if (editingAppointment) {
      updateAppointment({ id: editingAppointment.id, ...data });
      setIsEditDialogOpen(false);
      setEditingAppointment(null);
    }
  };

  const handleOpenEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setIsEditDialogOpen(true);
  };

  const handleOpenView = (appointment: Appointment) => {
    setViewingAppointment(appointment);
    setIsViewDialogOpen(true);
  };

  const handleOpenDelete = (appointment: Appointment) => {
    setDeletingAppointment(appointment);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingAppointment) {
      deleteAppointment(deletingAppointment.id);
      setIsDeleteDialogOpen(false);
      setDeletingAppointment(null);
    }
  };

  const handleStatusUpdate = (appointmentId: string, newStatus: string) => {
    updateAppointment({ id: appointmentId, status: newStatus as any });
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Agenda</h1>
          <p className="text-sm md:text-base text-muted-foreground">Gerenciamento de consultas e horários</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 w-full md:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Nova Consulta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Agendar Nova Consulta</DialogTitle>
            </DialogHeader>
            <AppointmentForm 
              onSubmit={handleCreateAppointment}
              onCancel={() => setIsDialogOpen(false)}
              isLoading={isCreating}
              initialDate={selectedDateString}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              Consultas do Dia
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => changeDate(-1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="text-xs md:text-sm min-w-[180px] md:min-w-[240px]">
                    <CalendarIcon className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                    {format(selectedDate, "d 'de' MMM 'de' yyyy", { locale: ptBR })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    locale={ptBR}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              <Button variant="outline" size="sm" onClick={() => changeDate(1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Carregando consultas...</span>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma consulta agendada para este dia</p>
            </div>
          ) : (
            <div className="space-y-2">
              {appointments
                .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
                .map((appointment) => (
                  <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-3 md:p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-start md:items-center gap-3 md:gap-4 flex-1">
                          <div className="text-center min-w-[60px] md:min-w-[70px]">
                            <div className="text-base md:text-lg font-bold text-primary">
                              {appointment.appointment_time.substring(0, 5)}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1 justify-center">
                              <Clock className="w-3 h-3" />
                              {appointment.duration}min
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                              <h3 className="font-semibold text-foreground text-sm md:text-base truncate">{appointment.patients.name}</h3>
                              <Badge className={`${getStatusColor(appointment.status)} text-xs`}>
                                {appointment.status}
                              </Badge>
                            </div>
                            
                            <div className="space-y-1 text-xs md:text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <User className="w-3 h-3 md:w-4 md:h-4" />
                                <span className="truncate">{appointment.type}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="w-3 h-3 md:w-4 md:h-4" />
                                {appointment.patients.phone}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-1 md:gap-2 flex-wrap justify-end">
                          <Button variant="outline" size="sm" onClick={() => handleOpenEdit(appointment)}>
                            Editar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleOpenDelete(appointment)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                          {(appointment.status === "Concluído" || appointment.status === "Cancelado") ? (
                            <Button variant="secondary" size="sm" onClick={() => handleOpenView(appointment)}>
                              Visualizar
                            </Button>
                          ) : (
                            <Button 
                              variant={appointment.status === "Agendado" ? "default" : "secondary"} 
                              size="sm"
                              onClick={() => {
                                const nextStatus = appointment.status === "Agendado" ? "Em andamento" : 
                                                 appointment.status === "Em andamento" ? "Concluído" : appointment.status;
                                if (nextStatus !== appointment.status) {
                                  handleStatusUpdate(appointment.id, nextStatus);
                                }
                              }}
                              disabled={isUpdating}
                            >
                              {isUpdating && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                              {appointment.status === "Agendado" ? "Iniciar" : 
                               appointment.status === "Em andamento" ? "Finalizar" : "Visualizar"}
                            </Button>
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

      {/* Edit Appointment Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Consulta</DialogTitle>
          </DialogHeader>
          <AppointmentForm 
            onSubmit={handleEditAppointment}
            onCancel={() => {
              setIsEditDialogOpen(false);
              setEditingAppointment(null);
            }}
            isLoading={isUpdating}
            appointment={editingAppointment || undefined}
          />
        </DialogContent>
      </Dialog>

      {/* View Appointment Dialog */}
      <AppointmentViewDialog
        appointment={viewingAppointment}
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
      />

      {/* Delete Appointment Dialog */}
      <AppointmentDeleteDialog
        appointment={deletingAppointment}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Agenda;