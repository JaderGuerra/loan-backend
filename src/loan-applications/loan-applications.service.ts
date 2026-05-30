import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateLoanApplicationDto } from './dto/create-loan.dto';
import { LoanApplicationStatus } from './types/loanStatus';
import { numberReference } from './utils/referenceNumber';
import type { Channel, History, LoanApplication } from './types/loan';
import { fakeDataTest } from './mock/fakeData';
import { CreateFinancialAppDto } from './dto/create-financial.dto';
import { CreateCompleteLoanApplicationDto } from './dto/create-complete-loanApp.dto';

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

      ...basicData,
      ...financialData,

      loanPurpose: basicData.loanPurpose || '',
      dataTreatmentAccepted: basicData.dataTreatmentAccepted || false,

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),

      history: [
        this.createHistoryLog(
          status,
          status === LoanApplicationStatus.DRAFT
            ? 'Application initialized as Draft'
            : 'Application submitted for evaluation',
          basicData.channel,
        ),
      ],
    };
  }

  private checkIfItIsViable(app: LoanApplication, status: boolean) {
    if (status) {
      app.status = LoanApplicationStatus.OFFER_GENERATED;
      app.simulationResult = {
        isViable: true,
        // approvedAmount: app.requestedAmount,
        interestRate: 1.45,
        //  monthlyInstallment: Math.round((app.requestedAmount / app.requestedTermMonths) * 1.1,),
      };
      app.history.push(
        this.createHistoryLog(
          app.status,
          'Credit pre-approved successfully',
          app.channel,
        ),
      );
    } else {
      app.status = LoanApplicationStatus.REJECTED;
      app.simulationResult = {
        isViable: false,
        rejectionReason:
          'Debt-to-income ratio too high for the requested amount.',
      };
      app.history.push(
        this.createHistoryLog(
          app.status,
          'Credit rejected due to financial capacity',
          app.channel,
        ),
      );
    }
  }

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

  /* create(dto: CreateLoanApplicationDto): LoanApplication {
    const id = randomUUID();
    const referenceNumber = numberReference();
    const initialStatus = LoanApplicationStatus.DRAFT;

    const newApplication: LoanApplication = {
      id,
      referenceNumber,
      status: initialStatus,
      ...dto,
      loanPurpose: dto.loanPurpose || '',
      dataTreatmentAccepted: dto.dataTreatmentAccepted || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [
        this.createHistoryLog(
          initialStatus,
          'Application initialized as Draft',
          dto.channel,
        ),
      ],
    };

    this.applications.push(newApplication);
    return newApplication;
  } */

  findAll(filters: {
    status?: LoanApplicationStatus;
    channel?: string;
    search?: string;
  }): LoanApplication[] {
    return this.applications.filter((app) => {
      if (filters.status && app.status !== filters.status) return false;
      if (filters.channel && app.channel !== filters.channel) return false;
      if (filters.search) {
        const term = filters.search.toLocaleLowerCase().trim();
        return (
          app.fullName.toLocaleLowerCase().includes(term) ||
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

  simulateOffer(id: string): LoanApplication {
    const app = this.findOne(id);

    if (app.status !== LoanApplicationStatus.DRAFT) {
      throw new BadRequestException(
        'Simulation can only be run on DRAFT status',
      );
    }

    app.status = LoanApplicationStatus.PROCESSING_SIMULATION;
    app.history.push(
      this.createHistoryLog(app.status, 'Running risk evaluation', app.channel),
    );

    // const capacity = app.monthlyIncome - app.monthlyExpenses;
    // const isViable = capacity > app.requestedAmount / app.requestedTermMonths;

    // this.checkIfItIsViable(app, isViable);

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

    app.monthlyIncome = dto.monthlyIncome;
    app.monthlyExpenses = dto.monthlyExpenses;
    app.requestedAmount = dto.requestedAmount;
    app.requestedTermMonths = dto.requestedTermMonths;

    app.updatedAt = new Date().toISOString();

    return app;
  }

  /*  createComplete(dto: CreateCompleteLoanApplicationDto): LoanApplication {
     const id = randomUUID();
     const referenceNumber = numberReference();
     const initialStatus = LoanApplicationStatus.DRAFT;
 
     const newApplication: LoanApplication = {
       id,
       referenceNumber,
       status: initialStatus,
 
       ...dto.basicData,
       ...dto.financialData,
 
       loanPurpose: dto.basicData.loanPurpose || '',
       dataTreatmentAccepted: dto.basicData.dataTreatmentAccepted || false,
 
       createdAt: new Date().toISOString(),
       updatedAt: new Date().toISOString(),
 
       history: [
         this.createHistoryLog(
           initialStatus,
           'Complete application created',
           dto.basicData.channel,
         ),
       ],
     };
 
     this.applications.push(newApplication);
     return newApplication;
   } */
}
