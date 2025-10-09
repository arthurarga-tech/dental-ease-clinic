import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePatients } from "@/hooks/usePatients";
import { useMedicalRecords, MedicalRecord, NewMedicalRecord } from "@/hooks/useMedicalRecords";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const medicalRecordSchema = z.object({
  patient_id: z.string().uuid({ message: "Paciente inválido" }),
  record_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Data inválida" }),
  procedure_type: z.string().trim().min(1, { message: "Tipo de procedimento obrigatório" }).max(100),
  diagnosis: z.string().trim().min(1, { message: "Diagnóstico obrigatório" }).max(500, { message: "Diagnóstico muito longo (máx. 500 caracteres)" }),
  treatment: z.string().trim().min(1, { message: "Tratamento obrigatório" }).max(2000, { message: "Tratamento muito longo (máx. 2000 caracteres)" }),
  observations: z.string().trim().max(2000, { message: "Observações muito longas (máx. 2000 caracteres)" }).optional(),
  status: z.enum(["Agendado", "Em andamento", "Concluído"])
});

interface MedicalRecordFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record?: MedicalRecord | null;
  mode?: 'create' | 'edit';
}

export const MedicalRecordForm = ({ 
  open, 
  onOpenChange, 
  record = null,
  mode = 'create'
}: MedicalRecordFormProps) => {
  const { patients } = usePatients();
  const { createMedicalRecord, updateMedicalRecord, isCreating, isUpdating } = useMedicalRecords();
  const { toast } = useToast();
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    patient_id: '',
    record_date: '',
    procedure_type: '',
    diagnosis: '',
    treatment: '',
    observations: '',
    status: 'Concluído'
  });

  // Update form data when record changes or dialog opens
  useEffect(() => {
    if (record && mode === 'edit') {
      setFormData({
        patient_id: record.patient_id,
        record_date: record.record_date,
        procedure_type: record.procedure_type,
        diagnosis: record.diagnosis,
        treatment: record.treatment,
        observations: record.observations || '',
        status: record.status
      });
    } else if (mode === 'create') {
      // Reset form for create mode
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        patient_id: '',
        record_date: today,
        procedure_type: '',
        diagnosis: '',
        treatment: '',
        observations: '',
        status: 'Concluído'
      });
    }
  }, [record, mode, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      const validated = medicalRecordSchema.parse(formData);
      
      if (mode === 'edit' && record) {
        updateMedicalRecord({
          id: record.id,
          ...validated
        });
      } else {
        createMedicalRecord(validated as NewMedicalRecord);
      }
      
      onOpenChange(false);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
        toast({
          title: "Erro de validação",
          description: "Por favor, corrija os campos destacados.",
          variant: "destructive",
        });
      }
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Editar Registro Médico' : 'Novo Registro Médico'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[600px] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="patient">Paciente</Label>
              <Select value={formData.patient_id} onValueChange={(value) => handleChange('patient_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o paciente" />
                </SelectTrigger>
                <SelectContent>
                  {patients?.map(patient => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date">Data</Label>
              <Input 
                id="date" 
                type="date" 
                value={formData.record_date}
                onChange={(e) => handleChange('record_date', e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Tipo de Procedimento</Label>
              <Select value={formData.procedure_type} onValueChange={(value) => handleChange('procedure_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Consulta">Consulta</SelectItem>
                  <SelectItem value="Limpeza">Limpeza</SelectItem>
                  <SelectItem value="Cirurgia">Cirurgia</SelectItem>
                  <SelectItem value="Retorno">Retorno</SelectItem>
                  <SelectItem value="Urgência">Urgência</SelectItem>
                  <SelectItem value="Extração">Extração</SelectItem>
                  <SelectItem value="Restauração">Restauração</SelectItem>
                  <SelectItem value="Endodontia">Endodontia</SelectItem>
                  <SelectItem value="Ortodontia">Ortodontia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Agendado">Agendado</SelectItem>
                  <SelectItem value="Em andamento">Em andamento</SelectItem>
                  <SelectItem value="Concluído">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

            <div>
              <Label htmlFor="diagnosis">Diagnóstico</Label>
              <Input 
                id="diagnosis" 
                placeholder="Diagnóstico clínico" 
                value={formData.diagnosis}
                onChange={(e) => handleChange('diagnosis', e.target.value)}
                required
                maxLength={500}
                className={errors.diagnosis ? "border-destructive" : ""}
              />
              {errors.diagnosis && (
                <p className="text-sm text-destructive mt-1">{errors.diagnosis}</p>
              )}
            </div>

            <div>
              <Label htmlFor="treatment">Tratamento</Label>
              <Textarea 
                id="treatment" 
                placeholder="Descreva o tratamento realizado/proposto" 
                value={formData.treatment}
                onChange={(e) => handleChange('treatment', e.target.value)}
                required
                maxLength={2000}
                className={errors.treatment ? "border-destructive" : ""}
              />
              {errors.treatment && (
                <p className="text-sm text-destructive mt-1">{errors.treatment}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {formData.treatment.length}/2000 caracteres
              </p>
            </div>

            <div>
              <Label htmlFor="observations">Observações</Label>
              <Textarea 
                id="observations" 
                placeholder="Observações adicionais, orientações ao paciente, etc." 
                value={formData.observations}
                onChange={(e) => handleChange('observations', e.target.value)}
                maxLength={2000}
                className={errors.observations ? "border-destructive" : ""}
              />
              {errors.observations && (
                <p className="text-sm text-destructive mt-1">{errors.observations}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {formData.observations.length}/2000 caracteres
              </p>
            </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isCreating || isUpdating}
            >
              {isCreating || isUpdating ? 'Salvando...' : 'Salvar Registro'}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};