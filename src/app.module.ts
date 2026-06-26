import { Module } from '@nestjs/common';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { ReceiptsModule } from './modules/receipts/receipts.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { AppController } from './app.controller';

@Module({
  imports: [InvoicesModule, ReceiptsModule, DocumentsModule],
  controllers: [AppController],
})
export class AppModule {}
