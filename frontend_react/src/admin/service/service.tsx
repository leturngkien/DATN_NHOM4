import CrudResource, { type CrudField } from "../components/crudResource";
import serviceApi from "../../api/serviceApi";

const formatPrice = (value: number) =>
  `${Number(value || 0).toLocaleString("vi-VN")}đ`;

const fields: CrudField[] = [
  {
    name: "service_name",
    label: "Tên dịch vụ",
    required: true,
    width: 240,
    placeholder: "Ví dụ: Tắm, vệ sinh",
  },
  {
    name: "description",
    label: "Mô tả",
    type: "textarea",
    ellipsis: true,
    placeholder: "Mô tả dịch vụ",
  },
  {
    name: "duration",
    label: "Thời lượng",
    type: "number",
    required: true,
    min: 0,
    width: 130,
    placeholder: "Số phút",
    format: (value) => `${Number(value || 0)} phút`,
  },
  {
    name: "service_price",
    label: "Giá",
    type: "number",
    required: true,
    min: 0,
    width: 140,
    placeholder: "Giá dịch vụ (đ)",
    format: (value) => formatPrice(value),
  },
  {
    name: "status",
    label: "Trạng thái",
    type: "status",
    width: 130,
  },
];

function AdminService() {
  return (
    <CrudResource
      title="Dịch vụ"
      description="Các dịch vụ chăm sóc thú cưng dùng cho phần đặt lịch."
      fields={fields}
      api={serviceApi}
      searchPlaceholder="Tìm theo tên dịch vụ..."
      emptyText="Chưa có dịch vụ nào"
    />
  );
}

export default AdminService;
