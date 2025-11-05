import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMedicalRecordEntries, MedicalRecordEntry, NewMedicalRecordEntry } from "@/hooks/useMedicalRecordEntries";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const entrySchema = z.object({
  medical_record_id: z.string().uuid({ message: "Prontuário inválido" }),
  record_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Data inválida" }),
  procedure_type: z.string().trim().min(1, { message: "Tipo de procedimento obrigatório" }),
  diagnosis: z.string().trim().min(1, { message: "Diagnóstico obrigatório" }),
  treatment: z.string().trim().min(1, { message: "Tratamento obrigatório" }),
  observations: z.string().trim().optional(),
  status: z.enum(["Agendado", "Em andamento", "Concluído"])
});

interface ConsultationEntryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicalRecordId: string;
  entry?: MedicalRecordEntry | null;
  mode?: 'create' | 'edit';
}

export const ConsultationEntryForm = ({ 
  open, 
  onOpenChange, 
  medicalRecordId,
  entry = null,
  mode = 'create'
}: ConsultationEntryFormProps) => {
  const { createEntry, updateEntry, isCreating, isUpdating } = useMedicalRecordEntries(medicalRecordId);
  const { toast } = useToast();
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    medical_record_id: medicalRecordId,
    record_date: '',
    procedure_type: '',
    diagnosis: '',
    treatment: '',
    observations: '',
    status: 'Concluído'
  });

  useEffect(() => {
    if (entry && mode === 'edit') {
      setFormData({
        medical_record_id: entry.medical_record_id,
        record_date: entry.record_date,
        procedure_type: entry.procedure_type,
        diagnosis: entry.diagnosis,
        treatment: entry.treatment,
        observations: entry.observations || '',
        status: entry.status
      });
    } else if (mode === 'create') {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        medical_record_id: medicalRecordId,
        record_date: today,
        procedure_type: '',
        diagnosis: '',
        treatment: '',
        observations: '',
        status: 'Concluído'
      });
    }
  }, [entry, mode, open, medicalRecordId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      const validated = entrySchema.parse(formData);
      
      if (mode === 'edit' && entry) {
        updateEntry({
          id: entry.id,
          ...validated
        });
      } else {
        createEntry(validated as NewMedicalRecordEntry);
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
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Editar Consulta' : 'Nova Consulta'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[600px] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
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
            <Label htmlFor="diagnosis">Diagnóstico</Label>
            <Input 
              id="diagnosis" 
              placeholder="Diagnóstico desta consulta" 
              value={formData.diagnosis}
              onChange={(e) => handleChange('diagnosis', e.target.value)}
              required
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
              placeholder="Descreva o tratamento realizado nesta consulta" 
              value={formData.treatment}
              onChange={(e) => handleChange('treatment', e.target.value)}
              required
              className={errors.treatment ? "border-destructive" : ""}
              rows={4}
            />
            {errors.treatment && (
              <p className="text-sm text-destructive mt-1">{errors.treatment}</p>
            )}
          </div>

          <div>
            <Label htmlFor="observations">Observações</Label>
            <Textarea 
              id="observations" 
              placeholder="Observações sobre esta consulta..." 
              value={formData.observations}
              onChange={(e) => handleChange('observations', e.target.value)}
              className={errors.observations ? "border-destructive" : ""}
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isCreating || isUpdating}
            >
              {isCreating || isUpdating ? 'Salvando...' : 'Salvar Consulta'}
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
