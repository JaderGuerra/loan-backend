import { type LoanApplicationStatus } from './loanStatus';

export type Channel = 'SELF_SERVICE' | 'ASSISTED';
type HistoryUpdateBy = 'USER' | 'ADVISOR' | 'SYSTEM';
type DocumentType = 'CC' | 'CE' | 'PASSPORT';

export interface History {
  status: LoanApplicationStatus;
  timestamp: string;
  note: string;
  updatedBy: HistoryUpdateBy;
}

export interface LoanApplication {
  id: string;
  referenceNumber: string;
  channel: Channel;
  advisorId?: string;
  status: LoanApplicationStatus;

  // Step 1: Basic Data
  documentType: DocumentType;
  documentNumber: string;
  fullName: string;
  phone: string;
  email: string;
  city: string;

  // Step 2: Financial Data & Loan Request
  monthlyIncome: number | null;
  monthlyExpenses: number | null;
  requestedAmount: number | null;
  requestedTermMonths: number | null;
  loanPurpose?: string;
  dataTreatmentAccepted: boolean;

  // Simulation Result
  simulationResult?: {
    isViable: boolean;
    approvedAmount?: number;
    interestRate?: number;
    monthlyInstallment?: number;
    rejectionReason?: string;
  };

  // Tracking & Metadata
  abandonmentReason?: string;
  createdAt: string;
  updatedAt: string;
  history: History[];
}
