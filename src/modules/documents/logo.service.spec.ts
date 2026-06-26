import { Test, TestingModule } from '@nestjs/testing';
import { lookup } from 'dns/promises';
import { LogoService } from './logo.service';

jest.mock('dns/promises', () => ({
  lookup: jest.fn(),
}));

type LookupAll = (
  hostname: string,
  options: { all: true },
) => Promise<Array<{ address: string; family: number }>>;

describe('LogoService', () => {
  let service: LogoService;
  const mockLookup = lookup as unknown as jest.MockedFunction<LookupAll>;

  beforeEach(async () => {
    mockLookup.mockResolvedValue([{ address: '93.184.216.34', family: 4 }]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [LogoService],
    }).compile();

    service = module.get<LogoService>(LogoService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    mockLookup.mockReset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return the default logo when no logoUrl is provided', async () => {
    Object.defineProperty(service, 'fallbackLogoDataUrl', {
      value: 'data:image/png;base64,default-logo',
    });

    await expect(service.resolveLogoDataUrl()).resolves.toBe(
      'data:image/png;base64,default-logo',
    );
  });

  it('should fetch an HTTPS logo and convert it to a data URL', async () => {
    const logoBuffer = Buffer.from('logo');
    const fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(logoBuffer, {
        status: 200,
        headers: {
          'content-type': 'image/png',
          'content-length': String(logoBuffer.length),
        },
      }),
    );

    const result = await service.resolveLogoDataUrl(
      'https://example.com/logo.png',
    );

    expect(result).toBe(
      `data:image/png;base64,${logoBuffer.toString('base64')}`,
    );

    const [requestedUrl] = fetchSpy.mock.calls[0];
    expect(requestedUrl).toBeInstanceOf(URL);
    expect((requestedUrl as URL).href).toBe('https://example.com/logo.png');
  });

  it('should reject unsupported logo content types', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('not an image', {
        status: 200,
        headers: { 'content-type': 'text/html' },
      }),
    );

    await expect(
      service.resolveLogoDataUrl('https://example.com/logo.html'),
    ).rejects.toThrow('logoUrl must point to a PNG, JPEG, or WebP image');
  });
});
