# ⏰ Automatização de Backups - Configuração Cron

Este guia explica como configurar backups automáticos usando pg_cron no Supabase.

---

## 📋 Pré-requisitos

Antes de começar, você precisa:

1. Acesso ao Dashboard do Supabase
2. Permissões de administrador no projeto
3. Edge functions `backup-database` e `export-backup` implantadas

---

## 🔧 Configuração do pg_cron

### Passo 1: Habilitar Extensões

1. Acesse o SQL Editor no Supabase:
   https://supabase.com/dashboard/project/ezwisaneqfoympsefnou/sql/new

2. Execute os seguintes comandos SQL:

```sql
-- Habilitar pg_cron (para agendamento)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Habilitar pg_net (para chamadas HTTP)
CREATE EXTENSION IF NOT EXISTS pg_net;
```

### Passo 2: Configurar Backup Diário

Execute no SQL Editor:

```sql
-- Backup completo diário às 3h da manhã
SELECT cron.schedule(
  'daily-database-backup',
  '0 3 * * *',  -- 3h da manhã todo dia
  $$
  SELECT
    net.http_post(
      url := 'https://ezwisaneqfoympsefnou.supabase.co/functions/v1/backup-database',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6d2lzYW5lcWZveW1wc2Vmbm91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMDU3NzQsImV4cCI6MjA3Mzc4MTc3NH0.LS38AcM76jLRYUp-nEEOlPRwIyXz2EPXYzLGeoLl_Kk"}'::jsonb,
      body := concat('{"scheduled_at": "', now(), '"}')::jsonb
    ) AS request_id;
  $$
);
```

### Passo 3: Configurar Backup Semanal Completo

```sql
-- Backup semanal aos domingos às 2h da manhã
SELECT cron.schedule(
  'weekly-full-export',
  '0 2 * * 0',  -- Domingo às 2h
  $$
  SELECT
    net.http_post(
      url := 'https://ezwisaneqfoympsefnou.supabase.co/functions/v1/export-backup',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6d2lzYW5lcWZveW1wc2Vmbm91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMDU3NzQsImV4cCI6MjA3Mzc4MTc3NH0.LS38AcM76jLRYUp-nEEOlPRwIyXz2EPXYzLGeoLl_Kk"}'::jsonb,
      body := '{"format": "json", "scheduled": true}'::jsonb
    ) AS request_id;
  $$
);
```

---

## 📅 Formatos de Cron

Use estes exemplos para configurar diferentes frequências:

```bash
# Formato: minuto hora dia_do_mês mês dia_da_semana

# A cada hora
'0 * * * *'

# Todo dia às 3h da manhã
'0 3 * * *'

# Toda segunda-feira às 9h
'0 9 * * 1'

# Primeiro dia do mês às 00:00
'0 0 1 * *'

# A cada 6 horas
'0 */6 * * *'

# Dias úteis às 18h (segunda a sexta)
'0 18 * * 1-5'
```

---

## 🔍 Gerenciar Jobs Agendados

### Ver todos os jobs agendados

```sql
SELECT * FROM cron.job;
```

### Desabilitar um job

```sql
-- Substitua 'nome-do-job' pelo nome do seu job
SELECT cron.unschedule('daily-database-backup');
```

### Ver histórico de execuções

```sql
-- Últimas 10 execuções
SELECT 
  job_name,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 10;
```

### Ver apenas execuções com erro

```sql
SELECT 
  job_name,
  status,
  return_message,
  start_time
FROM cron.job_run_details
WHERE status = 'failed'
ORDER BY start_time DESC;
```

---

## 🚨 Monitoramento e Alertas

### Criar função de notificação de erro

```sql
CREATE OR REPLACE FUNCTION notify_backup_failure()
RETURNS void AS $$
BEGIN
  -- Você pode implementar uma notificação por email ou webhook aqui
  RAISE NOTICE 'Backup failed at %', NOW();
END;
$$ LANGUAGE plpgsql;
```

### Verificar status do último backup

```sql
-- Ver último backup executado
SELECT 
  job_name,
  status,
  return_message,
  start_time,
  end_time,
  (end_time - start_time) as duration
FROM cron.job_run_details
WHERE job_name = 'daily-database-backup'
ORDER BY start_time DESC
LIMIT 1;
```

---

## 🎯 Estratégia Recomendada

### Configuração Ideal

1. **Backup Diário Automático** (3h da manhã)
   - Backup completo do banco via edge function
   - Mantém últimos 7 dias

2. **Exportação Semanal** (Domingo, 2h)
   - Exportação completa em JSON
   - Para arquivo de longo prazo

3. **Backup Manual** (Quando necessário)
   - Via interface da página `/backups`
   - Antes de grandes mudanças no sistema

### Retenção de Backups

- **Diários:** 7 dias
- **Semanais:** 4 semanas
- **Mensais:** 12 meses

---

## ⚙️ Configuração Avançada

### Backup Incremental (apenas mudanças)

```sql
-- Criar tabela para rastrear último backup
CREATE TABLE IF NOT EXISTS backup_tracking (
  id SERIAL PRIMARY KEY,
  table_name TEXT NOT NULL,
  last_backup_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  records_count INTEGER
);

-- Função para backup incremental
CREATE OR REPLACE FUNCTION incremental_backup()
RETURNS void AS $$
DECLARE
  last_backup TIMESTAMP;
BEGIN
  SELECT last_backup_at INTO last_backup
  FROM backup_tracking
  WHERE table_name = 'patients'
  ORDER BY last_backup_at DESC
  LIMIT 1;
  
  -- Backup apenas registros novos/modificados
  -- Implementar lógica de backup incremental aqui
END;
$$ LANGUAGE plpgsql;
```

### Compressão de Backups Antigos

```sql
-- Agendar compressão de backups antigos (mensal)
SELECT cron.schedule(
  'compress-old-backups',
  '0 1 1 * *',  -- Primeiro dia do mês à 1h
  $$
  -- Lógica para comprimir ou arquivar backups antigos
  SELECT 1;
  $$
);
```

---

## 🔐 Segurança

### Proteção da API Key

**⚠️ IMPORTANTE:** A API key no exemplo acima é a chave pública (anon key). Para maior segurança em produção:

1. Use Service Role Key para backups sensíveis
2. Configure políticas RLS adequadas
3. Restrinja acesso às edge functions de backup

### Rotação de Chaves

Quando atualizar suas chaves de API:

1. Atualize os jobs do cron
2. Teste manualmente antes
3. Monitore logs após mudança

---

## 📊 Monitoramento de Performance

### Criar view para estatísticas

```sql
CREATE VIEW backup_stats AS
SELECT 
  job_name,
  COUNT(*) as total_runs,
  COUNT(*) FILTER (WHERE status = 'succeeded') as successful,
  COUNT(*) FILTER (WHERE status = 'failed') as failed,
  AVG(EXTRACT(EPOCH FROM (end_time - start_time))) as avg_duration_seconds
FROM cron.job_run_details
WHERE job_name LIKE '%backup%'
GROUP BY job_name;

-- Consultar estatísticas
SELECT * FROM backup_stats;
```

---

## 🆘 Troubleshooting

### Problema: Job não executa

**Verificar:**
```sql
-- Ver se o job está ativo
SELECT * FROM cron.job WHERE jobname = 'daily-database-backup';

-- Ver logs de erro
SELECT * FROM cron.job_run_details 
WHERE job_name = 'daily-database-backup' 
AND status = 'failed'
ORDER BY start_time DESC;
```

### Problema: Timeout na execução

**Solução:** Dividir backup em partes menores
```sql
-- Backup por tabela individual em horários diferentes
-- Pacientes às 3h
-- Dentistas às 3:15h
-- Etc.
```

### Problema: Espaço em disco

**Monitorar uso:**
```sql
-- Ver tamanho das tabelas
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 📝 Checklist de Implementação

- [ ] Habilitar extensões `pg_cron` e `pg_net`
- [ ] Configurar backup diário
- [ ] Configurar backup semanal
- [ ] Testar execução manual do job
- [ ] Configurar monitoramento de falhas
- [ ] Documentar horários de backup
- [ ] Definir política de retenção
- [ ] Testar processo de restauração

---

## 🔗 Links Úteis

- [Documentação pg_cron](https://github.com/citusdata/pg_cron)
- [Documentação pg_net](https://github.com/supabase/pg_net)
- [Supabase Functions](https://supabase.com/docs/guides/functions)
- [Crontab Generator](https://crontab.guru/)

---

**Última Atualização:** 28 de Novembro de 2024  
**Versão:** 1.0
