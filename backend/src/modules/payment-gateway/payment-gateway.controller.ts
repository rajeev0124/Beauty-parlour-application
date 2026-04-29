import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { PaymentGatewayService } from './payment-gateway.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

class CreateOrderDto {
  amount: number;
  type: 'order' | 'appointment';
  referenceId: string; // orderId or appointmentId
}

class VerifyPaymentDto {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  type: 'order' | 'appointment';
  referenceId: string;
}

class RefundDto {
  paymentId: string;
  amount?: number;
}

@Controller('payment-gateway')
@UseGuards(JwtAuthGuard)
export class PaymentGatewayController {
  constructor(private readonly paymentGatewayService: PaymentGatewayService) {}

  @Post('create-order')
  async createOrder(@Body() dto: CreateOrderDto, @CurrentUser() user: any) {
    const receipt = `${dto.type}_${dto.referenceId}_${Date.now()}`;
    const order = await this.paymentGatewayService.createOrder(
      dto.amount,
      'INR',
      receipt,
      {
        type: dto.type,
        referenceId: dto.referenceId,
        userId: user._id.toString(),
      },
    );

    return {
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_simulation',
    };
  }

  @Post('verify')
  async verifyPayment(@Body() dto: VerifyPaymentDto, @CurrentUser() user: any) {
    if (dto.type === 'order') {
      return this.paymentGatewayService.processPaymentForOrder(
        user._id.toString(),
        dto.referenceId,
        dto.razorpayOrderId,
        dto.razorpayPaymentId,
        dto.razorpaySignature,
      );
    } else {
      return this.paymentGatewayService.processPaymentForAppointment(
        user._id.toString(),
        dto.referenceId,
        dto.razorpayOrderId,
        dto.razorpayPaymentId,
        dto.razorpaySignature,
      );
    }
  }

  @Post('refund')
  @UseGuards(RolesGuard)
  @Roles('admin', 'superadmin')
  async initiateRefund(@Body() dto: RefundDto) {
    return this.paymentGatewayService.initiateRefund(dto.paymentId, dto.amount);
  }

  @Get('status/:paymentId')
  async getPaymentStatus(@Param('paymentId') paymentId: string) {
    return this.paymentGatewayService.getPaymentStatus(paymentId);
  }
}
