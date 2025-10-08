import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Calendar as CalendarIcon,
  Receipt,
  Search,
  Trash2,
  Pencil
} from "lucide-react";
import { useFinancial } from "@/hooks/useFinancial";
import { usePatients } from "@/hooks/usePatients";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FinancialTransactionDeleteDialog } from "@/components/FinancialTransactionDeleteDialog";

const Financeiro = () => {
  const { 
    transactions, 
    categories, 
    paymentMethods, 
    isLoadingTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction
  } = useFinancial();
  
  const { patients } = usePatients();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<string | null>(null);
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
    
    const transactionData = {
      ...formData,
      amount: parseFloat(formData.amount),
      patient_id: formData.patient_id || undefined,
      payment_method_id: formData.payment_method_id || undefined,
      due_date: formData.due_date || undefined,
    };

    if (editingTransaction) {
      updateTransaction({ id: editingTransaction, ...transactionData });
    } else {
      createTransaction(transactionData);
    }
    
    setIsDialogOpen(false);
    setEditingTransaction(null);
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
  };

  const handleEditClick = (transaction: typeof transactions[0]) => {
    setEditingTransaction(transaction.id);
    setFormData({
      type: transaction.type,
      patient_id: transaction.patient_id || "",
      category_id: transaction.category_id,
      payment_method_id: transaction.payment_method_id || "",
      amount: transaction.amount.toString(),
      description: transaction.description || "",
      transaction_date: transaction.transaction_date,
      due_date: transaction.due_date || "",
      status: transaction.status,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (transactionId: string) => {
    setTransactionToDelete(transactionId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (transactionToDelete) {
      deleteTransaction(transactionToDelete);
      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
    }
  };

  // Calculate stats
  const receitas = transactions.filter(t => t.type === "Receita" && t.status === "Pago");
  const despesas = transactions.filter(t => t.type === "Despesa" && t.status === "Pago");
  const receitasPendentes = transactions.filter(t => t.type === "Receita" && t.status === "Pendente");
  const contasVencidas = transactions.filter(t => t.status === "Vencido");

  const totalReceitas = receitas.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalDespesas = despesas.reduce((sum, t) => sum + Number(t.amount), 0);
  const receitasPendentesTotal = receitasPendentes.reduce((sum, t) => sum + Number(t.amount), 0);
  const saldo = totalReceitas - totalDespesas;

  const stats = [
    {
      title: "Receitas",
      value: `R$ ${totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: "text-success",
      bg: "bg-success/10"
    },
    {
      title: "Despesas",
      value: `R$ ${totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: TrendingDown,
      color: "text-destructive",
      bg: "bg-destructive/10"
    },
    {
      title: "Receitas Pendentes",
      value: `R$ ${receitasPendentesTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: AlertCircle,
      color: "text-warning",
      bg: "bg-warning/10"
    },
    {
      title: "Saldo",
      value: `R$ ${saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: saldo >= 0 ? "text-success" : "text-destructive",
      bg: saldo >= 0 ? "bg-success/10" : "bg-destructive/10"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pago": return "bg-success/10 text-success";
      case "Pendente": return "bg-warning/10 text-warning";
      case "Vencido": return "bg-destructive/10 text-destructive";
      case "Cancelado": return "bg-muted/10 text-muted-foreground";
      default: return "bg-muted/10 text-muted-foreground";
    }
  };

  const getTypeColor = (type: string) => {
    return type === "Receita" 
      ? "bg-success/10 text-success border-success/20" 
      : "bg-destructive/10 text-destructive border-destructive/20";
  };

  const filteredTransactions = transactions.filter(transaction => {
    const searchLower = searchTerm.toLowerCase();
    return (
      transaction.financial_categories?.name?.toLowerCase().includes(searchLower) ||
      transaction.description?.toLowerCase().includes(searchLower) ||
      transaction.patients?.name?.toLowerCase().includes(searchLower)
    );
  });

  const filteredCategories = categories.filter(c => c.type === formData.type);

  if (isLoadingTransactions) {
    return (
      <div className="p-6">
        <div className="text-center">Carregando transações...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Financeiro</h1>
          <p className="text-muted-foreground">Controle financeiro do consultório</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Nova Transação
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bg}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar transações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {transactions.length === 0 ? "Nenhuma transação cadastrada" : "Nenhuma transação encontrada"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between gap-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline" className={getTypeColor(transaction.type)}>
                        {transaction.type}
                      </Badge>
                      <Badge className={getStatusColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                      <span className="text-sm font-medium text-foreground">
                        {transaction.financial_categories?.name || "Categoria não definida"}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                      {transaction.patients?.name && (
                        <div>
                          <span className="font-medium">Paciente:</span> {transaction.patients.name}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Data:</span>{" "}
                        {format(new Date(transaction.transaction_date), "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                      {transaction.payment_methods?.name && (
                        <div>
                          <span className="font-medium">Forma:</span> {transaction.payment_methods.name}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Valor:</span>{" "}
                        <span className={transaction.type === "Receita" ? "text-success" : "text-destructive"}>
                          R$ {Number(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                    
                    {transaction.description && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {transaction.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(transaction)}
                      className="text-primary hover:text-primary hover:bg-primary/10"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(transaction.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          setEditingTransaction(null);
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
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTransaction ? "Editar Transação" : "Nova Transação"}</DialogTitle>
          </DialogHeader>
          
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
                  <SelectTrigger>
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
                <Label htmlFor="amount">Valor *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0,00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transaction_date">Data da Transação *</Label>
                <Input
                  id="transaction_date"
                  type="date"
                  value={formData.transaction_date}
                  onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
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

              <div className="space-y-2">
                <Label htmlFor="payment_method_id">Forma de Pagamento</Label>
                <Select
                  value={formData.payment_method_id}
                  onValueChange={(value) => setFormData({ ...formData, payment_method_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione (opcional)" />
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
                <Label htmlFor="due_date">Data de Vencimento</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detalhes da transação..."
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                {editingTransaction ? "Atualizar" : "Cadastrar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Transaction Dialog */}
      <FinancialTransactionDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        transactionDescription={
          transactionToDelete
            ? transactions.find(t => t.id === transactionToDelete)?.financial_categories?.name
            : undefined
        }
      />
    </div>
  );
};

export default Financeiro;
