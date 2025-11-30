export interface ProcedureItem {
  name: string;
  value: number;
}

export interface ProcedureCategory {
  id: string;
  name: string;
  icon: string;
  procedures: ProcedureItem[];
}

export const PROCEDURE_CATEGORIES: ProcedureCategory[] = [
  {
    id: "atestados",
    name: "Atestados / Documentos",
    icon: "📋",
    procedures: [
      { name: "Atestado", value: 50 },
    ],
  },
  {
    id: "cirurgia",
    name: "Cirurgia Oral",
    icon: "🦷",
    procedures: [
      { name: "Exodontia de dente decíduo (molar + canino)", value: 80 },
      { name: "Drenagem de abscesso", value: 180 },
      { name: "Exodontia de terceiro molar (ciso)", value: 100 },
      { name: "Exodontia simples", value: 80 },
      { name: "Frenectomia", value: 350 },
      { name: "Gingivectomia", value: 250 },
      { name: "Gingivoplastia", value: 250 },
      { name: "Remoção de dentes inclusos/impactados (com panorâmica)", value: 580 },
      { name: "Remoção de raiz residual", value: 150 },
      { name: "Remoção de dente supranumerário", value: 200 },
      { name: "Terceiros molares inferiores erupcionados", value: 400 },
      { name: "Terceiros molares inferiores inclusos", value: 400 },
      { name: "Terceiros molares superiores erupcionados", value: 350 },
      { name: "Terceiros molares superiores inclusos", value: 350 },
      { name: "Ulectomia/Ulotomia", value: 150 },
    ],
  },
  {
    id: "dentistica",
    name: "Dentística / Restaurações / Estética",
    icon: "🎨",
    procedures: [
      { name: "Adequação do meio bucal", value: 70 },
      { name: "Aplicação de verniz fluoretado (por dente)", value: 10 },
      { name: "Clareamento dental", value: 700 },
      { name: "Fechamento de diastema", value: 98 },
      { name: "Atendimento de urgência", value: 98 },
      { name: "Faceta direta em resina composta", value: 250 },
      { name: "Faceta indireta em porcelana", value: 700 },
      { name: "Tratamento de lesão cariosa", value: 90 },
      { name: "Pino de retenção", value: 80 },
      { name: "Provisório", value: 120 },
      { name: "Restauração em ionômero de vidro (CIV)", value: 75 },
      { name: "Restauração em resina composta / curativo de urgência", value: 100 },
    ],
  },
  {
    id: "endodontia",
    name: "Endodontia (Canal)",
    icon: "🔩",
    procedures: [
      { name: "Aumento de coroa clínica", value: 150 },
      { name: "Capeamento pulpar", value: 78 },
      { name: "Endodontia em decíduos (pré-incisivos)", value: 80 },
      { name: "Endodontia — Incisivos/Caninos", value: 350 },
      { name: "Endodontia — Molares (MO)", value: 650 },
      { name: "Endodontia — Pré-molares", value: 450 },
      { name: "Rasagem simples", value: 150 },
      { name: "Rasagem subgengival (por segmento)", value: 150 },
      { name: "Rasagem supragengival (por segmento)", value: 150 },
      { name: "Urgência / Pulpectomia / Pulpotomia", value: 150 },
    ],
  },
  {
    id: "estetica-facial",
    name: "Estética Facial",
    icon: "✨",
    procedures: [
      { name: "Botox", value: 900 },
    ],
  },
  {
    id: "implantes",
    name: "Implantes / Protocolo",
    icon: "⚙️",
    procedures: [
      { name: "Levantamento de seio maxilar", value: 2500 },
      { name: "Implante com coroa em porcelana", value: 2400 },
      { name: "Implante com coroa em resina", value: 1800 },
      { name: "Enxerto ósseo (consultar especialista)", value: 750 },
      { name: "Enxerto conjuntivo", value: 800 },
      { name: "Limpeza de protocolo", value: 400 },
      { name: "Overdenture (consultar especialista)", value: 4500 },
      { name: "Protocolo — limpeza", value: 400 },
      { name: "Protocolo 0 (consultar especialista)", value: 11000 },
    ],
  },
  {
    id: "ortodontia",
    name: "Ortodontia",
    icon: "😬",
    procedures: [
      { name: "Alinhadores estéticos", value: 8000 },
      { name: "Aparelho expansor", value: 150 },
      { name: "Aparelho fixo + documentação (WR)", value: 180 },
      { name: "Aparelho móvel", value: 450 },
      { name: "Ativação (fecho + 1 manutenção)", value: 100 },
      { name: "Contenção fixa/móvel (avulsa)", value: 80 },
      { name: "Moldeira de clareamento (par)", value: 180 },
      { name: "Remoção do aparelho fixo + profilaxia", value: 150 },
      { name: "Tratamento com aparelho autoligado — manutenção", value: 120 },
      { name: "Tratamento com aparelho cerâmico — manutenção", value: 100 },
      { name: "Aparelho fixo + manutenção", value: 70 },
    ],
  },
  {
    id: "outros",
    name: "Outros Serviços",
    icon: "🧼",
    procedures: [
      { name: "Aplicação tópica de flúor", value: 10 },
      { name: "Clareamento caseiro", value: 180 },
      { name: "Clareamento de consultório (1 sessão + aplicação)", value: 160 },
      { name: "Consulta + receita", value: 30 },
      { name: "Placa miorrelaxante (bruxismo)", value: 550 },
      { name: "Polimento", value: 90 },
      { name: "Profilaxia", value: 98 },
      { name: "Radiografia periapical (avulsa)", value: 15 },
      { name: "Radiografia periapical (no tratamento)", value: 10 },
      { name: "Tratamento de sensibilidade / ajuste oclusal", value: 80 },
    ],
  },
  {
    id: "periodontia",
    name: "Periodontia",
    icon: "🦷",
    procedures: [
      { name: "Debridamento periodontal", value: 80 },
    ],
  },
  {
    id: "protese-fixas",
    name: "Prótese - Fixas e Unitárias",
    icon: "🏺",
    procedures: [
      { name: "Coroa de resina", value: 100 },
      { name: "Lente de contato dental", value: 1200 },
      { name: "Onlay cerâmica", value: 850 },
      { name: "Núcleo + coroa em resina", value: 380 },
      { name: "Coroa cerâmica", value: 900 },
      { name: "Pino metálico rosqueável", value: 80 },
      { name: "Coroa cermetal (por elemento)", value: 760 },
      { name: "Coroa metálica", value: 180 },
      { name: "Coroa metalocerâmica", value: 760 },
      { name: "Ponte fixa (por elemento)", value: 900 },
      { name: "Onlay (resina/cerâmica)", value: 450 },
    ],
  },
  {
    id: "protese-removiveis",
    name: "Prótese - Removíveis",
    icon: "🏺",
    procedures: [
      { name: "PPR acrílica — reembasamento", value: 150 },
      { name: "Próteses totais — superiores/inferiores (imediata)", value: 750 },
      { name: "Próteses totais — restauração", value: 150 },
      { name: "Reparo", value: 70 },
      { name: "Armação metálica — inferior", value: 1600 },
      { name: "Armação metálica — superior", value: 1680 },
      { name: "PPR acrílica — inferior", value: 850 },
      { name: "PPR acrílica — superior", value: 850 },
      { name: "PPR flex — inferior", value: 1700 },
      { name: "PPR flex — superior", value: 1700 },
    ],
  },
  {
    id: "protese-totais",
    name: "Prótese - Totais",
    icon: "🏺",
    procedures: [
      { name: "Total FLEX — superior", value: 1680 },
      { name: "Total FLEX — inferior", value: 1680 },
      { name: "Total imediata — superior", value: 750 },
      { name: "Total imediata — inferior", value: 750 },
      { name: "Total — superior", value: 1450 },
      { name: "Total — inferior", value: 1450 },
    ],
  },
];

export const getAllProcedures = (): ProcedureItem[] => {
  return PROCEDURE_CATEGORIES.flatMap(category => category.procedures);
};

export const getCategoryById = (id: string): ProcedureCategory | undefined => {
  return PROCEDURE_CATEGORIES.find(category => category.id === id);
};
