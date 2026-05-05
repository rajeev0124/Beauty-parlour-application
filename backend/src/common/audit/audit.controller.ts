import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Audit')
@ApiBearerAuth('JWT-auth')
@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'superadmin')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Get audit logs with filters' })
  async findAll(
    @Query('userId') userId?: string,
    @Query('entity') entity?: string,
    @Query('entityId') entityId?: string,
    @Query('action') action?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.auditService.findAll({
      userId,
      entity,
      entityId,
      action,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
    });
  }

  @Get('entity/:entity/:entityId')
  @ApiOperation({ summary: 'Get history of a specific entity' })
  async getEntityHistory(
    @Query('entity') entity: string,
    @Query('entityId') entityId: string,
  ) {
    return this.auditService.getEntityHistory(entity, entityId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get user activity' })
  async getUserActivity(
    @Query('userId') userId: string,
    @Query('limit') limit?: string,
  ) {
    return this.auditService.getUserActivity(
      userId,
      limit ? parseInt(limit) : 50,
    );
  }

  @Get('admin-actions')
  @ApiOperation({ summary: 'Get recent admin actions' })
  async getRecentAdminActions(@Query('limit') limit?: string) {
    return this.auditService.getRecentAdminActions(
      limit ? parseInt(limit) : 100,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get audit statistics' })
  async getStats(@Query('days') days?: string) {
    return this.auditService.getStats(days ? parseInt(days) : 30);
  }
}
