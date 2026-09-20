import { useCallback, useEffect, useMemo, useState } from "react";
import {
  App,
  Button,
  Card,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;

export type CrudFieldType = "text" | "textarea" | "number" | "status";

export interface CrudField {
  name: string;
  label: string;
  type?: CrudFieldType;
  required?: boolean;
  placeholder?: string;
  hideInTable?: boolean;
  hideInCreate?: boolean;
  width?: number;
  min?: number;
  max?: number;
  ellipsis?: boolean;
  format?: (value: any, record: any) => React.ReactNode;
}

export interface CrudApi {
  getAll: () => Promise<{ data: any }>;
  create: (payload: any) => Promise<any>;
  update: (id: string, payload: any) => Promise<any>;
  delete: (id: string) => Promise<any>;
}

interface CrudResourceProps {
  title: string;
  description?: string;
  fields: CrudField[];
  api: CrudApi;
  extract?: (payload: any) => any[];
  searchPlaceholder?: string;
  emptyText?: string;
}

/** Bỏ dấu để tìm kiếm tiếng Việt không phụ thuộc dấu. */
const normalize = (value: unknown) =>
  String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d");

const defaultExtract = (payload: any): any[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.result)) return payload.result;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const readError = (error: any, fallback: string) =>
  error?.response?.data?.message || error?.message || fallback;

function CrudResource({
  title,
  description,
  fields,
  api,
  extract = defaultExtract,
  searchPlaceholder = "Tìm kiếm...",
  emptyText = "Chưa có dữ liệu",
}: CrudResourceProps) {
  const { message, modal } = App.useApp();
  const [form] = Form.useForm();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingRow, setEditingRow] = useState<any>(null);

  const loadRows = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.getAll();
      setRows(extract(response?.data));
    } catch (error) {
      message.error(readError(error, `Không tải được danh sách ${title.toLowerCase()}`));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [api, extract, title]);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  const visibleFields = useMemo(
    () => fields.filter((field) => !field.hideInTable),
    [fields]
  );

  const filteredRows = useMemo(() => {
    const keyword = normalize(search).trim();
    if (!keyword) return rows;
    return rows.filter((row) =>
      fields.some((field) => normalize(row?.[field.name]).includes(keyword))
    );
  }, [rows, search, fields]);

  const openCreate = () => {
    setEditingRow(null);
    setModalMode("create");
    form.resetFields();
  };

  const openEdit = (record: any) => {
    setEditingRow(record);
    setModalMode("edit");
    form.resetFields();
    form.setFieldsValue(
      fields.reduce(
        (values, field) => ({ ...values, [field.name]: record?.[field.name] }),
        {}
      )
    );
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingRow(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (modalMode === "edit" && editingRow?._id) {
        await api.update(editingRow._id, values);
        message.success(`Cập nhật ${title.toLowerCase()} thành công`);
      } else {
        await api.create(values);
        message.success(`Thêm ${title.toLowerCase()} thành công`);
      }
      closeModal();
      await loadRows();
    } catch (error: any) {
      if (error?.errorFields) return; // lỗi validate của form
      message.error(readError(error, "Lưu thất bại, vui lòng thử lại"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (record: any) => {
    modal.confirm({
      title: "Xác nhận xóa",
      content: `Bạn có chắc muốn xóa "${record?.[fields[0].name]}"? Hành động này không thể hoàn tác.`,
      okText: "Xóa",
      okButtonProps: { danger: true },
      cancelText: "Hủy bỏ",
      onOk: async () => {
        try {
          await api.delete(record._id);
          message.success(`Đã xóa ${title.toLowerCase()}`);
          await loadRows();
        } catch (error) {
          message.error(readError(error, "Xóa thất bại"));
        }
      },
    });
  };

  // Mọi cột đều cần chiều rộng cụ thể, nếu không cột mô tả sẽ giãn ra
  // và đẩy các cột sau nằm khuất dưới cột "Tính năng" (cột cố định bên phải).
  const widthOf = (field: CrudField) =>
    field.width ?? (field.ellipsis || field.type === "textarea" ? 320 : 180);

  const tableWidth =
    70 + visibleFields.reduce((sum, field) => sum + widthOf(field), 0) + 120;

  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 70,
      render: (_: unknown, __: unknown, index: number) => index + 1,
    },
    ...visibleFields.map((field) => ({
      title: field.label,
      dataIndex: field.name,
      key: field.name,
      width: widthOf(field),
      ellipsis: field.ellipsis ?? field.type === "textarea",
      render: (value: any, record: any) => {
        if (field.format) return field.format(value, record);
        if (field.type === "status") {
          const active = value !== "inactive";
          return (
            <Tag color={active ? "success" : "error"}>
              {active ? "Hoạt động" : "Đang ẩn"}
            </Tag>
          );
        }
        return value === undefined || value === null || value === "" ? (
          <span style={{ color: "#9aa39e" }}>—</span>
        ) : (
          value
        );
      },
    })),
    {
      title: "Tính năng",
      key: "actions",
      width: 120,
      fixed: "right" as const,
      render: (_: unknown, record: any) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const modalFields = fields.filter(
    (field) => !(modalMode === "create" && field.hideInCreate)
  );

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadRows} loading={loading}>
            Tải lại
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Thêm mới
          </Button>
        </Space>
      </div>

      <Card className="admin-card">
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder={searchPlaceholder}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          style={{ maxWidth: 320, marginBottom: 16 }}
        />

        <Table
          rowKey={(record) => record._id}
          columns={columns}
          dataSource={filteredRows}
          loading={loading}
          scroll={{ x: tableWidth }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `${total} mục`,
          }}
          locale={{
            emptyText: <Empty description={emptyText} />,
          }}
        />
      </Card>

      <Modal
        title={
          modalMode === "edit"
            ? `Chỉnh sửa ${title.toLowerCase()}`
            : `Thêm ${title.toLowerCase()}`
        }
        open={modalMode !== null}
        onCancel={closeModal}
        onOk={handleSubmit}
        confirmLoading={saving}
        okText="Lưu"
        cancelText="Hủy bỏ"
        forceRender
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          {modalFields.map((field) => (
            <Form.Item
              key={field.name}
              name={field.name}
              label={field.label}
              initialValue={field.type === "status" ? "active" : undefined}
              rules={
                field.required
                  ? [{ required: true, message: `Vui lòng nhập ${field.label.toLowerCase()}` }]
                  : undefined
              }
            >
              {field.type === "textarea" ? (
                <TextArea rows={4} placeholder={field.placeholder} />
              ) : field.type === "number" ? (
                <InputNumber
                  min={field.min ?? 0}
                  max={field.max}
                  style={{ width: "100%" }}
                  placeholder={field.placeholder}
                />
              ) : field.type === "status" ? (
                <Select
                  options={[
                    { value: "active", label: "Hoạt động" },
                    { value: "inactive", label: "Đang ẩn" },
                  ]}
                />
              ) : (
                <Input placeholder={field.placeholder} />
              )}
            </Form.Item>
          ))}
        </Form>
      </Modal>
    </div>
  );
}

export default CrudResource;
