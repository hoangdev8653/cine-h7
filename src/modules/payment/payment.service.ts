import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Order } from '../order/entities/order.entity';
import { Ticket } from '../ticket/entities/ticket.entity';
import * as crypto from 'crypto';
import axios from 'axios';
import * as querystring from 'qs';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  constructor(private dataSource: DataSource) { }

  // ---- THÔNG SỐ CONFIG (LẤY TỪ .ENV) ----
  private readonly MOMO_TEST_URL =
    process.env.MOMO_API_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create';
  private readonly MOMO_PARTNER_CODE = process.env.MOMO_PARTNER_CODE || 'MOMO...';
  private readonly MOMO_ACCESS_KEY = process.env.MOMO_ACCESS_KEY || 'ACCESS...';
  private readonly MOMO_SECRET_KEY = process.env.MOMO_SECRET_KEY || 'SECRET...';
  private readonly MOMO_REDIRECT_URL = process.env.MOMO_REDIRECT_URL || 'http://localhost:3007/payment/momo-return';
  private readonly MOMO_IPN_URL = process.env.MOMO_IPN_URL || 'https://your-ngrok-url.com/payment/momo-ipn';


  private readonly VNPAY_TMS_CODE = process.env.vnp_TmnCode || '2QN0Y4U0';
  private readonly VNPAY_HASH_SECRET = process.env.vnp_HashSecret || 'S9O2NIDG01I5U63H352MJS6U2J8B2M4X';
  private readonly VNPAY_URL =
    process.env.vnp_Url || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
  private readonly VNPAY_RETURN_URL = process.env.VNPAY_RETURN_URL || 'http://localhost:3007/payment/vnpay-return';
  private readonly FRONTEND_PAYMENT_SUCCESS_URL = process.env.FRONTEND_PAYMENT_SUCCESS_URL || 'http://localhost:5173/payment-success';


  // ================== CẤU HÌNH MOMO ==================
  async createMoMoUrl(orderId: string, amount: number): Promise<string> {
    const requestId = orderId + new Date().getTime();
    const rawSignature = `accessKey=${this.MOMO_ACCESS_KEY}&amount=${amount}&extraData=&ipnUrl=${this.MOMO_IPN_URL}&orderId=${orderId}&orderInfo=Thanh toan ve CineH7&partnerCode=${this.MOMO_PARTNER_CODE}&redirectUrl=${this.MOMO_REDIRECT_URL}&requestId=${requestId}&requestType=captureWallet`;

    const signature = crypto
      .createHmac('sha256', this.MOMO_SECRET_KEY)
      .update(rawSignature)
      .digest('hex');

    const requestBody = {
      partnerCode: this.MOMO_PARTNER_CODE,
      partnerName: 'CineH7',
      storeId: 'MomoTestStore',
      requestId: requestId,
      amount: amount,
      orderId: orderId,
      orderInfo: 'Thanh toan ve CineH7',
      redirectUrl: this.MOMO_REDIRECT_URL,
      ipnUrl: this.MOMO_IPN_URL,
      lang: 'vi',
      requestType: 'captureWallet',
      autoCapture: true,
      extraData: '',
      signature: signature,
    };

    try {
      const { data } = await axios.post(this.MOMO_TEST_URL, requestBody);
      return data.payUrl;
    } catch (error: any) {
      console.error('Lỗi tạo URL MoMo:', error.response?.data || error.message);
      throw new BadRequestException({
        message: 'Không thể kết nối với MoMo',
        momoError: error.response?.data || error.message
      });
    }
  }

  async handleMoMoCallback(payload: any) {
    // 1. Tạo lại chữ ký để xác minh MoMo gửi có chuẩn không
    const rawSignature = `accessKey=${this.MOMO_ACCESS_KEY}&amount=${payload.amount}&extraData=${payload.extraData}&message=${payload.message}&orderId=${payload.orderId}&orderInfo=${payload.orderInfo}&orderType=${payload.orderType}&partnerCode=${payload.partnerCode}&payType=${payload.payType}&requestId=${payload.requestId}&responseTime=${payload.responseTime}&resultCode=${payload.resultCode}&transId=${payload.transId}`;

    const signature = crypto
      .createHmac('sha256', this.MOMO_SECRET_KEY)
      .update(rawSignature)
      .digest('hex');

    if (signature !== payload.signature) {
      this.logger.error('MoMo Signature Mismatch!');
      this.logger.debug(`Expected Hash: ${signature}`);
      this.logger.debug(`Received Hash: ${payload.signature}`);
      return { resultCode: 99, message: 'Invalid Signature' };
    }

    const orderId = payload.orderId;
    this.logger.log(`Processing MoMo IPN for Order: ${orderId}, ResultCode: ${payload.resultCode}`);


    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const orderId = payload.orderId;
      const order = await queryRunner.manager.findOne(Order, {
        where: { id: orderId },
      });

      if (!order) {
        await queryRunner.rollbackTransaction();
        return { resultCode: 99, message: 'Order not found' };
      }

      if (order.status === 'PAID') {
        await queryRunner.rollbackTransaction();
        return { resultCode: 0, message: 'Order already confirmed' };
      }

      if (payload.resultCode === 0) {
        // Thanh toán thành công!
        console.log(`Order ${orderId} đã thanh toán thành công qua MoMo!`);

        order.status = 'PAID';
        order.payment_method = 'MOMO';
        order.transaction_id = payload.transId?.toString();
        order.paid_at = new Date();

        await queryRunner.manager.save(order);

        // Update tickets thành BOOKED (cho phép ghi đè kể cả vé đã CANCELLED do timeout)
        await queryRunner.manager
          .createQueryBuilder()
          .update(Ticket)
          .set({ status: 'BOOKED' })
          .where('orderId = :orderId', { orderId })
          .execute();

      } else {
        // Thanh toán thất bại hoặc hủy (Từ chối, hết hạn)
        console.log(`Order ${orderId} thanh toán MoMo thất bại/hủy!`);

        order.status = 'FAILED';
        await queryRunner.manager.save(order);

        // Huỷ vé
        await queryRunner.manager
          .createQueryBuilder()
          .update(Ticket)
          .set({ status: 'CANCELLED' })
          .where('orderId = :orderId', { orderId })
          .execute();
      }

      await queryRunner.commitTransaction();
      return { resultCode: 0, message: 'Success' }; // MoMo IPN yêu cầu HTTP 200 + Code 0

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('MoMo IPN Error:', error);
      return { resultCode: 99, message: 'Internal server error' };
    } finally {
      await queryRunner.release();
    }
  }

  // ================== CẤU HÌNH VNPAY ==================
  async createVNPayUrl(
    orderId: string,
    amount: number,
    ipAddr: string,
  ): Promise<string> {
    // VNPay yêu cầu múi giờ GMT+7 (Việt Nam)
    const date = new Date();
    const vnTime = new Date(date.getTime() + (date.getTimezoneOffset() * 60000) + (7 * 60 * 60 * 1000));
    const pad = (n: number) => (n < 10 ? '0' + n : n).toString();

    // Định dạng YYYYMMDDHHmmss
    const createDate = vnTime.getFullYear().toString() +
      pad(vnTime.getMonth() + 1) +
      pad(vnTime.getDate()) +
      pad(vnTime.getHours()) +
      pad(vnTime.getMinutes()) +
      pad(vnTime.getSeconds());

    // Thời gian hết hạn (15 phút sau)
    const expireTime = new Date(vnTime.getTime() + 15 * 60000);
    const expireDate = expireTime.getFullYear().toString() +
      pad(expireTime.getMonth() + 1) +
      pad(expireTime.getDate()) +
      pad(expireTime.getHours()) +
      pad(expireTime.getMinutes()) +
      pad(expireTime.getSeconds());

    let vnp_Params: any = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.VNPAY_TMS_CODE,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: 'Thanh_toan_ve_xem_phim_CineH7',
      vnp_OrderType: 'other',
      vnp_Amount: amount * 100, // VNPay yêu cầu nhân 100 theo cấu trúc tiền tệ
      vnp_ReturnUrl: this.VNPAY_RETURN_URL,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate,
    };

    // VNPay yêu cầu phải Sắp xếp lại Object theo Alphabet key
    // 1. Sắp xếp key
    vnp_Params = this.sortObject(vnp_Params);

    // 2. Tạo chuỗi query để băm (Chưa encode value - Quy tắc VNPay 2.1.0)
    const signData = querystring.stringify(vnp_Params, { encode: false });

    // 3. Băm HMAC-SHA512
    const hmac = crypto.createHmac('sha512', this.VNPAY_HASH_SECRET);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    // 4. Thêm signature vào params
    vnp_Params['vnp_SecureHash'] = signed;

    // 5. Tạo URL cuối cùng (Lúc này mới encode để trình duyệt hiểu)
    const finalUrl = this.VNPAY_URL + '?' + querystring.stringify(vnp_Params, { encode: false });

    return finalUrl;
  }

  async handleVNPayCallback(vnp_Params: any) {
    const vnp_SecureHash = vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    // VNPay 2.1.0: Sắp xếp tham số theo alphabet và nối lại bằng & (raw values) để kiểm tra chữ ký
    const sorted = {};
    const keys = Object.keys(vnp_Params).sort();
    for (const key of keys) {
      sorted[key] = vnp_Params[key];
    }

    const signData = querystring.stringify(sorted, { encode: false });
    const hmac = crypto.createHmac('sha512', this.VNPAY_HASH_SECRET);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (vnp_SecureHash !== signed) {
      this.logger.error('VNPay Signature Mismatch!');
      this.logger.debug(`Expected Hash: ${signed}`);
      this.logger.debug(`Received Hash: ${vnp_SecureHash}`);
      return { RspCode: '97', Message: 'Invalid signature' };
    }

    const orderId = vnp_Params['vnp_TxnRef'];
    const rspCode = vnp_Params['vnp_ResponseCode'];


      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const order = await queryRunner.manager.findOne(Order, {
          where: { id: orderId },
        });

        if (!order) {
          await queryRunner.rollbackTransaction();
          return { RspCode: '01', Message: 'Order not found' };
        }

        if (order.status === 'PAID') {
          await queryRunner.rollbackTransaction();
          return { RspCode: '02', Message: 'Order already confirmed' };
        }

        const vnpAmount = Number(vnp_Params['vnp_Amount']) / 100;
        const orderAmount = Number(order.total_amount);
        this.logger.log(`Comparing amounts for Order ${orderId}: Expected ${orderAmount}, Received ${vnpAmount}`);

        if (orderAmount !== vnpAmount) {
          this.logger.error(`Amount mismatch: Order ${orderId} expected ${orderAmount}, but VNPay sent ${vnpAmount}`);
          await queryRunner.rollbackTransaction();
          return { RspCode: '04', Message: 'Invalid amount' };
        }

        if (rspCode === '00') {

          // Giao dịch thành công
          console.log(`Order ${orderId} đã thanh toán thành công qua VNPay`);

          order.status = 'PAID';
          order.payment_method = 'VNPAY';
          order.transaction_id = vnp_Params['vnp_TransactionNo'];

          const payDateStr = vnp_Params['vnp_PayDate']; // YYYYMMDDHHmmss
          if (payDateStr) {
            const year = parseInt(payDateStr.substring(0, 4));
            const month = parseInt(payDateStr.substring(4, 6)) - 1;
            const day = parseInt(payDateStr.substring(6, 8));
            const hour = parseInt(payDateStr.substring(8, 10));
            const minute = parseInt(payDateStr.substring(10, 12));
            const second = parseInt(payDateStr.substring(12, 14));
            order.paid_at = new Date(year, month, day, hour, minute, second);
          } else {
            order.paid_at = new Date();
          }

          await queryRunner.manager.save(order);

          await queryRunner.manager
            .createQueryBuilder()
            .update(Ticket)
            .set({ status: 'BOOKED' })
            .where('orderId = :orderId', { orderId })
            .execute();

          await queryRunner.commitTransaction();
          return { RspCode: '00', Message: 'Confirm Success' };
        } else {
          console.log(`Giao dịch VNPay thất bại mã: ${rspCode}`);

          order.status = 'FAILED';
          await queryRunner.manager.save(order);

          await queryRunner.manager
            .createQueryBuilder()
            .update(Ticket)
            .set({ status: 'CANCELLED' })
            .where('orderId = :orderId', { orderId })
            .execute();

          await queryRunner.commitTransaction();
          return { RspCode: '00', Message: 'Success with failure Code' };
        }
      } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error('Error handling VNPay IPN:', error);
        return { RspCode: '99', Message: 'Unknown error' };
      } finally {
        await queryRunner.release();
      }
  }

  // --- HÀM XỬ LÝ REDIRECT TỪ TRÌNH DUYỆT (TỰ ĐỘNG CẬP NHẬT KHI QUAY VỀ APP) ---
  async handleVNPayReturn(vnp_Params: any) {
    this.logger.log('--- Processing VNPay Return (Browser Redirect) ---');
    // Chạy logic IPN để cập nhật database
    const result = await this.handleVNPayCallback({ ...vnp_Params });
    
    const orderId = vnp_Params['vnp_TxnRef'];
    const status = vnp_Params['vnp_ResponseCode'] === '00' ? 'success' : 'failed';
    
    // Redirect về Frontend kèm thông tin để user thấy
    return `${this.FRONTEND_PAYMENT_SUCCESS_URL}?orderId=${orderId}&status=${status}&vnp_ResponseCode=${vnp_Params['vnp_ResponseCode']}`;
  }

  async handleMoMoReturn(momo_Params: any) {
    this.logger.log('--- Processing MoMo Return (Browser Redirect) ---');
    // MoMo Redirect thường chỉ báo User đã thanh toán xong (hoặc hủy)
    // MoMo IPN mới là nơi chính thức xác nhận tiền đã vào túi Merchant.
    // Tuy nhiên ở local, ta có thể dùng resultCode=0 để báo success
    const orderId = momo_Params['orderId'];
    const status = momo_Params['resultCode'] == '0' ? 'success' : 'failed';
    
    return `${this.FRONTEND_PAYMENT_SUCCESS_URL}?orderId=${orderId}&status=${status}&resultCode=${momo_Params['resultCode']}`;
  }



  // Helper func cho VNPay (Quy tắc bắt buộc)
  private sortObject(obj: any) {
    let sorted: any = {};
    let str: string[] = [];
    let key: any;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(String(obj[str[key]])).replace(/%20/g, '+');
    }
    return sorted;
  }
}
