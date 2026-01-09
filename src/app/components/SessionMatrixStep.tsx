import { useEffect, useMemo, useState } from 'react';
import * as React from 'react';
import { CheckCircle2, Circle, Info, Loader2, ShieldAlert } from 'lucide-react';
import { DesignScopeData, RiskAssessment, SessionStatus } from '../App';
import { calculateApplicableSessions, SessionDefinition } from '../services/sessionService';
import { Badge } from '../components/ui/badge';

interface Props {
  scopeData: DesignScopeData;
  riskAssessment: RiskAssessment;
  sessions: SessionStatus[];
  setSessions: (sessions: SessionStatus[]) => void;
}

const statusLabel = {
  required: 'Obrigatória',
  optional: 'Opcional',
  'not-applicable': 'Não aplicável',
};

function getComplianceBadges(
  scopeData: DesignScopeData,
  iso9001?: string[],
  iso27001Clauses?: string[],
  iso27001AnnexA?: string[],
  iso27701?: string[]
) {
  const badges: React.ReactNode[] = [];

  if (scopeData.complianceISO9001 && iso9001?.length) {
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

  if (scopeData.complianceISO27001 && ((iso27001Clauses?.length || 0) + (iso27001AnnexA?.length || 0) > 0)) {
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

  if (scopeData.complianceISO27701 && iso27701?.length) {
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
}

export function SessionMatrixStep({ scopeData, riskAssessment, sessions: _sessions, setSessions }: Props) {
  const [sessionDefinitions, setSessionDefinitions] = useState<SessionDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    try {
      const calculated = calculateApplicableSessions(scopeData, riskAssessment);
      setSessionDefinitions(calculated);
      setSessions(
        calculated.map((session) => ({
          id: session.id,
          name: session.title,
          status: session.status,
          reason: session.reason || '',
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao calcular sessões');
    } finally {
      setLoading(false);
    }
  }, [riskAssessment, scopeData, setSessions]);

  const requiredSessions = useMemo(() => sessionDefinitions.filter((s) => s.status === 'required'), [sessionDefinitions]);
  const optionalSessions = useMemo(() => sessionDefinitions.filter((s) => s.status === 'optional'), [sessionDefinitions]);

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-slate-600">
        <Loader2 className="w-5 h-5 animate-spin" />
        Calculando sessões aplicáveis...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 p-4 border border-red-200 rounded-lg bg-red-50 text-red-700">
        <ShieldAlert className="w-5 h-5 mt-0.5" />
        <div>
          <p className="font-medium">Erro ao carregar matriz</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const renderSession = (session: SessionDefinition, index: number) => (
    <div key={session.id} className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {session.status === 'required' ? (
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          ) : (
            <Circle className="w-6 h-6 text-slate-400" />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-900">
              {String(index + 1).padStart(2, '0')}. {session.title}
            </h3>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                session.status === 'required'
                  ? 'bg-green-100 text-green-800'
                  : session.status === 'optional'
                  ? 'bg-slate-100 text-slate-700'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {statusLabel[session.status]}
            </span>
            {session.source === 'override' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                Override manual
              </span>
            )}
          </div>
          <p className="text-sm text-slate-600">{session.focus}</p>
          {session.reason && (
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded p-2 text-sm text-blue-800">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{session.reason}</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3 ml-9">
        <h4 className="text-sm font-medium text-slate-700">Itens de Trabalho</h4>
        <ul className="space-y-3">
          {session.workItems.map((item, itemIndex) => (
            <li key={`${session.id}-${itemIndex}`} className="flex items-stretch gap-3 text-sm border-b border-slate-200 last:border-b-0 py-2">
              {/* Badge left-aligned, vertically centered */}
              <div className="flex flex-col justify-center min-w-[70px] items-start pr-2">
                {item.documentTypes?.length ? (
                  item.documentTypes.map((doc, idx) => (
                    <Badge key={idx} variant="secondary" className="mb-1">
                      {doc}
                    </Badge>
                  ))
                ) : null}
              </div>
              <div className="flex-1 flex items-center gap-2 flex-wrap">
                <span className="text-slate-700">{item.text}</span>
                {(item.iso9001 || item.iso27001Clauses || item.iso27001AnnexA || item.iso27701) && (
                  <div className="flex flex-wrap gap-1">
                    {getComplianceBadges(scopeData, item.iso9001, item.iso27001Clauses, item.iso27001AnnexA, item.iso27701)}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {session.source === 'override' && (
        <div className="border-t border-slate-200 pt-4 ml-9">
          <div className="bg-indigo-50 border border-indigo-200 rounded p-2 text-xs text-indigo-800">
            Esta sessão foi ajustada manualmente (override).
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-green-900 mb-1">Matriz de Sessões Calculada</h3>
            <p className="text-sm text-green-800">
              Projeto classificado como <strong>{riskAssessment.riskLabel.toUpperCase()}</strong> risco.{' '}
              <strong>{requiredSessions.length} sessões obrigatórias</strong>
              {optionalSessions.length > 0 && (
                <> e <strong>{optionalSessions.length} sessões opcionais</strong> recomendadas.</>
              )}
            </p>
          </div>
        </div>
      </div>

      {requiredSessions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Sessões Obrigatórias ({requiredSessions.length})</h2>
          {requiredSessions.map((session, index) => renderSession(session, index))}
        </div>
      )}

      {optionalSessions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Sessões Opcionais ({optionalSessions.length})</h2>
          {optionalSessions.map((session, index) => renderSession(session, requiredSessions.length + index))}
        </div>
      )}

      {(scopeData.complianceISO9001 || scopeData.complianceISO27001 || scopeData.complianceISO27701) && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-slate-900 mb-2">Normas de Conformidade Selecionadas</h4>
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
            Badges nos itens indicam cláusulas cobertas quando o item é entregue. Não substitui auditoria formal.
          </p>
        </div>
      )}
    </div>
  );
}
