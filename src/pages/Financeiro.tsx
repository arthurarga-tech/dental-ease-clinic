import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  DollarSign, 
  TrendingUp,
  AlertCircle,
  Calendar,
  User,
  CreditCard,
  Eye,
  Receipt
} from "lucide-react";

interface Transaction {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  type: "Receita" | "Despesa";
  category: string;
  description: string;
  amount: number;
  status: "Pago" | "Pendente" | "Vencido" | "Cancelado";
  paymentMethod?: string;
  dueDate?: string;
}

const Financeiro = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Dados simulados de transações
  const transactions: Transaction[] = [
    {
      id: "1",
      patientId: "1",
      patientName: "Maria Silva Santos",
      date: "2024-01-15",
      type: "Receita",
      category: "Consulta",
      description: "Consulta de rotina + Restauração",
      amount: 350.00,
      status: "Pago",
      paymentMethod: "Cartão de débito"
    },
    {
      id: "2", 
      patientId: "2",
      patientName: "João Pedro Costa",
      date: "2024-01-10",
      type: "Receita",
      category: "Limpeza",
      description: "Profilaxia dental",
      amount: 150.00,
      status: "Pago",
      paymentMethod: "Dinheiro"
    },
    {
      id: "3",
      patientId: "3",
      patientName: "Ana Carolina Lima",
      date: "2024-01-25",
      type: "Receita",
      category: "Cirurgia",
      description: "Extração de siso",
      amount: 800.00,
      status: "Pendente",
      dueDate: "2024-02-25"
    },
    {
      id: "4",
      patientId: "",
      patientName: "Fornecedor Dental",
      date: "2024-01-08",
      type: "Despesa",
      category: "Material",
      description: "Compra de materiais odontológicos",
      amount: 1200.00,
      status: "Pago",
      paymentMethod: "Transferência"
    },
    {
      id: "5",
      patientId: "1",
      patientName: "Maria Silva Santos",
      date: "2024-01-20",
      type: "Receita", 
      category: "Ortodontia",
      description: "Manutenção de aparelho ortodôntico",
      amount: 200.00,
      status: "Vencido",
      dueDate: "2024-01-20"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pago":
        return "bg-success text-success-foreground";
      case "Pendente":
        return "bg-warning text-warning-foreground";
      case "Vencido":
        return "bg-destructive text-destructive-foreground";
      case "Cancelado":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getTypeColor = (type: string) => {
    return type === "Receita" 
      ? "text-success" 
      : "text-destructive";
  };

  // Cálculos de resumo financeiro
  const totalReceitas = transactions
    .filter(t => t.type === "Receita" && t.status === "Pago")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDespesas = transactions
    .filter(t => t.type === "Despesa" && t.status === "Pago")
    .reduce((sum, t) => sum + t.amount, 0);

  const receitasPendentes = transactions
    .filter(t => t.type === "Receita" && (t.status === "Pendente" || t.status === "Vencido"))
    .reduce((sum, t) => sum + t.amount, 0);

  const contasVencidas = transactions
    .filter(t => t.status === "Vencido")
    .length;

  const stats = [
    {
      title: "Receitas do Mês",
      value: `R$ ${totalReceitas.toFixed(2).replace('.', ',')}`,
      icon: TrendingUp,
      color: "text-success",
      bg: "bg-success/10"
    },
    {
      title: "Despesas do Mês", 
      value: `R$ ${totalDespesas.toFixed(2).replace('.', ',')}`,
      icon: DollarSign,
      color: "text-destructive",
      bg: "bg-destructive/10"
    },
    {
      title: "Valores Pendentes",
      value: `R$ ${receitasPendentes.toFixed(2).replace('.', ',')}`,
      icon: AlertCircle,
      color: "text-warning",
      bg: "bg-warning/10"
    },
    {
      title: "Contas Vencidas",
      value: contasVencidas.toString(),
      icon: AlertCircle,
      color: "text-destructive", 
      bg: "bg-destructive/10"
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Financeiro</h1>
          <p className="text-muted-foreground">Controle financeiro do consultório</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Nova Transação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Transação</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="transaction-type">Tipo</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Receita ou Despesa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receita">Receita</SelectItem>
                    <SelectItem value="despesa">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="patient">Paciente (se receita)</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maria">Maria Silva Santos</SelectItem>
                    <SelectItem value="joao">João Pedro Costa</SelectItem>
                    <SelectItem value="ana">Ana Carolina Lima</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">Categoria</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consulta">Consulta</SelectItem>
                    <SelectItem value="limpeza">Limpeza</SelectItem>
                    <SelectItem value="cirurgia">Cirurgia</SelectItem>
                    <SelectItem value="ortodontia">Ortodontia</SelectItem>
                    <SelectItem value="material">Material</SelectItem>
                    <SelectItem value="equipamento">Equipamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Input id="description" placeholder="Descreva a transação" />
              </div>

              <div>
                <Label htmlFor="amount">Valor</Label>
                <Input id="amount" type="number" step="0.01" placeholder="0,00" />
              </div>

              <div>
                <Label htmlFor="date">Data</Label>
                <Input id="date" type="date" />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Status do pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pago">Pago</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button className="flex-1" onClick={() => setIsDialogOpen(false)}>
                  Registrar
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
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

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" />
              Transações Recentes
            </CardTitle>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Última semana</SelectItem>
                <SelectItem value="month">Último mês</SelectItem>
                <SelectItem value="quarter">Último trimestre</SelectItem>
                <SelectItem value="year">Último ano</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground">
                          {transaction.patientName || transaction.description}
                        </h3>
                        <Badge className={getStatusColor(transaction.status)}>
                          {transaction.status}
                        </Badge>
                        <span className={`text-lg font-bold ${getTypeColor(transaction.type)}`}>
                          {transaction.type === "Receita" ? "+" : "-"}R$ {transaction.amount.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(transaction.date).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {transaction.category}
                        </div>
                        {transaction.paymentMethod && (
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            {transaction.paymentMethod}
                          </div>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mt-1">
                        {transaction.description}
                      </p>
                      
                      {transaction.dueDate && transaction.status !== "Pago" && (
                        <p className="text-sm text-destructive mt-1">
                          Vencimento: {new Date(transaction.dueDate).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {transactions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma transação encontrada para o período selecionado.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Financeiro;