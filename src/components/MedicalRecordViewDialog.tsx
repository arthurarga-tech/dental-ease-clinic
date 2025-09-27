import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MedicalRecord } from "@/hooks/useMedicalRecords";
import { 
  Calendar,
  User,
  Stethoscope,
  FileText,
  Edit,
  Trash2
} from "lucide-react";

interface MedicalRecordViewDialogProps {
  record: MedicalRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const MedicalRecordViewDialog = ({ 
  record, 
  open, 
  onOpenChange, 
  onEdit,
  onDelete
}: MedicalRecordViewDialogProps) => {
  if (!record) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Concluído":
        return "bg-success text-success-foreground";
      case "Em andamento":
        return "bg-warning text-warning-foreground";
      case "Agendado":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatLocalDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1).toLocaleDateString('pt-BR');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <DialogTitle>Detalhes do Registro Médico</DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onDelete}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient and Status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-muted-foreground" />
              <span className="text-lg font-semibold">{record.patients.name}</span>
            </div>
            <Badge className={getStatusColor(record.status)}>
              {record.status}
            </Badge>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Calendar className="w-4 h-4" />
                  Data do Registro
                </div>
                <p className="font-medium">{formatLocalDate(record.record_date)}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Stethoscope className="w-4 h-4" />
                  Tipo de Procedimento
                </div>
                <p className="font-medium">{record.procedure_type}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Diagnóstico</p>
                <p className="font-medium">{record.diagnosis}</p>
              </div>
            </div>
          </div>

          {/* Treatment */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Tratamento</p>
            <div className="bg-secondary/50 p-4 rounded-lg">
              <p className="text-sm leading-relaxed">{record.treatment}</p>
            </div>
          </div>

          {/* Observations */}
          {record.observations && (
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <FileText className="w-4 h-4" />
                Observações
              </div>
              <div className="bg-secondary/50 p-4 rounded-lg">
                <p className="text-sm leading-relaxed">{record.observations}</p>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-4 border-t border-border">
            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
              <div>
                <span className="font-medium">Criado em:</span>{' '}
                {new Date(record.created_at).toLocaleString('pt-BR')}
              </div>
              <div>
                <span className="font-medium">Atualizado em:</span>{' '}
                {new Date(record.updated_at).toLocaleString('pt-BR')}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};