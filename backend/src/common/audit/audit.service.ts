import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuditLog, AuditLogDocument } from './audit-log.schema';

export interface AuditContext {
  userId: string;
  userName?: string;
  userRole?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditEntry {
  action: string;
  entity: string;
  entityId?: string;
  previousData?: Record<string, any>;
  newData?: Record<string, any>;
  description?: string;
  status?: 'success' | 'failed';
  errorMessage?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectModel(AuditLog.name) private auditModel: Model<AuditLogDocument>,
  ) {}

  /**
   * Log an audit entry
   */
  async log(context: AuditContext, entry: AuditEntry): Promise<AuditLogDocument> {
    try {
      const changedFields = this.getChangedFields(entry.previousData, entry.newData);

      const auditLog = await this.auditModel.create({
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId ? new Types.ObjectId(entry.entityId) : undefined,
        userId: new Types.ObjectId(context.userId),
        userName: context.userName,
        userRole: context.userRole,
        previousData: entry.previousData,
        newData: entry.newData,
        changedFields,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        description: entry.description,
        status: entry.status || 'success',
        errorMessage: entry.errorMessage,
        metadata: entry.metadata,
      });

      this.logger.debug(
        `Audit: ${entry.action} on ${entry.entity} by ${context.userName || context.userId}`,
      );

      return auditLog;
    } catch (error) {
      this.logger.error(`Failed to create audit log: ${error.message}`);
      throw error;
    }
  }

  /**
   * Log a CREATE action
   */
  async logCreate(context: AuditContext, entity: string, entityId: string, data: any): Promise<void> {
    await this.log(context, {
      action: 'CREATE',
      entity,
      entityId,
      newData: this.sanitizeData(data),
      description: `Created new ${entity}`,
    });
  }

  /**
   * Log an UPDATE action
   */
  async logUpdate(
    context: AuditContext,
    entity: string,
    entityId: string,
    previousData: any,
    newData: any,
  ): Promise<void> {
    await this.log(context, {
      action: 'UPDATE',
      entity,
      entityId,
      previousData: this.sanitizeData(previousData),
      newData: this.sanitizeData(newData),
      description: `Updated ${entity}`,
    });
  }

  /**
   * Log a DELETE action
   */
  async logDelete(context: AuditContext, entity: string, entityId: string, data?: any): Promise<void> {
    await this.log(context, {
      action: 'DELETE',
      entity,
      entityId,
      previousData: this.sanitizeData(data),
      description: `Deleted ${entity}`,
    });
  }

  /**
   * Log a LOGIN action
   */
  async logLogin(context: AuditContext, success: boolean, errorMessage?: string): Promise<void> {
    await this.log(context, {
      action: 'LOGIN',
      entity: 'auth',
      status: success ? 'success' : 'failed',
      errorMessage,
      description: success ? 'User logged in' : 'Login attempt failed',
    });
  }

  /**
   * Log a LOGOUT action
   */
  async logLogout(context: AuditContext): Promise<void> {
    await this.log(context, {
      action: 'LOGOUT',
      entity: 'auth',
      description: 'User logged out',
    });
  }

  /**
   * Get audit logs with filters
   */
  async findAll(filters: {
    userId?: string;
    entity?: string;
    entityId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ logs: AuditLogDocument[]; total: number; pages: number }> {
    const query: any = {};

    if (filters.userId) query.userId = new Types.ObjectId(filters.userId);
    if (filters.entity) query.entity = filters.entity;
    if (filters.entityId) query.entityId = new Types.ObjectId(filters.entityId);
    if (filters.action) query.action = filters.action;

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = filters.startDate;
      if (filters.endDate) query.createdAt.$lte = filters.endDate;
    }

    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.auditModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.auditModel.countDocuments(query),
    ]);

    return {
      logs,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Get entity history
   */
  async getEntityHistory(entity: string, entityId: string): Promise<AuditLogDocument[]> {
    return this.auditModel
      .find({
        entity,
        entityId: new Types.ObjectId(entityId),
      })
      .sort({ createdAt: -1 })
      .lean();
  }

  /**
   * Get user activity
   */
  async getUserActivity(userId: string, limit = 50): Promise<AuditLogDocument[]> {
    return this.auditModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  /**
   * Get recent admin actions
   */
  async getRecentAdminActions(limit = 100): Promise<AuditLogDocument[]> {
    return this.auditModel
      .find({ userRole: { $in: ['admin', 'superadmin'] } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  /**
   * Get audit statistics
   */
  async getStats(days = 30): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await this.auditModel.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            action: '$action',
            entity: '$entity',
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.entity',
          actions: {
            $push: {
              action: '$_id.action',
              count: '$count',
            },
          },
          total: { $sum: '$count' },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const dailyActivity = await this.auditModel.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return { byEntity: stats, dailyActivity };
  }

  /**
   * Remove sensitive fields from data before logging
   */
  private sanitizeData(data: any): any {
    if (!data) return data;

    const sensitiveFields = ['password', 'refreshToken', 'resetPasswordToken', 'otp', 'otpSecret'];
    const sanitized = { ...data };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  /**
   * Get list of changed fields between two objects
   */
  private getChangedFields(previous: any, current: any): string[] {
    if (!previous || !current) return [];

    const changes: string[] = [];
    const allKeys = new Set([...Object.keys(previous), ...Object.keys(current)]);

    for (const key of allKeys) {
      if (JSON.stringify(previous[key]) !== JSON.stringify(current[key])) {
        changes.push(key);
      }
    }

    return changes;
  }
}
