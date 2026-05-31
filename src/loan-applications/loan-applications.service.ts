import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateLoanApplicationDto } from './dto/create-loan.dto';
import { LoanApplicationStatus } from './types/loanStatus';
import { numberReference } from './utils/referenceNumber';
import { fakeDataTest } from './mock/fakeData';
import { CreateFinancialAppDto } from './dto/create-financial.dto';
import { CreateCompleteLoanApplicationDto } from './dto/create-complete-loanApp.dto';
import type { Channel, History, LoanApplication } from './types/loan';

@Injectable()
export class LoanApplicationsService {
  private applications: LoanApplication[] = [fakeDataTest];

  private createHistoryLog(
    status: LoanApplicationStatus,
    note: string,
    channel: Channel,
  ): History {
    return {
      status,
      timestamp: new Date().toISOString(),
      note,
      updatedBy: channel === 'ASSISTED' ? 'ADVISOR' : 'USER',
    };
  }

  private buildApplication(
    basicData: CreateLoanApplicationDto,
    status: LoanApplicationStatus,
    financialData?: CreateFinancialAppDto,
  ): LoanApplication {
    return {
      id: randomUUID(),
      referenceNumber: numberReference(),
      status,

      // Basic Data
      channel: basicData.channel,
      documentType: basicData.documentType,
      documentNumber: basicData.documentNumber,
      fullName: basicData.fullName,
      phone: basicData.phone,
      email: basicData.email,
      city: basicData.city,
      loanPurpose: basicData.loanPurpose ?? '',
      dataTreatmentAccepted: basicData.dataTreatmentAccepted ?? false,

      //financie data
      monthlyIncome: financialData?.monthlyIncome ?? null,
      monthlyExpenses: financialData?.monthlyExpenses ?? null,
      requestedAmount: financialData?.requestedAmount ?? null,
      requestedTermMonths: financialData?.requestedTermMonths ?? null,

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),

      history: [
        this.createHistoryLog(status, 'Application created', basicData.channel),
      ],
    };
  }

  calculateOffer(input: {
    monthlyIncome: number;
    monthlyExpenses: number;
    requestedAmount: number;
    requestedTermMonths: number;
  }): LoanApplication['simulationResult'] {
    const {
      monthlyIncome,
      monthlyExpenses,
      requestedAmount,
      requestedTermMonths,
    } = input;

    const maxTerm = 72;

    if (requestedTermMonths > maxTerm) {
      return {
        isViable: false,
        rejectionReason: 'Term exceeds maximum allowed (72 months)',
      };
    }

    const disposableIncome = monthlyIncome - monthlyExpenses;

    if (disposableIncome <= 0) {
      return {
        isViable: false,
        rejectionReason: 'No disposable income',
      };
    }

    const monthlyRate = Math.pow(1 + 0.145, 1 / 12) - 1;

    const r = monthlyRate;
    const n = requestedTermMonths;
    const P = requestedAmount;

    const installment = (P * r) / (1 - Math.pow(1 + r, -n));

    const maxAffordable = disposableIncome * 0.4;

    const isViable = installment <= maxAffordable;

    return {
      isViable,
      approvedAmount: isViable ? P : undefined,
      interestRate: 0.145,
      monthlyInstallment: Number(installment.toFixed(2)),
      rejectionReason: isViable
        ? undefined
        : 'Installment exceeds affordability threshold',
    };
  }

  //We created the application partially
  create(dto: CreateLoanApplicationDto): LoanApplication {
    const application = this.buildApplication(dto, LoanApplicationStatus.DRAFT);

    this.applications.push(application);
    return application;
  }

  createComplete(dto: CreateCompleteLoanApplicationDto): LoanApplication {
    const application = this.buildApplication(
      dto.basicData,
      LoanApplicationStatus.PROCESSING_SIMULATION,
      dto.financialData,
    );

    this.applications.push(application);
    return application;
  }

  findAll(filters: {
    status?: LoanApplicationStatus;
    channel?: string;
    search?: string;
  }): LoanApplication[] {
    return this.applications.filter((app) => {
      if (filters.status && app.status !== filters.status) return false;
      if (filters.channel && app.channel !== filters.channel) return false;

      if (filters.search) {
        const term = filters.search.toLowerCase().trim();
        return (
          app.fullName.toLowerCase().includes(term) ||
          app.documentNumber.includes(term)
        );
      }

      return true;
    });
  }

  findOne(id: string): LoanApplication {
    const app = this.applications.find((a) => a.id === id);
    if (!app) throw new NotFoundException('Application not found');
    return app;
  }

  simulateOffer(
    id: string,
    payload: {
      monthlyIncome: number;
      monthlyExpenses: number;
      requestedAmount: number;
      requestedTermMonths: number;
    },
  ): LoanApplication {
    const app = this.findOne(id);

    if (app.status !== LoanApplicationStatus.PROCESSING_SIMULATION) {
      throw new BadRequestException(
        'Simulation can only be run on PROCESSING_SIMULATION status',
      );
    }

    const result = this.calculateOffer(payload);

    app.simulationResult = result;

    app.status = result?.isViable
      ? LoanApplicationStatus.PROCESSING_SIMULATION
      : LoanApplicationStatus.REJECTED;

    app.history.push(
      this.createHistoryLog(
        app.status,
        result?.isViable
          ? 'Simulation approved'
          : (result?.rejectionReason ?? 'Rejected'),
        'SELF_SERVICE',
      ),
    );

    app.updatedAt = new Date().toISOString();

    return app;
  }

  finalize(id: string): LoanApplication {
    const app = this.findOne(id);

    if (app.status !== LoanApplicationStatus.OFFER_GENERATED) {
      throw new BadRequestException('No approved offer to finalize');
    }

    app.status = LoanApplicationStatus.PENDING_VALIDATION;

    app.history.push(
      this.createHistoryLog(
        app.status,
        'Application submitted for bank review',
        app.channel,
      ),
    );

    app.updatedAt = new Date().toISOString();
    return app;
  }

  abandon(id: string, reason: string): LoanApplication {
    const app = this.findOne(id);

    app.status = LoanApplicationStatus.ABANDONED;
    app.abandonmentReason = reason;

    app.history.push(
      this.createHistoryLog(
        app.status,
        `Process abandoned: ${reason}`,
        app.channel,
      ),
    );

    app.updatedAt = new Date().toISOString();
    return app;
  }

  updateFinancialInformation(
    id: string,
    dto: CreateFinancialAppDto,
  ): LoanApplication {
    const app = this.findOne(id);

    Object.assign(app, {
      monthlyIncome: dto.monthlyIncome,
      monthlyExpenses: dto.monthlyExpenses,
      requestedAmount: dto.requestedAmount,
      requestedTermMonths: dto.requestedTermMonths,
      updatedAt: new Date().toISOString(),
    });

    app.history.push(
      this.createHistoryLog(
        app.status,
        'Financial information updated',
        app.channel,
      ),
    );

    return app;
  }

  updateStatus(id: string, status: LoanApplicationStatus): LoanApplication {
    const app = this.findOne(id);

    const previousStatus = app.status;

    app.status = status;
    app.updatedAt = new Date().toISOString();

    app.history.push(
      this.createHistoryLog(
        status,
        `Status changed from ${previousStatus} to ${status}`,
        app.channel,
      ),
    );

    return app;
  }
}
