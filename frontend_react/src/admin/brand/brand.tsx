import CrudResource, { type CrudField } from "../components/crudResource";
import brandApi from "../../api/brandApi";

const fields: CrudField[] = [
  {
    name: "brand_name",
    label: "Tên thương hiệu",
    required: true,
    placeholder: "Ví dụ: Royal Canin, SmartHeart...",
  },
];

function AdminBrand() {
  return (
    <CrudResource
      title="Thương hiệu"
      description="Thương hiệu được gán cho sản phẩm và dùng để lọc ở trang sản phẩm."
      fields={fields}
      api={brandApi}
      searchPlaceholder="Tìm theo tên thương hiệu..."
      emptyText="Chưa có thương hiệu nào"
    />
  );
}

export default AdminBrand;
