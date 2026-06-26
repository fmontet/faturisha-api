import { Test, TestingModule } from '@nestjs/testing';
import { ReceiptsService } from './receipts.service';
import { DocumentsService } from '../documents/documents.service';
import { createTemplateUtils } from '../documents/definitions';
import { LogoService } from '../documents/logo.service';

const mockEscapeHtml = (s: string) => s;
const mockFormatCurrency = (n: number, currency: string) => `${currency} ${n}`;

const mockDocumentsService = {
  calculateTotals: jest.fn(),
  generatePdf: jest.fn(),
  escapeHtml: mockEscapeHtml,
  utils: createTemplateUtils(mockEscapeHtml, mockFormatCurrency),
};

const mockLogoService = {
  resolveLogoDataUrl: jest.fn(),
};

describe('ReceiptsService', () => {
  let service: ReceiptsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReceiptsService,
        { provide: DocumentsService, useValue: mockDocumentsService },
        { provide: LogoService, useValue: mockLogoService },
      ],
    }).compile();

    service = module.get<ReceiptsService>(ReceiptsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateReceipt', () => {
    it('should return pdfBuffer and totals', async () => {
      const mockTotals = { subtotal: 400, tax: 0, total: 400 };
      const mockBuffer = Buffer.from('pdf');

      mockDocumentsService.calculateTotals.mockReturnValue(mockTotals);
      mockLogoService.resolveLogoDataUrl.mockResolvedValue(
        'data:image/png;base64,logo',
      );
      mockDocumentsService.generatePdf.mockResolvedValue(mockBuffer);

      const dto = {
        sellerName: 'Some Farm Limited',
        buyerName: 'Green Limited',
        taxRate: 0,
        currency: 'KES',
        transactionId: '12345HAB',
        paymentMethod: 'MPESA',
        items: [
          { name: 'Grade 1A', qty: 5, price: 60.0 },
          { name: 'Grade 1B', qty: 10, price: 10.0 },
        ],
      };

      const result = await service.generateReceipt(dto);

      expect(result.pdfBuffer).toBe(mockBuffer);
      expect(result.subtotal).toBe(400);
      expect(result.tax).toBe(0);
      expect(result.total).toBe(400);
      expect(mockDocumentsService.calculateTotals).toHaveBeenCalledWith(
        dto.items,
        dto.taxRate,
      );
      expect(mockLogoService.resolveLogoDataUrl).toHaveBeenCalledWith(
        undefined,
      );
      expect(mockDocumentsService.generatePdf).toHaveBeenCalled();
    });
  });
});
