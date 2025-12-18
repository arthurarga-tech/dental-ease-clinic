import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePatients } from "@/hooks/usePatients";
import { useDentistPatients } from "@/hooks/useDentistPatients";
import { useMedicalRecords, MedicalRecord, NewMedicalRecord } from "@/hooks/useMedicalRecords";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Odontogram } from "@/components/Odontogram";
import { z } from "zod";
import { getTodayLocalDate } from "@/lib/utils";

const medicalRecordSchema = z.object({
  patient_id: z.string().uuid({ message: "Paciente inválido" }),
  record_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Data inválida" }),
  observations: z.string().trim().max(2000, { message: "Observações muito longas (máx. 2000 caracteres)" }).optional(),
});

interface MedicalRecordFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record?: MedicalRecord | null;
  mode?: 'create' | 'edit';
  preselectedPatientId?: string;
}

export const MedicalRecordForm = ({ 
  open, 
  onOpenChange, 
  record = null,
  mode = 'create',
  preselectedPatientId
}: MedicalRecordFormProps) => {
  const { patients: allPatients } = usePatients();
  const { patients: dentistPatients } = useDentistPatients();
  const { userRole } = useAuth();
  const { createMedicalRecord, updateMedicalRecord, isCreating, isUpdating } = useMedicalRecords();
  const { toast } = useToast();
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const isDentistUser = userRole === 'dentista' || userRole === 'dentist';
  const patients = isDentistUser ? dentistPatients : allPatients;
  
  const [formData, setFormData] = useState({
    patient_id: '',
    record_date: '',
    observations: '',
  });

  const [odontogram, setOdontogram] = useState<Record<string, any>>({});

  // Update form data when record changes or dialog opens
  useEffect(() => {
    if (record && mode === 'edit') {
      setFormData({
        patient_id: record.patient_id,
        record_date: record.record_date,
        observations: record.observations || '',
      });
      setOdontogram(record.odontogram || {});
    } else if (mode === 'create') {
      // Reset form for create mode
      const today = getTodayLocalDate();
      setFormData({
        patient_id: preselectedPatientId || '',
        record_date: today,
        observations: '',
      });
      setOdontogram({});
    }
  }, [record, mode, open, preselectedPatientId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      const validated = medicalRecordSchema.parse(formData);
      
      if (mode === 'edit' && record) {
        updateMedicalRecord({
          id: record.id,
          ...validated,
          odontogram
        });
      } else {
        createMedicalRecord({
          ...validated,
          odontogram
        } as NewMedicalRecord);
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
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Editar Prontuário' : 'Novo Prontuário'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="general">Informações Gerais</TabsTrigger>
              <TabsTrigger value="odontogram">Odontograma</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-4 max-h-[500px] overflow-y-auto">
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

              <div>
                <Label htmlFor="observations">Observações Gerais do Paciente</Label>
                <Textarea 
                  id="observations" 
                  placeholder="Observações gerais sobre o histórico do paciente..." 
                  value={formData.observations}
                  onChange={(e) => handleChange('observations', e.target.value)}
                  maxLength={2000}
                  className={errors.observations ? "border-destructive" : ""}
                  rows={6}
                />
                {errors.observations && (
                  <p className="text-sm text-destructive mt-1">{errors.observations}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.observations.length}/2000 caracteres
                </p>
              </div>
            </TabsContent>

            <TabsContent value="odontogram" className="max-h-[500px] overflow-y-auto">
              <Odontogram value={odontogram} onChange={setOdontogram} />
            </TabsContent>
          </Tabs>

          <div className="flex gap-2 pt-4 border-t">
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isCreating || isUpdating}
            >
              {isCreating || isUpdating ? 'Salvando...' : 'Salvar Prontuário'}
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