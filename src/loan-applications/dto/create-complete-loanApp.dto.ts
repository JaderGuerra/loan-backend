import { ValidateNested } from 'class-validator';
import { CreateLoanApplicationDto } from './create-loan.dto';
import { CreateFinancialAppDto } from './create-financial.dto';

export class CreateCompleteLoanApplicationDto {
  @ValidateNested()
  basicData!: CreateLoanApplicationDto;

  @ValidateNested()
  financialData!: CreateFinancialAppDto;
}
