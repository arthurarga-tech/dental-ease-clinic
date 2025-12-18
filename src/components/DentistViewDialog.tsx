import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { type Dentist } from "@/hooks/useDentists";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Edit, Mail, Phone, MapPin, Calendar, IdCard } from "lucide-react";
import { formatBrazilianPhone } from "@/lib/phone-utils";

interface DentistViewDialogProps {
  dentist: Dentist | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (dentist: Dentist) => void;
}

export const DentistViewDialog = ({ dentist, open, onOpenChange, onEdit }: DentistViewDialogProps) => {
  if (!dentist) return null;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Detalhes do Dentista
            <Button
              size="sm"
              onClick={() => {
                onEdit(dentist);
                onOpenChange(false);
              }}
            >
              <Edit className="w-4 h-4 mr-1" />
              Editar
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header with name and status */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{dentist.name}</h2>
              <Badge 
                variant={dentist.status === "Ativo" ? "default" : "secondary"}
                className="mt-2"
              >
                {dentist.status}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Informações de Contato</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium">{formatBrazilianPhone(dentist.phone)}</p>
                </div>
              </div>

              {dentist.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{dentist.email}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <IdCard className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">CRO</p>
                  <p className="font-medium">{dentist.cro}</p>
                </div>
              </div>

              {dentist.birth_date && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Data de Nascimento</p>
                    <p className="font-medium">{formatDate(dentist.birth_date)}</p>
                  </div>
                </div>
              )}
            </div>

            {dentist.address && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">Endereço</p>
                  <p className="font-medium">{dentist.address}</p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Specializations */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Especializações</h3>
            
            {dentist.dentist_specializations.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {dentist.dentist_specializations.map((ds) => (
                  <Badge 
                    key={ds.specializations.id} 
                    variant="outline"
                    className="text-sm"
                  >
                    {ds.specializations.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground italic">Nenhuma especialização cadastrada</p>
            )}
          </div>

          <Separator />

          {/* Availability */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Disponibilidade</h3>
            
            {dentist.dentist_availability.length > 0 ? (
              <div className="space-y-2">
                {dentist.dentist_availability
                  .sort((a, b) => a.day_of_week - b.day_of_week)
                  .map((availability) => {
                    const days = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
                    return (
                      <div key={availability.id} className="flex items-center gap-2">
                        <Badge variant="outline" className="min-w-[140px]">
                          {days[availability.day_of_week]}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {availability.start_time} - {availability.end_time}
                        </span>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-muted-foreground italic">Nenhuma disponibilidade cadastrada</p>
            )}
          </div>

          <Separator />

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <p>Cadastrado em: {format(new Date(dentist.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
            </div>
            <div>
              <p>Atualizado em: {format(new Date(dentist.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};