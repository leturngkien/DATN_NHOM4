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

  // Hàm xử lý tăng số lượng
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

  // Hàm xử lý giảm số lượng
  const handleDecrement = (id: string) => {
    const item = cartItems.find((item) => item.id === id);
    if (item && item.quantity <= 1) {
      return; // Không giảm nếu số lượng đã là 1
    }

    dispatch(decreaseQuantity({ id }));
  };

  // Hàm xóa sản phẩm với modal xác nhận
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

  // Tính tổng tiền tạm tính
  const calculateSubtotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  // Xử lý khi nhấn "Tiến hành đặt hàng"
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
    <main className="cart-page min-h-screen bg-[#f7f8f4] px-4 pb-16 pt-5 sm:px-6 lg:px-8">
      <div className="cart-content mx-auto max-w-6xl">
        <Breadcrumb
          items={breadcrumbItems}
          className="mb-7 text-sm"
        />

        <header className="cart-heading mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#d05b48]">
              Pet Corner / Mua sắm
            </p>
            <Title level={1} className="!mb-2 !text-3xl !font-bold !text-[#26382c] sm:!text-4xl">
              Giỏ hàng của bạn
            </Title>
            <Text className="text-sm !text-[#68736a]">
              Kiểm tra sản phẩm trước khi hoàn tất đơn hàng.
            </Text>
          </div>
          <div className="cart-count flex h-11 items-center gap-2 rounded-full border border-[#dfe7d9] bg-white px-4 text-sm font-semibold text-[#526455] shadow-sm">
            <ShoppingCartOutlined className="text-[#d05b48]" />
            {cartItems.length} sản phẩm
          </div>
        </header>

        {cartItems.length === 0 ? (
          <section className="cart-empty flex min-h-[430px] flex-col items-center justify-center rounded-[28px] border border-[#e2e9dd] bg-white px-6 py-14 text-center shadow-[0_18px_50px_rgba(38,56,44,0.06)]">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#eef4e8] text-4xl text-[#829d72]">
              <ShoppingCartOutlined />
            </div>
            <Title level={2} className="!mb-2 !text-2xl !text-[#26382c]">
              Giỏ hàng đang trống
            </Title>
            <Text className="max-w-sm !text-[#7b857c]">
              Những món đồ yêu thích cho thú cưng của bạn sẽ xuất hiện ở đây.
            </Text>
            <Button
              size="large"
              icon={<ArrowLeftOutlined />}
              className="!mt-7 !h-12 !rounded-xl !border-[#26382c] !bg-[#26382c] !px-7 !font-semibold !text-white hover:!border-[#d05b48] hover:!bg-[#d05b48]"
              onClick={() => navigate("/")}
            >
              Tiếp tục mua sắm
            </Button>
          </section>
        ) : (
          <div className="cart-layout grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_350px]">
            <section className="cart-list overflow-hidden rounded-[24px] border border-[#e2e9dd] bg-white shadow-[0_18px_50px_rgba(38,56,44,0.06)]">
              <div className="cart-list-header flex items-center justify-between border-b border-[#edf0eb] px-5 py-4 sm:px-7">
                <div>
                  <h2 className="text-lg font-bold text-[#26382c]">Sản phẩm đã chọn</h2>
                  <p className="mt-1 text-xs text-[#89928b]">Bạn có thể điều chỉnh số lượng bên dưới</p>
                </div>
                <span className="rounded-full bg-[#f7eee9] px-3 py-1 text-xs font-bold text-[#d05b48]">
                  Đang chọn
                </span>
              </div>

              <div className="divide-y divide-[#edf0eb] px-5 sm:px-7">
                {cartItems.map((item) => (
                  <article key={item.id} className="cart-item flex gap-4 py-5 sm:gap-5">
                    <div className="cart-item-image h-[88px] w-[88px] flex-shrink-0 overflow-hidden rounded-2xl bg-[#f4f6f1] sm:h-24 sm:w-24">
                      <img
                        src={item.image || "/placeholder-image.jpg"}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="cart-item-content min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="line-clamp-2 text-sm font-bold leading-5 text-[#26382c] sm:text-base">
                            {item.name}
                          </h3>
                          <p className="mt-1 text-xs text-[#89928b]">Đơn giá: {formatPrice(item.price)}</p>
                        </div>
                        <button
                          type="button"
                          aria-label={`Xóa ${item.name}`}
                          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[#a5aea6] transition hover:bg-[#fff1ee] hover:text-[#d05b48]"
                          onClick={() => handleRemove(item.id, item.name)}
                        >
                          <DeleteOutlined />
                        </button>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <strong className="text-base font-bold text-[#d05b48] sm:text-lg">
                          {formatPrice(item.price * item.quantity)}
                        </strong>
                        <div className="flex h-9 items-center overflow-hidden rounded-lg border border-[#dfe7d9] bg-[#fbfcfa]">
                          <button
                            type="button"
                            aria-label="Giảm số lượng"
                            disabled={item.quantity <= 1}
                            onClick={() => handleDecrement(item.id)}
                            className="flex h-full w-9 items-center justify-center text-[#526455] transition hover:bg-[#eef4e8] disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <MinusOutlined className="text-xs" />
                          </button>
                          <span className="flex h-full min-w-9 items-center justify-center border-x border-[#dfe7d9] text-sm font-bold text-[#26382c]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label="Tăng số lượng"
                            onClick={() => handleIncrement(item.id, item.stockQuantity)}
                            className="flex h-full w-9 items-center justify-center text-[#d05b48] transition hover:bg-[#fff1ee]"
                          >
                            <PlusOutlined className="text-xs" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <aside className="cart-summary sticky top-5 rounded-[24px] border border-[#dfe7d9] bg-[#26382c] p-6 text-white shadow-[0_18px_50px_rgba(38,56,44,0.16)]">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#dce9c8]">
                  <ShoppingCartOutlined />
                </div>
                <div>
                  <h2 className="font-bold">Tóm tắt đơn hàng</h2>
                  <p className="text-xs text-white/60">Tạm tính cho giỏ hàng hiện tại</p>
                </div>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between text-white/70">
                  <span>Tạm tính</span>
                  <strong className="text-white">{formatPrice(calculateSubtotal())}</strong>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Phí vận chuyển</span>
                  <span className="font-semibold text-[#dce9c8]">Tính ở bước sau</span>
                </div>
              </div>

              <Divider className="!my-5 !border-white/15" />
              <div className="flex items-end justify-between gap-3">
                <span className="text-sm text-white/70">Tổng tạm tính</span>
                <strong className="text-2xl text-[#f2c48e]">{formatPrice(calculateSubtotal())}</strong>
              </div>

              <TextArea
                placeholder="Ghi chú cho đơn hàng (không bắt buộc)"
                rows={3}
                className="!mt-6 !border-white/10 !bg-white/10 !text-white placeholder:!text-white/45"
              />
              <Button
                block
                size="large"
                icon={<LockOutlined />}
                className="!mt-5 !h-12 !rounded-xl !border-none !bg-[#d05b48] !font-bold !text-white hover:!bg-[#e16c58]"
                onClick={handleCheckout}
              >
                Tiến hành đặt hàng
              </Button>
              <Button
                block
                size="large"
                icon={<ArrowLeftOutlined />}
                className="!mt-3 !h-11 !rounded-xl !border-white/20 !bg-transparent !text-white/80 hover:!border-white !text-white"
                onClick={() => navigate("/")}
              >
                Tiếp tục mua sắm
              </Button>
              <p className="mt-5 text-center text-xs text-white/50">Thanh toán an toàn và bảo mật</p>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
};

export default Cart;