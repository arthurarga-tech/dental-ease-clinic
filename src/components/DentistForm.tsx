import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useDentists, type Dentist } from "@/hooks/useDentists";

interface DentistFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dentist?: Dentist;
}

export const DentistForm = ({ open, onOpenChange, dentist }: DentistFormProps) => {
  const { specializations, createDentist, updateDentist, isCreating, isUpdating } = useDentists();
  const [formData, setFormData] = useState({
    name: dentist?.name || "",
    email: dentist?.email || "",
    phone: dentist?.phone || "",
    cro: dentist?.cro || "",
    birth_date: dentist?.birth_date || "",
    address: dentist?.address || "",
    specialization_ids: dentist?.dentist_specializations.map(ds => ds.specializations.id) || [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (dentist) {
      updateDentist({
        id: dentist.id,
        ...formData,
      });
    } else {
      createDentist(formData);
    }
    
    onOpenChange(false);
    setFormData({
      name: "",
      email: "",
      phone: "",
      cro: "",
      birth_date: "",
      address: "",
      specialization_ids: [],
    });
  };

  const handleSpecializationChange = (specializationId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      specialization_ids: checked
        ? [...prev.specialization_ids, specializationId]
        : prev.specialization_ids.filter(id => id !== specializationId)
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