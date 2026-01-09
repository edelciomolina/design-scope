import { DesignScopeData, RiskAssessment } from "../App";
import sessionsConfig from "../data/sessions-config.json";
import complianceDataDefault from "../data/data.json";

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
  status: "required" | "optional" | "not-applicable";
  reason?: string;
  source?: "rule" | "override";
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
  manual_override?: SessionOverride;
}

export interface SessionOverride {
  status: "required" | "optional" | "not-applicable";
  reason: string;
  updatedAt?: string;
}

interface PersistResult {
  ok: boolean;
  message?: string;
}

// Local cache so we can apply overrides and persist changes
let sessionsConfigCache: SessionConfig[] =
  (sessionsConfig.sessions as SessionConfig[]) || [];
let complianceData = complianceDataDefault;

export function getSessionsConfig(): SessionConfig[] {
  return sessionsConfigCache;
}

function setSessionsConfig(next: SessionConfig[]) {
  sessionsConfigCache = next;
}

async function persistJsonFile(
  fileName: string,
  payload: unknown
): Promise<PersistResult> {
  try {
    if (typeof window === "undefined") {
      // Node/SSR path
      const fsPromises = await new Function('return import("fs/promises")')();
      const { writeFile } = fsPromises as typeof import("fs/promises");
      const url = new URL(`../data/${fileName}`, import.meta.url);
      await writeFile(url, JSON.stringify(payload, null, 2), "utf-8");
      return { ok: true };
    }

    if ("showSaveFilePicker" in window) {
      // Browser File System Access API
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: fileName,
        types: [
          { description: "JSON", accept: { "application/json": [".json"] } }
        ]
      });
      const writable = await handle.createWritable();
      await writable.write(JSON.stringify(payload, null, 2));
      await writable.close();
      return { ok: true };
    }

    // Fallback: trigger download so user can replace file manually
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return {
      ok: true,
      message: "Download gerado; substitua o arquivo JSON original."
    };
  } catch (error) {
    console.error("Erro ao persistir JSON", error);
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Erro desconhecido"
    };
  }
}

// Função para avaliar condições
function evaluateCondition(
  condition: string,
  scopeData: DesignScopeData,
  riskAssessment: RiskAssessment
): boolean {
  // Condições simples baseadas em flags
  if (condition === "hasPersonalData") {
    return (
      scopeData.dataInvolved !== "none" &&
      scopeData.dataInvolved !== "non-personal"
    );
  }

  if (condition === "hasSensitiveData") {
    return (
      scopeData.dataInvolved === "personal-sensitive" ||
      scopeData.dataInvolved === "financial" ||
      scopeData.dataInvolved === "children"
    );
  }

  if (condition === "hasPersistentData") {
    return scopeData.hasPersistentData;
  }

  if (condition === "hasCriticalActions") {
    return (
      scopeData.hasDeleteAction ||
      scopeData.hasIrreversibleAction ||
      scopeData.hasApprovalAction
    );
  }

  if (condition === "hasSharing") {
    return (
      scopeData.hasShareAction ||
      scopeData.hasExportAction ||
      scopeData.hasExternalIntegrations ||
      scopeData.hasInternalIntegrations
    );
  }

  if (condition === "hasAuthorizationReq") {
    return scopeData.hasAuthorizationReq;
  }

  if (condition === "hasAuthenticationReq") {
    return scopeData.hasAuthenticationReq;
  }

  if (condition === "hasAffectedExistingUsers") {
    return scopeData.hasAffectedExistingUsers;
  }

  if (condition === "hasChangedBehavior") {
    return scopeData.hasChangedBehavior;
  }

  if (condition === "hasNewDataPurpose") {
    return scopeData.hasNewDataPurpose;
  }

  if (condition === "isHighRisk") {
    return riskAssessment.riskLabel === "high";
  }

  // Condições com valores específicos (ex: "accessModel:authenticated-permissions")
  if (condition.includes(":")) {
    const [field, value] = condition.split(":");
    if (field === "accessModel") {
      return scopeData.accessModel === value;
    }
  }

  return false;
}

// Função para obter dados de conformidade e documentação
function getWorkItemData(
  sessionId: string,
  workItemText: string,
  index: number
): Partial<WorkItem> {
  const complianceSection = (complianceData.work_item_compliance as any)[
    sessionId
  ];
  const documentationSection = (complianceData.work_item_documentation as any)[
    sessionId
  ];

  let compliance = null;
  let documentation = null;

  if (complianceSection && Array.isArray(complianceSection)) {
    compliance = complianceSection.find((item: any) => item.index === index);
  }

  if (documentationSection && Array.isArray(documentationSection)) {
    documentation = documentationSection.find(
      (item: any) => item.index === index
    );
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

  sessionsConfigCache.forEach((sessionConfig) => {
    let status: SessionDefinition["status"] = "optional";
    let reason = "";
    let source: SessionDefinition["source"] = "rule";

    // Aplicar regra de override manual se existir
    if (sessionConfig.manual_override) {
      status = sessionConfig.manual_override.status;
      reason = sessionConfig.manual_override.reason;
      source = "override";
    } else {
      // Verificar se é sempre obrigatória
      if (sessionConfig.applicability_rules.always_required) {
        status = "required";
        reason = sessionConfig.applicability_rules.reason_when_required || "";
      }
      // Verificar condições de obrigatoriedade
      else if (sessionConfig.applicability_rules.required_when) {
        for (const rule of sessionConfig.applicability_rules.required_when) {
          if (evaluateCondition(rule.condition, scopeData, riskAssessment)) {
            status = "required";
            reason = rule.reason;
            break;
          }
        }
      }

      // Se não é obrigatória, usar razão opcional
      if (status !== "required") {
        reason = sessionConfig.applicability_rules.reason_when_optional || "";
      }
    }

    // Construir work items com dados de conformidade e documentação
    const workItems: WorkItem[] = sessionConfig.work_items.map(
      (itemText, index) => {
        const additionalData = getWorkItemData(
          sessionConfig.id,
          itemText,
          index
        );

        return {
          text: itemText,
          ...additionalData
        };
      }
    );

    sessions.push({
      id: sessionConfig.id,
      title: sessionConfig.title,
      focus: sessionConfig.focus,
      workItems,
      isRequired: status === "required",
      isOptional: status === "optional",
      status,
      reason,
      source
    });
  });

  return sessions;
}

export async function applyManualOverride(
  sessionId: string,
  override: SessionOverride,
  scopeData: DesignScopeData,
  riskAssessment: RiskAssessment
): Promise<{ ok: boolean; message?: string; sessions?: SessionDefinition[] }> {
  const nextConfig = sessionsConfigCache.map((session) =>
    session.id === sessionId
      ? {
          ...session,
          manual_override: {
            ...override,
            updatedAt: new Date().toISOString()
          }
        }
      : session
  );

  setSessionsConfig(nextConfig);
  const persistResult = await persistJsonFile("sessions-config.json", {
    sessions: nextConfig
  });

  const nextSessions = calculateApplicableSessions(scopeData, riskAssessment);

  return {
    ok: persistResult.ok,
    message: persistResult.message,
    sessions: nextSessions
  };
}
