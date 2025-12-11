import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Eye, Pencil, Trash2, DollarSign, Search } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { useBudgets, Budget } from "@/hooks/useBudgets";
import { BudgetForm } from "@/components/BudgetForm";
import { BudgetViewDialog } from "@/components/BudgetViewDialog";
import { BudgetDeleteDialog } from "@/components/BudgetDeleteDialog";
import { BudgetPaymentDialog } from "@/components/BudgetPaymentDialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const Orcamento = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { budgets, isLoading, createBudget, updateBudget, deleteBudget, isCreating, isUpdating, checkDuplicateBudget } = useBudgets();
  const { toast } = useToast();
  const { userRole } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const isDentistUser = userRole === 'dentista' || userRole === 'dentist';
  
  // Auto-open budget for specific patient from URL param
  useEffect(() => {
    const patientId = searchParams.get('patient');
    if (patientId && budgets && budgets.length > 0) {
      const patientBudget = budgets.find(b => b.patient_id === patientId);
      if (patientBudget) {
        setSelectedBudget(patientBudget);
        setIsViewOpen(true);
        // Clear the param after opening
        setSearchParams({});
      }
    }
  }, [searchParams, budgets, setSearchParams]);

  const filteredBudgets = useMemo(() => {
    if (!budgets) return [];
    if (!searchTerm.trim()) return budgets;
    
    const lowerSearch = searchTerm.toLowerCase();
    return budgets.filter((budget) =>
      budget.patients?.name?.toLowerCase().includes(lowerSearch)
    );
  }, [budgets, searchTerm]);

  const openPaymentDialog = (budget: Budget) => {
    setSelectedBudget(budget);
    setIsPaymentOpen(true);
  };

  const handleCreate = async (data: any) => {
    try {
      const hasDuplicate = await checkDuplicateBudget(data.patient_id);
      if (hasDuplicate) {
        toast({
          title: "Orçamento duplicado",
          description: "Este paciente já possui um orçamento Pendente ou Aprovado.",
          variant: "destructive",
        });
        return;
      }
      createBudget(data);
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error checking duplicate:", error);
    }
  };

  const handleUpdate = async (data: any) => {
    if (editingBudget) {
      try {
        const hasDuplicate = await checkDuplicateBudget(data.patient_id, editingBudget.id);
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
    <div className="container mx-auto p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Orçamentos</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Gerencie os orçamentos dos pacientes
          </p>
        </div>
        <Button 
          onClick={() => {
            setEditingBudget(null);
            setIsFormOpen(true);
          }} 
          className="w-full md:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Orçamento
        </Button>
      </div>

      <div className="relative w-full md:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por paciente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">Paciente</TableHead>
                <TableHead className="hidden md:table-cell min-w-[100px]">Dentista</TableHead>
                <TableHead className="hidden lg:table-cell min-w-[90px]">Data</TableHead>
                <TableHead className="min-w-[100px]">Valor Final</TableHead>
                <TableHead className="min-w-[80px]">Status</TableHead>
                <TableHead className="text-right min-w-[120px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredBudgets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Nenhum orçamento encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredBudgets.map((budget) => (
                  <TableRow key={budget.id}>
                    <TableCell className="font-medium text-xs md:text-sm">
                      {budget.patients?.name}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs md:text-sm">
                      {budget.dentists?.name || "-"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-xs md:text-sm">
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

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
        budgetInfo={selectedBudget?.patients?.name}
      />

      <BudgetPaymentDialog
        budget={selectedBudget}
        open={isPaymentOpen}
        onOpenChange={setIsPaymentOpen}
      />
    </div>
  );
};

export default Orcamento;
