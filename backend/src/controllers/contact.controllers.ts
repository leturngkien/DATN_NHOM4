import { Request, Response } from 'express';
import ENV_VARS from '../config/config.js';
import sendEmail from '../utils/sendEmail.js';

export const sendContactMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, message } = req.body as {
      name?: string;
      email?: string;
      phone?: string;
      message?: string;
    };

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      res.status(400).json({ success: false, message: 'Vui lòng cung cấp họ tên, email và nội dung' });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      res.status(400).json({ success: false, message: 'Email không hợp lệ' });
      return;
    }

    if (!ENV_VARS.EMAIL_USER || !ENV_VARS.EMAIL_PASS) {
      res.status(500).json({ success: false, message: 'Dịch vụ email chưa được cấu hình' });
      return;
    }

    const text = [
      `Họ tên: ${name.trim()}`,
      `Email: ${email.trim()}`,
      `Số điện thoại: ${phone?.trim() || 'Không cung cấp'}`,
      '',
      message.trim()
    ].join('\n');

    await sendEmail(ENV_VARS.EMAIL_USER, `Liên hệ mới từ ${name.trim()}`, text, `<pre>${text}</pre>`);

    res.status(200).json({ success: true, message: 'Gửi liên hệ thành công' });
  } catch (error) {
    console.error('Error sending contact message:', error);
    res.status(500).json({ success: false, message: 'Không thể gửi liên hệ lúc này' });
  }
};