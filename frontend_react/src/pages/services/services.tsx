import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Bath, Clock3, House, LoaderCircle, PawPrint, Sparkles, Stethoscope } from "lucide-react";
import serviceApi from "../../api/serviceApi";
import "./services.css";

type Service = {
  _id: string;
  service_name: string;
  description?: string;
  duration?: number;
  service_price?: number;
};

const serviceIcons = [Bath, Stethoscope, House, Sparkles];

const formatPrice = (price: number) =>
  Number(price || 0).toLocaleString("vi-VN") + "đ";

function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await serviceApi.getServicesActive();
        setServices(response?.data?.result || []);
      } catch (requestError) {
        console.error("Không lấy được danh sách dịch vụ:", requestError);
        setError("Hiện chưa thể tải danh sách dịch vụ. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <main className="services-page">
      <div className="services-page-container">
        <header className="services-page-heading">
          <div>
            <span className="services-page-label">PET CORNER · CHĂM SÓC THÚ CƯNG</span>
            <h1>Dịch vụ chăm sóc <span>toàn diện</span></h1>
            <p>Những chăm sóc nhỏ mỗi ngày, để bé luôn khỏe mạnh và vui vẻ bên bạn.</p>
          </div>
          <PawPrint className="services-heading-icon" aria-hidden="true" />
        </header>

        {loading ? (
          <div className="services-state" role="status">
            <LoaderCircle className="services-spinner" />
            <span>Đang tải dịch vụ...</span>
          </div>
        ) : error ? (
          <div className="services-state services-state-error" role="alert">{error}</div>
        ) : services.length === 0 ? (
          <div className="services-state">Hiện chưa có dịch vụ đang hoạt động.</div>
        ) : (
          <section className="services-grid" aria-label="Danh sách dịch vụ">
            {services.map((service, index) => {
              const ServiceIcon = serviceIcons[index % serviceIcons.length];

              return (
                <article className="service-card" key={service._id}>
                  <div className="service-card-icon"><ServiceIcon aria-hidden="true" /></div>
                  <h2>{service.service_name}</h2>
                  <p className="service-card-description">
                    {service.description || "Dịch vụ chăm sóc được thực hiện bởi đội ngũ Pet Corner."}
                  </p>
                  <div className="service-card-details">
                    <span><Clock3 aria-hidden="true" /> {Number(service.duration || 0)} phút</span>
                    <strong>{formatPrice(Number(service.service_price || 0))}</strong>
                  </div>
                  <Link className="service-card-link" to="/contact">
                    Tư vấn dịch vụ <ArrowUpRight aria-hidden="true" />
                  </Link>
                </article>
              );
            })}
          </section>
        )}

        <section className="services-contact-band">
          <div>
            <span>ĐỒNG HÀNH CÙNG BÉ</span>
            <h2>Cần tư vấn chọn dịch vụ?</h2>
            <p>Đội ngũ Pet Corner sẵn sàng giúp bạn tìm lựa chọn phù hợp cho thú cưng.</p>
          </div>
          <Link to="/contact">Liên hệ Pet Corner <ArrowUpRight aria-hidden="true" /></Link>
        </section>
      </div>
    </main>
  );
}

export default ServicesPage;