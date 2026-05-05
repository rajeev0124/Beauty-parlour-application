import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Feedback, FeedbackDocument } from './schemas/feedback.schema';
import { CreateFeedbackDto, RespondToFeedbackDto } from './dto/feedback.dto';

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  constructor(
    @InjectModel(Feedback.name) private feedbackModel: Model<FeedbackDocument>,
  ) {}

  /**
   * Submit new feedback
   */
  async create(
    userId: string,
    userName: string,
    userEmail: string,
    dto: CreateFeedbackDto,
  ): Promise<FeedbackDocument> {
    // Simple sentiment analysis based on rating and keywords
    const sentiment = this.analyzeSentiment(dto.overallRating, dto.comment);

    const feedback = await this.feedbackModel.create({
      userId: new Types.ObjectId(userId),
      userName: dto.isAnonymous ? 'Anonymous' : userName,
      userEmail,
      type: dto.type,
      referenceId: dto.referenceId
        ? new Types.ObjectId(dto.referenceId)
        : undefined,
      serviceId: dto.serviceId ? new Types.ObjectId(dto.serviceId) : undefined,
      staffId: dto.staffId ? new Types.ObjectId(dto.staffId) : undefined,
      overallRating: dto.overallRating,
      ratings: dto.ratings,
      comment: dto.comment,
      tags: dto.tags || [],
      images: dto.images || [],
      isAnonymous: dto.isAnonymous || false,
      sentiment,
      isPublic: !dto.isAnonymous,
    });

    this.logger.log(
      `Feedback submitted by ${userName}: ${dto.overallRating}/5`,
    );

    return feedback;
  }

  /**
   * Get public feedback/testimonials
   */
  async getPublicFeedback(filters?: {
    type?: string;
    minRating?: number;
    limit?: number;
  }): Promise<FeedbackDocument[]> {
    const query: any = { isPublic: true, status: { $ne: 'pending' } };

    if (filters?.type) query.type = filters.type;
    if (filters?.minRating) query.overallRating = { $gte: filters.minRating };

    return this.feedbackModel
      .find(query)
      .sort({ isHighlighted: -1, createdAt: -1 })
      .limit(filters?.limit || 20)
      .select('-userEmail -sentiment');
  }

  /**
   * Get highlighted testimonials
   */
  async getTestimonials(limit = 10): Promise<FeedbackDocument[]> {
    return this.feedbackModel
      .find({ isPublic: true, isHighlighted: true, overallRating: { $gte: 4 } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('userName comment overallRating type createdAt');
  }

  /**
   * Get all feedback (admin)
   */
  async findAll(filters?: {
    type?: string;
    status?: string;
    minRating?: number;
    maxRating?: number;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ feedback: FeedbackDocument[]; total: number; pages: number }> {
    const query: any = {};

    if (filters?.type) query.type = filters.type;
    if (filters?.status) query.status = filters.status;
    if (filters?.minRating)
      query.overallRating = { ...query.overallRating, $gte: filters.minRating };
    if (filters?.maxRating)
      query.overallRating = { ...query.overallRating, $lte: filters.maxRating };

    if (filters?.startDate || filters?.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = filters.startDate;
      if (filters.endDate) query.createdAt.$lte = filters.endDate;
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const [feedback, total] = await Promise.all([
      this.feedbackModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.feedbackModel.countDocuments(query),
    ]);

    return { feedback, total, pages: Math.ceil(total / limit) };
  }

  /**
   * Get feedback by ID
   */
  async findById(id: string): Promise<FeedbackDocument> {
    const feedback = await this.feedbackModel.findById(id);
    if (!feedback) throw new NotFoundException('Feedback not found');
    return feedback;
  }

  /**
   * Get user's feedback
   */
  async findByUser(userId: string): Promise<FeedbackDocument[]> {
    return this.feedbackModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 });
  }

  /**
   * Get staff ratings
   */
  async getStaffRatings(staffId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    distribution: Record<number, number>;
    recentFeedback: FeedbackDocument[];
  }> {
    const feedback = await this.feedbackModel.find({
      staffId: new Types.ObjectId(staffId),
      isPublic: true,
    });

    const totalReviews = feedback.length;
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRating = 0;

    feedback.forEach((f) => {
      distribution[f.overallRating]++;
      totalRating += f.overallRating;
    });

    return {
      averageRating: totalReviews > 0 ? totalRating / totalReviews : 0,
      totalReviews,
      distribution,
      recentFeedback: feedback.slice(0, 5),
    };
  }

  /**
   * Respond to feedback (admin)
   */
  async respond(
    feedbackId: string,
    adminId: string,
    dto: RespondToFeedbackDto,
  ): Promise<FeedbackDocument> {
    const feedback = await this.findById(feedbackId);

    feedback.adminResponse = dto.response;
    feedback.respondedAt = new Date();
    feedback.respondedBy = new Types.ObjectId(adminId);
    feedback.status = 'responded';

    await feedback.save();

    this.logger.log(`Admin responded to feedback ${feedbackId}`);

    // Notification: User will see response on their next visit to the feedback page
    // Future enhancement: Integrate with NotificationsGateway for real-time updates

    return feedback;
  }

  /**
   * Toggle highlight (admin)
   */
  async toggleHighlight(id: string): Promise<FeedbackDocument> {
    const feedback = await this.findById(id);
    feedback.isHighlighted = !feedback.isHighlighted;
    await feedback.save();
    return feedback;
  }

  /**
   * Mark feedback as helpful
   */
  async markHelpful(
    feedbackId: string,
    userId: string,
  ): Promise<FeedbackDocument> {
    const feedback = await this.findById(feedbackId);
    const userObjectId = new Types.ObjectId(userId);

    if (feedback.helpfulBy.some((id) => id.equals(userObjectId))) {
      // Remove helpful
      feedback.helpfulBy = feedback.helpfulBy.filter(
        (id) => !id.equals(userObjectId),
      );
      feedback.helpfulCount--;
    } else {
      // Add helpful
      feedback.helpfulBy.push(userObjectId);
      feedback.helpfulCount++;
    }

    await feedback.save();
    return feedback;
  }

  /**
   * Get feedback analytics
   */
  async getAnalytics(days = 30): Promise<{
    overview: any;
    ratingTrend: any[];
    byType: any[];
    bySentiment: any;
    topIssues: string[];
    topPraises: string[];
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [overview, ratingTrend, byType, sentimentData] = await Promise.all([
      // Overview stats
      this.feedbackModel.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: null,
            totalFeedback: { $sum: 1 },
            averageRating: { $avg: '$overallRating' },
            positiveCount: {
              $sum: { $cond: [{ $gte: ['$overallRating', 4] }, 1, 0] },
            },
            negativeCount: {
              $sum: { $cond: [{ $lte: ['$overallRating', 2] }, 1, 0] },
            },
          },
        },
      ]),

      // Rating trend by day
      this.feedbackModel.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            avgRating: { $avg: '$overallRating' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // By type
      this.feedbackModel.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            avgRating: { $avg: '$overallRating' },
          },
        },
      ]),

      // Sentiment distribution
      this.feedbackModel.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: '$sentiment.label',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Extract top issues and praises from comments
    const negativeFeedback = await this.feedbackModel
      .find({ overallRating: { $lte: 2 }, createdAt: { $gte: startDate } })
      .select('tags');
    const positiveFeedback = await this.feedbackModel
      .find({ overallRating: { $gte: 4 }, createdAt: { $gte: startDate } })
      .select('tags');

    const topIssues = this.extractTopTags(negativeFeedback);
    const topPraises = this.extractTopTags(positiveFeedback);

    return {
      overview: overview[0] || {
        totalFeedback: 0,
        averageRating: 0,
        positiveCount: 0,
        negativeCount: 0,
      },
      ratingTrend,
      byType,
      bySentiment: sentimentData.reduce(
        (acc, s) => ({ ...acc, [s._id || 'unknown']: s.count }),
        {},
      ),
      topIssues,
      topPraises,
    };
  }

  /**
   * Simple sentiment analysis
   */
  private analyzeSentiment(
    rating: number,
    comment?: string,
  ): {
    score: number;
    label: string;
    keywords: string[];
  } {
    // Basic sentiment based on rating
    const score = (rating - 3) / 2; // Convert 1-5 to -1 to 1
    const label =
      rating >= 4 ? 'positive' : rating <= 2 ? 'negative' : 'neutral';

    const keywords: string[] = [];

    // Extract keywords from comment
    if (comment) {
      const positiveWords = [
        'great',
        'excellent',
        'amazing',
        'wonderful',
        'best',
        'love',
        'fantastic',
        'professional',
      ];
      const negativeWords = [
        'bad',
        'poor',
        'terrible',
        'worst',
        'hate',
        'rude',
        'dirty',
        'slow',
        'expensive',
      ];

      const lowerComment = comment.toLowerCase();

      positiveWords.forEach((word) => {
        if (lowerComment.includes(word)) keywords.push(word);
      });

      negativeWords.forEach((word) => {
        if (lowerComment.includes(word)) keywords.push(word);
      });
    }

    return { score, label, keywords };
  }

  /**
   * Extract top tags from feedback
   */
  private extractTopTags(feedback: FeedbackDocument[]): string[] {
    const tagCount: Record<string, number> = {};

    feedback.forEach((f) => {
      f.tags?.forEach((tag) => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });

    return Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);
  }
}
