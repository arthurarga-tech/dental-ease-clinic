import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePatients, NewPatient } from "@/hooks/usePatients";
import { useDentists, Dentist } from "@/hooks/useDentists";
import { PatientForm } from "@/components/PatientForm";
import { Loader2, UserPlus } from "lucide-react";
import { NewAppointment, Appointment } from "@/hooks/useAppointments";

const appointmentSchema = z.object({
  patient_id: z.string().min(1, "Selecione um paciente"),
  dentist_id: z.string().min(1, "Selecione um dentista"),
  appointment_date: z.string().min(1, "Data é obrigatória"),
  appointment_time: z.string().min(1, "Horário é obrigatório"),
  type: z.string().min(1, "Tipo de consulta é obrigatório"),
  duration: z.number().min(15, "Duração mínima é 15 minutos").max(240, "Duração máxima é 4 horas"),
  notes: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface AppointmentFormProps {
  onSubmit: (data: NewAppointment) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialDate?: string;
  appointment?: Appointment;
}

export const AppointmentForm = ({ onSubmit, onCancel, isLoading, initialDate, appointment }: AppointmentFormProps) => {
  const { patients, isLoading: loadingPatients, createPatient, isCreating } = usePatients();
  const { dentists, isLoading: loadingDentists } = useDentists();
  const [isNewPatientDialogOpen, setIsNewPatientDialogOpen] = useState(false);

  // Helper function to format date correctly for date input
  const formatDateForInput = (date: string) => {
    const d = new Date(date + 'T00:00:00');
    return d.toISOString().split('T')[0];
  };

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patient_id: appointment?.patient_id || "",
      dentist_id: appointment?.dentist_id || "",
      appointment_date: appointment ? formatDateForInput(appointment.appointment_date) : (initialDate || getCurrentDate()),
      appointment_time: appointment?.appointment_time || "",
      type: appointment?.type || "",
      duration: appointment?.duration || 30,
      notes: appointment?.notes || "",
    },
  });

  const watchedPatientId = watch("patient_id");
  const watchedDentistId = watch("dentist_id");
  const watchedType = watch("type");
  const watchedDate = watch("appointment_date");
  const watchedTime = watch("appointment_time");

  // Filter available dentists based on date and time
  const availableDentists = useMemo(() => {
    if (!watchedDate || !watchedTime || !dentists.length) {
      return dentists.filter(d => d.status === "Ativo");
    }

    const selectedDate = new Date(watchedDate + 'T00:00:00');
    const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Convert time "HH:MM" to minutes for comparison
    const [hours, minutes] = watchedTime.split(':').map(Number);
    const selectedTimeInMinutes = hours * 60 + minutes;

    return dentists.filter(dentist => {
      if (dentist.status !== "Ativo") return false;
      
      // Check if dentist has availability for this day and time
      return dentist.dentist_availability.some(availability => {
        if (availability.day_of_week !== dayOfWeek) return false;
        
        // Convert start and end times to minutes
        const [startH, startM] = availability.start_time.split(':').map(Number);
        const [endH, endM] = availability.end_time.split(':').map(Number);
        const startTimeInMinutes = startH * 60 + startM;
        const endTimeInMinutes = endH * 60 + endM;
        
        // Check if selected time falls within availability range
        return selectedTimeInMinutes >= startTimeInMinutes && selectedTimeInMinutes < endTimeInMinutes;
      });
    });
  }, [watchedDate, watchedTime, dentists]);

  // Auto-select dentist if only one is available
  useEffect(() => {
    if (!appointment && availableDentists.length === 1 && watchedDate && watchedTime) {
      setValue("dentist_id", availableDentists[0].id);
    }
  }, [availableDentists, watchedDate, watchedTime, setValue, appointment]);

  const handleFormSubmit = (data: AppointmentFormData) => {
    // Ensure all required fields are present
    const appointmentData: NewAppointment = {
      patient_id: data.patient_id,
      dentist_id: data.dentist_id,
      appointment_date: data.appointment_date,
      appointment_time: data.appointment_time,
      type: data.type,
      duration: data.duration,
      notes: data.notes || undefined,
    };
    onSubmit(appointmentData);
  };

  const handleCreatePatient = (data: NewPatient) => {
    createPatient(data, {
      onSuccess: (newPatient) => {
        setValue("patient_id", newPatient.id);
        setIsNewPatientDialogOpen(false);
      }
    });
  };

  const appointmentTypes = [
    "Consulta de rotina",
    "Limpeza dental",
    "Extração",
    "Tratamento de canal",
    "Consulta de avaliação",
    "Ortodontia",
    "Implante",
    "Urgência",
  ];

  return (
    <>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3 md:space-y-4">
        <div>
          <Label htmlFor="patient_id" className="text-sm">Paciente *</Label>
          <div className="flex gap-2">
            <div className="flex-1">
              {loadingPatients ? (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="ml-2 text-sm text-muted-foreground">Carregando pacientes...</span>
                </div>
              ) : (
                <Select onValueChange={(value) => setValue("patient_id", value)} value={watchedPatientId}>
                  <SelectTrigger className="text-base">
                    <SelectValue placeholder="Selecione o paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id} className="text-sm">
                        {patient.name} - {patient.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <Button 
              type="button" 
              variant="outline" 
              size="icon"
              onClick={() => setIsNewPatientDialogOpen(true)}
              title="Novo Paciente"
            >
              <UserPlus className="w-4 h-4" />
            </Button>
          </div>
          {errors.patient_id && (
            <p className="text-sm text-destructive mt-1">{errors.patient_id.message}</p>
          )}
        </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        <div>
          <Label htmlFor="appointment_date" className="text-sm">Data *</Label>
          <Input
            id="appointment_date"
            type="date"
            className="text-base"
            {...register("appointment_date")}
          />
          {errors.appointment_date && (
            <p className="text-sm text-destructive mt-1">{errors.appointment_date.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="appointment_time" className="text-sm">Horário *</Label>
          <Input
            id="appointment_time"
            type="time"
            step="300"
            className="text-base"
            {...register("appointment_time")}
          />
          {errors.appointment_time && (
            <p className="text-sm text-destructive mt-1">{errors.appointment_time.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="dentist_id" className="text-sm">
          Dentista * 
          {availableDentists.length === 0 && watchedDate && watchedTime && (
            <span className="text-xs text-muted-foreground ml-2">(Nenhum disponível neste horário)</span>
          )}
          {availableDentists.length === 1 && watchedDate && watchedTime && (
            <span className="text-xs text-muted-foreground ml-2">(Selecionado automaticamente)</span>
          )}
        </Label>
        {loadingDentists ? (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="ml-2 text-sm text-muted-foreground">Carregando dentistas...</span>
          </div>
        ) : (
          <Select 
            onValueChange={(value) => setValue("dentist_id", value)} 
            value={watchedDentistId}
            disabled={availableDentists.length === 0}
          >
            <SelectTrigger className="text-base">
              <SelectValue placeholder={availableDentists.length === 0 ? "Nenhum dentista disponível" : "Selecione o dentista"} />
            </SelectTrigger>
            <SelectContent>
              {availableDentists.map((dentist) => (
                <SelectItem key={dentist.id} value={dentist.id} className="text-sm">
                  {dentist.name} - CRO {dentist.cro}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {errors.dentist_id && (
          <p className="text-sm text-destructive mt-1">{errors.dentist_id.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="type" className="text-sm">Tipo de Consulta *</Label>
        <Select onValueChange={(value) => setValue("type", value)} value={watchedType}>
          <SelectTrigger className="text-base">
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            {appointmentTypes.map((type) => (
              <SelectItem key={type} value={type} className="text-sm">
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.type && (
          <p className="text-sm text-destructive mt-1">{errors.type.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="duration" className="text-sm">Duração (minutos) *</Label>
        <Input
          id="duration"
          type="number"
          min="15"
          max="240"
          step="15"
          className="text-base"
          {...register("duration", { valueAsNumber: true })}
        />
        {errors.duration && (
          <p className="text-sm text-destructive mt-1">{errors.duration.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="notes" className="text-sm">Observações</Label>
        <Textarea
          id="notes"
          placeholder="Observações adicionais sobre a consulta..."
          className="min-h-[60px] md:min-h-[80px] text-base"
          {...register("notes")}
        />
      </div>

        <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2 md:pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button type="submit" className="flex-1" disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {appointment ? "Atualizar Consulta" : "Agendar Consulta"}
          </Button>
        </div>
      </form>

      <Dialog open={isNewPatientDialogOpen} onOpenChange={setIsNewPatientDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cadastrar Novo Paciente</DialogTitle>
          </DialogHeader>
          <PatientForm 
            onSubmit={handleCreatePatient}
            onCancel={() => setIsNewPatientDialogOpen(false)}
            isLoading={isCreating}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};