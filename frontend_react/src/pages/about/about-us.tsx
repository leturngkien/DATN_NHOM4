import { ArrowRight, Award, HeartHandshake, ShieldCheck, ShoppingBag, Sparkles, Truck } from "lucide-react";

const values = [
  {
    icon: <HeartHandshake size={28} />,
    title: "Thương hiệu chăm sóc thật lòng",
    text: "Pet Corner luôn đặt sự an toàn, sự thoải mái và niềm vui của thú cưng lên hàng đầu trong mọi quyết định của mình.",
  },
  {
    icon: <ShieldCheck size={28} />,
    title: "Sản phẩm đáng tin cậy",
    text: "Tất cả các mặt hàng đều được chọn lọc kỹ lưỡng, đảm bảo chất lượng, nguồn gốc rõ ràng và phù hợp cho từng nhu cầu của thú cưng.",
  },
  {
    icon: <Truck size={28} />,
    title: "Giao hàng nhanh chóng",
    text: "Chúng tôi mong muốn khách hàng nhận được sản phẩm đúng hẹn và tận dụng trọn vẹn sự tiện lợi trong từng đơn hàng.",
  },
  {
    icon: <Award size={28} />,
    title: "Dịch vụ tận tâm",
    text: "Đội ngũ chuyên gia sẵn sàng hỗ trợ bạn lựa chọn sản phẩm tốt nhất cho mèo, chó và các thú cưng trong gia đình.",
  },
];

const stats = [
  { label: "Sản phẩm được tuyển chọn", value: "500+" },
  { label: "Khách hàng tin tưởng", value: "4.9/5" },
  { label: "Hỗ trợ 24/7", value: "24/7" },
  { label: "Đổi trả dễ dàng", value: "30 ngày" },
];

export default function AboutUsPage() {
  return (
    <main style={{ background: "linear-gradient(180deg, #f9f5f0 0%, #f4efe8 100%)", minHeight: "100vh", padding: "40px 20px 90px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <section
          style={{
            background: "linear-gradient(135deg, #232620 0%, #383b35 45%, #5b4131 100%)",
            borderRadius: 30,
            padding: "44px 28px",
            color: "#fff",
            boxShadow: "0 22px 50px rgba(35,38,32,0.12)",
            marginBottom: 30,
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 28, alignItems: "center" }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 999, padding: "8px 14px", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>
                <Sparkles size={14} />
                Về chúng tôi
              </div>
              <h1 style={{ margin: "18px 0 14px", fontSize: "clamp(2.4rem, 5vw, 4rem)", lineHeight: 1.08, color: "#fff" }}>
                Pet Corner là nơi yêu thương cho từng bé thú cưng.
              </h1>
              <p style={{ margin: 0, maxWidth: 620, color: "rgba(255,255,255,0.8)", lineHeight: 1.8, fontSize: 17 }}>
                Chúng tôi tin rằng mỗi thú cưng đều cần một môi trường sống khỏe mạnh, một chế độ dinh dưỡng đúng cách và một người chủ luôn đồng hành bằng tình yêu chân thành.
              </p>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 26,
                padding: 22,
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(140px, 1fr))",
                gap: 16,
              }}
            >
              {stats.map((stat) => (
                <div key={stat.label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 20, padding: "18px 16px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#f7c58b", marginBottom: 6 }}>{stat.value}</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ marginBottom: 30, background: "#fff", borderRadius: 30, padding: "36px 28px", boxShadow: "0 18px 40px rgba(35,38,32,0.06)", border: "1px solid rgba(35,38,32,0.05)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, alignItems: "center" }}>
            <div>
              <span style={{ color: "#E4572E", fontWeight: 800, letterSpacing: 2, fontSize: 12, textTransform: "uppercase" }}>Câu chuyện của chúng tôi</span>
              <h2 style={{ margin: "12px 0 14px", fontSize: "clamp(2rem, 3vw, 2.8rem)", lineHeight: 1.2, color: "#232620" }}>
                Mang đến sự khỏe mạnh và hạnh phúc cho thú cưng mỗi ngày.
              </h2>
              <p style={{ margin: 0, color: "#726B5E", lineHeight: 1.8, fontSize: 17 }}>
                Pet Corner được thành lập với mong muốn trở thành nơi chủ nuôi có thể tìm thấy các sản phẩm phù hợp cho thú cưng của mình. Từ thức ăn, phụ kiện cho đến giải pháp hỗ trợ chăm sóc và tư vấn chuyên môn, mọi thứ đều được xây dựng dựa trên sự tin cậy và niềm yêu thương.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(180px, 1fr))", gap: 18 }}>
              <div style={{ background: "linear-gradient(180deg, #fffaf3 0%, #fff 100%)", border: "1px solid rgba(35,38,32,0.04)", borderRadius: 24, padding: 22 }}>
                <div style={{ width: 46, height: 46, borderRadius: 14, background: "rgba(228,87,46,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#E4572E", marginBottom: 14 }}>
                  <ShoppingBag size={22} />
                </div>
                <div style={{ fontWeight: 800, fontSize: 20, color: "#232620", marginBottom: 8 }}>Mục tiêu</div>
                <div style={{ color: "#726B5E", lineHeight: 1.7 }}>Cung cấp giải pháp chăm sóc thú cưng đúng chuẩn và tiện nghi cho gia đình bạn.</div>
              </div>

              <div style={{ background: "linear-gradient(180deg, #f5f7f2 0%, #fff 100%)", border: "1px solid rgba(35,38,32,0.04)", borderRadius: 24, padding: 22 }}>
                <div style={{ width: 46, height: 46, borderRadius: 14, background: "rgba(63,102,64,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#3F6640", marginBottom: 14 }}>
                  <HeartHandshake size={22} />
                </div>
                <div style={{ fontWeight: 800, fontSize: 20, color: "#232620", marginBottom: 8 }}>Giá trị</div>
                <div style={{ color: "#726B5E", lineHeight: 1.7 }}>Hướng tới sự tin cậy, sự tử tế và sức khỏe bền vững cho thú cưng.</div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: 30 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 22 }}>
            {values.map((item) => (
              <div key={item.title} style={{ background: "#fff", border: "1px solid rgba(35,38,32,0.05)", borderRadius: 26, padding: 24, boxShadow: "0 14px 28px rgba(35,38,32,0.04)" }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: "#fff4ee", color: "#E4572E", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                  {item.icon}
                </div>
                <h3 style={{ margin: "0 0 10px", color: "#232620", fontSize: 22, lineHeight: 1.35 }}>{item.title}</h3>
                <p style={{ margin: 0, color: "#726B5E", lineHeight: 1.8 }}>{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          style={{
            background: "linear-gradient(135deg, #fffaf5 0%, #f7f2eb 100%)",
            borderRadius: 30,
            border: "1px solid rgba(35,38,32,0.05)",
            padding: "32px 28px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 20,
            flexWrap: "wrap",
            boxShadow: "0 18px 35px rgba(35,38,32,0.05)",
          }}
        >
          <div>
            <span style={{ color: "#E4572E", fontWeight: 800, letterSpacing: 2, fontSize: 12, textTransform: "uppercase" }}>Pet Corner</span>
            <h3 style={{ margin: "10px 0 0", color: "#232620", fontSize: "clamp(1.8rem, 3vw, 2.5rem)" }}>Sẵn sàng hỗ trợ bạn tìm giải pháp tốt nhất cho thú cưng.</h3>
          </div>

          <a
            href="/contact"
            style={{
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#E4572E",
              color: "#fff",
              borderRadius: 999,
              padding: "14px 22px",
              fontWeight: 700,
              boxShadow: "0 12px 25px rgba(228,87,46,0.25)",
            }}
          >
            Liên hệ ngay
            <ArrowRight size={18} />
          </a>
        </section>
      </div>
    </main>
  );
}
