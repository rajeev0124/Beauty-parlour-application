import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cron } from '@nestjs/schedule';
import { User } from '../../schemas/user.schema';
import { Order } from '../../schemas/order.schema';
import { Appointment } from '../../schemas/appointment.schema';

interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  criteria: SegmentCriteria;
  count: number;
  lastUpdated: Date;
}

interface SegmentCriteria {
  type: 'rfm' | 'tier' | 'custom';
  recencyDays?: number;
  frequencyMin?: number;
  monetaryMin?: number;
  tier?: string;
  tags?: string[];
  customQuery?: any;
}

interface RfmScore {
  recency: number; // 1-5 (5 = most recent)
  frequency: number; // 1-5 (5 = most frequent)
  monetary: number; // 1-5 (5 = highest spending)
  total: number;
  segment: string;
}

interface CustomerProfile {
  userId: string;
  name: string;
  email: string;
  rfm: RfmScore;
  tier: string;
  lifetime: {
    totalSpent: number;
    totalOrders: number;
    totalAppointments: number;
    averageOrderValue: number;
  };
  recent: {
    lastOrderDate?: Date;
    lastAppointmentDate?: Date;
    daysSinceLastVisit: number;
  };
  tags: string[];
}

@Injectable()
export class CustomerSegmentationService {
  private readonly logger = new Logger(CustomerSegmentationService.name);
  private segments: Map<string, CustomerSegment> = new Map();

  constructor(
    @InjectModel(User.name) private userModel: Model<any>,
    @InjectModel(Order.name) private orderModel: Model<any>,
    @InjectModel(Appointment.name) private appointmentModel: Model<any>,
  ) {
    this.initDefaultSegments();
  }

  private initDefaultSegments() {
    // VIP Customers (High value)
    this.segments.set('vip', {
      id: 'vip',
      name: 'VIP Customers',
      description: 'High spending, frequent customers',
      criteria: { type: 'rfm', frequencyMin: 5, monetaryMin: 10000 },
      count: 0,
      lastUpdated: new Date(),
    });

    // Champions (Best customers)
    this.segments.set('champions', {
      id: 'champions',
      name: 'Champions',
      description: 'Best customers - recent, frequent, high spenders',
      criteria: { type: 'rfm', recencyDays: 30, frequencyMin: 3, monetaryMin: 5000 },
      count: 0,
      lastUpdated: new Date(),
    });

    // Loyal (Regular customers)
    this.segments.set('loyal', {
      id: 'loyal',
      name: 'Loyal Customers',
      description: 'Regular visiting customers',
      criteria: { type: 'rfm', frequencyMin: 3 },
      count: 0,
      lastUpdated: new Date(),
    });

    // New Customers (Last 30 days)
    this.segments.set('new', {
      id: 'new',
      name: 'New Customers',
      description: 'Customers who joined in last 30 days',
      criteria: { type: 'custom' },
      count: 0,
      lastUpdated: new Date(),
    });

    // At Risk (No visit in 60+ days)
    this.segments.set('at-risk', {
      id: 'at-risk',
      name: 'At Risk',
      description: 'No activity in 60+ days',
      criteria: { type: 'rfm', recencyDays: 60 },
      count: 0,
      lastUpdated: new Date(),
    });

    // Lost (No visit in 120+ days)
    this.segments.set('lost', {
      id: 'lost',
      name: 'Lost Customers',
      description: 'No activity in 120+ days',
      criteria: { type: 'rfm', recencyDays: 120 },
      count: 0,
      lastUpdated: new Date(),
    });
  }

  /**
   * Calculate RFM score for a customer
   */
  async calculateRfmScore(userId: string): Promise<RfmScore> {
    const now = new Date();
    
    // Get order history
    const orders = await this.orderModel.find({
      userId: new Types.ObjectId(userId),
      status: 'completed',
    }).sort({ createdAt: -1 });

    // Get appointments
    const appointments = await this.appointmentModel.find({
      userId: new Types.ObjectId(userId),
      status: 'completed',
    }).sort({ date: -1 });

    // Calculate metrics
    const lastOrder = orders[0];
    const lastAppointment = appointments[0];
    
    let lastActivityDate: Date | null = null;
    if (lastOrder && lastAppointment) {
      lastActivityDate = new Date(lastOrder.createdAt) > new Date(lastAppointment.date)
        ? new Date(lastOrder.createdAt)
        : new Date(lastAppointment.date);
    } else if (lastOrder) {
      lastActivityDate = new Date(lastOrder.createdAt);
    } else if (lastAppointment) {
      lastActivityDate = new Date(lastAppointment.date);
    }

    const daysSinceLastActivity = lastActivityDate
      ? Math.floor((now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    const totalOrders = orders.length + appointments.length;
    const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);

    // Score calculation (1-5)
    const recencyScore = daysSinceLastActivity <= 7 ? 5
      : daysSinceLastActivity <= 30 ? 4
      : daysSinceLastActivity <= 60 ? 3
      : daysSinceLastActivity <= 120 ? 2 : 1;

    const frequencyScore = totalOrders >= 10 ? 5
      : totalOrders >= 5 ? 4
      : totalOrders >= 3 ? 3
      : totalOrders >= 1 ? 2 : 1;

    const monetaryScore = totalSpent >= 20000 ? 5
      : totalSpent >= 10000 ? 4
      : totalSpent >= 5000 ? 3
      : totalSpent >= 1000 ? 2 : 1;

    const totalScore = recencyScore + frequencyScore + monetaryScore;

    // Segment assignment
    let segment: string;
    if (totalScore >= 12) segment = 'champions';
    else if (recencyScore >= 4 && frequencyScore >= 4) segment = 'loyal';
    else if (monetaryScore >= 4) segment = 'vip';
    else if (recencyScore <= 2 && frequencyScore >= 3) segment = 'at-risk';
    else if (recencyScore === 1) segment = 'lost';
    else if (totalOrders === 0) segment = 'new';
    else segment = 'regular';

    return {
      recency: recencyScore,
      frequency: frequencyScore,
      monetary: monetaryScore,
      total: totalScore,
      segment,
    };
  }

  /**
   * Get full customer profile
   */
  async getCustomerProfile(userId: string): Promise<CustomerProfile> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new Error('User not found');

    const rfm = await this.calculateRfmScore(userId);

    const orders = await this.orderModel.find({
      userId: new Types.ObjectId(userId),
      status: 'completed',
    });

    const appointments = await this.appointmentModel.find({
      userId: new Types.ObjectId(userId),
    });

    const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const lastOrder = orders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];

    const lastAppointment = appointments.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];

    const now = new Date();
    let daysSinceLastVisit = 999;
    if (lastOrder || lastAppointment) {
      const lastDate = lastOrder?.createdAt || lastAppointment?.date;
      daysSinceLastVisit = Math.floor(
        (now.getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24)
      );
    }

    return {
      userId,
      name: user.name,
      email: user.email,
      rfm,
      tier: user.membershipTier || 'standard',
      lifetime: {
        totalSpent,
        totalOrders: orders.length,
        totalAppointments: appointments.length,
        averageOrderValue: orders.length > 0 ? totalSpent / orders.length : 0,
      },
      recent: {
        lastOrderDate: lastOrder?.createdAt,
        lastAppointmentDate: lastAppointment?.date,
        daysSinceLastVisit,
      },
      tags: user.tags || [],
    };
  }

  /**
   * Get customers in a segment
   */
  async getSegmentCustomers(segmentId: string, limit = 100): Promise<CustomerProfile[]> {
    const customers = await this.userModel.find({ role: 'customer' }).limit(limit);
    const profiles: CustomerProfile[] = [];

    for (const customer of customers) {
      const profile = await this.getCustomerProfile(customer._id.toString());
      if (profile.rfm.segment === segmentId || 
          (segmentId === 'vip' && profile.tier === 'vip')) {
        profiles.push(profile);
      }
    }

    return profiles;
  }

  /**
   * Update segment counts - runs daily at 2 AM
   */
  @Cron('0 2 * * *', { name: 'segment-refresh' })
  async refreshSegmentCounts(): Promise<void> {
    this.logger.log('Refreshing customer segment counts...');

    const customers = await this.userModel.find({ role: 'customer' });
    const segmentCounts: Record<string, number> = {};

    for (const customer of customers) {
      try {
        const rfm = await this.calculateRfmScore(customer._id.toString());
        segmentCounts[rfm.segment] = (segmentCounts[rfm.segment] || 0) + 1;
      } catch (err) {
        this.logger.warn(`Failed to calculate RFM for ${customer._id}`);
      }
    }

    // Update segment counts
    for (const [id, segment] of this.segments) {
      segment.count = segmentCounts[id] || 0;
      segment.lastUpdated = new Date();
    }

    this.logger.log('Segment refresh complete:', segmentCounts);
  }

  /**
   * Get all segments with counts
   */
  async getAllSegments(): Promise<CustomerSegment[]> {
    // Trigger count refresh if stale
    const firstSegment = this.segments.values().next().value;
    if (firstSegment && 
        Date.now() - firstSegment.lastUpdated.getTime() > 24 * 60 * 60 * 1000) {
      await this.refreshSegmentCounts();
    }

    return Array.from(this.segments.values());
  }

  /**
   * Get segment analytics
   */
  async getSegmentAnalytics(): Promise<{
    segments: CustomerSegment[];
    totalCustomers: number;
    rfmDistribution: {
      recency: Record<number, number>;
      frequency: Record<number, number>;
      monetary: Record<number, number>;
    };
  }> {
    const customers = await this.userModel.find({ role: 'customer' });
    const rfmDistribution = {
      recency: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      frequency: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      monetary: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };

    for (const customer of customers) {
      try {
        const rfm = await this.calculateRfmScore(customer._id.toString());
        rfmDistribution.recency[rfm.recency]++;
        rfmDistribution.frequency[rfm.frequency]++;
        rfmDistribution.monetary[rfm.monetary]++;
      } catch {
        // Skip failed calculations
      }
    }

    return {
      segments: await this.getAllSegments(),
      totalCustomers: customers.length,
      rfmDistribution,
    };
  }

  /**
   * Add tag to customer
   */
  async tagCustomer(userId: string, tag: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      $addToSet: { tags: tag },
    });
  }

  /**
   * Remove tag from customer
   */
  async untagCustomer(userId: string, tag: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      $pull: { tags: tag },
    });
  }

  /**
   * Bulk tag customers in a segment
   */
  async bulkTagSegment(segmentId: string, tag: string): Promise<number> {
    const profiles = await this.getSegmentCustomers(segmentId);
    let count = 0;

    for (const profile of profiles) {
      await this.tagCustomer(profile.userId, tag);
      count++;
    }

    return count;
  }
}
