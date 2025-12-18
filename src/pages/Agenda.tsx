import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Trash2,
  Stethoscope,
  ChevronDown,
  CalendarX,
  UserX,
  MessageCircle
} from "lucide-react";
import { useAppointments, Appointment } from "@/hooks/useAppointments";
import { AppointmentForm } from "@/components/AppointmentForm";
import { AppointmentViewDialog } from "@/components/AppointmentViewDialog";
import { AppointmentDeleteDialog } from "@/components/AppointmentDeleteDialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { generateWhatsAppUrl, generateAppointmentConfirmationMessage, formatBrazilianPhone } from "@/lib/phone-utils";

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
      case "Remarcado":
        return "bg-orange-500 text-white";
      case "Faltou":
        return "bg-red-700 text-white";
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

  const handleWhatsAppConfirmation = (appointment: Appointment) => {
    const message = generateAppointmentConfirmationMessage(
      appointment.patients.name,
      appointment.appointment_date,
      appointment.appointment_time,
      appointment.dentists?.name
    );
    const whatsappUrl = generateWhatsAppUrl(appointment.patients.phone, message);
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Agenda</h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground">Gerenciamento de consultas e horários</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Nova Consulta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto mx-2">
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
        <CardHeader className="pb-3 sm:pb-6">
          <div className="flex flex-col gap-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              Consultas do Dia
            </CardTitle>
            <div className="flex items-center justify-between gap-2">
              <Button variant="outline" size="sm" onClick={() => changeDate(-1)} className="h-9 w-9 p-0">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="text-xs sm:text-sm flex-1 max-w-[200px] sm:max-w-[260px] h-9">
                    <CalendarIcon className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
                    <span className="truncate">
                      {format(selectedDate, "d 'de' MMM", { locale: ptBR })}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-50" align="center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    locale={ptBR}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              <Button variant="outline" size="sm" onClick={() => changeDate(1)} className="h-9 w-9 p-0">
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
                    <CardContent className="p-3">
                      <div className="flex flex-col gap-3">
                        {/* Header with time and status */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="text-sm sm:text-base font-bold text-primary">
                              {appointment.appointment_time.substring(0, 5)}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {appointment.duration}min
                            </div>
                          </div>
                          <Badge className={`${getStatusColor(appointment.status)} text-xs`}>
                            {appointment.status}
                          </Badge>
                        </div>
                        
                        {/* Patient and details */}
                        <div className="space-y-1.5">
                          <h3 className="font-semibold text-foreground text-sm truncate">{appointment.patients.name}</h3>
                          
                          {appointment.dentists && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Stethoscope className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{appointment.dentists.name}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <User className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{appointment.type}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Phone className="w-3 h-3 flex-shrink-0" />
                            <span>{formatBrazilianPhone(appointment.patients.phone)}</span>
                          </div>
                        </div>
                        
                        {/* WhatsApp Confirmation Button */}
                        {appointment.status === "Agendado" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full h-8 text-xs text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700"
                            onClick={() => handleWhatsAppConfirmation(appointment)}
                          >
                            <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                            Confirmar via WhatsApp
                          </Button>
                        )}
                        
                        {/* Actions */}
                        <div className="flex gap-2 pt-1 border-t border-border">
                          <Button variant="outline" size="sm" onClick={() => handleOpenEdit(appointment)} className="flex-1 h-8 text-xs">
                            Editar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleOpenDelete(appointment)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                          {(appointment.status === "Concluído" || appointment.status === "Cancelado" || appointment.status === "Remarcado" || appointment.status === "Faltou") ? (
                            <Button variant="secondary" size="sm" onClick={() => handleOpenView(appointment)} className="flex-1 h-8 text-xs">
                              Ver
                            </Button>
                          ) : appointment.status === "Agendado" ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="default" size="sm" className="flex-1 h-8 text-xs" disabled={isUpdating}>
                                  {isUpdating && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                                  Iniciar
                                  <ChevronDown className="w-3 h-3 ml-1" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleStatusUpdate(appointment.id, "Em andamento")}>
                                  <Clock className="w-3.5 h-3.5 mr-2" />
                                  Iniciar Atendimento
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusUpdate(appointment.id, "Remarcado")}>
                                  <CalendarX className="w-3.5 h-3.5 mr-2" />
                                  Remarcado
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusUpdate(appointment.id, "Faltou")} className="text-destructive">
                                  <UserX className="w-3.5 h-3.5 mr-2" />
                                  Faltou
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <Button 
                              variant="secondary" 
                              size="sm"
                              className="flex-1 h-8 text-xs"
                              onClick={() => handleStatusUpdate(appointment.id, "Concluído")}
                              disabled={isUpdating}
                            >
                              {isUpdating && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                              Finalizar
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
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto mx-2">
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