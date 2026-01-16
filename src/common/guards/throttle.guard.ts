import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): Promise<string> {
    const ips = req.ips as string[] | undefined;
    return Promise.resolve(ips && ips.length ? ips[0] : (req.ip as string));
  }
}
