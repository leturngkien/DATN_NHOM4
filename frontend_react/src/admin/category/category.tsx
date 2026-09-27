import CrudResource, {
  type CrudField,
} from "../components/crudResource";
import categoryApi from "../../api/categoryApi";

/**
 * =========================================================
 * CẤU HÌNH CÁC FIELD CỦA DANH MỤC
 * =========================================================
 */
const fields: CrudField[] = [
  {
    name: "name",
    label: "Tên danh mục",
    required: true,
    width: 240,
    placeholder: "Ví dụ: Thức ăn cho chó",
  },

  {
    name: "description",
    label: "Mô tả danh mục",
    type: "textarea",
    required: true,
    width: 360,
    ellipsis: true,
    placeholder:
      "Nhập mô tả ngắn gọn cho danh mục, ví dụ: Thức ăn dành cho chó...",
  },

  {
    name: "status",
    label: "Trạng thái",
    type: "status",
    width: 140,

    // Backend khi tạo danh mục mặc định status = active
    // nên không cho nhập khi tạo mới.
    hideInCreate: true,
  },
];

/**
 * =========================================================
 * ADMIN CATEGORY
 * =========================================================
 */
function AdminCategory() {
  return (
    <CrudResource
      title="Quản lý danh mục"
      description="Quản lý các nhóm sản phẩm được hiển thị trên trang chủ và trang sản phẩm."

      fields={fields}

      api={categoryApi}

      searchPlaceholder="Tìm kiếm theo tên hoặc mô tả..."

      emptyText="Chưa có danh mục nào"
    />
  );
}

export default AdminCategory;