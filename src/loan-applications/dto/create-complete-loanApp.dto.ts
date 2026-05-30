import { ValidateNested } from 'class-validator';
import { CreateLoanApplicationDto } from './create-loan.dto';
import { CreateFinancialAppDto } from './create-financial.dto';
import { Type } from 'class-transformer';

export class CreateCompleteLoanApplicationDto {
  @ValidateNested()
  @Type(() => CreateLoanApplicationDto)
  basicData!: CreateLoanApplicationDto;

  @ValidateNested()
  @Type(() => CreateFinancialAppDto)
  financialData!: CreateFinancialAppDto;
}
