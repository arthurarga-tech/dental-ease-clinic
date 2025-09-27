import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MedicalRecord } from "@/hooks/useMedicalRecords";

interface MedicalRecordDeleteDialogProps {
  record: MedicalRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export const MedicalRecordDeleteDialog = ({ 
  record, 
  open, 
  onOpenChange, 
  onConfirm, 
  isDeleting 
}: MedicalRecordDeleteDialogProps) => {
  if (!record) return null;

  const formatLocalDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1).toLocaleDateString('pt-BR');
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Registro Médico</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>Tem certeza que deseja excluir este registro médico?</p>
              <div className="bg-muted p-3 rounded-md text-sm">
                <p><strong>Paciente:</strong> {record.patients.name}</p>
                <p><strong>Data:</strong> {formatLocalDate(record.record_date)}</p>
                <p><strong>Procedimento:</strong> {record.procedure_type}</p>
                <p><strong>Diagnóstico:</strong> {record.diagnosis}</p>
              </div>
              <p className="text-sm text-destructive">
                Esta ação não pode ser desfeita e o registro será removido permanentemente.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};