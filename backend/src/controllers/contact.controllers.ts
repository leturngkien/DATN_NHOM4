import { Request, Response } from 'express';
import ENV_VARS from '../config/config.js';
import contactModel from '../models/contact.model.js';
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

    const newContact = await contactModel.create({
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim() || '',
      message: message.trim(),
      status: 'new'
    });

    if (!ENV_VARS.EMAIL_USER || !ENV_VARS.EMAIL_PASS) {
      res.status(500).json({ success: false, message: 'Dịch vụ email chưa được cấu hình' });
      return;
    }

    const text = [
      `Họ tên: ${newContact.name}`,
      `Email: ${newContact.email}`,
      `Số điện thoại: ${newContact.phone || 'Không cung cấp'}`,
      '',
      newContact.message
    ].join('\n');

    await sendEmail(ENV_VARS.EMAIL_USER, `Liên hệ mới từ ${newContact.name}`, text, `<pre>${text}</pre>`);

    res.status(200).json({ success: true, message: 'Gửi liên hệ thành công', data: newContact });
  } catch (error) {
    console.error('Error sending contact message:', error);
    res.status(500).json({ success: false, message: 'Không thể gửi liên hệ lúc này' });
  }
};