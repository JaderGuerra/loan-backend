import type { LoanApplication } from '../types/loan';
import { LoanApplicationStatus } from '../types/loanStatus';

export const fakeDataTest: LoanApplication = {
  id: '000-111-222-333',
  referenceNumber: 'CR-2026-SEED1',
  channel: 'SELF_SERVICE',
  status: LoanApplicationStatus.COMPLETED,
  documentType: 'CC',
  documentNumber: '12345678',
  fullName: 'Jader guerra',
  phone: '3001234567',
  email: 'jaderguerra.dev@gmail.com',
  city: 'Bogot3',
  monthlyIncome: 5000000,
  monthlyExpenses: 2000000,
  requestedAmount: 10000000,
  requestedTermMonths: 24,
  loanPurpose: 'Home Improvement',
  dataTreatmentAccepted: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  history: [
    {
      status: LoanApplicationStatus.DRAFT,
      timestamp: new Date().toISOString(),
      note: 'Application initialized as Draft',
      updatedBy: 'USER',
    },
    {
      status: LoanApplicationStatus.COMPLETED,
      timestamp: new Date().toISOString(),
      note: 'Application submitted for bank review',
      updatedBy: 'USER',
    },
  ],
};
