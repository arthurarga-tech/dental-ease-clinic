import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useDentists, type Dentist, type AvailabilitySlot } from "@/hooks/useDentists";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";

interface DentistFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dentist?: Dentist;
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
  { value: 6, label: "Sábado" },
];

export const DentistForm = ({ open, onOpenChange, dentist }: DentistFormProps) => {
  const { specializations, createDentist, updateDentist, isCreating, isUpdating } = useDentists();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cro: "",
    birth_date: "",
    address: "",
    commission_percentage: 50,
    specialization_ids: [] as string[],
    availability_slots: [] as AvailabilitySlot[],
  });

  // Update form data when dentist changes
  useEffect(() => {
    if (dentist) {
      setFormData({
        name: dentist.name || "",
        email: dentist.email || "",
        phone: dentist.phone || "",
        cro: dentist.cro || "",
        birth_date: dentist.birth_date || "",
        address: dentist.address || "",
        commission_percentage: dentist.commission_percentage || 50,
        specialization_ids: dentist.dentist_specializations.map(ds => ds.specializations.id) || [],
        availability_slots: dentist.dentist_availability.map(da => ({
          day_of_week: da.day_of_week,
          start_time: da.start_time,
          end_time: da.end_time,
        })) || [],
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        cro: "",
        birth_date: "",
        address: "",
        commission_percentage: 50,
        specialization_ids: [],
        availability_slots: [],
      });
    }
  }, [dentist, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, preencha o nome do dentista.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.cro.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, preencha o CRO do dentista.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.phone.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, preencha o telefone do dentista.",
        variant: "destructive",
      });
      return;
    }
    
    // Email validation if provided
    if (formData.email && formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast({
        title: "Email inválido",
        description: "Por favor, insira um email válido.",
        variant: "destructive",
      });
      return;
    }
    
    if (dentist) {
      updateDentist({
        id: dentist.id,
        ...formData,
      });
    } else {
      createDentist(formData);
    }
    
    onOpenChange(false);
  };

  const handleSpecializationChange = (specializationId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      specialization_ids: checked
        ? [...prev.specialization_ids, specializationId]
        : prev.specialization_ids.filter(id => id !== specializationId)
    }));
  };

  const handleAddAvailabilitySlot = (dayValue: number) => {
    setFormData(prev => ({
      ...prev,
      availability_slots: [
        ...prev.availability_slots,
        { day_of_week: dayValue, start_time: "08:00", end_time: "18:00" }
      ]
    }));
  };

  const handleRemoveAvailabilitySlot = (index: number) => {
    setFormData(prev => ({
      ...prev,
      availability_slots: prev.availability_slots.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateAvailabilitySlot = (index: number, field: 'start_time' | 'end_time', value: string) => {
    setFormData(prev => ({
      ...prev,
      availability_slots: prev.availability_slots.map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      )
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {dentist ? "Editar Dentista" : "Novo Dentista"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cro">CRO *</Label>
              <Input
                id="cro"
                value={formData.cro}
                onChange={(e) => setFormData({ ...formData, cro: e.target.value })}
                placeholder="Ex: CRO/SP 12345"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(11) 99999-9999"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="dentista@email.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="birth_date">Data de Nascimento</Label>
              <Input
                id="birth_date"
                type="date"
                value={formData.birth_date}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="commission_percentage">Comissão (%)</Label>
              <Input
                id="commission_percentage"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.commission_percentage}
                onChange={(e) => setFormData({ ...formData, commission_percentage: Number(e.target.value) })}
                placeholder="50.00"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Endereço completo"
              rows={2}
            />
          </div>

          <div className="space-y-3">
            <Label>Especializações</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {specializations.map((specialization) => (
                <div key={specialization.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={specialization.id}
                    checked={formData.specialization_ids.includes(specialization.id)}
                    onCheckedChange={(checked) => 
                      handleSpecializationChange(specialization.id, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={specialization.id}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {specialization.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Horários Disponíveis</Label>
            <div className="space-y-4">
              {DAYS_OF_WEEK.map((day) => {
                const daySlots = formData.availability_slots.filter(slot => slot.day_of_week === day.value);
                return (
                  <div key={day.value} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">{day.label}</Label>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddAvailabilitySlot(day.value)}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Adicionar Horário
                      </Button>
                    </div>
                    {daySlots.length > 0 && (
                      <div className="space-y-2 pl-4">
                        {formData.availability_slots.map((slot, index) => {
                          if (slot.day_of_week !== day.value) return null;
                          return (
                            <div key={index} className="flex items-center gap-2">
                              <Input
                                type="time"
                                value={slot.start_time}
                                onChange={(e) => handleUpdateAvailabilitySlot(index, 'start_time', e.target.value)}
                                className="flex-1"
                              />
                              <span className="text-muted-foreground">até</span>
                              <Input
                                type="time"
                                value={slot.end_time}
                                onChange={(e) => handleUpdateAvailabilitySlot(index, 'end_time', e.target.value)}
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => handleRemoveAvailabilitySlot(index)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isCreating || isUpdating}
              className="flex-1"
            >
              {dentist ? "Atualizar" : "Cadastrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};