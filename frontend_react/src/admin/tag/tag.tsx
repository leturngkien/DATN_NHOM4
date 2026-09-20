import CrudResource, { type CrudField } from "../components/crudResource";
import tagApi from "../../api/tagApi";

const fields: CrudField[] = [
  {
    name: "tag_name",
    label: "Tên tag",
    required: true,
    placeholder: "Ví dụ: Mới, Bán chạy, Giảm giá...",
  },
];

function AdminTag() {
  return (
    <CrudResource
      title="Tag"
      description="Nhãn gắn thêm cho sản phẩm, dùng để nhóm và lọc nhanh."
      fields={fields}
      api={tagApi}
      searchPlaceholder="Tìm theo tên tag..."
      emptyText="Chưa có tag nào"
    />
  );
}

export default AdminTag;
