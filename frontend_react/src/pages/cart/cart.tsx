"use client";

import React, { useEffect } from "react";
import {
  increaseQuantity,
  decreaseQuantity,
  removeProduct,
  setUserId,
} from "../../redux/slices/cartslice";

import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  Button,
  Breadcrumb,
  Typography,
  Divider,
  Modal,
  Empty,
  Tag,
} from "antd";

import {
  DeleteOutlined,
  MinusOutlined,
  PlusOutlined,
  ShoppingCartOutlined,
  ArrowLeftOutlined,
  LockOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const Cart: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items: cartItems, userId } = useSelector(
    (state: {
      cart: {
        items: any[];
        userId: string | null;
      };
    }) => state.cart
  );

  // =========================================================
  // LẤY USER ID
  // =========================================================

  useEffect(() => {
    const storedUserId = localStorage.getItem("accountID");

    if (storedUserId && !userId) {
      dispatch(setUserId(storedUserId));
    }
  }, [dispatch, userId]);

  // =========================================================
  // KIỂM TRA ĐĂNG NHẬP
  // =========================================================

  const checkLogin = () => {
    if (!userId || userId === "guest") {
      Modal.warning({
        title: "Yêu cầu đăng nhập",
        content: "Vui lòng đăng nhập để thực hiện thao tác này!",
        okText: "Đăng nhập",
        onOk: () => navigate("/login"),
      });

      return false;
    }

    return true;
  };

  // =========================================================
  // TĂNG SỐ LƯỢNG
  // =========================================================

  const handleIncrement = (
    id: string,
    stockQuantity: number
  ) => {
    if (!checkLogin()) return;

    const item = cartItems.find(
      (item) => item.id === id
    );

    if (!item) return;

    if (item.quantity >= stockQuantity) {
      Modal.warning({
        title: "Số lượng vượt quá tồn kho",
        content: `Số lượng tối đa có thể chọn là ${stockQuantity}!`,
        okText: "Đã hiểu",
      });

      return;
    }

    dispatch(
      increaseQuantity({
        id,
      })
    );
  };

  // =========================================================
  // GIẢM SỐ LƯỢNG
  // =========================================================

  const handleDecrement = (id: string) => {
    if (!checkLogin()) return;

    const item = cartItems.find(
      (item) => item.id === id
    );

    if (!item) return;

    if (item.quantity <= 1) {
      return;
    }

    dispatch(
      decreaseQuantity({
        id,
      })
    );
  };

  // =========================================================
  // XÓA SẢN PHẨM
  // =========================================================

  const handleRemove = (
    id: string,
    name: string
  ) => {
    if (!checkLogin()) return;

    Modal.confirm({
      title: "Xác nhận xóa sản phẩm",
      content: (
        <div>
          Bạn có chắc muốn xóa{" "}
          <strong>"{name}"</strong> khỏi giỏ hàng không?
        </div>
      ),
      okText: "Xóa sản phẩm",
      cancelText: "Hủy",
      okType: "danger",

      onOk() {
        dispatch(
          removeProduct({
            id,
          })
        );
      },
    });
  };

  // =========================================================
  // TÍNH TỔNG TIỀN
  // =========================================================

  const calculateSubtotal = () => {
    return cartItems.reduce(
      (total, item) =>
        total + item.price * item.quantity,
      0
    );
  };

  // =========================================================
  // CHECKOUT
  // =========================================================

  const handleCheckout = () => {
    if (!checkLogin()) return;

    navigate("/checkout");
  };

  // =========================================================
  // FORMAT TIỀN
  // =========================================================

  const formatPrice = (price: number) => {
    return price.toLocaleString("vi-VN") + "đ";
  };

  // =========================================================
  // BREADCRUMB
  // =========================================================

  const breadcrumbItems = [
    {
      title: (
        <span
          className="cursor-pointer hover:text-[#22A6DF]"
          onClick={() => navigate("/home")}
        >
          Trang chủ
        </span>
      ),
    },
    {
      title: "Giỏ hàng",
    },
  ];

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-[#f7f9fb]">

      {/* =====================================================
          HEADER / BREADCRUMB
      ===================================================== */}

      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">

          <Breadcrumb
            items={breadcrumbItems}
          />

        </div>
      </div>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ===================================================
            TITLE
        =================================================== */}

        <div className="mb-8">

          <div className="flex items-center gap-3">

            <div
              className="
                flex h-12 w-12 items-center justify-center
                rounded-full
                bg-[#e8f7fd]
                text-[#22A6DF]
              "
            >
              <ShoppingCartOutlined
                style={{
                  fontSize: 24,
                }}
              />
            </div>

            <div>

              <Title
                level={2}
                className="!mb-1 !text-2xl !font-bold sm:!text-3xl"
              >
                Giỏ hàng của bạn
              </Title>

              <Text className="text-gray-500">
                {cartItems.length} sản phẩm trong giỏ hàng
              </Text>

            </div>

          </div>

        </div>

        {/* ===================================================
            GIỎ HÀNG TRỐNG
        =================================================== */}

        {cartItems.length === 0 ? (

          <div
            className="
              flex min-h-[500px]
              items-center justify-center
              rounded-2xl
              bg-white
              p-8
              shadow-sm
            "
          >

            <div className="text-center">

              <div
                className="
                  mx-auto mb-6
                  flex h-28 w-28
                  items-center justify-center
                  rounded-full
                  bg-[#eaf8fd]
                "
              >

                <ShoppingCartOutlined
                  style={{
                    fontSize: 55,
                    color: "#22A6DF",
                  }}
                />

              </div>

              <Title
                level={3}
                className="!mb-2"
              >
                Giỏ hàng đang trống
              </Title>

              <Text className="block text-gray-500">
                Bạn chưa có sản phẩm nào trong giỏ hàng.
              </Text>

              <Button
                size="large"
                icon={<ArrowLeftOutlined />}
                className="
                  mt-6
                  !h-12
                  !rounded-xl
                  !border-[#22A6DF]
                  !px-7
                  !text-[#22A6DF]
                  hover:!bg-[#22A6DF]
                  hover:!text-white
                "
                onClick={() => navigate("/home")}
              >
                Tiếp tục mua sắm
              </Button>

            </div>

          </div>

        ) : (

          /* =================================================
             CÓ SẢN PHẨM
          ================================================= */

          <div
            className="
              grid
              grid-cols-1
              gap-6
              lg:grid-cols-3
            "
          >

            {/* =============================================
                DANH SÁCH SẢN PHẨM
            ============================================= */}

            <div className="lg:col-span-2">

              {/* HEADER DANH SÁCH */}

              <div
                className="
                  mb-4
                  flex
                  items-center
                  justify-between
                  rounded-xl
                  bg-white
                  px-5
                  py-4
                  shadow-sm
                "
              >

                <div>

                  <Text
                    strong
                    className="text-base"
                  >
                    Sản phẩm
                  </Text>

                  <Text className="ml-2 text-gray-400">
                    ({cartItems.length})
                  </Text>

                </div>

                <Tag
                  color="blue"
                  className="!rounded-full !px-3"
                >
                  Đang chọn
                </Tag>

              </div>

              {/* PRODUCT LIST */}

              <div className="space-y-4">

                {cartItems.map((item) => (

                  <div
                    key={item.id}
                    className="
                      group
                      rounded-2xl
                      border
                      border-gray-100
                      bg-white
                      p-4
                      shadow-sm
                      transition-all
                      duration-300
                      hover:-translate-y-[2px]
                      hover:shadow-md
                      sm:p-5
                    "
                  >

                    <div
                      className="
                        flex
                        flex-col
                        gap-5
                        sm:flex-row
                        sm:items-center
                      "
                    >

                      {/* =================================
                          IMAGE
                      ================================= */}

                      <div
                        className="
                          flex
                          h-28
                          w-full
                          flex-shrink-0
                          items-center
                          justify-center
                          overflow-hidden
                          rounded-xl
                          bg-gray-50
                          sm:h-32
                          sm:w-32
                        "
                      >

                        <img
                          src={item.image}
                          alt={item.name}
                          className="
                            h-full
                            w-full
                            object-cover
                            transition-transform
                            duration-300
                            group-hover:scale-105
                          "
                        />

                      </div>

                      {/* =================================
                          PRODUCT INFO
                      ================================= */}

                      <div className="min-w-0 flex-1">

                        <div
                          className="
                            flex
                            items-start
                            justify-between
                            gap-3
                          "
                        >

                          <div>

                            <Text
                              strong
                              className="
                                block
                                break-words
                                text-base
                                leading-6
                                text-gray-800
                                sm:text-lg
                              "
                            >
                              {item.name}
                            </Text>

                            <Text className="mt-1 block text-sm text-gray-400">
                              Giá sản phẩm
                            </Text>

                            <Text
                              strong
                              className="
                                mt-1
                                block
                                text-base
                                text-[#22A6DF]
                              "
                            >
                              {formatPrice(item.price)}
                            </Text>

                          </div>

                          {/* DELETE */}

                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            className="
                              flex-shrink-0
                              !rounded-lg
                              opacity-70
                              hover:!bg-red-50
                              hover:!opacity-100
                            "
                            onClick={() =>
                              handleRemove(
                                item.id,
                                item.name
                              )
                            }
                          >
                            <span className="hidden sm:inline">
                              Xóa
                            </span>
                          </Button>

                        </div>

                        {/* =================================
                            BOTTOM PRODUCT
                        ================================= */}

                        <div
                          className="
                            mt-4
                            flex
                            flex-col
                            gap-3
                            border-t
                            border-gray-100
                            pt-4
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                          "
                        >

                          {/* TOTAL ITEM */}

                          <div>

                            <Text className="block text-xs text-gray-400">
                              Thành tiền
                            </Text>

                            <Text
                              strong
                              className="
                                text-lg
                                text-[#22A6DF]
                              "
                            >
                              {formatPrice(
                                item.price *
                                  item.quantity
                              )}
                            </Text>

                          </div>

                          {/* QUANTITY */}

                          <div
                            className="
                              flex
                              items-center
                              gap-3
                            "
                          >

                            <Text className="text-sm text-gray-500">
                              Số lượng
                            </Text>

                            <div
                              className="
                                flex
                                h-10
                                items-center
                                overflow-hidden
                                rounded-lg
                                border
                                border-gray-200
                              "
                            >

                              <button
                                type="button"
                                disabled={
                                  item.quantity <= 1
                                }
                                onClick={() =>
                                  handleDecrement(
                                    item.id
                                  )
                                }
                                className="
                                  flex
                                  h-full
                                  w-10
                                  items-center
                                  justify-center
                                  border-r
                                  border-gray-200
                                  text-gray-600
                                  transition
                                  hover:bg-gray-50
                                  disabled:cursor-not-allowed
                                  disabled:opacity-40
                                "
                              >

                                <MinusOutlined />

                              </button>

                              <div
                                className="
                                  flex
                                  h-full
                                  min-w-12
                                  items-center
                                  justify-center
                                  bg-white
                                  text-sm
                                  font-semibold
                                  text-gray-800
                                "
                              >
                                {item.quantity}
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  handleIncrement(
                                    item.id,
                                    item.stockQuantity
                                  )
                                }
                                className="
                                  flex
                                  h-full
                                  w-10
                                  items-center
                                  justify-center
                                  border-l
                                  border-gray-200
                                  text-[#22A6DF]
                                  transition
                                  hover:bg-[#eaf8fd]
                                "
                              >

                                <PlusOutlined />

                              </button>

                            </div>

                          </div>

                        </div>

                      </div>

                    </div>

                  </div>

                ))}

              </div>

            </div>

            {/* =============================================
                ORDER SUMMARY
            ============================================= */}

            <div className="lg:col-span-1">

              <div
                className="
                  sticky
                  top-5
                  overflow-hidden
                  rounded-2xl
                  border
                  border-gray-100
                  bg-white
                  shadow-sm
                "
              >

                {/* SUMMARY HEADER */}

                <div
                  className="
                    bg-gradient-to-r
                    from-[#22A6DF]
                    to-[#4fc3f1]
                    px-6
                    py-5
                  "
                >

                  <Title
                    level={4}
                    className="
                      !mb-1
                      !text-xl
                      !text-white
                    "
                  >
                    Thông tin đơn hàng
                  </Title>

                  <Text className="!text-white/80">
                    Kiểm tra lại đơn hàng trước khi đặt
                  </Text>

                </div>

                <div className="p-6">

                  {/* SUBTOTAL */}

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                    "
                  >

                    <Text className="text-gray-500">
                      Tạm tính
                    </Text>

                    <Text
                      strong
                      className="text-base text-gray-800"
                    >
                      {formatPrice(
                        calculateSubtotal()
                      )}
                    </Text>

                  </div>

                  <Divider className="my-5" />

                  {/* TOTAL */}

                  <div
                    className="
                      flex
                      items-end
                      justify-between
                      gap-3
                    "
                  >

                    <div>

                      <Text className="block text-sm text-gray-500">
                        Tổng cộng
                      </Text>

                      <Text className="text-xs text-gray-400">
                        Đã bao gồm giá sản phẩm
                      </Text>

                    </div>

                    <Text
                      strong
                      className="
                        text-2xl
                        text-[#22A6DF]
                      "
                    >
                      {formatPrice(
                        calculateSubtotal()
                      )}
                    </Text>

                  </div>

                  {/* CHECKOUT */}

                  <Button
                    type="primary"
                    block
                    size="large"
                    icon={<LockOutlined />}
                    className="
                      mt-6
                      !h-12
                      !rounded-xl
                      !border-none
                      !bg-[#22A6DF]
                      !text-base
                      !font-semibold
                      shadow-md
                      transition-all
                      hover:!bg-[#1597ce]
                      hover:shadow-lg
                    "
                    onClick={handleCheckout}
                  >
                    Tiến hành đặt hàng
                  </Button>

                  {/* CONTINUE SHOPPING */}

                  <Button
                    block
                    size="large"
                    icon={<ArrowLeftOutlined />}
                    className="
                      mt-3
                      !h-12
                      !rounded-xl
                      !border-gray-200
                      !bg-white
                      !text-gray-700
                      hover:!border-[#22A6DF]
                      hover:!text-[#22A6DF]
                    "
                    onClick={() =>
                      navigate("/home")
                    }
                  >
                    Tiếp tục mua sắm
                  </Button>

                  {/* SECURITY */}

                  <div
                    className="
                      mt-5
                      flex
                      items-center
                      justify-center
                      gap-2
                      rounded-lg
                      bg-gray-50
                      px-3
                      py-3
                    "
                  >

                    <LockOutlined
                      className="text-green-500"
                    />

                    <Text className="text-xs text-gray-500">
                      Thanh toán an toàn & bảo mật
                    </Text>

                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

      </main>

    </div>
  );
};

export default Cart;