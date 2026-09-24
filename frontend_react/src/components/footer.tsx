import { Facebook, Instagram, Mail, MapPin, Phone, Twitter } from "lucide-react";
import "./footer.css";

const shopLinks = ["Dành cho chó", "Dành cho mèo", "Thức ăn", "Phụ kiện"];
const supportLinks = ["Về Pet Corner", "Vận chuyển", "Thanh toán", "Chính sách đổi trả"];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-main">
        <section className="footer-brand">
          <div className="footer-brand-title">
            <span className="footer-brand-mark">P</span>
            <span>
              <strong>PET CORNER</strong>
              <small>YOUR PET&apos;S HAPPY PLACE</small>
            </span>
          </div>
          <p>Những sản phẩm tử tế và dịch vụ tận tâm cho người bạn bốn chân của bạn.</p>
          <a className="footer-hotline" href="tel:0853665735">
            <Phone size={16} /> 0853 665 735
          </a>
        </section>

        <section className="footer-column">
          <h3>Cửa hàng</h3>
          {shopLinks.map((link) => <a href="/products" key={link}>{link}</a>)}
        </section>

        <section className="footer-column">
          <h3>Hỗ trợ</h3>
          {supportLinks.map((link) => <a href="/contact" key={link}>{link}</a>)}
        </section>

        <section className="footer-column footer-contact">
          <h3>Liên hệ</h3>
          <p><MapPin size={16} /> 116 Nguyễn Văn Thủ, Q.1, TP.HCM</p>
          <a href="mailto:petcorner993@gmail.com"><Mail size={16} /> petcorner993@gmail.com</a>
          <p><Phone size={16} /> 0853 665 735</p>
          <div className="footer-socials" aria-label="Mạng xã hội">
            <a href="#" aria-label="Facebook"><Facebook size={17} /></a>
            <a href="#" aria-label="Instagram"><Instagram size={17} /></a>
            <a href="#" aria-label="Twitter"><Twitter size={17} /></a>
          </div>
        </section>
      </div>

      <div className="site-footer-bottom">
        <span>© 2025 Pet Corner. All rights reserved.</span>
        <span>Chăm sóc thú cưng bằng cả sự tận tâm.</span>
      </div>

      <div className="footer-floating-actions">
        <a className="footer-call" href="tel:0853665735" aria-label="Gọi Pet Corner"><Phone size={19} /></a>
        <a className="footer-zalo" href="https://zalo.me/0853665735" target="_blank" rel="noreferrer" aria-label="Chat Zalo">Z</a>
      </div>
    </footer>
  );
}
