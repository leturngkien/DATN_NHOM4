import { Request, Response } from 'express';
import mongoose from 'mongoose';
import serviceModel from '../models/service.model.js';
import { ServiceStatus } from '../enums/service.enum.js';

const parseNumber = (value: unknown): number | null => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

export const getAllService = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await serviceModel.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, result });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách dịch vụ:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

export const getServicesActive = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await serviceModel.find({ status: ServiceStatus.ACTIVE }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, result });
  } catch (error) {
    console.error('Lỗi khi lấy dịch vụ đang hoạt động:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

export const getServiceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'ID không hợp lệ' });
      return;
    }

    const service = await serviceModel.findById(id);
    if (!service) {
      res.status(404).json({ success: false, message: 'Không tìm thấy dịch vụ' });
      return;
    }

    res.status(200).json({ success: true, message: 'Lấy dịch vụ thành công', service });
  } catch (error) {
    console.error('Lỗi khi lấy dịch vụ:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

export const insertService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { service_name, description, duration, service_price, status } = req.body;

    if (!service_name) {
      res.status(400).json({ success: false, message: 'Vui lòng cung cấp tên dịch vụ' });
      return;
    }

    const parsedDuration = parseNumber(duration);
    const parsedPrice = parseNumber(service_price);

    if (parsedDuration === null) {
      res.status(400).json({ success: false, message: 'Thời lượng dịch vụ không hợp lệ' });
      return;
    }

    if (parsedPrice === null) {
      res.status(400).json({ success: false, message: 'Giá dịch vụ không hợp lệ' });
      return;
    }

    if (status !== undefined && !Object.values(ServiceStatus).includes(status as ServiceStatus)) {
      res.status(400).json({ success: false, message: 'Trạng thái dịch vụ không hợp lệ' });
      return;
    }

    const existingService = await serviceModel.findOne({ service_name });
    if (existingService) {
      res.status(400).json({ success: false, message: 'Dịch vụ với tên này đã tồn tại' });
      return;
    }

    const newService = new serviceModel({
      service_name,
      description: description ?? '',
      duration: parsedDuration,
      service_price: parsedPrice,
      status: status ?? ServiceStatus.ACTIVE
    });

    await newService.save();

    res.status(201).json({ success: true, message: 'Tạo dịch vụ thành công', service: newService });
  } catch (error) {
    console.error('Lỗi khi tạo dịch vụ:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

export const updateService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'ID không hợp lệ' });
      return;
    }

    const { service_name, description, duration, service_price, status } = req.body;

    if (!service_name) {
      res.status(400).json({ success: false, message: 'Vui lòng cung cấp tên dịch vụ' });
      return;
    }

    const parsedDuration = parseNumber(duration);
    const parsedPrice = parseNumber(service_price);

    if (parsedDuration === null) {
      res.status(400).json({ success: false, message: 'Thời lượng dịch vụ không hợp lệ' });
      return;
    }

    if (parsedPrice === null) {
      res.status(400).json({ success: false, message: 'Giá dịch vụ không hợp lệ' });
      return;
    }

    if (status !== undefined && !Object.values(ServiceStatus).includes(status as ServiceStatus)) {
      res.status(400).json({ success: false, message: 'Trạng thái dịch vụ không hợp lệ' });
      return;
    }

    const duplicated = await serviceModel.findOne({ service_name, _id: { $ne: id } });
    if (duplicated) {
      res.status(400).json({ success: false, message: 'Dịch vụ với tên này đã tồn tại' });
      return;
    }

    const updatedService = await serviceModel.findByIdAndUpdate(
      id,
      {
        service_name,
        description: description ?? '',
        duration: parsedDuration,
        service_price: parsedPrice,
        ...(status !== undefined ? { status } : {})
      },
      { new: true, runValidators: true }
    );

    if (!updatedService) {
      res.status(404).json({ success: false, message: 'Dịch vụ không tồn tại' });
      return;
    }

    res.status(200).json({ success: true, message: 'Cập nhật dịch vụ thành công', service: updatedService });
  } catch (error) {
    console.error('Lỗi khi cập nhật dịch vụ:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

export const toggleService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.query;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'ID không hợp lệ' });
      return;
    }

    const statusString = String(status).toLowerCase();
    if (!Object.values(ServiceStatus).includes(statusString as ServiceStatus)) {
      res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ. Chỉ chấp nhận "active" hoặc "inactive"'
      });
      return;
    }

    const service = await serviceModel.findById(id);
    if (!service) {
      res.status(404).json({ success: false, message: 'Dịch vụ không tồn tại' });
      return;
    }

    service.status = statusString;
    await service.save();

    res.status(200).json({
      success: true,
      message: statusString === ServiceStatus.INACTIVE ? 'Dịch vụ đã được ẩn' : 'Dịch vụ đã được mở lại',
      service
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái dịch vụ:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

export const deleteService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'ID không hợp lệ' });
      return;
    }

    const service = await serviceModel.findByIdAndDelete(id);
    if (!service) {
      res.status(404).json({ success: false, message: 'Không tìm thấy dịch vụ' });
      return;
    }

    res.status(200).json({ success: true, message: 'Xóa dịch vụ thành công' });
  } catch (error) {
    console.error('Lỗi khi xóa dịch vụ:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};
