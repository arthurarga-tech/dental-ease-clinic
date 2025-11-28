# 🆘 Plano de Recuperação de Desastres - DentalCare System

## 📋 Visão Geral

Este documento descreve os procedimentos para backup e recuperação do sistema DentalCare em caso de desastres.

---

## 🔄 Estratégia de Backup

### 1. Backups Automáticos do Supabase

**Frequência:** Diário  
**Retenção:** 7 dias (Plano Gratuito) / 30 dias (Plano Pro)  
**Localização:** Dashboard do Supabase  

**Como acessar:**
1. Acesse: https://supabase.com/dashboard/project/ezwisaneqfoympsefnou/settings/database
2. Vá para a seção "Backups"
3. Selecione o backup desejado
4. Clique em "Restore"

### 2. Backup Programático via Edge Functions

**Função:** `backup-database`  
**Frequência:** Configurável via cron  
**Dados incluídos:**
- ✅ Pacientes
- ✅ Dentistas
- ✅ Consultas
- ✅ Prontuários Médicos
- ✅ Orçamentos
- ✅ Transações Financeiras
- ✅ Perfis de Usuários
- ✅ Roles de Usuários

**Como executar manualmente:**
```bash
# Via Supabase CLI
supabase functions invoke backup-database

# Via API
curl -X POST https://ezwisaneqfoympsefnou.supabase.co/functions/v1/backup-database \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### 3. Exportação Manual de Dados

**Função:** `export-backup`

**Exportar todos os dados:**
```bash
curl "https://ezwisaneqfoympsefnou.supabase.co/functions/v1/export-backup" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -o backup-$(date +%Y%m%d).json
```

**Exportar tabela específica em CSV:**
```bash
curl "https://ezwisaneqfoympsefnou.supabase.co/functions/v1/export-backup?table=patients&format=csv" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -o patients-backup-$(date +%Y%m%d).csv
```

---

## 🚨 Cenários de Desastre e Recuperação

### Cenário 1: Exclusão Acidental de Dados

**Tempo de Recuperação:** 15-30 minutos

**Procedimento:**
1. Identifique quando os dados foram deletados
2. Acesse o Dashboard do Supabase > Database > Backups
3. Selecione o backup anterior à exclusão
4. Clique em "Restore" para a tabela específica
5. Verifique a integridade dos dados restaurados

### Cenário 2: Corrupção de Banco de Dados

**Tempo de Recuperação:** 30-60 minutos

**Procedimento:**
1. Pare todas as operações críticas
2. Acesse o backup mais recente no Supabase
3. Restaure o banco de dados completo
4. Execute verificações de integridade:
   ```sql
   -- Verificar contagem de registros
   SELECT 'patients' as table_name, COUNT(*) as count FROM patients
   UNION ALL
   SELECT 'appointments', COUNT(*) FROM appointments
   UNION ALL
   SELECT 'dentists', COUNT(*) FROM dentists;
   ```
5. Notifique os usuários sobre a restauração

### Cenário 3: Perda Total do Projeto Supabase

**Tempo de Recuperação:** 2-4 horas

**Procedimento:**
1. Crie um novo projeto no Supabase
2. Execute todas as migrations:
   ```bash
   # Navegue até a pasta do projeto
   cd supabase/migrations
   
   # Execute as migrations em ordem
   psql -h your-new-project.supabase.co \
        -U postgres \
        -f *.sql
   ```
3. Restaure os dados do último backup:
   - Use o arquivo JSON exportado
   - Importe tabela por tabela
4. Reconfigure as variáveis de ambiente no Lovable
5. Atualize as credenciais do Supabase no código
6. Teste todas as funcionalidades críticas

### Cenário 4: Falha de Autenticação

**Tempo de Recuperação:** 5-10 minutos

**Procedimento:**
1. Verifique o status do Supabase: https://status.supabase.com
2. Confirme as credenciais em `src/integrations/supabase/client.ts`
3. Verifique as configurações de autenticação no Dashboard
4. Se necessário, gere novas chaves de API

---

## 📊 Checklist de Recuperação

### Antes da Recuperação
- [ ] Identifique o tipo de desastre
- [ ] Determine o ponto de restauração desejado
- [ ] Notifique os usuários sobre manutenção
- [ ] Faça um backup do estado atual (mesmo corrompido)
- [ ] Documente o incidente

### Durante a Recuperação
- [ ] Pare operações críticas se necessário
- [ ] Execute o procedimento de restauração
- [ ] Monitore logs e erros
- [ ] Verifique integridade referencial

### Após a Recuperação
- [ ] Execute testes de integridade de dados
- [ ] Verifique todas as funcionalidades principais
- [ ] Notifique usuários sobre conclusão
- [ ] Documente lições aprendidas
- [ ] Atualize procedimentos se necessário

---

## 🔐 Dados Críticos e Prioridades

### Prioridade 1 (Crítico - Recuperar Primeiro)
1. `user_roles` - Permissões e acessos
2. `profiles` - Dados de usuários
3. `patients` - Informações de pacientes
4. `dentists` - Dados dos profissionais

### Prioridade 2 (Importante)
5. `appointments` - Agendamentos
6. `medical_records` - Prontuários
7. `financial_transactions` - Transações financeiras

### Prioridade 3 (Desejável)
8. `budgets` - Orçamentos
9. `specializations` - Especializações
10. Outras tabelas de configuração

---

## 📞 Contatos de Emergência

### Suporte Técnico
- **Supabase Support:** https://supabase.com/support
- **Lovable Support:** https://lovable.dev/support

### Equipe Interna
- **Administrador do Sistema:** [Seu Nome/Email]
- **Backup do Administrador:** [Nome/Email]

---

## 🔄 Agendamento de Backups Recomendado

### Diário (Automático)
- Backups nativos do Supabase (configurados automaticamente)

### Semanal (Manual)
- Exportação completa via `export-backup`
- Armazenamento em local seguro externo

### Mensal (Manual)
- Backup completo para armazenamento de longo prazo
- Teste de restauração em ambiente de desenvolvimento

---

## 📝 Registro de Incidentes

| Data | Tipo | Causa | Tempo de Recuperação | Ações Tomadas |
|------|------|-------|---------------------|---------------|
| - | - | - | - | - |

---

## 🎯 Metas de Recuperação

- **RTO (Recovery Time Objective):** 2 horas
- **RPO (Recovery Point Objective):** 24 horas
- **Disponibilidade Alvo:** 99.5%

---

## ⚠️ Importante

1. **Teste os procedimentos regularmente** - Execute restaurações de teste mensalmente
2. **Mantenha múltiplas cópias** - Nunca dependa de uma única fonte de backup
3. **Documente mudanças** - Atualize este documento sempre que houver alterações
4. **Treine a equipe** - Garanta que múltiplas pessoas conheçam os procedimentos

---

**Última Atualização:** 28 de Novembro de 2024  
**Versão:** 1.0  
**Responsável:** Equipe DentalCare
