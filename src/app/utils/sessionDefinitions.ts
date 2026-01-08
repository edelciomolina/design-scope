import { DesignScopeData, RiskAssessment } from '../App';

export type DeliverableType = 
  | 'design'      // Telas, UI, interfaces visuais
  | 'document'    // Documentação em texto
  | 'diagram'     // Diagramas, sitemaps, arquitetura
  | 'flow'        // User flows, fluxogramas
  | 'list'        // Listas, checklists estruturadas
  | 'interface';  // Interfaces de gestão/controle

export type ComplianceStandard = 'ISO9001' | 'ISO27001' | 'ISO27701';

export interface StandardCompliance {
  standard: ComplianceStandard;
  clauses: string;  // e.g., "8.2.3, 8.5.1"
  explanation: string;  // How this item meets the standard
}

export interface WhatToDesignItem {
  text: string;
  type: DeliverableType;
  standards: ComplianceStandard[];
  standardsCompliance?: StandardCompliance[];  // Detailed compliance info
  explanation?: string;
  example?: string;
}

export interface ChecklistItem {
  text: string;
  standards: ComplianceStandard[];
  standardsCompliance?: StandardCompliance[];  // Detailed compliance info
  explanation?: string;
  example?: string;
}

export interface SessionDefinition {
  id: string;
  name: string;
  purpose: string;
  whatToDesign: WhatToDesignItem[];
  checklist: ChecklistItem[];
  notes: string;
}

export function getSessionDefinition(
  sessionId: string,
  scopeData: DesignScopeData,
  riskAssessment: RiskAssessment
): SessionDefinition {
  const definitions: Record<string, SessionDefinition> = {
    '00': {
      id: '00',
      name: 'Contexto & Intenção',
      purpose:
        'Estabelecer entendimento compartilhado sobre o problema, objetivo e escopo do trabalho antes de iniciar qualquer design.',
      whatToDesign: [
        { 
          text: 'Documento de contexto com problema sendo resolvido', 
          type: 'document', 
          standards: ['ISO9001'],
          explanation: 'Um documento claro que explica qual problema real está sendo resolvido, por que é importante, e qual o impacto esperado. Deve ser compreensível por todos os stakeholders.',
          example: 'Ex: "Usuários levam 5 cliques para criar um relatório. Queremos reduzir para 2 cliques, economizando 10h/mês da equipe comercial."'
        },
        { 
          text: 'Personas ou perfis de usuário impactados', 
          type: 'document', 
          standards: ['ISO9001'],
          explanation: 'Identificação clara de quem são os usuários afetados, seus objetivos, necessidades e contexto de uso. Ajuda a manter o foco no usuário durante todo o processo.',
          example: 'Ex: "Ana (Gerente Comercial, 35 anos) - Precisa gerar relatórios rápidos para reuniões diárias. Usa mobile 60% do tempo."'
        },
        { 
          text: 'Objetivos mensuráveis da feature', 
          type: 'list', 
          standards: ['ISO9001'],
          explanation: 'Objetivos específicos e quantificáveis que permitam avaliar se a solução foi bem-sucedida. Use métricas como tempo, taxa de conclusão, redução de erros, etc.',
          example: 'Ex: "Reduzir tempo de criação de relatório de 5min para 2min" ou "Aumentar taxa de conclusão de 60% para 85%"'
        },
        { 
          text: 'Premissas e restrições conhecidas', 
          type: 'list', 
          standards: ['ISO9001'],
          explanation: 'Liste o que está sendo assumido como verdadeiro (premissas) e quais são as limitações técnicas, de negócio ou de prazo (restrições). Isso evita retrabalho.',
          example: 'Ex: Premissa: "API de relatórios já existe". Restrição: "Deve funcionar no IE11" ou "Budget de 2 sprints"'
        },
        { 
          text: 'Critérios de sucesso', 
          type: 'list', 
          standards: ['ISO9001'],
          explanation: 'Condições claras que definem quando o trabalho pode ser considerado completo e bem-sucedido. Devem ser verificáveis e acordados com stakeholders.',
          example: 'Ex: "95% dos usuários conseguem criar relatório sem ajuda", "NPS da feature > 8", "Zero bugs críticos em produção"'
        },
      ],
      checklist: [
        { 
          text: 'Problema está documentado de forma clara e validada', 
          standards: ['ISO9001'],
          explanation: 'Certifique-se de que o problema foi escrito de forma que qualquer pessoa da equipe possa entender, e que foi validado com stakeholders ou dados reais.',
          example: 'Ex: Revisar documento com PM e usuários reais. Validar com dados de analytics ou pesquisa.'
        },
        { 
          text: 'Usuários-alvo foram identificados', 
          standards: ['ISO9001'],
          explanation: 'Você deve saber exatamente quem vai usar a feature, seus objetivos e contexto. Não assuma "todos os usuários".',
          example: 'Ex: "Gerentes e Analistas de Vendas" (não "usuários do sistema") com descrição de suas necessidades específicas.'
        },
        { 
          text: 'Objetivos estão definidos e são mensuráveis', 
          standards: ['ISO9001'],
          explanation: 'Cada objetivo deve ter uma métrica clara. Se não pode ser medido, não pode ser validado como sucesso.',
          example: 'Ex: ✅ "Reduzir tempo de 5min para 2min" | ❌ "Melhorar a experiência" (vago)'
        },
        { 
          text: 'Restrições técnicas ou de negócio foram mapeadas', 
          standards: ['ISO9001'],
          explanation: 'Liste tudo que pode limitar a solução: tecnologias obrigatórias, browsers suportados, prazo, orçamento, políticas da empresa, etc.',
          example: 'Ex: "Deve usar API REST existente", "Compatível com Chrome, Firefox, Safari", "Entrega em 3 semanas"'
        },
        { 
          text: 'Alinhamento com stakeholders está documentado', 
          standards: ['ISO9001'],
          explanation: 'Garanta que PM, Dev, Design e outros stakeholders concordam com o escopo, objetivos e prioridades. Documente as decisões.',
          example: 'Ex: Ata de reunião de kickoff com aprovações, ou thread de Slack/email com confirmações dos envolvidos.'
        },
      ],
      notes:
        'Esta sessão não produz UI. Foco é em alinhamento estratégico e definição de escopo.',
    },

    '01': {
      id: '01',
      name: 'Fluxo & Arquitetura da Informação',
      purpose:
        'Definir a estrutura de navegação, hierarquia de informação e fluxos principais antes de desenhar interfaces.',
      whatToDesign: [
        { 
          text: 'Mapa de navegação (sitemap ou navigation map)', 
          type: 'diagram', 
          standards: ['ISO9001'],
          explanation: 'Estrutura hierárquica mostrando todas as páginas/telas e como elas se relacionam. Ajuda a entender a organização geral do produto.',
          example: 'Ex: Diagrama com boxes conectados: Home → Dashboard → [Projetos, Perfil, Configurações]'
        },
        { 
          text: 'User flows com happy path e caminhos alternativos', 
          type: 'flow', 
          standards: ['ISO9001'],
          explanation: 'Passo a passo que o usuário segue para completar uma tarefa. Happy path = caminho ideal sem erros. Caminhos alternativos = o que acontece quando algo dá errado.',
          example: 'Ex: Login → Dashboard (happy path) | Login → "Esqueci senha" → Email enviado → Reset senha → Login (alternativo)'
        },
        { 
          text: 'Arquitetura de informação (hierarquia de conteúdo)', 
          type: 'diagram', 
          standards: ['ISO9001'],
          explanation: 'Como o conteúdo é organizado dentro de cada tela: seções, categorias, agrupamentos lógicos. Diferente da navegação (entre telas).',
          example: 'Ex: Tela "Perfil" → [Dados Pessoais (nome, email), Segurança (senha, 2FA), Preferências (idioma, tema)]'
        },
        { 
          text: 'Pontos de entrada e saída de cada fluxo', 
          type: 'list', 
          standards: ['ISO9001'],
          explanation: 'Onde o fluxo começa (entrada) e onde termina (saída). Importante para entender contexto e onde o usuário vai parar.',
          example: 'Ex: Entrada: Botão "Criar Projeto" no Dashboard | Saída: Projeto criado com sucesso, volta para lista de projetos'
        },
        { 
          text: 'Regras de transição entre estados', 
          type: 'list', 
          standards: ['ISO9001'],
          explanation: 'Condições que precisam ser atendidas para mudar de estado. Ex: quando um botão é habilitado, quando o usuário pode avançar.',
          example: 'Ex: "Botão Enviar" só fica ativo quando: (email é válido) AND (senha tem 8+ caracteres) AND (checkbox termos aceito)"'
        },
      ],
      checklist: [
        { 
          text: 'Fluxo principal (happy path) está documentado', 
          standards: ['ISO9001'],
          explanation: 'O caminho ideal sem erros ou desvios deve estar claro e completo, do início ao fim da tarefa.',
          example: 'Ex: Criar conta: Preencher form → Clicar "Criar" → Email de verificação → Clicar link → Conta ativada'
        },
        { 
          text: 'Fluxos alternativos e edge cases foram mapeados', 
          standards: ['ISO9001'],
          explanation: 'Considere o que acontece quando algo não sai como esperado: erros, validações, usuário clica "Voltar", sessão expira, etc.',
          example: 'Ex: E se email já existe? E se senha é fraca? E se não recebeu email? E se clicou em link expirado?'
        },
        { 
          text: 'Pontos de decisão estão claramente identificados', 
          standards: ['ISO9001'],
          explanation: 'Momentos onde o fluxo se divide baseado em condições: IF/ELSE no design. Use losangos em diagramas de fluxo.',
          example: 'Ex: Usuário tem permissão? → SIM: mostra dados | NÃO: mostra mensagem de acesso negado'
        },
        { 
          text: 'Hierarquia de informação está definida', 
          standards: ['ISO9001'],
          explanation: 'Informações mais importantes devem ter destaque visual. Defina o que é primário, secundário, terciário.',
          example: 'Ex: Em "Card de Projeto": Título (primário/grande) → Status (secundário/badge) → Data (terciário/pequeno)'
        },
        { 
          text: 'Navegação entre telas está documentada', 
          standards: ['ISO9001'],
          explanation: 'Como o usuário vai de A para B: botões, links, gestos, breadcrumbs. Inclua navegação "para trás".',
          example: 'Ex: Dashboard → [Botão "Ver Projeto"] → Detalhes do Projeto → [Breadcrumb] volta para Dashboard'
        },
      ],
      notes:
        'Use diagramas de fluxo, wireflows ou qualquer formato que comunique estrutura claramente.',
    },

    '02': {
      id: '02',
      name: 'UI - Telas Principais',
      purpose: 'Desenhar as interfaces principais que compõem a funcionalidade.',
      whatToDesign: [
        { 
          text: 'Telas principais (high-fidelity ou wireframes)', 
          type: 'design', 
          standards: ['ISO9001'],
          explanation: 'Mockups ou wireframes das telas core da funcionalidade. High-fidelity = design final com cores e estilos. Wireframes = estrutura básica sem estilo visual.',
          example: 'Ex: Tela de Dashboard (high-fidelity) com gráficos, cards e menu lateral já estilizados conforme design system.'
        },
        { 
          text: 'Layout e organização visual de componentes', 
          type: 'design', 
          standards: ['ISO9001'],
          explanation: 'Como os elementos estão posicionados na tela: grids, espaçamentos, alinhamentos. Define a estrutura visual antes de adicionar conteúdo.',
          example: 'Ex: Grid de 12 colunas, header fixo no topo, sidebar 240px à esquerda, conteúdo principal com padding 24px.'
        },
        { 
          text: 'Hierarquia visual e priorização de elementos', 
          type: 'design', 
          standards: ['ISO9001'],
          explanation: 'Destaque visual para elementos importantes usando tamanho, cor, peso, espaçamento. Define o que o usuário vê primeiro.',
          example: 'Ex: CTA primário (botão grande, azul) > Título (48px, bold) > Subtítulo (16px, regular) > Descrição (14px, cinza)'
        },
        { 
          text: 'Componentes e padrões de UI utilizados', 
          type: 'list', 
          standards: ['ISO9001'],
          explanation: 'Lista dos componentes do design system usados na tela. Garante consistência e facilita handoff para desenvolvimento.',
          example: 'Ex: Button (primary, secondary), Input (text, email), Card, Modal, Dropdown, Badge, Alert, Tooltip.'
        },
        { 
          text: 'Responsividade (mobile/tablet/desktop se aplicável)', 
          type: 'list', 
          standards: ['ISO9001'],
          explanation: 'Como o layout se adapta a diferentes tamanhos de tela. Defina breakpoints e mudanças estruturais em cada um.',
          example: 'Ex: Desktop (1440px) = sidebar + conteúdo lado a lado | Tablet (768px) = sidebar colapsa em menu | Mobile (375px) = stack vertical'
        },
      ],
      checklist: [
        { 
          text: 'Todas as telas principais foram desenhadas', 
          standards: ['ISO9001'],
          explanation: 'Certifique-se de que todas as telas necessárias para o fluxo principal estão prontas, sem "buracos" no design.',
          example: 'Ex: Se o fluxo é "Criar Projeto", precisa ter: Tela lista de projetos + Tela criar novo + Tela de confirmação.'
        },
        { 
          text: 'Layout está alinhado com design system', 
          standards: ['ISO9001'],
          explanation: 'Use componentes, cores, tipografia e espaçamentos do design system existente. Não invente padrões novos sem justificativa.',
          example: 'Ex: Usar Button do design system (não criar botão customizado). Usar tokens de cor (--primary-500, não #3B82F6).'
        },
        { 
          text: 'Hierarquia visual está clara', 
          standards: ['ISO9001'],
          explanation: 'Teste: feche os olhos, abra e veja onde seu olhar vai primeiro. A informação mais importante deve ter o maior destaque.',
          example: 'Ex: Em tela de erro de pagamento: Mensagem de erro (grande, vermelho) > Ação de correção (botão destaque) > Detalhes (pequeno)'
        },
        { 
          text: 'Acessibilidade básica foi considerada (contraste, tamanho de fonte)', 
          standards: ['ISO9001'],
          explanation: 'Contraste mínimo 4.5:1 para texto normal, 3:1 para texto grande. Tamanho de fonte mínimo 16px para corpo de texto.',
          example: 'Ex: Texto cinza claro #9CA3AF em fundo branco = contraste insuficiente ❌ | Texto #374151 = ok ✅'
        },
        { 
          text: 'Responsividade foi definida se aplicável', 
          standards: ['ISO9001'],
          explanation: 'Se a aplicação será usada em diferentes dispositivos, mostre como cada tela se adapta nos breakpoints principais.',
          example: 'Ex: Criar artboards separados: Desktop (1440px), Tablet (768px), Mobile (375px) com adaptações de layout.'
        },
      ],
      notes:
        'Foco nas telas core. Estados de erro, loading e edge cases são tratados na Sessão 03.',
    },

    '03': {
      id: '03',
      name: 'Estados, Erros & Feedback',
      purpose:
        'Prevenir exposição acidental de dados e garantir que o sistema comunique seu estado de forma segura.',
      whatToDesign: [
        { 
          text: 'Estados de carregamento (loading, skeleton)', 
          type: 'design', 
          standards: ['ISO9001'],
          explanation: 'Feedback visual enquanto dados estão sendo carregados. Skeleton = placeholder que imita a estrutura do conteúdo final.',
          example: 'Ex: Spinner simples, barra de progresso, ou skeleton screen com blocos cinzas no formato dos cards que vão aparecer.'
        },
        { 
          text: 'Estados vazios (empty states)', 
          type: 'design', 
          standards: ['ISO9001', 'ISO27001'],
          explanation: 'Tela mostrada quando não há dados para exibir. Deve orientar o usuário sobre o que fazer a seguir, sem revelar informação sensível.',
          example: 'Ex: "Nenhum projeto encontrado. Crie seu primeiro projeto!" (com ilustração + CTA). Evite: "Você não tem permissão para ver projetos" (revela existência)'
        },
        { 
          text: 'Mensagens de erro (validação, permissão, sistema)', 
          type: 'list', 
          standards: ['ISO27001'],
          explanation: 'Mensagens exibidas quando algo dá errado. IMPORTANTE: Não revelar detalhes técnicos ou confirmar existência de dados privados.',
          example: 'Ex: ✅ "Email ou senha incorretos" (genérico) | ❌ "Email não encontrado" (confirma que email não existe - enumeration attack)'
        },
        { 
          text: 'Estados de sucesso e confirmação', 
          type: 'design', 
          standards: ['ISO9001'],
          explanation: 'Feedback positivo após ação bem-sucedida. Deve ser claro, breve e indicar o que aconteceu.',
          example: 'Ex: Toast verde com ícone de check: "Projeto criado com sucesso!" (desaparece em 3s) ou modal de confirmação para ações críticas.'
        },
        { 
          text: 'Feedbacks de ações do usuário (toasts, alerts)', 
          type: 'design', 
          standards: ['ISO9001'],
          explanation: 'Notificações temporárias que confirmam ações do usuário. Toasts = notificação temporária. Alerts = mensagem que requer atenção.',
          example: 'Ex: Toast: "Arquivo salvo automaticamente" (desaparece) | Alert: "Suas mudanças não foram salvas. Deseja continuar?" (requer ação)'
        },
        { 
          text: 'Estados de permissão negada', 
          type: 'design', 
          standards: ['ISO27001'],
          explanation: 'Tela/mensagem mostrada quando usuário não tem permissão. Deve ser explícita mas neutra, sem revelar detalhes do que está protegido.',
          example: 'Ex: ✅ "Você não tem permissão para acessar esta página" | ❌ "Você não pode ver o salário de João" (revela dado sensível)'
        },
      ],
      checklist: [
        { 
          text: 'Mensagens de erro não confirmam existência de dados', 
          standards: ['ISO27001'],
          explanation: 'Erros genéricos previnem enumeration attacks (testar se um recurso existe). Não diga "usuário X não existe" ou "email já cadastrado".',
          example: 'Ex: Login: ✅ "Credenciais inválidas" | ❌ "Email não encontrado" (confirma que email não está cadastrado)'
        },
        { 
          text: 'Estados vazios não inferem informação privada', 
          standards: ['ISO27001'],
          explanation: 'Empty state genérico não deve revelar POR QUE está vazio (pode ser porque não tem dados, ou porque não tem permissão).',
          example: 'Ex: ✅ "Nenhum item para exibir" | ❌ "Você não tem permissão para ver esta lista" (revela que lista existe mas está protegida)'
        },
        { 
          text: 'Estados de permissão são explícitos e neutros', 
          standards: ['ISO27001'],
          explanation: 'Deixe claro que é questão de permissão, mas não revele detalhes sobre o conteúdo protegido ou quem tem acesso.',
          example: 'Ex: ✅ "Acesso restrito. Contate o administrador" | ❌ "Apenas gerentes podem acessar" (revela hierarquia/conteúdo)'
        },
        { 
          text: 'Detalhes técnicos não são expostos ao usuário', 
          standards: ['ISO27001'],
          explanation: 'Erros técnicos (stack traces, queries SQL, paths) revelam estrutura do sistema e facilitam ataques. Mostre mensagem genérica + log detalhes internamente.',
          example: 'Ex: ✅ "Algo deu errado. Tente novamente" | ❌ "Error: SELECT * FROM users WHERE id=123 failed" (revela estrutura DB)'
        },
        { 
          text: 'Feedbacks são claros e acionáveis', 
          standards: ['ISO9001'],
          explanation: 'Usuário deve entender o que aconteceu e o que fazer a seguir. Evite mensagens vagas.',
          example: 'Ex: ✅ "Email inválido. Use formato: nome@exemplo.com" | ❌ "Erro de validação" (o que validar?)'
        },
        { 
          text: 'Loading states previnem timeout perception', 
          standards: ['ISO9001'],
          explanation: 'Feedback visual evita que usuário ache que o sistema travou. Para operações lentas (>2s), mostre progresso ou estimativa.',
          example: 'Ex: Operação rápida (<2s): spinner simples | Operação lenta: "Processando... 45% completo" ou skeleton screen'
        },
      ],
      notes:
        'Segurança através de feedback: mensagens genéricas para prevenir enumeration attacks.',
    },

    '04': {
      id: '04',
      name: 'Ações Sensíveis',
      purpose:
        'Garantir que ações críticas tenham confirmação adequada, sejam auditáveis e reversíveis quando possível.',
      whatToDesign: [
        { 
          text: 'Fluxos de confirmação para ações destrutivas', 
          type: 'flow', 
          standards: ['ISO27001'],
          explanation: 'Fluxo passo-a-passo para ações irreversíveis ou de alto impacto. Deve incluir preview do que será afetado, confirmação explícita, e resultado final.',
          example: 'Ex: Deletar Projeto → Modal: "Tem certeza? Projeto X será deletado permanentemente" → [Digitar nome para confirmar] → Botão "Deletar" → Confirmação: "Projeto deletado"'
        },
        { 
          text: 'Diálogos de confirmação com preview de impacto', 
          type: 'design', 
          standards: ['ISO27001'],
          explanation: 'Modal/dialog que mostra ANTES da ação: o que será afetado, quantos itens, consequências irreversíveis. Usuário precisa ver o impacto completo.',
          example: 'Ex: "Você está removendo acesso de 23 usuários ao Projeto X. Eles perderão acesso imediatamente e não poderão mais visualizar documentos."'
        },
        { 
          text: 'Logs ou histórico de ações sensíveis (se aplicável)', 
          type: 'document', 
          standards: ['ISO27001'],
          explanation: 'Registro auditável de quem fez o quê, quando e em qual contexto. Essencial para compliance e investigação de incidentes.',
          example: 'Ex: "João Silva deletou Projeto X em 07/01/2026 15:30" | "Ana Costa alterou permissões de 5 usuários em 06/01/2026 10:15"'
        },
        { 
          text: 'Mecanismos de undo quando possível', 
          type: 'design', 
          standards: ['ISO27001'],
          explanation: 'Permitir reverter ação por um período (ex: 30s após delete). Reduz ansiedade e erros acidentais. Quando undo não é possível, deixar claro.',
          example: 'Ex: Toast: "Email deletado. [Desfazer]" (30s) | Ou: "Transação processada (não reversível)" quando undo não é opção'
        },
        { 
          text: 'Validações e gates antes de ações críticas', 
          type: 'list', 
          standards: ['ISO27001'],
          explanation: 'Barreiras que impedem ação acidental: digitar nome do recurso, resolver CAPTCHA, confirmar via email, esperar countdown, etc.',
          example: 'Ex: Para deletar projeto: [Digitar "DELETAR PROJETO X"] + [Checkbox: "Entendo que é irreversível"] + [Botão ativo após 5s]'
        },
        scopeData.hasPermissionManagement
          ? { 
              text: 'Interface de gestão de permissões com preview de mudanças', 
              type: 'interface', 
              standards: ['ISO27001'],
              explanation: 'Tela que mostra permissões ATUAIS vs. NOVAS antes de aplicar. Destaque para mudanças críticas (ex: remoção de admin).',
              example: 'Ex: Tabela com colunas: [Usuário | Permissão Atual: Admin | Nova Permissão: Viewer] com highlight vermelho em downgrades'
            }
          : '',
        scopeData.hasFinancial
          ? { 
              text: 'Confirmação em duas etapas para transações financeiras', 
              type: 'design', 
              standards: ['ISO27001'],
              explanation: 'Transações financeiras requerem confirmação adicional: 2FA, código SMS, aprovação por segundo usuário, etc. Nunca single-click.',
              example: 'Ex: Transferir $5.000 → Preview com detalhes → Código SMS enviado → [Digitar código] → Confirmação final → Comprovante'
            }
          : '',
      ].filter((item) => item !== ''),
      checklist: [
        { 
          text: 'Ações destrutivas requerem confirmação explícita', 
          standards: ['ISO27001'],
          explanation: 'Nunca permita delete/revoke/purge com single-click. Sempre exija confirmação consciente do usuário.',
          example: 'Ex: Deletar arquivo → Modal: "Confirma exclusão?" → Botão "Sim, deletar" (não apenas "OK")'
        },
        { 
          text: 'Impacto da ação é previamente comunicado', 
          standards: ['ISO27001'],
          explanation: 'Antes de confirmar, usuário vê: quantos itens afetados, quem será impactado, o que será perdido, se é reversível.',
          example: 'Ex: "Remover 15 usuários do time Marketing. Eles perderão acesso em 30 minutos. Ação reversível por 7 dias."'
        },
        { 
          text: 'Usuário pode revisar antes de confirmar', 
          standards: ['ISO27001'],
          explanation: 'Modal/página de confirmação deve mostrar todos os detalhes relevantes: nomes, IDs, quantidades, timestamps.',
          example: 'Ex: Antes de deletar: listar nomes dos 5 projetos que serão deletados, não apenas "5 projetos serão deletados"'
        },
        { 
          text: 'Confirmação não pode ser acidental (double confirmation)', 
          standards: ['ISO27001'],
          explanation: 'Evite "confirm fatigue": botão de confirmação deve ter label claro, cor destrutiva (vermelho), e idealmente uma barreira adicional.',
          example: 'Ex: Para ação crítica: [Checkbox: "Entendo o impacto"] + Botão "Deletar Permanentemente" (vermelho, só ativa com checkbox)'
        },
        scopeData.hasPermissionManagement
          ? { 
              text: 'Mudanças de permissão mostram preview do impacto', 
              standards: ['ISO27001'],
              explanation: 'Antes de alterar permissões, mostrar o que mudará: quem ganha/perde acesso, a quais recursos, e potenciais riscos.',
              example: 'Ex: "Ana perderá acesso de Admin → Viewer. Ela não poderá mais: [editar projetos, adicionar usuários, ver relatórios financeiros]"'
            }
          : '',
        scopeData.hasFinancial
          ? { 
              text: 'Transações financeiras têm validação em duas etapas', 
              standards: ['ISO27001'],
              explanation: 'Dinheiro real exige 2FA, código SMS, biometria, ou aprovação secundária. Nunca confiar apenas em sessão logada.',
              example: 'Ex: Transferência → Preview → Código SMS → [Digitar código] → Executar | Ou: Pagamento → Aprovar via app mobile com biometria'
            }
          : '',
        { 
          text: 'Ações são auditáveis (timestamp, autor)', 
          standards: ['ISO27001'],
          explanation: 'Sistema deve registrar quem executou ação sensível, quando, de onde (IP), e contexto. Para compliance e investigação.',
          example: 'Ex: Log: "usuário: joao@empresa.com | ação: DELETE_PROJECT | projeto_id: 456 | timestamp: 2026-01-07 15:30 UTC | ip: 192.168.1.1"'
        },
      ].filter((item) => item !== ''),
      notes:
        'Ações sensíveis incluem: delete, revoke, permission change, financial transactions, bulk operations.',
    },

    '05': {
      id: '05',
      name: 'Privacidade & Consentimento',
      purpose:
        'Garantir conformidade com LGPD/GDPR e dar controle ao usuário sobre seus dados.',
      whatToDesign: [
        { 
          text: 'Fluxo de consentimento para coleta de dados', 
          type: 'flow', 
          standards: ['ISO27701'],
          explanation: 'Fluxo que explica quais dados serão coletados, por quê e por quanto tempo. Usuário deve consentir ANTES da coleta. Deve ser possível recusar.',
          example: 'Ex: Cadastro → Modal: "Coletaremos [email, nome] para [enviar newsletter]. Armazenado por [2 anos]" → [Aceitar] [Recusar]'
        },
        { 
          text: 'Mecanismos de mascaramento de dados sensíveis', 
          type: 'design', 
          standards: ['ISO27701', 'ISO27001'],
          explanation: 'Dados sensíveis (CPF, senha, cartão, salário) devem aparecer mascarados por padrão. Revelar apenas com ação explícita do usuário.',
          example: 'Ex: CPF: ***.***.789-01 [👁️ Mostrar] | Cartão: **** **** **** 4532 | Senha: ••••••••'
        },
        { 
          text: 'Controles de visibilidade de dados pessoais', 
          type: 'design', 
          standards: ['ISO27701'],
          explanation: 'Interface que permite usuário controlar quem vê seus dados pessoais: público, apenas amigos, privado, etc.',
          example: 'Ex: Configurações de Privacidade → [Email: Apenas eu] [Telefone: Amigos] [Foto: Público] com toggles ou dropdowns'
        },
        { 
          text: 'Interface de gestão de consentimentos', 
          type: 'interface', 
          standards: ['ISO27701'],
          explanation: 'Tela onde usuário vê todos os consentimentos ativos e pode revogar individualmente. Lista o que foi consentido, quando e para qual finalidade.',
          example: 'Ex: Meus Consentimentos: [✓ Marketing por email (01/2026) - Revogar] [✓ Análise de uso (12/2025) - Revogar] [✗ Cookies de ads - Conceder]'
        },
        { 
          text: 'Explicação de uso de dados (privacy labels)', 
          type: 'document', 
          standards: ['ISO27701'],
          explanation: 'Labels curtos e visuais (estilo Apple) que explicam como dados são usados: coletados, compartilhados, armazenados, etc.',
          example: 'Ex: 📍 Localização: [Coletada: Sim] [Compartilhada: Não] [Finalidade: Sugerir locais próximos] [Retenção: 30 dias]'
        },
        scopeData.dataInvolved === 'sensitive'
          ? { 
              text: 'Fluxo de consentimento explícito para dados sensíveis', 
              type: 'flow', 
              standards: ['ISO27701'],
              explanation: 'Dados sensíveis (raça, religião, saúde, orientação sexual) exigem consentimento EXPLÍCITO e separado. Não pode ser implícito ou bundled.',
              example: 'Ex: "Para processar exame médico, precisamos coletar [dados de saúde]. Você consente explicitamente?" → Checkbox: "Sim, autorizo" (não pré-marcado)'
            }
          : '',
        scopeData.hasExportCapability
          ? { 
              text: 'Preview de dados antes de exportação', 
              type: 'design', 
              standards: ['ISO27701', 'ISO27001'],
              explanation: 'Antes de exportar, mostrar EXATAMENTE quais dados serão incluídos no arquivo. Usuário deve poder remover itens sensíveis.',
              example: 'Ex: Exportar Dados → Preview: [✓ Nome] [✓ Email] [✓ Histórico de compras] [✗ CPF] [✗ Endereço] → Botão "Exportar Selecionados"'
            }
          : '',
      ].filter((item) => item !== ''),
      checklist: [
        { 
          text: 'Consentimento é solicitado antes da coleta', 
          standards: ['ISO27701'],
          explanation: 'NUNCA colete dados sem consentimento prévio. Opt-in (usuário aceita) não opt-out (usuário recusa depois).',
          example: 'Ex: ✅ "Aceita que coletemos email?" → Coletar | ❌ Coletar email e depois "clique aqui se não quiser"'
        },
        { 
          text: 'Linguagem é clara e não jurídica', 
          standards: ['ISO27701'],
          explanation: 'Evite juridiquês. Use linguagem simples, direta e compreensível para público geral (nível 8º ano de escolaridade).',
          example: 'Ex: ✅ "Usamos seu email para enviar novidades do produto" | ❌ "Processaremos seus dados conforme Art. 7º, inciso I da Lei 13.709/2018"'
        },
        { 
          text: 'Dados sensíveis são mascarados por padrão', 
          standards: ['ISO27701', 'ISO27001'],
          explanation: 'CPF, cartão, senha, salário, dados médicos devem sempre aparecer mascarados. Revelar apenas com clique explícito (e auditado).',
          example: 'Ex: ✅ CPF: ***.***.123-45 [Mostrar] | ❌ CPF: 123.456.789-01 (sempre visível)'
        },
        { 
          text: 'Usuário pode revogar consentimento facilmente', 
          standards: ['ISO27701'],
          explanation: 'Revogar deve ser tão fácil quanto consentir. Não pode exigir email para suporte ou processos complicados.',
          example: 'Ex: ✅ Configurações → Consentimentos → Botão "Revogar" | ❌ "Envie email para privacidade@empresa.com solicitando revogação"'
        },
        { 
          text: 'Finalidade do uso dos dados é explícita', 
          standards: ['ISO27701'],
          explanation: 'Usuário deve saber EXATAMENTE para que seus dados serão usados. Não use termos genéricos como "melhorar a experiência".',
          example: 'Ex: ✅ "Email usado para: notificações de pedido, recuperação de senha" | ❌ "Email usado para melhorar nossos serviços"'
        },
        scopeData.dataInvolved === 'sensitive'
          ? { 
              text: 'Consentimento explícito para cada tipo de dado sensível', 
              standards: ['ISO27701'],
              explanation: 'Cada categoria de dado sensível precisa consentimento separado. Não pode agrupar "dados sensíveis" genericamente.',
              example: 'Ex: ✅ [Checkbox: Dados de saúde] [Checkbox: Orientação sexual] separados | ❌ [Checkbox: Todos os dados sensíveis] único'
            }
          : '',
        { 
          text: 'Não há consent fatigue (bundling de consentimentos)', 
          standards: ['ISO27701'],
          explanation: 'Não agrupe múltiplos consentimentos em um único aceite. Usuário deve poder aceitar/recusar individualmente.',
          example: 'Ex: ✅ [Marketing: Aceitar/Recusar] [Analytics: Aceitar/Recusar] separados | ❌ "Aceito tudo" (bundled)'
        },
      ].filter((item) => item !== ''),
      notes:
        'Consentimento deve ser granular, específico e revogável. Não usar dark patterns.',
    },

    '06': {
      id: '06',
      name: 'Compartilhamento & Exportação',
      purpose:
        'Prevenir vazamento de dados através de controles explícitos de compartilhamento e exportação.',
      whatToDesign: [
        { 
          text: 'Interface de compartilhamento com seletor de permissões', 
          type: 'interface', 
          standards: ['ISO27001'],
          explanation: 'Tela onde usuário escolhe COM QUEM compartilhar e QUAIS PERMISSÕES dar. Deve ser explícito: view, edit, admin, etc. Sem "compartilhar tudo".',
          example: 'Ex: Modal "Compartilhar Projeto" → [Email: ana@empresa.com] → Dropdown: [Visualizar | Comentar | Editar | Admin] → [Compartilhar]'
        },
        { 
          text: 'Preview de dados antes de compartilhar/exportar', 
          type: 'design', 
          standards: ['ISO27001'],
          explanation: 'Mostrar EXATAMENTE o que será compartilhado/exportado ANTES da ação. Usuário deve ver lista de itens, campos, arquivos incluídos.',
          example: 'Ex: "Você está compartilhando: [Nome do projeto, 15 tarefas, 3 arquivos]. Não incluído: [Comentários privados, Dados financeiros]"'
        },
        { 
          text: 'Controles de expiração de links compartilhados', 
          type: 'design', 
          standards: ['ISO27001'],
          explanation: 'Links compartilhados devem ter data de expiração configurável. Após expirar, link não funciona mais. Reduz janela de exposição.',
          example: 'Ex: Compartilhar link → [Expira em: 7 dias | 30 dias | 90 dias | Nunca] → [Gerar link]. Ou: "Link expira em: 06/02/2026"'
        },
        { 
          text: 'Indicadores visuais de dados compartilhados', 
          type: 'design', 
          standards: ['ISO27001'],
          explanation: 'Badge/ícone que mostra claramente quando um item está compartilhado, com quem e com quais permissões. Awareness visual.',
          example: 'Ex: Card de Projeto com badge "🔗 Compartilhado com 3 pessoas" | Ícone de cadeado aberto | Badge "Público" em vermelho'
        },
        { 
          text: 'Revogação de compartilhamentos ativos', 
          type: 'design', 
          standards: ['ISO27001'],
          explanation: 'Interface que lista TODOS compartilhamentos ativos e permite revogar acesso imediatamente. Usuário deve ter controle total.',
          example: 'Ex: Tela "Acessos Ativos": [Ana (Editora) - Revogar] [Link público (expira 10/01) - Revogar] [João (Viewer) - Revogar]'
        },
        { 
          text: 'Formatos e conteúdo de exportação', 
          type: 'list', 
          standards: ['ISO27001'],
          explanation: 'Especificação clara de quais formatos são suportados (CSV, JSON, PDF) e O QUE cada formato contém. Usuário precisa saber o que vai no arquivo.',
          example: 'Ex: Exportar → [CSV: apenas dados tabulares, sem anexos] [PDF: relatório formatado com gráficos] [JSON: estrutura completa com metadados]'
        },
        scopeData.accessModel === 'shared'
          ? { 
              text: 'Gestão de links compartilhados (listar, revogar, expirar)', 
              type: 'interface', 
              standards: ['ISO27001'],
              explanation: 'Dashboard centralizado de TODOS os links compartilhados. Mostrar: quando criado, quantas vezes acessado, quando expira, opção de revogar.',
              example: 'Ex: Meus Links: [Link #1 (15 acessos, expira 10/01) - Renovar/Revogar] [Link #2 (2 acessos, sem expiração) - Adicionar expiração/Revogar]'
            }
          : '',
      ].filter((item) => item !== ''),
      checklist: [
        { 
          text: 'Usuário visualiza dados antes de compartilhar/exportar', 
          standards: ['ISO27001'],
          explanation: 'NUNCA compartilhe/exporte sem preview. Usuário pode compartilhar acidentalmente dados sensíveis sem perceber.',
          example: 'Ex: ✅ Preview: "15 tarefas, incluindo 2 com tag CONFIDENCIAL" → checkbox "Incluir confidenciais?" | ❌ Botão "Exportar tudo" direto'
        },
        { 
          text: 'Permissões de compartilhamento são explícitas', 
          standards: ['ISO27001'],
          explanation: 'Evite termos ambíguos. Use labels claros: "Visualizar" (só lê), "Editar" (modifica), "Admin" (full control). Não use "Acesso total".',
          example: 'Ex: ✅ [Visualizar | Comentar | Editar | Proprietário] explícito | ❌ [Acesso Básico | Acesso Avançado] vago'
        },
        { 
          text: 'Links compartilhados têm opção de expiração', 
          standards: ['ISO27001'],
          explanation: 'Sempre oferecer expiração. Default deve ser limitado (ex: 30 dias), não "nunca expira". Reduz risco de links antigos vazados.',
          example: 'Ex: ✅ Default: 30 dias + opção de customizar | ❌ Default: nunca expira (usuário precisa ativamente escolher expiração)'
        },
        { 
          text: 'Usuário pode ver todos os compartilhamentos ativos', 
          standards: ['ISO27001'],
          explanation: 'Transparência total: lista de quem tem acesso, desde quando, com quais permissões. Usuário não pode ter "acessos fantasmas".',
          example: 'Ex: Tela "Quem tem acesso" lista: [Ana Costa (Editora, desde 01/01/2026)] [Link público (3 acessos, criado 05/01/2026)]'
        },
        { 
          text: 'Revogação de acesso é imediata e visível', 
          standards: ['ISO27001'],
          explanation: 'Ao revogar, efeito é imediato (não "em até 24h"). Usuário vê confirmação clara. Link para de funcionar instantaneamente.',
          example: 'Ex: Clicar "Revogar" → Toast: "Acesso de Ana revogado. Ela não pode mais visualizar o projeto" (imediato)'
        },
        { 
          text: 'Exportação não inclui dados que o usuário não vê', 
          standards: ['ISO27001'],
          explanation: 'Respeite permissões: se usuário não tem acesso a um campo na UI, esse campo NÃO pode aparecer no export. Previne vazamento lateral.',
          example: 'Ex: Usuário sem permissão para "Salário" → Exportar CSV → Coluna "Salário" não existe no arquivo (não mascarada, ausente)'
        },
        scopeData.dataInvolved !== 'none'
          ? { 
              text: 'Dados sensíveis têm controles adicionais', 
              standards: ['ISO27001'],
              explanation: 'Dados sensíveis devem ter warning adicional ao compartilhar/exportar. Confirmar: "Tem certeza? Inclui dados sensíveis".',
              example: 'Ex: Exportar com CPF/Saúde → Modal: "⚠️ Arquivo contém dados sensíveis: [CPF, dados de saúde]. Confirma exportação?" → [Sim, exportar]'
            }
          : '',
      ].filter((item) => item !== ''),
      notes:
        'Compartilhamento é uma superfície de risco: cada share é uma potencial exposição.',
    },

    '07': {
      id: '07',
      name: 'Revisão de Segurança & Privacidade',
      purpose:
        'Validar que o design implementa princípios de Security-by-Design e Privacy-by-Design.',
      whatToDesign: [
        { 
          text: 'Documento de revisão com findings e recomendações', 
          type: 'document', 
          standards: ['ISO27001'],
          explanation: 'Relatório estruturado listando todos os pontos de atenção encontrados, severidade (crítica, alta, média, baixa) e recomendações de correção.',
          example: 'Ex: "CRÍTICO: CPF exposto sem mascaramento na tela de perfil → Recomendação: Implementar mascaramento ***.***.123-45" | "MÉDIA: Mensagem de erro verbosa"'
        },
        { 
          text: 'Mapeamento de fluxo de dados pessoais', 
          type: 'diagram', 
          standards: ['ISO27001'],
          explanation: 'Diagrama mostrando origem, processamento, armazenamento e destino de dados pessoais. Essencial para LGPD/GDPR compliance.',
          example: 'Ex: [Formulário cadastro] → [Backend API] → [Database criptografado] → [Email marketing service] com labels de tipo de dado em cada etapa'
        },
        { 
          text: 'Análise de surface de ataque (pontos de exposição)', 
          type: 'document', 
          standards: ['ISO27001'],
          explanation: 'Identificar todas as superfícies onde dados podem vazar: campos de input, URLs, exports, compartilhamentos, logs, errors.',
          example: 'Ex: Superfícies identificadas: [Input de busca (SQL injection?), URL com user_id (IDOR?), Export CSV (acesso não autorizado?), Error messages (info disclosure?)]'
        },
        { 
          text: 'Validação de princípios OWASP se aplicável', 
          type: 'list', 
          standards: ['ISO27001'],
          explanation: 'Checklist baseado em OWASP Top 10: injection, broken auth, sensitive data exposure, XXE, broken access control, security misconfiguration, XSS, insecure deserialization, etc.',
          example: 'Ex: ✅ Inputs validados (anti-injection) | ✅ Auth com token expire | ❌ Dados sensíveis em URL | ✅ RBAC implementado | ⚠️ Error messages verbosas'
        },
        riskAssessment.riskLabel === 'high'
          ? { 
              text: 'Threat modeling específico do feature', 
              type: 'document', 
              standards: ['ISO27001'],
              explanation: 'Análise estruturada de ameaças usando STRIDE (Spoofing, Tampering, Repudiation, Info Disclosure, DoS, Elevation of Privilege). Para features de alto risco.',
              example: 'Ex: Spoofing: "Atacante pode se passar por admin?" | Info Disclosure: "Logs expõem PII?" | Elevation: "User pode escalar para admin?"'
            }
          : '',
        scopeData.dataInvolved === 'sensitive'
          ? { 
              text: 'Data flow diagram com classificação de dados', 
              type: 'diagram', 
              standards: ['ISO27001'],
              explanation: 'Diagrama detalhado mostrando dados sensíveis (saúde, raça, religião, orientação sexual) e como são processados, com classificação de sensibilidade.',
              example: 'Ex: [Form saúde: SENSÍVEL-ALTA] → [API encryption: TLS 1.3] → [DB: encrypted-at-rest, SENSÍVEL-ALTA] → [Backup: encrypted, retention 90d]'
            }
          : '',
      ].filter((item) => item !== ''),
      checklist: [
        { 
          text: 'Dados sensíveis estão mascarados por padrão', 
          standards: ['ISO27001'],
          explanation: 'CPF, cartão, senha, salário, dados médicos nunca visíveis por padrão. Revelar apenas com ação explícita do usuário auditada.',
          example: 'Ex: ✅ CPF: ***.***.789-01 [Mostrar] | ❌ CPF: 123.456.789-01 (sempre visível) | ✅ Cartão: **** **** **** 4532'
        },
        { 
          text: 'Mensagens de erro não revelam informações', 
          standards: ['ISO27001'],
          explanation: 'Errors genéricos previnem enumeration attacks e info disclosure. Nunca revelar: stack traces, paths, DB queries, existência de recursos.',
          example: 'Ex: ✅ "Credenciais inválidas" | ❌ "Usuário não encontrado" (enumeration) | ❌ "Error: SELECT * FROM..." (SQL disclosure)'
        },
        { 
          text: 'Permissões seguem princípio do menor privilégio', 
          standards: ['ISO27001'],
          explanation: 'Usuário recebe APENAS as permissões mínimas necessárias para sua função. Não dar "admin" por padrão ou "acesso total" sem justificativa.',
          example: 'Ex: ✅ Viewer = só leitura | Editor = leitura + escrita em seus recursos | Admin = full control | ❌ Todos têm "acesso total" por padrão'
        },
        { 
          text: 'Não há exposição de dados em URLs ou logs', 
          standards: ['ISO27001'],
          explanation: 'URLs não devem conter dados sensíveis (aparecem em browser history, server logs). Use POST para dados sensíveis, não GET.',
          example: 'Ex: ✅ POST /api/login {email, password} | ❌ GET /api/login?email=x&password=y (fica em logs) | ✅ /project/abc123 | ❌ /project?name=Confidential'
        },
        { 
          text: 'Ações críticas têm confirmação', 
          standards: ['ISO27001'],
          explanation: 'Delete, revoke, permission change, financial transactions sempre exigem confirmação explícita. Nunca single-click.',
          example: 'Ex: ✅ Deletar → Modal: "Tem certeza?" → [Digitar nome] → Confirmar | ❌ Botão "Deletar" executa imediatamente sem confirmação'
        },
        { 
          text: 'Consentimento está implementado onde necessário', 
          standards: ['ISO27001'],
          explanation: 'LGPD/GDPR exige consentimento antes de coletar dados pessoais. Opt-in (não opt-out), granular (não bundled), revogável.',
          example: 'Ex: ✅ Checkbox "Aceito receber emails" (desmarcado por padrão) | ❌ Checkbox "Não quero emails" (opt-out) | ✅ Revogação em 1 clique'
        },
        riskAssessment.riskLabel === 'high'
          ? { 
              text: 'Threat model foi revisado e mitigado', 
              standards: ['ISO27001'],
              explanation: 'Para features de alto risco, threat model STRIDE completo deve ser feito e cada ameaça identificada precisa ter mitigação documentada.',
              example: 'Ex: Ameaça: "Usuário acessa dados de outro via IDOR" → Mitigação: "Validar ownership em cada request + audit log" → Status: ✅ Implementado'
            }
          : '',
        scopeData.hasPermissionManagement
          ? { 
              text: 'RBAC está consistente e testável', 
              standards: ['ISO27001'],
              explanation: 'Role-Based Access Control deve ter roles claros, permissões bem definidas, e ser testável (matriz de quem pode fazer o quê).',
              example: 'Ex: Matriz de permissões: [Viewer: read] [Editor: read+write own] [Admin: read+write+delete all] | Testável: "Editor não pode deletar projeto de outro"'
            }
          : '',
        scopeData.accessModel === 'public'
          ? { 
              text: 'Exposição pública foi intencionalmente aprovada', 
              standards: ['ISO27001'],
              explanation: 'Se dados são públicos, decisão deve ser consciente e documentada. Confirmar que NENHUM dado sensível está exposto publicamente.',
              example: 'Ex: ✅ Documento: "Lista de projetos públicos aprovada por PM e Legal. Confirmado que não contém PII" | ❌ Página pública sem revisão'
            }
          : '',
      ].filter((item) => item !== ''),
      notes:
        riskAssessment.riskLabel === 'high'
          ? 'Alto risco exige revisão completa e rigorosa com threat modeling.'
          : riskAssessment.riskLabel === 'medium'
            ? 'Risco médio requer revisão focada nos pontos críticos identificados.'
            : 'Revisão básica para garantir aderência aos princípios de segurança e privacidade.',
    },

    '08': {
      id: '08',
      name: 'Impacto de Mudança & Versionamento',
      purpose:
        'Avaliar o impacto da mudança em usuários existentes e definir estratégia de rollout.',
      whatToDesign: [
        { 
          text: 'Análise de breaking changes vs. backward compatible', 
          type: 'document', 
          standards: ['ISO9001'],
          explanation: 'Documento que classifica cada mudança: Breaking (quebra compatibilidade, usuário precisa reagir) vs. Backward Compatible (funciona sem ação do usuário).',
          example: 'Ex: BREAKING: \"Removemos campo Email, agora é Username\" | COMPATIBLE: \"Adicionamos filtro de data (opcional, não afeta fluxo existente)\"'
        },
        { 
          text: 'Estratégia de migração de dados existentes', 
          type: 'document', 
          standards: ['ISO9001'],
          explanation: 'Plano de como dados atuais serão transformados para novo formato. Inclui scripts de migração, validação e rollback se der errado.',
          example: 'Ex: \"Migrar 50k registros de users.email → users.username. Script: converter email em username (antes do @). Validação: checar duplicatas. Rollback: backup pré-migração\"'
        },
        { 
          text: 'Comunicação da mudança para usuários', 
          type: 'document', 
          standards: ['ISO9001'],
          explanation: 'Como e quando avisar usuários sobre mudanças: email, in-app banner, changelog, tutorial. Deve explicar IMPACTO e O QUE FAZER.',
          example: 'Ex: Email 7 dias antes: \"Em 15/01 mudaremos login. Use Username ao invés de Email. Seu username será: joao.silva\" + Tutorial in-app no primeiro login'
        },
        { 
          text: 'Plano de rollout (gradual, feature flag, big bang)', 
          type: 'document', 
          standards: ['ISO9001'],
          explanation: 'Estratégia de lançamento: Big Bang (todos de uma vez), Gradual (% crescente), Feature Flag (ativa/desativa por grupo), Blue-Green (paralelo).',
          example: 'Ex: Rollout Gradual: Dia 1 = 5% usuários beta | Dia 3 = 25% se zero bugs críticos | Dia 7 = 100% se NPS > 7. Feature flag: pode reverter sem deploy'
        },
        { 
          text: 'Rollback plan se aplicável', 
          type: 'document', 
          standards: ['ISO9001'],
          explanation: 'Plano B se algo der errado: como reverter mudança rapidamente. Inclui: trigger para rollback, passos técnicos, tempo estimado, impacto na reversão.',
          example: 'Ex: Trigger: \"Taxa de erro > 5% ou NPS < 6\". Rollback: Desativar feature flag (2min) ou deploy versão anterior (15min). Dados: restaurar backup de 1h atrás'
        },
        { 
          text: `Documentação de o que mudou desde ${scopeData.previousVersion || 'versão anterior'}`, 
          type: 'document', 
          standards: ['ISO9001'],
          explanation: 'Changelog estruturado com diferenças entre versões: Added (novo), Changed (modificado), Deprecated (descontinuado), Removed (removido), Fixed (bugs corrigidos).',
          example: 'Ex: v2.0 changelog: ADDED: Filtro de data | CHANGED: Login usa username | DEPRECATED: Campo email (remover em v3.0) | REMOVED: Botão \"Exportar PDF\" | FIXED: Bug de timeout'
        },
        { 
          text: 'Identificação de features deprecadas', 
          type: 'list', 
          standards: ['ISO9001'],
          explanation: 'Lista de funcionalidades que serão descontinuadas: quando param de funcionar, alternativas disponíveis, período de transição (grace period).',
          example: 'Ex: DEPRECATED: API v1 (funciona até 01/06/2026, use API v2). Export PDF (removido, use Export CSV + conversão local). Campo \"Telefone fixo\" (opcional até 2027)'
        },
      ],
      checklist: [
        { 
          text: 'Impacto em usuários existentes foi avaliado', 
          standards: ['ISO9001'],
          explanation: 'Análise de quantos usuários são afetados, como são afetados (positivo/negativo), e qual esforço precisam fazer para se adaptar.',
          example: 'Ex: \"80% dos 10k usuários precisarão aprender novo fluxo de login (impacto médio). 20% não afetados (usam SSO). Esforço: 2min por usuário (tutorial)\"'
        },
        { 
          text: 'Breaking changes foram identificadas e justificadas', 
          standards: ['ISO9001'],
          explanation: 'Toda mudança que quebra compatibilidade deve ter justificativa clara de POR QUE é necessária (benefício supera custo de migração).',
          example: 'Ex: ✅ \"Remover suporte IE11: 0.5% usuários, economiza 40h/sprint de manutenção\" | ❌ \"Mudamos por preferência\" (sem justificativa de valor)'
        },
        { 
          text: 'Estratégia de migração está documentada', 
          standards: ['ISO9001'],
          explanation: 'Passo a passo técnico de como migrar: scripts, sequência, validações, tempo estimado, responsáveis. Deve ser executável por outra pessoa.',
          example: 'Ex: Doc migração: 1) Backup DB (30min) 2) Run script migrate_v2.sql (2h) 3) Validar com query check_migration.sql 4) Deploy novo código 5) Monitor por 24h'
        },
        { 
          text: 'Plano de comunicação está definido', 
          standards: ['ISO9001'],
          explanation: 'Definir: quem avisar (todos, subset), quando (antes, durante, depois), como (email, banner, popup), qual mensagem (impacto + ação).',
          example: 'Ex: Avisar: Todos usuários ativos | Quando: 7 dias antes + dia do lançamento | Como: Email + banner in-app | Mensagem: \"Mudança de login\" + link tutorial'
        },
        { 
          text: 'Rollback é possível ou justificada impossibilidade', 
          standards: ['ISO9001'],
          explanation: 'Se rollback é viável, documentar como. Se NÃO é possível (ex: migração de dados irreversível), justificar e ter plano alternativo (hotfix).',
          example: 'Ex: ✅ Rollback via feature flag (instantâneo) | ⚠️ Impossível: migração DB irreversível → Alternativa: hotfix prioritário + suporte 24/7 durante rollout'
        },
        { 
          text: 'Usuários não perdem dados na migração', 
          standards: ['ISO9001'],
          explanation: 'Garantia de que nenhum dado será perdido durante transição. Backup obrigatório. Validação pós-migração. Plano de recuperação se algo falhar.',
          example: 'Ex: Backup completo antes de migrar. Script de validação: count antes == count depois. Se falhar: restaurar backup + investigar + tentar novamente'
        },
        { 
          text: 'Documentação de changelog está clara', 
          standards: ['ISO9001'],
          explanation: 'Changelog deve ser compreensível para usuários finais (não apenas devs). Linguagem simples, exemplos práticos, destaque para breaking changes.',
          example: 'Ex: ✅ \"Agora você faz login com username, não email. Ex: use joao.silva ao invés de joao@empresa.com\" | ❌ \"Refatoramos AuthService para usar UID\"'
        },
      ],
      notes:
        'Mudanças não invalidam tudo: apenas sessões impactadas precisam ser reabertas.',
    },
  };

  return definitions[sessionId] || definitions['00'];
}