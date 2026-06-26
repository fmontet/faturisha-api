import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { LogoService } from './logo.service';

@Module({
  providers: [DocumentsService, LogoService],
  exports: [DocumentsService, LogoService],
})
export class DocumentsModule {}
