import {
  IsEnum,
  IsOptional,
  IsString,
  IsNotEmpty,
  IsEmail,
  IsBoolean,
  MinLength,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class CreateLoanApplicationDto {
  @IsEnum(['SELF_SERVICE', 'ASSISTED'])
  channel!: 'SELF_SERVICE' | 'ASSISTED';

  @IsString()
  @IsOptional()
  advisorId?: string;

  @IsEnum(['CC', 'CE', 'PASSPORT'])
  documentType!: 'CC' | 'CE' | 'PASSPORT';

  @IsString()
  @IsNotEmpty()
  documentNumber!: string;

  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  fullName!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsString()
  @IsOptional()
  loanPurpose?: string;

  @IsBoolean()
  dataTreatmentAccepted!: boolean;
}

export class UpdateLoanFinancialInfoDto {
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
