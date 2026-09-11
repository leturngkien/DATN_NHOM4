import { useState } from "react";

declare global {
  interface Window {
    google: any;
  }
}
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import type { CredentialResponse } from "@react-oauth/google";
import {
  Button,
  Input,
  notification,
  Modal,
} from "antd";
import "antd/dist/reset.css";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import loginApi from "../../api/login";
import "./auth.css";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return fallback;
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] =
    useState(false);
  const [isSending, setIsSending] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] =
    useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email.trim() && !password.trim()) {
      notification.error({
        message: "Lỗi!",
        description: "Các thông tin không được bỏ trống!",
        placement: "topRight",
        duration: 2,
      });
      return;
    }
    if (!email.trim()) {
      notification.error({
        message: "Lỗi!",
        description: "Email không được bỏ trống!",
        placement: "topRight",
        duration: 2,
      });
      return;
    }
    if (!password.trim()) {
      notification.error({
        message: "Lỗi!",
        description: "Mật khẩu không được bỏ trống!",
        placement: "topRight",
        duration: 2,
      });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      notification.warning({
        message: "Lỗi!",
        description: "Vui lòng nhập email hợp lệ!",
        placement: "topRight",
        duration: 2,
      });
      return;
    }

    setLoading(true);
    try {
      const { data } = await loginApi.login({ email, password });

      if (data.success) {
        const { userData, accessToken } = data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("accountID", JSON.stringify(userData._id));
        localStorage.setItem("userData", JSON.stringify(userData));

        notification.success({
          message: "Đăng nhập thành công!",
          description: "Chào mừng bạn quay trở lại!",
          placement: "topRight",
          duration: 1.5,
        });
        navigate("/");
      } else {
        throw new Error(data.message || "Đăng nhập thất bại");
      }
    } catch (error) {
      const errorMessage = getErrorMessage(
        error,
        "Có lỗi xảy ra trong quá trình đăng nhập."
      );
      if (errorMessage.includes("Vui lòng xác thực email bằng OTP")) {
        notification.warning({
          message: "Chưa xác thực tài khoản!",
          description:
            "Vui lòng kiểm tra email để nhập OTP xác thực trước khi đăng nhập.",
          placement: "topRight",
          duration: 3,
          onClose: () => {
            navigate("/verify-otp", { state: { email } });
          },
        });
      } else {
        notification.error({
          message: "Lỗi!",
          description: errorMessage,
          placement: "topRight",
          duration: 2,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      notification.warning({
        message: "Vui lòng nhập email!",
        placement: "topRight",
        duration: 2,
      });
      return;
    }
    setIsSending(true);
    try {
      const { data } = await loginApi.forgotPassword(forgotEmail);
      if (data.success) {
        notification.success({
          message: "Kiểm tra email!",
          description: "Hãy kiểm tra hộp thư của bạn để đặt lại mật khẩu.",
          placement: "topRight",
          duration: 2,
        });
        setIsForgotPasswordModalOpen(false);
        setIsResetPasswordModalOpen(true);
      } else {
        throw new Error(data.message || "Không thể gửi yêu cầu!");
      }
    } catch (error) {
      notification.error({
        message: "Lỗi!",
        description: "Email không tồn tại!",
        placement: "topRight",
        duration: 2,
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetToken || !newPassword) {
      notification.warning({
        message: "Vui lòng nhập mã xác nhận và mật khẩu mới!",
        placement: "topRight",
        duration: 2,
      });
      return;
    }
    if (newPassword.length < 6) {
      notification.warning({
        message: "Lỗi!",
        description: "Mật khẩu phải có ít nhất 6 ký tự!",
        placement: "topRight",
        duration: 2,
      });
      return;
    }

    setIsSending(true);
    try {
      const { data } = await loginApi.resetPassword({
        resetToken,
        newPassword,
      });
      if (data.success) {
        notification.success({
          message: "Mật khẩu đã được đặt lại thành công!",
          placement: "topRight",
          duration: 2,
        });
        setIsResetPasswordModalOpen(false);
        setForgotEmail("");
        setResetToken("");
        setNewPassword("");
      } else {
        throw new Error(data.message || "Không thể đặt lại mật khẩu!");
      }
    } catch (error) {
      notification.error({
        message: "Lỗi!",
        description: getErrorMessage(error, "Không thể đặt lại mật khẩu."),
        placement: "topRight",
        duration: 2,
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleGoogleLogin = (credentialResponse: CredentialResponse) => {
    const idToken = credentialResponse.credential;
    if (!idToken) {
      notification.error({
        message: "Đăng nhập thất bại!",
        description: "Google không trả về thông tin xác thực.",
        placement: "topRight",
        duration: 2,
      });
      return;
    }
    loginApi
      .googleLogin(idToken)
      .then((response) => {
        const data = response.data;
        if (!data.success) {
          return Promise.reject(
            new Error(`Server error: ${data.message || "Unknown error"}`)
          );
        }
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("accountID", data.user.id);
        localStorage.setItem("userData", JSON.stringify(data.user));
        notification.success({
          message: "Đăng nhập bằng Google thành công!",
          description: "Chào mừng bạn quay trở lại!",
          placement: "topRight",
          duration: 2,
          onClose: () => {
            // Luôn chuyển hướng đến trang chính (/)
            navigate("/");
          },
        });
      })
      .catch((err) => {
        notification.error({
          message: "Lỗi!",
          description: getErrorMessage(
            err,
            "Có lỗi xảy ra khi kết nối với Google."
          ),
          placement: "topRight",
          duration: 2,
        });
      });
  };

  return (
    <main className="auth-page auth-login-page">
      <section className="auth-layout">
        <aside className="auth-showcase">
          <div className="auth-showcase-copy">
            <span className="auth-kicker">PET CORNER</span>
            <h2>Chăm thú cưng từ những điều nhỏ nhất.</h2>
            <p>Sản phẩm được chọn kỹ, giao tận nhà và luôn có người đồng hành cùng bạn.</p>
          </div>
          <img className="auth-showcase-image" src="/images/cat&dog.png" alt="Thú cưng" />
          <ul className="auth-showcase-list">
            <li>Mua sắm nhanh chóng, dễ dàng</li>
            <li>Ưu đãi riêng cho thành viên</li>
          </ul>
        </aside>
        <section className="auth-card">
          <button className="auth-back" onClick={() => navigate("/")}>← Về trang chủ</button>
          <span className="auth-kicker">CHÀO MỪNG TRỞ LẠI</span>
          <h1>Đăng nhập</h1>
          <p>Đăng nhập để tiếp tục chăm sóc người bạn nhỏ của mình.</p>
          <form className="auth-form" onSubmit={(event) => { event.preventDefault(); void handleLogin(); }}>
            <label>Email<Input type="email" id="email" placeholder="Nhập email của bạn" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
            <label>Mật khẩu<Input type={showPassword ? "text" : "password"} id="password" placeholder="Nhập mật khẩu của bạn" value={password} onChange={(event) => setPassword(event.target.value)} suffix={<span onClick={() => setShowPassword(!showPassword)} style={{ cursor: "pointer" }}>{showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}</span>} /></label>
            <button type="button" className="auth-forgot" onClick={() => setIsForgotPasswordModalOpen(true)}>Quên mật khẩu?</button>
            <Button type="primary" htmlType="submit" className="auth-submit" loading={loading}>{loading ? "Đang đăng nhập..." : "Đăng nhập"}</Button>
          </form>
          <div className="auth-divider">hoặc</div>
          <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              size="large"
              width="100%"
              type="standard"
              onError={() => notification.error({ message: "Đăng nhập thất bại!", description: "Có lỗi xảy ra khi đăng nhập bằng Google.", placement: "topRight", duration: 2 })}
            />
          </GoogleOAuthProvider>
          <button className="auth-login-link" onClick={() => navigate("/signup")}>Tạo tài khoản mới</button>
          <p className="auth-switch">Pet Corner cam kết bảo mật thông tin của bạn.</p>
        </section>
      </section>

      <Modal
        title="Quên Mật Khẩu"
        open={isForgotPasswordModalOpen}
        onCancel={() => setIsForgotPasswordModalOpen(false)}
        footer={[
          <Button
            key="cancel"
            onClick={() => setIsForgotPasswordModalOpen(false)}
          >
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={isSending}
            onClick={handleForgotPassword}
          >
            Gửi
          </Button>,
        ]}
      >
        <p>Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu.</p>
        <Input
          type="email"
          placeholder="Nhập email"
          value={forgotEmail}
          onChange={(e) => setForgotEmail(e.target.value)}
        />
      </Modal>

      <Modal
        title="Đặt Lại Mật Khẩu"
        open={isResetPasswordModalOpen}
        onCancel={() => setIsResetPasswordModalOpen(false)}
        footer={[
          <Button
            key="cancel"
            onClick={() => setIsResetPasswordModalOpen(false)}
          >
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={isSending}
            onClick={handleResetPassword}
          >
            Đặt lại
          </Button>,
        ]}
      >
        <p>Nhập mã xác nhận và mật khẩu mới của bạn.</p>
        <Input
          className="mb-2"
          type="text"
          placeholder="Mã xác nhận"
          value={resetToken}
          onChange={(e) => setResetToken(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Mật khẩu mới"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </Modal>
    </main>
  );
}
