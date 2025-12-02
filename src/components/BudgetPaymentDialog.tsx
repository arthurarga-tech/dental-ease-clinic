import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Budget, useBudgets } from "@/hooks/useBudgets";
import { useFinancial } from "@/hooks/useFinancial";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, CreditCard, CheckCircle } from "lucide-react";

interface Procedure {
  name: string;
  value: number;
  category?: string;
  status: string;
}

interface BudgetPaymentDialogProps {
  budget: Budget | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BudgetPaymentDialog = ({
  budget,
  open,
  onOpenChange,
}: BudgetPaymentDialogProps) => {
  const { toast } = useToast();
  const { categories, paymentMethods, createTransactionAsync, isCreating } = useFinancial();
  const { updateBudget } = useBudgets();
  
  const [selectedProcedures, setSelectedProcedures] = useState<number[]>([]);
  const [paymentMethodId, setPaymentMethodId] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const procedures: Procedure[] = budget?.procedures 
    ? (() => {
        try {
          return JSON.parse(budget.procedures);
        } catch {
          return [];
        }
      })()
    : [];

  // Filter only procedures that are "Pendente" (not yet started/completed)
  const pendingProcedures = procedures.map((proc, index) => ({
    ...proc,
    originalIndex: index
  })).filter(proc => proc.status === "Pendente" || !proc.status);

  useEffect(() => {
    if (open) {
      setSelectedProcedures([]);
      setPaymentMethodId("");
    }
  }, [open]);

  if (!budget) return null;

  const selectedTotal = selectedProcedures.reduce((sum, index) => {
    const proc = pendingProcedures.find(p => p.originalIndex === index);
    return sum + (proc?.value || 0);
  }, 0);

  const revenueCategory = categories.find(c => c.type === "Receita" && c.name === "Procedimento");
  const defaultCategoryId = revenueCategory?.id || categories.find(c => c.type === "Receita")?.id;

  const handleToggleProcedure = (originalIndex: number) => {
    setSelectedProcedures(prev => 
      prev.includes(originalIndex)
        ? prev.filter(i => i !== originalIndex)
        : [...prev, originalIndex]
    );
  };

  const handleSelectAll = () => {
    if (selectedProcedures.length === pendingProcedures.length) {
      setSelectedProcedures([]);
    } else {
      setSelectedProcedures(pendingProcedures.map(p => p.originalIndex));
    }
  };

  const handleProcessPayment = async () => {
    if (selectedProcedures.length === 0) {
      toast({
        title: "Selecione procedimentos",
        description: "Selecione pelo menos um procedimento para lançar o pagamento.",
        variant: "destructive",
      });
      return;
    }

    if (!paymentMethodId) {
      toast({
        title: "Selecione forma de pagamento",
        description: "Selecione a forma de pagamento antes de continuar.",
        variant: "destructive",
      });
      return;
    }

    if (!defaultCategoryId) {
      toast({
        title: "Categoria não encontrada",
        description: "Não foi possível encontrar uma categoria de receita.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create financial transactions for each selected procedure
      for (const index of selectedProcedures) {
        const proc = procedures[index];
        
        await createTransactionAsync({
          type: "Receita",
          patient_id: budget.patient_id,
          dentist_id: budget.dentist_id || undefined,
          category_id: defaultCategoryId,
          payment_method_id: paymentMethodId,
          amount: proc.value,
          description: `Procedimento: ${proc.name} (Orçamento)`,
          transaction_date: format(new Date(), "yyyy-MM-dd"),
          status: "Pago",
        });
      }

      // Update procedures status in budget
      const updatedProcedures = procedures.map((proc, index) => ({
        ...proc,
        status: selectedProcedures.includes(index) ? "Em Andamento" : proc.status
      }));

      updateBudget({
        id: budget.id,
        procedures: JSON.stringify(updatedProcedures),
      });

      toast({
        title: "Pagamento processado",
        description: `${selectedProcedures.length} procedimento(s) lançado(s) com sucesso.`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Error processing payment:", error);
      toast({
        title: "Erro ao processar pagamento",
        description: "Ocorreu um erro ao processar o pagamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pendente":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case "Em Andamento":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Em Andamento</Badge>;
      case "Concluído":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Concluído</Badge>;
      case "Cancelado":
        return <Badge variant="outline" className="bg-red-100 text-red-800">Cancelado</Badge>;
      default:
        return <Badge variant="outline">Pendente</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Lançar Pagamento de Procedimentos
          </DialogTitle>
          <DialogDescription>
            Selecione os procedimentos autorizados pelo paciente para lançar o pagamento.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient Info */}
          <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
            <div>
              <p className="font-semibold">{budget.patients?.name}</p>
              <p className="text-sm text-muted-foreground">{budget.patients?.phone}</p>
            </div>
            {budget.dentists && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Dentista</p>
                <p className="text-sm font-medium">{budget.dentists.name}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Procedures Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Procedimentos Pendentes</Label>
              {pendingProcedures.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedProcedures.length === pendingProcedures.length 
                    ? "Desmarcar Todos" 
                    : "Selecionar Todos"}
                </Button>
              )}
            </div>

            {pendingProcedures.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                <p>Todos os procedimentos já foram processados.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingProcedures.map((proc) => (
                  <div
                    key={proc.originalIndex}
                    className={`flex items-center justify-between p-3 border rounded-lg transition-colors cursor-pointer ${
                      selectedProcedures.includes(proc.originalIndex)
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => handleToggleProcedure(proc.originalIndex)}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedProcedures.includes(proc.originalIndex)}
                        onCheckedChange={() => handleToggleProcedure(proc.originalIndex)}
                      />
                      <div>
                        {proc.category && (
                          <span className="text-xs text-muted-foreground block">
                            {proc.category}
                          </span>
                        )}
                        <span className="font-medium">{proc.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(proc.status || "Pendente")}
                      <span className="font-semibold text-lg">
                        R$ {proc.value.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {pendingProcedures.length > 0 && (
            <>
              <Separator />

              {/* Payment Method */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Forma de Pagamento
                </Label>
                <Select value={paymentMethodId} onValueChange={setPaymentMethodId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a forma de pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        {method.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Summary */}
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {selectedProcedures.length} procedimento(s) selecionado(s)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total a Lançar</p>
                    <p className="text-2xl font-bold text-green-600">
                      R$ {selectedTotal.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  onClick={handleProcessPayment}
                  disabled={selectedProcedures.length === 0 || !paymentMethodId || isProcessing || isCreating}
                >
                  {isProcessing || isCreating ? "Processando..." : "Lançar Pagamento"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};