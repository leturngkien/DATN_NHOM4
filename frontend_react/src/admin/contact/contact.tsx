import { useEffect, useMemo, useState } from "react";
import {
  App,
  Button,
  Card,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import { DeleteOutlined, SearchOutlined, MailOutlined } from "@ant-design/icons";
import contactApi from "../../api/contactApi";

const { Title, Text } = Typography;
const { Option } = Select;

interface ContactRow {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: "new" | "replied" | "closed";
  createdAt?: string;
}

const statusColors: Record<string, string> = {
  new: "gold",
  replied: "blue",
  closed: "green",
};

const statusLabels: Record<string, string> = {
  new: "Mới",
  replied: "Đã phản hồi",
  closed: "Đã đóng",
};

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

function AdminContact() {
  const { message, modal } = App.useApp();
  const [contacts, setContacts] = useState<ContactRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await contactApi.getAll();
      const data = response?.result || response?.data || [];
      setContacts(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("Load contacts failed:", error);
      message.error(error?.response?.data?.message || "Không tải được danh sách liên hệ");
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const filteredContacts = useMemo(() => {
    const keyword = search.toLowerCase();
    return contacts.filter((item) => {
      const matchSearch =
        !keyword ||
        [item.name, item.email, item.phone, item.message].some((value) =>
          String(value || "").toLowerCase().includes(keyword)
        );

      const matchStatus = statusFilter === "all" || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [contacts, search, statusFilter]);

  const handleStatusChange = async (id: string, status: "new" | "replied" | "closed") => {
    try {
      await contactApi.updateStatus(id, status);
      message.success("Cập nhật trạng thái thành công");
      fetchContacts();
    } catch (error: any) {
      console.error("Update status failed:", error);
      message.error(error?.response?.data?.message || "Không thể cập nhật trạng thái");
    }
  };

  const handleDelete = (record: ContactRow) => {
    modal.confirm({
      title: "Xác nhận xóa liên hệ",
      content: `Bạn có chắc chắn muốn xóa tin nhắn của ${record.name}?`,
      okText: "Xóa",
      okButtonProps: { danger: true },
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await contactApi.delete(record._id);
          message.success("Xóa tin nhắn thành công");
          fetchContacts();
        } catch (error: any) {
          console.error("Delete contact failed:", error);
          message.error(error?.response?.data?.message || "Không thể xóa tin nhắn");
        }
      },
    });
  };

  const columns = [
    {
      title: "Khách hàng",
      key: "customer",
      render: (_: any, record: ContactRow) => (
        <div>
          <div style={{ fontWeight: 600 }}>{record.name || "Không rõ"}</div>
          <div style={{ color: "#666" }}>{record.email || "—"}</div>
        </div>
      ),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      render: (value: string) => value || "—",
    },
    {
      title: "Nội dung",
      dataIndex: "message",
      key: "message",
      render: (value: string) => (
        <div style={{ maxWidth: 420, whiteSpace: "pre-wrap" }}>{value || "—"}</div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (value: ContactRow["status"], record: ContactRow) => (
        <Select
          value={value}
          style={{ width: 155 }}
          onChange={(nextStatus) => handleStatusChange(record._id, nextStatus)}
          options={Object.entries(statusLabels).map(([key, label]) => ({
            value: key,
            label: <Tag color={statusColors[key] || "default"}>{label}</Tag>,
          }))}
        />
      ),
    },
    {
      title: "Ngày gửi",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value: string) => formatDate(value),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: ContactRow) => (
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record)}
        >
          Xóa
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Quản lý liên hệ
          </Title>
          <Text type="secondary">Xem, phân loại và xử lý tin nhắn khách hàng</Text>
        </div>
      </div>

      <Card className="admin-card">
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <Space wrap>
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder="Tìm theo tên, email, số điện thoại, nội dung"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 360 }}
            />

            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 180 }}
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="new">Mới</Option>
              <Option value="replied">Đã phản hồi</Option>
              <Option value="closed">Đã đóng</Option>
            </Select>
          </Space>

          <Table
            rowKey="_id"
            loading={loading}
            columns={columns}
            dataSource={filteredContacts}
            bordered
            pagination={{
              pageSize: 8,
              showSizeChanger: true,
              pageSizeOptions: [5, 8, 10, 20],
            }}
            locale={{ emptyText: "Chưa có tin nhắn nào" }}
          />
        </Space>
      </Card>
    </div>
  );
}

export default AdminContact;
