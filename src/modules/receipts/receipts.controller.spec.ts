import { Test, TestingModule } from '@nestjs/testing';
import { ReceiptsController } from './receipts.controller';
import { ReceiptsService } from './receipts.service';

const mockReceiptsService = {
  generateReceipt: jest.fn(),
};

describe('ReceiptsController', () => {
  let controller: ReceiptsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReceiptsController],
      providers: [{ provide: ReceiptsService, useValue: mockReceiptsService }],
    }).compile();

    controller = module.get<ReceiptsController>(ReceiptsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should set pdf headers and return buffer', async () => {
      const mockBuffer = Buffer.from('pdf');
      mockReceiptsService.generateReceipt.mockResolvedValue({
        pdfBuffer: mockBuffer,
        subtotal: 400,
        tax: 0,
        total: 400,
      });

      const mockRes = { set: jest.fn(), end: jest.fn() };
      const dto = {
        sellerName: 'Some Farm Limited',
        buyerName: 'Green Limited',
        taxRate: 0,
        currency: 'KES',
        transactionId: '12345HAB',
        paymentMethod: 'MPESA',
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
