import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoanApplicationsModule } from './loan-applications/loan-applications.module';

@Module({
  imports: [LoanApplicationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
