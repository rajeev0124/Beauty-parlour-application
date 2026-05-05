import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: true, collection: 'audit_logs' })
export class AuditLog {
  @Prop({ required: true })
  action: string; // CREATE, UPDATE, DELETE, LOGIN, LOGOUT, etc.

  @Prop({ required: true })
  entity: string; // user, appointment, order, service, etc.

  @Prop({ type: Types.ObjectId })
  entityId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop()
  userName: string;

  @Prop()
  userRole: string;

  @Prop({ type: Object })
  previousData: Record<string, any>;

  @Prop({ type: Object })
  newData: Record<string, any>;

  @Prop({ type: [String] })
  changedFields: string[];

  @Prop()
  ipAddress: string;

  @Prop()
  userAgent: string;

  @Prop()
  description: string;

  @Prop({ default: 'success' })
  status: string; // success, failed

  @Prop()
  errorMessage: string;

  @Prop({ type: Object })
  metadata: Record<string, any>;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

// Indexes for efficient querying
AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ entity: 1, entityId: 1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ createdAt: -1 });
// TTL index - auto-delete logs older than 90 days
AuditLogSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 },
);
