import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Heart, Search, ShoppingCart, UserRound } from "lucide-react";
import "./shopHeader.css";

export default function ShopHeader() {
  const navigate = useNavigate();
  const cartItems = useSelector((state: any) => state.cart.items);
  const cartCount = cartItems.reduce(
    (total: number, item: { quantity?: number }) => total + Number(item.quantity || 0),
    0
  );
  const userData = localStorage.getItem("userData");
  const user = userData ? JSON.parse(userData) : null;

  return (
    <header className="shop-header">
      <div className="shop-promo">
        <span>-15%</span> khi mua tại cửa hàng
        <div className="shop-promo-note">Miễn phí vận chuyển cho đơn từ 500K</div>
      </div>
      <div className="shop-header-main">
        <button className="shop-brand" onClick={() => navigate("/")} aria-label="Về trang chủ">
          <span className="shop-brand-mark">P</span>
          <span>
            <strong>PET CORNER</strong>
            <small>YOUR PET&apos;S HAPPY PLACE</small>
          </span>
        </button>

        <nav className="shop-nav" aria-label="Điều hướng chính">
          <button onClick={() => navigate("/")}>Trang chủ</button>
          <button onClick={() => navigate("/products")}>Sản phẩm</button>
          <button onClick={() => navigate("/#categories")}>Danh mục</button>
          <button onClick={() => navigate("/#services")}>Dịch vụ</button>
          <button onClick={() => navigate("/#about")}>Về chúng tôi</button>
        </nav>

        <div className="shop-actions">
          <button aria-label="Tìm kiếm" onClick={() => navigate("/products")}><Search /></button>
          <button aria-label="Sản phẩm yêu thích"><Heart /></button>
          <button className="shop-cart-action" aria-label="Mở giỏ hàng" onClick={() => navigate("/cart")}>
            <ShoppingCart />
            <b>{cartCount}</b>
          </button>
          <button className="shop-account" aria-label="Tài khoản" onClick={() => navigate(user ? "/userprofile/account" : "/login")}>
            {user?.avatar ? <img src={user.avatar} alt="Tài khoản" /> : <UserRound />}
            <span>{user?.fullname || "Tài khoản"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
