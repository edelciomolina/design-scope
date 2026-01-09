import { useEffect, useMemo, useState } from 'react';
import * as React from 'react';
import { CheckCircle2, Circle, Info, Loader2, ShieldAlert } from 'lucide-react';
import { DesignScopeData, RiskAssessment, SessionStatus } from '../App';
import { calculateApplicableSessions, ComplianceLevel, SessionDefinition } from '../services/sessionService';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { Checkbox } from '../components/ui/checkbox';

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

interface IsoClauseItem {
  sessionId: string;
  sessionTitle: string;
  workItemText: string;
  documentTypes?: string[];
  complianceLevel?: ComplianceLevel;
}

interface IsoClauseGroup {
  code: string;
  requiredItems: IsoClauseItem[];
  optionalItems: IsoClauseItem[];
}

export function SessionMatrixStep({ scopeData, riskAssessment, sessions: _sessions, setSessions }: Props) {
  const [sessionDefinitions, setSessionDefinitions] = useState<SessionDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'sessions' | 'iso'>('sessions');
  const [onlyRequired, setOnlyRequired] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

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
          decisionDrivers: [
            {
              label:
                session.complianceLevel === 'minimum'
                  ? 'Mínimo necessário'
                  : session.complianceLevel === 'ideal'
                  ? 'Ideal (recomendado)'
                  : 'Excepcional (maturidade avançada)',
              active: true,
            },
          ],
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao calcular sessões');
    } finally {
      setLoading(false);
    }
  }, [riskAssessment, scopeData, setSessions]);

  const requiredSessions = useMemo(() => sessionDefinitions.filter((s) => s.status === 'required'), [sessionDefinitions]);
  const optionalSessions = useMemo(
    () => sessionDefinitions.filter((s) => s.status === 'optional' && s.complianceLevel !== 'exceptional'),
    [sessionDefinitions]
  );
  const exceptionalSessions = useMemo(
    () => sessionDefinitions.filter((s) => s.complianceLevel === 'exceptional' && s.status !== 'not-applicable'),
    [sessionDefinitions]
  );

  const isoGroups = useMemo(
    () => {
      const buildGroups = (
        getCodes: (workItem: SessionDefinition['workItems'][number]) => string[] | undefined,
        enabled: boolean
      ): IsoClauseGroup[] => {
        if (!enabled) return [];

        const map = new Map<string, IsoClauseGroup>();

        sessionDefinitions.forEach((session) => {
          if (session.status === 'not-applicable') return;

          session.workItems.forEach((item) => {
            const codes = getCodes(item) || [];
            codes.forEach((code) => {
              if (!code) return;

              let group = map.get(code);
              if (!group) {
                group = {
                  code,
                  requiredItems: [],
                  optionalItems: [],
                };
                map.set(code, group);
              }

              const target = session.status === 'required' ? group.requiredItems : group.optionalItems;
              target.push({
                sessionId: session.id,
                sessionTitle: session.title,
                workItemText: item.text,
                documentTypes: item.documentTypes,
                complianceLevel: session.complianceLevel,
              });
            });
          });
        });

        return Array.from(map.values()).sort((a, b) =>
          a.code.localeCompare(b.code, 'pt-BR', { numeric: true })
        );
      };

      return {
        iso9001: buildGroups((item) => item.iso9001, scopeData.complianceISO9001),
        iso27001Clauses: buildGroups((item) => item.iso27001Clauses, scopeData.complianceISO27001),
        iso27001AnnexA: buildGroups((item) => item.iso27001AnnexA, scopeData.complianceISO27001),
        iso27701: buildGroups((item) => item.iso27701, scopeData.complianceISO27701),
      };
    },
    [sessionDefinitions, scopeData]
  );

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

  const renderComplianceLevelBadge = (level: ComplianceLevel) => {
    if (level === 'minimum') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          Mínimo necessário
        </span>
      );
    }

    if (level === 'ideal') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-sky-50 text-sky-700 border border-sky-200">
          Ideal (recomendado)
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-violet-50 text-violet-700 border border-violet-200">
        Excepcional (maturidade avançada)
      </span>
    );
  };

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
            <div className="ml-2 flex items-center gap-2 text-[11px] text-slate-600">
              {renderComplianceLevelBadge(session.complianceLevel)}
            </div>
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
                      <Badge key={idx} variant="secondary" className="mb-1 min-w-[300px] justify-center text-center">
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

      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'sessions' | 'iso')}>
        <div className="mt-2 flex items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="sessions">Visão por sessão</TabsTrigger>
            <TabsTrigger value="iso">Visão por norma ISO</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-4 text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={onlyRequired}
                onCheckedChange={(checked) => setOnlyRequired(!!checked)}
              />
              <span>Somente se obrigatória</span>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={showAdvanced}
                onCheckedChange={(checked) => setShowAdvanced(!!checked)}
              />
              <span>Mostrar modo avançado (Excepcional)</span>
            </div>
          </div>
        </div>

        <TabsContent value="sessions" className="mt-4 space-y-6">
          {requiredSessions.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">Sessões Obrigatórias ({requiredSessions.length})</h2>
              {requiredSessions.map((session, index) => renderSession(session, index))}
            </div>
          )}

          {optionalSessions.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">Sessões Opcionais ({optionalSessions.length})</h2>
              <Accordion type="single" collapsible className="border border-dashed border-slate-200 rounded-lg bg-slate-50">
                <AccordionItem value="optional-sessions">
                  <AccordionTrigger className="px-4 py-2 text-sm font-medium text-slate-700">
                    Ver sessões opcionais recomendadas
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-0 space-y-4">
                    {optionalSessions.map((session, index) =>
                      renderSession(session, requiredSessions.length + index)
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}

          {showAdvanced && exceptionalSessions.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">Sessões Excepcionais (maturidade avançada)</h2>
              <p className="text-xs text-slate-600 max-w-2xl">
                Uso recomendado apenas para cenários de maior risco ou quando a equipe deseja elevar o nível de maturidade.
                Não são exigidas para certificação, mas reduzem fricção em auditorias e incidentes.
              </p>
              {exceptionalSessions.map((session, index) =>
                renderSession(session, requiredSessions.length + optionalSessions.length + index)
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="iso" className="mt-4 space-y-6">
          {(() => {
            const iso9001 = onlyRequired
              ? isoGroups.iso9001.filter((g) => g.requiredItems.length > 0)
              : isoGroups.iso9001;
            const iso27001Clauses = onlyRequired
              ? isoGroups.iso27001Clauses.filter((g) => g.requiredItems.length > 0)
              : isoGroups.iso27001Clauses;
            const iso27001AnnexA = onlyRequired
              ? isoGroups.iso27001AnnexA.filter((g) => g.requiredItems.length > 0)
              : isoGroups.iso27001AnnexA;
            const iso27701 = onlyRequired
              ? isoGroups.iso27701.filter((g) => g.requiredItems.length > 0)
              : isoGroups.iso27701;

            if (
              iso9001.length === 0 &&
              iso27001Clauses.length === 0 &&
              iso27001AnnexA.length === 0 &&
              iso27701.length === 0
            ) {
              return (
                <div className="text-sm text-slate-600">
                  Nenhum mapeamento de cláusulas ISO para este escopo. Ajuste o escopo, as normas de conformidade ou desmarque o filtro "Somente se obrigatória" para ver cláusulas apenas opcionais.
                </div>
              );
            }

            return (
              <>
              {iso9001.length > 0 && (
                <section className="space-y-3">
                  <h2 className="text-lg font-semibold text-slate-900">ISO 9001:2015 - Gestão da Qualidade</h2>
                  {iso9001.map((group) => (
                    <div
                      key={`iso9001-${group.code}`}
                      className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-900">Cláusula {group.code}</span>
                        <span className="text-xs text-slate-500">
                          {group.requiredItems.length} obrigatória(s) · {
                            (showAdvanced
                              ? group.optionalItems
                              : group.optionalItems.filter(
                                  (item) => item.complianceLevel !== 'exceptional'
                                )
                            ).length
                          } opcional(is)
                        </span>
                      </div>

                      {group.requiredItems.length > 0 && (
                        <div className="space-y-2">
                          <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
                            <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)_minmax(0,1fr)] gap-3 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 bg-slate-100">
                              <span>Sessão</span>
                              <span>Item de trabalho</span>
                              <span>Artefatos / documentos</span>
                            </div>
                            <ul className="divide-y divide-slate-200">
                              {group.requiredItems.map((item, index) => (
                                <li
                                  key={`iso9001-${group.code}-req-${index}`}
                                  className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)_minmax(0,1fr)] gap-3 px-3 py-2 text-sm text-slate-700"
                                >
                                  <div className="flex flex-col gap-1">
                                    <span className="font-medium">{item.sessionTitle}</span>
                                  </div>
                                  <div className="flex items-start text-sm text-slate-700">
                                    {item.workItemText}
                                  </div>
                                  <div className="flex flex-wrap items-start gap-1 text-xs text-slate-600">
                                    {item.documentTypes?.length
                                      ? item.documentTypes.map((doc, idx) => (
                                          <Badge key={idx} variant="secondary" className="text-[11px]">
                                            {doc}
                                          </Badge>
                                        ))
                                      : <span className="text-[11px] text-slate-400">Nenhum artefato específico definido</span>}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {(showAdvanced
                        ? group.optionalItems
                        : group.optionalItems.filter((item) => item.complianceLevel !== 'exceptional')
                      ).length > 0 && (
                        <Accordion type="single" collapsible className="border border-dashed border-slate-200 rounded-md bg-white">
                          <AccordionItem value={`iso9001-${group.code}-opt`} className="border-b-0">
                            <AccordionTrigger className="px-3 py-2 text-xs font-medium text-slate-700">
                              Itens opcionais recomendados ({
                                (showAdvanced
                                  ? group.optionalItems
                                  : group.optionalItems.filter(
                                      (item) => item.complianceLevel !== 'exceptional'
                                    )
                                ).length
                              })
                            </AccordionTrigger>
                            <AccordionContent className="pt-0">
                              <div className="border-t border-slate-200">
                                <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)_minmax(0,1fr)] gap-3 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 bg-slate-100">
                                  <span>Sessão</span>
                                  <span>Item de trabalho</span>
                                  <span>Artefatos / documentos</span>
                                </div>
                                <ul className="divide-y divide-slate-200">
                                  {(showAdvanced
                                    ? group.optionalItems
                                    : group.optionalItems.filter(
                                        (item) => item.complianceLevel !== 'exceptional'
                                      )
                                  ).map((item, index) => (
                                    <li
                                      key={`iso9001-${group.code}-opt-${index}`}
                                      className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)_minmax(0,1fr)] gap-3 px-3 py-2 text-sm text-slate-700"
                                    >
                                      <div className="flex flex-col gap-1">
                                        <span className="font-medium">{item.sessionTitle}</span>
                                      </div>
                                      <div className="flex items-start text-sm text-slate-700">
                                        {item.workItemText}
                                      </div>
                                      <div className="flex flex-wrap items-start gap-1 text-xs text-slate-600">
                                        {item.documentTypes?.length
                                          ? item.documentTypes.map((doc, idx) => (
                                              <Badge key={idx} variant="outline" className="text-[11px]">
                                                {doc}
                                              </Badge>
                                            ))
                                          : <span className="text-[11px] text-slate-400">Nenhum artefato específico definido</span>}
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      )}
                    </div>
                  ))}
                </section>
              )}

              {iso27001Clauses.length > 0 && (
                <section className="space-y-3">
                  <h2 className="text-lg font-semibold text-slate-900">ISO/IEC 27001:2022 - Cláusulas 4-10</h2>
                  {iso27001Clauses.map((group) => (
                    <div
                      key={`iso27001-clause-${group.code}`}
                      className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-900">Cláusula {group.code}</span>
                        <span className="text-xs text-slate-500">
                          {group.requiredItems.length} obrigatória(s) · {
                            (showAdvanced
                              ? group.optionalItems
                              : group.optionalItems.filter(
                                  (item) => item.complianceLevel !== 'exceptional'
                                )
                            ).length
                          } opcional(is)
                        </span>
                      </div>

                      {group.requiredItems.length > 0 && (
                        <div className="space-y-2">
                          <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
                            <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)_minmax(0,1fr)] gap-3 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 bg-slate-100">
                              <span>Sessão</span>
                              <span>Item de trabalho</span>
                              <span>Artefatos / documentos</span>
                            </div>
                            <ul className="divide-y divide-slate-200">
                              {group.requiredItems.map((item, index) => (
                                <li
                                  key={`iso27001-clause-${group.code}-req-${index}`}
                                  className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)_minmax(0,1fr)] gap-3 px-3 py-2 text-sm text-slate-700"
                                >
                                  <div className="flex flex-col gap-1">
                                    <span className="font-medium">{item.sessionTitle}</span>
                                  </div>
                                  <div className="flex items-start text-sm text-slate-700">
                                    {item.workItemText}
                                  </div>
                                  <div className="flex flex-wrap items-start gap-1 text-xs text-slate-600">
                                    {item.documentTypes?.length
                                      ? item.documentTypes.map((doc, idx) => (
                                          <Badge key={idx} variant="secondary" className="text-[11px]">
                                            {doc}
                                          </Badge>
                                        ))
                                      : <span className="text-[11px] text-slate-400">Nenhum artefato específico definido</span>}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {(showAdvanced
                        ? group.optionalItems
                        : group.optionalItems.filter((item) => item.complianceLevel !== 'exceptional')
                      ).length > 0 && (
                        <Accordion type="single" collapsible className="border border-dashed border-slate-200 rounded-md bg-white">
                          <AccordionItem value={`iso27001-clause-${group.code}-opt`} className="border-b-0">
                            <AccordionTrigger className="px-3 py-2 text-xs font-medium text-slate-700">
                              Itens opcionais recomendados ({
                                (showAdvanced
                                  ? group.optionalItems
                                  : group.optionalItems.filter(
                                      (item) => item.complianceLevel !== 'exceptional'
                                    )
                                ).length
                              })
                            </AccordionTrigger>
                            <AccordionContent className="pt-0">
                              <div className="border-t border-slate-200">
                                <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)_minmax(0,1fr)] gap-3 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 bg-slate-100">
                                  <span>Sessão</span>
                                  <span>Item de trabalho</span>
                                  <span>Artefatos / documentos</span>
                                </div>
                                <ul className="divide-y divide-slate-200">
                                  {(showAdvanced
                                    ? group.optionalItems
                                    : group.optionalItems.filter(
                                        (item) => item.complianceLevel !== 'exceptional'
                                      )
                                  ).map((item, index) => (
                                    <li
                                      key={`iso27001-clause-${group.code}-opt-${index}`}
                                      className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)_minmax(0,1fr)] gap-3 px-3 py-2 text-sm text-slate-700"
                                    >
                                      <div className="flex flex-col gap-1">
                                        <span className="font-medium">{item.sessionTitle}</span>
                                      </div>
                                      <div className="flex items-start text-sm text-slate-700">
                                        {item.workItemText}
                                      </div>
                                      <div className="flex flex-wrap items-start gap-1 text-xs text-slate-600">
                                        {item.documentTypes?.length
                                          ? item.documentTypes.map((doc, idx) => (
                                              <Badge key={idx} variant="outline" className="text-[11px]">
                                                {doc}
                                              </Badge>
                                            ))
                                          : <span className="text-[11px] text-slate-400">Nenhum artefato específico definido</span>}
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      )}
                    </div>
                  ))}
                </section>
              )}

              {iso27001AnnexA.length > 0 && (
                <section className="space-y-3">
                  <h2 className="text-lg font-semibold text-slate-900">ISO/IEC 27001:2022 - Anexo A (controles)</h2>
                  {iso27001AnnexA.map((group) => (
                    <div
                      key={`iso27001-annex-${group.code}`}
                      className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-900">Controle {group.code}</span>
                        <span className="text-xs text-slate-500">
                          {group.requiredItems.length} obrigatória(s) · {
                            (showAdvanced
                              ? group.optionalItems
                              : group.optionalItems.filter(
                                  (item) => item.complianceLevel !== 'exceptional'
                                )
                            ).length
                          } opcional(is)
                        </span>
                      </div>

                      {group.requiredItems.length > 0 && (
                        <div className="space-y-2">
                          <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
                            <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)_minmax(0,1fr)] gap-3 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 bg-slate-100">
                              <span>Sessão</span>
                              <span>Item de trabalho</span>
                              <span>Artefatos / documentos</span>
                            </div>
                            <ul className="divide-y divide-slate-200">
                              {group.requiredItems.map((item, index) => (
                                <li
                                  key={`iso27001-annex-${group.code}-req-${index}`}
                                  className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)_minmax(0,1fr)] gap-3 px-3 py-2 text-sm text-slate-700"
                                >
                                  <div className="flex flex-col gap-1">
                                    <span className="font-medium">{item.sessionTitle}</span>
                                  </div>
                                  <div className="flex items-start text-sm text-slate-700">
                                    {item.workItemText}
                                  </div>
                                  <div className="flex flex-wrap items-start gap-1 text-xs text-slate-600">
                                    {item.documentTypes?.length
                                      ? item.documentTypes.map((doc, idx) => (
                                          <Badge key={idx} variant="secondary" className="text-[11px]">
                                            {doc}
                                          </Badge>
                                        ))
                                      : <span className="text-[11px] text-slate-400">Nenhum artefato específico definido</span>}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {(showAdvanced
                        ? group.optionalItems
                        : group.optionalItems.filter((item) => item.complianceLevel !== 'exceptional')
                      ).length > 0 && (
                        <Accordion type="single" collapsible className="border border-dashed border-slate-200 rounded-md bg-white">
                          <AccordionItem value={`iso27001-annex-${group.code}-opt`} className="border-b-0">
                            <AccordionTrigger className="px-3 py-2 text-xs font-medium text-slate-700">
                              Itens opcionais recomendados ({
                                (showAdvanced
                                  ? group.optionalItems
                                  : group.optionalItems.filter(
                                      (item) => item.complianceLevel !== 'exceptional'
                                    )
                                ).length
                              })
                            </AccordionTrigger>
                            <AccordionContent className="pt-0">
                              <div className="border-t border-slate-200">
                                <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)_minmax(0,1fr)] gap-3 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 bg-slate-100">
                                  <span>Sessão</span>
                                  <span>Item de trabalho</span>
                                  <span>Artefatos / documentos</span>
                                </div>
                                <ul className="divide-y divide-slate-200">
                                  {(showAdvanced
                                    ? group.optionalItems
                                    : group.optionalItems.filter(
                                        (item) => item.complianceLevel !== 'exceptional'
                                      )
                                  ).map((item, index) => (
                                    <li
                                      key={`iso27001-annex-${group.code}-opt-${index}`}
                                      className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)_minmax(0,1fr)] gap-3 px-3 py-2 text-sm text-slate-700"
                                    >
                                      <div className="flex flex-col gap-1">
                                        <span className="font-medium">{item.sessionTitle}</span>
                                      </div>
                                      <div className="flex items-start text-sm text-slate-700">
                                        {item.workItemText}
                                      </div>
                                      <div className="flex flex-wrap items-start gap-1 text-xs text-slate-600">
                                        {item.documentTypes?.length
                                          ? item.documentTypes.map((doc, idx) => (
                                              <Badge key={idx} variant="outline" className="text-[11px]">
                                                {doc}
                                              </Badge>
                                            ))
                                          : <span className="text-[11px] text-slate-400">Nenhum artefato específico definido</span>}
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      )}
                    </div>
                  ))}
                </section>
              )}

              {iso27701.length > 0 && (
                <section className="space-y-3">
                  <h2 className="text-lg font-semibold text-slate-900">ISO/IEC 27701:2019 - Gestão de Privacidade</h2>
                  {iso27701.map((group) => (
                    <div
                      key={`iso27701-${group.code}`}
                      className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-900">Cláusula {group.code}</span>
                        <span className="text-xs text-slate-500">
                          {group.requiredItems.length} obrigatória(s) · {
                            (showAdvanced
                              ? group.optionalItems
                              : group.optionalItems.filter(
                                  (item) => item.complianceLevel !== 'exceptional'
                                )
                            ).length
                          } opcional(is)
                        </span>
                      </div>

                      {group.requiredItems.length > 0 && (
                        <div className="space-y-2">
                          <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
                            <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)_minmax(0,1fr)] gap-3 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 bg-slate-100">
                              <span>Sessão</span>
                              <span>Item de trabalho</span>
                              <span>Artefatos / documentos</span>
                            </div>
                            <ul className="divide-y divide-slate-200">
                              {group.requiredItems.map((item, index) => (
                                <li
                                  key={`iso27701-${group.code}-req-${index}`}
                                  className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)_minmax(0,1fr)] gap-3 px-3 py-2 text-sm text-slate-700"
                                >
                                  <div className="flex flex-col gap-1">
                                    <span className="font-medium">{item.sessionTitle}</span>
                                  </div>
                                  <div className="flex items-start text-sm text-slate-700">
                                    {item.workItemText}
                                  </div>
                                  <div className="flex flex-wrap items-start gap-1 text-xs text-slate-600">
                                    {item.documentTypes?.length
                                      ? item.documentTypes.map((doc, idx) => (
                                          <Badge key={idx} variant="secondary" className="text-[11px]">
                                            {doc}
                                          </Badge>
                                        ))
                                      : <span className="text-[11px] text-slate-400">Nenhum artefato específico definido</span>}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {(showAdvanced
                        ? group.optionalItems
                        : group.optionalItems.filter((item) => item.complianceLevel !== 'exceptional')
                      ).length > 0 && (
                        <Accordion type="single" collapsible className="border border-dashed border-slate-200 rounded-md bg-white">
                          <AccordionItem value={`iso27701-${group.code}-opt`} className="border-b-0">
                            <AccordionTrigger className="px-3 py-2 text-xs font-medium text-slate-700">
                              Itens opcionais recomendados ({
                                (showAdvanced
                                  ? group.optionalItems
                                  : group.optionalItems.filter(
                                      (item) => item.complianceLevel !== 'exceptional'
                                    )
                                ).length
                              })
                            </AccordionTrigger>
                            <AccordionContent className="pt-0">
                              <div className="border-t border-slate-200">
                                <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)_minmax(0,1fr)] gap-3 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 bg-slate-100">
                                  <span>Sessão</span>
                                  <span>Item de trabalho</span>
                                  <span>Artefatos / documentos</span>
                                </div>
                                <ul className="divide-y divide-slate-200">
                                  {(showAdvanced
                                    ? group.optionalItems
                                    : group.optionalItems.filter(
                                        (item) => item.complianceLevel !== 'exceptional'
                                      )
                                  ).map((item, index) => (
                                    <li
                                      key={`iso27701-${group.code}-opt-${index}`}
                                      className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)_minmax(0,1fr)] gap-3 px-3 py-2 text-sm text-slate-700"
                                    >
                                      <div className="flex flex-col gap-1">
                                        <span className="font-medium">{item.sessionTitle}</span>
                                      </div>
                                      <div className="flex items-start text-sm text-slate-700">
                                        {item.workItemText}
                                      </div>
                                      <div className="flex flex-wrap items-start gap-1 text-xs text-slate-600">
                                        {item.documentTypes?.length
                                          ? item.documentTypes.map((doc, idx) => (
                                              <Badge key={idx} variant="outline" className="text-[11px]">
                                                {doc}
                                              </Badge>
                                            ))
                                          : <span className="text-[11px] text-slate-400">Nenhum artefato específico definido</span>}
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      )}
                    </div>
                  ))}
                </section>
              )}
            </>
            );
          })()}
        </TabsContent>
      </Tabs>

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
