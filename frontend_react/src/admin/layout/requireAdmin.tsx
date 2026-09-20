import { ReactNode } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { Button, Result } from "antd";

interface StoredUser {
  _id?: string;
  fullname?: string;
  email?: string;
  role?: string;
}

export const readStoredUser = (): StoredUser | null => {
  try {
    const raw = localStorage.getItem("userData");
    return raw ? (JSON.parse(raw) as StoredUser) : null;
  } catch {
    return null;
  }
};

function RequireAdmin({ children }: { children: ReactNode }) {
  const location = useLocation();
  const token = localStorage.getItem("accessToken");
  const user = readStoredUser();

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Backend chỉ cho phép role "admin" gọi các API thêm/sửa/xóa,
  // nên khu vực quản trị cũng giới hạn đúng như vậy.
  if (user.role !== "admin") {
    return (
      <Result
        status="403"
        title="Không có quyền truy cập"
        subTitle="Chỉ tài khoản quản trị viên mới vào được khu vực quản lý."
        extra={
          <Link to="/">
            <Button type="primary">Về trang chủ</Button>
          </Link>
        }
      />
    );
  }

  return <>{children}</>;
}

export default RequireAdmin;
