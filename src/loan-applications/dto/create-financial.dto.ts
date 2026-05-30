import { IsNumber, Min } from 'class-validator';

export class CreateFinancialAppDto {
  @IsNumber()
  @Min(0)
  monthlyIncome!: number;

  @IsNumber()
  @Min(0)
  monthlyExpenses!: number;

  @IsNumber()
  @Min(0)
  requestedAmount!: number;

  @IsNumber()
  @Min(1)
  requestedTermMonths!: number;
}
