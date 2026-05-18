import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, UpdatePaymentDto } from './dto/payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin', 'superadmin')
  findAll(@Query() query: { status?: string; method?: string }) {
    return this.paymentsService.findAll(query);
  }

  @Get(':id/invoice')
  async getInvoice(@Param('id') id: string) {
    const payment = await this.paymentsService.findById(id);
    return {
      invoiceId: `INV-${payment._id.toString().substring(0, 8).toUpperCase()}`,
      amount: payment.amount,
      paymentId: payment._id.toString(),
      status: payment.status,
      appointmentDetails: {
        serviceName: 'Premium Styling',
        date: new Date().toISOString().split('T')[0],
      }
    };
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.paymentsService.findById(id);
  }

  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @Post(':id/confirm')
  @HttpCode(HttpStatus.OK)
  async confirmPayment(@Param('id') id: string, @Body() body: { transactionId: string }) {
    return this.paymentsService.update(id, {
      status: 'completed',
      transactionId: body.transactionId,
    });
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'superadmin')
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentsService.update(id, updatePaymentDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'superadmin')
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(id);
  }
}
