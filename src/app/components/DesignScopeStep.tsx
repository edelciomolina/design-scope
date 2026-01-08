import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Checkbox } from './ui/checkbox';
import { DesignScopeData, DeliveryType, DataType, AccessModel, UserCapability } from '../App';
import { AlertCircle } from 'lucide-react';

interface Props {
  scopeData: DesignScopeData;
  setScopeData: (data: DesignScopeData) => void;
}

export function DesignScopeStep({ scopeData, setScopeData }: Props) {
  const updateField = <K extends keyof DesignScopeData>(
    field: K,
    value: DesignScopeData[K]
  ) => {
    setScopeData({ ...scopeData, [field]: value });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-2">
          Design Scope Card
        </h2>
        <p className="text-sm text-slate-600">
          Preencha as informações sobre o trabalho a ser realizado. Isso ajudará a
          classificar os riscos e definir as sessões de design necessárias.
        </p>
      </div>

      {/* Delivery Type */}
      <div className="space-y-3">
        <Label>Tipo de Entrega</Label>
        <p className="text-sm text-slate-600 -mt-1 mb-2">
          Escolha a opção que melhor descreve o trabalho a ser realizado
        </p>
        <RadioGroup
          value={scopeData.deliveryType}
          onValueChange={(value) => updateField('deliveryType', value as DeliveryType)}
        >
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="new-product" id="new-product" />
              <Label htmlFor="new-product" className="font-normal cursor-pointer">
                Novo produto / novo módulo - Produto ou módulo completamente novo
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="third-party-integration" id="third-party-integration" />
              <Label htmlFor="third-party-integration" className="font-normal cursor-pointer">
                Integração com terceiros - Integração com API ou serviço externo
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="functional-evolution" id="functional-evolution" />
              <Label htmlFor="functional-evolution" className="font-normal cursor-pointer">
                Evolução funcional - Nova funcionalidade ou melhoria em módulo existente
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="visual-ux-adjustment" id="visual-ux-adjustment" />
              <Label htmlFor="visual-ux-adjustment" className="font-normal cursor-pointer">
                Ajuste visual / UX - Melhoria de interface ou experiência do usuário
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="technical-bugfix" id="technical-bugfix" />
              <Label htmlFor="technical-bugfix" className="font-normal cursor-pointer">
                Correção técnica / bugfix - Correção de bug ou problema técnico
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="technical-refactoring" id="technical-refactoring" />
              <Label htmlFor="technical-refactoring" className="font-normal cursor-pointer">
                Refatoração técnica - Melhoria de código sem mudança de funcionalidade
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="discontinuation" id="discontinuation" />
              <Label htmlFor="discontinuation" className="font-normal cursor-pointer">
                Descontinuação / remoção - Remoção de funcionalidade ou produto
              </Label>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Data Involved */}
      <div className="space-y-3">
        <Label>Dados Envolvidos *</Label>
        <p className="text-sm text-slate-600 -mt-1 mb-2">
          Selecione o tipo de dado que será processado no trabalho
        </p>
        <RadioGroup
          value={scopeData.dataInvolved}
          onValueChange={(value) => updateField('dataInvolved', value as DataType)}
        >
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="none" id="none" />
              <Label htmlFor="none" className="font-normal cursor-pointer">
                Nenhum dado
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="non-personal" id="non-personal" />
              <Label htmlFor="non-personal" className="font-normal cursor-pointer">
                Dados não pessoais - Dados agregados, estatísticas, métricas sem identificação
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="personal-common" id="personal-common" />
              <Label htmlFor="personal-common" className="font-normal cursor-pointer">
                Dados pessoais comuns - Nome, email, telefone, endereço, etc.
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="personal-sensitive" id="personal-sensitive" />
              <Label htmlFor="personal-sensitive" className="font-normal cursor-pointer">
                Dados pessoais sensíveis - Saúde, biometria, origem racial, religião, etc.
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="financial" id="financial" />
              <Label htmlFor="financial" className="font-normal cursor-pointer">
                Dados financeiros - Cartão de crédito, conta bancária, transações, etc.
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="children" id="children" />
              <Label htmlFor="children" className="font-normal cursor-pointer">
                Dados de crianças/adolescentes - Dados de menores de 18 anos
              </Label>
            </div>
          </div>
        </RadioGroup>
        {(scopeData.dataInvolved === 'personal-sensitive' || 
          scopeData.dataInvolved === 'financial' || 
          scopeData.dataInvolved === 'children') && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-800">
              <p className="font-medium mb-1">⚠️ Dados de alto risco identificados</p>
              <p>
                {scopeData.dataInvolved === 'personal-sensitive' && 'Dados sensíveis exigem controles rigorosos de segurança, privacidade e consentimento explícito (LGPD/GDPR).'}
                {scopeData.dataInvolved === 'financial' && 'Dados financeiros requerem conformidade PCI-DSS, criptografia forte e controles de auditoria.'}
                {scopeData.dataInvolved === 'children' && 'Dados de menores de 18 anos exigem verificação de idade e consentimento parental (LGPD: <18 anos, GDPR: <16 anos).'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Access Model */}
      <div className="space-y-3">
        <Label>Modelo de Acesso *</Label>
        <p className="text-sm text-slate-600 -mt-1 mb-2">
          Como os usuários/sistemas acessarão esta funcionalidade
        </p>
        <RadioGroup
          value={scopeData.accessModel}
          onValueChange={(value) => updateField('accessModel', value as AccessModel)}
        >
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="public" id="public" />
              <Label htmlFor="public" className="font-normal cursor-pointer">
                Público - Acesso sem autenticação (disponível para qualquer pessoa)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="authenticated" id="authenticated" />
              <Label htmlFor="authenticated" className="font-normal cursor-pointer">
                Autenticado - Requer login, todos usuários têm mesmo acesso
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="authenticated-permissions" id="authenticated-permissions" />
              <Label htmlFor="authenticated-permissions" className="font-normal cursor-pointer">
                Autenticado com níveis de permissão - Roles, grupos, permissões granulares
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="administrative" id="administrative" />
              <Label htmlFor="administrative" className="font-normal cursor-pointer">
                Acesso administrativo - Apenas administradores/superusuários
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="third-party" id="third-party" />
              <Label htmlFor="third-party" className="font-normal cursor-pointer">
                Acesso de terceiros - Parceiros, fornecedores, sistemas externos
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="api-automation" id="api-automation" />
              <Label htmlFor="api-automation" className="font-normal cursor-pointer">
                Acesso via API / automação - Integrações máquina-a-máquina, webhooks
              </Label>
            </div>
          </div>
        </RadioGroup>
        {(scopeData.accessModel === 'public' || 
          scopeData.accessModel === 'third-party' || 
          scopeData.accessModel === 'api-automation') && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">⚠️ Modelo de acesso de risco elevado</p>
              <p>
                {scopeData.accessModel === 'public' && 'Acesso público aumenta significativamente a superfície de ataque e riscos de segurança.'}
                {scopeData.accessModel === 'third-party' && 'Acesso de terceiros requer controles rigorosos de autenticação, autorização e auditoria.'}
                {scopeData.accessModel === 'api-automation' && 'APIs sem supervisão humana requerem validação, rate limiting, autenticação forte e logging completo.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* User Capability */}
      <div className="space-y-3">
        <Label>Capacidade do Usuário *</Label>
        <p className="text-sm text-slate-600 -mt-1 mb-2">
          Perfil técnico do usuário que utilizará esta funcionalidade
        </p>
        <RadioGroup
          value={scopeData.userCapability}
          onValueChange={(value) => updateField('userCapability', value as UserCapability)}
        >
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="end-user" id="end-user" />
              <Label htmlFor="end-user" className="font-normal cursor-pointer">
                Usuário final comum - Cliente/usuário sem conhecimento técnico
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="advanced-user" id="advanced-user" />
              <Label htmlFor="advanced-user" className="font-normal cursor-pointer">
                Usuário avançado - Power users, analistas, gestores
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="internal-operator" id="internal-operator" />
              <Label htmlFor="internal-operator" className="font-normal cursor-pointer">
                Operador interno - Equipe de suporte, atendimento, operações
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="administrator" id="administrator" />
              <Label htmlFor="administrator" className="font-normal cursor-pointer">
                Administrador - Gestão completa do sistema, configurações críticas
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="automated-system" id="automated-system" />
              <Label htmlFor="automated-system" className="font-normal cursor-pointer">
                Sistema automatizado / serviço - APIs, integrações, processos automáticos
              </Label>
            </div>
          </div>
        </RadioGroup>
        {(scopeData.userCapability === 'administrator' || 
          scopeData.userCapability === 'automated-system') && (
          <div className="flex items-start gap-2 bg-purple-50 border border-purple-200 rounded-lg p-3 mt-2">
            <AlertCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-purple-800">
              <p className="font-medium mb-1">⚠️ Capacidade de alto privilégio</p>
              <p>
                {scopeData.userCapability === 'administrator' && 'Administradores têm acesso amplo - requer auditoria completa, MFA obrigatório e validações adicionais.'}
                {scopeData.userCapability === 'automated-system' && 'Sistemas automatizados operam sem supervisão humana - requer validação rigorosa, rate limiting e monitoramento contínuo.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Sensitive Actions */}
      <div className="space-y-3">
        <Label>Ações Sensíveis</Label>
        <p className="text-sm text-slate-600 -mt-1 mb-2">
          Selecione as ações que o usuário poderá realizar (múltipla escolha)
        </p>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasCreateAction"
              checked={scopeData.hasCreateAction}
              onCheckedChange={(checked) =>
                updateField('hasCreateAction', checked as boolean)
              }
            />
            <Label htmlFor="hasCreateAction" className="font-normal cursor-pointer">
              Criação de dados - Criar novos registros, documentos, entidades
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasEditAction"
              checked={scopeData.hasEditAction}
              onCheckedChange={(checked) =>
                updateField('hasEditAction', checked as boolean)
              }
            />
            <Label htmlFor="hasEditAction" className="font-normal cursor-pointer">
              Alteração de dados - Editar, modificar, atualizar dados existentes
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasDeleteAction"
              checked={scopeData.hasDeleteAction}
              onCheckedChange={(checked) =>
                updateField('hasDeleteAction', checked as boolean)
              }
            />
            <Label htmlFor="hasDeleteAction" className="font-normal cursor-pointer">
              Exclusão de dados - Deletar, remover registros permanentemente
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasApprovalAction"
              checked={scopeData.hasApprovalAction}
              onCheckedChange={(checked) =>
                updateField('hasApprovalAction', checked as boolean)
              }
            />
            <Label htmlFor="hasApprovalAction" className="font-normal cursor-pointer">
              Aprovação / reprovação - Workflows de aprovação, validações
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasExportAction"
              checked={scopeData.hasExportAction}
              onCheckedChange={(checked) =>
                updateField('hasExportAction', checked as boolean)
              }
            />
            <Label htmlFor="hasExportAction" className="font-normal cursor-pointer">
              Exportação - Download, exportar para CSV/PDF/Excel, backup
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasShareAction"
              checked={scopeData.hasShareAction}
              onCheckedChange={(checked) =>
                updateField('hasShareAction', checked as boolean)
              }
            />
            <Label htmlFor="hasShareAction" className="font-normal cursor-pointer">
              Compartilhamento - Compartilhar via link, email, convites
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasIrreversibleAction"
              checked={scopeData.hasIrreversibleAction}
              onCheckedChange={(checked) =>
                updateField('hasIrreversibleAction', checked as boolean)
              }
            />
            <Label htmlFor="hasIrreversibleAction" className="font-normal cursor-pointer">
              Ações irreversíveis - Operações sem rollback, exclusões permanentes
            </Label>
          </div>
        </div>
        {(scopeData.hasDeleteAction || scopeData.hasIrreversibleAction) && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-800">
              <p className="font-medium mb-1">⚠️ Ações de alto impacto detectadas</p>
              <p>
                {scopeData.hasIrreversibleAction && scopeData.hasDeleteAction 
                  ? 'Ações irreversíveis e exclusões requerem confirmação dupla, auditoria completa e avisos claros ao usuário.'
                  : scopeData.hasIrreversibleAction
                  ? 'Ações irreversíveis requerem confirmação explícita, avisos claros e logging completo.'
                  : 'Exclusão de dados requer confirmação, possibilidade de recuperação (soft delete) e auditoria.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Sharing & Integrations */}
      <div className="space-y-3">
        <Label>Compartilhamento & Integrações</Label>
        <p className="text-sm text-slate-600 -mt-1 mb-2">
          Selecione as características de compartilhamento e integração (múltipla escolha)
        </p>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasNoSharing"
              checked={scopeData.hasNoSharing}
              onCheckedChange={(checked) =>
                updateField('hasNoSharing', checked as boolean)
              }
            />
            <Label htmlFor="hasNoSharing" className="font-normal cursor-pointer">
              Nenhum compartilhamento - Sistema isolado, sem integrações
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasInternalIntegrations"
              checked={scopeData.hasInternalIntegrations}
              onCheckedChange={(checked) =>
                updateField('hasInternalIntegrations', checked as boolean)
              }
            />
            <Label htmlFor="hasInternalIntegrations" className="font-normal cursor-pointer">
              Integrações internas - Comunicação entre sistemas da mesma organização
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasExternalIntegrations"
              checked={scopeData.hasExternalIntegrations}
              onCheckedChange={(checked) =>
                updateField('hasExternalIntegrations', checked as boolean)
              }
            />
            <Label htmlFor="hasExternalIntegrations" className="font-normal cursor-pointer">
              Integrações externas - APIs de terceiros, serviços externos
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasInternationalTransfer"
              checked={scopeData.hasInternationalTransfer}
              onCheckedChange={(checked) =>
                updateField('hasInternationalTransfer', checked as boolean)
              }
            />
            <Label htmlFor="hasInternationalTransfer" className="font-normal cursor-pointer">
              Transferência internacional de dados - Envio de dados para outros países
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasWebhooks"
              checked={scopeData.hasWebhooks}
              onCheckedChange={(checked) =>
                updateField('hasWebhooks', checked as boolean)
              }
            />
            <Label htmlFor="hasWebhooks" className="font-normal cursor-pointer">
              Webhooks / sincronização automática - Eventos em tempo real, notificações push
            </Label>
          </div>
        </div>
        {scopeData.hasInternationalTransfer && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-800">
              <p className="font-medium mb-1">🌍 Transferência internacional detectada</p>
              <p>
                <strong>LGPD Art. 33 / GDPR Cap. V:</strong> Transferência internacional requer mecanismos adequados de proteção (cláusulas contratuais padrão, certificações, acordos de adequação). Design deve incluir consentimento explícito, notificação ao usuário sobre países de destino, e documentação de salvaguardas implementadas.
              </p>
            </div>
          </div>
        )}
        {scopeData.hasExternalIntegrations && (
          <div className="flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-lg p-3 mt-2">
            <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-orange-800">
              <p className="font-medium mb-1">🔌 Integrações externas detectadas</p>
              <p>
                Design deve contemplar autenticação segura (OAuth 2.0, API keys), rate limiting, monitoramento de falhas, timeout configurável, e tratamento de degradação de serviços externos.
              </p>
            </div>
          </div>
        )}
        {scopeData.hasWebhooks && (
          <div className="flex items-start gap-2 bg-indigo-50 border border-indigo-200 rounded-lg p-3 mt-2">
            <AlertCircle className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-indigo-800">
              <p className="font-medium mb-1">⚡ Webhooks / sincronização automática</p>
              <p>
                Implementar validação de assinatura (HMAC), retry com backoff exponencial, idempotência, logging detalhado de eventos, e UI para gerenciamento de URLs de callback.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Security & Reliability */}
      <div className="space-y-3">
        <Label>Segurança & Confiabilidade</Label>
        <p className="text-sm text-slate-600 -mt-1 mb-2">
          Selecione os requisitos de segurança e confiabilidade (múltipla escolha)
        </p>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasAuthenticationReq"
              checked={scopeData.hasAuthenticationReq}
              onCheckedChange={(checked) =>
                updateField('hasAuthenticationReq', checked as boolean)
              }
            />
            <Label htmlFor="hasAuthenticationReq" className="font-normal cursor-pointer">
              Requisitos de autenticação - Login, senha, MFA, SSO
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasAuthorizationReq"
              checked={scopeData.hasAuthorizationReq}
              onCheckedChange={(checked) =>
                updateField('hasAuthorizationReq', checked as boolean)
              }
            />
            <Label htmlFor="hasAuthorizationReq" className="font-normal cursor-pointer">
              Requisitos de autorização - Permissões, papéis (RBAC), níveis de acesso
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasEncryptionInTransit"
              checked={scopeData.hasEncryptionInTransit}
              onCheckedChange={(checked) =>
                updateField('hasEncryptionInTransit', checked as boolean)
              }
            />
            <Label htmlFor="hasEncryptionInTransit" className="font-normal cursor-pointer">
              Criptografia em trânsito - HTTPS/TLS, comunicação segura
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasEncryptionAtRest"
              checked={scopeData.hasEncryptionAtRest}
              onCheckedChange={(checked) =>
                updateField('hasEncryptionAtRest', checked as boolean)
              }
            />
            <Label htmlFor="hasEncryptionAtRest" className="font-normal cursor-pointer">
              Criptografia em repouso - Dados criptografados no banco de dados
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasAuditLogs"
              checked={scopeData.hasAuditLogs}
              onCheckedChange={(checked) =>
                updateField('hasAuditLogs', checked as boolean)
              }
            />
            <Label htmlFor="hasAuditLogs" className="font-normal cursor-pointer">
              Logs de auditoria necessários - Rastreabilidade de ações, conformidade LGPD/GDPR
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasUsageMonitoring"
              checked={scopeData.hasUsageMonitoring}
              onCheckedChange={(checked) =>
                updateField('hasUsageMonitoring', checked as boolean)
              }
            />
            <Label htmlFor="hasUsageMonitoring" className="font-normal cursor-pointer">
              Monitoramento de uso - Analytics, métricas, detecção de anomalias
            </Label>
          </div>
        </div>
        {scopeData.hasAuditLogs && (
          <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">📋 Logs de auditoria ativados</p>
              <p>
                <strong>LGPD Art. 48 / GDPR Art. 30:</strong> Logs devem registrar quem, quando, o quê e onde para cada ação sensível. Design deve incluir visualização de histórico de auditoria, filtros por período/usuário, e exportação para análise. Logs devem ser imutáveis e armazenados conforme políticas de retenção.
              </p>
            </div>
          </div>
        )}
        {(scopeData.hasAuthenticationReq || scopeData.hasAuthorizationReq) && (
          <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
            <AlertCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-green-800">
              <p className="font-medium mb-1">🔐 Autenticação/Autorização detectada</p>
              <p>
                {scopeData.hasAuthenticationReq && scopeData.hasAuthorizationReq
                  ? 'Design deve contemplar fluxos de login/logout, recuperação de senha, MFA (se alto privilégio), gestão de permissões, e mensagens de erro seguras sem expor informações sensíveis.'
                  : scopeData.hasAuthenticationReq
                  ? 'Design deve contemplar fluxos de login/logout, recuperação de senha, MFA para usuários privilegiados, e mensagens de erro seguras.'
                  : 'Sistema de autorização requer design claro de permissões, mensagens de acesso negado, e gestão de papéis (RBAC).'}
              </p>
            </div>
          </div>
        )}
        {(scopeData.hasEncryptionInTransit || scopeData.hasEncryptionAtRest) && (
          <div className="flex items-start gap-2 bg-purple-50 border border-purple-200 rounded-lg p-3 mt-2">
            <AlertCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-purple-800">
              <p className="font-medium mb-1">🔒 Criptografia requerida</p>
              <p>
                {scopeData.hasEncryptionInTransit && scopeData.hasEncryptionAtRest
                  ? 'Criptografia end-to-end: HTTPS/TLS para comunicação (mínimo TLS 1.2) e criptografia AES-256 para dados em repouso. Design deve indicar visualmente conexões seguras.'
                  : scopeData.hasEncryptionInTransit
                  ? 'HTTPS/TLS obrigatório para toda comunicação (mínimo TLS 1.2). Design deve indicar visualmente conexões seguras (cadeado, badges).'
                  : 'Dados em repouso criptografados com AES-256. Requer gerenciamento seguro de chaves de criptografia.'}
              </p>
            </div>
          </div>
        )}
        {scopeData.hasUsageMonitoring && (
          <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">📊 Monitoramento de uso</p>
              <p>
                Design deve incluir dashboards de métricas, detecção de anomalias (ex: tentativas de acesso suspeitas), e conformidade com transparência de coleta de dados (LGPD Art. 9 / GDPR Art. 13).
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Change Impact */}
      <div className="space-y-3">
        <Label>Impacto de Mudança</Label>
        <p className="text-sm text-slate-600 -mt-1 mb-2">
          Selecione os tipos de impacto que esta mudança causa (múltipla escolha)
        </p>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasNoImpact"
              checked={scopeData.hasNoImpact}
              onCheckedChange={(checked) =>
                updateField('hasNoImpact', checked as boolean)
              }
            />
            <Label htmlFor="hasNoImpact" className="font-normal cursor-pointer">
              Mudança sem impacto funcional - Apenas visual, performance, refatoração interna
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasChangedBehavior"
              checked={scopeData.hasChangedBehavior}
              onCheckedChange={(checked) =>
                updateField('hasChangedBehavior', checked as boolean)
              }
            />
            <Label htmlFor="hasChangedBehavior" className="font-normal cursor-pointer">
              Mudança que altera comportamento existente - Fluxos, validações, regras de negócio
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasNewDataPurpose"
              checked={scopeData.hasNewDataPurpose}
              onCheckedChange={(checked) =>
                updateField('hasNewDataPurpose', checked as boolean)
              }
            />
            <Label htmlFor="hasNewDataPurpose" className="font-normal cursor-pointer">
              Nova finalidade de uso de dados - Usar dados existentes para novos propósitos
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasChangedDataCollection"
              checked={scopeData.hasChangedDataCollection}
              onCheckedChange={(checked) =>
                updateField('hasChangedDataCollection', checked as boolean)
              }
            />
            <Label htmlFor="hasChangedDataCollection" className="font-normal cursor-pointer">
              Mudança em dados coletados - Adicionar/remover campos, mudar obrigatoriedade
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasChangedIntegrations"
              checked={scopeData.hasChangedIntegrations}
              onCheckedChange={(checked) =>
                updateField('hasChangedIntegrations', checked as boolean)
              }
            />
            <Label htmlFor="hasChangedIntegrations" className="font-normal cursor-pointer">
              Mudança em integrações - Alterar APIs, adicionar/remover serviços terceiros
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasAffectedExistingUsers"
              checked={scopeData.hasAffectedExistingUsers}
              onCheckedChange={(checked) =>
                updateField('hasAffectedExistingUsers', checked as boolean)
              }
            />
            <Label htmlFor="hasAffectedExistingUsers" className="font-normal cursor-pointer">
              Mudança que afeta usuários existentes - Impacto em base instalada, requer comunicação
            </Label>
          </div>
        </div>
        {scopeData.hasNewDataPurpose && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-800">
              <p className="font-medium mb-1">🚨 Nova finalidade de dados - CRÍTICO</p>
              <p>
                <strong>LGPD Art. 8 / GDPR Art. 6:</strong> Usar dados existentes para nova finalidade requer <strong>NOVO CONSENTIMENTO</strong> específico e informado do titular. Design deve incluir fluxo de re-consentimento, notificação clara ao usuário sobre a nova finalidade, e opção de recusa sem prejuízo aos serviços originais. <strong>Não implementar sem aprovação jurídica.</strong>
              </p>
            </div>
          </div>
        )}
        {scopeData.hasChangedDataCollection && (
          <div className="flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-lg p-3 mt-2">
            <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-orange-800">
              <p className="font-medium mb-1">📝 Mudança em dados coletados</p>
              <p>
                <strong>LGPD Art. 9 / GDPR Art. 13-14:</strong> Mudanças na coleta de dados requerem atualização da política de privacidade e notificação aos usuários. Se adicionar novos campos sensíveis ou obrigatórios, pode exigir novo consentimento. Design deve contemplar transparência total sobre o que mudou e por quê.
              </p>
            </div>
          </div>
        )}
        {scopeData.hasAffectedExistingUsers && (
          <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">👥 Impacto em usuários existentes</p>
              <p>
                Design deve incluir estratégia de comunicação (email, in-app notifications, changelog), período de transição/adaptação se necessário, suporte/FAQ para dúvidas, e possibilidade de rollback parcial. Considerar onboarding específico para mudanças significativas.
              </p>
            </div>
          </div>
        )}
        {scopeData.hasChangedBehavior && (
          <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">⚙️ Mudança de comportamento</p>
              <p>
                Alterações em comportamento existente requerem testes de regressão completos, validação com usuários-chave, documentação de breaking changes, e comunicação clara sobre o que mudou. Considerar feature flags para rollout gradual.
              </p>
            </div>
          </div>
        )}
        {scopeData.hasChangedIntegrations && (
          <div className="flex items-start gap-2 bg-indigo-50 border border-indigo-200 rounded-lg p-3 mt-2">
            <AlertCircle className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-indigo-800">
              <p className="font-medium mb-1">🔌 Mudança em integrações</p>
              <p>
                Mudanças em integrações requerem versionamento de API, backward compatibility quando possível, testes end-to-end com sistemas integrados, e coordenação com times técnicos. Design deve contemplar estados de erro e degradação graceful.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Other Characteristics */}
      <div className="space-y-3">
        <Label>Outras Características</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasFinancial"
              checked={scopeData.hasFinancial}
              onCheckedChange={(checked) =>
                updateField('hasFinancial', checked as boolean)
              }
            />
            <Label htmlFor="hasFinancial" className="font-normal cursor-pointer">
              Transações financeiras - Pagamentos, cobranças, transferências
            </Label>
          </div>
        </div>
      </div>

      {/* Compliance Standards */}
      <div className="space-y-3">
        <Label>Normas de Conformidade</Label>
        <p className="text-sm text-slate-600 -mt-1 mb-2">
          Selecione as normas que devem ser consideradas (determina itens obrigatórios/opcionais nas sessões)
        </p>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="complianceISO9001"
              checked={scopeData.complianceISO9001}
              onCheckedChange={(checked) =>
                updateField('complianceISO9001', checked as boolean)
              }
            />
            <Label htmlFor="complianceISO9001" className="font-normal cursor-pointer">
              <span className="font-semibold text-blue-900">ISO 9001</span>
              <span className="text-sm text-blue-700"> - Gestão da Qualidade</span>
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="complianceISO27001"
              checked={scopeData.complianceISO27001}
              onCheckedChange={(checked) =>
                updateField('complianceISO27001', checked as boolean)
              }
            />
            <Label htmlFor="complianceISO27001" className="font-normal cursor-pointer">
              <span className="font-semibold text-blue-900">ISO/IEC 27001</span>
              <span className="text-sm text-blue-700"> - Segurança da Informação</span>
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="complianceISO27701"
              checked={scopeData.complianceISO27701}
              onCheckedChange={(checked) =>
                updateField('complianceISO27701', checked as boolean)
              }
            />
            <Label htmlFor="complianceISO27701" className="font-normal cursor-pointer">
              <span className="font-semibold text-blue-900">ISO/IEC 27701</span>
              <span className="text-sm text-blue-700"> - Gestão de Privacidade</span>
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
}