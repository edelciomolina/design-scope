import { useState } from 'react';
import { DesignScopeStep } from './components/DesignScopeStep';
import { RiskAssessmentStep } from './components/RiskAssessmentStep';
import { SessionMatrixStep } from './components/SessionMatrixStep';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { Button } from './components/ui/button';

export type DeliveryType = 
  | 'new-product' 
  | 'functional-evolution' 
  | 'visual-ux-adjustment' 
  | 'technical-bugfix' 
  | 'technical-refactoring' 
  | 'third-party-integration' 
  | 'discontinuation' 
  | '';
export type DataType = 
  | 'none' 
  | 'non-personal' 
  | 'personal-common' 
  | 'personal-sensitive' 
  | 'financial' 
  | 'children' 
  | '';
export type AccessModel = 
  | 'public' 
  | 'authenticated' 
  | 'authenticated-permissions' 
  | 'administrative' 
  | 'third-party' 
  | 'api-automation' 
  | '';
export type UserCapability = 
  | 'end-user' 
  | 'advanced-user' 
  | 'internal-operator' 
  | 'administrator' 
  | 'automated-system' 
  | '';

export interface DesignScopeData {
  deliveryType: DeliveryType;
  dataInvolved: DataType;
  accessModel: AccessModel;
  userCapability: UserCapability;
  // Sensitive Actions
  hasCreateAction: boolean;
  hasEditAction: boolean;
  hasDeleteAction: boolean;
  hasApprovalAction: boolean;
  hasExportAction: boolean;
  hasShareAction: boolean;
  hasIrreversibleAction: boolean;
  // Persistence & Lifecycle
  hasTemporaryData: boolean;
  hasPersistentData: boolean;
  hasRetentionPolicy: boolean;
  hasOnDemandDeletion: boolean;
  hasVersioning: boolean;
  // Sharing & Integrations
  hasNoSharing: boolean;
  hasInternalIntegrations: boolean;
  hasExternalIntegrations: boolean;
  hasInternationalTransfer: boolean;
  hasWebhooks: boolean;
  // Security & Reliability
  hasAuthenticationReq: boolean;
  hasAuthorizationReq: boolean;
  hasEncryptionInTransit: boolean;
  hasEncryptionAtRest: boolean;
  hasAuditLogs: boolean;
  hasUsageMonitoring: boolean;
  // Change Impact
  hasNoImpact: boolean;
  hasChangedBehavior: boolean;
  hasNewDataPurpose: boolean;
  hasChangedDataCollection: boolean;
  hasChangedIntegrations: boolean;
  hasAffectedExistingUsers: boolean;
  // Other
  hasFinancial: boolean;
  // Compliance Standards
  complianceISO9001: boolean;
  complianceISO27001: boolean;
  complianceISO27701: boolean;
}

export interface RiskAssessment {
  riskScore: number;
  riskLabel: 'low' | 'medium' | 'high';
  riskDrivers: string[];
}

export interface SessionStatus {
  id: string;
  name: string;
  status: 'required' | 'optional' | 'not-applicable';
  reason: string;
  decisionDrivers?: Array<{ label: string; active: boolean }>;
}

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [scopeData, setScopeData] = useState<DesignScopeData>({
    deliveryType: '',
    dataInvolved: '',
    accessModel: '',
    userCapability: '',
    // Sensitive Actions - Default all unchecked
    hasCreateAction: false,
    hasEditAction: false,
    hasDeleteAction: false,
    hasApprovalAction: false,
    hasExportAction: false,
    hasShareAction: false,
    hasIrreversibleAction: false,
    // Persistence & Lifecycle
    hasTemporaryData: false,
    hasPersistentData: false,
    hasRetentionPolicy: false,
    hasOnDemandDeletion: false,
    hasVersioning: false,
    // Sharing & Integrations
    hasNoSharing: false,
    hasInternalIntegrations: false,
    hasExternalIntegrations: false,
    hasInternationalTransfer: false,
    hasWebhooks: false,
    // Security & Reliability
    hasAuthenticationReq: false,
    hasAuthorizationReq: false,
    hasEncryptionInTransit: false,
    hasEncryptionAtRest: false,
    hasAuditLogs: false,
    hasUsageMonitoring: false,
    // Change Impact
    hasNoImpact: false,
    hasChangedBehavior: false,
    hasNewDataPurpose: false,
    hasChangedDataCollection: false,
    hasChangedIntegrations: false,
    hasAffectedExistingUsers: false,
    // Other
    hasFinancial: false,
    // Compliance Standards - Default all checked
    complianceISO9001: true,
    complianceISO27001: true,
    complianceISO27701: true,
  });

  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment>({
    riskScore: 0,
    riskLabel: 'low',
    riskDrivers: [],
  });

  const [sessions, setSessions] = useState<SessionStatus[]>([]);

  const steps = [
    { number: 1, title: 'Design Scope Card', component: DesignScopeStep },
    { number: 2, title: 'Análise de Risco', component: RiskAssessmentStep },
    { number: 3, title: 'Sessões Aplicáveis', component: SessionMatrixStep },
  ];

  const currentStepData = steps[currentStep - 1];
  const CurrentComponent = currentStepData.component;

  const canProceed = () => {
    if (currentStep === 1) {
      return (
        scopeData.deliveryType !== '' &&
        scopeData.dataInvolved !== '' &&
        scopeData.accessModel !== '' &&
        scopeData.userCapability !== ''
      );
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep < steps.length && canProceed()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepNumber: number) => {
    // Allow navigation to any step that has been previously reached
    // or if the current step's validation passes
    if (stepNumber <= currentStep || canProceed()) {
      setCurrentStep(stepNumber);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Design Change & Risk Orchestrator
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Governança de Design | Análise de Risco | Documentação
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => handleStepClick(step.number)}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                      currentStep >= step.number
                        ? 'bg-blue-600 text-white group-hover:bg-blue-700'
                        : 'bg-slate-200 text-slate-600 group-hover:bg-slate-300'
                    }`}
                  >
                    {step.number}
                  </div>
                  <span
                    className={`text-sm font-medium transition-colors ${
                      currentStep >= step.number
                        ? 'text-slate-900 group-hover:text-blue-700'
                        : 'text-slate-500 group-hover:text-slate-700'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      currentStep > step.number ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <CurrentComponent
            scopeData={scopeData}
            setScopeData={setScopeData}
            riskAssessment={riskAssessment}
            setRiskAssessment={setRiskAssessment}
            sessions={sessions}
            setSessions={setSessions}
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            onClick={handleBack}
            disabled={currentStep === 1}
            variant="outline"
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar
          </Button>

          {currentStep < steps.length ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              Próximo
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <div className="text-sm text-slate-600">
              ✓ Documentação completa
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-6 text-center text-sm text-slate-500">
        Design Governance · Security-by-Design · Privacy-by-Design · Change Management
      </footer>
    </div>
  );
}

export default App;