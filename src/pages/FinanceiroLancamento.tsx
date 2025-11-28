import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Receipt } from "lucide-react";
import { useFinancial } from "@/hooks/useFinancial";
import { usePatients } from "@/hooks/usePatients";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const transactionSchema = z.object({
  type: z.enum(["Receita", "Despesa"]),
  category_id: z.string().uuid({ message: "Categoria inválida" }),
  patient_id: z.string().uuid().optional().or(z.literal("")),
  payment_method_id: z.string().uuid().optional().or(z.literal("")),
  amount: z.string()
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Valor deve ser maior que zero"
    })
    .refine((val) => parseFloat(val) <= 999999.99, {
      message: "Valor muito alto (máx. R$ 999.999,99)"
    }),
  description: z.string().trim().max(500, { message: "Descrição muito longa (máx. 500 caracteres)" }).optional(),
  transaction_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Data inválida" }),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Data inválida" }).optional().or(z.literal("")),
  status: z.enum(["Pendente", "Pago", "Vencido", "Cancelado"])
});

const FinanceiroLancamento = () => {
  const { 
    categories, 
    paymentMethods, 
    createTransaction
  } = useFinancial();
  
  const { patients } = usePatients();
  const { toast } = useToast();
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    type: "Receita" as "Receita" | "Despesa",
    patient_id: "",
    category_id: "",
    payment_method_id: "",
    amount: "",
    description: "",
    transaction_date: new Date().toISOString().split("T")[0],
    due_date: "",
    status: "Pendente" as "Pendente" | "Pago" | "Vencido" | "Cancelado",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      const validated = transactionSchema.parse(formData);
      
      const transactionData = {
        type: validated.type,
        category_id: validated.category_id,
        amount: parseFloat(validated.amount),
        transaction_date: validated.transaction_date,
        status: validated.status,
        description: validated.description || undefined,
        patient_id: validated.patient_id || undefined,
        payment_method_id: validated.payment_method_id || undefined,
        due_date: validated.due_date || undefined,
      };

      createTransaction(transactionData);
      
      // Reset form after successful submission
      setFormData({
        type: "Receita",
        patient_id: "",
        category_id: "",
        payment_method_id: "",
        amount: "",
        description: "",
        transaction_date: new Date().toISOString().split("T")[0],
        due_date: "",
        status: "Pendente",
      });

      toast({
        title: "Lançamento criado!",
        description: "A transação foi registrada com sucesso.",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
        toast({
          title: "Erro de validação",
          description: "Por favor, corrija os campos destacados.",
          variant: "destructive",
        });
      }
    }
  };

  const filteredCategories = categories.filter(c => c.type === formData.type);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Lançamentos Financeiros</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Registrar receitas e despesas do consultório
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            Nova Transação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "Receita" | "Despesa") => 
                    setFormData({ ...formData, type: value, category_id: "" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Receita">Receita</SelectItem>
                    <SelectItem value="Despesa">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category_id">Categoria *</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  required
                >
                  <SelectTrigger className={errors.category_id ? "border-destructive" : ""}>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category_id && (
                  <p className="text-xs text-destructive">{errors.category_id}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="patient_id">Paciente</Label>
                <Select
                  value={formData.patient_id}
                  onValueChange={(value) => setFormData({ ...formData, patient_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o paciente (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_method_id">Forma de Pagamento</Label>
                <Select
                  value={formData.payment_method_id}
                  onValueChange={(value) => setFormData({ ...formData, payment_method_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a forma (opcional)" />
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

              <div className="space-y-2">
                <Label htmlFor="amount">Valor *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className={errors.amount ? "border-destructive" : ""}
                  required
                />
                {errors.amount && (
                  <p className="text-xs text-destructive">{errors.amount}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="transaction_date">Data da Transação *</Label>
                <Input
                  id="transaction_date"
                  type="date"
                  value={formData.transaction_date}
                  onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                  className={errors.transaction_date ? "border-destructive" : ""}
                  required
                />
                {errors.transaction_date && (
                  <p className="text-xs text-destructive">{errors.transaction_date}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="due_date">Data de Vencimento</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className={errors.due_date ? "border-destructive" : ""}
                />
                {errors.due_date && (
                  <p className="text-xs text-destructive">{errors.due_date}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "Pendente" | "Pago" | "Vencido" | "Cancelado") => 
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Pago">Pago</SelectItem>
                    <SelectItem value="Vencido">Vencido</SelectItem>
                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Informações adicionais (opcional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={errors.description ? "border-destructive" : ""}
                rows={3}
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description}</p>
              )}
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Registrar Transação
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceiroLancamento;
