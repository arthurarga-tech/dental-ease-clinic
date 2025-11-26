import { useState } from "react";
import { MainLayout } from "@/components/Layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calculator, DollarSign, CreditCard, Settings, Calendar } from "lucide-react";
import { useFechamento } from "@/hooks/useFechamento";
import { useDentists } from "@/hooks/useDentists";
import { useFinancial } from "@/hooks/useFinancial";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Fechamento = () => {
  const { 
    cardFees, 
    settlements, 
    accountsPayable,
    isLoadingCardFees,
    isLoadingSettlements,
    isLoadingAccountsPayable,
    updateCardFee 
  } = useFechamento();
  
  const { dentists } = useDentists();
  const { paymentMethods } = useFinancial();
  
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");

  // Calculate totals
  const totalAccountsPayable = accountsPayable?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
  const totalPendingCommissions = settlements?.filter(s => s.status === 'Pendente').reduce((sum, s) => sum + Number(s.net_amount), 0) || 0;

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
            <Card>
              <CardHeader>
                <CardTitle>Comissões dos Dentistas</CardTitle>
                <CardDescription>Cálculo de comissões por período</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
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
                    <Button>
                      <Calendar className="mr-2 h-4 w-4" />
                      Calcular
                    </Button>
                  </div>
                </div>

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
                            <div>Valor Bruto: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(settlement.gross_amount))}</div>
                            <div>Taxas Deduzidas: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(settlement.card_fees_deducted))}</div>
                            <div>Comissão: {settlement.commission_percentage}%</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(settlement.net_amount))}
                          </div>
                          <p className="text-xs text-muted-foreground">Valor Líquido</p>
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
                              defaultValue={existingFee?.fee_percentage || 0}
                              className="w-24"
                              onBlur={(e) => {
                                if (existingFee) {
                                  updateCardFee({
                                    id: existingFee.id,
                                    fee_percentage: Number(e.target.value)
                                  });
                                }
                              }}
                            />
                            <span className="text-muted-foreground">%</span>
                          </div>
                        </div>
                      );
                    })}
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
                        <p className="text-sm text-muted-foreground">{dentist.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          defaultValue={dentist.commission_percentage || 50}
                          className="w-24"
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
