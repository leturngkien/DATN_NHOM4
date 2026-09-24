import { useEffect, useMemo, useState } from "react";
import {
  App,
  Card,
  Col,
  Progress,
  Row,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import {
  AppstoreOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import productsApi from "../../api/productsApi";
import orderApi from "../../api/orderApi";

const { Title, Text } = Typography;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatDate = (value?: string) => {
  if (!value) return "Chưa rõ";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const statusColors: Record<string, string> = {
  PENDING: "gold",
  PROCESSING: "blue",
  SHIPPING: "cyan",
  DELIVERED: "green",
  CANCELLED: "red",
  PAID: "green",
  UNPAID: "orange",
  FAILED: "red",
};

function AdminDashboard() {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });
  const [statusChart, setStatusChart] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [stockItems, setStockItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [productsResponse, ordersResponse] = await Promise.all([
          productsApi.getAll({ limit: 1000 }),
          orderApi.getAll(),
        ]);

        const productList = Array.isArray(productsResponse?.data?.result)
          ? productsResponse.data.result
          : [];

        const orderRows = Array.isArray(ordersResponse?.data?.result)
          ? ordersResponse.data.result
          : [];

        const groupedOrders = new Map<string, any>();

        orderRows.forEach((item: any) => {
          const order = item.orderId || item;
          const orderId = order?._id || item?._id || `temp-${Math.random()}`;

          if (!groupedOrders.has(orderId)) {
            groupedOrders.set(orderId, {
              _id: orderId,
              status: (order?.status || item?.status || "PENDING").toUpperCase(),
              paymentStatus: (order?.payment_status || item?.paymentStatus || "UNPAID").toUpperCase(),
              total_price: Number(order?.total_price || item?.total_price || 0),
              order_date: order?.order_date || item?.orderDate || new Date().toISOString(),
              fullname: order?.userID?.fullname || item?.fullname || "Khách hàng",
              phone: order?.userID?.phone || item?.phone || "Chưa có",
            });
          }
        });

        const ordersList = Array.from(groupedOrders.values());

        const totalRevenue = ordersList.reduce(
          (sum, order) => sum + Number(order.total_price || 0),
          0
        );

        const pendingOrders = ordersList.filter((order) =>
          ["PENDING", "PROCESSING", "SHIPPING"].includes(order.status)
        ).length;

        const statusSummary = [
          "PENDING",
          "PROCESSING",
          "SHIPPING",
          "DELIVERED",
          "CANCELLED",
        ].map((status) => ({
          name: status,
          count: ordersList.filter((order) => order.status === status).length,
        }));

        const stockProductList = productList
          .map((product: any) => ({
            name: product.name || "Sản phẩm",
            quantity: Number(product.quantity || 0),
            price: Number(product.price || 0),
          }))
          .sort((a: any, b: any) => b.quantity - a.quantity)
          .slice(0, 5);

        const recent = ordersList
          .slice()
          .sort(
            (a, b) =>
              new Date(b.order_date).getTime() - new Date(a.order_date).getTime()
          )
          .slice(0, 5)
          .map((order) => ({
            key: order._id,
            orderId: order._id,
            customer: order.fullname,
            date: formatDate(order.order_date),
            total: Number(order.total_price || 0),
            status: order.status,
            payment: order.paymentStatus,
          }));

        setStats({
          totalProducts: productList.length,
          totalOrders: ordersList.length,
          totalRevenue,
          pendingOrders,
        });

        setStatusChart(statusSummary);
        setRecentOrders(recent);
        setStockItems(stockProductList);
      } catch (error: any) {
        console.error("Dashboard load failed:", error);
        message.error(error?.message || "Không tải được dữ liệu dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [message]);

  const orderColumns = useMemo(
    () => [
      {
        title: "Mã đơn",
        dataIndex: "orderId",
        key: "orderId",
        render: (value: string) => <Text strong>{value.slice(0, 8)}</Text>,
      },
      {
        title: "Khách hàng",
        dataIndex: "customer",
        key: "customer",
      },
      {
        title: "Ngày",
        dataIndex: "date",
        key: "date",
      },
      {
        title: "Tổng tiền",
        dataIndex: "total",
        key: "total",
        render: (value: number) => formatCurrency(value),
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        render: (value: string) => (
          <Tag color={statusColors[value] || "default"}>{value}</Tag>
        ),
      },
    ],
    []
  );

  const stockColumns = useMemo(
    () => [
      {
        title: "Sản phẩm",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "Tồn kho",
        dataIndex: "quantity",
        key: "quantity",
      },
      {
        title: "Giá",
        dataIndex: "price",
        key: "price",
        render: (value: number) => formatCurrency(value),
      },
    ],
    []
  );

  return (
    <div className="admin-dashboard">
      <div className="admin-page-head">
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Tổng quan
          </Title>
          <Text type="secondary">Bảng điều khiển quản trị Pet Corner</Text>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <Card loading={loading}>
            <Statistic
              title="Tổng sản phẩm"
              value={stats.totalProducts}
              prefix={<AppstoreOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card loading={loading}>
            <Statistic
              title="Tổng đơn hàng"
              value={stats.totalOrders}
              prefix={<ShoppingCartOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card loading={loading}>
            <Statistic
              title="Doanh thu"
              value={stats.totalRevenue}
              formatter={(value) => formatCurrency(Number(value))}
              prefix={<DollarOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card loading={loading}>
            <Statistic
              title="Đơn đang xử lý"
              value={stats.pendingOrders}
              prefix={<TeamOutlined />} 
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card title="Trạng thái đơn hàng" loading={loading}>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusChart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} fill="#b6512f" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Sản phẩm tồn kho cao" loading={loading}>
            <div style={{ display: "grid", gap: 16 }}>
              {stockItems.length ? (
                stockItems.map((product) => (
                  <div key={product.name}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <Text strong>{product.name}</Text>
                      <Text type="secondary">{product.quantity} sp</Text>
                    </div>
                    <Progress
                      percent={Math.min(product.quantity / 10, 100)}
                      strokeColor="#b6512f"
                      showInfo={false}
                    />
                  </div>
                ))
              ) : (
                <Text type="secondary">Chưa có dữ liệu tồn kho.</Text>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} xl={16}>
          <Card title="Đơn hàng gần đây" loading={loading}>
            <Table
              columns={orderColumns}
              dataSource={recentOrders}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        <Col xs={24} xl={8}>
          <Card title="Top tồn kho" loading={loading}>
            <Table
              columns={stockColumns}
              dataSource={stockItems}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default AdminDashboard;
