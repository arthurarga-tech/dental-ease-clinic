import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Budget } from "@/hooks/useBudgets";
import { useAuth } from "@/hooks/useAuth";

interface BudgetViewDialogProps {
  budget: Budget | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BudgetViewDialog = ({
  budget,
  open,
  onOpenChange,
}: BudgetViewDialogProps) => {
  const { userRole } = useAuth();
  const isDentistUser = userRole === 'dentista' || userRole === 'dentist';
  
  if (!budget) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Aprovado":
        return "bg-green-500";
      case "Pendente":
        return "bg-yellow-500";
      case "Recusado":
        return "bg-red-500";
      case "Expirado":
        return "bg-gray-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalhes do Orçamento</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                {budget.patients?.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {budget.patients?.phone}
              </p>
            </div>
            <Badge className={getStatusColor(budget.status)}>
              {budget.status}
            </Badge>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Data do Orçamento
              </p>
              <p className="text-sm">
                {format(new Date(budget.budget_date), "dd/MM/yyyy", {
                  locale: ptBR,
                })}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Válido Até
              </p>
              <p className="text-sm">
                {format(new Date(budget.valid_until), "dd/MM/yyyy", {
                  locale: ptBR,
                })}
              </p>
            </div>

            {budget.dentists && (
              <div className="col-span-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Dentista
                </p>
                <p className="text-sm">{budget.dentists.name}</p>
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Procedimentos
            </p>
            <div className="space-y-2">
              {(() => {
                try {
                  let procedures = JSON.parse(budget.procedures);
                  // For dentist users, filter out completed procedures
                  if (isDentistUser) {
                    procedures = procedures.filter((p: any) => p.status !== "Concluído");
                  }
                  return procedures.map((proc: any, index: number) => (
                    <div key={index} className="flex justify-between items-center bg-muted p-3 rounded-md">
                      <div className="flex-1">
                        {proc.category && (
                          <span className="text-xs text-muted-foreground block">{proc.category}</span>
                        )}
                        <span className="text-sm font-medium">{proc.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={
                          proc.status === "Concluído" ? "bg-green-100 text-green-800" :
                          proc.status === "Em Andamento" ? "bg-blue-100 text-blue-800" :
                          proc.status === "Cancelado" ? "bg-red-100 text-red-800" :
                          "bg-yellow-100 text-yellow-800"
                        }>
                          {proc.status || "Pendente"}
                        </Badge>
                        <span className="text-sm font-semibold">R$ {proc.value.toFixed(2)}</span>
                      </div>
                    </div>
                  ));
                } catch {
                  return (
                    <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-md">
                      {budget.procedures}
                    </p>
                  );
                }
              })()}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 bg-muted p-4 rounded-md">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Valor Total
              </p>
              <p className="text-lg font-semibold">
                R$ {budget.total_amount.toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Desconto
              </p>
              <p className="text-lg font-semibold text-red-500">
                - R$ {budget.discount.toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Valor Final
              </p>
              <p className="text-lg font-semibold text-green-600">
                R$ {budget.final_amount.toFixed(2)}
              </p>
            </div>
          </div>

          {budget.notes && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Observações
              </p>
              <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-md">
                {budget.notes}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
