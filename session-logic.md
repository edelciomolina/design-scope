# Lógica de Sessões por Tipo de Entrega

## Session 00: Contexto & Intenção
- **Todos os tipos**: REQUIRED (sempre obrigatória)

## Session 01: Fluxo & Arquitetura da Informação
- **new-product**: REQUIRED (produto novo precisa de arquitetura completa)
- **functional-evolution**: REQUIRED (nova funcionalidade altera fluxos)
- **third-party-integration**: REQUIRED (integração cria novos fluxos)
- **visual-ux-adjustment**: OPTIONAL (pode alterar fluxos de navegação)
- **technical-bugfix**: NOT APPLICABLE (correção pontual)
- **technical-refactoring**: NOT APPLICABLE (sem mudança funcional)
- **discontinuation**: OPTIONAL (precisa mapear impacto na arquitetura)

## Session 02: UI - Telas Principais
- **Todos os tipos exceto**: REQUIRED
- **technical-refactoring**: NOT APPLICABLE (sem mudança visual)
- **discontinuation**: OPTIONAL (apenas se houver UI de transição/migração)

## Session 03: Estados, Erros & Feedback
- **new-product**: REQUIRED (produto novo precisa cobrir todos os estados)
- **functional-evolution**: REQUIRED (nova funcionalidade tem novos estados)
- **third-party-integration**: REQUIRED (integração tem estados de conexão/erro)
- **visual-ux-adjustment**: OPTIONAL (pode melhorar feedback)
- **technical-bugfix**: OPTIONAL (se corrige comportamento de estado/erro)
- **technical-refactoring**: NOT APPLICABLE
- **discontinuation**: OPTIONAL (estados de descontinuação/migração)

## Session 04: Ações Sensíveis
- Baseado nos checkboxes (Delete, Permissões, Revogação, Financeiro, Aprovações)
- **discontinuation**: Sempre REQUIRED se tiver dados (remoção de dados é ação sensível)

## Session 05: Privacidade & Consentimento
- Baseado em dataInvolved + accessModel
- **discontinuation**: REQUIRED se tiver dados pessoais (direito de exclusão)

## Session 06: Compartilhamento & Exportação
- Baseado nos checkboxes (Share, Export, Access:Shared)
- **discontinuation**: REQUIRED se tiver exportação de dados antes da remoção

## Session 07: Revisão de Segurança & Privacidade
- **Todos os tipos**: REQUIRED (sempre obrigatória)

## Session 08: Impacto de Mudança & Versionamento
- **new-product**: NOT APPLICABLE (sem versão anterior)
- **third-party-integration**: OPTIONAL (pode ter breaking changes na integração)
- **functional-evolution**: REQUIRED (mudança em funcionalidade existente)
- **visual-ux-adjustment**: REQUIRED (mudança visual pode impactar usuários)
- **technical-bugfix**: OPTIONAL (pode ter breaking changes)
- **technical-refactoring**: OPTIONAL (refatoração pode ter impactos)
- **discontinuation**: REQUIRED (remoção sempre impacta usuários)
