import {
  ArrowRight,
  Award,
  HeartHandshake,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import Footer from "../../components/footer";
import ShopHeader from "../../components/layout/ShopHeader";
import "./about-us.css";

const values = [
  {
    icon: <HeartHandshake size={24} />,
    title: "Chăm sóc bằng sự thấu hiểu",
    text: "Sự an toàn, thoải mái và niềm vui của thú cưng luôn là ưu tiên trong mỗi lựa chọn của chúng tôi.",
  },
  {
    icon: <ShieldCheck size={24} />,
    title: "Sản phẩm đáng tin cậy",
    text: "Sản phẩm được chọn lọc kỹ về chất lượng, nguồn gốc và sự phù hợp với từng người bạn nhỏ.",
  },
  {
    icon: <Truck size={24} />,
    title: "Giao hàng chu đáo",
    text: "Chúng tôi muốn mỗi đơn hàng đến tay bạn đúng hẹn, thuận tiện và chỉn chu.",
  },
  {
    icon: <Award size={24} />,
    title: "Đồng hành tận tâm",
    text: "Đội ngũ Pet Corner luôn sẵn sàng giúp bạn tìm giải pháp phù hợp cho thú cưng.",
  },
];

const stats = [
  { label: "Sản phẩm tuyển chọn", value: "500+" },
  { label: "Khách hàng tin tưởng", value: "4.9/5" },
  { label: "Luôn sẵn sàng hỗ trợ", value: "24/7" },
  { label: "Đổi trả dễ dàng", value: "30 ngày" },
];

export default function AboutUsPage() {
  return (
    <div className="about-page">
      <ShopHeader />
      <main>
        <section className="about-hero">
          <img
            className="about-hero-image"
            src="https://images.unsplash.com/photo-1601758064133-2d8f3a3f1f16?auto=format&fit=crop&w=2000&q=90"
            alt="Thú cưng vui vẻ bên người thân yêu"
          />
          <div className="about-hero-overlay" aria-hidden="true" />
          <div className="about-container about-hero-content">
            <span className="about-eyebrow">Về Pet Corner</span>
            <h1>Nơi yêu thương bắt đầu từ những điều nhỏ nhất.</h1>
            <p>
              Chúng tôi đồng hành cùng bạn chăm sóc những người bạn bốn chân
              khỏe mạnh, vui vẻ và được yêu thương mỗi ngày.
            </p>
            <a className="about-primary-link" href="/products">
              Khám phá cửa hàng <ArrowRight size={17} />
            </a>
          </div>
        </section>

        <section className="about-stats" aria-label="Pet Corner qua những con số">
          <div className="about-container about-stats-grid">
            {stats.map((stat) => (
              <div className="about-stat" key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="about-story">
          <div className="about-container about-story-grid">
            <div className="about-story-image-wrap">
              <img
                src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1100&q=85"
                alt="Chú chó đang tận hưởng thời gian bên gia đình"
                loading="lazy"
              />
              <div className="about-image-note">
                <HeartHandshake size={20} />
                <span>Luôn đặt thú cưng lên hàng đầu</span>
              </div>
            </div>

            <div className="about-story-copy">
              <span className="about-section-label">Câu chuyện của chúng tôi</span>
              <h2>Chăm sóc tốt hơn, để mỗi ngày bên nhau trọn vẹn hơn.</h2>
              <p>
                Pet Corner được tạo nên từ mong muốn giúp người nuôi dễ dàng tìm
                thấy sản phẩm phù hợp, dịch vụ chất lượng và những lời tư vấn
                đáng tin cậy. Từ thức ăn, phụ kiện đến giải pháp chăm sóc, mọi
                lựa chọn đều bắt đầu bằng sự quan tâm thật lòng.
              </p>
              <ul>
                <li><ShieldCheck size={18} /> Sản phẩm được chọn lọc kỹ càng</li>
                <li><HeartHandshake size={18} /> Đội ngũ am hiểu và yêu thú cưng</li>
                <li><ShoppingBag size={18} /> Trải nghiệm mua sắm tiện lợi, chu đáo</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="about-values">
          <div className="about-container">
            <div className="about-values-heading">
              <span className="about-section-label">Điều làm nên Pet Corner</span>
              <h2>Tử tế trong từng lựa chọn.</h2>
            </div>
            <div className="about-values-grid">
              {values.map((item) => (
                <article className="about-value" key={item.title}>
                  <div className="about-value-icon">{item.icon}</div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="about-contact">
          <div className="about-container about-contact-inner">
            <div>
              <span className="about-section-label">Pet Corner luôn ở đây</span>
              <h2>Cùng tìm điều tốt nhất cho người bạn nhỏ của bạn.</h2>
            </div>
            <a className="about-primary-link" href="/contact">
              Liên hệ với chúng tôi <ArrowRight size={17} />
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}