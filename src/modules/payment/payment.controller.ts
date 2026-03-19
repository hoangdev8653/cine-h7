import { Controller, Post, Body, Req, Get, Query, Logger, Res } from '@nestjs/common';
import { PaymentService } from './payment.service';
import type { Response } from 'express';


@Controller('payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);
  constructor(private readonly paymentService: PaymentService) { }


  @Post('create-url')
  async createPaymentUrl(
    @Req() req: any,
    @Body('orderId') orderId: string,
    @Body('amount') amount: number,
    @Body('method') method: 'momo' | 'vnpay',
  ) {
    let clientIp =
      req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket?.remoteAddress ||
      '127.0.0.1';

    if (clientIp === '::1' || clientIp === '::ffff:127.0.0.1' || Array.isArray(clientIp)) {
      clientIp = '127.0.0.1';
    }

    if (method === 'vnpay') {
      const url = await this.paymentService.createVNPayUrl(
        orderId,
        amount,
        clientIp,
      );
      return { paymentUrl: url };
    }

    if (method === 'momo') {
      const url = await this.paymentService.createMoMoUrl(orderId, amount);
      return { paymentUrl: url };
    }
  }

  // B. MoMo sẽ ngầm gọi Webhook về đây (IPN)
  @Post('momo-ipn')
  async momoIPN(@Body() payload: any) {
    this.logger.log('--- Received MoMo IPN ---');
    this.logger.log(`Payload: ${JSON.stringify(payload)}`);
    const result = await this.paymentService.handleMoMoCallback(payload);
    this.logger.log(`Result: ${JSON.stringify(result)}`);
    return result;
  }

  // C. VNPay sẽ ngầm gọi Webhook về đây (IPN)
  @Get('vnpay-ipn')
  async vnpayIPN(@Query() query: any) {
    this.logger.log('--- Received VNPay IPN ---');
    this.logger.log(`Query: ${JSON.stringify(query)}`);
    const result = await this.paymentService.handleVNPayCallback(query);
    this.logger.log(`Result: ${JSON.stringify(result)}`);
    return result;
  }

  // D. VNPay Redirect (Khi user bấm "Quay lại ứng dụng" hoặc tự động redirect)
  @Get('vnpay-return')
  async vnpayReturn(@Query() query: any, @Res() res: Response) {
    const redirectUrl = await this.paymentService.handleVNPayReturn(query);
    return res.redirect(redirectUrl);
  }

  // E. MoMo Redirect
  @Get('momo-return')
  async momoReturn(@Query() query: any, @Res() res: Response) {
    const redirectUrl = await this.paymentService.handleMoMoReturn(query);
    return res.redirect(redirectUrl);
  }
}



