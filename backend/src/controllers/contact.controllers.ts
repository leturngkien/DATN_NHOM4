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

export const getAllContacts = async (req: Request, res: Response): Promise<void> => {
  try {
    const contacts = await contactModel.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, result: contacts });
  } catch (error) {
    console.error('Error getting contacts:', error);
    res.status(500).json({ success: false, message: 'Không thể tải danh sách liên hệ' });
  }
};

export const getContactById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await contactModel.findById(id);

    if (!result) {
      res.status(404).json({ success: false, message: 'Không tìm thấy tin nhắn liên hệ' });
      return;
    }

    res.status(200).json({ success: true, result });
  } catch (error) {
    console.error('Error getting contact by id:', error);
    res.status(500).json({ success: false, message: 'Không thể tải tin nhắn liên hệ' });
  }
};

export const updateContactStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status?: 'new' | 'replied' | 'closed' };
    const validStatuses = ['new', 'replied', 'closed'];

    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
      return;
    }

    const updatedContact = await contactModel.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedContact) {
      res.status(404).json({ success: false, message: 'Tin nhắn liên hệ không tồn tại' });
      return;
    }

    res.status(200).json({ success: true, message: 'Cập nhật trạng thái thành công', data: updatedContact });
  } catch (error) {
    console.error('Error updating contact status:', error);
    res.status(500).json({ success: false, message: 'Không thể cập nhật trạng thái liên hệ' });
  }
};

export const deleteContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedContact = await contactModel.findByIdAndDelete(id);

    if (!deletedContact) {
      res.status(404).json({ success: false, message: 'Tin nhắn liên hệ không tồn tại' });
      return;
    }

    res.status(200).json({ success: true, message: 'Xóa tin nhắn liên hệ thành công' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ success: false, message: 'Không thể xóa tin nhắn liên hệ' });
  }
};