import { DesignScopeData, RiskAssessment, SessionStatus } from '../App';
import { FileText, Copy, CheckCircle2, Image } from 'lucide-react';
import { Button } from './ui/button';
import { useState, useRef } from 'react';
import { getSessionDefinition } from '../utils/sessionDefinitions';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import html2canvas from 'html2canvas';

interface Props {
  scopeData: DesignScopeData;
  riskAssessment: RiskAssessment;
  sessions: SessionStatus[];
}

type TabType = 
  | { type: 'static'; id: string; label: string }
  | { type: 'session-detail'; id: string; session: SessionStatus }
  | { type: 'session-na'; id: string; session: SessionStatus };

export function FinalDocumentation({
  scopeData,
  riskAssessment,
  sessions,
}: Props) {
  const requiredAndOptionalSessions = sessions.filter(
    (s) => s.status === 'required' || s.status === 'optional'
  );
  const notApplicableSessions = sessions.filter((s) => s.status === 'not-applicable');

  // Build tabs list
  const tabs: TabType[] = [
    { type: 'static', id: 'resumo', label: 'Resumo Executivo' },
    { type: 'static', id: 'scope', label: 'Scope Card' },
    { type: 'static', id: 'risco', label: 'Análise de Risco' },
  ];

  // Add session details
  if (requiredAndOptionalSessions.length > 0) {
    tabs.push({ type: 'static', id: 'sessoes-detalhes-header', label: 'Sessões Detalhadas' });
    requiredAndOptionalSessions.forEach((session) => {
      tabs.push({ type: 'session-detail', id: `session-${session.id}`, session });
    });
  }

  // Add N/A sessions
  if (notApplicableSessions.length > 0) {
    tabs.push({ type: 'static', id: 'sessoes-na-header', label: 'Sessões N/A' });
    notApplicableSessions.forEach((session) => {
      tabs.push({ type: 'session-na', id: `session-na-${session.id}`, session });
    });
  }

  // Add decisions
  tabs.push({ type: 'static', id: 'decisoes', label: 'Decisões' });

  const [activeTab, setActiveTab] = useState<string>(tabs[0].id);
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const [copiedFigmaStates, setCopiedFigmaStates] = useState<Record<string, boolean>>({});
  const contentRef = useRef<HTMLDivElement>(null);

  const copyToClipboard = (text: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
          .then(resolve)
          .catch(() => {
            fallbackCopyToClipboard(text, resolve, reject);
          });
      } else {
        fallbackCopyToClipboard(text, resolve, reject);
      }
    });
  };

  const fallbackCopyToClipboard = (
    text: string,
    resolve: () => void,
    reject: (error: Error) => void
  ) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (successful) {
        resolve();
      } else {
        reject(new Error('Copy command failed'));
      }
    } catch (err) {
      document.body.removeChild(textArea);
      reject(err as Error);
    }
  };

  const generateSectionMarkdown = (tabId: string): string => {
    // Handle static tabs
    if (tabId === 'resumo') {
      return `# Resumo Executivo

**Tipo de Trabalho:** ${getDeliveryTypeLabel(scopeData.deliveryType)}

**Classificação de Risco:** **${riskAssessment.riskLabel.toUpperCase()}** (Score: ${riskAssessment.riskScore})`;
    }

    if (tabId === 'scope') {
      return `# Design Scope Card

| Categoria | Informação |
|-----------|------------|
| **Tipo de Entrega** | ${getDeliveryTypeLabel(scopeData.deliveryType)} |
| **Dados Envolvidos** | ${getDataTypeLabel(scopeData.dataInvolved)} |
| **Modelo de Acesso** | ${getAccessModelLabel(scopeData.accessModel)} |
| **Capacidade do Usuário** | ${getUserCapabilityLabel(scopeData.userCapability)} |

## Ações Sensíveis
${scopeData.hasCreateAction ? '- ✅ Criação de dados' : ''}
${scopeData.hasEditAction ? '- ✅ Alteração de dados' : ''}
${scopeData.hasDeleteAction ? '- ✅ Exclusão de dados' : ''}
${scopeData.hasApprovalAction ? '- ✅ Aprovação / reprovação' : ''}
${scopeData.hasExportAction ? '- ✅ Exportação' : ''}
${scopeData.hasShareAction ? '- ✅ Compartilhamento' : ''}
${scopeData.hasIrreversibleAction ? '- ✅ Ações irreversíveis' : ''}
${scopeData.hasFinancial ? '- ✅ Transações financeiras' : ''}
${!scopeData.hasCreateAction && !scopeData.hasEditAction && !scopeData.hasDeleteAction && !scopeData.hasApprovalAction && !scopeData.hasExportAction && !scopeData.hasShareAction && !scopeData.hasIrreversibleAction && !scopeData.hasFinancial ? '- ❌ Nenhuma ação sensível' : ''}

## Persistência & Ciclo de Vida
${scopeData.hasTemporaryData ? '- ✅ Dados temporários' : ''}
${scopeData.hasPersistentData ? '- ✅ Dados persistentes' : ''}
${scopeData.hasRetentionPolicy ? '- ✅ Política de retenção' : ''}
${scopeData.hasOnDemandDeletion ? '- ✅ Exclusão sob demanda (LGPD/GDPR)' : ''}
${scopeData.hasVersioning ? '- ✅ Versionamento de dados' : ''}
${!scopeData.hasTemporaryData && !scopeData.hasPersistentData && !scopeData.hasRetentionPolicy && !scopeData.hasOnDemandDeletion && !scopeData.hasVersioning ? '- ❌ Sem características especiais de persistência' : ''}

## Compartilhamento & Integrações
${scopeData.hasNoSharing ? '- ✅ Nenhum compartilhamento' : ''}
${scopeData.hasInternalIntegrations ? '- ✅ Integrações internas' : ''}
${scopeData.hasExternalIntegrations ? '- ✅ Integrações externas' : ''}
${scopeData.hasInternationalTransfer ? '- ✅ Transferência internacional de dados' : ''}
${scopeData.hasWebhooks ? '- ✅ Webhooks / sincronização automática' : ''}
${!scopeData.hasNoSharing && !scopeData.hasInternalIntegrations && !scopeData.hasExternalIntegrations && !scopeData.hasInternationalTransfer && !scopeData.hasWebhooks ? '- ❌ Sem compartilhamento ou integrações' : ''}

## Segurança & Confiabilidade
${scopeData.hasAuthenticationReq ? '- ✅ Requisitos de autenticação' : ''}
${scopeData.hasAuthorizationReq ? '- ✅ Requisitos de autorização' : ''}
${scopeData.hasEncryptionInTransit ? '- ✅ Criptografia em trânsito' : ''}
${scopeData.hasEncryptionAtRest ? '- ✅ Criptografia em repouso' : ''}
${scopeData.hasAuditLogs ? '- ✅ Logs de auditoria' : ''}
${scopeData.hasUsageMonitoring ? '- ✅ Monitoramento de uso' : ''}
${!scopeData.hasAuthenticationReq && !scopeData.hasAuthorizationReq && !scopeData.hasEncryptionInTransit && !scopeData.hasEncryptionAtRest && !scopeData.hasAuditLogs && !scopeData.hasUsageMonitoring ? '- ❌ Sem requisitos especiais de segurança' : ''}

## Impacto de Mudança
${scopeData.hasNoImpact ? '- ✅ Sem impacto funcional' : ''}
${scopeData.hasChangedBehavior ? '- ✅ Altera comportamento existente' : ''}
${scopeData.hasNewDataPurpose ? '- ✅ Nova finalidade de uso de dados (CRÍTICO)' : ''}
${scopeData.hasChangedDataCollection ? '- ✅ Mudança em dados coletados' : ''}
${scopeData.hasChangedIntegrations ? '- ✅ Mudança em integrações' : ''}
${scopeData.hasAffectedExistingUsers ? '- ✅ Afeta usuários existentes' : ''}
${!scopeData.hasNoImpact && !scopeData.hasChangedBehavior && !scopeData.hasNewDataPurpose && !scopeData.hasChangedDataCollection && !scopeData.hasChangedIntegrations && !scopeData.hasAffectedExistingUsers ? '- ❌ Sem impacto de mudança identificado' : ''}`;
    }

    if (tabId === 'risco') {
      return `# Análise de Risco

**Classificação:** **${riskAssessment.riskLabel.toUpperCase()}**  
**Score Total:** ${riskAssessment.riskScore}

## Drivers de Risco
${riskAssessment.riskDrivers.map((d) => `- ${d}`).join('\n')}`;
    }

    if (tabId === 'decisoes') {
      return `# Decisões de Governança de Design

## Trade-offs Identificados
${getTradeoffs(scopeData, riskAssessment)}

## Restrições Conhecidas
${getConstraints(scopeData)}

---

*Gerado em: ${new Date().toLocaleString('pt-BR')}*  
*Design Change & Risk Orchestrator v1.0*`;
    }

    // Handle session details
    if (tabId.startsWith('session-')) {
      const sessionId = tabId.replace('session-', '').replace('na-', '');
      const session = sessions.find((s) => s.id === sessionId);
      
      if (session) {
        if (session.status === 'not-applicable') {
          return `# ${session.name}

**Status:** NÃO APLICÁVEL

## Razão
${session.reason}`;
        } else {
          const def = getSessionDefinition(session.id, scopeData, riskAssessment);
          return `# ${def.name}

**Status:** ${getStatusLabel(session.status)}

## Propósito
${def.purpose}

## O que Desenhar
${def.whatToDesign.map((item) => `- ${item}`).join('\n')}

## Checklist de Verificação
${def.checklist.map((item) => `- [ ] ${item}`).join('\n')}

## Notas / Limites
${def.notes}`;
        }
      }
    }

    return '';
  };

  const generateSectionFigma = (tabId: string): string => {
    const baseCode = `await figma.loadFontAsync({ family: "Inter", style: "Regular" });
await figma.loadFontAsync({ family: "Inter", style: "Bold" });
await figma.loadFontAsync({ family: "Inter", style: "SemiBold" });

const mainFrame = figma.createFrame();
mainFrame.name = "Design Governance - ${getTabLabel(tabId)}";
mainFrame.layoutMode = "VERTICAL";
mainFrame.primaryAxisSizingMode = "AUTO";
mainFrame.counterAxisSizingMode = "AUTO";
mainFrame.paddingLeft = 48;
mainFrame.paddingRight = 48;
mainFrame.paddingTop = 48;
mainFrame.paddingBottom = 48;
mainFrame.itemSpacing = 24;
mainFrame.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];

`;

    let sectionCode = '';

    if (tabId === 'resumo') {
      sectionCode = `const title = figma.createText();
title.fontName = { family: "Inter", style: "Bold" };
title.fontSize = 28;
title.characters = "1. RESUMO EXECUTIVO";
title.fills = [{ type: "SOLID", color: { r: 0.1, g: 0.1, b: 0.1 } }];
mainFrame.appendChild(title);

const deliveryType = figma.createText();
deliveryType.fontName = { family: "Inter", style: "Regular" };
deliveryType.fontSize = 16;
deliveryType.characters = "Tipo de Trabalho: ${getDeliveryTypeLabel(scopeData.deliveryType)}";
deliveryType.fills = [{ type: "SOLID", color: { r: 0.3, g: 0.3, b: 0.3 } }];
mainFrame.appendChild(deliveryType);

const riskClass = figma.createText();
riskClass.fontName = { family: "Inter", style: "Bold" };
riskClass.fontSize = 16;
riskClass.characters = "Classificação de Risco: ${riskAssessment.riskLabel.toUpperCase()} (Score: ${riskAssessment.riskScore})";
riskClass.fills = [{ type: "SOLID", color: { r: 0.85, g: 0.2, b: 0.2 } }];
mainFrame.appendChild(riskClass);`;
    } else if (tabId === 'scope') {
      sectionCode = `const title = figma.createText();
title.fontName = { family: "Inter", style: "Bold" };
title.fontSize = 28;
title.characters = "2. DESIGN SCOPE CARD";
title.fills = [{ type: "SOLID", color: { r: 0.1, g: 0.1, b: 0.1 } }];
mainFrame.appendChild(title);

const scopeInfo = figma.createText();
scopeInfo.fontName = { family: "Inter", style: "Regular" };
scopeInfo.fontSize = 16;
scopeInfo.characters = "Tipo de Entrega: ${getDeliveryTypeLabel(scopeData.deliveryType)}\\nDados Envolvidos: ${getDataTypeLabel(scopeData.dataInvolved)}\\nModelo de Acesso: ${getAccessModelLabel(scopeData.accessModel)}\\nCapacidade do Usuário: ${getUserCapabilityLabel(scopeData.userCapability)}";
scopeInfo.fills = [{ type: "SOLID", color: { r: 0.3, g: 0.3, b: 0.3 } }];
mainFrame.appendChild(scopeInfo);

const characteristics = figma.createText();
characteristics.fontName = { family: "Inter", style: "Regular" };
characteristics.fontSize = 16;
characteristics.characters = "Características:\\\\n${scopeData.hasEditCapability ? '✅ Editar dados' : '❌ Sem edição'}\\\\n${scopeData.hasDeleteCapability ? '✅ Deletar dados' : '❌ Sem deleção'}\\\\n${scopeData.hasExportCapability ? '✅ Exportar dados' : '❌ Sem exportação'}\\\\n${scopeData.hasShareCapability ? '✅ Compartilhar com outros' : '❌ Sem compartilhamento'}";
characteristics.fills = [{ type: "SOLID", color: { r: 0.3, g: 0.3, b: 0.3 } }];
mainFrame.appendChild(characteristics);`;
    } else if (tabId === 'risco') {
      sectionCode = `const title = figma.createText();
title.fontName = { family: "Inter", style: "Bold" };
title.fontSize = 28;
title.characters = "3. ANÁLISE DE RISCO";
title.fills = [{ type: "SOLID", color: { r: 0.1, g: 0.1, b: 0.1 } }];
mainFrame.appendChild(title);

const riskInfo = figma.createText();
riskInfo.fontName = { family: "Inter", style: "SemiBold" };
riskInfo.fontSize = 16;
riskInfo.characters = "Classificação: ${riskAssessment.riskLabel.toUpperCase()}\\nScore Total: ${riskAssessment.riskScore}";
riskInfo.fills = [{ type: "SOLID", color: { r: 0.3, g: 0.3, b: 0.3 } }];
mainFrame.appendChild(riskInfo);

const drivers = figma.createText();
drivers.fontName = { family: "Inter", style: "Regular" };
drivers.fontSize = 16;
drivers.characters = "Drivers de Risco:\\n${riskAssessment.riskDrivers.map((d, i) => `${i + 1}. ${d}`).join('\\n')}";
drivers.fills = [{ type: "SOLID", color: { r: 0.3, g: 0.3, b: 0.3 } }];
mainFrame.appendChild(drivers);`;
    } else if (tabId === 'decisoes') {
      sectionCode = `const title = figma.createText();
title.fontName = { family: "Inter", style: "Bold" };
title.fontSize = 28;
title.characters = "7. DECISÕES DE GOVERNANÇA DE DESIGN";
title.fills = [{ type: "SOLID", color: { r: 0.1, g: 0.1, b: 0.1 } }];
mainFrame.appendChild(title);

const tradeoffsTitle = figma.createText();
tradeoffsTitle.fontName = { family: "Inter", style: "SemiBold" };
tradeoffsTitle.fontSize = 18;
tradeoffsTitle.characters = "Trade-offs Identificados";
tradeoffsTitle.fills = [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.2 } }];
mainFrame.appendChild(tradeoffsTitle);

const tradeoffs = figma.createText();
tradeoffs.fontName = { family: "Inter", style: "Regular" };
tradeoffs.fontSize = 16;
tradeoffs.characters = "${getTradeoffs(scopeData, riskAssessment).replace(/"/g, '\\"').replace(/\n/g, '\\n')}";
tradeoffs.fills = [{ type: "SOLID", color: { r: 0.3, g: 0.3, b: 0.3 } }];
mainFrame.appendChild(tradeoffs);

const constraintsTitle = figma.createText();
constraintsTitle.fontName = { family: "Inter", style: "SemiBold" };
constraintsTitle.fontSize = 18;
constraintsTitle.characters = "Restrições Conhecidas";
constraintsTitle.fills = [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.2 } }];
mainFrame.appendChild(constraintsTitle);

const constraints = figma.createText();
constraints.fontName = { family: "Inter", style: "Regular" };
constraints.fontSize = 16;
constraints.characters = "${getConstraints(scopeData).replace(/"/g, '\\"').replace(/\n/g, '\\n')}";
constraints.fills = [{ type: "SOLID", color: { r: 0.3, g: 0.3, b: 0.3 } }];
mainFrame.appendChild(constraints);`;
    } else if (tabId.startsWith('session-')) {
      const sessionId = tabId.replace('session-', '').replace('na-', '');
      const session = sessions.find((s) => s.id === sessionId);
      
      if (session) {
        if (session.status === 'not-applicable') {
          sectionCode = `const title = figma.createText();
title.fontName = { family: "Inter", style: "Bold" };
title.fontSize = 28;
title.characters = "${session.name.replace(/"/g, '\\"')}";
title.fills = [{ type: "SOLID", color: { r: 0.1, g: 0.1, b: 0.1 } }];
mainFrame.appendChild(title);

const status = figma.createText();
status.fontName = { family: "Inter", style: "SemiBold" };
status.fontSize = 16;
status.characters = "Status: NÃO APLICÁVEL";
status.fills = [{ type: "SOLID", color: { r: 0.6, g: 0.6, b: 0.6 } }];
mainFrame.appendChild(status);

const reasonTitle = figma.createText();
reasonTitle.fontName = { family: "Inter", style: "Bold" };
reasonTitle.fontSize = 18;
reasonTitle.characters = "Razão";
reasonTitle.fills = [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.2 } }];
mainFrame.appendChild(reasonTitle);

const reason = figma.createText();
reason.fontName = { family: "Inter", style: "Regular" };
reason.fontSize = 14;
reason.characters = "${session.reason.replace(/"/g, '\\"').replace(/\n/g, '\\n')}";
reason.fills = [{ type: "SOLID", color: { r: 0.3, g: 0.3, b: 0.3 } }];
mainFrame.appendChild(reason);`;
        } else {
          const def = getSessionDefinition(session.id, scopeData, riskAssessment);
          sectionCode = `const title = figma.createText();
title.fontName = { family: "Inter", style: "Bold" };
title.fontSize = 28;
title.characters = "${def.name.replace(/"/g, '\\"')}";
title.fills = [{ type: "SOLID", color: { r: 0.1, g: 0.1, b: 0.1 } }];
mainFrame.appendChild(title);

const status = figma.createText();
status.fontName = { family: "Inter", style: "SemiBold" };
status.fontSize = 16;
status.characters = "Status: ${getStatusLabel(session.status)}";
status.fills = [{ type: "SOLID", color: { r: 0.3, g: 0.3, b: 0.3 } }];
mainFrame.appendChild(status);

const purposeTitle = figma.createText();
purposeTitle.fontName = { family: "Inter", style: "Bold" };
purposeTitle.fontSize = 18;
purposeTitle.characters = "Propósito";
purposeTitle.fills = [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.2 } }];
mainFrame.appendChild(purposeTitle);

const purpose = figma.createText();
purpose.fontName = { family: "Inter", style: "Regular" };
purpose.fontSize = 14;
purpose.characters = "${def.purpose.replace(/"/g, '\\"').replace(/\n/g, '\\n')}";
purpose.fills = [{ type: "SOLID", color: { r: 0.3, g: 0.3, b: 0.3 } }];
mainFrame.appendChild(purpose);

const whatToDesignTitle = figma.createText();
whatToDesignTitle.fontName = { family: "Inter", style: "Bold" };
whatToDesignTitle.fontSize = 18;
whatToDesignTitle.characters = "O que Desenhar";
whatToDesignTitle.fills = [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.2 } }];
mainFrame.appendChild(whatToDesignTitle);

const whatToDesign = figma.createText();
whatToDesign.fontName = { family: "Inter", style: "Regular" };
whatToDesign.fontSize = 14;
whatToDesign.characters = "${def.whatToDesign.map((item, i) => `${i + 1}. ${item.replace(/"/g, '\\"')}`).join('\\n')}";
whatToDesign.fills = [{ type: "SOLID", color: { r: 0.3, g: 0.3, b: 0.3 } }];
mainFrame.appendChild(whatToDesign);

const checklistTitle = figma.createText();
checklistTitle.fontName = { family: "Inter", style: "Bold" };
checklistTitle.fontSize = 18;
checklistTitle.characters = "Checklist de Verificação";
checklistTitle.fills = [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.2 } }];
mainFrame.appendChild(checklistTitle);

const checklist = figma.createText();
checklist.fontName = { family: "Inter", style: "Regular" };
checklist.fontSize = 14;
checklist.characters = "${def.checklist.map((item) => `☐ ${item.replace(/"/g, '\\"')}`).join('\\n')}";
checklist.fills = [{ type: "SOLID", color: { r: 0.3, g: 0.3, b: 0.3 } }];
mainFrame.appendChild(checklist);

const notesTitle = figma.createText();
notesTitle.fontName = { family: "Inter", style: "Bold" };
notesTitle.fontSize = 18;
notesTitle.characters = "Notas / Limites";
notesTitle.fills = [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.2 } }];
mainFrame.appendChild(notesTitle);

const notes = figma.createText();
notes.fontName = { family: "Inter", style: "Regular" };
notes.fontSize = 14;
notes.characters = "${def.notes.replace(/"/g, '\\"').replace(/\n/g, '\\n')}";
notes.fills = [{ type: "SOLID", color: { r: 0.3, g: 0.3, b: 0.3 } }];
mainFrame.appendChild(notes);`;
        }
      }
    }

    return baseCode + sectionCode + `\n\nfigma.currentPage.appendChild(mainFrame);\nfigma.viewport.scrollAndZoomIntoView([mainFrame]);`;
  };

  const handleCopy = () => {
    const doc = generateSectionMarkdown(activeTab);
    copyToClipboard(doc).then(() => {
      setCopiedStates((prev) => ({ ...prev, [activeTab]: true }));
      setTimeout(() => setCopiedStates((prev) => ({ ...prev, [activeTab]: false })), 2000);
    }).catch((error) => {
      console.error('Failed to copy to clipboard:', error);
    });
  };

  const handleCopyFigma = () => {
    const code = generateSectionFigma(activeTab);
    copyToClipboard(code).then(() => {
      setCopiedFigmaStates((prev) => ({ ...prev, [activeTab]: true }));
      setTimeout(() => setCopiedFigmaStates((prev) => ({ ...prev, [activeTab]: false })), 2000);
    }).catch((error) => {
      console.error('Failed to copy to clipboard:', error);
    });
  };

  const handleCopyImage = () => {
    if (contentRef.current) {
      html2canvas(contentRef.current).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = imgData;
        link.download = `${getTabLabel(activeTab)}.png`;
        link.click();
      });
    }
  };

  const requiredSessions = sessions.filter((s) => s.status === 'required');

  // Check if current tab is a header (non-clickable)
  const isHeaderTab = activeTab === 'sessoes-detalhes-header' || activeTab === 'sessoes-na-header';

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-2">
          Documentação Final
        </h2>
        <p className="text-sm text-slate-600">
          Navegue pelas seções e exporte individualmente cada parte da documentação.
        </p>
      </div>

      {/* Success Banner */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <CheckCircle2 className="w-6 h-6 text-green-600 mt-1" />
          <div>
            <h3 className="font-semibold text-green-900 mb-1">
              Análise Completa
            </h3>
            <p className="text-sm text-green-800">
              O projeto foi classificado como <strong>{riskAssessment.riskLabel.toUpperCase()}</strong> risco
              e requer <strong>{requiredSessions.length} sessões obrigatórias</strong> de design.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs and Content Layout */}
      <div className="flex gap-6">
        {/* Vertical Tabs - Left Side */}
        <div className="w-72 flex-shrink-0">
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="flex flex-col max-h-[700px] overflow-y-auto">
              {tabs.map((tab) => {
                const isHeader = tab.type === 'static' && (tab.id === 'sessoes-detalhes-header' || tab.id === 'sessoes-na-header');
                const isSessionDetail = tab.type === 'session-detail';
                const isSessionNA = tab.type === 'session-na';
                const isActive = activeTab === tab.id;

                if (isHeader) {
                  return (
                    <div
                      key={tab.id}
                      className="px-4 py-2 text-xs font-semibold text-slate-500 bg-slate-50 uppercase tracking-wide"
                    >
                      {tab.label}
                    </div>
                  );
                }

                if (isSessionDetail || isSessionNA) {
                  const session = tab.type === 'session-detail' || tab.type === 'session-na' ? tab.session : null;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-3 pl-8 text-sm font-medium text-left border-l-4 transition-colors ${
                        isActive
                          ? isSessionDetail
                            ? 'border-green-600 text-green-600 bg-green-50'
                            : 'border-orange-600 text-orange-600 bg-orange-50'
                          : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      {session?.name || ''}
                    </button>
                  );
                }

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 text-sm font-medium text-left border-l-4 transition-colors ${
                      isActive
                        ? 'border-blue-600 text-blue-600 bg-blue-50'
                        : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content Area - Right Side */}
        <div className="flex-1 min-w-0">
          {isHeaderTab ? (
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <p className="text-slate-500 text-center">
                Selecione uma sessão na lista à esquerda para visualizar os detalhes.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <div className="p-6">
                {/* Actions */}
                <div className="flex gap-3 mb-6">
                  <Button onClick={handleCopy} className="gap-2 flex-1" variant="outline">
                    {copiedStates[activeTab] ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Markdown
                      </>
                    )}
                  </Button>
                  <Button onClick={handleCopyFigma} className="gap-2 flex-1" variant="outline">
                    {copiedFigmaStates[activeTab] ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Figma
                      </>
                    )}
                  </Button>
                  <Button onClick={handleCopyImage} className="gap-2 flex-1" variant="outline">
                    <Image className="w-4 h-4" />
                    Imagem
                  </Button>
                </div>

                {/* Preview */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
                    <FileText className="w-4 h-4 text-slate-600" />
                    <span className="text-sm font-medium text-slate-700">
                      {getTabLabel(activeTab)}.md
                    </span>
                  </div>
                  <div className="p-6 overflow-auto max-h-[600px]" ref={contentRef}>
                    <div className="markdown-preview">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({node, ...props}) => <h1 className="text-3xl font-semibold mb-6 mt-0 pb-3 border-b border-slate-200 text-slate-900" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-2xl font-semibold mb-4 mt-8 text-slate-900" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-xl font-semibold mb-3 mt-6 text-slate-800" {...props} />,
                          h4: ({node, ...props}) => <h4 className="text-lg font-semibold mb-2 mt-4 text-slate-700" {...props} />,
                          p: ({node, ...props}) => <p className="text-base leading-7 mb-4 text-slate-700" {...props} />,
                          ul: ({node, ...props}) => <ul className="my-4 space-y-2 list-disc pl-6" {...props} />,
                          ol: ({node, ...props}) => <ol className="my-4 space-y-2 list-decimal pl-6" {...props} />,
                          li: ({node, ...props}) => <li className="text-slate-700 leading-7" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-semibold text-slate-900" {...props} />,
                          em: ({node, ...props}) => <em className="italic text-slate-600" {...props} />,
                          hr: ({node, ...props}) => <hr className="my-8 border-slate-200" {...props} />,
                          table: ({node, ...props}) => (
                            <div className="my-6 overflow-x-auto">
                              <table className="min-w-full divide-y divide-slate-200 border border-slate-200" {...props} />
                            </div>
                          ),
                          thead: ({node, ...props}) => <thead className="bg-slate-50" {...props} />,
                          th: ({node, ...props}) => <th className="px-4 py-3 text-left font-semibold text-slate-900 border-b border-slate-200" {...props} />,
                          td: ({node, ...props}) => <td className="px-4 py-3 text-slate-700 border-b border-slate-200" {...props} />,
                          code: ({node, inline, ...props}: any) => 
                            inline 
                              ? <code className="text-sm bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono" {...props} />
                              : <code className="block text-sm bg-slate-100 p-4 rounded text-slate-800 font-mono overflow-x-auto" {...props} />,
                          blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-500 bg-blue-50 py-2 px-4 my-4 text-slate-700" {...props} />,
                          input: ({node, ...props}) => {
                            if (props.type === 'checkbox') {
                              return <input type="checkbox" className="mr-2 h-4 w-4 rounded border-slate-300" disabled {...props} />;
                            }
                            return <input {...props} />;
                          },
                        }}
                      >
                        {generateSectionMarkdown(activeTab)}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getTabLabel(tabId: string): string {
  if (tabId.startsWith('session-')) {
    const sessionId = tabId.replace('session-', '').replace('na-', '');
    return `sessao-${sessionId}`;
  }

  const labels: Record<string, string> = {
    'resumo': 'resumo-executivo',
    'scope': 'design-scope-card',
    'risco': 'analise-de-risco',
    'decisoes': 'decisoes-governanca',
  };
  return labels[tabId] || tabId;
}

function getDeliveryTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'new-product': 'Novo produto / novo módulo',
    'functional-evolution': 'Evolução funcional',
    'visual-ux-adjustment': 'Ajuste visual / UX',
    'technical-bugfix': 'Correção técnica / bugfix',
    'technical-refactoring': 'Refatoração técnica',
    'third-party-integration': 'Integração com terceiros',
    'discontinuation': 'Descontinuação / remoção',
  };
  return labels[type] || type;
}

function getDataTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    none: 'Nenhum dado',
    'non-personal': 'Dados não pessoais',
    'personal-common': 'Dados pessoais comuns',
    'personal-sensitive': 'Dados pessoais sensíveis',
    financial: 'Dados financeiros',
    children: 'Dados de crianças/adolescentes',
  };
  return labels[type] || type;
}

function getAccessModelLabel(model: string): string {
  const labels: Record<string, string> = {
    public: 'Público',
    authenticated: 'Autenticado',
    'authenticated-permissions': 'Autenticado com níveis de permissão',
    administrative: 'Acesso administrativo',
    'third-party': 'Acesso de terceiros',
    'api-automation': 'Acesso via API / automação',
  };
  return labels[model] || model;
}

function getUserCapabilityLabel(capability: string): string {
  const labels: Record<string, string> = {
    'end-user': 'Usuário final comum',
    'advanced-user': 'Usuário avançado',
    'internal-operator': 'Operador interno',
    administrator: 'Administrador',
    'automated-system': 'Sistema automatizado / serviço',
  };
  return labels[capability] || capability;
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    required: 'OBRIGATÓRIA',
    optional: 'OPCIONAL',
    'not-applicable': 'NÃO APLICÁVEL',
  };
  return labels[status] || status;
}

function getTradeoffs(
  scopeData: DesignScopeData,
  riskAssessment: RiskAssessment
): string {
  const tradeoffs: string[] = [];

  const isVisualOnly = ['new-visual', 'redesign', 'improvement'].includes(scopeData.deliveryType);
  if (riskAssessment.riskLabel === 'low' && isVisualOnly) {
    tradeoffs.push('- Processo simplificado devido ao baixo risco e natureza visual');
  }

  if (riskAssessment.riskLabel === 'high') {
    tradeoffs.push(
      '- Processo completo necessário, aumenta tempo mas reduz riscos significativamente'
    );
  }

  if (scopeData.hasShareCapability && scopeData.dataInvolved !== 'none') {
    tradeoffs.push(
      '- Compartilhamento vs. privacidade: requer controles granulares de acesso'
    );
  }

  if (scopeData.deliveryType === 'bugfix') {
    tradeoffs.push(
      '- Correção focada permite entrega rápida, mas requer validação de impacto antes de produção'
    );
  }

  return tradeoffs.length > 0
    ? tradeoffs.join('\n')
    : '- Nenhum trade-off significativo identificado';
}

function getConstraints(scopeData: DesignScopeData): string {
  const constraints: string[] = [];

  if (scopeData.dataInvolved === 'personal-sensitive') {
    constraints.push('- LGPD/GDPR: Dados sensíveis exigem conformidade legal rigorosa');
  }

  if (scopeData.dataInvolved === 'financial') {
    constraints.push('- PCI-DSS: Dados financeiros exigem conformidade com padrões de segurança');
    constraints.push('- LGPD/GDPR: Dados financeiros são considerados sensíveis');
  }

  if (scopeData.dataInvolved === 'children') {
    constraints.push('- LGPD/GDPR: Dados de menores exigem verificação de idade e consentimento parental');
    constraints.push('- ECA (Brasil): Estatuto da Criança e Adolescente - proteções adicionais');
  }

  if (scopeData.hasFinancial) {
    constraints.push('- PCI-DSS: Transações financeiras requerem padrões de segurança');
  }

  if (scopeData.accessModel === 'public') {
    constraints.push('- Segurança: Acesso público aumenta significativamente superfície de ataque');
  }

  if (scopeData.accessModel === 'third-party') {
    constraints.push('- Segurança: Acesso de terceiros requer autenticação forte, OAuth 2.0, e auditoria completa');
  }

  if (scopeData.accessModel === 'api-automation') {
    constraints.push('- Segurança: APIs requerem rate limiting, validação de entrada, e autenticação via tokens');
  }

  if (scopeData.accessModel === 'authenticated-permissions') {
    constraints.push('- Complexidade: Sistema de permissões granular requer testes extensivos de autorização');
  }

  if (scopeData.accessModel === 'administrative') {
    constraints.push('- Segurança: Acesso administrativo requer MFA obrigatório, logging completo e sessões curtas');
  }

  return constraints.length > 0
    ? constraints.join('\n')
    : '- Nenhuma restrição crítica identificada';
}