import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { type Dentist } from "@/hooks/useDentists";

interface DentistDeleteDialogProps {
  dentist: Dentist | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (dentist: Dentist) => void;
}

export const DentistDeleteDialog = ({ dentist, open, onOpenChange, onConfirm }: DentistDeleteDialogProps) => {
  if (!dentist) return null;

  const handleConfirm = () => {
    onConfirm(dentist);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Confirmar Exclusão
          </DialogTitle>
          <DialogDescription className="text-left">
            Tem certeza que deseja excluir o dentista <strong>{dentist.name}</strong>?
            Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nome:</span>
              <span className="font-medium">{dentist.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">CRO:</span>
              <span className="font-medium">{dentist.cro}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Telefone:</span>
              <span className="font-medium">{dentist.phone}</span>
            </div>
            {dentist.dentist_specializations.length > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Especializações:</span>
                <span className="font-medium text-right">
                  {dentist.dentist_specializations.map(ds => ds.specializations.name).join(", ")}
                </span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
          >
            Excluir Dentista
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};