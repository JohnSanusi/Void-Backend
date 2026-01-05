import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
    protected getTracker(req: Record<string, any>): string {
        return (req.ips && req.ips.length) ? req.ips[0] : req.ip; // Handle proxy headers
    }
}
