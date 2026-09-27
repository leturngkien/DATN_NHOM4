import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, Heart, Search, ShoppingCart } from "lucide-react";
import logoImage from "../../pages/img/logo.jpg";
import "./shopHeader.css";

export default function ShopHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const cartItems = useSelector((state: any) => state.cart.items);
  const cartCount = cartItems.reduce(
    (total: number, item: { quantity?: number }) => total + Number(item.quantity || 0),
    0
  );
  const userData = localStorage.getItem("userData");
  const user = userData ? JSON.parse(userData) : null;
  const activePage = location.pathname === "/"
    ? "home"
    : location.pathname === "/products"
      ? "products"
      : location.pathname === "/about-us"
        ? "about"
        : "";
  const accountInitials = user?.fullname?.trim().slice(0, 2).toUpperCase() || "TK";

  return (
    <>
      <header className="shop-header">
        <div className="shop-header-main">
          <button className="shop-brand" onClick={() => navigate("/")} aria-label="Về trang chủ">
            <img src={logoImage} alt="Pet Corner" />
          </button>

          <nav className="shop-nav" aria-label="Điều hướng chính">
            <button className={activePage === "home" ? "active" : ""} aria-current={activePage === "home" ? "page" : undefined} onClick={() => navigate("/")}>Trang chủ</button>
            <button className={activePage === "products" ? "active" : ""} aria-current={activePage === "products" ? "page" : undefined} onClick={() => navigate("/products")}>Sản phẩm</button>
            <button className={location.pathname === "/" && location.hash === "#services" ? "active" : ""} onClick={() => navigate("/#services")}>Dịch vụ</button>
            <button className={activePage === "about" ? "active" : ""} aria-current={activePage === "about" ? "page" : undefined} onClick={() => navigate("/about-us")}>Về chúng tôi</button>
          </nav>

          <div className="shop-actions">
            <button aria-label="Tìm kiếm" onClick={() => navigate("/products")}><Search /></button>
            <button aria-label="Sản phẩm yêu thích"><Heart /></button>
            <button className="shop-cart-action" aria-label="Mở giỏ hàng" onClick={() => navigate("/cart")}>
              <ShoppingCart />
              <span>{cartCount}</span>
            </button>
            {user ? (
              <button className="shop-account" aria-label="Tài khoản" onClick={() => navigate("/userprofile/account")}>
                {user.avatar ? <img src={user.avatar} alt="" /> : <span className="shop-account-initials">{accountInitials}</span>}
                <span className="shop-account-name">{user.fullname || "Tài khoản"}</span>
                <ChevronDown />
              </button>
            ) : (
              <button className="shop-login" onClick={() => navigate("/login")}>Đăng nhập</button>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
