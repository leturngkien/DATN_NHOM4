"use client";
import {
  increaseQuantity,
  decreaseQuantity,
  removeProduct,
  setUserId,
} from "../../redux/slices/cartslice";
import { useSelector, useDispatch } from "react-redux";
import React, { useEffect } from "react";
import {
  Button,
  Input,
  Breadcrumb,
  Typography,
  Divider,
  Modal,
} from "antd";
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  LockOutlined,
  MinusOutlined,
  PlusOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./cart.css";

const { TextArea } = Input;
const { Title, Text } = Typography;

const Cart: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: cartItems, userId } = useSelector(
    (state: { cart: { items: any[]; userId: string | null } }) => state.cart
  );

  useEffect(() => {
    const storedUserId = localStorage.getItem("accountID");
    if (storedUserId && !userId) {
      dispatch(setUserId(storedUserId));
    }
  }, [dispatch, userId]);

  const breadcrumbItems = [
    {
      title: (
        <span
          className="cursor-pointer hover:text-[#FFA500]"
          onClick={() => navigate("/")}
        >
          Trang chủ
        </span>
      ),
    },
    { title: "Giỏ hàng" },
  ];

  const handleIncrement = (id: string, stockQuantity: number) => {
    const item = cartItems.find((item) => item.id === id);
    const availableStock = Number(stockQuantity || 0);

    if (item && availableStock > 0 && item.quantity >= availableStock) {
      Modal.warning({
        title: "Số lượng vượt quá tồn kho",
        content: `Số lượng tối đa có thể chọn là ${availableStock}!`,
      });
      return;
    }

    dispatch(increaseQuantity({ id }));
  };

  const handleDecrement = (id: string) => {
    const item = cartItems.find((item) => item.id === id);
    if (item && item.quantity <= 1) {
      return;
    }

    dispatch(decreaseQuantity({ id }));
  };

  const handleRemove = (id: string, name: string) => {
    Modal.confirm({
      title: "Xác nhận xóa sản phẩm",
      content: `Bạn có chắc muốn xóa "${name}" khỏi giỏ hàng không?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk() {
        dispatch(removeProduct({ id }));
      },
    });
  };

  const calculateSubtotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const handleCheckout = () => {
    if (!userId || userId === "guest") {
      Modal.warning({
        title: "Yêu cầu đăng nhập",
        content: "Vui lòng đăng nhập để tiến hành đặt hàng!",
        onOk: () => navigate("/login"),
      });
      return;
    }
    navigate("/checkout");
  };

  const formatPrice = (price: number) =>
    `${Number(price || 0).toLocaleString("vi-VN")}đ`;

  return (
    <main className="cart-page">
      <div className="cart-content">
        <Breadcrumb items={breadcrumbItems} />

        <header className="cart-heading">
          <div className="cart-heading-info">
            <p className="cart-heading-eyebrow">Pet Corner / Mua sắm</p>
            <Title level={1}>Giỏ hàng của bạn</Title>
            <Text className="cart-heading-desc">
              Kiểm tra sản phẩm trước khi hoàn tất đơn hàng.
            </Text>
          </div>
          <div className="cart-count">
            <ShoppingCartOutlined />
            {cartItems.length} sản phẩm
          </div>
        </header>

        {cartItems.length === 0 ? (
          <section className="cart-empty">
            <div className="cart-empty-icon">
              <ShoppingCartOutlined />
            </div>
            <Title level={2}>Giỏ hàng đang trống</Title>
            <Text>
              Những món đồ yêu thích cho thú cưng của bạn sẽ xuất hiện ở đây.
            </Text>
            <Button
              size="large"
              icon={<ArrowLeftOutlined />}
              className="cart-empty-cta"
              onClick={() => navigate("/")}
            >
              Tiếp tục mua sắm
            </Button>
          </section>
        ) : (
          <div className="cart-layout">
            <section className="cart-list">
              <div className="cart-list-header">
                <div>
                  <h2>Sản phẩm đã chọn</h2>
                  <p>Bạn có thể điều chỉnh số lượng bên dưới</p>
                </div>
                <span>Đang chọn</span>
              </div>

              <div className="cart-list-items">
                {cartItems.map((item) => (
                  <article key={item.id} className="cart-item">
                    <div className="cart-item-image">
                      <img
                        src={item.image || "/placeholder-image.jpg"}
                        alt={item.name}
                      />
                    </div>

                    <div className="cart-item-content">
                      <div className="cart-item-top">
                        <div className="cart-item-name">
                          <h3>{item.name}</h3>
                          <p>Đơn giá: {formatPrice(item.price)}</p>
                        </div>
                        <button
                          type="button"
                          aria-label={`Xóa ${item.name}`}
                          className="cart-item-remove"
                          onClick={() => handleRemove(item.id, item.name)}
                        >
                          <DeleteOutlined />
                        </button>
                      </div>

                      <div className="cart-item-bottom">
                        <strong>
                          {formatPrice(item.price * item.quantity)}
                        </strong>
                        <div className="cart-qty">
                          <button
                            type="button"
                            aria-label="Giảm số lượng"
                            disabled={item.quantity <= 1}
                            onClick={() => handleDecrement(item.id)}
                          >
                            <MinusOutlined />
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            type="button"
                            aria-label="Tăng số lượng"
                            onClick={() =>
                              handleIncrement(item.id, item.stockQuantity)
                            }
                          >
                            <PlusOutlined />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <aside className="cart-summary">
              <div className="cart-summary-head">
                <div className="cart-summary-head-icon">
                  <ShoppingCartOutlined />
                </div>
                <div>
                  <h2>Tóm tắt đơn hàng</h2>
                  <p>Tạm tính cho giỏ hàng hiện tại</p>
                </div>
              </div>

              <div className="cart-summary-rows">
                <div className="cart-summary-row">
                  <span>Tạm tính</span>
                  <strong>{formatPrice(calculateSubtotal())}</strong>
                </div>
                <div className="cart-summary-row">
                  <span>Phí vận chuyển</span>
                  <span className="highlight">Tính ở bước sau</span>
                </div>
              </div>

              <Divider />
              <div className="cart-summary-total">
                <span>Tổng tạm tính</span>
                <strong>{formatPrice(calculateSubtotal())}</strong>
              </div>

              <TextArea
                placeholder="Ghi chú cho đơn hàng (không bắt buộc)"
                rows={3}
              />
              <Button
                block
                size="large"
                type="primary"
                icon={<LockOutlined />}
                onClick={handleCheckout}
              >
                Tiến hành đặt hàng
              </Button>
              <Button
                block
                size="large"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate("/")}
              >
                Tiếp tục mua sắm
              </Button>
              <p className="cart-summary-footnote">
                Thanh toán an toàn và bảo mật
              </p>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
};

export default Cart;