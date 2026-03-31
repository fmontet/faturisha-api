import { Test, TestingModule } from '@nestjs/testing';
import { InvoicesService } from './invoices.service';
import { DocumentsService } from '../documents/documents.service';
import { createTemplateUtils } from '../documents/definitions';

const mockEscapeHtml = (s: string) => s;
const mockFormatCurrency = (n: number, currency: string) => `${currency} ${n}`;

const mockDocumentsService = {
  calculateTotals: jest.fn(),
  generatePdf: jest.fn(),
  escapeHtml: mockEscapeHtml,
  utils: createTemplateUtils(mockEscapeHtml, mockFormatCurrency),
};

describe('InvoicesService', () => {
  let service: InvoicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        { provide: DocumentsService, useValue: mockDocumentsService },
      ],
    }).compile();

    service = module.get<InvoicesService>(InvoicesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateInvoice', () => {
    it('should return pdfBuffer and totals', async () => {
      const mockTotals = { subtotal: 400, tax: 64, total: 464 };
      const mockBuffer = Buffer.from('pdf');

      mockDocumentsService.calculateTotals.mockReturnValue(mockTotals);
      mockDocumentsService.generatePdf.mockResolvedValue(mockBuffer);

      const dto = {
        sellerName: 'Acme Corp',
        buyerName: 'John Doe',
        taxRate: 16,
        currency: 'KES',
        items: [
          { name: 'Grade 1A', qty: 5, price: 60.0 },
          { name: 'Grade 1B', qty: 10, price: 10.0 },
        ],
      };

      const result = await service.generateInvoice(dto);

      expect(result.pdfBuffer).toBe(mockBuffer);
      expect(result.subtotal).toBe(400);
      expect(result.tax).toBe(64);
      expect(result.total).toBe(464);
      expect(mockDocumentsService.calculateTotals).toHaveBeenCalledWith(
        dto.items,
        dto.taxRate,
      );
      expect(mockDocumentsService.generatePdf).toHaveBeenCalled();
    });
  });
});
