import { useState } from "react";
import { MainLayout } from "@/components/Layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calculator, DollarSign, CreditCard, Settings, Calendar, Check, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useFechamento, DentistCommissionCalculation } from "@/hooks/useFechamento";
import { useDentists } from "@/hooks/useDentists";
import { useFinancial } from "@/hooks/useFinancial";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const Fechamento = () => {
  const { toast } = useToast();
  const { 
    cardFees, 
    settlements, 
    accountsPayable,
    isLoadingCardFees,
    isLoadingSettlements,
    isLoadingAccountsPayable,
    updateCardFee,
    createCardFee,
    commissionCalculations,
    isCalculating,
    calculateCommissions,
    generateSettlement,
    isCreatingSettlement,
  } = useFechamento();
  
  const { dentists, updateDentist } = useDentists();
  const { paymentMethods } = useFinancial();
  
  // Default to current month
  const now = new Date();
  const [periodStart, setPeriodStart] = useState(format(startOfMonth(now), "yyyy-MM-dd"));
  const [periodEnd, setPeriodEnd] = useState(format(endOfMonth(now), "yyyy-MM-dd"));
  const [expandedDentist, setExpandedDentist] = useState<string | null>(null);
  const [cardFeeValues, setCardFeeValues] = useState<Record<string, string>>({});

  // Calculate totals
  const totalAccountsPayable = accountsPayable?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
  const totalPendingCommissions = settlements?.filter(s => s.status === 'Pendente').reduce((sum, s) => sum + Number(s.net_amount), 0) || 0;
  const totalCalculatedCommissions = commissionCalculations.reduce((sum, c) => sum + c.commission_amount, 0);

  const handleCalculate = () => {
    if (!periodStart || !periodEnd) {
      toast({
        variant: "destructive",
        title: "Período inválido",
        description: "Selecione o período inicial e final.",
      });
      return;
    }
    calculateCommissions(periodStart, periodEnd);
  };

  const handleGenerateSettlement = (calc: DentistCommissionCalculation) => {
    generateSettlement(calc, periodStart, periodEnd);
  };

  const handleUpdateDentistCommission = (dentistId: string, newPercentage: number) => {
    updateDentist({
      id: dentistId,
      commission_percentage: newPercentage,
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Fechamento Financeiro</h1>
            <p className="text-muted-foreground">Gestão de contas a pagar e comissões</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contas a Pagar</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAccountsPayable)}
              </div>
              <p className="text-xs text-muted-foreground">
                {accountsPayable?.length || 0} contas pendentes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comissões Pendentes</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPendingCommissions)}
              </div>
              <p className="text-xs text-muted-foreground">
                {settlements?.filter(s => s.status === 'Pendente').length || 0} fechamentos pendentes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="accounts" className="space-y-4">
          <TabsList>
            <TabsTrigger value="accounts">
              <DollarSign className="mr-2 h-4 w-4" />
              Contas a Pagar
            </TabsTrigger>
            <TabsTrigger value="commissions">
              <Calculator className="mr-2 h-4 w-4" />
              Comissões Dentistas
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </TabsTrigger>
          </TabsList>

          {/* Contas a Pagar */}
          <TabsContent value="accounts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Contas a Pagar</CardTitle>
                <CardDescription>Despesas pendentes e vencidas</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingAccountsPayable ? (
                  <div className="text-center py-8">Carregando...</div>
                ) : accountsPayable && accountsPayable.length > 0 ? (
                  <div className="space-y-4">
                    {accountsPayable.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{transaction.financial_categories?.name}</span>
                            <Badge variant={transaction.status === 'Vencido' ? 'destructive' : 'default'}>
                              {transaction.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Vencimento: {transaction.due_date ? format(new Date(transaction.due_date), "dd 'de' MMMM, yyyy", { locale: ptBR }) : '-'}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(transaction.amount))}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {transaction.payment_methods?.name || '-'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma conta a pagar no momento
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comissões Dentistas */}
          <TabsContent value="commissions" className="space-y-4">
            {/* Period Selection and Calculate */}
            <Card>
              <CardHeader>
                <CardTitle>Calcular Comissões</CardTitle>
                <CardDescription>Selecione o período para calcular as comissões dos dentistas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="period-start">Período Início</Label>
                    <Input
                      id="period-start"
                      type="date"
                      value={periodStart}
                      onChange={(e) => setPeriodStart(e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="period-end">Período Fim</Label>
                    <Input
                      id="period-end"
                      type="date"
                      value={periodEnd}
                      onChange={(e) => setPeriodEnd(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleCalculate} disabled={isCalculating}>
                      {isCalculating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Calculator className="mr-2 h-4 w-4" />
                      )}
                      {isCalculating ? "Calculando..." : "Calcular"}
                    </Button>
                  </div>
                </div>

                {/* Calculation Results */}
                {commissionCalculations.length > 0 && (
                  <div className="space-y-4 mt-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Resultado do Cálculo</h3>
                      <div className="text-right">
                        <span className="text-sm text-muted-foreground">Total a pagar: </span>
                        <span className="text-lg font-bold text-green-600">{formatCurrency(totalCalculatedCommissions)}</span>
                      </div>
                    </div>

                    {commissionCalculations.map((calc) => (
                      <Collapsible
                        key={calc.dentist_id}
                        open={expandedDentist === calc.dentist_id}
                        onOpenChange={(open) => setExpandedDentist(open ? calc.dentist_id : null)}
                      >
                        <div className="border rounded-lg overflow-hidden">
                          <div className="flex items-center justify-between p-4 bg-muted/30">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-lg">{calc.dentist_name}</span>
                                <Badge variant="outline">{calc.commission_percentage}% comissão</Badge>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-muted-foreground mt-2">
                                <div>
                                  <span className="block text-xs">Receita Bruta</span>
                                  <span className="font-medium text-foreground">{formatCurrency(calc.total_revenue)}</span>
                                </div>
                                <div>
                                  <span className="block text-xs">Taxas Cartão</span>
                                  <span className="font-medium text-red-500">-{formatCurrency(calc.card_fees_total)}</span>
                                </div>
                                <div>
                                  <span className="block text-xs">Líquido</span>
                                  <span className="font-medium text-foreground">{formatCurrency(calc.net_after_fees)}</span>
                                </div>
                                <div>
                                  <span className="block text-xs">Comissão ({calc.commission_percentage}%)</span>
                                  <span className="font-bold text-green-600">{formatCurrency(calc.commission_amount)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <Button
                                size="sm"
                                onClick={() => handleGenerateSettlement(calc)}
                                disabled={isCreatingSettlement}
                              >
                                <Check className="mr-1 h-4 w-4" />
                                Gerar Fechamento
                              </Button>
                              <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  {expandedDentist === calc.dentist_id ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </Button>
                              </CollapsibleTrigger>
                            </div>
                          </div>
                          <CollapsibleContent>
                            <div className="p-4 border-t">
                              <h4 className="font-medium mb-2">{calc.transactions_count} transações no período</h4>
                              <div className="space-y-2 max-h-60 overflow-y-auto">
                                {calc.transactions.map((trans) => (
                                  <div key={trans.id} className="flex items-center justify-between text-sm p-2 bg-muted/20 rounded">
                                    <div className="flex-1">
                                      <span className="font-medium">{trans.description || "Procedimento"}</span>
                                      <span className="text-muted-foreground ml-2">
                                        {format(new Date(trans.transaction_date), "dd/MM/yyyy")}
                                      </span>
                                    </div>
                                    <div className="text-right">
                                      <span className="font-medium">{formatCurrency(trans.amount)}</span>
                                      {trans.card_fee_percentage > 0 && (
                                        <span className="text-xs text-muted-foreground ml-2">
                                          ({trans.payment_method_name} -{trans.card_fee_percentage}%)
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Historical Settlements */}
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Fechamentos</CardTitle>
                <CardDescription>Fechamentos gerados anteriormente</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingSettlements ? (
                  <div className="text-center py-8">Carregando...</div>
                ) : settlements && settlements.length > 0 ? (
                  <div className="space-y-4">
                    {settlements.map((settlement) => (
                      <div
                        key={settlement.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{settlement.dentists?.name}</span>
                            <Badge variant={settlement.status === 'Pago' ? 'default' : 'secondary'}>
                              {settlement.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Período: {format(new Date(settlement.period_start), "dd/MM/yyyy")} - {format(new Date(settlement.period_end), "dd/MM/yyyy")}
                          </p>
                          <div className="text-xs text-muted-foreground mt-1 space-y-1">
                            <div>Valor Bruto: {formatCurrency(Number(settlement.gross_amount))}</div>
                            <div>Taxas Deduzidas: {formatCurrency(Number(settlement.card_fees_deducted))}</div>
                            <div>Comissão: {settlement.commission_percentage}%</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            {formatCurrency(Number(settlement.net_amount))}
                          </div>
                          <p className="text-xs text-muted-foreground">Valor a Pagar</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum fechamento registrado
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Taxas de Cartão</CardTitle>
                <CardDescription>Configure as taxas das maquininhas de cartão</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingCardFees ? (
                  <div className="text-center py-8">Carregando...</div>
                ) : (
                  <div className="space-y-4">
                    {paymentMethods?.filter(pm => pm.name.toLowerCase().includes('cartão') || pm.name.toLowerCase().includes('crédito') || pm.name.toLowerCase().includes('débito')).map((method) => {
                      const existingFee = cardFees?.find(cf => cf.payment_method_id === method.id);
                      const currentValue = cardFeeValues[method.id] ?? String(existingFee?.fee_percentage || 0);
                      
                      return (
                        <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <CreditCard className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">{method.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              max="100"
                              placeholder="0.00"
                              value={currentValue}
                              className="w-24"
                              onChange={(e) => {
                                setCardFeeValues(prev => ({
                                  ...prev,
                                  [method.id]: e.target.value
                                }));
                              }}
                            />
                            <span className="text-muted-foreground">%</span>
                          </div>
                        </div>
                      );
                    })}
                    
                    <Button 
                      onClick={() => {
                        const cardMethods = paymentMethods?.filter(pm => 
                          pm.name.toLowerCase().includes('cartão') || 
                          pm.name.toLowerCase().includes('crédito') || 
                          pm.name.toLowerCase().includes('débito')
                        ) || [];
                        
                        cardMethods.forEach(method => {
                          const existingFee = cardFees?.find(cf => cf.payment_method_id === method.id);
                          const newValue = Number(cardFeeValues[method.id] ?? existingFee?.fee_percentage ?? 0);
                          
                          if (existingFee) {
                            if (newValue !== Number(existingFee.fee_percentage)) {
                              updateCardFee({
                                id: existingFee.id,
                                fee_percentage: newValue
                              });
                            }
                          } else if (newValue > 0) {
                            createCardFee({
                              payment_method_id: method.id,
                              fee_percentage: newValue
                            });
                          }
                        });
                      }}
                      className="w-full mt-4"
                    >
                      Salvar Taxas
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Comissões por Dentista</CardTitle>
                <CardDescription>Configure o percentual de comissão de cada dentista</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dentists?.map((dentist) => (
                    <div key={dentist.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <span className="font-medium">{dentist.name}</span>
                        <p className="text-sm text-muted-foreground">{dentist.email || dentist.cro}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="1"
                          min="0"
                          max="100"
                          defaultValue={dentist.commission_percentage || 50}
                          className="w-24"
                          onBlur={(e) => {
                            const newValue = Number(e.target.value);
                            if (newValue !== dentist.commission_percentage) {
                              handleUpdateDentistCommission(dentist.id, newValue);
                            }
                          }}
                        />
                        <span className="text-muted-foreground">%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Fechamento;
