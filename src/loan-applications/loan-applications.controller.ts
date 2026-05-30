import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { LoanApplicationsService } from './loan-applications.service';
import { CreateLoanApplicationDto } from './dto/create-loan.dto';
import { LoanApplicationStatus } from './types/loanStatus';
import { CreateFinancialAppDto } from './dto/create-financial.dto';
import { CreateCompleteLoanApplicationDto } from './dto/create-complete-loanApp.dto';

@Controller('loan-applications')
export class LoanApplicationsController {
  constructor(private readonly service: LoanApplicationsService) {}

  @Post()
  create(@Body() dto: CreateLoanApplicationDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(
    @Query('status') status?: LoanApplicationStatus,
    @Query('channel') channel?: string,
    @Query('search') search?: string,
  ) {
    return this.service.findAll({ status, channel, search });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post(':id/simulate')
  simulate(@Param('id') id: string) {
    return this.service.simulateOffer(id);
  }

  @Patch(':id/finalize')
  finalize(@Param('id') id: string) {
    return this.service.finalize(id);
  }

  @Patch(':id/abandon')
  abandon(@Param('id') id: string, @Body('reason') reason: string) {
    return this.service.abandon(id, reason);
  }

  @Patch(':id/financial-information')
  updateFinancialInformation(
    @Param('id') id: string,
    @Body() dto: CreateFinancialAppDto,
  ) {
    return this.service.updateFinancialInformation(id, dto);
  }

  @Post('complete')
  createComplete(@Body() dto: CreateCompleteLoanApplicationDto) {
    return this.service.createComplete(dto);
  }
}
