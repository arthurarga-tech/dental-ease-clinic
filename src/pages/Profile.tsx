import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Percent, DollarSign, RefreshCw } from "lucide-react";
import { useDentistProfile } from "@/hooks/useDentistProfile";
import { useDentistPendingCommissions } from "@/hooks/useDentistPendingCommissions";

export default function Profile() {
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const { dentist, isLoading: isLoadingDentist } = useDentistProfile();
  const { 
    totalPendingCommission, 
    pendingGross, 
    pendingCardFees, 
    pendingNet,
    transactionCount,
    isLoading: isLoadingCommissions,
    refetch: refetchCommissions 
  } = useDentistPendingCommissions(
    dentist?.id,
    dentist?.commission_percentage ?? 50
  );
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const isDentist = userRole === "dentista" || userRole === "dentist";

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
      setFullName("");
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter no mínimo 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: "Senha alterada",
        description: "Sua senha foi alterada com sucesso.",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: "Erro ao alterar senha",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Meu Perfil</h1>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Informações Pessoais</TabsTrigger>
            <TabsTrigger value="password">Alterar Senha</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>
                  Atualize suas informações de perfil
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-sm text-muted-foreground">
                      O email não pode ser alterado
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nome Completo</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Digite seu nome completo"
                    />
                  </div>

                  <Button type="submit" disabled={loading || !fullName}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Atualizar Perfil
                  </Button>
                </form>

                {/* Dentist Commission Info */}
                {isDentist && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Percent className="h-5 w-5" />
                      Comissão
                    </h3>
                    {isLoadingDentist ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Carregando...
                      </div>
                    ) : dentist ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-muted rounded-lg">
                          <div className="text-3xl font-bold text-primary">
                            {dentist.commission_percentage ?? 50}%
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Percentual de comissão sobre receitas
                          </p>
                        </div>
                        
                        <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="h-5 w-5 text-primary" />
                            <span className="font-semibold">Valores a Receber</span>
                          </div>
                          {isLoadingCommissions ? (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Calculando...
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="text-3xl font-bold text-primary">
                                R$ {totalPendingCommission.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </div>
                              
                              {transactionCount > 0 && (
                                <div className="text-xs space-y-1 text-muted-foreground border-t pt-2">
                                  <div className="flex justify-between">
                                    <span>Bruto ({transactionCount} transações):</span>
                                    <span>R$ {pendingGross.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Taxas de cartão:</span>
                                    <span>- R$ {pendingCardFees.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                                  </div>
                                  <div className="flex justify-between font-medium">
                                    <span>Líquido:</span>
                                    <span>R$ {pendingNet.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                                  </div>
                                  <div className="flex justify-between font-semibold text-primary">
                                    <span>Comissão ({dentist?.commission_percentage ?? 50}%):</span>
                                    <span>R$ {totalPendingCommission.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                  Total de comissões pendentes
                                </p>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => refetchCommissions()}
                                  className="h-8 w-8 p-0"
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        Perfil de dentista não encontrado
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Alterar Senha</CardTitle>
                <CardDescription>
                  Atualize sua senha de acesso
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nova Senha</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Digite a nova senha"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirme a nova senha"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || !newPassword || !confirmPassword}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Alterar Senha
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  );
}
