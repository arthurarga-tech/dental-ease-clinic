import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePatients } from "@/hooks/usePatients";
import { Loader2 } from "lucide-react";
import { NewAppointment, Appointment } from "@/hooks/useAppointments";

const appointmentSchema = z.object({
  patient_id: z.string().min(1, "Selecione um paciente"),
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
  const { patients, isLoading: loadingPatients } = usePatients();

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
      appointment_date: appointment ? formatDateForInput(appointment.appointment_date) : (initialDate || getCurrentDate()),
      appointment_time: appointment?.appointment_time || "",
      type: appointment?.type || "",
      duration: appointment?.duration || 60,
      notes: appointment?.notes || "",
    },
  });

  const watchedPatientId = watch("patient_id");
  const watchedType = watch("type");

  const handleFormSubmit = (data: AppointmentFormData) => {
    // Ensure all required fields are present
    const appointmentData: NewAppointment = {
      patient_id: data.patient_id,
      appointment_date: data.appointment_date,
      appointment_time: data.appointment_time,
      type: data.type,
      duration: data.duration,
      notes: data.notes || undefined,
    };
    onSubmit(appointmentData);
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
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3 md:space-y-4">
      <div>
        <Label htmlFor="patient_id" className="text-sm">Paciente *</Label>
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
  );
};