import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  Database, 
  FileText, 
  AlertCircle,
  CheckCircle,
  Loader2,
  Calendar,
  HardDrive,
  FileJson,
  FileSpreadsheet
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Backups = () => {
  const { toast } = useToast();
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [lastBackup, setLastBackup] = useState<string | null>(null);

  const handleFullBackup = async () => {
    setIsBackingUp(true);
    try {
      const { data, error } = await supabase.functions.invoke('backup-database');
      
      if (error) throw error;

      setLastBackup(new Date().toISOString());
      toast({
        title: "Backup realizado com sucesso!",
        description: `Backup completo do banco de dados criado.`,
      });
    } catch (error: any) {
      console.error('Backup error:', error);
      toast({
        title: "Erro ao fazer backup",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleExportData = async (format: 'json' | 'csv', table?: string) => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      if (table) params.append('table', table);
      params.append('format', format);

      const { data, error } = await supabase.functions.invoke('export-backup', {
        method: 'GET',
      });

      if (error) throw error;

      // Download the file
      const blob = new Blob([JSON.stringify(data, null, 2)], { 
        type: format === 'json' ? 'application/json' : 'text/csv' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${format}-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Exportação concluída!",
        description: `Dados exportados em formato ${format.toUpperCase()}.`,
      });
    } catch (error: any) {
      console.error('Export error:', error);
      toast({
        title: "Erro ao exportar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const backupFeatures = [
    {
      title: "Backup Completo",
      description: "Cria um backup de todas as tabelas do sistema",
      icon: Database,
      action: handleFullBackup,
      loading: isBackingUp,
      color: "text-primary",
      bg: "bg-primary/10"
    },
    {
      title: "Exportar JSON",
      description: "Exporta todos os dados em formato JSON",
      icon: FileJson,
      action: () => handleExportData('json'),
      loading: isExporting,
      color: "text-success",
      bg: "bg-success/10"
    },
    {
      title: "Exportar CSV",
      description: "Exporta dados em formato CSV para Excel",
      icon: FileSpreadsheet,
      action: () => handleExportData('csv', 'patients'),
      loading: isExporting,
      color: "text-accent",
      bg: "bg-accent/10"
    }
  ];

  const tables = [
    { name: "patients", label: "Pacientes", icon: "👤" },
    { name: "dentists", label: "Dentistas", icon: "🦷" },
    { name: "appointments", label: "Consultas", icon: "📅" },
    { name: "medical_records", label: "Prontuários", icon: "📋" },
    { name: "budgets", label: "Orçamentos", icon: "💰" },
    { name: "financial_transactions", label: "Transações", icon: "💳" }
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Backup e Recuperação
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Gerencie backups e exportações de dados do sistema
        </p>
      </div>

      {/* Alert de Segurança */}
      <Card className="border-warning">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">
                Importante sobre Backups
              </h3>
              <p className="text-sm text-muted-foreground">
                Os backups automáticos do Supabase são realizados diariamente. 
                Use as ferramentas abaixo para criar backups manuais quando necessário.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status do Último Backup */}
      {lastBackup && (
        <Card className="border-success">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-success" />
              <div>
                <p className="font-medium text-foreground">Último backup realizado</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(lastBackup), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ações de Backup */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {backupFeatures.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className={`p-3 rounded-lg ${feature.bg} w-fit mb-2`}>
                  <Icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={feature.action} 
                  disabled={feature.loading}
                  className="w-full"
                >
                  {feature.loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Executar
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Exportar Tabelas Individuais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Exportar Tabelas Individuais
          </CardTitle>
          <CardDescription>
            Exporte dados de tabelas específicas em formato CSV
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tables.map((table) => (
              <Card key={table.name} className="border border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{table.icon}</span>
                      <span className="font-medium text-foreground">{table.label}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExportData('csv', table.name)}
                      disabled={isExporting}
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Documentação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Plano de Recuperação de Desastres
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Consulte o arquivo <code className="bg-muted px-2 py-1 rounded">DISASTER_RECOVERY.md</code> na raiz do projeto 
            para procedimentos detalhados de backup e recuperação.
          </p>

          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">Links Úteis:</h4>
            <div className="space-y-1">
              <a 
                href="https://supabase.com/dashboard/project/ezwisaneqfoympsefnou/settings/database"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline block"
              >
                → Acessar Backups no Supabase
              </a>
              <a 
                href="https://supabase.com/docs/guides/platform/backups"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline block"
              >
                → Documentação de Backups do Supabase
              </a>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Cronograma Recomendado
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6">
              <li>• <strong>Diário:</strong> Backup automático do Supabase</li>
              <li>• <strong>Semanal:</strong> Exportação manual completa</li>
              <li>• <strong>Mensal:</strong> Teste de restauração</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Backups;
