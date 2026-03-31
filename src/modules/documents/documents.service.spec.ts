import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsService } from './documents.service';
import { createTemplateUtils } from './definitions';

const mockPage = {
  setContent: jest.fn().mockResolvedValue(undefined),
  pdf: jest.fn().mockResolvedValue(Buffer.from('pdf')),
  close: jest.fn().mockResolvedValue(undefined),
};

const mockBrowser = {
  newPage: jest.fn().mockResolvedValue(mockPage),
  close: jest.fn().mockResolvedValue(undefined),
};

jest.mock('puppeteer', () => ({
  __esModule: true,
  default: {
    launch: jest.fn().mockImplementation(() => Promise.resolve(mockBrowser)),
  },
}));

describe('DocumentsService', () => {
  let service: DocumentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentsService],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
    await service.onModuleInit();
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await service.onModuleDestroy();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateTotals', () => {
    it('should calculate totals with tax correctly', () => {
      const items = [
        { qty: 5, price: 60.0 },
        { qty: 10, price: 10.0 },
      ];
      const result = service.calculateTotals(items, 16);
      expect(result.subtotal).toBe(400);
      expect(result.tax).toBe(64);
      expect(result.total).toBe(464);
    });

    it('should calculate totals with zero tax', () => {
      const items = [{ qty: 5, price: 60.0 }];
      const result = service.calculateTotals(items, 0);
      expect(result.subtotal).toBe(300);
      expect(result.tax).toBe(0);
      expect(result.total).toBe(300);
    });

    it('should handle floating point prices correctly', () => {
      const items = [{ qty: 12, price: 9.99 }];
      const result = service.calculateTotals(items, 0);
      expect(result.subtotal).toBe(119.88);
      expect(result.total).toBe(119.88);
    });
  });

  describe('escapeHtml', () => {
    it('should escape all dangerous characters', () => {
      expect(service.escapeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
      );
    });

    it('should escape ampersands', () => {
      expect(service.escapeHtml('Acme & Co')).toBe('Acme &amp; Co');
    });

    it('should escape single quotes', () => {
      expect(service.escapeHtml("it's")).toBe('it&#039;s');
    });

    it('should return plain strings unchanged', () => {
      expect(service.escapeHtml('Hello World')).toBe('Hello World');
    });
  });

  describe('formatAddress', () => {
    const mockEscapeHtml = (s: string) => s;
    const mockFormatCurrency = (n: number, currency: string) =>
      `${currency} ${n}`;
    const utils = createTemplateUtils(mockEscapeHtml, mockFormatCurrency);

    it('should render name only when no address provided', () => {
      const result = utils.formatAddress('Some Farm Limited');
      expect(result).toContain('Some Farm Limited');
      expect(result).not.toContain('undefined');
    });

    it('should render full address when provided', () => {
      const result = utils.formatAddress('Some Farm Limited', {
        addressLine1: '1 Farm Road',
        addressLine2: 'Gate 5',
        city: 'Nairobi',
        country: 'Kenya',
        postalCode: '00100',
      });
      expect(result).toContain('Some Farm Limited');
      expect(result).toContain('1 Farm Road');
      expect(result).toContain('Gate 5');
      expect(result).toContain('Nairobi');
      expect(result).toContain('Kenya');
      expect(result).toContain('00100');
    });

    it('should render address without optional fields', () => {
      const result = utils.formatAddress('Green Limited', {
        addressLine1: '456 Green Street',
        city: 'Mombasa',
        country: 'Kenya',
      });
      expect(result).toContain('456 Green Street');
      expect(result).not.toContain('undefined');
    });
  });

  describe('generatePdf', () => {
    it('should return a buffer', async () => {
      mockBrowser.newPage.mockResolvedValue(mockPage);

      const result = await service.generatePdf('<html></html>');

      expect(Buffer.isBuffer(result)).toBe(true);
      expect(mockPage.setContent).toHaveBeenCalledWith('<html></html>', {
        waitUntil: 'networkidle0',
      });
      expect(mockPage.close).toHaveBeenCalled();
    });

    it('should close the page even if pdf throws', async () => {
      mockPage.pdf.mockRejectedValueOnce(new Error('pdf failed'));
      mockBrowser.newPage.mockResolvedValue(mockPage);

      await expect(service.generatePdf('<html></html>')).rejects.toThrow(
        'pdf failed',
      );
      expect(mockPage.close).toHaveBeenCalled();
    });
  });
});
