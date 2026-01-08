import { useEffect } from 'react';
import { DesignScopeData, RiskAssessment } from '../App';
import { CheckCircle2, Circle, Info, FileText } from 'lucide-react';
import { calculateApplicableSessions, SessionDefinition } from '../services/sessionService';

interface Props {
  scopeData: DesignScopeData;
  riskAssessment: RiskAssessment;
}

export function NewSessionMatrixStep({ scopeData, riskAssessment }: Props) {
  const sessions = calculateApplicableSessions(scopeData, riskAssessment);
  
  const requiredSessions = sessions.filter(s => s.isRequired);
  const optionalSessions = sessions.filter(s => s.isOptional);

  const getComplianceBadges = (
    iso9001?: string[],
    iso27001Clauses?: string[],
    iso27001AnnexA?: string[],
    iso27701?: string[]
  ) => {
    const badges: JSX.Element[] = [];
    
    if (scopeData.complianceISO9001 && iso9001 && iso9001.length > 0) {
      badges.push(
        <span 
          key="iso9001" 
          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
          title={`ISO 9001:2015 - Cláusulas: ${iso9001.join(', ')}`}
        >
          ISO 9001
        </span>
      );
    }
    
    if (scopeData.complianceISO27001 && ((iso27001Clauses && iso27001Clauses.length > 0) || (iso27001AnnexA && iso27001AnnexA.length > 0))) {
      const clauses = [...(iso27001Clauses || []), ...(iso27001AnnexA || [])].join(', ');
      badges.push(
        <span 
          key="iso27001" 
          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"
          title={`ISO/IEC 27001:2022 - Cláusulas: ${clauses}`}
        >
          ISO 27001
        </span>
      );
    }
    
    if (scopeData.complianceISO27701 && iso27701 && iso27701.length > 0) {
      badges.push(
        <span 
          key="iso27701" 
          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800"
          title={`ISO/IEC 27701:2019 - Cláusulas: ${iso27701.join(', ')}`}
        >
          ISO 27701
        </span>
      );
    }
    
    return badges;
  };

  const renderSession = (session: SessionDefinition, index: number) => (
    <div key={session.id} className="bg-white border border-slate-200 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="flex-shrink-0 mt-0.5">
          {session.isRequired ? (
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          ) : (
            <Circle className="w-6 h-6 text-slate-400" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-slate-900">
              {String(index + 1).padStart(2, '0')}. {session.title}
            </h3>
            {session.isRequired ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                Obrigatória
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                Opcional
              </span>
            )}
          </div>
          <p className="text-sm text-slate-600 mb-2">{session.focus}</p>
          {session.reason && (
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded p-2 text-sm text-blue-800">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{session.reason}</span>
            </div>
          )}
        </div>
      </div>

      {/* Work Items */}
      <div className="ml-9">
        <h4 className="text-sm font-medium text-slate-700 mb-2">Itens de Trabalho:</h4>
        <ul className="space-y-3">
          {session.workItems.map((item, itemIndex) => (
            <li key={itemIndex} className="flex items-start gap-3 text-sm">
              <span className="text-slate-400 select-none">•</span>
              <div className="flex-1">
                <div className="flex items-start gap-3">
                  {/* Documentos à esquerda */}
                  {item.documentTypes && item.documentTypes.length > 0 && (
                    <div className="flex-shrink-0 w-48">
                      <div className="text-xs text-slate-500 space-y-1">
                        {item.documentTypes.map((doc, docIndex) => (
                          <div key={docIndex} className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            <span>{doc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Item de trabalho e badges no centro/direita */}
                  <div className="flex-1 flex items-center gap-2 flex-wrap">
                    <span className="text-slate-700">{item.text}</span>
                    {(item.iso9001 || item.iso27001Clauses || item.iso27001AnnexA || item.iso27701) && (
                      <div className="flex flex-wrap gap-1">
                        {getComplianceBadges(item.iso9001, item.iso27001Clauses, item.iso27001AnnexA, item.iso27701)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-green-900 mb-1">
              Matriz de Sessões Calculada
            </h3>
            <p className="text-sm text-green-800">
              O projeto foi classificado como <strong>{riskAssessment.riskLabel.toUpperCase()}</strong> risco
              e requer <strong>{requiredSessions.length} sessões obrigatórias</strong> de design.
              {optionalSessions.length > 0 && (
                <> Há <strong>{optionalSessions.length} sessões opcionais</strong> recomendadas.</>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Required Sessions */}
      {requiredSessions.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Sessões Obrigatórias ({requiredSessions.length})
          </h2>
          <div className="space-y-4">
            {requiredSessions.map((session, index) => renderSession(session, index))}
          </div>
        </div>
      )}

      {/* Optional Sessions */}
      {optionalSessions.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Sessões Opcionais ({optionalSessions.length})
          </h2>
          <div className="space-y-4">
            {optionalSessions.map((session, index) => renderSession(session, requiredSessions.length + index))}
          </div>
        </div>
      )}

      {/* Compliance Legend */}
      {(scopeData.complianceISO9001 || scopeData.complianceISO27001 || scopeData.complianceISO27701) && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-slate-900 mb-2">Normas de Conformidade Selecionadas:</h4>
          <div className="flex flex-wrap gap-2">
            {scopeData.complianceISO9001 && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                ISO 9001:2015 - Gestão da Qualidade
              </span>
            )}
            {scopeData.complianceISO27001 && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                ISO/IEC 27001:2022 - Segurança da Informação
              </span>
            )}
            {scopeData.complianceISO27701 && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                ISO/IEC 27701:2019 - Gestão de Privacidade
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 mt-2">
            Os badges ISO nos itens de trabalho indicam quais cláusulas são tipicamente atendidas quando o item é entregue.
            Isso não garante certificação, mas ajuda a mapear conformidade.
          </p>
        </div>
      )}
    </div>
  );
}