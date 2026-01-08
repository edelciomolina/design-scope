import { useEffect } from 'react';
import { DesignScopeData, RiskAssessment } from '../App';
import { AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  scopeData: DesignScopeData;
  riskAssessment: RiskAssessment;
  setRiskAssessment: (assessment: RiskAssessment) => void;
}

export function RiskAssessmentStep({
  scopeData,
  riskAssessment,
  setRiskAssessment,
}: Props) {
  useEffect(() => {
    const assessment = calculateRisk(scopeData);
    setRiskAssessment(assessment);
  }, [scopeData, setRiskAssessment]);

  const riskConfig = {
    low: {
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      label: 'Risco Baixo',
      description: 'Processo simplificado de design pode ser aplicado',
    },
    medium: {
      icon: AlertCircle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      label: 'Risco Médio',
      description: 'Requer atenção em áreas específicas de segurança e privacidade',
    },
    high: {
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      label: 'Risco Alto',
      description: 'Requer processo completo de design e revisões rigorosas',
    },
  };

  const config = riskConfig[riskAssessment.riskLabel];
  const Icon = config.icon;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-2">
          Análise de Risco
        </h2>
        <p className="text-sm text-slate-600">
          Classificação automática baseada nas informações do Design Scope Card.
        </p>
      </div>

      {/* Risk Score Card */}
      <div
        className={`${config.bgColor} ${config.borderColor} border-2 rounded-xl p-6`}
      >
        <div className="flex items-start gap-4">
          <div className={`${config.color} p-3 rounded-lg bg-white`}>
            <Icon className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className={`text-2xl font-semibold ${config.color}`}>
                {config.label}
              </h3>
              <span className="text-sm text-slate-600 font-medium">
                Score: {riskAssessment.riskScore}
              </span>
            </div>
            <p className="text-slate-700">{config.description}</p>
          </div>
        </div>
      </div>

      {/* Risk Score Breakdown */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
        <h3 className="font-semibold text-slate-900 mb-4">
          Cálculo do Score de Risco
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Score Base</span>
            <span className="text-sm font-medium text-slate-900">
              {getBaseScore(scopeData)}
            </span>
          </div>

          {scopeData.hasCreateAction && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Criação de dados</span>
              <span className="text-sm font-medium text-slate-900">+5</span>
            </div>
          )}
          {scopeData.hasEditAction && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Alteração de dados</span>
              <span className="text-sm font-medium text-slate-900">+8</span>
            </div>
          )}
          {scopeData.hasDeleteAction && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Exclusão de dados</span>
              <span className="text-sm font-medium text-slate-900">+12</span>
            </div>
          )}
          {scopeData.hasApprovalAction && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Aprovações</span>
              <span className="text-sm font-medium text-slate-900">+15</span>
            </div>
          )}
          {scopeData.hasExportAction && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Exportação</span>
              <span className="text-sm font-medium text-slate-900">+10</span>
            </div>
          )}
          {scopeData.hasShareAction && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Compartilhamento</span>
              <span className="text-sm font-medium text-slate-900">+15</span>
            </div>
          )}
          {scopeData.hasIrreversibleAction && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Ações irreversíveis</span>
              <span className="text-sm font-medium text-red-600">+20</span>
            </div>
          )}
          {scopeData.hasFinancial && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Transações financeiras</span>
              <span className="text-sm font-medium text-red-600">+20</span>
            </div>
          )}
          {scopeData.hasRetentionPolicy && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Política de retenção</span>
              <span className="text-sm font-medium text-slate-900">+5</span>
            </div>
          )}
          {scopeData.hasOnDemandDeletion && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Exclusão sob demanda</span>
              <span className="text-sm font-medium text-slate-900">+8</span>
            </div>
          )}
          {scopeData.hasVersioning && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Versionamento de dados</span>
              <span className="text-sm font-medium text-slate-900">+5</span>
            </div>
          )}
          {scopeData.hasInternalIntegrations && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Integrações internas</span>
              <span className="text-sm font-medium text-slate-900">+3</span>
            </div>
          )}
          {scopeData.hasExternalIntegrations && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Integrações externas</span>
              <span className="text-sm font-medium text-orange-600">+10</span>
            </div>
          )}
          {scopeData.hasInternationalTransfer && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Transferência internacional</span>
              <span className="text-sm font-medium text-red-600">+15</span>
            </div>
          )}
          {scopeData.hasWebhooks && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Webhooks / sincronização</span>
              <span className="text-sm font-medium text-slate-900">+8</span>
            </div>
          )}
          {scopeData.hasAuthorizationReq && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Requisitos de autorização</span>
              <span className="text-sm font-medium text-slate-900">+5</span>
            </div>
          )}
          {scopeData.hasEncryptionAtRest && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Criptografia em repouso</span>
              <span className="text-sm font-medium text-slate-900">+3</span>
            </div>
          )}
          {scopeData.hasAuditLogs && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Logs de auditoria</span>
              <span className="text-sm font-medium text-slate-900">+8</span>
            </div>
          )}
          {scopeData.hasUsageMonitoring && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Monitoramento de uso</span>
              <span className="text-sm font-medium text-slate-900">+5</span>
            </div>
          )}
          {scopeData.hasChangedBehavior && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Mudança de comportamento</span>
              <span className="text-sm font-medium text-slate-900">+8</span>
            </div>
          )}
          {scopeData.hasNewDataPurpose && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Nova finalidade de dados</span>
              <span className="text-sm font-medium text-red-600">+15</span>
            </div>
          )}
          {scopeData.hasChangedDataCollection && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Mudança em dados coletados</span>
              <span className="text-sm font-medium text-orange-600">+12</span>
            </div>
          )}
          {scopeData.hasChangedIntegrations && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Mudança em integrações</span>
              <span className="text-sm font-medium text-orange-600">+10</span>
            </div>
          )}
          {scopeData.hasAffectedExistingUsers && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Impacto em usuários existentes</span>
              <span className="text-sm font-medium text-orange-600">+10</span>
            </div>
          )}
          
          <div className="border-t border-slate-300 pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-900">Score Total</span>
              <span className={`font-semibold ${config.color}`}>
                {riskAssessment.riskScore}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Drivers */}
      {riskAssessment.riskDrivers.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h3 className="font-semibold text-slate-900 mb-4">
            Principais Drivers de Risco
          </h3>
          <ul className="space-y-2">
            {riskAssessment.riskDrivers.map((driver, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${config.color} mt-2`} />
                <span className="text-sm text-slate-700">{driver}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Compliance Standards Considerations */}
      {(scopeData.complianceISO9001 || scopeData.complianceISO27001 || scopeData.complianceISO27701) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-4">
            Considerações de Conformidade
          </h3>
          <div className="space-y-4">
            {scopeData.complianceISO9001 && (
              <div className="bg-white border border-blue-100 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 text-sm mb-2">
                  ISO 9001 - Gestão da Qualidade
                </h4>
                <ul className="space-y-1">
                  {getISO9001Considerations(scopeData).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-blue-800">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {scopeData.complianceISO27001 && (
              <div className="bg-white border border-blue-100 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 text-sm mb-2">
                  ISO/IEC 27001 - Segurança da Informação
                </h4>
                <ul className="space-y-1">
                  {getISO27001Considerations(scopeData).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-blue-800">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {scopeData.complianceISO27701 && (
              <div className="bg-white border border-blue-100 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 text-sm mb-2">
                  ISO/IEC 27701 - Gestão de Privacidade
                </h4>
                <ul className="space-y-1">
                  {getISO27701Considerations(scopeData).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-blue-800">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Explanation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2 text-sm">
          Como o risco é calculado?
        </h4>
        <p className="text-sm text-blue-800 leading-relaxed">
          O score de risco é calculado somando pontos baseados nas características do
          projeto. Dados sensíveis, acesso público e ações críticas aumentam
          significativamente o risco. O label final (Baixo/Médio/Alto) determina quais
          sessões de design são obrigatórias.
        </p>
      </div>
    </div>
  );
}

function getBaseScore(scopeData: DesignScopeData): number {
  const baseScores: Record<string, number> = {
    'new-product': 10,
    'functional-evolution': 5,
    'visual-ux-adjustment': 0,
    'technical-bugfix': 0,
    'technical-refactoring': 0,
    'third-party-integration': 5,
    'discontinuation': 5,
    '': 0,
  };
  return baseScores[scopeData.deliveryType] || 0;
}

function calculateRisk(scopeData: DesignScopeData): RiskAssessment {
  let score = getBaseScore(scopeData);
  const drivers: string[] = [];

  // Data-related risks
  if (scopeData.dataInvolved === 'personal-common') {
    score += 15;
    drivers.push('Manipulação de dados pessoais comuns');
  }
  if (scopeData.dataInvolved === 'personal-sensitive') {
    score += 40;
    drivers.push('Manipulação de dados pessoais sensíveis (alto impacto)');
  }
  if (scopeData.dataInvolved === 'financial') {
    score += 35;
    drivers.push('Manipulação de dados financeiros (alto impacto)');
  }
  if (scopeData.dataInvolved === 'children') {
    score += 45;
    drivers.push('Dados de crianças/adolescentes (alto impacto e conformidade legal)');
  }

  // Access model risks
  if (scopeData.accessModel === 'public') {
    score += 20;
    drivers.push('Acesso público aumenta superfície de exposição');
  }
  if (scopeData.accessModel === 'third-party') {
    score += 15;
    drivers.push('Acesso de terceiros requer controles de autenticação e auditoria');
  }
  if (scopeData.accessModel === 'api-automation') {
    score += 18;
    drivers.push('APIs sem supervisão humana requerem validação e rate limiting');
  }

  // Sensitive action risks
  if (scopeData.hasCreateAction) {
    score += 5;
    drivers.push('Criação de dados requer validação de entrada e auditoria');
  }
  if (scopeData.hasEditAction) {
    score += 8;
    drivers.push('Alteração de dados requer controle de versão e auditoria');
  }
  if (scopeData.hasDeleteAction) {
    score += 12;
    drivers.push('Exclusão requer confirmação, soft delete e auditoria');
  }
  if (scopeData.hasApprovalAction) {
    score += 15;
    drivers.push('Fluxos de aprovação requerem design cuidadoso e rastreabilidade');
  }
  if (scopeData.hasExportAction) {
    score += 10;
    drivers.push('Exportação pode expor dados fora do sistema');
  }
  if (scopeData.hasShareAction) {
    score += 15;
    drivers.push('Compartilhamento aumenta risco de vazamento e acesso não autorizado');
  }
  if (scopeData.hasIrreversibleAction) {
    score += 20;
    drivers.push('Ações irreversíveis requerem confirmação dupla e logging completo');
  }

  // Financial transactions
  if (scopeData.hasFinancial) {
    score += 20;
    drivers.push('Transações financeiras requerem máxima segurança');
  }

  // Persistence & Lifecycle risks
  if (scopeData.hasRetentionPolicy) {
    score += 5;
    drivers.push('Política de retenção requer automação e comunicação clara');
  }
  if (scopeData.hasOnDemandDeletion) {
    score += 8;
    drivers.push('Exclusão sob demanda exige conformidade LGPD/GDPR (direito ao esquecimento)');
  }
  if (scopeData.hasVersioning) {
    score += 5;
    drivers.push('Versionamento aumenta complexidade e requer design de histórico/auditoria');
  }

  // Sharing & Integrations risks
  if (scopeData.hasInternalIntegrations) {
    score += 3;
    drivers.push('Integrações internas requerem autenticação e comunicação segura entre sistemas');
  }
  if (scopeData.hasExternalIntegrations) {
    score += 10;
    drivers.push('Integrações externas requerem OAuth, rate limiting e tratamento de falhas');
  }
  if (scopeData.hasInternationalTransfer) {
    score += 15;
    drivers.push('Transferência internacional requer conformidade LGPD/GDPR e mecanismos de proteção adequados');
  }
  if (scopeData.hasWebhooks) {
    score += 8;
    drivers.push('Webhooks requerem validação de assinatura, retry e idempotência');
  }

  // Security & Reliability risks
  if (scopeData.hasAuthorizationReq) {
    score += 5;
    drivers.push('Sistema de autorização aumenta complexidade e requer gestão de permissões');
  }
  if (scopeData.hasEncryptionAtRest) {
    score += 3;
    drivers.push('Criptografia em repouso requer infraestrutura e gerenciamento de chaves');
  }
  if (scopeData.hasAuditLogs) {
    score += 8;
    drivers.push('Logs de auditoria requerem design de rastreabilidade completa (LGPD/GDPR)');
  }
  if (scopeData.hasUsageMonitoring) {
    score += 5;
    drivers.push('Monitoramento de uso requer dashboards e detecção de anomalias');
  }
  if (scopeData.hasChangedBehavior) {
    score += 8;
    drivers.push('Mudança de comportamento requer revisão de fluxos de usuário e design de feedback');
  }
  if (scopeData.hasNewDataPurpose) {
    score += 15;
    drivers.push('Nova finalidade de dados requer revisão de políticas de privacidade e design de consentimento');
  }
  if (scopeData.hasChangedDataCollection) {
    score += 12;
    drivers.push('Mudança em dados coletados requer revisão de políticas de privacidade e design de consentimento');
  }
  if (scopeData.hasChangedIntegrations) {
    score += 10;
    drivers.push('Mudança em integrações requer revisão de políticas de segurança e design de autenticação');
  }
  if (scopeData.hasAffectedExistingUsers) {
    score += 10;
    drivers.push('Impacto em usuários existentes requer revisão de fluxos de usuário e design de feedback');
  }

  // Override rules
  let label: 'low' | 'medium' | 'high' = 'low';

  if (
    scopeData.dataInvolved === 'personal-sensitive' ||
    scopeData.dataInvolved === 'financial' ||
    scopeData.dataInvolved === 'children' ||
    scopeData.hasIrreversibleAction ||
    (scopeData.accessModel === 'public' && scopeData.dataInvolved !== 'none') ||
    (scopeData.hasShareAction && (scopeData.dataInvolved === 'personal-common' || scopeData.dataInvolved === 'personal-sensitive' || scopeData.dataInvolved === 'financial' || scopeData.dataInvolved === 'children'))
  ) {
    label = 'high';
  } else if (score >= 40) {
    label = 'high';
  } else if (score >= 20) {
    label = 'medium';
  }

  return {
    riskScore: score,
    riskLabel: label,
    riskDrivers: drivers,
  };
}

function getISO9001Considerations(scopeData: DesignScopeData): string[] {
  const considerations: string[] = [];
  
  considerations.push('Documentar processos de design e decisões de forma rastreável (ISO 9001: 7.5)');
  
  const needsValidation = ['new-product', 'functional-evolution'].includes(scopeData.deliveryType);
  if (needsValidation) {
    considerations.push('Validar requisitos com stakeholders antes de iniciar design (ISO 9001: 8.2.3)');
  }
  
  if (scopeData.hasApprovalAction) {
    considerations.push('Implementar processo de revisão e aprovação documentado (ISO 9001: 8.3.4)');
  }
  
  const isChangeWork = ['functional-evolution', 'visual-ux-adjustment', 'technical-bugfix'].includes(scopeData.deliveryType);
  if (isChangeWork) {
    considerations.push('Controlar mudanças de design com análise de impacto (ISO 9001: 8.3.6)');
  }
  
  if (considerations.length === 1) {
    considerations.push('Garantir rastreabilidade e qualidade nas entregas de design');
  }
  
  return considerations;
}

function getISO27001Considerations(scopeData: DesignScopeData): string[] {
  const considerations: string[] = [];
  
  if (scopeData.dataInvolved !== 'none') {
    considerations.push('Classificar ativos de informação e aplicar controles apropriados (ISO 27001: A.8.2)');
  }
  
  if (scopeData.accessModel === 'public') {
    considerations.push('Implementar controles de acesso público com autenticação quando necessário (ISO 27001: A.9.1)');
  }
  
  if (scopeData.hasDeleteAction || scopeData.hasIrreversibleAction) {
    considerations.push('Implementar logs de auditoria para ações críticas (ISO 27001: A.12.4)');
  }
  
  if (scopeData.hasShareAction || scopeData.hasExportAction) {
    considerations.push('Controlar transferência de informações e prevenir vazamentos (ISO 27001: A.13.2)');
  }
  
  if (scopeData.hasFinancial) {
    considerations.push('Aplicar controles criptográficos para dados financeiros (ISO 27001: A.10)');
  }
  
  if (scopeData.dataInvolved === 'personal-sensitive' || scopeData.dataInvolved === 'financial' || scopeData.dataInvolved === 'children') {
    considerations.push('Proteger dados sensíveis em armazenamento e transmissão (ISO 27001: A.8.2.3)');
  }
  
  if (considerations.length === 0) {
    considerations.push('Aplicar princípios de segurança da informação no design');
  }
  
  return considerations;
}

function getISO27701Considerations(scopeData: DesignScopeData): string[] {
  const considerations: string[] = [];
  
  if (scopeData.dataInvolved === 'personal-common' || scopeData.dataInvolved === 'personal-sensitive' || scopeData.dataInvolved === 'financial' || scopeData.dataInvolved === 'children') {
    considerations.push('Implementar Privacy by Design desde o início (ISO 27701: 6.1.1)');
    considerations.push('Minimizar coleta de dados pessoais ao estritamente necessário (ISO 27701: 7.2.2)');
  }
  
  if (scopeData.dataInvolved === 'personal-sensitive' || scopeData.dataInvolved === 'children') {
    considerations.push('Obter consentimento explícito para processamento de dados sensíveis (ISO 27701: 7.3.2)');
    considerations.push('Implementar controles rigorosos para dados sensíveis (ISO 27701: 7.2.8)');
  }
  
  if (scopeData.hasDeleteAction && scopeData.dataInvolved !== 'none') {
    considerations.push('Garantir direito de exclusão de dados pessoais (ISO 27701: 7.3.4)');
  }
  
  if (scopeData.hasExportAction && scopeData.dataInvolved !== 'none') {
    considerations.push('Implementar portabilidade de dados em formato estruturado (ISO 27701: 7.3.5)');
  }
  
  if (scopeData.hasShareAction && scopeData.dataInvolved !== 'none') {
    considerations.push('Obter consentimento antes de compartilhar dados pessoais (ISO 27701: 7.3.3)');
    considerations.push('Documentar transferência de dados a terceiros (ISO 27701: 7.5.1)');
  }
  
  if (scopeData.accessModel === 'public' && scopeData.dataInvolved !== 'none') {
    considerations.push('Informar claramente sobre coleta e uso de dados (ISO 27701: 7.3.1)');
  }
  
  if (scopeData.dataInvolved !== 'none') {
    considerations.push('Implementar mecanismos de transparência e controle do titular (ISO 27701: 7.3)');
  }
  
  if (considerations.length === 0) {
    considerations.push('Aplicar princípios de privacidade no design');
  }
  
  return considerations;
}