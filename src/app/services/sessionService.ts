import { DesignScopeData, RiskAssessment } from '../App';
import sessionsConfig from '../data/sessions-config.json';
import complianceData from '../data/data.json';

export interface WorkItem {
  text: string;
  documentTypes?: string[];
  iso9001?: string[];
  iso27001Clauses?: string[];
  iso27001AnnexA?: string[];
  iso27701?: string[];
}

export interface SessionDefinition {
  id: string;
  title: string;
  focus: string;
  workItems: WorkItem[];
  isRequired: boolean;
  isOptional: boolean;
  reason?: string;
}

interface SessionConfig {
  id: string;
  title: string;
  focus: string;
  work_items: string[];
  applicability_rules: {
    always_required?: boolean;
    required_when?: Array<{
      condition: string;
      reason: string;
    }>;
    reason_when_required?: string;
    reason_when_optional?: string;
  };
}

// Função para avaliar condições
function evaluateCondition(
  condition: string,
  scopeData: DesignScopeData,
  riskAssessment: RiskAssessment
): boolean {
  // Condições simples baseadas em flags
  if (condition === 'hasPersonalData') {
    return scopeData.dataInvolved !== 'none' && scopeData.dataInvolved !== 'non-personal';
  }
  
  if (condition === 'hasSensitiveData') {
    return scopeData.dataInvolved === 'personal-sensitive' || 
           scopeData.dataInvolved === 'financial' || 
           scopeData.dataInvolved === 'children';
  }
  
  if (condition === 'hasPersistentData') {
    return scopeData.hasPersistentData;
  }
  
  if (condition === 'hasCriticalActions') {
    return scopeData.hasDeleteAction || 
           scopeData.hasIrreversibleAction || 
           scopeData.hasApprovalAction;
  }
  
  if (condition === 'hasSharing') {
    return scopeData.hasShareAction || 
           scopeData.hasExportAction || 
           scopeData.hasExternalIntegrations || 
           scopeData.hasInternalIntegrations;
  }
  
  if (condition === 'hasAuthorizationReq') {
    return scopeData.hasAuthorizationReq;
  }
  
  if (condition === 'hasAuthenticationReq') {
    return scopeData.hasAuthenticationReq;
  }
  
  if (condition === 'hasAffectedExistingUsers') {
    return scopeData.hasAffectedExistingUsers;
  }
  
  if (condition === 'hasChangedBehavior') {
    return scopeData.hasChangedBehavior;
  }
  
  if (condition === 'hasNewDataPurpose') {
    return scopeData.hasNewDataPurpose;
  }
  
  if (condition === 'isHighRisk') {
    return riskAssessment.riskLabel === 'high';
  }
  
  // Condições com valores específicos (ex: "accessModel:authenticated-permissions")
  if (condition.includes(':')) {
    const [field, value] = condition.split(':');
    if (field === 'accessModel') {
      return scopeData.accessModel === value;
    }
  }
  
  return false;
}

// Função para obter dados de conformidade e documentação
function getWorkItemData(sessionId: string, workItemText: string, index: number): Partial<WorkItem> {
  const complianceSection = (complianceData.work_item_compliance as any)[sessionId];
  const documentationSection = (complianceData.work_item_documentation as any)[sessionId];
  
  let compliance = null;
  let documentation = null;
  
  if (complianceSection && Array.isArray(complianceSection)) {
    compliance = complianceSection.find((item: any) => item.index === index);
  }
  
  if (documentationSection && Array.isArray(documentationSection)) {
    documentation = documentationSection.find((item: any) => item.index === index);
  }
  
  return {
    documentTypes: documentation?.document_types,
    iso9001: compliance?.iso_9001_2015,
    iso27001Clauses: compliance?.iso_iec_27001_2022_clauses,
    iso27001AnnexA: compliance?.iso_iec_27001_2022_annexA,
    iso27701: compliance?.iso_iec_27701_2019_clauses
  };
}

// Função principal para calcular sessões aplicáveis
export function calculateApplicableSessions(
  scopeData: DesignScopeData,
  riskAssessment: RiskAssessment
): SessionDefinition[] {
  const sessions: SessionDefinition[] = [];
  
  (sessionsConfig.sessions as SessionConfig[]).forEach((sessionConfig) => {
    let isRequired = false;
    let reason = '';
    
    // Verificar se é sempre obrigatória
    if (sessionConfig.applicability_rules.always_required) {
      isRequired = true;
      reason = sessionConfig.applicability_rules.reason_when_required || '';
    } 
    // Verificar condições de obrigatoriedade
    else if (sessionConfig.applicability_rules.required_when) {
      for (const rule of sessionConfig.applicability_rules.required_when) {
        if (evaluateCondition(rule.condition, scopeData, riskAssessment)) {
          isRequired = true;
          reason = rule.reason;
          break;
        }
      }
    }
    
    // Se não é obrigatória, usar razão opcional
    if (!isRequired) {
      reason = sessionConfig.applicability_rules.reason_when_optional || '';
    }
    
    // Construir work items com dados de conformidade e documentação
    const workItems: WorkItem[] = sessionConfig.work_items.map((itemText, index) => {
      const additionalData = getWorkItemData(sessionConfig.id, itemText, index);
      
      return {
        text: itemText,
        ...additionalData
      };
    });
    
    sessions.push({
      id: sessionConfig.id,
      title: sessionConfig.title,
      focus: sessionConfig.focus,
      workItems,
      isRequired,
      isOptional: !isRequired,
      reason
    });
  });
  
  return sessions;
}
