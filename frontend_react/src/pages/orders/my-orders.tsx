import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, PackageOpen, RefreshCw } from "lucide-react";
import orderApi from "../../api/orderApi";
import "../../components/account.css";
import "./my-orders.css";

type OrderItem = {
  orderDetailId: string;
  name?: string;
  quantity: number;
  price: number;
  image_url?: string | string[];
};

type Order = {
  id: string;
  orderNumber: string;
  date: string;
  status: string;
  payment_status: string;
  total: number;
  items: OrderItem[];
  paymentMethod?: string;
  shippingAddress?: string;
};

const orderStatuses = ["ALL", "PENDING", "PROCESSING", "SHIPPING", "DELIVERED", "CANCELLED"];

const statusLabels: Record<string, string> = {
  PENDING: "Chờ xác nhận",
  PROCESSING: "Đang xử lý",
  SHIPPING: "Đang giao",
  DELIVERED: "Đã giao",
  CANCELLED: "Đã hủy",
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price || 0);

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(new Date(date));

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const accountId = localStorage.getItem("accountID")?.replace(/"/g, "").trim();

  const fetchOrders = async () => {
    if (!accountId) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError(false);
    try {
      const response = await orderApi.getByUserId(accountId);
      setOrders(Array.isArray(response?.data) ? response.data : []);
    } catch (error: any) {
      if (error?.response?.status === 404) {
        setOrders([]);
      } else {
        setLoadError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [accountId]);

  const visibleOrders = orders.filter((order) => filter === "ALL" || order.status === filter);

  return (
    <main className="account-page">
      <div className="account-shell">
        <nav className="account-tabs" aria-label="Khu vực tài khoản">
          <Link className="account-tab" to="/userprofile/account">Hồ sơ của tôi</Link>
          <Link className="account-tab account-tab-active" to="/userprofile/orders">Đơn hàng của tôi</Link>
        </nav>

        <header className="account-heading orders-heading">
          <div>
            <span>LỊCH SỬ MUA HÀNG</span>
            <h1>Đơn hàng của tôi</h1>
            <p>Theo dõi trạng thái và xem lại chi tiết các đơn hàng của bạn.</p>
          </div>
          <button className="orders-refresh" onClick={fetchOrders} disabled={loading} aria-label="Tải lại đơn hàng">
            <RefreshCw size={16} />
            Tải lại
          </button>
        </header>

        <section className="orders-panel" aria-label="Danh sách đơn hàng">
          <div className="orders-toolbar">
            <div className="orders-filters" role="group" aria-label="Lọc theo trạng thái">
              {orderStatuses.map((status) => (
                <button
                  key={status}
                  className={filter === status ? "orders-filter orders-filter-active" : "orders-filter"}
                  onClick={() => setFilter(status)}
                >
                  {status === "ALL" ? "Tất cả" : statusLabels[status]}
                </button>
              ))}
            </div>
            <span className="orders-count">{visibleOrders.length} đơn hàng</span>
          </div>

          {loading ? (
            <div className="orders-message">Đang tải đơn hàng...</div>
          ) : loadError ? (
            <div className="orders-message orders-message-error">
              <p>Chưa thể tải danh sách đơn hàng.</p>
              <button onClick={fetchOrders}>Thử lại</button>
            </div>
          ) : !accountId ? (
            <div className="orders-message">
              <PackageOpen size={34} />
              <h2>Đăng nhập để xem đơn hàng</h2>
              <Link to="/login">Đăng nhập tài khoản</Link>
            </div>
          ) : visibleOrders.length === 0 ? (
            <div className="orders-message">
              <PackageOpen size={34} />
              <h2>{orders.length ? "Không có đơn hàng ở trạng thái này" : "Bạn chưa có đơn hàng nào"}</h2>
              {!orders.length && <Link to="/products">Khám phá sản phẩm</Link>}
            </div>
          ) : (
            <div className="orders-list">
              {visibleOrders.map((order) => {
                const expanded = expandedOrder === order.id;
                const status = order.status?.toUpperCase() || "PENDING";
                const statusClass = status.toLowerCase();

                return (
                  <article className="customer-order" key={order.id}>
                    <div className="customer-order-summary">
                      <div className="customer-order-main">
                        <div className="customer-order-title">
                          <strong>Đơn #{order.orderNumber.slice(-8).toUpperCase()}</strong>
                          <span className={`customer-order-status status-${statusClass}`}>
                            {statusLabels[status] || status}
                          </span>
                        </div>
                        <span className="customer-order-date">Đặt ngày {formatDate(order.date)}</span>
                      </div>
                      <div className="customer-order-total">
                        <span>Tổng thanh toán</span>
                        <strong>{formatPrice(order.total)}</strong>
                      </div>
                      <button
                        className="customer-order-toggle"
                        onClick={() => setExpandedOrder(expanded ? null : order.id)}
                        aria-expanded={expanded}
                        aria-label={expanded ? "Thu gọn chi tiết" : "Xem chi tiết đơn hàng"}
                      >
                        {expanded ? <ChevronUp size={19} /> : <ChevronDown size={19} />}
                      </button>
                    </div>

                    {expanded && (
                      <div className="customer-order-details">
                        <div className="customer-order-items">
                          {order.items.map((item) => {
                            const image = Array.isArray(item.image_url) ? item.image_url[0] : item.image_url;
                            return (
                              <div className="customer-order-item" key={item.orderDetailId}>
                                {image ? <img src={image} alt="" /> : <div className="customer-order-image-fallback"><PackageOpen size={18} /></div>}
                                <div>
                                  <strong>{item.name || "Sản phẩm"}</strong>
                                  <span>Số lượng: {item.quantity}</span>
                                </div>
                                <b>{formatPrice(item.price * item.quantity)}</b>
                              </div>
                            );
                          })}
                        </div>
                        <dl className="customer-order-info">
                          <div><dt>Thanh toán</dt><dd>{order.paymentMethod || "Chưa cập nhật"}</dd></div>
                          <div><dt>Trạng thái thanh toán</dt><dd>{order.payment_status === "PAID" ? "Đã thanh toán" : order.payment_status === "CASH_ON_DELIVERY" ? "Thanh toán khi nhận hàng" : "Chờ thanh toán"}</dd></div>
                          <div><dt>Địa chỉ nhận hàng</dt><dd>{order.shippingAddress || "Chưa cập nhật"}</dd></div>
                        </dl>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}