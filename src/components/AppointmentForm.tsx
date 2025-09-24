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
import { NewAppointment } from "@/hooks/useAppointments";

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
}

export const AppointmentForm = ({ onSubmit, onCancel, isLoading, initialDate }: AppointmentFormProps) => {
  const { patients, isLoading: loadingPatients } = usePatients();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      appointment_date: initialDate || new Date().toISOString().split('T')[0],
      duration: 60,
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
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="patient_id">Paciente *</Label>
        {loadingPatients ? (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="ml-2 text-sm text-muted-foreground">Carregando pacientes...</span>
          </div>
        ) : (
          <Select onValueChange={(value) => setValue("patient_id", value)} value={watchedPatientId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o paciente" />
            </SelectTrigger>
            <SelectContent>
              {patients.map((patient) => (
                <SelectItem key={patient.id} value={patient.id}>
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="appointment_date">Data *</Label>
          <Input
            id="appointment_date"
            type="date"
            {...register("appointment_date")}
          />
          {errors.appointment_date && (
            <p className="text-sm text-destructive mt-1">{errors.appointment_date.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="appointment_time">Horário *</Label>
          <Input
            id="appointment_time"
            type="time"
            step="300"
            {...register("appointment_time")}
          />
          {errors.appointment_time && (
            <p className="text-sm text-destructive mt-1">{errors.appointment_time.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="type">Tipo de Consulta *</Label>
        <Select onValueChange={(value) => setValue("type", value)} value={watchedType}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            {appointmentTypes.map((type) => (
              <SelectItem key={type} value={type}>
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
        <Label htmlFor="duration">Duração (minutos) *</Label>
        <Input
          id="duration"
          type="number"
          min="15"
          max="240"
          step="15"
          {...register("duration", { valueAsNumber: true })}
        />
        {errors.duration && (
          <p className="text-sm text-destructive mt-1">{errors.duration.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          placeholder="Observações adicionais sobre a consulta..."
          {...register("notes")}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Agendar Consulta
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
};