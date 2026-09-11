"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

import {
  Package,
  CreditCard,
  Truck,
  MapPin,
  DollarSign,
  X,
  AlertCircle,
  User,
  Check,
  ShoppingBag,
  Plus,
  Edit3,
  ChevronLeft,
  ShieldCheck,
  Tag,
  Trash2,
} from "lucide-react";

import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Select,
} from "antd";

import orderApi from "../../api/orderApi";
import userApi from "../../api/userApi";
import deliveryApi from "../../api/deliveryApi";
import paymentTypeApi from "../../api/paymentTypeApi";
import couponApi from "../../api/couponApi";
import paymentApi from "../../api/paymentApi";

import {
  clearProduct,
  removeProduct,
} from "../../redux/slices/cartslice";

import ENV_VARS from "../../../config";

const { Item } = Form;

/* =========================================================
   INTERFACES
========================================================= */

interface PaymentType {
  _id: string;
  payment_type_name: string;
  description: string;
}

interface Delivery {
  _id: string;
  delivery_name: string;
  description: string;
  delivery_fee: number;
  status: string;
}

interface Coupon {
  _id: string;
  coupon_code: string;
  discount_value: number;
  min_order_value: number;
  max_discount: number;
  start_date: string;
  end_date: string;
  usage_limit: number;
  used_count: number;
  status: string;
}

interface Address {
  _id?: string;
  name: string;
  phone: string;
  address: string;
  isDefault?: boolean;
}

interface User {
  _id: string;
  email: string;
  fullname: string;
  password: string;
  phone_number: string;
  address: Address[];
  role: string;
  avatar: string;
  reset_password_token: string | null;
  reset_password_expires: string | null;
  refreshToken: string;
  dateOfBirth: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartState {
  items: CartItem[];
  userId: string | null;
}

/* =========================================================
   COMPONENT
========================================================= */

const Payment = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  /* =======================================================
     REDUX
  ======================================================= */

  const { items: cartItems, userId } = useSelector(
    (state: { cart: CartState }) => state.cart
  );

  /* =======================================================
     LOGIN
  ======================================================= */

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  /* =======================================================
     ADDRESS
  ======================================================= */

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] =
    useState<Address | null>(null);

  const [checkedAddressId, setCheckedAddressId] =
    useState<string | null>(null);

  const [isAddressModalOpen, setIsAddressModalOpen] =
    useState(false);

  const [isAddAddressModalOpen, setIsAddAddressModalOpen] =
    useState(false);

  const [isEditAddressModalOpen, setIsEditAddressModalOpen] =
    useState(false);

  const [editAddressIndex, setEditAddressIndex] =
    useState<number | null>(null);

  const [user, setUser] = useState<User | null>(null);

  /* =======================================================
     SHIPPING
  ======================================================= */

  const [shippingMethods, setShippingMethods] =
    useState<Delivery[]>([]);

  const [selectedShippingMethod, setSelectedShippingMethod] =
    useState<Delivery | null>(null);

  /* =======================================================
     PAYMENT
  ======================================================= */

  const [paymentMethods, setPaymentMethods] =
    useState<PaymentType[]>([]);

  const [selectedPayment, setSelectedPayment] =
    useState<string>("");

  /* =======================================================
     COUPON
  ======================================================= */

  const [couponCode, setCouponCode] = useState("");

  const [appliedCoupon, setAppliedCoupon] =
    useState<Coupon | null>(null);

  const [discount, setDiscount] = useState(0);

  /* =======================================================
     FORM ADDRESS
  ======================================================= */

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
  });

  const [addressForm] = Form.useForm();

  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  const [selectedProvince, setSelectedProvince] =
    useState<string | null>(null);

  const [selectedDistrict, setSelectedDistrict] =
    useState<string | null>(null);

  /* =======================================================
     REORDER
  ======================================================= */

  const [isReorder, setIsReorder] = useState(false);

  /* =======================================================
     FORMAT PRICE
  ======================================================= */

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "₫";
  };

  /* =======================================================
     GET PAYMENT ICON
  ======================================================= */

  const getPaymentIcon = (paymentTypeName: string) => {
    const name = paymentTypeName.toLowerCase();

    if (
      name.includes("cash") ||
      name.includes("tiền mặt") ||
      name.includes("nhận hàng")
    ) {
      return <DollarSign size={21} />;
    }

    if (
      name.includes("bank") ||
      name.includes("wire") ||
      name.includes("chuyển khoản")
    ) {
      return <CreditCard size={21} />;
    }

    return <CreditCard size={21} />;
  };

  /* =======================================================
     SUBTOTAL
  ======================================================= */

  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }, [cartItems]);

  /* =======================================================
     TOTAL
  ======================================================= */

  const calculateTotal = useMemo(() => {
    const shippingFee = selectedShippingMethod
      ? selectedShippingMethod.delivery_fee
      : 0;

    const total = subtotal - discount + shippingFee;

    return Math.max(total, 0);
  }, [
    subtotal,
    discount,
    selectedShippingMethod,
  ]);

  /* =======================================================
     LOAD DELIVERY + PAYMENT
  ======================================================= */

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    const accountID = localStorage
      .getItem("accountID")
      ?.replace(/"/g, "")
      .trim();

    /* -------------------------------------------------------
       DELIVERY
    ------------------------------------------------------- */

    const fetchDeliveryMethods = async () => {
      try {
        const response =
          await deliveryApi.getAllDelivery();

        const methods: Delivery[] =
          response.data.data || [];

        setShippingMethods(methods);

        const freeShipping = methods.find(
          (method) => method.delivery_fee === 0
        );

        if (subtotal >= 200000 && freeShipping) {
          setSelectedShippingMethod(freeShipping);
        } else if (methods.length > 0) {
          const firstNonFreeMethod = methods.find(
            (method) => method.delivery_fee > 0
          );

          setSelectedShippingMethod(
            firstNonFreeMethod || methods[0]
          );
        }
      } catch (error) {
        console.error(
          "Failed to fetch delivery methods:",
          error
        );

        message.error(
          "Không thể tải phương thức vận chuyển!"
        );

        setShippingMethods([]);
        setSelectedShippingMethod(null);
      }
    };

    /* -------------------------------------------------------
       PAYMENT
    ------------------------------------------------------- */

    const fetchPaymentMethods = async () => {
      try {
        const response =
          await paymentTypeApi.getAllPayment();

        const methods: PaymentType[] =
          response.data.data || [];

        setPaymentMethods(methods);

        if (methods.length > 0) {
          setSelectedPayment(methods[0]._id);
        }
      } catch (error) {
        console.error(
          "Failed to fetch payment methods:",
          error
        );

        setPaymentMethods([]);
        setSelectedPayment("");
      }
    };

    fetchDeliveryMethods();
    fetchPaymentMethods();

    /* -------------------------------------------------------
       USER
    ------------------------------------------------------- */

    if (token && accountID) {
      setIsLoggedIn(true);

      const fetchUserData = async () => {
        try {
          const response =
            await userApi.getUserById(accountID);

          const userData: User =
            response.data.data;

          setUser(userData);

          const userAddresses =
            userData.address || [];

          setAddresses(userAddresses);

          const defaultAddress =
            userAddresses.find(
              (address) => address.isDefault
            ) || userAddresses[0];

          if (defaultAddress) {
            setSelectedAddress(defaultAddress);

            setCheckedAddressId(
              defaultAddress._id || null
            );

            setFormData({
              fullName: defaultAddress.name,
              phone: defaultAddress.phone,
              address: defaultAddress.address,
            });
          }
        } catch (error) {
          console.error(
            "Failed to fetch user data:",
            error
          );

          setAddresses([]);
          setSelectedAddress(null);
          setCheckedAddressId(null);
          setUser(null);
        }
      };

      fetchUserData();

      if (location.state?.reorderItems) {
        setIsReorder(true);
      }
    } else {
      setIsLoggedIn(false);
      setAddresses([]);
      setSelectedAddress(null);
      setCheckedAddressId(null);
      setUser(null);
    }
  }, [location.state, subtotal]);

  /* =======================================================
     LOAD PROVINCES
  ======================================================= */

  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/p/")
      .then((res) => res.json())
      .then((data) => setProvinces(data))
      .catch((error) => {
        console.error(
          "Lỗi khi fetch tỉnh:",
          error
        );

        message.error(
          "Không thể tải danh sách tỉnh!"
        );
      });
  }, []);

  /* =======================================================
     LOAD DISTRICTS
  ======================================================= */

  useEffect(() => {
    if (!selectedProvince) {
      setDistricts([]);
      setWards([]);
      return;
    }

    fetch(
      `https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`
    )
      .then((res) => res.json())
      .then((data) => {
        setDistricts(data.districts || []);
        setWards([]);
        setSelectedDistrict(null);

        addressForm.setFieldsValue({
          district: undefined,
          ward: undefined,
        });
      })
      .catch((error) => {
        console.error(
          "Lỗi khi fetch quận/huyện:",
          error
        );

        message.error(
          "Không thể tải danh sách quận/huyện!"
        );
      });
  }, [selectedProvince]);

  /* =======================================================
     LOAD WARDS
  ======================================================= */

  useEffect(() => {
    if (!selectedDistrict) {
      setWards([]);
      return;
    }

    fetch(
      `https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`
    )
      .then((res) => res.json())
      .then((data) => {
        setWards(data.wards || []);
      })
      .catch((error) => {
        console.error(
          "Lỗi khi fetch phường/xã:",
          error
        );

        message.error(
          "Không thể tải danh sách phường/xã!"
        );
      });
  }, [selectedDistrict]);

  /* =======================================================
     RESET ADDRESS FORM
  ======================================================= */

  const resetAddressForm = () => {
    addressForm.resetFields();

    setSelectedProvince(null);
    setSelectedDistrict(null);

    setDistricts([]);
    setWards([]);
  };

  /* =======================================================
     VALIDATE PHONE
  ======================================================= */

  const validatePhoneNumber = (
    _: any,
    value: string
  ) => {
    const phoneRegex =
      /^(03|05|07|08|09)[0-9]{8}$/;

    if (value && !phoneRegex.test(value)) {
      return Promise.reject(
        new Error(
          "Số điện thoại không hợp lệ! Phải gồm 10 số và bắt đầu bằng 03, 05, 07, 08 hoặc 09."
        )
      );
    }

    return Promise.resolve();
  };

  /* =======================================================
     ADD ADDRESS
  ======================================================= */

  const handleAddAddress = async () => {
    try {
      const values =
        await addressForm.validateFields();

      const accountID = localStorage
        .getItem("accountID")
        ?.replace(/"/g, "")
        .trim();

      if (!accountID) {
        message.error(
          "Không tìm thấy tài khoản. Vui lòng đăng nhập lại!"
        );

        navigate("/login");
        return;
      }

      if (!user) {
        message.error(
          "Không tìm thấy thông tin người dùng!"
        );

        return;
      }

      const provinceName =
        provinces.find(
          (province) =>
            province.code === values.province
        )?.name || "";

      const districtName =
        districts.find(
          (district) =>
            district.code === values.district
        )?.name || "";

      const wardName =
        wards.find(
          (ward) =>
            ward.code === values.ward
        )?.name || "";

      const fullAddress =
        `${values.address}, ${wardName}, ${districtName}, ${provinceName}`;

      const newAddress: Address = {
        name: values.name,
        phone: values.phone,
        address: fullAddress,
        isDefault: false,
      };

      await userApi.addAddress(
        accountID,
        newAddress
      );

      const updatedAddresses = [
        ...(user.address || []),
        newAddress,
      ];

      const updatedUser = {
        ...user,
        address: updatedAddresses,
      };

      setUser(updatedUser);
      setAddresses(updatedAddresses);

      if (!selectedAddress) {
        setSelectedAddress(newAddress);

        setFormData({
          fullName: newAddress.name,
          phone: newAddress.phone,
          address: newAddress.address,
        });
      }

      localStorage.setItem(
        "userData",
        JSON.stringify(updatedUser)
      );

      setIsAddAddressModalOpen(false);

      resetAddressForm();

      message.success(
        "Thêm địa chỉ thành công!"
      );
    } catch (error: any) {
      if (error?.errorFields) {
        return;
      }

      console.error(
        "Lỗi thêm địa chỉ:",
        error
      );

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Lỗi không xác định";

      message.error(
        `Thêm địa chỉ thất bại: ${errorMessage}`
      );
    }
  };

  /* =======================================================
     OPEN EDIT ADDRESS
  ======================================================= */

  const handleOpenEditAddress = (
    address: Address,
    index: number
  ) => {
    setEditAddressIndex(index);

    const province = provinces.find(
      (item) =>
        address.address.includes(item.name)
    );

    setSelectedProvince(
      province?.code || null
    );

    setIsEditAddressModalOpen(true);

    addressForm.setFieldsValue({
      name: address.name,
      phone: address.phone,
      address: address.address.split(",")[0],
      province: province?.code,
    });
  };

  /* =======================================================
     EDIT ADDRESS
  ======================================================= */

  const handleEditAddress = async () => {
    try {
      const values =
        await addressForm.validateFields();

      const accountID = localStorage
        .getItem("accountID")
        ?.replace(/"/g, "")
        .trim();

      if (
        !accountID ||
        !user ||
        editAddressIndex === null
      ) {
        message.error(
          "Không tìm thấy thông tin địa chỉ!"
        );

        return;
      }

      const provinceName =
        provinces.find(
          (province) =>
            province.code === values.province
        )?.name || "";

      const districtName =
        districts.find(
          (district) =>
            district.code === values.district
        )?.name || "";

      const wardName =
        wards.find(
          (ward) =>
            ward.code === values.ward
        )?.name || "";

      const fullAddress =
        `${values.address}, ${wardName}, ${districtName}, ${provinceName}`;

      const oldAddress =
        user.address[editAddressIndex];

      const updatedAddress: Address = {
        _id: oldAddress._id,
        name: values.name,
        phone: values.phone,
        address: fullAddress,
        isDefault: oldAddress.isDefault,
      };

      await userApi.updateAddress(
        accountID,
        editAddressIndex,
        updatedAddress
      );

      const updatedAddresses = [
        ...(user.address || []),
      ];

      updatedAddresses[editAddressIndex] =
        updatedAddress;

      const updatedUser = {
        ...user,
        address: updatedAddresses,
      };

      setUser(updatedUser);
      setAddresses(updatedAddresses);

      if (
        selectedAddress?._id === oldAddress._id
      ) {
        setSelectedAddress(updatedAddress);

        setFormData({
          fullName: updatedAddress.name,
          phone: updatedAddress.phone,
          address: updatedAddress.address,
        });
      }

      localStorage.setItem(
        "userData",
        JSON.stringify(updatedUser)
      );

      setIsEditAddressModalOpen(false);

      setEditAddressIndex(null);

      resetAddressForm();

      message.success(
        "Cập nhật địa chỉ thành công!"
      );
    } catch (error: any) {
      if (error?.errorFields) {
        return;
      }

      console.error(
        "Lỗi cập nhật địa chỉ:",
        error
      );

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Lỗi không xác định";

      message.error(
        `Cập nhật địa chỉ thất bại: ${errorMessage}`
      );
    }
  };

  /* =======================================================
     CONFIRM ADDRESS
  ======================================================= */

  const handleConfirmAddress = () => {
    const selected = addresses.find(
      (address) =>
        address._id === checkedAddressId
    );

    if (selected) {
      setSelectedAddress(selected);

      setFormData({
        fullName: selected.name,
        phone: selected.phone,
        address: selected.address,
      });
    }

    setIsAddressModalOpen(false);
  };

  /* =======================================================
     APPLY COUPON
  ======================================================= */

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      message.warning(
        "Vui lòng nhập mã giảm giá!"
      );

      return;
    }

    try {
      const response =
        await couponApi.getActiveCoupon();

      const activeCoupons: Coupon[] =
        response.data.result || [];

      const matchedCoupon =
        activeCoupons.find(
          (coupon) =>
            coupon.coupon_code.toUpperCase() ===
            couponCode.trim().toUpperCase()
        );

      if (!matchedCoupon) {
        message.error(
          "Mã giảm giá không hợp lệ hoặc đã hết hạn!"
        );

        setAppliedCoupon(null);
        setDiscount(0);

        return;
      }

      const currentDate = new Date();

      const startDate = new Date(
        matchedCoupon.start_date
      );

      const endDate = new Date(
        matchedCoupon.end_date
      );

      if (
        currentDate < startDate ||
        currentDate > endDate
      ) {
        message.error(
          "Mã giảm giá đã hết hạn!"
        );

        setAppliedCoupon(null);
        setDiscount(0);

        return;
      }

      if (
        subtotal <
        matchedCoupon.min_order_value
      ) {
        message.error(
          `Đơn hàng tối thiểu ${formatPrice(
            matchedCoupon.min_order_value
          )} để sử dụng mã này!`
        );

        setAppliedCoupon(null);
        setDiscount(0);

        return;
      }

      if (
        matchedCoupon.used_count >=
        matchedCoupon.usage_limit
      ) {
        message.error(
          "Mã giảm giá đã được sử dụng hết!"
        );

        setAppliedCoupon(null);
        setDiscount(0);

        return;
      }

      const discountValue =
        (subtotal *
          matchedCoupon.discount_value) /
        100;

      const finalDiscount =
        matchedCoupon.max_discount > 0
          ? Math.min(
              discountValue,
              matchedCoupon.max_discount
            )
          : discountValue;

      setAppliedCoupon(matchedCoupon);

      setDiscount(finalDiscount);

      message.success(
        `Áp dụng mã thành công! Giảm ${formatPrice(
          finalDiscount
        )}`
      );
    } catch (error) {
      console.error(
        "Error applying coupon:",
        error
      );

      message.error(
        "Có lỗi xảy ra khi áp dụng mã giảm giá!"
      );

      setAppliedCoupon(null);
      setDiscount(0);
    }
  };

  /* =======================================================
     REMOVE PRODUCT
  ======================================================= */

  const handleRemove = (
    id: string,
    name: string
  ) => {
    if (!userId || userId === "guest") {
      Modal.warning({
        title: "Yêu cầu đăng nhập",
        content:
          "Vui lòng đăng nhập để thực hiện thao tác này!",
        onOk: () => navigate("/login"),
      });

      return;
    }

    Modal.confirm({
      title: "Xóa sản phẩm?",
      content: `Bạn có chắc muốn xóa "${name}" khỏi đơn hàng không?`,
      okText: "Xóa",
      cancelText: "Hủy",
      okType: "danger",

      onOk() {
        dispatch(
          removeProduct({
            id,
          })
        );

        message.success(
          `Đã xóa "${name}" khỏi đơn hàng!`
        );
      },
    });
  };

  /* =======================================================
     PAYMENT
  ======================================================= */

  const handlePayment = async (
    paymentData: any
  ) => {
    try {
      const response =
        await paymentApi.create(
          paymentData
        );

      const checkoutUrl =
        response.url;

      if (!checkoutUrl) {
        throw new Error(
          "Không nhận được đường dẫn thanh toán!"
        );
      }

      window.location.href =
        checkoutUrl;
    } catch (error) {
      console.error(
        "Error creating payment:",
        error
      );

      message.error(
        "Có lỗi xảy ra khi tạo liên kết thanh toán!"
      );
    }
  };

  /* =======================================================
     PROCESS CHECKOUT
  ======================================================= */

  const processCheckout = async () => {
    try {
      const shippingAddress =
        formData.address;

      const accountID = localStorage
        .getItem("accountID")
        ?.replace(/"/g, "")
        .trim();

      const orderData = {
        userID: userId || accountID,
        couponID: appliedCoupon
          ? appliedCoupon._id
          : null,
        payment_typeID: selectedPayment,
        deliveryID:
          selectedShippingMethod?._id,
        orderdate:
          new Date().toISOString(),
        total_price: calculateTotal,
        shipping_address:
          shippingAddress,

        orderDetails: cartItems.map(
          (item) => ({
            productID: item.id,
            serviceID: null,
            quantity: item.quantity,
            product_price: item.price,
          })
        ),
      };

      const orderResponse =
        await orderApi.create(orderData);

      const createdOrder =
        orderResponse.data;

      const order =
        createdOrder.order;

      console.log(
        "Order created:",
        order
      );

      /*
       * COD
       *
       * ID này đang giữ nguyên theo code cũ
       */
      const COD_PAYMENT_ID =
        "67d67442aeb5082f01074c28";

      if (
        selectedPayment ===
        COD_PAYMENT_ID
      ) {
        message.success(
          "Đặt hàng thành công!"
        );

        navigate(
          "/userprofile/orders"
        );

        return;
      }

      /* -----------------------------------------------------
         ONLINE PAYMENT
      ----------------------------------------------------- */

      const paymentData = {
        orderId: order._id,
        amount: calculateTotal,
        description:
          "Thanh toán đơn hàng",

        returnUrl:
          `${ENV_VARS.VITE_VNPAY_URL}/success`,

        cancelUrl:
          `${ENV_VARS.VITE_VNPAY_URL}/cancel`,
      };

      await handlePayment(
        paymentData
      );
    } catch (error) {
      console.error(
        "Error creating order:",
        error
      );

      message.error(
        "Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại!"
      );
    }
  };

  /* =======================================================
     CHECKOUT
  ======================================================= */

  const handleCheckout = async () => {
    if (!selectedAddress) {
      message.error(
        "Vui lòng chọn địa chỉ giao hàng!"
      );

      return;
    }

    if (!selectedShippingMethod) {
      message.error(
        "Vui lòng chọn phương thức vận chuyển!"
      );

      return;
    }

    if (!selectedPayment) {
      message.error(
        "Vui lòng chọn phương thức thanh toán!"
      );

      return;
    }

    if (cartItems.length === 0) {
      message.error(
        "Giỏ hàng của bạn đang trống!"
      );

      return;
    }

    if (isReorder) {
      Modal.confirm({
        title:
          "Xác nhận đặt lại đơn hàng",

        content:
          "Bạn đang đặt lại một đơn hàng cũ. Bạn có chắc chắn muốn tiếp tục?",

        okText: "Xác nhận",

        cancelText: "Hủy",

        onOk: processCheckout,
      });

      return;
    }

    processCheckout();
  };

  /* =======================================================
     ADDRESS FORM
  ======================================================= */

  const renderAddressForm = () => {
    return (
      <Form
        form={addressForm}
        layout="vertical"
      >
        <Item
          name="name"
          label={
            <span className="font-semibold text-[#314238]">
              Họ và tên
            </span>
          }
          rules={[
            {
              required: true,
              message:
                "Vui lòng nhập họ và tên!",
            },
          ]}
        >
          <Input
            size="large"
            placeholder="Nhập họ và tên"
          />
        </Item>

        <Item
          name="phone"
          label={
            <span className="font-semibold text-[#314238]">
              Số điện thoại
            </span>
          }
          rules={[
            {
              required: true,
              message:
                "Vui lòng nhập số điện thoại!",
            },
            {
              validator:
                validatePhoneNumber,
            },
          ]}
        >
          <Input
            size="large"
            placeholder="Nhập số điện thoại"
          />
        </Item>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Item
            name="province"
            label={
              <span className="font-semibold text-[#314238]">
                Tỉnh / Thành phố
              </span>
            }
            rules={[
              {
                required: true,
                message:
                  "Vui lòng chọn tỉnh/thành phố!",
              },
            ]}
          >
            <Select
              size="large"
              placeholder="Chọn tỉnh/thành phố"
              showSearch
              optionFilterProp="children"
              onChange={(value) => {
                setSelectedProvince(
                  value
                );
              }}
              className="w-full"
            >
              {provinces.map(
                (province) => (
                  <Select.Option
                    key={province.code}
                    value={province.code}
                  >
                    {province.name}
                  </Select.Option>
                )
              )}
            </Select>
          </Item>

          <Item
            name="district"
            label={
              <span className="font-semibold text-[#314238]">
                Quận / Huyện
              </span>
            }
            rules={[
              {
                required: true,
                message:
                  "Vui lòng chọn quận/huyện!",
              },
            ]}
          >
            <Select
              size="large"
              placeholder="Chọn quận/huyện"
              showSearch
              optionFilterProp="children"
              disabled={
                !selectedProvince
              }
              onChange={(value) => {
                setSelectedDistrict(
                  value
                );
              }}
              className="w-full"
            >
              {districts.map(
                (district) => (
                  <Select.Option
                    key={district.code}
                    value={district.code}
                  >
                    {district.name}
                  </Select.Option>
                )
              )}
            </Select>
          </Item>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Item
            name="ward"
            label={
              <span className="font-semibold text-[#314238]">
                Phường / Xã
              </span>
            }
            rules={[
              {
                required: true,
                message:
                  "Vui lòng chọn phường/xã!",
              },
            ]}
          >
            <Select
              size="large"
              placeholder="Chọn phường/xã"
              showSearch
              optionFilterProp="children"
              disabled={
                !selectedDistrict
              }
            >
              {wards.map((ward) => (
                <Select.Option
                  key={ward.code}
                  value={ward.code}
                >
                  {ward.name}
                </Select.Option>
              ))}
            </Select>
          </Item>

          <Item
            name="address"
            label={
              <span className="font-semibold text-[#314238]">
                Địa chỉ nhà
              </span>
            }
            rules={[
              {
                required: true,
                message:
                  "Vui lòng nhập địa chỉ nhà!",
              },
            ]}
          >
            <Input
              size="large"
              placeholder="Số nhà, tên đường..."
            />
          </Item>
        </div>
      </Form>
    );
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#f6f1e8] text-[#314238]">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="border-b border-[#e4ddd1] bg-[#fbf9f5]">
        <div className="mx-auto max-w-[1200px] px-5 py-5 lg:px-8">

          <div className="flex items-center justify-between">

            <button
              onClick={() =>
                navigate("/")
              }
              className="flex items-center gap-2 text-sm font-medium text-[#68766e] transition hover:text-[#315b45]"
            >
              <ChevronLeft
                size={18}
              />

              Về trang chủ
            </button>

            <div className="hidden items-center gap-2 sm:flex">
              <span className="text-sm font-medium text-[#315b45]">
                PET CORNER
              </span>
            </div>

          </div>

        </div>
      </div>

      {/* ===================================================
          MAIN
      =================================================== */}

      <main className="mx-auto max-w-[1200px] px-5 py-8 lg:px-8 lg:py-12">

        {/* =================================================
            TITLE
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mb-8"
        >
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-[#c96b45]">
            PET CORNER
          </p>

          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#294634] sm:text-4xl">
            Hoàn tất đơn hàng
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-[#7b827d]">
            Kiểm tra thông tin giao hàng và
            lựa chọn phương thức thanh toán
            trước khi hoàn tất đơn hàng.
          </p>
        </motion.div>

        {/* =================================================
            NOTICES
        ================================================= */}

        {isReorder && (
          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mb-6 rounded-2xl border border-[#c9dfd0] bg-[#edf6ef] p-4"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-white p-2 text-[#315b45]">
                <AlertCircle
                  size={19}
                />
              </div>

              <p className="text-sm text-[#41634e]">
                Đây là đơn hàng được tái
                tạo từ đơn cũ. Vui lòng
                kiểm tra thông tin trước
                khi đặt lại!
              </p>
            </div>
          </motion.div>
        )}

        {!isLoggedIn && (
          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mb-6 rounded-2xl border border-[#ead7ca] bg-[#fff8f2] p-4"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-[#f5e7dc] p-2 text-[#c96b45]">
                <User size={19} />
              </div>

              <p className="text-sm text-[#59635c]">
                Bạn đã có tài khoản?

                <button
                  onClick={() =>
                    navigate("/login")
                  }
                  className="ml-2 font-bold text-[#c96b45] hover:underline"
                >
                  Đăng nhập
                </button>
              </p>
            </div>
          </motion.div>
        )}

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="grid grid-cols-1 gap-7 lg:grid-cols-[1fr_400px]">

          {/* =================================================
              LEFT
          ================================================= */}

          <div className="space-y-6">

            {/* =============================================
                SHIPPING ADDRESS
            ============================================== */}

            <motion.section
              initial={{
                opacity: 0,
                x: -15,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              className="rounded-3xl border border-[#e6dfd5] bg-[#fffdfa] p-6 shadow-[0_10px_35px_rgba(54,65,55,0.05)] sm:p-8"
            >

              <div className="mb-7 flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="rounded-xl bg-[#edf4ee] p-3 text-[#315b45]">
                    <MapPin
                      size={21}
                    />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-[#294634]">
                      Thông tin giao hàng
                    </h2>

                    <p className="text-xs text-[#8a908b]">
                      Địa chỉ nhận hàng
                    </p>
                  </div>

                </div>

                {isLoggedIn &&
                  addresses.length >
                    0 && (
                    <button
                      onClick={() =>
                        setIsAddressModalOpen(
                          true
                        )
                      }
                      className="flex items-center gap-1.5 text-sm font-bold text-[#c96b45] transition hover:text-[#a95331]"
                    >
                      <Edit3
                        size={15}
                      />

                      Thay đổi
                    </button>
                  )}

              </div>

              {isLoggedIn &&
              selectedAddress ? (
                <div className="rounded-2xl border border-[#dce6de] bg-[#f5f9f5] p-5">

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                    <div>

                      <div className="flex flex-wrap items-center gap-2">

                        <span className="font-bold text-[#294634]">
                          {
                            selectedAddress.name
                          }
                        </span>

                        <span className="text-[#9a9f9b]">
                          |
                        </span>

                        <span className="text-sm text-[#66716a]">
                          {
                            selectedAddress.phone
                          }
                        </span>

                        {selectedAddress.isDefault && (
                          <span className="rounded-full bg-[#dcecdf] px-2.5 py-1 text-[11px] font-bold text-[#315b45]">
                            Mặc định
                          </span>
                        )}

                      </div>

                      <p className="mt-2 text-sm leading-6 text-[#657068]">
                        {
                          selectedAddress.address
                        }
                      </p>

                    </div>

                    <div className="hidden rounded-full bg-white p-2 text-[#315b45] sm:block">
                      <Check
                        size={17}
                      />
                    </div>

                  </div>

                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[#d9d4cb] bg-[#faf8f3] p-8 text-center">

                  <MapPin
                    size={30}
                    className="mx-auto mb-3 text-[#aaa69e]"
                  />

                  <p className="text-sm text-[#777c78]">
                    {isLoggedIn
                      ? "Bạn chưa có địa chỉ giao hàng."
                      : "Vui lòng đăng nhập để sử dụng địa chỉ giao hàng."}
                  </p>

                  {isLoggedIn && (
                    <button
                      onClick={() =>
                        setIsAddAddressModalOpen(
                          true
                        )
                      }
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#315b45] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#264936]"
                    >
                      <Plus
                        size={17}
                      />

                      Thêm địa chỉ
                    </button>
                  )}

                </div>
              )}

            </motion.section>

            {/* =============================================
                SHIPPING METHOD
            ============================================== */}

            <motion.section
              initial={{
                opacity: 0,
                x: -15,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay: 0.05,
              }}
              className="rounded-3xl border border-[#e6dfd5] bg-[#fffdfa] p-6 shadow-[0_10px_35px_rgba(54,65,55,0.05)] sm:p-8"
            >

              <div className="mb-7 flex items-center gap-3">

                <div className="rounded-xl bg-[#edf4ee] p-3 text-[#315b45]">
                  <Truck
                    size={21}
                  />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-[#294634]">
                    Phương thức vận chuyển
                  </h2>

                  <p className="text-xs text-[#8a908b]">
                    Chọn cách giao hàng phù hợp
                  </p>
                </div>

              </div>

              {shippingMethods.length >
              0 ? (
                <div className="space-y-3">

                  {shippingMethods.map(
                    (method) => {
                      const isDisabled =
                        method.delivery_fee ===
                          0 &&
                        subtotal <
                          200000;

                      const isSelected =
                        selectedShippingMethod?._id ===
                        method._id;

                      return (
                        <motion.button
                          key={method._id}
                          whileHover={{
                            y: isDisabled
                              ? 0
                              : -1,
                          }}
                          onClick={() => {
                            if (
                              !isDisabled
                            ) {
                              setSelectedShippingMethod(
                                method
                              );
                            }
                          }}
                          className={`w-full rounded-2xl border p-4 text-left transition ${
                            isSelected
                              ? "border-[#315b45] bg-[#f2f7f2]"
                              : isDisabled
                                ? "cursor-not-allowed border-[#e5e2dd] bg-[#f3f1ed] opacity-55"
                                : "border-[#e5e0d8] bg-[#fcfaf6] hover:border-[#b8c8bc] hover:bg-[#f8faf7]"
                          }`}
                        >

                          <div className="flex items-center justify-between gap-4">

                            <div className="flex items-center gap-4">

                              <div className="rounded-xl bg-white p-3 text-[#315b45] shadow-sm">
                                <Truck
                                  size={19}
                                />
                              </div>

                              <div>
                                <p className="font-semibold text-[#33473a]">
                                  {
                                    method.delivery_name
                                  }
                                </p>

                                <p className="mt-1 text-xs text-[#858b86]">
                                  {
                                    method.description
                                  }
                                </p>
                              </div>

                            </div>

                            <div className="flex flex-col items-end gap-2">

                              <span className="font-bold text-[#c96b45]">
                                {method.delivery_fee ===
                                0
                                  ? "Miễn phí"
                                  : formatPrice(
                                      method.delivery_fee
                                    )}
                              </span>

                              {isSelected && (
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#315b45] text-white">
                                  <Check
                                    size={
                                      14
                                    }
                                  />
                                </span>
                              )}

                            </div>

                          </div>

                          {isDisabled && (
                            <p className="mt-3 pl-[60px] text-xs text-[#9b948c]">
                              Miễn phí cho đơn từ
                              200.000₫
                            </p>
                          )}

                        </motion.button>
                      );
                    }
                  )}

                </div>
              ) : (
                <div className="rounded-2xl bg-[#faf8f3] p-8 text-center">
                  <Package
                    size={30}
                    className="mx-auto mb-2 text-[#aaa69e]"
                  />

                  <p className="text-sm text-[#858983]">
                    Không có phương thức
                    vận chuyển khả dụng.
                  </p>
                </div>
              )}

            </motion.section>

            {/* =============================================
                PAYMENT METHOD
            ============================================== */}

            <motion.section
              initial={{
                opacity: 0,
                x: -15,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay: 0.1,
              }}
              className="rounded-3xl border border-[#e6dfd5] bg-[#fffdfa] p-6 shadow-[0_10px_35px_rgba(54,65,55,0.05)] sm:p-8"
            >

              <div className="mb-7 flex items-center gap-3">

                <div className="rounded-xl bg-[#edf4ee] p-3 text-[#315b45]">
                  <CreditCard
                    size={21}
                  />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-[#294634]">
                    Phương thức thanh toán
                  </h2>

                  <p className="text-xs text-[#8a908b]">
                    Chọn phương thức thanh toán
                  </p>
                </div>

              </div>

              {paymentMethods.length >
              0 ? (
                <div className="space-y-3">

                  {paymentMethods.map(
                    (method) => {
                      const isSelected =
                        selectedPayment ===
                        method._id;

                      return (
                        <motion.button
                          key={method._id}
                          whileHover={{
                            y: -1,
                          }}
                          onClick={() =>
                            setSelectedPayment(
                              method._id
                            )
                          }
                          className={`w-full rounded-2xl border p-4 text-left transition ${
                            isSelected
                              ? "border-[#315b45] bg-[#f2f7f2]"
                              : "border-[#e5e0d8] bg-[#fcfaf6] hover:border-[#b8c8bc]"
                          }`}
                        >

                          <div className="flex items-center justify-between gap-4">

                            <div className="flex items-center gap-4">

                              <div className="rounded-xl bg-white p-3 text-[#315b45] shadow-sm">
                                {getPaymentIcon(
                                  method.payment_type_name
                                )}
                              </div>

                              <div>
                                <p className="font-semibold text-[#33473a]">
                                  {
                                    method.payment_type_name
                                  }
                                </p>

                                {method.description && (
                                  <p className="mt-1 text-xs text-[#858b86]">
                                    {
                                      method.description
                                    }
                                  </p>
                                )}
                              </div>

                            </div>

                            {isSelected && (
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#315b45] text-white">
                                <Check
                                  size={
                                    14
                                  }
                                />
                              </span>
                            )}

                          </div>

                        </motion.button>
                      );
                    }
                  )}

                </div>
              ) : (
                <div className="rounded-2xl bg-[#faf8f3] p-8 text-center">

                  <CreditCard
                    size={30}
                    className="mx-auto mb-2 text-[#aaa69e]"
                  />

                  <p className="text-sm text-[#858983]">
                    Không có phương thức
                    thanh toán khả dụng.
                  </p>

                </div>
              )}

            </motion.section>

          </div>

          {/* =================================================
              RIGHT - ORDER SUMMARY
          ================================================= */}

          <motion.aside
            initial={{
              opacity: 0,
              x: 15,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            className="lg:sticky lg:top-6 lg:h-fit"
          >

            <div className="overflow-hidden rounded-3xl border border-[#e1dbd1] bg-[#fffdfa] shadow-[0_15px_45px_rgba(54,65,55,0.08)]">

              {/* ===========================================
                  SUMMARY HEADER
              ============================================ */}

              <div className="bg-[#315b45] px-6 py-6 text-white">

                <div className="flex items-center gap-3">

                  <div className="rounded-xl bg-white/10 p-3">
                    <ShoppingBag
                      size={21}
                    />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold">
                      Đơn hàng của bạn
                    </h2>

                    <p className="text-xs text-white/65">
                      {cartItems.length} sản phẩm
                    </p>
                  </div>

                </div>

              </div>

              {/* ===========================================
                  PRODUCTS
              ============================================ */}

              <div className="p-6">

                {cartItems.length ===
                0 ? (
                  <div className="py-8 text-center">

                    <ShoppingBag
                      size={32}
                      className="mx-auto mb-3 text-[#aaa69e]"
                    />

                    <p className="text-sm text-[#858983]">
                      Giỏ hàng trống
                    </p>

                  </div>
                ) : (
                  <div className="space-y-5">

                    {cartItems.map(
                      (item) => (
                        <div
                          key={item.id}
                          className="flex gap-3"
                        >

                          <div className="relative h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-xl border border-[#e5dfd6] bg-[#f5f1ea]">

                            <img
                              src={
                                item.image
                              }
                              alt={
                                item.name
                              }
                              className="h-full w-full object-cover"
                            />

                            <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#315b45] px-1 text-[10px] font-bold text-white">
                              {
                                item.quantity
                              }
                            </span>

                          </div>

                          <div className="min-w-0 flex-1">

                            <div className="flex items-start justify-between gap-2">

                              <div>
                                <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-[#33473a]">
                                  {
                                    item.name
                                  }
                                </h3>

                                <p className="mt-1 text-xs text-[#8a908b]">
                                  Đơn giá:{" "}
                                  {formatPrice(
                                    item.price
                                  )}
                                </p>
                              </div>

                              <button
                                onClick={() =>
                                  handleRemove(
                                    item.id.toString(),
                                    item.name
                                  )
                                }
                                className="flex-shrink-0 text-[#aaa39a] transition hover:text-[#b44e38]"
                                title="Xóa sản phẩm"
                              >
                                <Trash2
                                  size={
                                    15
                                  }
                                />
                              </button>

                            </div>

                            <p className="mt-2 text-sm font-bold text-[#c96b45]">
                              {formatPrice(
                                item.price *
                                  item.quantity
                              )}
                            </p>

                          </div>

                        </div>
                      )
                    )}

                    {isReorder && (
                      <button
                        onClick={() => {
                          dispatch(
                            clearProduct()
                          );

                          setIsReorder(
                            false
                          );

                          message.success(
                            "Đã xóa đơn hàng cũ!"
                          );
                        }}
                        className="w-full rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-500 transition hover:bg-red-100"
                      >
                        Xóa và chọn lại
                      </button>
                    )}

                  </div>
                )}

                {/* =========================================
                    COUPON
                ========================================== */}

                <div className="my-6 border-y border-[#e8e2d9] py-5">

                  <div className="mb-3 flex items-center gap-2">

                    <Tag
                      size={16}
                      className="text-[#c96b45]"
                    />

                    <span className="text-sm font-bold text-[#33473a]">
                      Mã giảm giá
                    </span>

                  </div>

                  <div className="flex gap-2">

                    <input
                      type="text"
                      value={
                        couponCode
                      }
                      onChange={(e) =>
                        setCouponCode(
                          e.target.value
                        )
                      }
                      onKeyDown={(e) => {
                        if (
                          e.key ===
                          "Enter"
                        ) {
                          applyCoupon();
                        }
                      }}
                      placeholder="Nhập mã giảm giá"
                      className="min-w-0 flex-1 rounded-xl border border-[#ddd7cd] bg-[#faf8f4] px-3 py-2.5 text-sm outline-none transition placeholder:text-[#aaa59d] focus:border-[#315b45] focus:bg-white"
                    />

                    <button
                      onClick={
                        applyCoupon
                      }
                      className="rounded-xl bg-[#315b45] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#264936]"
                    >
                      Áp dụng
                    </button>

                  </div>

                  {appliedCoupon && (
                    <div className="mt-3 rounded-xl bg-[#edf6ef] px-3 py-2">

                      <p className="text-xs font-medium text-[#3e674c]">
                        ✓ Đã áp dụng{" "}
                        <strong>
                          {
                            appliedCoupon.coupon_code
                          }
                        </strong>
                      </p>

                      <p className="mt-1 text-xs text-[#5d7c66]">
                        Bạn được giảm{" "}
                        <strong>
                          {formatPrice(
                            discount
                          )}
                        </strong>
                      </p>

                    </div>
                  )}

                </div>

                {/* =========================================
                    SUMMARY
                ========================================== */}

                <div className="space-y-3">

                  <div className="flex justify-between text-sm">

                    <span className="text-[#777e78]">
                      Tạm tính
                    </span>

                    <span className="font-semibold text-[#35443a]">
                      {formatPrice(
                        subtotal
                      )}
                    </span>

                  </div>

                  <div className="flex justify-between text-sm">

                    <span className="text-[#777e78]">
                      Phí vận chuyển
                    </span>

                    <span className="font-semibold text-[#35443a]">

                      {selectedShippingMethod
                        ? selectedShippingMethod.delivery_fee ===
                          0
                          ? "Miễn phí"
                          : formatPrice(
                              selectedShippingMethod.delivery_fee
                            )
                        : "Đang tính..."}

                    </span>

                  </div>

                  <div className="flex justify-between text-sm">

                    <span className="text-[#777e78]">
                      Giảm giá
                    </span>

                    <span className="font-semibold text-[#4d875f]">

                      {discount > 0
                        ? `-${formatPrice(
                            discount
                          )}`
                        : "—"}

                    </span>

                  </div>

                </div>

                {/* =========================================
                    TOTAL
                ========================================== */}

                <div className="my-6 border-t border-[#e4ded5] pt-5">

                  <div className="flex items-end justify-between gap-4">

                    <div>
                      <p className="text-sm text-[#777e78]">
                        Tổng cộng
                      </p>

                      <p className="mt-1 text-xs text-[#a09c95]">
                        Đã bao gồm phí vận chuyển
                      </p>
                    </div>

                    <span className="text-2xl font-bold text-[#c96b45]">
                      {formatPrice(
                        calculateTotal
                      )}
                    </span>

                  </div>

                </div>

                {/* =========================================
                    CHECKOUT
                ========================================== */}

                <motion.button
                  whileHover={{
                    scale: 1.01,
                  }}
                  whileTap={{
                    scale: 0.98,
                  }}
                  onClick={
                    handleCheckout
                  }
                  className="w-full rounded-2xl bg-[#315b45] py-4 text-sm font-bold text-white shadow-[0_8px_20px_rgba(49,91,69,0.2)] transition hover:bg-[#264936]"
                >
                  Hoàn tất đơn hàng
                </motion.button>

                {/* =========================================
                    SECURITY
                ========================================== */}

                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#8b908b]">

                  <ShieldCheck
                    size={15}
                    className="text-[#315b45]"
                  />

                  Thanh toán an toàn và bảo mật

                </div>

              </div>

            </div>

          </motion.aside>

        </div>

      </main>

      {/* ===================================================
          ADDRESS SELECT MODAL
      =================================================== */}

      <Modal
        open={isAddressModalOpen}
        onCancel={() =>
          setIsAddressModalOpen(false)
        }
        footer={null}
        width={650}
        centered
        title={
          <div>
            <p className="text-lg font-bold text-[#294634]">
              Chọn địa chỉ giao hàng
            </p>

            <p className="text-xs font-normal text-[#858b86]">
              Chọn địa chỉ bạn muốn nhận hàng
            </p>
          </div>
        }
      >

        <div className="max-h-[450px] space-y-3 overflow-y-auto py-4">

          {addresses.length > 0 ? (
            addresses.map(
              (address, index) => (
                <div
                  key={
                    address._id ||
                    `${address.name}-${address.phone}-${index}`
                  }
                  onClick={() =>
                    setCheckedAddressId(
                      address._id ||
                        null
                    )
                  }
                  className={`cursor-pointer rounded-2xl border p-4 transition ${
                    checkedAddressId ===
                    address._id
                      ? "border-[#315b45] bg-[#f2f7f2]"
                      : "border-[#e4dfd7] hover:border-[#b9c9bc]"
                  }`}
                >

                  <div className="flex gap-3">

                    <input
                      type="radio"
                      checked={
                        checkedAddressId ===
                        address._id
                      }
                      onChange={() =>
                        setCheckedAddressId(
                          address._id ||
                            null
                        )
                      }
                      className="mt-1 accent-[#315b45]"
                    />

                    <div className="flex-1">

                      <div className="flex flex-wrap items-center gap-2">

                        <span className="font-bold text-[#33473a]">
                          {
                            address.name
                          }
                        </span>

                        <span className="text-[#aaa39a]">
                          |
                        </span>

                        <span className="text-sm text-[#707872]">
                          {
                            address.phone
                          }
                        </span>

                        {address.isDefault && (
                          <span className="rounded-full bg-[#e0eee2] px-2 py-0.5 text-[10px] font-bold text-[#315b45]">
                            Mặc định
                          </span>
                        )}

                      </div>

                      <p className="mt-2 text-sm leading-5 text-[#707872]">
                        {
                          address.address
                        }
                      </p>

                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();

                        handleOpenEditAddress(
                          address,
                          index
                        );
                      }}
                      className="self-start text-sm font-bold text-[#c96b45] hover:underline"
                    >
                      Sửa
                    </button>

                  </div>

                </div>
              )
            )
          ) : (
            <div className="py-10 text-center text-sm text-[#858983]">
              Chưa có địa chỉ nào.
            </div>
          )}

        </div>

        <div className="flex flex-col gap-2 border-t border-[#e8e2d9] pt-4 sm:flex-row sm:justify-end">

          <button
            onClick={() => {
              setIsAddressModalOpen(
                false
              );

              resetAddressForm();

              setIsAddAddressModalOpen(
                true
              );
            }}
            className="rounded-xl border border-[#315b45] px-5 py-2.5 text-sm font-bold text-[#315b45] transition hover:bg-[#f1f6f2]"
          >
            + Thêm địa chỉ
          </button>

          <button
            onClick={
              handleConfirmAddress
            }
            className="rounded-xl bg-[#315b45] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#264936]"
          >
            Xác nhận
          </button>

        </div>

      </Modal>

      {/* ===================================================
          ADD ADDRESS MODAL
      =================================================== */}

      <Modal
        open={isAddAddressModalOpen}
        onCancel={() => {
          setIsAddAddressModalOpen(
            false
          );

          resetAddressForm();
        }}
        onOk={
          handleAddAddress
        }
        okText="Lưu địa chỉ"
        cancelText="Hủy"
        width={650}
        centered
        okButtonProps={{
          style: {
            background:
              "#315b45",
          },
        }}
        title={
          <span className="font-bold text-[#294634]">
            Thêm địa chỉ mới
          </span>
        }
      >
        {renderAddressForm()}
      </Modal>

      {/* ===================================================
          EDIT ADDRESS MODAL
      =================================================== */}

      <Modal
        open={isEditAddressModalOpen}
        onCancel={() => {
          setIsEditAddressModalOpen(
            false
          );

          setEditAddressIndex(
            null
          );

          resetAddressForm();
        }}
        onOk={
          handleEditAddress
        }
        okText="Lưu thay đổi"
        cancelText="Hủy"
        width={650}
        centered
        okButtonProps={{
          style: {
            background:
              "#315b45",
          },
        }}
        title={
          <span className="font-bold text-[#294634]">
            Chỉnh sửa địa chỉ
          </span>
        }
      >
        {renderAddressForm()}
      </Modal>

    </div>
  );
};

export default Payment;