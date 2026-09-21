import { useState } from "react";
import contactApi from "../../api/contactApi";

const contactItems = [
  {
    label: "Hotline",
    value: "0853665735",
    href: "tel:0853665735",
  },
  {
    label: "Email",
    value: "petcorner993@gmail.com",
    href: "mailto:petcorner993@gmail.com",
  },
  {
    label: "Địa chỉ",
    value: "116 Nguyễn Văn Thủ, P. Đa Kao, Q. 1, TP. HCM",
    href: "https://maps.google.com/?q=116+Nguyen+Van+Thu+Da+Kao+Quan+1+TPHCM",
  },
];

function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setSuccess("");
    setError("");

    try {
      await contactApi.send(form);
      setSuccess("Gửi liên hệ thành công. Chúng tôi sẽ phản hồi sớm nhất.");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (requestError: any) {
      console.error("Không thể gửi liên hệ:", requestError);
      setError(requestError?.response?.data?.message || "Không thể gửi liên hệ lúc này.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main style={{ background: "#f8f6f2", minHeight: "100vh", padding: "40px 20px 80px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 32, maxWidth: 700 }}>
          <p
            style={{
              color: "#E4572E",
              fontWeight: 700,
              letterSpacing: 2,
              fontSize: 12,
              marginBottom: 10,
            }}
          >
            PET CORNER
          </p>
          <h1 style={{ margin: 0, color: "#232620", fontSize: "clamp(2rem, 4vw, 3rem)" }}>
            Liên hệ với chúng tôi
          </h1>
          <p style={{ marginTop: 12, color: "#726B5E", lineHeight: 1.7, fontSize: 16 }}>
            Bạn cần tư vấn sản phẩm hoặc hỗ trợ đơn hàng? Hãy để lại lời nhắn, đội ngũ Pet Corner sẽ phản hồi nhanh nhất.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 24,
          }}
        >
          <section
            style={{
              background: "#232620",
              borderRadius: 20,
              color: "#fff",
              padding: 28,
              boxShadow: "0 8px 28px rgba(35, 38, 32, 0.12)",
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: 12, fontSize: 28 }}>Thông tin cửa hàng</h2>
            <p style={{ color: "#d8d5ca", lineHeight: 1.7, marginBottom: 28 }}>
              Những người bạn đồng hành đáng tin cậy cho hành trình chăm sóc thú cưng.
            </p>

            <div style={{ display: "grid", gap: 18 }}>
              {contactItems.map((item) => (
                <div key={item.label} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: "#E4572E",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                    }}
                  >
                    {item.label === "Hotline" ? "☎" : item.label === "Email" ? "✉" : "⌂"}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, letterSpacing: 1.2, color: "#b7b8a9", textTransform: "uppercase" }}>
                      {item.label}
                    </div>
                    <a
                      href={item.href}
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                      style={{ display: "inline-block", marginTop: 6, color: "#fff", textDecoration: "none" }}
                    >
                      {item.value}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: 28,
              boxShadow: "0 8px 28px rgba(35, 38, 32, 0.08)",
              border: "1px solid rgba(35, 38, 32, 0.06)",
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: 20, color: "#232620", fontSize: 28 }}>
              Gửi tin nhắn
            </h2>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                <label style={{ display: "grid", gap: 8, color: "#232620", fontWeight: 600 }}>
                  Họ tên
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Nguyễn Văn A"
                    style={inputStyle}
                  />
                </label>

                <label style={{ display: "grid", gap: 8, color: "#232620", fontWeight: 600 }}>
                  Email
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                    style={inputStyle}
                  />
                </label>
              </div>

              <label style={{ display: "grid", gap: 8, color: "#232620", fontWeight: 600 }}>
                Số điện thoại
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="0853665735"
                  style={inputStyle}
                />
              </label>

              <label style={{ display: "grid", gap: 8, color: "#232620", fontWeight: 600 }}>
                Nội dung
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  placeholder="Bạn muốn Pet Corner hỗ trợ điều gì?"
                  style={{ ...inputStyle, resize: "vertical", minHeight: 120 }}
                />
              </label>

              {success && (
                <div style={{ color: "#1d7a4a", background: "#ecfdf5", padding: "10px 12px", borderRadius: 10 }}>
                  {success}
                </div>
              )}

              {error && (
                <div style={{ color: "#b42318", background: "#fef3f2", padding: "10px 12px", borderRadius: 10 }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: "#E4572E",
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  padding: "14px 18px",
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: submitting ? "not-allowed" : "pointer",
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? "Đang gửi..." : "Gửi liên hệ"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid rgba(35, 38, 32, 0.15)",
  background: "#f9f9f7",
  borderRadius: 10,
  padding: "12px 14px",
  fontSize: 15,
  color: "#232620",
  outline: "none",
};

export default ContactPage;
