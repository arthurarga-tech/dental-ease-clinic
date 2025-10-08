import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  Loader2,
  Trash2
} from "lucide-react";
import { useAppointments, Appointment } from "@/hooks/useAppointments";
import { AppointmentForm } from "@/components/AppointmentForm";
import { AppointmentViewDialog } from "@/components/AppointmentViewDialog";
import { AppointmentDeleteDialog } from "@/components/AppointmentDeleteDialog";
import { addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format, isSameDay, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

type ViewMode = 'day' | 'week' | 'month';

const Agenda = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [viewingAppointment, setViewingAppointment] = useState<Appointment | null>(null);
  const [deletingAppointment, setDeletingAppointment] = useState<Appointment | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Get date range based on view mode
  const getDateRange = () => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    
    switch (viewMode) {
      case 'day':
        return { start: dateStr, end: dateStr };
      case 'week':
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
        const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
        return { 
          start: format(weekStart, 'yyyy-MM-dd'), 
          end: format(weekEnd, 'yyyy-MM-dd') 
        };
      case 'month':
        const monthStart = startOfMonth(selectedDate);
        const monthEnd = endOfMonth(selectedDate);
        return { 
          start: format(monthStart, 'yyyy-MM-dd'), 
          end: format(monthEnd, 'yyyy-MM-dd') 
        };
    }
  };

  const dateRange = getDateRange();
  
  const { 
    appointments, 
    isLoading, 
    createAppointment, 
    updateAppointment, 
    deleteAppointment,
    isCreating,
    isUpdating,
    isDeleting
  } = useAppointments(viewMode === 'day' ? dateRange.start : undefined);

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

  // Filter appointments based on view mode and date range
  const filteredAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointment_date);
    
    switch (viewMode) {
      case 'day':
        return isSameDay(aptDate, selectedDate);
      case 'week':
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
        const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
        return isWithinInterval(aptDate, { start: weekStart, end: weekEnd });
      case 'month':
        const monthStart = startOfMonth(selectedDate);
        const monthEnd = endOfMonth(selectedDate);
        return isWithinInterval(aptDate, { start: monthStart, end: monthEnd });
      default:
        return false;
    }
  });

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

  // Group appointments by date for week/month view
  const groupAppointmentsByDate = () => {
    const grouped = new Map<string, Appointment[]>();
    
    filteredAppointments.forEach(apt => {
      const dateKey = apt.appointment_date;
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(apt);
    });
    
    // Sort appointments within each date by time
    grouped.forEach(apts => {
      apts.sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));
    });
    
    return grouped;
  };

  const appointmentsByDate = groupAppointmentsByDate();

  const renderAppointmentCard = (appointment: Appointment) => (
    <Card key={appointment.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-center min-w-[70px]">
              <div className="text-lg font-bold text-primary">{appointment.appointment_time.substring(0, 5)}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 justify-center">
                <Clock className="w-3 h-3" />
                {appointment.duration}min
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground">{appointment.patients.name}</h3>
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
                  {appointment.patients.phone}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
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
  );

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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Agendar Nova Consulta</DialogTitle>
            </DialogHeader>
            <AppointmentForm 
              onSubmit={handleCreateAppointment}
              onCancel={() => setIsDialogOpen(false)}
              isLoading={isCreating}
              initialDate={format(selectedDate, 'yyyy-MM-dd')}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Calendário</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              locale={ptBR}
              className="rounded-md border"
            />
            
            <div className="mt-4">
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="day">Dia</TabsTrigger>
                  <TabsTrigger value="week">Semana</TabsTrigger>
                  <TabsTrigger value="month">Mês</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                {viewMode === 'day' && `Consultas do Dia - ${format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}`}
                {viewMode === 'week' && `Consultas da Semana - ${format(startOfWeek(selectedDate, { weekStartsOn: 0 }), 'd/MM', { locale: ptBR })} a ${format(endOfWeek(selectedDate, { weekStartsOn: 0 }), 'd/MM', { locale: ptBR })}`}
                {viewMode === 'month' && `Consultas de ${format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR })}`}
              </CardTitle>
              <Badge variant="secondary">{filteredAppointments.length} consultas</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Carregando consultas...</span>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma consulta encontrada para este período</p>
              </div>
            ) : viewMode === 'day' ? (
              <div className="space-y-2">
                {filteredAppointments
                  .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
                  .map(appointment => renderAppointmentCard(appointment))}
              </div>
            ) : (
              <div className="space-y-6">
                {Array.from(appointmentsByDate.entries())
                  .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                  .map(([date, dayAppointments]) => (
                    <div key={date} className="space-y-2">
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                        {format(new Date(date + 'T00:00:00'), "EEEE, d 'de' MMMM", { locale: ptBR })}
                      </h3>
                      <div className="space-y-2">
                        {dayAppointments.map(appointment => renderAppointmentCard(appointment))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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