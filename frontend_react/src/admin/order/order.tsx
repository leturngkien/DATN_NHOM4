import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Table,
  Modal,
  Input,
  Select,
  Tag,
  Form,
  message,
  DatePicker,
} from 'antd';
import {
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined,
  ShoppingOutlined,
  ClockCircleOutlined,
  CarOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import orderApi from '../../api/orderApi';
import moment from 'moment';

const { Option } = Select;
const { RangePicker } = DatePicker;

const getErrorInfo = (error: unknown) => {
  const value = error as {
    message?: string;
    response?: { status?: number; data?: { message?: string } };
  };
  return {
    message: value?.response?.data?.message || value?.message || 'Có lỗi xảy ra',
    status: value?.response?.status,
  };
};

const formatVnd = (value?: string | number) =>
  `${Number(value || 0).toLocaleString('vi-VN')}₫`;

interface Product {
  orderDetailId: string;
  productId: string | null;
  productName: string;
  productPrice: number;
  productImage: string | null;
  quantity: number;
  totalPrice: number;
}

interface Order {
  key: string;
  orderId: string;
  fullname: string;
  phone?: string;
  orderDate?: string;
  product: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: 'UNPAID' | 'PAID' | 'FAILED' | 'CASH_ON_DELIVERY';
  quantity?: number;
  price?: string;
  products?: Product[];
}

interface FilterParams {
  status?: string;
  paymentStatus?: string;
  dateRange?: [moment.Moment, moment.Moment] | null;
  search?: string;
}

const OrderList: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FilterParams>({});
  const [form] = Form.useForm();

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderApi.getAll();
      console.log('Full API response:', response);

      if (!response.data || !response.data.result) {
        console.error('API response is missing data or result:', response);
        message.error('Không thể tải danh sách đơn hàng');
        setOrders([]);
        return;
      }

      const orderDetails = response.data.result;

      // Group order details by orderId
      const groupedOrders: { [key: string]: any } = {};

      orderDetails.forEach((detail: any) => {
        const orderId = detail.orderId._id;
        if (!groupedOrders[orderId]) {
          groupedOrders[orderId] = {
            orderId: orderId,
            orderDate: detail.orderId.order_date,
            status: detail.orderId.status,
            paymentStatus: detail.orderId.payment_status || 'UNPAID',
            fullname: detail.orderId.userID?.fullname || detail.orderId.fullname || 'Khách lẻ',
            phone: detail.orderId.userID?.phone || detail.orderId.phone || detail.orderId.inforUserGuest?.phone || 'Chưa nhập số điện thoại',
            total_price: detail.orderId.total_price,
            products: [],
          };
        }

        groupedOrders[orderId].products.push({
          orderDetailId: detail._id,
          productId: detail.productId?._id || null,
          productName: detail.productId?.name || 'Không xác định',
          productPrice: detail.product_price || 0,
          productImage: null,
          quantity: detail.quantity || 0,
          totalPrice: detail.total_price || 0,
        });
      });

      let formattedOrders: Order[] = Object.values(groupedOrders).map((order: any, index: number) => ({
        key: order.orderId || `order-${index}`,
        orderId: order.orderId || `ORDER${index}`,
        fullname: order.fullname,
        phone: order.phone,
        product: order.products.map((p: Product) => p.productName).join(', ') || 'Không xác định',
        status: (order.status || 'PENDING').toUpperCase() as Order['status'],
        paymentStatus: (order.paymentStatus || 'UNPAID').toUpperCase() as Order['paymentStatus'],
        quantity: order.products.reduce((sum: number, p: Product) => sum + p.quantity, 0) || 0,
        price: order.total_price?.toString() || '0',
        orderDate: order.orderDate ? moment(order.orderDate).format('DD/MM/YYYY HH:mm') : 'Không xác định',
        products: order.products,
      }));

      // Sort orders by orderDate in descending order (most recent first)
      formattedOrders = formattedOrders.sort((a, b) => {
        const dateA = a.orderDate !== 'Không xác định' ? moment(a.orderDate, 'DD/MM/YYYY HH:mm') : moment(0);
        const dateB = b.orderDate !== 'Không xác định' ? moment(b.orderDate, 'DD/MM/YYYY HH:mm') : moment(0);
        return dateB.valueOf() - dateA.valueOf();
      });

      const filteredOrders = applyFilters(formattedOrders);
      setOrders(filteredOrders);
    } catch (error) {
      const errorInfo = getErrorInfo(error);
      console.error('Error fetching orders:', errorInfo);
      message.error(
        errorInfo.status === 404
          ? 'Không tìm thấy API đơn hàng'
        : errorInfo.message || 'Tải danh sách đơn hàng thất bại'
      );
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (orderList: Order[]): Order[] => {
    return orderList.filter((order) => {
      let matches = true;

      if (filters.status) {
        matches = matches && order.status === filters.status;
      }

      if (filters.paymentStatus) {
        matches = matches && order.paymentStatus === filters.paymentStatus;
      }

      if (filters.dateRange) {
        const orderDate = moment(order.orderDate, 'DD/MM/YYYY HH:mm');
        matches = matches && orderDate.isBetween(filters.dateRange[0], filters.dateRange[1], 'day', '[]');
      }

      if (filters.search) {
        const searchTerm = filters.search.toLocaleLowerCase();
        matches = matches && (
          order.orderId.toLocaleLowerCase().includes(searchTerm) ||
          order.fullname.toLocaleLowerCase().includes(searchTerm)
        );
      }

      return matches;
    });
  };

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
  };

  const handleExport = () => {
    const headers = ['Mã đơn', 'Khách hàng', 'Điện thoại', 'Ngày đặt', 'Trạng thái', 'Thanh toán', 'Số lượng', 'Tổng tiền'];
    const rows = orders.map((order) => [
      order.orderId,
      order.fullname,
      order.phone || '',
      order.orderDate || '',
      order.status,
      order.paymentStatus,
      order.quantity || 0,
      order.price || '0',
    ]);
    const escapeCsv = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
    const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\r\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'orders.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleStatusFilter = (status: string) => {
    setFilters((prev) => ({ ...prev, status: status || undefined }));
  };

  const handlePaymentStatusFilter = (paymentStatus: string) => {
    setFilters((prev) => ({ ...prev, paymentStatus: paymentStatus || undefined }));
  };

  const handleDateRangeFilter = (dates: any) => {
    const dateRange = dates
      ? [moment(dates[0].valueOf()), moment(dates[1].valueOf())] as [moment.Moment, moment.Moment]
      : null;
    setFilters((prev) => ({ ...prev, dateRange }));
  };

  const handleView = (record: Order) => {
    setSelectedOrder(record);
    form.setFieldsValue({ status: record.status });
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (selectedOrder) {
        await orderApi.updateOrderStatus(selectedOrder.orderId, values.status);
        message.success('Cập nhật trạng thái đơn hàng thành công');
        await fetchOrders();
        setIsModalVisible(false);
      }
    } catch (error) {
      const errorInfo = getErrorInfo(error);
      console.error('Error updating order status:', errorInfo);
      message.error(`Cập nhật trạng thái đơn hàng thất bại: ${errorInfo.message}`);
    }
  };

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'orderId',
      key: 'orderId',
      render: (text: string) => (
        <span className="font-mono text-xs font-semibold text-[#596a60]">
          #{text ? text.substring(0, 8).toUpperCase() : 'N/A'}
        </span>
      ),
    },
    {
      title: 'Khách hàng',
      dataIndex: 'fullname',
      key: 'fullname',
      render: (text: string, record: Order) => (
        <div className="flex items-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f2e8d8]">
            <span className="text-xs font-bold text-[#9a6038]">{text ? text.charAt(0).toUpperCase() : '?'}</span>
          </div>
          <div className="ml-3 min-w-0">
            <span className="block truncate text-sm font-semibold text-[#34443a]">{text || 'Không xác định'}</span>
            <span className="text-xs text-[#81877f]">{record.phone || 'Chưa có số điện thoại'}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Đơn hàng',
      dataIndex: 'product',
      key: 'product',
      render: (text: string) => (
        <span className="line-clamp-2 text-sm leading-5 text-[#596a60]">{text}</span>
      ),
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'orderDate',
      key: 'orderDate',
      render: (text: string) => <span className="whitespace-nowrap text-xs text-[#6f7a72]">{text || '—'}</span>,
    },
    {
      title: 'SL',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 60,
      render: (quantity: number) => <span className="font-semibold text-[#47564c]">{quantity || 0}</span>,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'price',
      key: 'price',
      render: (price: string) => <span className="whitespace-nowrap font-bold text-[#9c5639]">{formatVnd(price)}</span>,
    },
    {
      title: 'Tình trạng',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig: Record<string, { color: string; text: string }> = {
          PENDING: { color: 'warning', text: 'Chờ xử lý' },
          PROCESSING: { color: 'processing', text: 'Đang xử lý' },
          SHIPPING: { color: 'blue', text: 'Đang vận chuyển' },
          DELIVERED: { color: 'success', text: 'Đã giao' },
          CANCELLED: { color: 'error', text: 'Đã hủy' },
        };
        return (
          <Tag
            color={statusConfig[status]?.color}
            className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
          >
            {statusConfig[status]?.text || status}
          </Tag>
        );
      },
    },
    {
      title: 'Trạng thái thanh toán',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (paymentStatus: string) => {
        const paymentStatusConfig: Record<string, { color: string; text: string }> = {
          UNPAID: { color: 'error', text: 'Chưa thanh toán' },
          PAID: { color: 'success', text: 'Đã thanh toán' },
          FAILED: { color: 'warning', text: 'Thanh toán thất bại' },
          CASH_ON_DELIVERY: { color: 'blue', text: 'Thanh toán khi nhận hàng' },
        };
        return (
          <Tag
            color={paymentStatusConfig[paymentStatus]?.color}
            className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
          >
            {paymentStatusConfig[paymentStatus]?.text || paymentStatus}
          </Tag>
        );
      },
    },
    {
      title: 'Tính năng',
      key: 'action',
      render: (_: any, record: Order) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => handleView(record)}
          size="small"
          aria-label={`Xem đơn hàng ${record.orderId}`}
          className="rounded-md bg-[#b6512f] hover:bg-[#994326]"
        />
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-full"
    >
      <div className="max-w-7xl mx-auto">
        <div className="admin-page-head">
          <div>
            <h1>Đơn hàng</h1>
            <p>Theo dõi, lọc và cập nhật trạng thái đơn hàng.</p>
          </div>
          <span className="rounded-full border border-[#e3d5c8] bg-white px-3 py-1.5 text-xs font-semibold text-[#6a756c]">
            {orders.length} đơn đang hiển thị
          </span>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Tổng đơn hàng', value: orders.length, icon: <ShoppingOutlined />, tone: 'bg-[#f2e8d8] text-[#9a6038]' },
            { label: 'Chờ xử lý', value: orders.filter((order) => order.status === 'PENDING').length, icon: <ClockCircleOutlined />, tone: 'bg-[#f8efdc] text-[#a7782f]' },
            { label: 'Đang giao', value: orders.filter((order) => ['PROCESSING', 'SHIPPING'].includes(order.status)).length, icon: <CarOutlined />, tone: 'bg-[#e5eff0] text-[#46787b]' },
            { label: 'Đã thanh toán', value: orders.filter((order) => order.paymentStatus === 'PAID').length, icon: <CheckCircleOutlined />, tone: 'bg-[#e6efe5] text-[#4c7553]' },
          ].map((stat) => (
            <Card key={stat.label} bordered={false} className="admin-card shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-[#7a8179]">{stat.label}</p>
                  <p className="mt-2 text-2xl font-bold leading-none text-[#25362b]">{stat.value}</p>
                </div>
                <span className={`flex h-10 w-10 items-center justify-center rounded-md text-lg ${stat.tone}`}>
                  {stat.icon}
                </span>
              </div>
            </Card>
          ))}
        </div>

        <Card
          bordered={false}
          className="admin-card mb-4 shadow-sm"
          title={
            <div className="space-y-3 py-1">
              <div className="flex items-center gap-2 text-sm font-bold text-[#34443a]">
                <SearchOutlined className="text-[#b6512f]" />
                Bộ lọc đơn hàng
              </div>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_170px_190px_250px_auto_auto]">
                <Input.Search
                  placeholder="Mã đơn hoặc tên khách hàng"
                  allowClear
                  enterButton={<SearchOutlined />}
                  onSearch={handleSearch}
                  className="w-full"
                />
                <Select
                  placeholder="Lọc trạng thái"
                  allowClear
                  style={{ width: '100%' }}
                  onChange={handleStatusFilter}
                  className="text-sm"
                >
                  <Option value="PENDING">Chờ xử lý</Option>
                  <Option value="PROCESSING">Đang xử lý</Option>
                  <Option value="SHIPPING">Đang vận chuyển</Option>
                  <Option value="DELIVERED">Đã giao</Option>
                  <Option value="CANCELLED">Đã hủy</Option>
                </Select>
                <Select
                  placeholder="Lọc trạng thái thanh toán"
                  allowClear
                  style={{ width: '100%' }}
                  onChange={handlePaymentStatusFilter}
                  className="text-sm"
                >
                  <Option value="UNPAID">Chưa thanh toán</Option>
                  <Option value="PAID">Đã thanh toán</Option>
                  <Option value="CASH_ON_DELIVERY">Thanh toán khi nhận hàng</Option>
                </Select>
                <RangePicker
                  onChange={handleDateRangeFilter}
                  format="DD/MM/YYYY"
                  className="w-full text-sm"
                />
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => fetchOrders()}
                  className="rounded-md border-[#d9dfd9] text-sm"
                >
                  Làm mới
                </Button>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={handleExport}
                  className="rounded-md border-[#d9dfd9] text-sm"
                >
                  Xuất CSV
                </Button>
              </div>
            </div>
          }
        >
          <Table
            columns={columns}
            dataSource={orders}
            loading={loading}
            pagination={{
              total: orders.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `Tổng ${total} đơn hàng`,
            }}
              className="overflow-hidden rounded-lg"
              rowClassName="hover:bg-[#faf7f1]"
              scroll={{ x: 1080 }}
          />
        </Card>

        <Modal
          title={
            <div className="flex items-center gap-3">
              <EyeOutlined className="text-[#b6512f]" />
              <span className="text-[16px] font-medium text-gray-800">Chi tiết đơn hàng</span>
            </div>
          }
          open={isModalVisible}
          onOk={handleModalOk}
          onCancel={() => setIsModalVisible(false)}
          okText="Lưu thay đổi"
          cancelText="Hủy bỏ"
          width={600}
          className="top-8"
        >
          <AnimatePresence>
            {selectedOrder && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium text-gray-800 mb-4 text-[15px]">Thông tin đơn hàng</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[13px] text-gray-500">Mã đơn hàng</p>
                          <p className="text-[14px] font-normal text-gray-700">{selectedOrder.orderId}</p>
                        </div>
                        <div>
                          <p className="text-[13px] text-gray-500">Ngày đặt</p>
                          <p className="text-[14px] font-normal text-gray-700">{selectedOrder.orderDate}</p>
                        </div>
                        <div>
                          <p className="text-[13px] text-gray-500">Khách hàng</p>
                          <p className="text-[14px] font-normal text-gray-700">{selectedOrder.fullname}</p>
                        </div>
                        {/* <div>
                          <p className="text-[13px] text-gray-500">Số điện thoại</p>
                          <p className="text-[14px] font-normal text-gray-700">{selectedOrder.phone || 'Chưa nhập số điện thoại'}</p>
                        </div> */}
                        <div>
                          <p className="text-[13px] text-gray-500">Trạng thái thanh toán</p>
                          <p className="text-[14px] font-normal text-gray-700">
                            {selectedOrder.paymentStatus === 'PAID' ? 'Đã thanh toán' :
                             selectedOrder.paymentStatus === 'UNPAID' ? 'Chưa thanh toán' :
                             selectedOrder.paymentStatus === 'FAILED' ? 'Thanh toán thất bại' :
                             selectedOrder.paymentStatus === 'CASH_ON_DELIVERY' ? 'Thanh toán khi nhận hàng' :
                             'Không xác định'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2">
                    {selectedOrder?.products && selectedOrder.products.length > 0 ? (
                      <div className="p-4 bg-gray-50 rounded-lg max-h-60 overflow-y-auto">
                        <h3 className="font-medium text-gray-800 mb-4 text-[15px]">Danh sách sản phẩm</h3>
                        {selectedOrder.products.map((product: Product, index: number) => (
                          <div key={index} className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-[13px] text-gray-500">ID Sản phẩm</p>
                              <p className="text-[14px] font-normal text-gray-700">{product.productId || 'Không xác định'}</p>
                            </div>
                            <div>
                              <p className="text-[13px] text-gray-500">Tên sản phẩm</p>
                              <p className="text-[14px] font-normal text-gray-700">{product.productName || 'Không xác định'}</p>
                            </div>
                            <div>
                              <p className="text-[13px] text-gray-500">Số lượng</p>
                              <p className="text-[14px] font-normal text-gray-700">{product.quantity || '0'}</p>
                            </div>
                            <div>
                              <p className="text-[13px] text-gray-500">Giá</p>
                              <p className="text-[14px] font-normal text-gray-700">{product.productPrice || '0'} VNĐ</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-[14px] text-gray-500">Không có sản phẩm trong đơn hàng</p>
                      </div>
                    )}
                  </div>

                  <div className="col-span-2">
                    <Form form={form} layout="vertical">
                      <Form.Item
                        label="Cập nhật trạng thái đơn hàng"
                        name="status"
                        rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                      >
                        <Select className="w-full text-[14px]">
                          <Option value="PENDING">Chờ xử lý</Option>
                          <Option value="PROCESSING">Đang xử lý</Option>
                          <Option value="SHIPPING">Đang vận chuyển</Option>
                          <Option value="SHIPPED">Đã giao hàng</Option>
                          <Option value="DELIVERED">Đã giao</Option>
                          <Option value="CANCELLED">Đã hủy</Option>
                        </Select>
                      </Form.Item>
                    </Form>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Modal>
      </div>
    </motion.div>
  );
};

export default OrderList;