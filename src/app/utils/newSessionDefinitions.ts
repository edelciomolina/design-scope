import { DesignScopeData, RiskAssessment } from '../App';

export interface WorkItem {
  text: string;
  documentTypes?: string[];
  iso9001?: string[];
  iso27001Clauses?: string[];
  iso27001AnnexA?: string[];
  iso27701?: string[];
}

export interface NewSessionDefinition {
  id: string;
  title: string;
  focus: string;
  workItems: WorkItem[];
  isRequired: boolean;
  isOptional: boolean;
  reason?: string;
}

// Mapeamento de conformidade ISO por work item
const complianceMapping: Record<string, Record<number, {
  iso9001?: string[];
  iso27001Clauses?: string[];
  iso27001AnnexA?: string[];
  iso27701?: string[];
}>> = {
  objective: {
    0: { iso9001: ['4.1', '4.2', '6.1', '8.2.2'], iso27001Clauses: ['4.1', '4.2', '6.1'], iso27001AnnexA: ['A.5.8'], iso27701: ['5'] },
    1: { iso9001: ['4.2', '8.2.2'], iso27001Clauses: ['4.2', '6.1'], iso27001AnnexA: ['A.5.8'], iso27701: ['5', '6'] },
    2: { iso9001: ['6.2', '8.2.1', '9.1.1'], iso27001Clauses: ['6.2', '9.1'], iso27001AnnexA: ['A.5.8'], iso27701: ['5'] },
    3: { iso9001: ['4.3', '8.2.2'], iso27001Clauses: ['4.3'], iso27001AnnexA: ['A.5.1'], iso27701: ['5'] },
    4: { iso9001: ['6.2', '9.1.1', '9.1.3', '10.3'], iso27001Clauses: ['6.2', '9.1', '10.1'], iso27001AnnexA: ['A.8.15', 'A.8.16'], iso27701: ['5'] }
  },
  data_involved: {
    0: { iso9001: ['8.2.2', '8.3.3', '7.5'], iso27001Clauses: ['6.1', '8.1'], iso27001AnnexA: ['A.5.12', 'A.8.24'], iso27701: ['5', '6', '7'] },
    1: { iso9001: ['8.3.5', '7.5'], iso27001Clauses: ['8.1'], iso27001AnnexA: ['A.5.12', 'A.8.10'], iso27701: ['5', '6', '7'] },
    2: { iso9001: ['7.1.3', '8.5.1', '7.5'], iso27001Clauses: ['8.1'], iso27001AnnexA: ['A.8.13', 'A.8.24', 'A.8.10'], iso27701: ['5', '6', '7'] },
    3: { iso9001: ['8.2.2', '6.1'], iso27001Clauses: ['6.1'], iso27001AnnexA: ['A.5.12', 'A.8.11', 'A.8.12', 'A.8.24'], iso27701: ['5', '6', '7'] },
    4: { iso9001: ['8.2.2', '8.4.1'], iso27001Clauses: ['6.1'], iso27001AnnexA: ['A.5.19', 'A.5.23', 'A.5.14'], iso27701: ['5', '6', '7'] }
  },
  user_journey: {
    0: { iso9001: ['8.2.2', '8.3.3', '8.3.5'], iso27001Clauses: ['6.1', '8.1'], iso27001AnnexA: ['A.8.26', 'A.8.27'], iso27701: ['5', '6'] },
    1: { iso9001: ['8.3.3', '8.3.4'], iso27001Clauses: ['6.1'], iso27001AnnexA: ['A.8.26'], iso27701: ['5', '6'] },
    2: { iso9001: ['8.3.3', '8.3.5'], iso27001Clauses: ['6.1', '8.1'], iso27001AnnexA: ['A.8.29'], iso27701: ['5', '6'] },
    3: { iso9001: ['8.5.1', '8.7', '10.2'], iso27001Clauses: ['8.1'], iso27001AnnexA: ['A.8.15', 'A.8.16'], iso27701: ['5', '7'] },
    4: { iso9001: ['9.1.2', '9.1.3', '10.3'], iso27001Clauses: ['9.1'], iso27001AnnexA: ['A.8.16'], iso27701: ['5', '6'] }
  },
  screens_interactions: {
    0: { iso9001: ['8.3.3', '8.3.5'], iso27001Clauses: ['8.1'], iso27001AnnexA: ['A.8.26', 'A.8.27'], iso27701: ['5', '6'] },
    1: { iso9001: ['8.3.3', '8.2.2'], iso27001Clauses: ['6.1'], iso27001AnnexA: ['A.5.12', 'A.8.26'], iso27701: ['5', '6', '7'] },
    2: { iso9001: ['8.3.3', '8.5.1'], iso27001Clauses: ['8.1'], iso27001AnnexA: ['A.5.15', 'A.8.26'], iso27701: ['5', '6', '7'] },
    3: { iso9001: ['8.2.1', '8.3.3'], iso27001Clauses: ['7.4'], iso27001AnnexA: [], iso27701: ['6'] },
    4: { iso9001: ['8.5.1', '9.1.2'], iso27001Clauses: ['7.5'], iso27001AnnexA: [], iso27701: ['5'] }
  },
  critical_actions: {
    0: { iso9001: ['8.5.1', '8.6', '8.7'], iso27001Clauses: ['8.1'], iso27001AnnexA: ['A.5.15', 'A.8.15', 'A.8.16'], iso27701: ['6', '7'] },
    1: { iso9001: ['8.5.1', '8.5.6', '8.7'], iso27001Clauses: ['8.1'], iso27001AnnexA: ['A.8.32', 'A.8.15'], iso27701: ['6', '7'] },
    2: { iso9001: ['8.5.1', '8.7'], iso27001Clauses: ['8.1'], iso27001AnnexA: ['A.8.10', 'A.8.15'], iso27701: ['6', '7'] },
    3: { iso9001: ['8.2.1', '8.5.1'], iso27001Clauses: ['8.1'], iso27001AnnexA: ['A.8.26'], iso27701: ['6'] },
    4: { iso9001: ['6.1', '8.5.1', '8.5.6'], iso27001Clauses: ['6.1', '8.1'], iso27001AnnexA: ['A.8.26', 'A.8.27', 'A.8.29'], iso27701: ['5', '6', '7'] }
  },
  rules_limits: {
    0: { iso9001: ['8.2.2', '8.3.3'], iso27001Clauses: ['8.1'], iso27001AnnexA: ['A.5.15', 'A.5.18'], iso27701: ['6', '7'] },
    1: { iso9001: ['6.1', '8.5.1'], iso27001Clauses: ['6.1', '8.1'], iso27001AnnexA: ['A.5.15', 'A.5.16', 'A.5.18'], iso27701: ['7'] },
    2: { iso9001: ['8.2.2', '8.3.3', '8.5.1'], iso27001Clauses: ['8.1'], iso27001AnnexA: ['A.8.26'], iso27701: ['5'] },
    3: { iso9001: ['8.5.1', '8.7'], iso27001Clauses: ['8.1'], iso27001AnnexA: ['A.8.32', 'A.8.15'], iso27701: ['5'] },
    4: { iso9001: ['8.2.2', '8.5.1'], iso27001Clauses: ['5.2', '7.3'], iso27001AnnexA: ['A.5.10'], iso27701: ['5'] }
  },
  privacy_experience: {
    0: { iso9001: ['8.2.1', '8.2.2'], iso27001Clauses: ['7.4'], iso27001AnnexA: [], iso27701: ['6'] },
    1: { iso9001: ['8.2.1'], iso27001Clauses: ['4.2', '8.1'], iso27001AnnexA: [], iso27701: ['6'] },
    2: { iso9001: ['8.2.1', '8.5.1'], iso27001Clauses: ['8.1'], iso27001AnnexA: ['A.5.15'], iso27701: ['6', '7'] },
    3: { iso9001: ['8.5.1', '8.7'], iso27001Clauses: ['8.1'], iso27001AnnexA: ['A.8.10', 'A.5.15'], iso27701: ['6', '7'] },
    4: { iso9001: ['8.2.1', '7.3'], iso27001Clauses: ['7.4'], iso27001AnnexA: [], iso27701: ['6'] }
  },
  sharing_integrations: {
    0: { iso9001: ['8.5.1', '8.6'], iso27001Clauses: ['8.1'], iso27001AnnexA: ['A.5.14', 'A.8.24', 'A.5.15'], iso27701: ['6', '7'] },
    1: { iso9001: ['8.3.3', '8.4.1'], iso27001Clauses: ['8.1'], iso27001AnnexA: ['A.5.19', 'A.5.23', 'A.8.20', 'A.8.26'], iso27701: ['6', '7'] },
    2: { iso9001: ['8.4.1', '8.4.2'], iso27001Clauses: ['8.1'], iso27001AnnexA: ['A.5.19', 'A.5.20', 'A.5.21', 'A.5.22', 'A.5.23'], iso27701: ['6', '7'] },
    3: { iso9001: ['8.2.2', '8.5.1'], iso27001Clauses: ['6.1', '8.1'], iso27001AnnexA: ['A.5.14', 'A.5.15', 'A.8.12'], iso27701: ['6', '7'] },
    4: { iso9001: ['8.2.1', '8.2.2'], iso27001Clauses: ['7.4'], iso27001AnnexA: ['A.5.15'], iso27701: ['6'] }
  },
  errors_states: {
    0: { iso9001: ['8.5.1', '8.2.1'], iso27001Clauses: ['8.1'], iso27001AnnexA: ['A.8.26'], iso27701: ['5'] },
    1: { iso9001: ['8.5.1', '8.7'], iso27001Clauses: ['8.1'], iso27001AnnexA: ['A.8.15', 'A.8.16'], iso27701: ['5', '7'] },
    2: { iso9001: ['8.2.1', '8.5.1'], iso27001Clauses: ['7.4'], iso27001AnnexA: ['A.8.26'], iso27701: ['5', '7'] },
    3: { iso9001: ['8.7', '10.2'], iso27001Clauses: ['8.1'], iso27001AnnexA: ['A.8.13', 'A.5.30'], iso27701: ['5', '7'] },
    4: { iso9001: ['7.2', '7.3', '8.5.1'], iso27001Clauses: ['7.2', '7.3'], iso27001AnnexA: ['A.6.3'], iso27701: ['5'] }
  },
  user_visible_security: {
    0: { iso9001: ['8.5.1', '6.1'], iso27001Clauses: ['8.1'], iso27001AnnexA: ['A.5.16', 'A.5.17', 'A.5.15'], iso27701: ['7'] },
    1: { iso9001: ['8.5.1', '8.7'], iso27001Clauses: ['8.1'], iso27001AnnexA: ['A.8.26'], iso27701: ['7'] },
    2: { iso9001: ['8.7', '10.2'], iso27001Clauses: ['9.1'], iso27001AnnexA: ['A.8.16', 'A.8.15'], iso27701: ['7'] },
    3: { iso9001: ['8.5.1'], iso27001Clauses: ['8.1'], iso27001AnnexA: ['A.5.16', 'A.5.18'], iso27701: ['7'] },
    4: { iso9001: ['9.1.1', '10.2'], iso27001Clauses: ['9.1', '10.1'], iso27001AnnexA: ['A.8.16', 'A.8.15'], iso27701: ['7'] }
  },
  change_evolution: {
    0: { iso9001: ['6.3', '8.3.6', '8.5.6'], iso27001Clauses: ['6.1', '8.1'], iso27001AnnexA: ['A.8.32'], iso27701: ['5', '6'] },
    1: { iso9001: ['8.3.6', '8.5.6', '8.2.4'], iso27001Clauses: ['8.1'], iso27001AnnexA: ['A.8.32', 'A.8.31'], iso27701: ['5'] },
    2: { iso9001: ['8.2.4', '6.1'], iso27001Clauses: ['6.1'], iso27001AnnexA: ['A.5.12', 'A.8.24'], iso27701: ['5', '6', '7'] },
    3: { iso9001: ['8.2.1', '8.2.4'], iso27001Clauses: ['7.4'], iso27001AnnexA: ['A.5.14'], iso27701: ['6'] },
    4: { iso9001: ['8.5.6', '8.3.6'], iso27001Clauses: ['8.1'], iso27001AnnexA: ['A.8.32', 'A.8.13'], iso27701: ['5', '7'] }
  },
  decisions_commitments: {
    0: { iso9001: ['6.1', '8.3.3', '8.3.4'], iso27001Clauses: ['6.1'], iso27001AnnexA: ['A.5.8'], iso27701: ['5'] },
    1: { iso9001: ['6.1', '10.2'], iso27001Clauses: ['6.1', '10.1'], iso27001AnnexA: ['A.5.4'], iso27701: ['5'] },
    2: { iso9001: ['6.3', '8.3.2'], iso27001Clauses: ['6.1', '6.3'], iso27001AnnexA: ['A.5.8'], iso27701: ['5'] },
    3: { iso9001: ['5.3', '7.2'], iso27001Clauses: ['5.3'], iso27001AnnexA: ['A.5.2'], iso27701: ['5'] },
    4: { iso9001: ['7.5', '8.3.2'], iso27001Clauses: ['7.5'], iso27001AnnexA: [], iso27701: ['5'] }
  }
};

// Mapeamento de tipos de documento por work item
const documentMapping: Record<string, Record<number, string[]>> = {
  objective: {
    0: ['PRD', 'Problem statement'],
    1: ['Personas/ICP', 'Mapa de stakeholders'],
    2: ['OKRs/KPIs', 'Métricas de sucesso'],
    3: ['Lista de fora de escopo'],
    4: ['Critérios de aceitação', 'Plano de métricas']
  },
  data_involved: {
    0: ['Inventário de dados', 'Dicionário de dados'],
    1: ['Inventário de dados', 'Especificação de eventos/logs'],
    2: ['Modelo de dados (ERD)', 'Política de retenção'],
    3: ['Classificação de dados', 'ROPA/Registro de tratamento'],
    4: ['Diagrama de fluxo de dados (DFD)', 'Lista de fontes e contratos']
  },
  user_journey: {
    0: ['Mapa de jornada', 'Fluxo do usuário'],
    1: ['Fluxograma/BPMN'],
    2: ['Fluxograma/BPMN'],
    3: ['Lista de edge cases', 'Catálogo de erros'],
    4: ['Funil/analytics', 'Mapa de jornada']
  },
  screens_interactions: {
    0: ['Wireframes', 'Mockups/protótipo'],
    1: ['Especificação de formulário', 'Dicionário de dados'],
    2: ['Especificação funcional', 'Fluxo do usuário'],
    3: ['Guia de copy', 'Lista de mensagens/CTAs'],
    4: ['Design system/UI guidelines']
  },
  critical_actions: {
    0: ['Especificação de API (OpenAPI)', 'Modelo de dados (ERD)', 'Critérios de aceitação'],
    1: ['Especificação de API (OpenAPI)', 'Regras de validação', 'Critérios de aceitação'],
    2: ['Política de retenção e exclusão', 'Especificação de API (OpenAPI)'],
    3: ['Wireframes', 'Guia de copy'],
    4: ['Diagrama de workflow', 'Design técnico', 'Runbook/monitoramento']
  },
  rules_limits: {
    0: ['Tabela de limites por perfil', 'Matriz de permissões (RBAC)'],
    1: ['Matriz de permissões (RBAC)', 'Modelo de autorização'],
    2: ['Catálogo de regras de negócio', 'Tabela de decisão'],
    3: ['Lista de exceções', 'Tabela de decisão'],
    4: ['Política de uso aceitável', 'Regras/bloqueios']
  },
  privacy_experience: {
    0: ['Política/aviso de privacidade', 'Copy de privacidade'],
    1: ['Fluxo de consentimento', 'Registro de consentimento'],
    2: ['Wireframes', 'Especificação de exportação/relatório'],
    3: ['Fluxo DSAR', 'Procedimento de exclusão'],
    4: ['Guia de linguagem', 'Checklist de acessibilidade']
  },
  sharing_integrations: {
    0: ['Especificação de exportação', 'Formato de arquivo'],
    1: ['Especificação de API (OpenAPI)', 'Diagrama de sequência'],
    2: ['Lista de fornecedores/integradores', 'Arquitetura de integração', 'DPA'],
    3: ['Diagrama de fluxo de dados (DFD)', 'Regras de automação'],
    4: ['Wireframes', 'Especificação de configuração/feature flags']
  },
  errors_states: {
    0: ['Wireframes', 'Especificação de comportamento'],
    1: ['Catálogo de erros', 'Casos de teste'],
    2: ['Guia de mensagens/copy', 'Design de estados'],
    3: ['Runbook', 'Plano de contingência'],
    4: ['Checklist de UX', 'Regras de validação']
  },
  user_visible_security: {
    0: ['Especificação de autenticação', 'Diagrama de sequência'],
    1: ['Wireframes', 'Guia de copy'],
    2: ['Catálogo de alertas', 'Runbook de resposta a incidentes'],
    3: ['Especificação de sessão', 'Diagrama de autenticação/sessão'],
    4: ['Regras de detecção', 'Plano de monitoramento']
  },
  change_evolution: {
    0: ['Análise de impacto', 'Plano de rollout'],
    1: ['Guia de migração', 'Changelog'],
    2: ['Atualização do inventário de dados', 'DPIA/LIA'],
    3: ['Plano de comunicação', 'Templates de mensagens'],
    4: ['Plano de migração', 'Runbook de migração']
  },
  decisions_commitments: {
    0: ['ADR (Architecture Decision Record)'],
    1: ['Registro de riscos', 'Aceite de risco'],
    2: ['Lista de decisões pendentes', 'Backlog'],
    3: ['RACI (matriz)'],
    4: ['Registro de decisões']
  }
};

export function calculateNewSessions(
  scopeData: DesignScopeData,
  riskAssessment: RiskAssessment
): NewSessionDefinition[] {
  const hasPersonalData = scopeData.dataInvolved !== 'none' && scopeData.dataInvolved !== 'non-personal';
  const hasSensitiveData = scopeData.dataInvolved === 'personal-sensitive' || 
                          scopeData.dataInvolved === 'financial' || 
                          scopeData.dataInvolved === 'children';
  const isHighRisk = riskAssessment.riskLabel === 'high';
  const hasCriticalActions = scopeData.hasDeleteAction || scopeData.hasIrreversibleAction || 
                             scopeData.hasApprovalAction;
  const hasSharing = scopeData.hasShareAction || scopeData.hasExportAction || 
                     scopeData.hasExternalIntegrations || scopeData.hasInternalIntegrations;

  const sessions: NewSessionDefinition[] = [
    {
      id: 'objective',
      title: 'Objetivo do Produto ou Mudança',
      focus: 'Definir claramente o que está sendo construído ou alterado e por quê',
      workItems: getWorkItemsWithCompliance('objective', [
        'Problema que será resolvido',
        'Público-alvo',
        'Resultado esperado',
        'Fora de escopo',
        'Critérios de sucesso'
      ]),
      isRequired: true,
      isOptional: false,
      reason: 'Sessão fundamental para estabelecer contexto e alinhamento'
    },
    {
      id: 'data_involved',
      title: 'Dados Envolvidos',
      focus: 'Identificar quais dados o produto utiliza',
      workItems: getWorkItemsWithCompliance('data_involved', [
        'Dados coletados',
        'Dados gerados',
        'Dados armazenados',
        'Dados pessoais ou sensíveis',
        'Origem dos dados'
      ]),
      isRequired: hasPersonalData || scopeData.hasPersistentData,
      isOptional: !hasPersonalData && !scopeData.hasPersistentData,
      reason: hasPersonalData 
        ? 'Obrigatória: produto envolve dados pessoais que precisam ser mapeados para conformidade LGPD/GDPR'
        : scopeData.hasPersistentData
        ? 'Obrigatória: produto armazena dados que precisam ser inventariados'
        : 'Opcional: produto não envolve dados pessoais ou armazenamento significativo'
    },
    {
      id: 'user_journey',
      title: 'Jornada do Usuário',
      focus: 'Descrever como o usuário utiliza o produto na prática',
      workItems: getWorkItemsWithCompliance('user_journey', [
        'Fluxo principal',
        'Pontos de decisão',
        'Caminhos alternativos',
        'Possíveis erros do usuário',
        'Pontos de abandono'
      ]),
      isRequired: true,
      isOptional: false,
      reason: 'Sessão fundamental para entender experiência do usuário'
    },
    {
      id: 'screens_interactions',
      title: 'Telas e Interações Principais',
      focus: 'Definir o que aparece na interface e como o usuário interage',
      workItems: getWorkItemsWithCompliance('screens_interactions', [
        'Telas principais',
        'Campos relevantes',
        'Ações disponíveis',
        'Textos críticos (labels, CTAs)',
        'Consistência visual e de linguagem'
      ]),
      isRequired: true,
      isOptional: false,
      reason: 'Sessão fundamental para design de interface'
    },
    {
      id: 'critical_actions',
      title: 'Ações Críticas',
      focus: 'Mapear ações que geram impacto relevante',
      workItems: getWorkItemsWithCompliance('critical_actions', [
        'Criação de dados',
        'Alteração de dados',
        'Exclusão de dados',
        'Confirmações importantes',
        'Automatizações sensíveis'
      ]),
      isRequired: hasCriticalActions,
      isOptional: !hasCriticalActions,
      reason: hasCriticalActions
        ? 'Obrigatória: produto possui ações destrutivas ou irreversíveis que exigem confirmação e auditoria'
        : 'Opcional: produto não possui ações críticas identificadas'
    },
    {
      id: 'rules_limits',
      title: 'Regras de Uso e Limites',
      focus: 'Definir limites e restrições de uso do produto',
      workItems: getWorkItemsWithCompliance('rules_limits', [
        'Limites por perfil de usuário',
        'Restrições de acesso',
        'Regras de negócio',
        'Exceções previstas',
        'Comportamentos proibidos'
      ]),
      isRequired: scopeData.hasAuthorizationReq || scopeData.accessModel === 'authenticated-permissions',
      isOptional: !scopeData.hasAuthorizationReq && scopeData.accessModel !== 'authenticated-permissions',
      reason: scopeData.hasAuthorizationReq || scopeData.accessModel === 'authenticated-permissions'
        ? 'Obrigatória: produto implementa controle de acesso e permissões'
        : 'Opcional: produto não tem requisitos de autorização'
    },
    {
      id: 'privacy_experience',
      title: 'Privacidade na Experiência',
      focus: 'Garantir transparência e controle sobre dados do usuário',
      workItems: getWorkItemsWithCompliance('privacy_experience', [
        'Comunicação sobre uso de dados',
        'Consentimento quando aplicável',
        'Visualização de dados pelo usuário',
        'Edição ou exclusão de dados',
        'Linguagem clara e acessível'
      ]),
      isRequired: hasPersonalData,
      isOptional: !hasPersonalData,
      reason: hasPersonalData
        ? 'Obrigatória: LGPD/GDPR exigem transparência e controle sobre dados pessoais'
        : 'Opcional: produto não envolve dados pessoais'
    },
    {
      id: 'sharing_integrations',
      title: 'Compartilhamento e Integrações',
      focus: 'Controlar quando e como dados saem do produto',
      workItems: getWorkItemsWithCompliance('sharing_integrations', [
        'Exportações de dados',
        'Integrações via API',
        'Serviços terceiros envolvidos',
        'Compartilhamentos automáticos',
        'Compartilhamentos opcionais'
      ]),
      isRequired: hasSharing,
      isOptional: !hasSharing,
      reason: hasSharing
        ? 'Obrigatória: produto permite compartilhamento ou integração de dados'
        : 'Opcional: produto não compartilha dados externamente'
    },
    {
      id: 'errors_states',
      title: 'Erros, Estados e Exceções',
      focus: 'Definir comportamento do sistema em falhas ou estados incomuns',
      workItems: getWorkItemsWithCompliance('errors_states', [
        'Estados vazios',
        'Erros esperados',
        'Mensagens de erro',
        'Recuperação de falhas',
        'Prevenção de erro humano'
      ]),
      isRequired: true,
      isOptional: false,
      reason: 'Sessão fundamental para robustez e experiência do usuário'
    },
    {
      id: 'user_visible_security',
      title: 'Segurança Visível ao Usuário',
      focus: 'Definir proteções percebidas pelo usuário',
      workItems: getWorkItemsWithCompliance('user_visible_security', [
        'Autenticação e logout',
        'Confirmações de ações sensíveis',
        'Alertas de segurança',
        'Gestão de sessões',
        'Detecção de ações suspeitas'
      ]),
      isRequired: scopeData.hasAuthenticationReq || hasCriticalActions || hasSensitiveData,
      isOptional: !scopeData.hasAuthenticationReq && !hasCriticalActions && !hasSensitiveData,
      reason: scopeData.hasAuthenticationReq || hasCriticalActions || hasSensitiveData
        ? 'Obrigatória: produto exige autenticação ou lida com ações/dados sensíveis'
        : 'Opcional: produto não tem requisitos de segurança visível'
    },
    {
      id: 'change_evolution',
      title: 'Mudanças e Evolução',
      focus: 'Avaliar impacto de mudanças ao longo do tempo',
      workItems: getWorkItemsWithCompliance('change_evolution', [
        'Impacto em usuários existentes',
        'Quebra de compatibilidade',
        'Novo uso de dados',
        'Necessidade de comunicação',
        'Migração ou adaptação'
      ]),
      isRequired: scopeData.hasAffectedExistingUsers || scopeData.hasChangedBehavior || scopeData.hasNewDataPurpose,
      isOptional: !scopeData.hasAffectedExistingUsers && !scopeData.hasChangedBehavior && !scopeData.hasNewDataPurpose,
      reason: scopeData.hasAffectedExistingUsers || scopeData.hasChangedBehavior || scopeData.hasNewDataPurpose
        ? 'Obrigatória: mudança impacta usuários existentes ou comportamento do sistema'
        : 'Opcional: trabalho novo sem impacto em funcionalidades existentes'
    },
    {
      id: 'decisions_commitments',
      title: 'Decisões e Compromissos',
      focus: 'Registrar decisões tomadas conscientemente',
      workItems: getWorkItemsWithCompliance('decisions_commitments', [
        'Trade-offs aceitos',
        'Riscos assumidos',
        'Decisões adiadas',
        'Responsáveis',
        'Data das decisões'
      ]),
      isRequired: isHighRisk,
      isOptional: !isHighRisk,
      reason: isHighRisk
        ? 'Obrigatória: projeto de alto risco exige registro formal de decisões e trade-offs'
        : 'Opcional: recomendado para rastreabilidade de decisões importantes'
    }
  ];

  return sessions;
}

function getWorkItemsWithCompliance(sessionId: string, items: string[]): WorkItem[] {
  const sessionCompliance = complianceMapping[sessionId];
  const sessionDocuments = documentMapping[sessionId];
  
  if (!sessionCompliance && !sessionDocuments) {
    return items.map(text => ({ text }));
  }

  return items.map((text, index) => {
    const compliance = sessionCompliance?.[index];
    const documents = sessionDocuments?.[index];
    
    return {
      text,
      documentTypes: documents,
      iso9001: compliance?.iso9001,
      iso27001Clauses: compliance?.iso27001Clauses,
      iso27001AnnexA: compliance?.iso27001AnnexA,
      iso27701: compliance?.iso27701
    };
  });
}
