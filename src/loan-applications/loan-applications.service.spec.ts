import { Test, TestingModule } from '@nestjs/testing';
import { LoanApplicationsService } from './loan-applications.service';

describe('LoanApplicationsService', () => {
  let service: LoanApplicationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoanApplicationsService],
    }).compile();

    service = module.get<LoanApplicationsService>(LoanApplicationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
