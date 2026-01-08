import { useEffect, useState, useRef } from 'react';
import { DesignScopeData, RiskAssessment, SessionStatus } from '../App';
import { CheckCircle2, AlertCircle, XCircle, ChevronDown, ChevronUp, FileText, AlertTriangle, Shield, Image as ImageIcon, PenTool, FileText as FileDocIcon, GitBranch, Workflow, List, Layout, Award, Info } from 'lucide-react';
import { getSessionDefinition, DeliverableType, ComplianceStandard } from '../utils/sessionDefinitions';
import { Button } from './ui/button';
import { domToPng } from 'modern-screenshot';

interface Props {
  scopeData: DesignScopeData;
  riskAssessment: RiskAssessment;
  sessions: SessionStatus[];
  setSessions: (sessions: SessionStatus[]) => void;
}

export function SessionMatrixStep({
  scopeData,
  riskAssessment,
  sessions,
  setSessions,
}: Props) {
  const [copiedImageStates, setCopiedImageStates] = useState<Record<string, boolean>>({});
  const [copiedFullMatrix, setCopiedFullMatrix] = useState(false);
  const [expandedSessions, setExpandedSessions] = useState<Record<string, boolean>>({});
  const [popoverState, setPopoverState] = useState<{ visible: boolean; x: number; y: number; content: { explanation?: string; example?: string } }>({
    visible: false,
    x: 0,
    y: 0,
    content: {}
  });
  const [standardPopoverState, setStandardPopoverState] = useState<{ 
    visible: boolean; 
    x: number; 
    y: number; 
    content: { clauses?: string; explanation?: string; standard?: string } 
  }>({
    visible: false,
    x: 0,
    y: 0,
    content: {}
  });
  const sessionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const fullMatrixRef = useRef<HTMLDivElement | null>(null);

  const handleInfoHover = (e: React.MouseEvent<HTMLDivElement>, explanation?: string, example?: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPopoverState({
      visible: true,
      x: rect.left,
      y: rect.bottom + 8,
      content: { explanation, example }
    });
  };

  const handleInfoLeave = () => {
    setPopoverState({ visible: false, x: 0, y: 0, content: {} });
  };

  const handleStandardHover = (e: React.MouseEvent<HTMLDivElement>, clauses?: string, explanation?: string, standard?: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setStandardPopoverState({
      visible: true,
      x: rect.left,
      y: rect.bottom + 8,
      content: { clauses, explanation, standard }
    });
  };

  const handleStandardLeave = () => {
    setStandardPopoverState({ visible: false, x: 0, y: 0, content: {} });
  };

  const toggleSessionExpand = (sessionId: string) => {
    setExpandedSessions(prev => ({
      ...prev,
      [sessionId]: !prev[sessionId]
    }));
  };

  // Initialize expanded sessions - all non-"not-applicable" sessions expanded by default
  useEffect(() => {
    const initialExpandedState: Record<string, boolean> = {};
    sessions.forEach(session => {
      initialExpandedState[session.id] = session.status !== 'not-applicable';
    });
    setExpandedSessions(initialExpandedState);
  }, [sessions]);

  // Helper function to get ISO compliance details for all session items
  const getStandardCompliance = (sessionId: string, itemText: string, standard: string) => {
    // Available for all sessions with popover data

    const complianceData: Record<string, { clauses: string; explanation: string }> = {
      'ISO9001_Estados de carregamento': {
        clauses: '8.2.1, 9.1.2',
        explanation: 'Feedback visual durante carregamento atende requisitos de comunicação com cliente e monitoramento de satisfação, garantindo que o usuário entenda o estado do sistema.'
      },
      'ISO9001_Estados vazios': {
        clauses: '8.2.1',
        explanation: 'Estados vazios orientam o usuário sobre próximos passos, atendendo requisitos de comunicação clara com o cliente.'
      },
      'ISO27001_Estados vazios': {
        clauses: 'A.9.4.1, A.12.4.1',
        explanation: 'Empty states genéricos previnem information disclosure (não revelam existência de recursos protegidos ou estrutura de dados), atendendo controles de restrição de acesso e proteção contra ameaças técnicas.'
      },
      'ISO27001_Mensagens de erro': {
        clauses: 'A.9.4.1, A.12.4.1, A.18.1.3',
        explanation: 'Mensagens de erro genéricas previnem enumeration attacks e information disclosure, atendendo controles de restrição de acesso, proteção de registros de log e proteção de informação pessoal.'
      },
      'ISO9001_Estados de sucesso': {
        clauses: '8.2.1, 9.1.2',
        explanation: 'Feedback positivo de sucesso garante comunicação clara com usuário sobre resultado de ações, atendendo requisitos de comunicação com cliente e monitoramento de satisfação.'
      },
      'ISO9001_Feedbacks de ações': {
        clauses: '8.2.1',
        explanation: 'Notificações temporárias confirmam ações do usuário, atendendo requisitos de comunicação efetiva com o cliente sobre status de operações.'
      },
      'ISO27001_Estados de permissão': {
        clauses: 'A.9.1.2, A.9.4.1',
        explanation: 'Estados de permissão negada explícitos mas neutros atendem requisitos de controle de acesso ao usuário e restrição de acesso à informação, sem revelar detalhes sobre recursos protegidos.'
      },
      'ISO27001_Mensagens não confirmam': {
        clauses: 'A.9.4.1, A.12.4.1',
        explanation: 'Erros genéricos implementam controle de restrição de acesso e proteção contra ameaças técnicas, prevenindo enumeration attacks que confirmam existência de recursos ou dados.'
      },
      'ISO27001_Estados vazios checklist': {
        clauses: 'A.9.4.1, A.18.1.3',
        explanation: 'Empty states genéricos atendem controles de restrição de acesso e proteção de informação pessoal, não revelando motivo da ausência de dados (falta de dados vs. falta de permissão).'
      },
      'ISO27001_Estados de permissão checklist': {
        clauses: 'A.9.1.2, A.9.4.1',
        explanation: 'Mensagens de permissão explícitas mas neutras implementam controles de acesso ao usuário e restrição de acesso, sem information disclosure sobre conteúdo protegido ou hierarquia.'
      },
      'ISO27001_Detalhes técnicos': {
        clauses: 'A.12.4.1, A.12.4.3, A.16.1.7',
        explanation: 'Mensagens de erro genéricas sem detalhes técnicos atendem controles de proteção contra ameaças técnicas, gerenciamento de vulnerabilidades e aprendizado com incidentes. Stack traces revelam estrutura do sistema e facilitam ataques.'
      },
      'ISO9001_Feedbacks são claros': {
        clauses: '8.2.1, 9.1.2',
        explanation: 'Feedbacks claros e acionáveis atendem requisitos de comunicação efetiva com cliente e monitoramento de satisfação, permitindo que usuário entenda problema e saiba como resolver.'
      },
      'ISO9001_Loading states': {
        clauses: '8.2.1, 9.1.2',
        explanation: 'Estados de carregamento adequados atendem requisitos de comunicação com cliente e monitoramento de satisfação, evitando percepção de travamento do sistema.'
      },
      
      // Session 00: Contexto & Intenção
      'ISO9001_Documento de contexto': {
        clauses: '5.1.2, 8.2.2, 8.2.3',
        explanation: 'Documentação clara do problema atende requisitos de comprometimento da liderança, determinação de requisitos de produtos/serviços e projeto/desenvolvimento. Garante entendimento comum do escopo e objetivos antes de iniciar o trabalho.'
      },
      'ISO9001_Personas ou perfis': {
        clauses: '8.2.2, 9.1.2',
        explanation: 'Identificação de usuários-alvo atende requisitos de determinação de requisitos relacionados ao cliente e monitoramento de satisfação. Garante foco nas necessidades reais dos usuários durante todo o ciclo.'
      },
      'ISO9001_Objetivos mensuráveis': {
        clauses: '6.2.1, 9.1.1, 9.1.3',
        explanation: 'Objetivos quantificáveis atendem requisitos de planejamento de objetivos da qualidade, monitoramento geral e análise crítica. Permitem avaliar se a solução entregue atende aos critérios de sucesso estabelecidos.'
      },
      'ISO9001_Premissas e restrições': {
        clauses: '6.1.1, 8.2.3, 8.3.3',
        explanation: 'Mapeamento de premissas e restrições atende requisitos de ações para riscos e oportunidades, projeto/desenvolvimento e entradas de projeto. Evita retrabalho ao esclarecer limitações desde o início.'
      },
      'ISO9001_Critérios de sucesso': {
        clauses: '8.2.3, 8.6, 9.1.2',
        explanation: 'Critérios verificáveis atendem requisitos de projeto/desenvolvimento, liberação de produtos/serviços e monitoramento de satisfação. Definem de forma objetiva quando o trabalho está completo e bem-sucedido.'
      },
      'ISO9001_Problema está documentado': {
        clauses: '5.1.2, 8.2.2',
        explanation: 'Documentação validada do problema atende requisitos de comprometimento da liderança e determinação de requisitos do cliente. Garante que todos entendem o problema antes de propor soluções.'
      },
      'ISO9001_Usuários-alvo foram identificados': {
        clauses: '8.2.2, 9.1.2',
        explanation: 'Identificação específica de usuários-alvo atende requisitos de determinação de requisitos do cliente e monitoramento de satisfação. Evita assumptions e garante foco nas necessidades reais.'
      },
      'ISO9001_Objetivos estão definidos': {
        clauses: '6.2.1, 9.1.1',
        explanation: 'Objetivos mensuráveis atendem requisitos de planejamento de objetivos da qualidade e monitoramento. Permitem avaliação objetiva de sucesso baseada em métricas, não opiniões.'
      },
      'ISO9001_Restrições técnicas ou de negócio': {
        clauses: '6.1.1, 8.2.3, 8.3.3',
        explanation: 'Mapeamento de restrições atende requisitos de ações para riscos, projeto/desenvolvimento e entradas de projeto. Previne surpresas ao esclarecer limitações técnicas, de negócio e prazos.'
      },
      'ISO9001_Alinhamento com stakeholders': {
        clauses: '5.1.2, 7.4, 8.2.1',
        explanation: 'Documentação de alinhamento com stakeholders atende requisitos de comprometimento da liderança, comunicação e comunicação com cliente. Garante que decisões foram tomadas com consenso e aprovação.'
      },
      
      // Session 01: Fluxo & Arquitetura da Informação
      'ISO9001_Mapa de navegação': {
        clauses: '8.2.3, 8.3.2, 8.3.3',
        explanation: 'Mapa de navegação atende requisitos de projeto/desenvolvimento de produtos e serviços, entradas de projeto e saídas de projeto. Estrutura hierárquica clara garante organização lógica e comunicação eficaz da arquitetura do sistema.'
      },
      'ISO9001_User flows': {
        clauses: '8.2.3, 8.3.3, 8.5.1',
        explanation: 'User flows com happy path e alternativas atendem requisitos de projeto/desenvolvimento, entradas de projeto e controle de produção. Documentar caminhos possíveis previne erros e garante cobertura de cenários críticos.'
      },
      'ISO9001_Arquitetura de informação': {
        clauses: '8.2.3, 8.3.2, 9.1.2',
        explanation: 'Hierarquia de conteúdo atende requisitos de projeto/desenvolvimento, entradas de projeto e monitoramento de satisfação. Organização lógica da informação melhora usabilidade e reduz erros do usuário.'
      },
      'ISO9001_Pontos de entrada': {
        clauses: '8.2.3, 8.3.3, 8.5.1',
        explanation: 'Definição de pontos de entrada e saída atende requisitos de projeto/desenvolvimento, entradas de projeto e controle de produção. Contexto claro previne fluxos quebrados e garante experiência consistente.'
      },
      'ISO9001_Regras de transição': {
        clauses: '8.3.3, 8.3.4, 8.5.1',
        explanation: 'Regras de transição entre estados atendem requisitos de entradas de projeto, controles de projeto e controle de produção. Condições explícitas previnem estados inválidos e comportamentos inesperados.'
      },
      'ISO9001_Fluxo principal': {
        clauses: '8.2.3, 8.3.5, 8.6',
        explanation: 'Documentação do happy path atende requisitos de projeto/desenvolvimento, saídas de projeto e liberação de produtos. Caminho ideal documentado serve como baseline para validação e testes.'
      },
      'ISO9001_Fluxos alternativos': {
        clauses: '6.1.1, 8.3.3, 8.5.1',
        explanation: 'Mapeamento de edge cases atende requisitos de ações para riscos, entradas de projeto e controle de produção. Antecipar cenários de erro previne falhas críticas e melhora robustez do sistema.'
      },
      'ISO9001_Pontos de decisão': {
        clauses: '8.3.3, 8.3.4, 8.5.1',
        explanation: 'Identificação clara de decisões atende requisitos de entradas de projeto, controles de projeto e controle de produção. Lógica condicional explícita previne comportamentos ambíguos.'
      },
      'ISO9001_Hierarquia de informação': {
        clauses: '8.2.3, 8.3.2, 9.1.2',
        explanation: 'Hierarquia visual definida atende requisitos de projeto/desenvolvimento, entradas de projeto e monitoramento de satisfação. Priorização clara melhora escaneabilidade e reduz carga cognitiva.'
      },
      'ISO9001_Navegação entre telas': {
        clauses: '8.2.3, 8.3.3, 9.1.2',
        explanation: 'Documentação de navegação atende requisitos de projeto/desenvolvimento, entradas de projeto e monitoramento de satisfação. Caminhos claros entre telas previnem usuários perdidos e melhoram fluxo de trabalho.'
      },
      
      // Session 02: UI - Telas Principais
      'ISO9001_Telas principais': {
        clauses: '8.3.2, 8.3.5, 8.6',
        explanation: 'Mockups high-fidelity ou wireframes atendem requisitos de entradas de projeto, saídas de projeto e liberação de produtos. Visualização concreta das interfaces permite validação antes da implementação.'
      },
      'ISO9001_Layout e organização': {
        clauses: '8.3.2, 8.3.3, 8.3.5',
        explanation: 'Organização visual de componentes atende requisitos de entradas de projeto, entradas de projeto e saídas de projeto. Grid systems e estrutura consistente melhoram usabilidade e manutenibilidade.'
      },
      'ISO9001_Hierarquia visual': {
        clauses: '8.2.3, 8.3.2, 9.1.2',
        explanation: 'Priorização visual de elementos atende requisitos de projeto/desenvolvimento, entradas de projeto e monitoramento de satisfação. Hierarquia clara reduz carga cognitiva e melhora eficiência do usuário.'
      },
      'ISO9001_Componentes e padrões': {
        clauses: '8.3.2, 8.3.5, 8.5.1',
        explanation: 'Uso de componentes padronizados atende requisitos de entradas de projeto, saídas de projeto e controle de produção. Design system garante consistência e acelera desenvolvimento.'
      },
      'ISO9001_Responsividade': {
        clauses: '8.2.2, 8.3.2, 9.1.2',
        explanation: 'Adaptação para múltiplos dispositivos atende requisitos de determinação de requisitos, entradas de projeto e monitoramento de satisfação. Garante experiência adequada independente do contexto de uso.'
      },
      'ISO9001_Todas as telas': {
        clauses: '8.3.5, 8.6, 8.5.1',
        explanation: 'Cobertura completa de telas principais atende requisitos de saídas de projeto, liberação de produtos e controle de produção. Previne lacunas no fluxo e garante entrega completa.'
      },
      'ISO9001_Layout está alinhado': {
        clauses: '8.3.2, 8.3.4, 8.5.1',
        explanation: 'Alinhamento com design system atende requisitos de entradas de projeto, controles de projeto e controle de produção. Consistência visual reduz curva de aprendizado e melhora reconhecimento de padrões.'
      },
      'ISO9001_Hierarquia visual está': {
        clauses: '8.3.2, 8.3.5, 9.1.2',
        explanation: 'Hierarquia visual clara atende requisitos de entradas de projeto, saídas de projeto e monitoramento de satisfação. Escaneabilidade eficaz melhora eficiência e reduz erros de interpretação.'
      },
      'ISO9001_Acessibilidade básica': {
        clauses: '8.2.2, 8.3.2, 9.1.2',
        explanation: 'Contraste e legibilidade adequados atendem requisitos de determinação de requisitos, entradas de projeto e monitoramento de satisfação. Acessibilidade garante usabilidade para todos os usuários, incluindo com limitações visuais.'
      },
      'ISO9001_Responsividade foi definida': {
        clauses: '8.2.2, 8.3.2, 8.3.5',
        explanation: 'Definição de breakpoints e adaptações atende requisitos de determinação de requisitos, entradas de projeto e saídas de projeto. Garante experiência consistente em diferentes dispositivos e contextos de uso.'
      },
      
      // Session 04: Ações Sensíveis
      'ISO27001_Fluxos de confirmação': {
        clauses: 'A.9.2.6, A.12.4.1, A.12.4.3',
        explanation: 'Confirmação para ações destrutivas atende requisitos de gerenciamento de privilégios, registro de eventos e logs de administrador. Previne execução acidental de operações críticas e garante intencionalidade.'
      },
      'ISO27001_Diálogos de confirmação': {
        clauses: 'A.9.2.6, A.12.4.1, A.18.1.4',
        explanation: 'Preview de impacto atende requisitos de gerenciamento de privilégios, registro de eventos e privacidade. Comunicação clara do escopo reduz erros e garante decisão informada.'
      },
      'ISO27001_Logs ou histórico': {
        clauses: 'A.12.4.1, A.12.4.2, A.12.4.3',
        explanation: 'Histórico de ações sensíveis atende requisitos de registro de eventos, proteção de logs e logs de administrador. Trilha de auditoria é essencial para compliance, investigação de incidentes e não-repúdio.'
      },
      'ISO27001_Mecanismos de undo': {
        clauses: 'A.9.2.6, A.12.3.1, A.16.1.5',
        explanation: 'Capacidade de reverter ações atende requisitos de gerenciamento de privilégios, backup e resposta a incidentes. Reduz impacto de erros humanos e melhora recuperabilidade.'
      },
      'ISO27001_Validações e gates': {
        clauses: 'A.9.2.2, A.9.2.6, A.9.4.2',
        explanation: 'Barreiras antes de ações críticas atendem requisitos de provisionamento de acesso, gerenciamento de privilégios e acesso seguro. Múltiplos gates previnem execução acidental ou maliciosa.'
      },
      'ISO27001_Interface de gestão': {
        clauses: 'A.9.2.1, A.9.2.5, A.12.4.1',
        explanation: 'Gestão de permissões com preview atende requisitos de registro de usuário, revisão de permissões e registro de eventos. Visualização clara previne escalações indevidas e facilita auditoria.'
      },
      'ISO27001_Confirmação em duas': {
        clauses: 'A.9.4.2, A.9.4.3, A.13.2.1',
        explanation: 'Validação dupla para transações financeiras atende requisitos de acesso seguro, sistemas de autenticação e transferência de informação. Múltiplos fatores previnem fraude e transações não autorizadas.'
      },
      'ISO27001_Ações destrutivas': {
        clauses: 'A.9.2.6, A.12.4.1, A.12.4.3',
        explanation: 'Confirmação explícita para ações destrutivas atende requisitos de gerenciamento de privilégios, registro de eventos e logs de administrador. Evita perda acidental de dados e garante intencionalidade.'
      },
      'ISO27001_Impacto da ação': {
        clauses: 'A.9.2.6, A.12.4.1, A.18.1.4',
        explanation: 'Comunicação prévia de impacto atende requisitos de gerenciamento de privilégios, registro de eventos e privacidade. Transparência sobre consequências permite decisão informada.'
      },
      'ISO27001_Usuário pode revisar': {
        clauses: 'A.9.2.6, A.12.4.1, A.18.1.4',
        explanation: 'Revisão antes de confirmar atende requisitos de gerenciamento de privilégios, registro de eventos e privacidade. Detalhamento completo previne surpresas e garante consentimento informado.'
      },
      'ISO27001_Confirmação não pode': {
        clauses: 'A.9.2.6, A.9.4.2, A.11.2.6',
        explanation: 'Prevenção de confirmação acidental atende requisitos de gerenciamento de privilégios, acesso seguro e segurança de ativos. Design consciente reduz fadiga de confirmação e mantém eficácia do controle.'
      },
      'ISO27001_Mudanças de permissão': {
        clauses: 'A.9.2.1, A.9.2.5, A.12.4.1',
        explanation: 'Preview de mudanças de permissão atende requisitos de registro de usuário, revisão de permissões e registro de eventos. Visualização de antes/depois previne escalações ou revogações indevidas.'
      },
      'ISO27001_Transações financeiras': {
        clauses: 'A.9.4.2, A.9.4.3, A.13.2.1',
        explanation: 'Validação em duas etapas para finanças atende requisitos de acesso seguro, sistemas de autenticação e transferência de informação. Autenticação multifator previne fraude e protege ativos financeiros.'
      },
      'ISO27001_Ações são auditáveis': {
        clauses: 'A.12.4.1, A.12.4.2, A.12.4.3',
        explanation: 'Auditabilidade de ações atende requisitos de registro de eventos, proteção de logs e logs de administrador. Metadados completos (quem, quando, onde, o quê) garantem rastreabilidade e não-repúdio para compliance.'
      },
      
      // Session 05: Privacidade & Consentimento
      'ISO27701_Fluxo de consentimento': {
        clauses: '7.2.1, 7.3.2, 7.4.1',
        explanation: 'Fluxo de consentimento para coleta atende requisitos de identificação de base legal, determinação de informação e obtenção de consentimento. Transparência prévia sobre coleta, finalidade e retenção é obrigatória.'
      },
      'ISO27701_Mecanismos de mascaramento': {
        clauses: '7.2.8, 7.4.7, 8.4.2',
        explanation: 'Mascaramento de dados sensíveis atende requisitos de limitação de coleta, acesso de dados e minimização de dados. Exposição controlada previne vazamento acidental e limita superfície de ataque.'
      },
      'ISO27001_Mecanismos de mascaramento': {
        clauses: 'A.9.4.1, A.13.2.1, A.18.1.4',
        explanation: 'Mascaramento atende requisitos de política de controle de acesso, transferência de informação e privacidade. Reduz risco de exposição durante visualização e compartilhamento.'
      },
      'ISO27701_Controles de visibilidade': {
        clauses: '7.2.2, 7.4.5, 8.2.2',
        explanation: 'Controles de visibilidade atendem requisitos de determinação de finalidade, acurácia e atualização e transparência. Usuário deve ter autonomia sobre exposição de dados pessoais.'
      },
      'ISO27701_Interface de gestão': {
        clauses: '7.3.1, 7.3.4, 7.3.9',
        explanation: 'Gestão de consentimentos atende requisitos de consentimento, retirada de consentimento e mecanismos de consentimento. Interface clara permite exercício de direitos de forma acessível.'
      },
      'ISO27701_Explicação de uso': {
        clauses: '7.3.2, 7.4.1, 7.4.5',
        explanation: 'Privacy labels atendem requisitos de determinação de informação, obtenção de consentimento e acurácia. Visualização simplificada melhora compreensão sobre uso de dados.'
      },
      'ISO27701_Fluxo de consentimento explícito': {
        clauses: '7.3.1, 7.3.4, 7.4.1',
        explanation: 'Consentimento explícito para dados sensíveis atende requisitos de consentimento, retirada de consentimento e obtenção de consentimento. Dados especiais exigem opt-in inequívoco e separado.'
      },
      'ISO27701_Preview de dados': {
        clauses: '7.2.8, 7.4.8, 8.4.2',
        explanation: 'Preview antes de exportação atende requisitos de limitação de coleta, portabilidade de dados e minimização. Controle granular previne exposição não intencional de dados sensíveis.'
      },
      'ISO27001_Preview de exportação': {
        clauses: 'A.13.2.1, A.13.2.3, A.18.1.4',
        explanation: 'Preview atende requisitos de transferência de informação, mensagens eletrônicas e privacidade. Validação prévia reduz vazamentos acidentais durante exportação.'
      },
      'ISO27701_Consentimento é solicitado': {
        clauses: '7.3.1, 7.3.4, 7.4.1',
        explanation: 'Consentimento prévio atende requisitos de consentimento, retirada de consentimento e obtenção de consentimento. Opt-in antes da coleta é princípio fundamental de LGPD/GDPR.'
      },
      'ISO27701_Linguagem é clara': {
        clauses: '7.3.2, 7.4.1, 7.4.5',
        explanation: 'Linguagem acessível atende requisitos de determinação de informação, obtenção de consentimento e acurácia. Clareza garante que consentimento seja verdadeiramente informado.'
      },
      'ISO27701_Dados sensíveis são': {
        clauses: '7.2.8, 7.4.7, 8.4.2',
        explanation: 'Mascaramento padrão atende requisitos de limitação de coleta, acesso de dados e minimização. Proteção automática reduz exposição acidental e facilita compliance.'
      },
      'ISO27001_Dados sensíveis são': {
        clauses: 'A.9.4.1, A.13.2.1, A.18.1.4',
        explanation: 'Mascaramento padrão atende requisitos de política de controle de acesso, transferência de informação e privacidade. Reduz superfície de ataque e previne shoulder surfing.'
      },
      'ISO27701_Usuário pode revogar': {
        clauses: '7.3.4, 7.3.9, 8.5.5',
        explanation: 'Revogação facilitada atende requisitos de retirada de consentimento, mecanismos de consentimento e objeção. Simetria entre conceder e revogar é princípio de equidade.'
      },
      'ISO27701_Finalidade do uso': {
        clauses: '7.2.2, 7.3.2, 7.4.1',
        explanation: 'Finalidade explícita atende requisitos de determinação de finalidade, determinação de informação e obtenção de consentimento. Especificidade previne uso secundário não autorizado.'
      },
      'ISO27701_Consentimento explícito para': {
        clauses: '7.3.1, 7.3.4, 7.4.1',
        explanation: 'Granularidade por categoria atende requisitos de consentimento, retirada de consentimento e obtenção de consentimento. Dados sensíveis não podem ser agrupados genericamente.'
      },
      'ISO27701_Não há consent': {
        clauses: '7.3.1, 7.3.9, 7.4.1',
        explanation: 'Prevenção de bundling atende requisitos de consentimento, mecanismos de consentimento e obtenção de consentimento. Granularidade garante autonomia real e evita dark patterns.'
      },
      
      // Session 06: Compartilhamento & Exportação
      'ISO27001_Interface de compartilhamento': {
        clauses: 'A.9.2.1, A.9.2.2, A.13.2.1',
        explanation: 'Seletor de permissões atende requisitos de registro de usuário, provisionamento de acesso e transferência de informação. Granularidade explícita previne sobre-permissionamento e vazamento acidental.'
      },
      'ISO27001_Preview de compartilhamento': {
        clauses: 'A.13.2.1, A.13.2.3, A.18.1.4',
        explanation: 'Preview antes de compartilhar/exportar atende requisitos de transferência de informação, mensagens eletrônicas e privacidade. Visibilidade completa previne exposição não intencional de dados.'
      },
      'ISO27001_Controles de expiração': {
        clauses: 'A.9.2.5, A.9.4.1, A.13.2.1',
        explanation: 'Expiração de links atende requisitos de revisão de permissões, política de controle de acesso e transferência de informação. Janela temporal limitada reduz risco de acesso não autorizado futuro.'
      },
      'ISO27001_Indicadores visuais': {
        clauses: 'A.9.4.1, A.13.2.1, A.18.1.4',
        explanation: 'Indicadores de compartilhamento atendem requisitos de política de controle de acesso, transferência de informação e privacidade. Awareness visual previne esquecimento de exposições ativas.'
      },
      'ISO27001_Revogação de compartilhamentos': {
        clauses: 'A.9.2.5, A.9.2.6, A.13.2.1',
        explanation: 'Revogação imediata atende requisitos de revisão de permissões, gerenciamento de privilégios e transferência de informação. Controle ativo permite resposta rápida a incidentes.'
      },
      'ISO27001_Formatos e conteúdo': {
        clauses: 'A.8.2.3, A.13.2.1, A.18.1.4',
        explanation: 'Especificação de formatos atende requisitos de tratamento de mídias, transferência de informação e privacidade. Transparência sobre conteúdo exportado previne vazamento inadvertido.'
      },
      'ISO27001_Gestão de links': {
        clauses: 'A.9.2.5, A.12.4.1, A.13.2.1',
        explanation: 'Dashboard de links atende requisitos de revisão de permissões, registro de eventos e transferência de informação. Visibilidade centralizada facilita auditoria e gestão de exposições.'
      },
      'ISO27001_Usuário visualiza dados': {
        clauses: 'A.13.2.1, A.13.2.3, A.18.1.4',
        explanation: 'Preview obrigatório atende requisitos de transferência de informação, mensagens eletrônicas e privacidade. Validação prévia é última linha de defesa contra vazamento acidental.'
      },
      'ISO27001_Permissões de compartilhamento': {
        clauses: 'A.9.2.1, A.9.2.2, A.9.4.1',
        explanation: 'Permissões explícitas atendem requisitos de registro de usuário, provisionamento de acesso e política de controle de acesso. Clareza terminológica previne concessões indevidas por mal-entendimento.'
      },
      'ISO27001_Links compartilhados têm': {
        clauses: 'A.9.2.5, A.9.4.1, A.13.2.1',
        explanation: 'Expiração por padrão atende requisitos de revisão de permissões, política de controle de acesso e transferência de informação. Default seguro reduz acúmulo de acessos esquecidos.'
      },
      'ISO27001_Usuário pode ver': {
        clauses: 'A.9.2.4, A.9.2.5, A.12.4.1',
        explanation: 'Listagem de acessos atende requisitos de informação de acesso, revisão de permissões e registro de eventos. Transparência total permite detecção de acessos indevidos.'
      },
      'ISO27001_Revogação de acesso': {
        clauses: 'A.9.2.5, A.9.2.6, A.16.1.2',
        explanation: 'Revogação imediata atende requisitos de revisão de permissões, gerenciamento de privilégios e reporte de incidentes. Efetividade instantânea garante contenção rápida.'
      },
      'ISO27001_Exportação não inclui': {
        clauses: 'A.9.4.1, A.9.4.4, A.13.2.1',
        explanation: 'Respeito a permissões atende requisitos de política de controle de acesso, uso de informação e transferência de informação. Consistência entre UI e export previne vazamento lateral.'
      },
      'ISO27001_Dados sensíveis têm': {
        clauses: 'A.8.2.1, A.13.2.1, A.18.1.4',
        explanation: 'Controles adicionais atendem requisitos de classificação de informação, transferência de informação e privacidade. Confirmação dupla para dados críticos reduz risco de exposição acidental.'
      },
      
      // Session 07: Revisão de Segurança & Privacidade
      'ISO27001_Documento de revisão': {
        clauses: 'A.12.1.1, A.14.2.8, A.18.2.2',
        explanation: 'Documento de findings atende requisitos de análise crítica, testes de segurança e compliance. Estrutura de severidade prioriza correções e garante rastreabilidade de riscos.'
      },
      'ISO27001_Mapeamento de fluxo': {
        clauses: 'A.8.1.1, A.18.1.4, A.18.1.5',
        explanation: 'Mapeamento de dados atende requisitos de inventário de ativos, privacidade e regulamentações de privacidade. Visibilidade completa do ciclo de vida é essencial para LGPD/GDPR.'
      },
      'ISO27001_Análise de surface': {
        clauses: 'A.12.6.1, A.14.2.1, A.14.2.8',
        explanation: 'Análise de superfície atende requisitos de gestão de vulnerabilidades, segurança em desenvolvimento e testes de segurança. Identificação proativa reduz pontos de exposição.'
      },
      'ISO27001_Validação de princípios': {
        clauses: 'A.14.1.1, A.14.2.1, A.14.2.5',
        explanation: 'Validação OWASP atende requisitos de requisitos de segurança, segurança em desenvolvimento e princípios de engenharia. Checklist estruturado garante cobertura de ameaças conhecidas.'
      },
      'ISO27001_Threat modeling específico': {
        clauses: 'A.12.6.1, A.14.1.2, A.14.2.8',
        explanation: 'Threat modeling atende requisitos de gestão de vulnerabilidades, segurança de sistemas e testes de segurança. STRIDE estruturado para alto risco garante análise sistemática de ameaças.'
      },
      'ISO27001_Data flow diagram': {
        clauses: 'A.8.1.1, A.8.2.1, A.18.1.4',
        explanation: 'Diagrama de dados sensíveis atende requisitos de inventário de ativos, classificação de informação e privacidade. Visibilidade de processamento de dados críticos é mandatória para compliance.'
      },
      'ISO27001_Dados sensíveis estão': {
        clauses: 'A.9.4.1, A.13.2.1, A.18.1.4',
        explanation: 'Mascaramento padrão atende requisitos de política de controle de acesso, transferência de informação e privacidade. Proteção automática é princípio fundamental de Privacy-by-Design.'
      },
      'ISO27001_Mensagens de erro não': {
        clauses: 'A.12.4.1, A.14.2.8, A.18.1.3',
        explanation: 'Erros genéricos atendem requisitos de registro de eventos, testes de segurança e proteção de dados. Prevenção de info disclosure é defesa contra enumeration e reconnaissance.'
      },
      'ISO27001_Permissões seguem princípio': {
        clauses: 'A.9.1.2, A.9.2.1, A.9.4.1',
        explanation: 'Menor privilégio atende requisitos de política de acesso, registro de usuário e política de controle de acesso. Minimização de permissões reduz impacto de comprometimento de conta.'
      },
      'ISO27001_Não há exposição': {
        clauses: 'A.13.2.1, A.18.1.3, A.18.1.4',
        explanation: 'Proteção em URLs/logs atende requisitos de transferência de informação, proteção de dados e privacidade. Dados em URLs são facilmente vazados via history, referrers e logs.'
      },
      'ISO27001_Ações críticas têm': {
        clauses: 'A.9.2.6, A.9.4.2, A.12.4.1',
        explanation: 'Confirmação obrigatória atende requisitos de gerenciamento de privilégios, acesso seguro e registro de eventos. Prevenção de ações acidentais é controle básico de segurança.'
      },
      'ISO27001_Consentimento está implementado': {
        clauses: 'A.18.1.4, A.18.1.5, A.18.2.2',
        explanation: 'Implementação de consentimento atende requisitos de privacidade, regulamentações de privacidade e compliance. LGPD/GDPR exige consentimento prévio, granular e revogável.'
      },
      'ISO27001_Threat model foi': {
        clauses: 'A.12.6.1, A.14.1.2, A.16.1.4',
        explanation: 'Revisão de threat model atende requisitos de gestão de vulnerabilidades, segurança de sistemas e assessment de incidentes. Alto risco exige análise sistemática e mitigação documentada.'
      },
      'ISO27001_RBAC está consistente': {
        clauses: 'A.9.1.2, A.9.2.1, A.9.4.1',
        explanation: 'Consistência de RBAC atende requisitos de política de acesso, registro de usuário e política de controle de acesso. Matriz testável previne privilege escalation e acessos indevidos.'
      },
      'ISO27001_Exposição pública foi': {
        clauses: 'A.8.2.1, A.13.2.1, A.18.1.4',
        explanation: 'Aprovação de exposição pública atende requisitos de classificação de informação, transferência de informação e privacidade. Decisão consciente e documentada previne vazamento acidental.'
      },
      
      // Session 08: Impacto de Mudança & Versionamento
      'ISO9001_Análise de breaking': {
        clauses: '8.2.3, 8.5.6, 9.1.2',
        explanation: 'Classificação de mudanças atende requisitos de análise crítica de requisitos, controle de mudanças e avaliação de desempenho. Identificação de breaking changes previne falhas de serviço e insatisfação.'
      },
      'ISO9001_Estratégia de migração': {
        clauses: '8.1, 8.5.1, 8.5.6',
        explanation: 'Planejamento de migração atende requisitos de planejamento operacional, controle de produção e controle de mudanças. Estratégia estruturada garante integridade de dados e continuidade.'
      },
      'ISO9001_Comunicação da mudança': {
        clauses: '7.4, 8.2.1, 9.1.2',
        explanation: 'Comunicação estruturada atende requisitos de comunicação, comunicação com cliente e avaliação de desempenho. Transparência prévia reduz resistência e aumenta adoção.'
      },
      'ISO9001_Plano de rollout': {
        clauses: '8.1, 8.5.1, 8.5.6',
        explanation: 'Estratégia de rollout atende requisitos de planejamento operacional, controle de produção e controle de mudanças. Implantação gradual reduz risco de falhas em larga escala.'
      },
      'ISO9001_Rollback plan se': {
        clauses: '8.5.1, 8.5.6, 10.1',
        explanation: 'Plano de reversão atende requisitos de controle de produção, controle de mudanças e melhoria contínua. Capacidade de rollback rápido minimiza impacto de falhas críticas.'
      },
      'ISO9001_Documentação de o': {
        clauses: '7.5.3, 8.2.3, 10.2',
        explanation: 'Changelog estruturado atende requisitos de controle de informação documentada, análise crítica de requisitos e não conformidade. Rastreabilidade de mudanças facilita debugging e auditoria.'
      },
      'ISO9001_Identificação de features': {
        clauses: '7.4, 8.2.1, 8.5.6',
        explanation: 'Gestão de deprecation atende requisitos de comunicação, comunicação com cliente e controle de mudanças. Grace period adequado permite adaptação sem interrupção abrupta.'
      },
      'ISO9001_Impacto em usuários': {
        clauses: '5.1.2, 8.2.2, 9.1.2',
        explanation: 'Avaliação de impacto atende requisitos de foco no cliente, determinação de requisitos e avaliação de desempenho. Análise quantitativa de afetados direciona priorização de suporte.'
      },
      'ISO9001_Breaking changes foram': {
        clauses: '8.2.3, 8.5.6, 10.2',
        explanation: 'Justificativa de breaking changes atende requisitos de análise crítica de requisitos, controle de mudanças e não conformidade. Custo-benefício claro garante decisões embasadas.'
      },
      'ISO9001_Estratégia de migração está': {
        clauses: '7.5.1, 8.1, 8.5.1',
        explanation: 'Documentação executável atende requisitos de informação documentada, planejamento operacional e controle de produção. Procedimento detalhado garante execução consistente e auditável.'
      },
      'ISO9001_Plano de comunicação': {
        clauses: '7.4, 8.2.1, 9.3',
        explanation: 'Plano estruturado atende requisitos de comunicação, comunicação com cliente e análise crítica pela direção. Segmentação de audiência e timing adequados maximizam efetividade.'
      },
      'ISO9001_Rollback é possível': {
        clauses: '8.5.1, 8.5.6, 10.1',
        explanation: 'Viabilidade de rollback atende requisitos de controle de produção, controle de mudanças e melhoria contínua. Alternativas documentadas para casos irreversíveis garantem gestão de risco.'
      },
      'ISO9001_Usuários não perdem': {
        clauses: '8.5.1, 8.5.2, 9.1.1',
        explanation: 'Preservação de dados atende requisitos de controle de produção, identificação e rastreabilidade e monitoramento. Backup e validação são salvaguardas essenciais contra perda.'
      },
      'ISO9001_Documentação de changelog': {
        clauses: '7.4, 7.5.3, 8.2.1',
        explanation: 'Clareza de changelog atende requisitos de comunicação, controle de informação documentada e comunicação com cliente. Linguagem acessível garante compreensão e adoção adequada.'
      },
      
      // Generic Lorem Ipsum for remaining sessions (none left!)
      'ISO9001_Lorem': {
        clauses: '8.1, 8.2, 8.3',
        explanation: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
      },
      'ISO27001_Lorem': {
        clauses: 'A.8.1, A.8.2, A.9.1',
        explanation: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.'
      },
      'ISO27701_Lorem': {
        clauses: '7.2.1, 7.2.2, 7.3.1',
        explanation: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.'
      }
    };
    
    // Flexible matching logic - try multiple strategies
    for (const [dataKey, data] of Object.entries(complianceData)) {
      const [keyStandard, keyText] = dataKey.split('_');
      
      // Skip Lorem entries in specific matching
      if (keyText === 'Lorem') continue;
      
      // Strategy 1: Standard matches and item text contains key text
      if (keyStandard === standard && itemText.includes(keyText)) {
        return data;
      }
      
      // Strategy 2: Standard matches and key text contains significant part of item text (first 15 chars)
      if (keyStandard === standard && keyText.toLowerCase().includes(itemText.toLowerCase().substring(0, 15))) {
        return data;
      }
      
      // Strategy 3: Check if first word matches (for cases like "Feedbacks" in both)
      const itemFirstWord = itemText.split(' ')[0].toLowerCase();
      const keyFirstWord = keyText.split(' ')[0].toLowerCase();
      if (keyStandard === standard && itemFirstWord === keyFirstWord && itemFirstWord.length > 5) {
        return data;
      }
    }

    // Fallback: Return Lorem Ipsum for the standard if no specific match found
    const loremKey = `${standard}_Lorem`;
    if (complianceData[loremKey]) {
      return complianceData[loremKey];
    }

    return null;
  };

  useEffect(() => {
    const calculatedSessions = calculateSessions(scopeData, riskAssessment);
    setSessions(calculatedSessions);
  }, [scopeData, riskAssessment, setSessions]);

  const copyFullMatrixAsImage = async () => {
    const element = fullMatrixRef.current;
    if (!element) {
      console.error('Full matrix element not found');
      alert('Elemento não encontrado');
      return;
    }

    try {
      // Find and hide all action buttons temporarily
      const allActionButtons = element.querySelectorAll('[data-action-buttons]');
      const originalDisplays: string[] = [];
      
      allActionButtons.forEach((button, index) => {
        const htmlButton = button as HTMLElement;
        originalDisplays[index] = htmlButton.style.display;
        htmlButton.style.display = 'none';
      });

      // Wait a bit for the DOM to update
      await new Promise(resolve => setTimeout(resolve, 100));

      // Capture with modern-screenshot - returns data URL
      const dataUrl = await domToPng(element, {
        scale: 2,
        quality: 1,
      });

      // Restore button visibility
      allActionButtons.forEach((button, index) => {
        const htmlButton = button as HTMLElement;
        htmlButton.style.display = originalDisplays[index];
      });

      // Check if Clipboard API is available and try to use it
      let clipboardSuccess = false;
      
      if (navigator.clipboard && navigator.clipboard.write) {
        try {
          // Convert data URL to blob
          const response = await fetch(dataUrl);
          const blob = await response.blob();

          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob,
            }),
          ]);
          
          clipboardSuccess = true;
          
          // Show success feedback
          setCopiedFullMatrix(true);
          setTimeout(() => {
            setCopiedFullMatrix(false);
          }, 2000);
        } catch (clipboardError) {
          // Clipboard API blocked - fallback to modal (expected behavior)
          clipboardSuccess = false;
        }
      }
      
      // If clipboard didn't work, show modal
      if (!clipboardSuccess) {
        showImageModal(dataUrl);
      }
    } catch (err) {
      console.error('Failed to generate image:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      alert(`Erro ao gerar imagem: ${errorMessage}`);
    }
  };

  const copySessionAsImage = async (sessionId: string) => {
    const element = sessionRefs.current[sessionId];
    if (!element) {
      console.error('Element not found for session:', sessionId);
      alert('Elemento não encontrado');
      return;
    }

    try {
      // Find and hide the action buttons temporarily
      const buttonContainer = element.querySelector('[data-action-buttons]') as HTMLElement;
      const originalDisplay = buttonContainer ? buttonContainer.style.display : '';
      
      if (buttonContainer) {
        buttonContainer.style.display = 'none';
      }

      // Wait a bit for the DOM to update
      await new Promise(resolve => setTimeout(resolve, 50));

      // Capture with modern-screenshot - returns data URL
      const dataUrl = await domToPng(element, {
        scale: 2,
        quality: 1,
      });

      // Restore button visibility
      if (buttonContainer) {
        buttonContainer.style.display = originalDisplay;
      }

      // Check if Clipboard API is available and try to use it
      let clipboardSuccess = false;
      
      if (navigator.clipboard && navigator.clipboard.write) {
        try {
          // Convert data URL to blob
          const response = await fetch(dataUrl);
          const blob = await response.blob();

          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob,
            }),
          ]);
          
          clipboardSuccess = true;
          
          // Show success feedback
          setCopiedImageStates((prev) => ({ ...prev, [sessionId]: true }));
          setTimeout(() => {
            setCopiedImageStates((prev) => ({ ...prev, [sessionId]: false }));
          }, 2000);
        } catch (clipboardError) {
          // Clipboard API blocked - fallback to modal (expected behavior)
          clipboardSuccess = false;
        }
      }
      
      // If clipboard didn't work, show modal
      if (!clipboardSuccess) {
        showImageModal(dataUrl);
      }
    } catch (err) {
      console.error('Failed to generate image:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      alert(`Erro ao gerar imagem: ${errorMessage}`);
    }
  };

  const showImageModal = (dataUrl: string) => {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.85);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 20px;
      animation: fadeIn 0.2s ease-in;
    `;
    
    // Create message box
    const messageBox = document.createElement('div');
    messageBox.style.cssText = `
      background: white;
      padding: 24px;
      border-radius: 12px;
      margin-bottom: 20px;
      text-align: center;
      max-width: 600px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    `;
    
    const title = document.createElement('h3');
    title.textContent = 'Imagem Gerada';
    title.style.cssText = `
      margin: 0 0 12px 0;
      color: #1e293b;
      font-size: 20px;
      font-weight: 600;
    `;
    
    const instruction = document.createElement('p');
    instruction.textContent = 'A API de clipboard está bloqueada. Clique com o botão direito na imagem abaixo e selecione "Copiar imagem".';
    instruction.style.cssText = `
      margin: 0 0 16px 0;
      color: #64748b;
      font-size: 14px;
      line-height: 1.5;
    `;
    
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Fechar';
    closeButton.style.cssText = `
      background: #3b82f6;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: background 0.2s;
    `;
    closeButton.onmouseover = () => {
      closeButton.style.background = '#2563eb';
    };
    closeButton.onmouseout = () => {
      closeButton.style.background = '#3b82f6';
    };
    
    messageBox.appendChild(title);
    messageBox.appendChild(instruction);
    messageBox.appendChild(closeButton);
    
    // Create image element
    const img = document.createElement('img');
    img.src = dataUrl;
    img.alt = 'Session Screenshot';
    img.style.cssText = `
      max-width: 90%;
      max-height: 60vh;
      border: 3px solid white;
      border-radius: 8px;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
      user-select: none;
    `;
    
    // Assemble modal
    modal.appendChild(messageBox);
    modal.appendChild(img);
    document.body.appendChild(modal);
    
    // Close handlers
    const closeModal = () => {
      modal.style.animation = 'fadeOut 0.2s ease-out';
      setTimeout(() => {
        if (document.body.contains(modal)) {
          document.body.removeChild(modal);
        }
      }, 200);
    };
    
    closeButton.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  };

  const downloadDataUrlAsImage = (dataUrl: string, sessionId: string) => {
    try {
      const link = document.createElement('a');
      link.download = `session-${sessionId}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      
      // Show success feedback even for downloads
      setCopiedImageStates((prev) => ({ ...prev, [sessionId]: true }));
      setTimeout(() => {
        setCopiedImageStates((prev) => ({ ...prev, [sessionId]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to download image:', err);
      alert('Erro ao fazer download da imagem');
    }
  };

  const statusConfig = {
    required: {
      icon: CheckCircle2,
      color: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      label: 'Obrigatória',
    },
    optional: {
      icon: AlertCircle,
      color: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      label: 'Opcional',
    },
    'not-applicable': {
      icon: XCircle,
      color: 'text-slate-500',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200',
      label: 'Não Aplicável',
    },
  };

  const getDeliverableTypeConfig = (type: DeliverableType) => {
    switch (type) {
      case 'design':
        return {
          icon: PenTool,
          label: 'Design',
          color: 'bg-purple-100 text-purple-700 border-purple-200',
        };
      case 'document':
        return {
          icon: FileDocIcon,
          label: 'Documento',
          color: 'bg-blue-100 text-blue-700 border-blue-200',
        };
      case 'diagram':
        return {
          icon: GitBranch,
          label: 'Diagrama',
          color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        };
      case 'flow':
        return {
          icon: Workflow,
          label: 'Fluxograma',
          color: 'bg-cyan-100 text-cyan-700 border-cyan-200',
        };
      case 'list':
        return {
          icon: List,
          label: 'Lista',
          color: 'bg-slate-100 text-slate-700 border-slate-200',
        };
      case 'interface':
        return {
          icon: Layout,
          label: 'Interface',
          color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        };
      default:
        return {
          icon: FileDocIcon,
          label: 'Documento',
          color: 'bg-gray-100 text-gray-700 border-gray-200',
        };
    }
  };

  return (
    <div className="space-y-8" ref={fullMatrixRef}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Matriz de Sessões Aplicáveis
          </h2>
          <p className="text-sm text-slate-600">
            Baseado no risco classificado, estas são as sessões de design recomendadas com todos os detalhes necessários.
          </p>
        </div>
        <div data-action-buttons>
          <Button
            variant="default"
            size="sm"
            onClick={copyFullMatrixAsImage}
            className="gap-2"
            title="Copiar toda a matriz como imagem"
          >
            {copiedFullMatrix ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Copiado!
              </>
            ) : (
              <ImageIcon className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Context Cards - Resumo Executivo, Scope Card e Análise de Risco */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Resumo Executivo Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Resumo Executivo</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-slate-700">Tipo de Entrega:</span>
              <p className="text-slate-900">{getDeliveryTypeLabel(scopeData.deliveryType)}</p>
            </div>
          </div>
        </div>

        {/* Scope Card - Expandido */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 md:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-purple-900">Scope Card</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            {/* Left Column */}
            <div className="space-y-3">
              <div>
                <span className="font-medium text-slate-700">Dados Envolvidos:</span>
                <p className="text-slate-900">{getDataTypeLabel(scopeData.dataInvolved)}</p>
              </div>
              <div>
                <span className="font-medium text-slate-700">Modelo de Acesso:</span>
                <p className="text-slate-900">{getAccessModelLabel(scopeData.accessModel)}</p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              <div>
                <span className="font-medium text-slate-700 block mb-1">Ações Sensíveis:</span>
                <div className="flex flex-wrap gap-1">
                  {scopeData.hasCreateAction && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Criar</span>
                  )}
                  {scopeData.hasEditAction && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Editar</span>
                  )}
                  {scopeData.hasDeleteAction && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Deletar</span>
                  )}
                  {scopeData.hasApprovalAction && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Aprovação</span>
                  )}
                  {scopeData.hasExportAction && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Exportar</span>
                  )}
                  {scopeData.hasShareAction && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Compartilhar</span>
                  )}
                  {scopeData.hasIrreversibleAction && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Irreversível</span>
                  )}
                  {scopeData.hasFinancial && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Financeiro</span>
                  )}
                  {!scopeData.hasCreateAction && !scopeData.hasEditAction && !scopeData.hasDeleteAction && !scopeData.hasApprovalAction && !scopeData.hasExportAction && !scopeData.hasShareAction && !scopeData.hasIrreversibleAction && !scopeData.hasFinancial && (
                    <span className="text-xs text-slate-500">Nenhuma</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Análise de Risco Card */}
        <div className={`border rounded-lg p-4 ${
          riskAssessment.riskLabel === 'high' 
            ? 'bg-red-50 border-red-200' 
            : riskAssessment.riskLabel === 'medium'
            ? 'bg-amber-50 border-amber-200'
            : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className={`w-5 h-5 ${
              riskAssessment.riskLabel === 'high' 
                ? 'text-red-600' 
                : riskAssessment.riskLabel === 'medium'
                ? 'text-amber-600'
                : 'text-green-600'
            }`} />
            <h3 className={`font-semibold ${
              riskAssessment.riskLabel === 'high' 
                ? 'text-red-900' 
                : riskAssessment.riskLabel === 'medium'
                ? 'text-amber-900'
                : 'text-green-900'
            }`}>Análise de Risco</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-slate-700">Classificação:</span>
              <p className={`font-bold uppercase ${
                riskAssessment.riskLabel === 'high' 
                  ? 'text-red-700' 
                  : riskAssessment.riskLabel === 'medium'
                  ? 'text-amber-700'
                  : 'text-green-700'
              }`}>{riskAssessment.riskLabel}</p>
            </div>
            <div>
              <span className="font-medium text-slate-700">Score:</span>
              <p className="text-slate-900 font-semibold">{riskAssessment.riskScore}</p>
            </div>
            <div>
              <span className="font-medium text-slate-700">Drivers de Risco:</span>
              <p className="text-slate-900">{riskAssessment.riskDrivers.length} identificados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-3">
        {sessions.map((session) => {
          const config = statusConfig[session.status];
          const Icon = config.icon;
          const definition = getSessionDefinition(session.id, scopeData, riskAssessment);

          return (
            <div
              key={session.id}
              ref={(el) => (sessionRefs.current[session.id] = el)}
              data-session-id={session.id}
              className={`${config.bgColor} ${config.borderColor} border rounded-lg overflow-hidden`}
            >
              <div className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`${config.color} mt-1`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <div 
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => toggleSessionExpand(session.id)}
                      >
                        <h3 className="font-semibold text-slate-900">{session.name}</h3>
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded ${config.color} ${config.bgColor}`}
                        >
                          {config.label}
                        </span>
                        {expandedSessions[session.id] ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <div className="flex items-center gap-2" data-action-buttons>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copySessionAsImage(session.id)}
                          className="gap-1"
                          title="Copiar como imagem"
                        >
                          {copiedImageStates[session.id] ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <ImageIcon className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-slate-700">{session.reason}</p>
                  </div>
                </div>

                {/* Expanded Details - Controlled by expandedSessions state */}
                {expandedSessions[session.id] && (
                  <div className={`mt-4 pt-4 border-t border-slate-200 space-y-4 ${session.status === 'not-applicable' ? 'opacity-50' : ''}`}>
                    {/* Purpose */}
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 mb-1">
                        Propósito
                      </h4>
                      <p className="text-sm text-slate-700">{definition.purpose}</p>
                    </div>

                    {/* What to Design */}
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 mb-2">
                        Necessário
                      </h4>
                      <ul className="space-y-2">
                        {definition.whatToDesign.map((item, idx) => {
                          const typeConfig = getDeliverableTypeConfig(item.type);
                          const TypeIcon = typeConfig.icon;
                          
                          // Check if at least one standard is selected
                          const hasSelectedStandard = item.standards.some(
                            (standard) =>
                              (standard === 'ISO9001' && scopeData.complianceISO9001) ||
                              (standard === 'ISO27001' && scopeData.complianceISO27001) ||
                              (standard === 'ISO27701' && scopeData.complianceISO27701)
                          );
                          
                          const isItemOptional = !hasSelectedStandard;
                          const hasHelpInfo = item.explanation || item.example;
                          
                          return (
                            <li key={idx} className={`flex items-start gap-2 text-sm ${isItemOptional ? 'opacity-50' : ''}`}>
                              <span className="text-blue-600 mt-1 flex-shrink-0">•</span>
                              <div className="flex-1 flex items-start justify-between gap-2">
                                {/* Type Badge - moved to extreme left */}
                                <div className="flex-shrink-0 mt-0.5" style={{ width: '100px' }}>
                                  <span
                                    className={`text-xs font-medium px-2 py-0.5 rounded border flex items-center gap-1 ${typeConfig.color}`}
                                    title={typeConfig.label}
                                    style={{ justifyContent: 'center' }}
                                  >
                                    <TypeIcon className="w-3 h-3" />
                                    {typeConfig.label}
                                  </span>
                                </div>
                                <div className="flex-1 flex items-center gap-2">
                                  <span className="text-slate-700">{item.text}</span>
                                  {isItemOptional && (
                                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 flex-shrink-0">
                                      Opcional
                                    </span>
                                  )}
                                  {hasHelpInfo && (
                                    <div className="relative flex-shrink-0">
                                      <Info className="w-3.5 h-3.5 text-slate-400 hover:text-blue-600 cursor-help" 
                                            onMouseEnter={(e) => handleInfoHover(e, item.explanation, item.example)}
                                            onMouseLeave={handleInfoLeave} />
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  {/* Standards Badges */}
                                  {item.standards.map((standard, stdIdx) => {
                                    // Check if this standard was selected in Step 1
                                    const isSelected = 
                                      (standard === 'ISO9001' && scopeData.complianceISO9001) ||
                                      (standard === 'ISO27001' && scopeData.complianceISO27001) ||
                                      (standard === 'ISO27701' && scopeData.complianceISO27701);
                                    
                                    const standardColors = isSelected
                                      ? standard === 'ISO9001'
                                        ? 'bg-green-50 text-green-700 border-green-200'
                                        : standard === 'ISO27001'
                                        ? 'bg-orange-50 text-orange-700 border-orange-200'
                                        : 'bg-pink-50 text-pink-700 border-pink-200'
                                      : 'bg-slate-100 text-slate-500 border-slate-300';
                                    
                                    const standardTitle = 
                                      standard === 'ISO9001'
                                        ? 'ISO 9001 - Gestão de Qualidade'
                                        : standard === 'ISO27001'
                                        ? 'ISO/IEC 27001 - Segurança da Informação'
                                        : 'ISO/IEC 27701 - Privacidade';
                                    
                                    return (
                                      <span
                                        key={stdIdx}
                                        className={`text-xs font-medium px-1.5 py-0.5 rounded border flex items-center gap-1 cursor-help ${standardColors}`}
                                        title={`${standardTitle}${!isSelected ? ' (Não selecionada)' : ''}`}
                                        onMouseEnter={(e) => handleStandardHover(e, getStandardCompliance(session.id, item.text, standard)?.clauses, getStandardCompliance(session.id, item.text, standard)?.explanation, standard)}
                                        onMouseLeave={handleStandardLeave}
                                      >
                                        <Award className="w-2.5 h-2.5" />
                                        {standard}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    {/* Checklist */}
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 mb-2">
                        Checklist de Verificação
                      </h4>
                      <ul className="space-y-2">
                        {definition.checklist.map((item, idx) => {
                          // Check if at least one standard is selected
                          const hasSelectedStandard = item.standards.some(
                            (standard) =>
                              (standard === 'ISO9001' && scopeData.complianceISO9001) ||
                              (standard === 'ISO27001' && scopeData.complianceISO27001) ||
                              (standard === 'ISO27701' && scopeData.complianceISO27701)
                          );
                          
                          const isItemOptional = !hasSelectedStandard;
                          const hasHelpInfo = item.explanation || item.example;
                          
                          return (
                            <li key={idx} className={`flex items-start gap-2 text-sm ${isItemOptional ? 'opacity-50' : ''}`}>
                              <span className="text-green-600 mt-1 flex-shrink-0">☐</span>
                              <div className="flex-1 flex items-start justify-between gap-2">
                                <div className="flex-1 flex items-center gap-2">
                                  <span className="text-slate-700">{item.text}</span>
                                  {isItemOptional && (
                                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 flex-shrink-0">
                                      Opcional
                                    </span>
                                  )}
                                  {hasHelpInfo && (
                                    <div className="relative flex-shrink-0">
                                      <Info className="w-3.5 h-3.5 text-slate-400 hover:text-blue-600 cursor-help" 
                                            onMouseEnter={(e) => handleInfoHover(e, item.explanation, item.example)}
                                            onMouseLeave={handleInfoLeave} />
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  {/* Standards Badges */}
                                  {item.standards.map((standard, stdIdx) => {
                                    // Check if this standard was selected in Step 1
                                    const isSelected = 
                                      (standard === 'ISO9001' && scopeData.complianceISO9001) ||
                                      (standard === 'ISO27001' && scopeData.complianceISO27001) ||
                                      (standard === 'ISO27701' && scopeData.complianceISO27701);
                                    
                                    const standardColors = isSelected
                                      ? standard === 'ISO9001'
                                        ? 'bg-green-50 text-green-700 border-green-200'
                                        : standard === 'ISO27001'
                                        ? 'bg-orange-50 text-orange-700 border-orange-200'
                                        : 'bg-pink-50 text-pink-700 border-pink-200'
                                      : 'bg-slate-100 text-slate-500 border-slate-300';
                                    
                                    const standardTitle = 
                                      standard === 'ISO9001'
                                        ? 'ISO 9001 - Gestão de Qualidade'
                                        : standard === 'ISO27001'
                                        ? 'ISO/IEC 27001 - Segurança da Informação'
                                        : 'ISO/IEC 27701 - Privacidade';
                                    
                                    return (
                                      <span
                                        key={stdIdx}
                                        className={`text-xs font-medium px-1.5 py-0.5 rounded border flex items-center gap-1 cursor-help ${standardColors}`}
                                        title={`${standardTitle}${!isSelected ? ' (Não selecionada)' : ''}`}
                                        onMouseEnter={(e) => handleStandardHover(e, getStandardCompliance(session.id, item.text, standard)?.clauses, getStandardCompliance(session.id, item.text, standard)?.explanation, standard)}
                                        onMouseLeave={handleStandardLeave}
                                      >
                                        <Award className="w-2.5 h-2.5" />
                                        {standard}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    {/* Notes */}
                    {definition.notes && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <h4 className="text-sm font-semibold text-blue-900 mb-1">
                          Notas / Limites
                        </h4>
                        <p className="text-sm text-blue-800">{definition.notes}</p>
                        
                        {/* Decision Drivers */}
                        {session.decisionDrivers && session.decisionDrivers.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-blue-300">
                            <h5 className="text-xs font-semibold text-blue-900 mb-2">
                              Baseado em:
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {session.decisionDrivers.map((driver, idx) => {
                                // Determine badge category and color scheme
                                const getBadgeStyle = (label: string, isActive: boolean) => {
                                  let baseClasses = 'inline-flex items-center px-2 py-1 rounded text-xs border ';
                                  let colorClasses = '';
                                  
                                  if (label.startsWith('Tipo:')) {
                                    colorClasses = isActive 
                                      ? 'bg-blue-100 text-blue-800 border-blue-300 font-medium'
                                      : 'bg-blue-50 text-blue-600 border-blue-200 opacity-40';
                                  } else if (label.startsWith('Dados:')) {
                                    colorClasses = isActive
                                      ? 'bg-green-100 text-green-800 border-green-300 font-medium'
                                      : 'bg-green-50 text-green-600 border-green-200 opacity-40';
                                  } else if (label.startsWith('Acesso:')) {
                                    colorClasses = isActive
                                      ? 'bg-purple-100 text-purple-800 border-purple-300 font-medium'
                                      : 'bg-purple-50 text-purple-600 border-purple-200 opacity-40';
                                  } else if (label === 'Editar' || label === 'Deletar' || label === 'Exportar' || label === 'Compartilhar') {
                                    colorClasses = isActive
                                      ? 'bg-cyan-100 text-cyan-800 border-cyan-300 font-medium'
                                      : 'bg-cyan-50 text-cyan-600 border-cyan-200 opacity-40';
                                  } else if (label === 'Aprovações' || label === 'Financeiro' || label === 'Revogação' || label === 'Permissões') {
                                    colorClasses = isActive
                                      ? 'bg-amber-100 text-amber-800 border-amber-300 font-medium'
                                      : 'bg-amber-50 text-amber-600 border-amber-200 opacity-40';
                                  } else if (label === 'Mudança em Trabalho Existente') {
                                    colorClasses = isActive
                                      ? 'bg-pink-100 text-pink-800 border-pink-300 font-medium'
                                      : 'bg-pink-50 text-pink-600 border-pink-200 opacity-40';
                                  } else {
                                    // Default (for "Sessão obrigatória")
                                    colorClasses = isActive
                                      ? 'bg-slate-100 text-slate-800 border-slate-300 font-medium'
                                      : 'bg-slate-50 text-slate-600 border-slate-200 opacity-40';
                                  }
                                  
                                  return baseClasses + colorClasses;
                                };
                                
                                // Add category prefix for capability and action badges
                                const getDisplayLabel = (label: string) => {
                                  if (label === 'Editar' || label === 'Deletar' || label === 'Exportar' || label === 'Compartilhar') {
                                    return `Capacidade: ${label}`;
                                  } else if (label === 'Aprovações' || label === 'Financeiro' || label === 'Revogação' || label === 'Permissões') {
                                    return `Ação: ${label}`;
                                  }
                                  return label;
                                };
                                
                                return (
                                  <span
                                    key={idx}
                                    className={getBadgeStyle(driver.label, driver.active)}
                                  >
                                    {getDisplayLabel(driver.label)}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-3 text-sm">
          Resumo das Sessões
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-2xl font-semibold text-green-700">
              {sessions.filter((s) => s.status === 'required').length}
            </div>
            <div className="text-xs text-blue-800 mt-1">Obrigatórias</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-amber-700">
              {sessions.filter((s) => s.status === 'optional').length}
            </div>
            <div className="text-xs text-blue-800 mt-1">Opcionais</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-slate-500">
              {sessions.filter((s) => s.status === 'not-applicable').length}
            </div>
            <div className="text-xs text-blue-800 mt-1">Não Aplicáveis</div>
          </div>
        </div>
      </div>

      {/* Decisões de Governança de Design */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
        <h3 className="font-semibold text-slate-900 mb-4 text-lg">
          Decisões de Governança de Design
        </h3>

        {/* Trade-offs Identificados */}
        <div className="mb-6">
          <h4 className="font-semibold text-slate-800 mb-3 text-sm">
            Trade-offs Identificados
          </h4>
          <div className="space-y-2 text-sm text-slate-700">
            {getTradeoffs(scopeData, riskAssessment).split('\n').map((line, idx) => (
              <p key={idx}>{line}</p>
            ))}
          </div>
        </div>

        {/* Restrições Conhecidas */}
        <div>
          <h4 className="font-semibold text-slate-800 mb-3 text-sm">
            Restrições Conhecidas
          </h4>
          <div className="space-y-2 text-sm text-slate-700">
            {getConstraints(scopeData).split('\n').map((line, idx) => (
              <p key={idx}>{line}</p>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-300 text-xs text-slate-500">
          <p>Gerado em: {new Date().toLocaleString('pt-BR')}</p>
          <p>Design Change & Risk Orchestrator v1.0</p>
        </div>
      </div>

      {/* Global Popover */}
      {popoverState.visible && (popoverState.content.explanation || popoverState.content.example) && (
        <div 
          className="fixed w-80 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl z-[100] transition-opacity duration-200"
          style={{
            left: `${popoverState.x}px`, 
            top: `${popoverState.y}px`, 
            pointerEvents: 'none'
          }}
        >
          {popoverState.content.explanation && (
            <div className="mb-2">
              <p className="leading-relaxed">{popoverState.content.explanation}</p>
            </div>
          )}
          {popoverState.content.example && (
            <div className="pt-2 border-t border-slate-600">
              <p className="italic text-slate-300">{popoverState.content.example}</p>
            </div>
          )}
          {/* Arrow */}
          <div className="absolute -top-2 left-4 w-3 h-3 bg-slate-800 transform rotate-45"></div>
        </div>
      )}

      {/* ISO Standards Popover */}
      {standardPopoverState.visible && (standardPopoverState.content.clauses || standardPopoverState.content.explanation) && (
        <div 
          className="fixed w-96 p-3 bg-indigo-900 text-white text-xs rounded-lg shadow-xl z-[100] transition-opacity duration-200"
          style={{
            left: `${standardPopoverState.x}px`, 
            top: `${standardPopoverState.y}px`, 
            pointerEvents: 'none'
          }}
        >
          {standardPopoverState.content.standard && (
            <div className="mb-2 pb-2 border-b border-indigo-700">
              <p className="font-semibold text-indigo-200">{standardPopoverState.content.standard}</p>
            </div>
          )}
          {standardPopoverState.content.clauses && (
            <div className="mb-2">
              <p className="text-indigo-300 font-medium mb-1">Cláusulas:</p>
              <p className="text-white font-mono">{standardPopoverState.content.clauses}</p>
            </div>
          )}
          {standardPopoverState.content.explanation && (
            <div className="pt-2 border-t border-indigo-700">
              <p className="text-indigo-300 font-medium mb-1">Como atende:</p>
              <p className="leading-relaxed text-indigo-100">{standardPopoverState.content.explanation}</p>
            </div>
          )}
          {/* Arrow */}
          <div className="absolute -top-2 left-4 w-3 h-3 bg-indigo-900 transform rotate-45"></div>
        </div>
      )}
    </div>
  );
}

function calculateSessions(
  scopeData: DesignScopeData,
  riskAssessment: RiskAssessment
): SessionStatus[] {
  const sessions: SessionStatus[] = [];

  // Session 00: Context & Intention (Always Required)
  sessions.push({
    id: '00',
    name: 'Contexto & Intenção',
    status: 'required',
    reason: 'Sempre necessário para entender o objetivo e escopo do trabalho',
    decisionDrivers: [{ label: 'Sessão obrigatória para todos os trabalhos', active: true }],
  });

  // Session 01: Flow & Information Architecture
  const needsFlowRequired = ['new-product', 'functional-evolution', 'third-party-integration'].includes(scopeData.deliveryType);
  const needsFlowOptional = ['visual-ux-adjustment', 'discontinuation'].includes(scopeData.deliveryType);
  
  if (needsFlowRequired) {
    sessions.push({
      id: '01',
      name: 'Fluxo & Arquitetura da Informação',
      status: 'required',
      reason: scopeData.deliveryType === 'new-product'
        ? 'Produto novo requer arquitetura completa de informação e fluxos'
        : scopeData.deliveryType === 'third-party-integration'
        ? 'Integração cria novos fluxos de comunicação e troca de dados'
        : 'Evolução funcional altera fluxos existentes e pode criar novos',
      decisionDrivers: [
        { label: 'Novo produto / novo módulo', active: scopeData.deliveryType === 'new-product' },
        { label: 'Evolução funcional', active: scopeData.deliveryType === 'functional-evolution' },
        { label: 'Integração com terceiros', active: scopeData.deliveryType === 'third-party-integration' }
      ],
    });
  } else if (needsFlowOptional) {
    sessions.push({
      id: '01',
      name: 'Fluxo & Arquitetura da Informação',
      status: 'optional',
      reason: scopeData.deliveryType === 'visual-ux-adjustment'
        ? 'Ajustes de UX podem alterar fluxos de navegação'
        : 'Descontinuação precisa mapear impacto na arquitetura existente',
      decisionDrivers: [
        { label: 'Ajuste visual / UX', active: scopeData.deliveryType === 'visual-ux-adjustment' },
        { label: 'Descontinuação / remoção', active: scopeData.deliveryType === 'discontinuation' }
      ],
    });
  } else {
    sessions.push({
      id: '01',
      name: 'Fluxo & Arquitetura da Informação',
      status: 'not-applicable',
      reason: 'Trabalho técnico sem impacto significativo em fluxos ou arquitetura de informação',
      decisionDrivers: [
        { label: 'Correção técnica / bugfix', active: scopeData.deliveryType === 'technical-bugfix' },
        { label: 'Refatoração técnica', active: scopeData.deliveryType === 'technical-refactoring' }
      ],
    });
  }

  // Session 02: UI Core Screens
  if (scopeData.deliveryType === 'technical-refactoring') {
    sessions.push({
      id: '02',
      name: 'UI - Telas Principais',
      status: 'not-applicable',
      reason: 'Refatoração técnica não altera interface do usuário',
      decisionDrivers: [
        { label: 'Refatoração técnica', active: true }
      ],
    });
  } else if (scopeData.deliveryType === 'discontinuation') {
    sessions.push({
      id: '02',
      name: 'UI - Telas Principais',
      status: 'optional',
      reason: 'Descontinuação pode precisar de UI de transição ou migração',
      decisionDrivers: [
        { label: 'Descontinuação / remoção', active: true }
      ],
    });
  } else {
    sessions.push({
      id: '02',
      name: 'UI - Telas Principais',
      status: 'required',
      reason: 'Necessário para definir as interfaces principais',
      decisionDrivers: [
        { label: 'Novo produto / novo módulo', active: scopeData.deliveryType === 'new-product' },
        { label: 'Evolução funcional', active: scopeData.deliveryType === 'functional-evolution' },
        { label: 'Ajuste visual / UX', active: scopeData.deliveryType === 'visual-ux-adjustment' },
        { label: 'Correção técnica / bugfix', active: scopeData.deliveryType === 'technical-bugfix' },
        { label: 'Integração com terceiros', active: scopeData.deliveryType === 'third-party-integration' }
      ],
    });
  }

  // Session 03: States, Errors & Feedback
  const needsStatesRequired = ['new-product', 'functional-evolution', 'third-party-integration'].includes(scopeData.deliveryType);
  const needsStatesOptional = ['visual-ux-adjustment', 'technical-bugfix', 'discontinuation'].includes(scopeData.deliveryType);
  
  if (needsStatesRequired) {
    sessions.push({
      id: '03',
      name: 'Estados, Erros & Feedback',
      status: 'required',
      reason: scopeData.deliveryType === 'new-product'
        ? 'Produto novo requer cobertura completa de estados, erros e mensagens de feedback'
        : scopeData.deliveryType === 'third-party-integration'
        ? 'Integração tem estados específicos de conexão, sincronização e tratamento de erros'
        : 'Evolução funcional introduz novos estados e cenários de erro',
      decisionDrivers: [
        { label: 'Novo produto / novo módulo', active: scopeData.deliveryType === 'new-product' },
        { label: 'Evolução funcional', active: scopeData.deliveryType === 'functional-evolution' },
        { label: 'Integração com terceiros', active: scopeData.deliveryType === 'third-party-integration' }
      ],
    });
  } else if (needsStatesOptional) {
    sessions.push({
      id: '03',
      name: 'Estados, Erros & Feedback',
      status: 'optional',
      reason: scopeData.deliveryType === 'visual-ux-adjustment'
        ? 'Ajustes de UX frequentemente envolvem melhorar feedback e mensagens'
        : scopeData.deliveryType === 'technical-bugfix'
        ? 'Bugfix pode corrigir comportamento de estados ou mensagens de erro'
        : 'Descontinuação requer estados de transição e mensagens informativas',
      decisionDrivers: [
        { label: 'Ajuste visual / UX', active: scopeData.deliveryType === 'visual-ux-adjustment' },
        { label: 'Correção técnica / bugfix', active: scopeData.deliveryType === 'technical-bugfix' },
        { label: 'Descontinuação / remoção', active: scopeData.deliveryType === 'discontinuation' }
      ],
    });
  } else {
    sessions.push({
      id: '03',
      name: 'Estados, Erros & Feedback',
      status: 'not-applicable',
      reason: 'Refatoração técnica não altera comportamento de estados ou mensagens',
      decisionDrivers: [
        { label: 'Refatoração técnica', active: scopeData.deliveryType === 'technical-refactoring' }
      ],
    });
  }

  // Session 04: Sensitive Actions
  const hasPersonalData = ['personal-common', 'personal-sensitive', 'financial', 'children'].includes(scopeData.dataInvolved);
  const hasDataToRemove = scopeData.deliveryType === 'discontinuation' && hasPersonalData;
  const hasSensitiveActions = scopeData.hasDeleteAction ||
    scopeData.hasApprovalAction ||
    scopeData.hasIrreversibleAction ||
    scopeData.hasFinancial;
  
  if (hasSensitiveActions || hasDataToRemove) {
    sessions.push({
      id: '04',
      name: 'Ações Sensíveis',
      status: 'required',
      reason: hasDataToRemove && !hasSensitiveActions
        ? 'Descontinuação com dados pessoais requer processo seguro de exclusão/migração'
        : 'Há ações críticas que requerem confirmação, auditoria ou validações especiais',
      decisionDrivers: [
        { label: 'Exclusão', active: scopeData.hasDeleteAction },
        { label: 'Aprovações', active: scopeData.hasApprovalAction },
        { label: 'Irreversível', active: scopeData.hasIrreversibleAction },
        { label: 'Financeiro', active: scopeData.hasFinancial },
        { label: 'Descontinuação com dados', active: hasDataToRemove }
      ].filter(d => d.active),
    });
  } else {
    sessions.push({
      id: '04',
      name: 'Ações Sensíveis',
      status: 'not-applicable',
      reason: 'Não há ações sensíveis identificadas',
      decisionDrivers: [
        { label: 'Exclusão', active: false },
        { label: 'Aprovações', active: false },
        { label: 'Irreversível', active: false },
        { label: 'Financeiro', active: false }
      ],
    });
  }

  // Session 05: Privacy & Consent
  const isHighRiskData = ['personal-sensitive', 'financial', 'children'].includes(scopeData.dataInvolved);
  const isDiscontinuationWithPersonalData = scopeData.deliveryType === 'discontinuation' && hasPersonalData;
  
  if (isHighRiskData || isDiscontinuationWithPersonalData) {
    let reason = '';
    if (scopeData.dataInvolved === 'personal-sensitive') {
      reason = 'Dados sensíveis exigem controles rigorosos de privacidade e consentimento explícito (LGPD/GDPR)';
    } else if (scopeData.dataInvolved === 'financial') {
      reason = 'Dados financeiros exigem conformidade PCI-DSS, controles de privacidade e consentimento explícito';
    } else if (scopeData.dataInvolved === 'children') {
      reason = 'Dados de menores de 18 anos exigem verificação de idade e consentimento parental (LGPD: <18 anos, GDPR: <16 anos)';
    } else if (isDiscontinuationWithPersonalData) {
      reason = 'Descontinuação com dados pessoais requer processo de exclusão conforme LGPD/GDPR (direito de exclusão)';
    }
    
    sessions.push({
      id: '05',
      name: 'Privacidade & Consentimento',
      status: 'required',
      reason,
      decisionDrivers: [
        { label: 'Dados pessoais comuns', active: scopeData.dataInvolved === 'personal-common' && isDiscontinuationWithPersonalData },
        { label: 'Dados sensíveis', active: scopeData.dataInvolved === 'personal-sensitive' },
        { label: 'Dados financeiros', active: scopeData.dataInvolved === 'financial' },
        { label: 'Dados de crianças', active: scopeData.dataInvolved === 'children' },
        { label: 'Descontinuação', active: isDiscontinuationWithPersonalData }
      ].filter(d => d.active),
    });
  } else if (scopeData.dataInvolved === 'personal-common') {
    // Required se dados comuns + acesso de alto risco
    const hasHighRiskAccess = ['public', 'third-party', 'api-automation'].includes(scopeData.accessModel) ||
                               scopeData.hasShareAction;
    
    sessions.push({
      id: '05',
      name: 'Privacidade & Consentimento',
      status: hasHighRiskAccess ? 'required' : 'optional',
      reason: hasHighRiskAccess
        ? scopeData.accessModel === 'public'
          ? 'Dados pessoais comuns com acesso público exigem controles rigorosos de privacidade'
          : scopeData.accessModel === 'third-party'
          ? 'Dados pessoais comuns acessados por terceiros exigem controles de privacidade e consentimento'
          : scopeData.accessModel === 'api-automation'
          ? 'Dados pessoais comuns via API exigem controles de privacidade e auditoria'
          : 'Dados pessoais comuns com compartilhamento exigem controles de privacidade'
        : 'Dados pessoais comuns requerem atenção à privacidade',
      decisionDrivers: [
        { label: 'Dados pessoais comuns', active: true },
        { label: 'Acesso público', active: scopeData.accessModel === 'public' },
        { label: 'Acesso de terceiros', active: scopeData.accessModel === 'third-party' },
        { label: 'API/Automação', active: scopeData.accessModel === 'api-automation' },
        { label: 'Compartilhamento', active: scopeData.hasShareAction }
      ].filter(d => d.active),
    });
  } else {
    sessions.push({
      id: '05',
      name: 'Privacidade & Consentimento',
      status: 'not-applicable',
      reason: scopeData.dataInvolved === 'non-personal'
        ? 'Apenas dados não pessoais (agregados, estatísticas) - privacidade não aplicável'
        : 'Não há dados envolvidos',
      decisionDrivers: [
        { label: 'Nenhum dado', active: scopeData.dataInvolved === 'none' },
        { label: 'Dados não pessoais', active: scopeData.dataInvolved === 'non-personal' }
      ].filter(d => d.active),
    });
  }

  // Session 06: Sharing & Export
  const needsDataExportForDiscontinuation = scopeData.deliveryType === 'discontinuation' && hasPersonalData;
  const hasAPIExport = scopeData.accessModel === 'api-automation' && hasPersonalData;
  
  if (scopeData.hasShareAction || scopeData.hasExportAction || needsDataExportForDiscontinuation || hasAPIExport) {
    sessions.push({
      id: '06',
      name: 'Compartilhamento & Exportação',
      status: 'required',
      reason: needsDataExportForDiscontinuation && !(scopeData.hasShareAction || scopeData.hasExportAction)
        ? 'Descontinuação com dados pessoais requer funcionalidade de exportação (portabilidade LGPD/GDPR)'
        : hasAPIExport && !(scopeData.hasShareAction || scopeData.hasExportAction)
        ? 'APIs que expõem dados pessoais requerem controles de exportação e auditoria'
        : 'Funcionalidades de compartilhamento ou exportação requerem design específico de controles',
      decisionDrivers: [
        { label: 'Compartilhar', active: scopeData.hasShareAction },
        { label: 'Exportar', active: scopeData.hasExportAction },
        { label: 'API com dados pessoais', active: hasAPIExport },
        { label: 'Descontinuação com dados', active: needsDataExportForDiscontinuation }
      ].filter(d => d.active),
    });
  } else {
    sessions.push({
      id: '06',
      name: 'Compartilhamento & Exportação',
      status: 'not-applicable',
      reason: 'Não há funcionalidades de compartilhamento ou exportação',
      decisionDrivers: [
        { label: 'Compartilhar', active: false },
        { label: 'Exportar', active: false }
      ],
    });
  }

  // Session 07: Security & Privacy Review (Always Required)
  sessions.push({
    id: '07',
    name: 'Revisão de Segurança & Privacidade',
    status: 'required',
    reason: 'Sempre necessário para garantir conformidade com princípios de segurança e privacidade',
    decisionDrivers: [{ label: 'Sessão obrigatória para todos os trabalhos', active: true }],
  });

  // Session 08: Change Impact & Versioning
  const requiresChangeAnalysis = ['functional-evolution', 'visual-ux-adjustment', 'discontinuation'].includes(scopeData.deliveryType);
  const optionalChangeAnalysis = ['third-party-integration', 'technical-bugfix', 'technical-refactoring'].includes(scopeData.deliveryType);
  
  if (requiresChangeAnalysis) {
    sessions.push({
      id: '08',
      name: 'Impacto de Mudança & Versionamento',
      status: 'required',
      reason: scopeData.deliveryType === 'functional-evolution'
        ? 'Evolução funcional em módulo existente requer análise de impacto e estratégia de versionamento'
        : scopeData.deliveryType === 'visual-ux-adjustment'
        ? 'Mudanças visuais/UX podem impactar fluxos de usuários habituados à interface anterior'
        : 'Descontinuação sempre impacta usuários - requer plano de comunicação e migração',
      decisionDrivers: [
        { label: 'Evolução funcional', active: scopeData.deliveryType === 'functional-evolution' },
        { label: 'Ajuste visual / UX', active: scopeData.deliveryType === 'visual-ux-adjustment' },
        { label: 'Descontinuação / remoção', active: scopeData.deliveryType === 'discontinuation' }
      ],
    });
  } else if (optionalChangeAnalysis) {
    sessions.push({
      id: '08',
      name: 'Impacto de Mudança & Versionamento',
      status: 'optional',
      reason: scopeData.deliveryType === 'third-party-integration'
        ? 'Integração pode introduzir breaking changes ou dependências'
        : scopeData.deliveryType === 'technical-bugfix'
        ? 'Bugfix pode ter breaking changes ou afetar comportamento esperado'
        : 'Refatoração pode ter impactos indiretos ou mudanças de performance',
      decisionDrivers: [
        { label: 'Integração com terceiros', active: scopeData.deliveryType === 'third-party-integration' },
        { label: 'Correção técnica / bugfix', active: scopeData.deliveryType === 'technical-bugfix' },
        { label: 'Refatoração técnica', active: scopeData.deliveryType === 'technical-refactoring' }
      ],
    });
  } else {
    sessions.push({
      id: '08',
      name: 'Impacto de Mudança & Versionamento',
      status: 'not-applicable',
      reason: 'Produto novo, sem versão anterior para análise de impacto',
      decisionDrivers: [
        { label: 'Novo produto / novo módulo', active: scopeData.deliveryType === 'new-product' }
      ],
    });
  }

  return sessions;
}

function getDeliveryTypeLabel(deliveryType: string): string {
  switch (deliveryType) {
    case 'new-product':
      return 'Novo produto / novo módulo';
    case 'functional-evolution':
      return 'Evolução funcional';
    case 'visual-ux-adjustment':
      return 'Ajuste visual / UX';
    case 'technical-bugfix':
      return 'Correção técnica / bugfix';
    case 'technical-refactoring':
      return 'Refatoração técnica';
    case 'third-party-integration':
      return 'Integração com terceiros';
    case 'discontinuation':
      return 'Descontinuação / remoção';
    default:
      return 'Desconhecido';
  }
}

function getDataTypeLabel(dataInvolved: string): string {
  switch (dataInvolved) {
    case 'none':
      return 'Nenhum dado';
    case 'non-personal':
      return 'Dados não pessoais';
    case 'personal-common':
      return 'Dados pessoais comuns';
    case 'personal-sensitive':
      return 'Dados pessoais sensíveis';
    case 'financial':
      return 'Dados financeiros';
    case 'children':
      return 'Dados de crianças/adolescentes';
    default:
      return 'Desconhecido';
  }
}

function getAccessModelLabel(accessModel: string): string {
  switch (accessModel) {
    case 'public':
      return 'Público';
    case 'authenticated':
      return 'Autenticado';
    case 'authenticated-permissions':
      return 'Autenticado com permissões';
    case 'administrative':
      return 'Administrativo';
    case 'third-party':
      return 'Acesso de terceiros';
    case 'api-automation':
      return 'API / Automação';
    default:
      return 'Desconhecido';
  }
}

function getUserCapabilityLabel(userCapability: string): string {
  switch (userCapability) {
    case 'end-user':
      return 'Usuário final comum';
    case 'advanced-user':
      return 'Usuário avançado';
    case 'internal-operator':
      return 'Operador interno';
    case 'administrator':
      return 'Administrador';
    case 'automated-system':
      return 'Sistema automatizado';
    default:
      return 'Desconhecido';
  }
}

function getTradeoffs(scopeData: DesignScopeData, riskAssessment: RiskAssessment): string {
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

  if (scopeData.dataInvolved === 'sensitive') {
    constraints.push('- LGPD/GDPR: Dados sensíveis exigem conformidade legal');
  }

  if (scopeData.hasFinancial) {
    constraints.push('- PCI-DSS: Transações financeiras requerem padrões de segurança');
  }



  if (scopeData.accessModel === 'public') {
    constraints.push('- Segurança: Acesso público aumenta superfície de ataque');
  }

  return constraints.length > 0
    ? constraints.join('\n')
    : '- Nenhuma restrição crítica identificada';
}