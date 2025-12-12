import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { usePatients } from "@/hooks/usePatients";
import { useDentists } from "@/hooks/useDentists";
import { Budget } from "@/hooks/useBudgets";
import { PROCEDURE_CATEGORIES, ProcedureItem } from "@/data/procedures";
import { useDentistProfile } from "@/hooks/useDentistProfile";
import { useAuth } from "@/hooks/useAuth";

interface Procedure {
  name: string;
  value: number;
  category?: string;
  status: string;
}

const PROCEDURE_STATUS_OPTIONS = [
  { value: "Pendente", label: "Pendente", color: "bg-yellow-100 text-yellow-800" },
  { value: "Em Andamento", label: "Em Andamento", color: "bg-blue-100 text-blue-800" },
  { value: "Concluído", label: "Concluído", color: "bg-green-100 text-green-800" },
  { value: "Cancelado", label: "Cancelado", color: "bg-red-100 text-red-800" },
];

const budgetSchema = z.object({
  patient_id: z.string().min(1, "Paciente é obrigatório"),
  dentist_id: z.string().optional(),
  budget_date: z.date(),
  discount: z.string().optional(),
  status: z.string().min(1, "Status é obrigatório"),
  valid_until: z.date(),
  notes: z.string().optional(),
});

type BudgetFormValues = z.infer<typeof budgetSchema>;

interface BudgetFormProps {
  onSubmit: (data: any) => void;
  initialData?: Budget;
  isSubmitting?: boolean;
}

export const BudgetForm = ({
  onSubmit,
  initialData,
  isSubmitting,
}: BudgetFormProps) => {
  const { patients } = usePatients();
  const { dentists } = useDentists();
  const { dentist: currentDentist } = useDentistProfile();
  const { userRole } = useAuth();
  
  const isDentistUser = userRole === 'dentista' || userRole === 'dentist';

  const [procedures, setProcedures] = useState<Procedure[]>(() => {
    if (initialData?.procedures) {
      try {
        const parsed = JSON.parse(initialData.procedures);
        // For dentist users, filter out completed procedures
        if (isDentistUser) {
          return parsed.filter((p: Procedure) => p.status !== "Concluído");
        }
        return parsed;
      } catch {
        return [];
      }
    }
    return [];
  });

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedProcedure, setSelectedProcedure] = useState<string>("");
  const [customValue, setCustomValue] = useState<string>("");

  // Determine the default dentist_id based on user role
  const getDefaultDentistId = () => {
    if (initialData?.dentist_id) return initialData.dentist_id;
    if (isDentistUser && currentDentist?.id) return currentDentist.id;
    return undefined;
  };

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: initialData
      ? {
          patient_id: initialData.patient_id,
          dentist_id: initialData.dentist_id || undefined,
          budget_date: new Date(initialData.budget_date),
          discount: initialData.discount.toString(),
          status: initialData.status,
          valid_until: new Date(initialData.valid_until),
          notes: initialData.notes || "",
        }
      : {
          budget_date: new Date(),
          status: "Pendente",
          valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          discount: "0",
          dentist_id: getDefaultDentistId(),
        },
  });

  // Update dentist_id when currentDentist loads (for dentist users)
  useEffect(() => {
    if (isDentistUser && currentDentist?.id && !initialData) {
      form.setValue('dentist_id', currentDentist.id);
    }
  }, [currentDentist?.id, isDentistUser, initialData, form]);

  // Only sum procedures that are not "Concluído"
  const totalAmount = procedures
    .filter((proc) => proc.status !== "Concluído")
    .reduce((sum, proc) => sum + (proc.value || 0), 0);
  const discount = parseFloat(form.watch("discount") || "0");
  const finalAmount = totalAmount - discount;

  const selectedCategoryData = PROCEDURE_CATEGORIES.find(c => c.id === selectedCategory);
  const availableProcedures = selectedCategoryData?.procedures || [];

  const addProcedureFromList = () => {
    if (!selectedProcedure || !selectedCategory) return;

    const procedure = availableProcedures.find(p => p.name === selectedProcedure);
    if (!procedure) return;

    const value = customValue ? parseFloat(customValue) : procedure.value;
    const categoryData = PROCEDURE_CATEGORIES.find(c => c.id === selectedCategory);

    setProcedures([
      ...procedures,
      {
        name: procedure.name,
        value: value,
        category: categoryData ? `${categoryData.icon} ${categoryData.name}` : undefined,
        status: "Pendente",
      },
    ]);

    setSelectedCategory("");
    setSelectedProcedure("");
    setCustomValue("");
  };

  const removeProcedure = (index: number) => {
    setProcedures(procedures.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (selectedProcedure) {
      const procedure = availableProcedures.find(p => p.name === selectedProcedure);
      if (procedure) {
        setCustomValue(procedure.value.toString());
      }
    }
  }, [selectedProcedure, availableProcedures]);

  const handleSubmit = (data: BudgetFormValues) => {
    const validProcedures = procedures.filter(p => p.name.trim() !== "" && p.value > 0);
    
    if (validProcedures.length === 0) {
      return;
    }

    onSubmit({
      ...data,
      budget_date: format(data.budget_date, "yyyy-MM-dd"),
      valid_until: format(data.valid_until, "yyyy-MM-dd"),
      procedures: JSON.stringify(validProcedures),
      total_amount: totalAmount,
      discount: discount,
      final_amount: finalAmount,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Patient and Dentist - Stack on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="patient_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paciente</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o paciente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-[300px]">
                    {patients?.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dentist_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dentista Responsável</FormLabel>
                {isDentistUser && currentDentist ? (
                  <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                    {currentDentist.name}
                  </div>
                ) : (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o dentista" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[300px]">
                      {dentists
                        ?.filter((dentist) => dentist.status === "Ativo")
                        .map((dentist) => (
                          <SelectItem key={dentist.id} value={dentist.id}>
                            {dentist.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

        </div>

        {/* Dates - Always side by side, but smaller on mobile */}
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="budget_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-xs sm:text-sm">Data do Orçamento</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "pl-2 sm:pl-3 text-left font-normal text-xs sm:text-sm h-9 sm:h-10",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>Selecione</span>
                        )}
                        <CalendarIcon className="ml-auto h-3 w-3 sm:h-4 sm:w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="valid_until"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-xs sm:text-sm">Válido Até</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "pl-2 sm:pl-3 text-left font-normal text-xs sm:text-sm h-9 sm:h-10",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>Selecione</span>
                        )}
                        <CalendarIcon className="ml-auto h-3 w-3 sm:h-4 sm:w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-3">
          <FormLabel className="text-sm">Adicionar Procedimentos</FormLabel>
          
          <div className="p-3 sm:p-4 border rounded-lg bg-muted/30 space-y-3">
            {/* Category and Procedure - Stack on mobile */}
            <div className="space-y-3">
              <div>
                <FormLabel className="text-xs text-muted-foreground">Categoria</FormLabel>
                <Select value={selectedCategory} onValueChange={(value) => {
                  setSelectedCategory(value);
                  setSelectedProcedure("");
                  setCustomValue("");
                }}>
                  <SelectTrigger className="w-full text-sm">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[250px]">
                    {PROCEDURE_CATEGORIES.map((category) => (
                      <SelectItem key={category.id} value={category.id} className="text-sm">
                        {category.icon} {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <FormLabel className="text-xs text-muted-foreground">Procedimento</FormLabel>
                <Select
                  value={selectedProcedure}
                  onValueChange={(value) => {
                    if (!value || !selectedCategory) return;
                    
                    const procedure = availableProcedures.find(p => p.name === value);
                    if (!procedure) return;
                    
                    const categoryData = PROCEDURE_CATEGORIES.find(c => c.id === selectedCategory);
                    
                    setProcedures([
                      ...procedures,
                      {
                        name: procedure.name,
                        value: procedure.value,
                        category: categoryData ? `${categoryData.icon} ${categoryData.name}` : undefined,
                        status: "Pendente",
                      },
                    ]);
                    
                    setSelectedCategory("");
                    setSelectedProcedure("");
                  }}
                  disabled={!selectedCategory}
                >
                  <SelectTrigger className="w-full text-sm">
                    <SelectValue placeholder="Selecione o procedimento" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[250px]">
                    {availableProcedures.map((procedure, idx) => (
                      <SelectItem key={idx} value={procedure.name} className="text-sm">
                        <span className="block truncate">{procedure.name}</span>
                        <span className="text-xs text-muted-foreground ml-1">R$ {procedure.value.toFixed(2)}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

        {procedures.length > 0 && (
            <div className="space-y-2">
              <FormLabel className="text-sm">Procedimentos Adicionados ({procedures.length})</FormLabel>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {procedures.map((procedure, index) => {
                  const isPending = procedure.status === "Pendente";
                  const canEditProcedure = !isDentistUser || isPending;
                  
                  return (
                    <div
                      key={index}
                      className="p-2 sm:p-3 border rounded-lg bg-background"
                    >
                      {/* Mobile: Stack layout */}
                      <div className="flex flex-col gap-2">
                        {/* Procedure name and category */}
                        <div className="min-w-0">
                          {procedure.category && (
                            <span className="text-[10px] sm:text-xs text-muted-foreground block truncate">
                              {procedure.category}
                            </span>
                          )}
                          <p className="font-medium text-sm sm:text-base truncate">{procedure.name}</p>
                        </div>
                        
                        {/* Controls row */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          {/* Status */}
                          <div className="flex-shrink-0">
                            {isDentistUser ? (
                              <Badge variant="outline" className={cn(
                                "text-[10px] sm:text-xs",
                                procedure.status === "Concluído" ? "bg-green-100 text-green-800" :
                                procedure.status === "Em Andamento" ? "bg-blue-100 text-blue-800" :
                                procedure.status === "Cancelado" ? "bg-red-100 text-red-800" :
                                "bg-yellow-100 text-yellow-800"
                              )}>
                                {procedure.status || "Pendente"}
                              </Badge>
                            ) : (
                              <Select
                                value={procedure.status}
                                onValueChange={(value) => {
                                  const updated = [...procedures];
                                  updated[index] = { ...updated[index], status: value };
                                  setProcedures(updated);
                                }}
                              >
                                <SelectTrigger className="w-[110px] sm:w-[130px] h-8 text-xs sm:text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {PROCEDURE_STATUS_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value} className="text-sm">
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                          
                          {/* Value and Delete */}
                          <div className="flex items-center gap-1 sm:gap-2">
                            {canEditProcedure && (userRole === 'admin' || userRole === 'socio' || userRole === 'dentista' || userRole === 'dentist') ? (
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-muted-foreground">R$</span>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={procedure.value}
                                  onChange={(e) => {
                                    const updated = [...procedures];
                                    updated[index] = { ...updated[index], value: parseFloat(e.target.value) || 0 };
                                    setProcedures(updated);
                                  }}
                                  className="w-20 sm:w-24 text-right font-semibold text-sm h-8"
                                />
                              </div>
                            ) : (
                              <span className="font-semibold text-sm sm:text-base whitespace-nowrap">
                                R$ {procedure.value.toFixed(2)}
                              </span>
                            )}
                            {canEditProcedure && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0"
                                onClick={() => removeProcedure(index)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Totals - Responsive grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 bg-muted p-3 sm:p-4 rounded-lg">
          <div>
            <FormLabel className="text-xs sm:text-sm text-muted-foreground">Subtotal</FormLabel>
            <p className="text-sm sm:text-xl font-semibold mt-1">
              R$ {totalAmount.toFixed(2)}
            </p>
          </div>

          <div>
            <FormField
              control={form.control}
              name="discount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs sm:text-sm">Desconto (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} className="h-8 sm:h-10 text-sm" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div>
            <FormLabel className="text-xs sm:text-sm text-muted-foreground">Valor Final</FormLabel>
            <p className="text-sm sm:text-2xl font-bold text-green-600 mt-1">
              R$ {finalAmount.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Status and Notes - Stack on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Status</FormLabel>
                {isDentistUser ? (
                  <div className="flex h-9 sm:h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                    {field.value}
                  </div>
                ) : (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-9 sm:h-10">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Pendente">Pendente</SelectItem>
                      <SelectItem value="Aprovado">Aprovado</SelectItem>
                      <SelectItem value="Recusado">Recusado</SelectItem>
                      <SelectItem value="Expirado">Expirado</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Observações</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Observações adicionais" 
                    {...field} 
                    className="min-h-[60px] sm:min-h-[80px] text-sm"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full h-10 sm:h-11 text-sm sm:text-base" disabled={isSubmitting}>
          {isSubmitting
            ? "Salvando..."
            : initialData
            ? "Atualizar Orçamento"
            : "Criar Orçamento"}
        </Button>
      </form>
    </Form>
  );
};
