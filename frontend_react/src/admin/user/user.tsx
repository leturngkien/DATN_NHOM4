import { useEffect, useState } from "react";
import {
  App,
  Card,
  Input,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import userApi from "../../api/userApi";

const { Title, Text } = Typography;
const { Option } = Select;

interface UserRow {
  _id: string;
  fullname?: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: string;
  createdAt?: string;
}

const formatDate = (value?: string) => {
  if (!value) return "Chưa rõ";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const roleColors: Record<string, string> = {
  admin: "red",
  employee: "blue",
  user: "green",
};

const statusColors: Record<string, string> = {
  active: "green",
  inactive: "orange",
  blocked: "red",
};

function AdminUser() {
  const { message } = App.useApp();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userApi.getAllUsers();
      const data = response?.data?.result || response?.data || [];
      setUsers(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("Load users failed:", error);
      message.error(error?.message || "Không tải được danh sách người dùng");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const keyword = search.toLowerCase();

    const matchSearch =
      !keyword ||
      [user.fullname, user.email, user.phone].some((value) =>
        String(value || "").toLowerCase().includes(keyword)
      );

    const matchRole =
      roleFilter === "all" || (user.role || "user") === roleFilter;

    return matchSearch && matchRole;
  });

  const columns = [
    {
      title: "Họ tên",
      dataIndex: "fullname",
      key: "fullname",
      render: (value: string) => value || "Chưa cập nhật",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (value: string) => value || "—",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      render: (value: string) => value || "—",
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (value: string) => (
        <Tag color={roleColors[value || "user"] || "default"}>
          {value || "user"}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (value: string) => (
        <Tag color={statusColors[value || "active"] || "default"}>
          {value || "active"}
        </Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value: string) => formatDate(value),
    },
  ];

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Quản lý người dùng
          </Title>
          <Text type="secondary">Danh sách tài khoản khách hàng, nhân viên và quản trị</Text>
        </div>
      </div>

      <Card className="admin-card">
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <Space wrap>
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder="Tìm theo tên, email, số điện thoại"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 300 }}
            />

            <Select
              value={roleFilter}
              onChange={setRoleFilter}
              style={{ width: 180 }}
            >
              <Option value="all">Tất cả vai trò</Option>
              <Option value="admin">Admin</Option>
              <Option value="employee">Employee</Option>
              <Option value="user">User</Option>
            </Select>
          </Space>

          <Table
            rowKey="_id"
            loading={loading}
            columns={columns}
            dataSource={filteredUsers}
            pagination={{
              pageSize: 8,
              showSizeChanger: true,
              pageSizeOptions: [5, 8, 10, 20],
            }}
            bordered
          />
        </Space>
      </Card>
    </div>
  );
}

export default AdminUser;
