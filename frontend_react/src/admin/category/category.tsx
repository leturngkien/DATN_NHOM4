import CrudResource, { type CrudField } from "../components/crudResource";
import categoryApi from "../../api/categoryApi";

const fields: CrudField[] = [
  {
    name: "name",
    label: "Tên danh mục",
    required: true,
    width: 220,
    placeholder: "Ví dụ: Chó, Mèo, Phụ kiện...",
  },
  {
    name: "description",
    label: "Mô tả",
    type: "textarea",
    required: true,
    ellipsis: true,
    placeholder: "Mô tả ngắn về danh mục",
  },
  {
    name: "status",
    label: "Trạng thái",
    type: "status",
    width: 130,
    // API tạo danh mục không nhận status, mặc định là "active".
    hideInCreate: true,
  },
];

function AdminCategory() {
  return (
    <CrudResource
      title="Danh mục"
      description="Nhóm sản phẩm hiển thị ngoài trang chủ và trang sản phẩm."
      fields={fields}
      api={categoryApi}
      searchPlaceholder="Tìm theo tên hoặc mô tả..."
      emptyText="Chưa có danh mục nào"
    />
  );
}

export default AdminCategory;
