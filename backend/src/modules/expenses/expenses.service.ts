import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Expense, ExpenseDocument } from './schemas/expense.schema';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/expense.dto';

@Injectable()
export class ExpensesService {
  constructor(@InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>) {}

  async create(userId: string, userName: string, createExpenseDto: CreateExpenseDto) {
    const expense = new this.expenseModel({
      ...createExpenseDto,
      addedBy: new Types.ObjectId(userId),
      addedByName: userName,
    });
    return expense.save();
  }

  async findAll(query: { category?: string; startDate?: string; endDate?: string }) {
    const filter: any = {};
    if (query.category) filter.category = query.category;
    if (query.startDate || query.endDate) {
      filter.date = {};
      if (query.startDate) filter.date.$gte = new Date(query.startDate);
      if (query.endDate) filter.date.$lte = new Date(query.endDate);
    }
    return this.expenseModel.find(filter).sort({ date: -1 }).exec();
  }

  async findOne(id: string) {
    const expense = await this.expenseModel.findById(id);
    if (!expense) throw new NotFoundException('Expense not found');
    return expense;
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto) {
    const expense = await this.expenseModel.findByIdAndUpdate(id, updateExpenseDto, { new: true });
    if (!expense) throw new NotFoundException('Expense not found');
    return expense;
  }

  async delete(id: string) {
    return this.expenseModel.findByIdAndDelete(id);
  }

  async getStats(startDate?: string, endDate?: string) {
    const filter: any = {};
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const [totalStats, categoryStats, monthlyStats] = await Promise.all([
      // Total expenses
      this.expenseModel.aggregate([
        { $match: filter },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      // By category
      this.expenseModel.aggregate([
        { $match: filter },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } }
      ]),
      // Monthly trend
      this.expenseModel.aggregate([
        { $match: filter },
        {
          $group: {
            _id: { year: { $year: '$date' }, month: { $month: '$date' } },
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
      ])
    ]);

    return {
      total: totalStats[0]?.total || 0,
      count: totalStats[0]?.count || 0,
      byCategory: categoryStats,
      monthlyTrend: monthlyStats.reverse(),
    };
  }

  async getRecurringExpenses() {
    return this.expenseModel.find({ isRecurring: true }).sort({ date: -1 }).exec();
  }
}
