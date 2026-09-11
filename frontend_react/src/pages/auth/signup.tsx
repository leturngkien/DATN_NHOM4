import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import signupApi from "../../api/signupApi";
import "./auth.css";

function Signup() {
  const navigate = useNavigate();
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [needsOtp, setNeedsOtp] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const normalizedFullname = fullname.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);

    try {
      const response = await signupApi.signup({
        fullname: normalizedFullname,
        email: normalizedEmail,
        password,
      });

      if (response?.data?.success === false) {
        throw new Error(response.data.message || "Đăng ký thất bại.");
      }

      setEmail(normalizedEmail);
      setNeedsOtp(true);
      setSuccess("Mã OTP đã được gửi tới email của bạn.");
    } catch (requestError) {
      const message = requestError as { message?: string };
      setError(message?.message || "Không thể đăng ký tài khoản.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await signupApi.verifyOtp(email.trim().toLowerCase(), otp.trim());

      if (response?.data?.success === false) {
        throw new Error(response.data.message || "Xác thực OTP thất bại.");
      }

      setSuccess("Xác thực thành công. Đang chuyển tới trang đăng nhập...");
      setTimeout(() => navigate("/login"), 1200);
    } catch (requestError) {
      const message = requestError as { message?: string };
      setError(message?.message || "Mã OTP không đúng hoặc đã hết hạn.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link to="/" className="auth-back">← Về trang chủ</Link>
        <span className="auth-kicker">PET CORNER</span>
        <h1>{needsOtp ? "Xác thực email" : "Tạo tài khoản"}</h1>
        <p>{needsOtp ? `Nhập mã OTP đã gửi tới ${email}.` : "Đăng ký để mua sắm thuận tiện hơn."}</p>

        {!needsOtp ? (
          <form className="auth-form" onSubmit={handleSignup}>
            <label>
              Họ và tên
              <input value={fullname} onChange={(event) => setFullname(event.target.value)} minLength={3} required />
            </label>
            <label>
              Email
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </label>
            <label>
              Mật khẩu
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} required />
            </label>
            <label>
              Xác nhận mật khẩu
              <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={6} required />
            </label>
            {error && <p className="auth-error">{error}</p>}
            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "Đang đăng ký..." : "Đăng ký"}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleVerifyOtp}>
            <label>
              Mã OTP
              <input value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))} inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required />
            </label>
            {error && <p className="auth-error">{error}</p>}
            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "Đang xác thực..." : "Xác thực OTP"}
            </button>
          </form>
        )}

        {success && <p className="auth-success">{success}</p>}
        <p className="auth-switch">Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
      </section>
    </main>
  );
}

export default Signup;
