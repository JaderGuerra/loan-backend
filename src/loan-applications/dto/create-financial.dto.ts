import { IsNumber, Max, Min } from 'class-validator';

export class CreateFinancialAppDto {
  @IsNumber()
  @Min(0)
  monthlyIncome!: number;

  @IsNumber()
  @Min(0)
  monthlyExpenses!: number;

  @IsNumber()
  @Min(100000)
  @Max(50000000)
  requestedAmount!: number;

  @IsNumber()
  @Min(6)
  @Max(72)
  requestedTermMonths!: number;
}
