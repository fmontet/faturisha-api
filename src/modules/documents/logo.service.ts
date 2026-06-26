import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { lookup } from 'dns/promises';
import { readFile } from 'fs/promises';
import { isIP } from 'net';
import { join } from 'path';
import { parsePositiveInteger } from '../../common/security';

const DEFAULT_LOGO_FETCH_TIMEOUT_MS = 3_000;
const DEFAULT_LOGO_MAX_BYTES = 512 * 1024;
const ALLOWED_LOGO_CONTENT_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
]);

@Injectable()
export class LogoService implements OnModuleInit {
  private readonly logger = new Logger(LogoService.name);
  private fallbackLogoDataUrl: string | null = null;

  async onModuleInit() {
    try {
      const logoBuffer = await readFile(
        join(__dirname, '..', '..', 'assets', 'sample-logo.png'),
      );
      this.fallbackLogoDataUrl = `data:image/png;base64,${logoBuffer.toString('base64')}`;
      this.logger.log('Logo loaded successfully');
    } catch {
      this.fallbackLogoDataUrl = null;
      this.logger.log('No logo found, proceeding without it');
    }
  }

  async resolveLogoDataUrl(logoUrl?: string): Promise<string | null> {
    if (!logoUrl) {
      return this.fallbackLogoDataUrl;
    }

    return this.fetchLogoDataUrl(logoUrl);
  }

  private async fetchLogoDataUrl(logoUrl: string): Promise<string> {
    let url: URL;

    try {
      url = new URL(logoUrl);
    } catch {
      throw new BadRequestException('logoUrl must be a valid HTTPS URL');
    }

    if (url.protocol !== 'https:') {
      throw new BadRequestException('logoUrl must use HTTPS');
    }

    await this.assertLogoHostIsPublic(url.hostname);

    const timeoutMs = parsePositiveInteger(
      process.env.LOGO_FETCH_TIMEOUT_MS,
      DEFAULT_LOGO_FETCH_TIMEOUT_MS,
    );
    const maxBytes = parsePositiveInteger(
      process.env.LOGO_MAX_BYTES,
      DEFAULT_LOGO_MAX_BYTES,
    );

    let response: Response;

    try {
      response = await fetch(url, {
        redirect: 'manual',
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch {
      throw new BadRequestException('logoUrl could not be fetched');
    }

    if (response.status >= 300 && response.status < 400) {
      throw new BadRequestException('logoUrl redirects are not allowed');
    }

    if (!response.ok) {
      throw new BadRequestException('logoUrl could not be fetched');
    }

    const contentType = this.getNormalizedContentType(response);
    if (!ALLOWED_LOGO_CONTENT_TYPES.has(contentType)) {
      throw new BadRequestException(
        'logoUrl must point to a PNG, JPEG, or WebP image',
      );
    }

    const contentLength = response.headers.get('content-length');
    if (contentLength && Number(contentLength) > maxBytes) {
      throw new BadRequestException('logoUrl image is too large');
    }

    const logoBuffer = await this.readResponseBody(response, maxBytes);
    return `data:${contentType};base64,${logoBuffer.toString('base64')}`;
  }

  private async assertLogoHostIsPublic(hostname: string): Promise<void> {
    if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
      throw new BadRequestException('logoUrl host is not allowed');
    }

    if (isIP(hostname)) {
      this.assertIpAddressIsPublic(hostname);
      return;
    }

    let addresses: { address: string }[];

    try {
      addresses = await lookup(hostname, { all: true });
    } catch {
      throw new BadRequestException('logoUrl host could not be resolved');
    }

    if (addresses.length === 0) {
      throw new BadRequestException('logoUrl host could not be resolved');
    }

    for (const { address } of addresses) {
      this.assertIpAddressIsPublic(address);
    }
  }

  private assertIpAddressIsPublic(address: string): void {
    if (this.isPrivateIpAddress(address)) {
      throw new BadRequestException('logoUrl host is not allowed');
    }
  }

  private isPrivateIpAddress(address: string): boolean {
    const version = isIP(address);

    if (version === 4) {
      const [a, b] = address.split('.').map(Number);
      return (
        a === 0 ||
        a === 10 ||
        a === 127 ||
        (a === 100 && b >= 64 && b <= 127) ||
        (a === 169 && b === 254) ||
        (a === 172 && b >= 16 && b <= 31) ||
        (a === 192 && (b === 0 || b === 168)) ||
        (a === 198 && (b === 18 || b === 19)) ||
        a >= 224
      );
    }

    if (version === 6) {
      const normalized = address.toLowerCase();

      if (normalized.startsWith('::ffff:')) {
        return this.isPrivateIpAddress(normalized.slice('::ffff:'.length));
      }

      return (
        normalized === '::1' ||
        normalized === '::' ||
        normalized.startsWith('fc') ||
        normalized.startsWith('fd') ||
        normalized.startsWith('fe80:') ||
        normalized.startsWith('ff')
      );
    }

    return true;
  }

  private getNormalizedContentType(response: Response): string {
    return response.headers.get('content-type')?.split(';')[0].trim() ?? '';
  }

  private async readResponseBody(
    response: Response,
    maxBytes: number,
  ): Promise<Buffer> {
    if (!response.body) {
      const buffer = Buffer.from(await response.arrayBuffer());

      if (buffer.byteLength > maxBytes) {
        throw new BadRequestException('logoUrl image is too large');
      }

      return buffer;
    }

    const reader = response.body.getReader();
    const chunks: Buffer[] = [];
    let totalBytes = 0;

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      totalBytes += value.byteLength;

      if (totalBytes > maxBytes) {
        await reader.cancel();
        throw new BadRequestException('logoUrl image is too large');
      }

      chunks.push(Buffer.from(value));
    }

    return Buffer.concat(chunks, totalBytes);
  }
}
