import { Module } from '@nestjs/common';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { ReceiptsController } from './modules/receipts/receipts.controller';
import { ReceiptsService } from './modules/receipts/receipts.service';
import { ReceiptsModule } from './modules/receipts/receipts.module';
import { InvoicesController } from './modules/invoices/invoices.controller';
import { InvoicesService } from './modules/invoices/invoices.service';
import { DocumentsService } from './modules/documents/documents.service';
import { DocumentsModule } from './modules/documents/documents.module';
import { AppController } from './app.controller';

@Module({
  imports: [InvoicesModule, ReceiptsModule, DocumentsModule],
  controllers: [InvoicesController, ReceiptsController, AppController],
  providers: [InvoicesService, ReceiptsService, DocumentsService],
})
export class AppModule {}
