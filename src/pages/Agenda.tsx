import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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

const Agenda = () => {
  // Helper functions to avoid timezone issues
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseLocalDateString = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  };

  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [viewingAppointment, setViewingAppointment] = useState<Appointment | null>(null);
  const [deletingAppointment, setDeletingAppointment] = useState<Appointment | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { 
    appointments, 
    isLoading, 
    createAppointment, 
    updateAppointment, 
    deleteAppointment,
    isCreating,
    isUpdating,
    isDeleting
  } = useAppointments(selectedDate);

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
    const current = parseLocalDateString(selectedDate);
    current.setDate(current.getDate() + days);
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');
    setSelectedDate(`${year}-${month}-${day}`);
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

  // Generate time slots from 08:00 to 18:00 (30-minute intervals)
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 8;
    const endHour = 18;
    
    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(`${String(hour).padStart(2, '0')}:00`);
      slots.push(`${String(hour).padStart(2, '0')}:30`);
    }
    slots.push('18:00'); // Add final slot
    
    return slots;
  };

  // Map appointments to their time slots
  const getSlotsWithAppointments = () => {
    const timeSlots = generateTimeSlots();
    const appointmentMap = new Map<string, Appointment>();
    
    // Map appointments by their time
    appointments.forEach(appointment => {
      const time = appointment.appointment_time.substring(0, 5); // Get HH:MM format
      appointmentMap.set(time, appointment);
    });
    
    // Create slots array with appointments or null
    return timeSlots.map(time => ({
      time,
      appointment: appointmentMap.get(time) || null
    }));
  };

  const slots = getSlotsWithAppointments();

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Agenda</h1>
          <p className="text-sm md:text-base text-muted-foreground">Gerenciamento de consultas e horários</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
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
              initialDate={selectedDate}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <CalendarIcon className="w-5 h-5 text-primary" />
              Consultas do Dia
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => changeDate(-1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="px-2 md:px-4 py-2 bg-secondary rounded-md text-xs md:text-sm font-medium text-center flex-1">
                {parseLocalDateString(selectedDate).toLocaleDateString('pt-BR', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
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
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Carregando consultas...</span>
            </div>
          ) : (
            <div className="space-y-2">
              {slots.map((slot) => (
                slot.appointment ? (
                  // Occupied slot - show appointment card
                  <Card key={slot.time} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-3 md:p-4">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-start gap-3">
                          <div className="text-center shrink-0">
                            <div className="text-base md:text-lg font-bold text-primary">{slot.appointment.appointment_time}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {slot.appointment.duration}min
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className="text-sm md:text-base font-semibold text-foreground truncate">{slot.appointment.patients.name}</h3>
                              <Badge className={getStatusColor(slot.appointment.status)}>
                                {slot.appointment.status}
                              </Badge>
                            </div>
                            
                            <div className="space-y-1 text-xs md:text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <User className="w-3 h-3 md:w-4 md:h-4 shrink-0" />
                                <span className="truncate">{slot.appointment.type}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="w-3 h-3 md:w-4 md:h-4 shrink-0" />
                                {slot.appointment.patients.phone}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleOpenEdit(slot.appointment!)}
                            className="flex-1 sm:flex-none text-xs"
                          >
                            Editar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleOpenDelete(slot.appointment!)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                          {(slot.appointment.status === "Concluído" || slot.appointment.status === "Cancelado") ? (
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              onClick={() => handleOpenView(slot.appointment!)}
                              className="flex-1 sm:flex-none text-xs"
                            >
                              Visualizar
                            </Button>
                          ) : (
                            <Button 
                              variant={slot.appointment.status === "Agendado" ? "default" : "secondary"} 
                              size="sm"
                              onClick={() => {
                                const nextStatus = slot.appointment!.status === "Agendado" ? "Em andamento" : 
                                                 slot.appointment!.status === "Em andamento" ? "Concluído" : slot.appointment!.status;
                                if (nextStatus !== slot.appointment!.status) {
                                  handleStatusUpdate(slot.appointment!.id, nextStatus);
                                }
                              }}
                              disabled={isUpdating}
                              className="flex-1 sm:flex-none text-xs"
                            >
                              {isUpdating && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                              {slot.appointment.status === "Agendado" ? "Iniciar" : 
                               slot.appointment.status === "Em andamento" ? "Finalizar" : "Visualizar"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  // Empty slot - show placeholder
                  <Card key={slot.time} className="opacity-60 hover:opacity-80 transition-opacity">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="text-center min-w-[60px]">
                          <div className="text-sm font-medium text-muted-foreground">{slot.time}</div>
                        </div>
                        <div className="flex-1 text-sm text-muted-foreground italic">
                          Horário disponível
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
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