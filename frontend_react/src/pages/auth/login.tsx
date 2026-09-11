import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import loginApi from "../../api/login";
import "./auth.css";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginApi.login({ email, password });
      const data = response?.data;

      if (!data?.accessToken || !data?.userData) {
        throw new Error(data?.message || "Phản hồi đăng nhập không hợp lệ.");
      }

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("userData", JSON.stringify(data.userData));
      localStorage.setItem("accountID", String(data.userData._id));
      navigate("/");
    } catch (requestError) {
      const message = requestError as { message?: string };
      setError(message?.message || "Email hoặc mật khẩu không đúng.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link to="/" className="auth-back">← Về trang chủ</Link>
        <span className="auth-kicker">PET CORNER</span>
        <h1>Đăng nhập</h1>
        <p>Đăng nhập để tiếp tục mua sắm và quản lý đơn hàng.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label>
            Mật khẩu
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} required />
          </label>
          {error && <p className="auth-error">{error}</p>}
          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <p className="auth-switch">Chưa có tài khoản? <Link to="/signup">Đăng ký ngay</Link></p>
      </section>
    </main>
  );
}

export default Login;
