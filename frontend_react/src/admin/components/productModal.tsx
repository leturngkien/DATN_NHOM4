import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  Modal,
  Form,
  Input,
  Select,
  Upload,
  Button,
  message,
  InputNumber,
  Row,
  Col,
  Spin,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import productsApi from "../../api/productsApi";
import categoryApi from "../../api/categoryApi";
import brandApi from "../../api/brandApi";
import tagApi from "../../api/tagApi";

const { Option } = Select;

/** category_id/brand_id/tag_id có thể là chuỗi id hoặc object đã populate. */
const idOf = (value?: string | { _id?: string } | null) => {
  if (!value) return undefined;
  return typeof value === "string" ? value : value._id;
};

interface ProductModalProps {
  visible: boolean;
  onClose: () => void;
  onReload: () => void;
  product?: {
    key: string;
    _id: string;
    productCode: string;
    name: string;
    image: string;
    quantity: number;
    status: string;
    price: string;
    category: string;
    brand?: string;
    tag?: string;
    category_id?: string | { _id: string; name?: string };
    brand_id?: string | { _id: string; brand_name?: string };
    tag_id?: string | { _id: string; tag_name?: string };
    discount?: number;
    images?: string[];
    description?: string;
  } | null;
}

const ProductModal: React.FC<ProductModalProps> = ({
  visible,
  onClose,
  onReload,
  product,
}) => {
  const [form] = Form.useForm();
  const [imageFileList, setImageFileList] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const categoryResponse = await categoryApi.getAll();
        const categoryData = Array.isArray(categoryResponse.data.result)
          ? categoryResponse.data.result
          : [];
        setCategories(categoryData);

        const brandResponse = await brandApi.getAll();
        const brandData = Array.isArray(brandResponse.data.result)
          ? brandResponse.data.result
          : [];
        setBrands(brandData);

        const tagResponse = await tagApi.getAll();
        const tagData = Array.isArray(tagResponse.data.result)
          ? tagResponse.data.result
          : [];
        setTags(tagData);
      } catch (error) {
        console.error("Error fetching data:", error);
        message.error("Lỗi khi tải danh mục, thương hiệu hoặc tags!");
        setCategories([]);
        setBrands([]);
        setTags([]);
      } finally {
        setLoading(false);
      }
    };

    if (visible) {
      fetchData();
    }
  }, [visible]);

  useEffect(() => {
    if (product && visible) {
      console.log("Product data received:", product);
      console.log("Product images:", product.images);

      form.setFieldsValue({
        name: product.name,
        quantity: product.quantity,
        price: product.price,
        discount: product.discount || 0,
        status: product.status,
        category_id: idOf(product.category_id),
        brand_id: idOf(product.brand_id),
        tag_id: idOf(product.tag_id),
        description: product.description || "",
      });

      const formattedImages = (product.images || []).map(
        (url: string, index: number) => ({
          uid: `-${index + 1}`,
          name: `image-${index + 1}.png`,
          status: "done",
          url: url,
          index: index,
        })
      );

      console.log("Formatted images:", formattedImages);
      setImageFileList(formattedImages);
    } else {
      form.resetFields();
      setImageFileList([]);
    }
  }, [product, visible, form]);

  const handleImageChange = ({ fileList }: any) => {
    setImageFileList(fileList);
  };

  const handleImagePreview = async (file: any) => {
    if (file.url && !file.originFileObj) {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e: any) => {
        const newFile = e.target.files[0];
        if (newFile) {
          const newFileObj = {
            uid: file.uid,
            name: newFile.name,
            status: "done",
            originFileObj: newFile,
            url: URL.createObjectURL(newFile),
            index: file.index, // Giữ vị trí gốc
          };
          const newFileList = imageFileList.map((item) =>
            item.uid === file.uid ? newFileObj : item
          );
          setImageFileList(newFileList);
        }
      };
      input.click();
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", values.name || "");
      formData.append("price", values.price?.toString() || "");
      formData.append("category_id", values.category_id || "");
      formData.append("status", values.status || "");
      formData.append("quantity", values.quantity?.toString() || "0");
      formData.append("description", values.description || "");
      formData.append("discount", values.discount?.toString() || "0");
      formData.append("brand_id", values.brand_id || "");
      formData.append("tag_id", values.tag_id || "");

      const originalImages = product?.images || [];
      const existingImages: string[] = [];
      const newImages: { file: any; index: number }[] = [];

      // Duyệt imageFileList để phân loại ảnh cũ và ảnh mới
      imageFileList.forEach((file) => {
        if (file.url && !file.originFileObj) {
          // Ảnh cũ giữ lại
          if (originalImages.includes(file.url)) {
            existingImages.push(file.url);
          }
        } else if (file.originFileObj) {
          // Ảnh mới (thay thế hoặc thêm)
          newImages.push({
            file: file.originFileObj,
            index:
              file.index !== undefined
                ? file.index
                : originalImages.length + newImages.length,
          });
        }
      });

      // Gửi existing_images
      if (existingImages.length > 0) {
        formData.append("existing_images", JSON.stringify(existingImages));
      }

      // Gửi new_images
      if (newImages.length > 0) {
        formData.append(
          "new_images",
          JSON.stringify(newImages.map((img) => ({ index: img.index })))
        );
        newImages.forEach((img) => formData.append("images_url", img.file));
      }

      console.log("existingImages:", existingImages);
      console.log("newImages:", newImages);

      if (product) {
        await productsApi.update(product._id, formData);
        message.success("Cập nhật sản phẩm thành công!");
      } else {
        await productsApi.create(formData);
        message.success("Thêm sản phẩm thành công!");
      }
      onReload();
      onClose();
    } catch (error) {
      console.error("Submit error:", error);
      message.error("Lỗi khi lưu sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={product ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}
      open={visible}
      onCancel={onClose}
      onOk={() => form.submit()}
      width={800}
      confirmLoading={loading}
    >
      <Spin spinning={loading}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Tên sản phẩm"
                rules={[
                  { required: true, message: "Vui lòng nhập tên sản phẩm!" },
                ]}
              >
                <Input placeholder="Nhập tên sản phẩm" />
              </Form.Item>
              <Form.Item name="quantity" label="Số lượng">
                <InputNumber min={0} max={9999} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item
                name="price"
                label="Giá"
                rules={[
                  { required: true, message: "Vui lòng nhập giá sản phẩm!" },
                ]}
              >
                <InputNumber
                  min={1}
                  style={{ width: "100%" }}
                  placeholder="Nhập giá sản phẩm"
                />
              </Form.Item>
              <Form.Item
                name="discount"
                label="Giảm giá (%)"
                rules={[{ type: "number", min: 0, max: 100 }]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  style={{ width: "100%" }}
                  placeholder="Nhập % giảm giá"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Tình trạng"
                rules={[
                  { required: true, message: "Vui lòng chọn tình trạng!" },
                ]}
              >
                <Select placeholder="Chọn tình trạng">
                  <Option value="available">Còn hàng</Option>
                  <Option value="out_of_stock">Hết hàng</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="category_id"
                label="Danh mục"
                rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
              >
                <Select placeholder="Chọn danh mục">
                  {categories.length > 0 ? (
                    categories
                      .filter((category) => category && category._id)
                      .map((category) => (
                        <Option key={category._id} value={category._id || ""}>
                          {category.name || "Không có tên"}
                        </Option>
                      ))
                  ) : (
                    <Option disabled>Đang tải danh mục...</Option>
                  )}
                </Select>
              </Form.Item>
              <Form.Item name="brand_id" label="Thương hiệu">
                <Select placeholder="Chọn thương hiệu" allowClear>
                  {brands.length > 0 ? (
                    brands
                      .filter((brand) => brand && brand._id)
                      .map((brand) => (
                        <Option key={brand._id} value={brand._id || ""}>
                          {brand.brand_name || "Không có tên"}
                        </Option>
                      ))
                  ) : (
                    <Option disabled>Đang tải thương hiệu...</Option>
                  )}
                </Select>
              </Form.Item>
              <Form.Item name="tag_id" label="Tag">
                <Select placeholder="Chọn tag" allowClear>
                  {tags.length > 0 ? (
                    tags
                      .filter((tag) => tag && tag._id)
                      .map((tag) => (
                        <Option key={tag._id} value={tag._id || ""}>
                          {tag.tag_name || "Không có tên"}
                        </Option>
                      ))
                  ) : (
                    <Option disabled>Đang tải tags...</Option>
                  )}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="description" label="Mô tả sản phẩm">
                <ReactQuill
                  theme="snow"
                  value={form.getFieldValue("description")}
                  onChange={(value) =>
                    form.setFieldsValue({ description: value })
                  }
                  placeholder="Nhập mô tả sản phẩm"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="images" label="Ảnh sản phẩm">
                <Upload
                  listType="picture-card"
                  fileList={imageFileList}
                  onChange={handleImageChange}
                  onPreview={handleImagePreview}
                  beforeUpload={() => false}
                  multiple
                >
                  {imageFileList.length < 5 && (
                    <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
                  )}
                </Upload>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Spin>
    </Modal>
  );
};

export default ProductModal;

