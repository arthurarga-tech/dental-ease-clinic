import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

const budgetSchema = z.object({
  patient_id: z.string().min(1, "Paciente é obrigatório"),
  dentist_id: z.string().optional(),
  budget_date: z.date(),
  procedures: z.string().min(1, "Procedimentos são obrigatórios"),
  total_amount: z.string().min(1, "Valor total é obrigatório"),
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

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: initialData
      ? {
          patient_id: initialData.patient_id,
          dentist_id: initialData.dentist_id || undefined,
          budget_date: new Date(initialData.budget_date),
          procedures: initialData.procedures,
          total_amount: initialData.total_amount.toString(),
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

  const handleSubmit = (data: BudgetFormValues) => {
    const totalAmount = parseFloat(data.total_amount);
    const discount = parseFloat(data.discount || "0");
    const finalAmount = totalAmount - discount;

    onSubmit({
      ...data,
      budget_date: format(data.budget_date, "yyyy-MM-dd"),
      valid_until: format(data.valid_until, "yyyy-MM-dd"),
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
              <FormLabel>Dentista (Opcional)</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o dentista" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {dentists?.map((dentist) => (
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

        <FormField
          control={form.control}
          name="procedures"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Procedimentos</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva os procedimentos do orçamento"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="total_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Total (R$)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
        </div>

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
