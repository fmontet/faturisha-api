import { Test, TestingModule } from '@nestjs/testing';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';

const mockInvoicesService = {
  generateInvoice: jest.fn(),
};

describe('InvoicesController', () => {
  let controller: InvoicesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvoicesController],
      providers: [{ provide: InvoicesService, useValue: mockInvoicesService }],
    }).compile();

    controller = module.get<InvoicesController>(InvoicesController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should set pdf headers and return buffer', async () => {
      const mockBuffer = Buffer.from('pdf');
      mockInvoicesService.generateInvoice.mockResolvedValue({
        pdfBuffer: mockBuffer,
        subtotal: 400,
        tax: 64,
        total: 464,
      });

      const mockRes = { set: jest.fn(), end: jest.fn() };
      const dto = {
        sellerName: 'Some Farm Limited',
        buyerName: 'Green Limited',
        taxRate: 16,
        currency: 'KES',
        items: [{ name: 'Grade 1A', qty: 5, price: 60.0 }],
      };

      await controller.create(dto as any, mockRes as any);

      expect(mockRes.set).toHaveBeenCalledWith(
        expect.objectContaining({ 'Content-Type': 'application/pdf' }),
      );
      expect(mockRes.end).toHaveBeenCalledWith(mockBuffer, 'binary');
    });
  });
});
