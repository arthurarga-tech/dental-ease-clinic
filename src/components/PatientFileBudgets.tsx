import { useState, useMemo } from "react";
import { Plus, Eye, Pencil, Trash2, DollarSign, UserCheck, Stethoscope } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useBudgets, Budget } from "@/hooks/useBudgets";
import { BudgetForm } from "@/components/BudgetForm";
import { BudgetViewDialog } from "@/components/BudgetViewDialog";
import { BudgetDeleteDialog } from "@/components/BudgetDeleteDialog";
import { BudgetPaymentDialog } from "@/components/BudgetPaymentDialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface PatientFileBudgetsProps {
  patientId: string;
  patientName: string;
}

export const PatientFileBudgets = ({ patientId, patientName }: PatientFileBudgetsProps) => {
  const { budgets, isLoading, createBudget, updateBudget, deleteBudget, isCreating, isUpdating, checkDuplicateBudget } = useBudgets();
  const { toast } = useToast();
  const { userRole } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  
  const isDentistUser = userRole === 'dentista' || userRole === 'dentist';
  
  // Fetch appointment dentists for this patient
  const { data: appointmentDentists } = useQuery({
    queryKey: ["patient-appointment-dentists", patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          dentist_id,
          dentists (
            id,
            name
          )
        `)
        .eq("patient_id", patientId)
        .not("dentist_id", "is", null);

      if (error) throw error;

      const uniqueDentists: { dentist_id: string; dentist_name: string }[] = [];
      data?.forEach((apt: any) => {
        if (apt.dentist_id && apt.dentists) {
          if (!uniqueDentists.some(d => d.dentist_id === apt.dentist_id)) {
            uniqueDentists.push({
              dentist_id: apt.dentist_id,
              dentist_name: apt.dentists.name,
            });
          }
        }
      });

      return uniqueDentists;
    },
  });

  // Filter budgets for this patient only
  const patientBudgets = useMemo(() => {
    if (!budgets) return [];
    return budgets.filter((budget) => budget.patient_id === patientId);
  }, [budgets, patientId]);

  const openPaymentDialog = (budget: Budget) => {
    setSelectedBudget(budget);
    setIsPaymentOpen(true);
  };

  const handleCreate = async (data: any) => {
    try {
      const hasDuplicate = await checkDuplicateBudget(patientId);
      if (hasDuplicate) {
        toast({
          title: "Orçamento duplicado",
          description: "Este paciente já possui um orçamento Pendente ou Aprovado.",
          variant: "destructive",
        });
        return;
      }
      createBudget({ ...data, patient_id: patientId });
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error checking duplicate:", error);
    }
  };

  const handleUpdate = async (data: any) => {
    if (editingBudget) {
      try {
        const hasDuplicate = await checkDuplicateBudget(patientId, editingBudget.id);
        if (hasDuplicate) {
          toast({
            title: "Orçamento duplicado",
            description: "Este paciente já possui outro orçamento Pendente ou Aprovado.",
            variant: "destructive",
          });
          return;
        }
        updateBudget({ id: editingBudget.id, ...data });
        setIsFormOpen(false);
        setEditingBudget(null);
      } catch (error) {
        console.error("Error checking duplicate:", error);
      }
    }
  };

  const handleDelete = () => {
    if (selectedBudget) {
      deleteBudget(selectedBudget.id);
      setIsDeleteOpen(false);
      setSelectedBudget(null);
    }
  };

  const openEditDialog = (budget: Budget) => {
    setEditingBudget(budget);
    setIsFormOpen(true);
  };

  const openViewDialog = (budget: Budget) => {
    setSelectedBudget(budget);
    setIsViewOpen(true);
  };

  const openDeleteDialog = (budget: Budget) => {
    setSelectedBudget(budget);
    setIsDeleteOpen(true);
  };

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
    <div className="space-y-4">
      {/* Action Button */}
      <div className="flex justify-end">
        <Button 
          onClick={() => {
            setEditingBudget(null);
            setIsFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Orçamento
        </Button>
      </div>

      {/* Budgets Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[100px]">Dentista</TableHead>
                <TableHead className="min-w-[90px]">Data</TableHead>
                <TableHead className="min-w-[100px]">Valor Final</TableHead>
                <TableHead className="min-w-[80px]">Status</TableHead>
                <TableHead className="text-right min-w-[120px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : patientBudgets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Nenhum orçamento encontrado para este paciente
                  </TableCell>
                </TableRow>
              ) : (
                patientBudgets.map((budget) => {
                  const isCreatorAlsoAppointmentDentist = appointmentDentists?.some(
                    (d) => d.dentist_id === budget.dentist_id
                  );
                  
                  return (
                  <TableRow key={budget.id}>
                    <TableCell className="text-xs md:text-sm">
                      <TooltipProvider>
                        <div className="flex items-center gap-1">
                          {budget.dentists?.name || "-"}
                          {budget.dentists && (
                            <>
                              <Tooltip>
                                <TooltipTrigger>
                                  <UserCheck className="h-3 w-3 text-primary" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Criou o orçamento</p>
                                </TooltipContent>
                              </Tooltip>
                              {isCreatorAlsoAppointmentDentist && (
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Stethoscope className="h-3 w-3 text-green-600" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Tem consulta com paciente</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </>
                          )}
                        </div>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="text-xs md:text-sm">
                      {format(new Date(budget.budget_date), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell className="font-semibold text-xs md:text-sm">
                      R$ {budget.final_amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(budget.status)} text-xs`}>
                        {budget.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {!isDentistUser && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openPaymentDialog(budget)}
                            title="Lançar Pagamento"
                          >
                            <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openViewDialog(budget)}
                        >
                          <Eye className="h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditDialog(budget)}
                        >
                          <Pencil className="h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                        {!isDentistUser && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openDeleteDialog(budget)}
                          >
                            <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Dialogs */}
      <Dialog 
        open={isFormOpen} 
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingBudget(null);
        }}
      >
        <DialogContent className="max-w-4xl w-[95vw] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBudget ? "Editar Orçamento" : "Novo Orçamento"}
            </DialogTitle>
          </DialogHeader>
          <BudgetForm
            onSubmit={editingBudget ? handleUpdate : handleCreate}
            initialData={editingBudget || undefined}
            isSubmitting={isCreating || isUpdating}
            preselectedPatientId={patientId}
          />
        </DialogContent>
      </Dialog>

      <BudgetViewDialog
        budget={selectedBudget}
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
      />

      <BudgetDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDelete}
        budgetInfo={patientName}
      />

      <BudgetPaymentDialog
        budget={selectedBudget}
        open={isPaymentOpen}
        onOpenChange={setIsPaymentOpen}
      />
    </div>
  );
};
