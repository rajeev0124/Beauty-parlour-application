import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { CreateReviewDto, ReplyReviewDto } from './dto/review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
  ) {}

  async create(
    userId: string,
    userName: string,
    createReviewDto: CreateReviewDto,
  ) {
    const review = new this.reviewModel({
      ...createReviewDto,
      userId: new Types.ObjectId(userId),
      userName,
    });
    return review.save();
  }

  async findAll(query: {
    approved?: string;
    serviceId?: string;
    staffId?: string;
  }) {
    const filter: any = { isActive: true };
    if (query.approved === 'true') filter.isApproved = true;
    if (query.approved === 'false') filter.isApproved = false;
    if (query.serviceId) filter.serviceId = new Types.ObjectId(query.serviceId);
    if (query.staffId) filter.staffId = new Types.ObjectId(query.staffId);

    return this.reviewModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async findPublic() {
    return this.reviewModel
      .find({ isApproved: true, isActive: true })
      .sort({ createdAt: -1 })
      .limit(20)
      .exec();
  }

  async approve(id: string) {
    const review = await this.reviewModel.findByIdAndUpdate(
      id,
      { isApproved: true },
      { new: true },
    );
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  async reject(id: string) {
    const review = await this.reviewModel.findByIdAndUpdate(
      id,
      { isApproved: false, isActive: false },
      { new: true },
    );
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  async reply(id: string, replyDto: ReplyReviewDto) {
    const review = await this.reviewModel.findByIdAndUpdate(
      id,
      { adminReply: replyDto.adminReply, repliedAt: new Date() },
      { new: true },
    );
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  async getStats() {
    const stats = await this.reviewModel.aggregate([
      { $match: { isApproved: true, isActive: true } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          fiveStars: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          fourStars: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          threeStars: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          twoStars: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          oneStars: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
        },
      },
    ]);
    return stats[0] || { avgRating: 0, totalReviews: 0 };
  }

  async delete(id: string) {
    return this.reviewModel.findByIdAndDelete(id);
  }
}
