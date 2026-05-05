import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { CsrfService } from '../services/csrf.service';

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private csrfService: CsrfService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // Skip CSRF check for GET and HEAD requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return true;
    }

    const token =
      request.body?.csrfToken ||
      request.headers?.['x-csrf-token'] ||
      request.query?.csrfToken;

    if (!token) {
      throw new BadRequestException('CSRF token is required');
    }

    if (!this.csrfService.validateToken(token)) {
      throw new BadRequestException('Invalid or expired CSRF token');
    }

    return true;
  }
}
