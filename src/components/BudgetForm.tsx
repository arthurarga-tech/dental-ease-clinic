import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

  const [procedures, setProcedures] = useState<Procedure[]>(() => {
    if (initialData?.procedures) {
      try {
        return JSON.parse(initialData.procedures);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedProcedure, setSelectedProcedure] = useState<string>("");
  const [customValue, setCustomValue] = useState<string>("");

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
        },
  });

  const totalAmount = procedures.reduce((sum, proc) => sum + (proc.value || 0), 0);
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
        <FormField
          control={form.control}
          name="patient_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Paciente</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o paciente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
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
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o dentista" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {dentists
                    ?.filter((dentist) => dentist.status === "Ativo")
                    .map((dentist) => (
                      <SelectItem key={dentist.id} value={dentist.id}>
                        {dentist.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="budget_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data do Orçamento</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>Selecione a data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
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
                <FormLabel>Válido Até</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>Selecione a data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
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

        <div className="space-y-4">
          <FormLabel>Adicionar Procedimentos</FormLabel>
          
          <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <FormLabel className="text-sm">Categoria</FormLabel>
                <Select value={selectedCategory} onValueChange={(value) => {
                  setSelectedCategory(value);
                  setSelectedProcedure("");
                  setCustomValue("");
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROCEDURE_CATEGORIES.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <FormLabel className="text-sm">Procedimento</FormLabel>
                <Select
                  value={selectedProcedure}
                  onValueChange={setSelectedProcedure}
                  disabled={!selectedCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o procedimento" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProcedures.map((procedure, idx) => (
                      <SelectItem key={idx} value={procedure.name}>
                        {procedure.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <FormLabel className="text-sm">Valor (R$)</FormLabel>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    disabled={!selectedProcedure}
                  />
                  <Button
                    type="button"
                    onClick={addProcedureFromList}
                    disabled={!selectedProcedure || !customValue}
                    size="icon"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

        {procedures.length > 0 && (
            <div className="space-y-2">
              <FormLabel>Procedimentos Adicionados</FormLabel>
              {procedures.map((procedure, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg bg-background gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {procedure.category && (
                        <span className="text-xs text-muted-foreground">
                          {procedure.category}
                        </span>
                      )}
                    </div>
                    <p className="font-medium truncate">{procedure.name}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Select
                      value={procedure.status}
                      onValueChange={(value) => {
                        const updated = [...procedures];
                        updated[index] = { ...updated[index], status: value };
                        setProcedures(updated);
                      }}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROCEDURE_STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="font-semibold text-lg whitespace-nowrap">
                      R$ {procedure.value.toFixed(2)}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeProcedure(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-muted p-4 rounded-lg">
          <div>
            <FormLabel className="text-muted-foreground">Subtotal</FormLabel>
            <p className="text-xl font-semibold mt-1">
              R$ {totalAmount.toFixed(2)}
            </p>
          </div>

          <div>
            <FormField
              control={form.control}
              name="discount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Desconto (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div>
            <FormLabel className="text-muted-foreground">Valor Final</FormLabel>
            <p className="text-2xl font-bold text-green-600 mt-1">
              R$ {finalAmount.toFixed(2)}
            </p>
          </div>
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
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
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea placeholder="Observações adicionais" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
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
