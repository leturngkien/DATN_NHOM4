import { useCallback, useEffect, useState } from "react";
import {
  App,
  Button,
  Card,
  Empty,
  Image,
  Input,
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
import productsApi from "../../api/productsApi";
import categoryApi from "../../api/categoryApi";
import brandApi from "../../api/brandApi";
import ProductModal from "../components/productModal";

type Populated = string | { _id?: string; name?: string; brand_name?: string; tag_name?: string } | null;

interface ApiProduct {
  _id: string;
  name: string;
  price: string | number;
  discount?: number;
  quantity?: number;
  status?: string;
  image_url?: string[];
  description?: string;
  category_id?: Populated;
  brand_id?: Populated;
  tag_id?: Populated;
}

const labelOf = (value: Populated) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.name || value.brand_name || value.tag_name || "";
};

const idOf = (value: Populated) => {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  return value._id;
};

const formatPrice = (value: string | number) =>
  `${Number(value || 0).toLocaleString("vi-VN")}đ`;

const STATUS_LABEL: Record<string, { text: string; color: string }> = {
  available: { text: "Còn hàng", color: "success" },
  out_of_stock: { text: "Hết hàng", color: "error" },
  discontinued: { text: "Ngừng bán", color: "default" },
};

const readError = (error: any, fallback: string) =>
  error?.response?.data?.message || error?.message || fallback;

function AdminProduct() {
  const { message, modal } = App.useApp();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState<string | undefined>();
  const [brand, setBrand] = useState<string | undefined>();
  const [status, setStatus] = useState<string | undefined>();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await productsApi.getAll({
        page,
        limit: pageSize,
        ...(searchTerm ? { search: searchTerm } : {}),
        ...(category ? { category } : {}),
        ...(brand ? { brand } : {}),
        ...(status ? { status } : {}),
      });
      const payload = response?.data;
      setProducts(Array.isArray(payload?.result) ? payload.result : []);
      setTotal(Number(payload?.pagination?.total ?? 0));
    } catch (error) {
      message.error(readError(error, "Không tải được danh sách sản phẩm"));
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchTerm, category, brand, status]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [categoryResponse, brandResponse] = await Promise.all([
          categoryApi.getAll(),
          brandApi.getAll(),
        ]);
        setCategories(
          Array.isArray(categoryResponse?.data?.result) ? categoryResponse.data.result : []
        );
        setBrands(Array.isArray(brandResponse?.data?.result) ? brandResponse.data.result : []);
      } catch (error) {
        console.error("Không tải được danh mục/thương hiệu:", error);
      }
    };
    loadFilters();
  }, []);

  const openCreate = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const openEdit = (record: ApiProduct) => {
    setEditingProduct({
      key: record._id,
      _id: record._id,
      name: record.name,
      price: record.price,
      quantity: record.quantity ?? 0,
      discount: record.discount ?? 0,
      status: record.status,
      description: record.description,
      images: record.image_url || [],
      image: record.image_url?.[0] || "",
      category_id: idOf(record.category_id),
      brand_id: idOf(record.brand_id),
      tag_id: idOf(record.tag_id),
      category: labelOf(record.category_id),
      brand: labelOf(record.brand_id),
      tag: labelOf(record.tag_id),
      productCode: record._id,
    });
    setModalOpen(true);
  };

  const handleDelete = (record: ApiProduct) => {
    modal.confirm({
      title: "Xác nhận xóa",
      content: `Bạn có chắc muốn xóa sản phẩm "${record.name}"? Hành động này không thể hoàn tác.`,
      okText: "Xóa",
      okButtonProps: { danger: true },
      cancelText: "Hủy bỏ",
      onOk: async () => {
        try {
          await productsApi.delete(record._id);
          message.success("Đã xóa sản phẩm");
          await loadProducts();
        } catch (error) {
          message.error(readError(error, "Xóa sản phẩm thất bại"));
        }
      },
    });
  };

  const applySearch = () => {
    setPage(1);
    setSearchTerm(search.trim());
  };

  const columns = [
    {
      title: "Ảnh",
      dataIndex: "image_url",
      key: "image",
      width: 76,
      render: (images: string[]) =>
        images?.[0] ? (
          <Image
            src={images[0]}
            alt=""
            width={54}
            height={54}
            style={{ objectFit: "contain", borderRadius: 8, background: "#f5f3ed" }}
            preview={{ mask: null }}
          />
        ) : (
          <div className="admin-thumb-empty">—</div>
        ),
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
      width: 240,
      ellipsis: true,
    },
    {
      title: "Danh mục",
      dataIndex: "category_id",
      key: "category",
      width: 110,
      render: (value: Populated) => labelOf(value) || <span className="admin-muted">—</span>,
    },
    {
      title: "Thương hiệu",
      dataIndex: "brand_id",
      key: "brand",
      width: 120,
      render: (value: Populated) => labelOf(value) || <span className="admin-muted">—</span>,
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      width: 110,
      render: (value: string | number) => (
        <span className="admin-price">{formatPrice(value)}</span>
      ),
    },
    {
      title: "Giảm giá",
      dataIndex: "discount",
      key: "discount",
      width: 90,
      render: (value: number) =>
        value ? <Tag color="volcano">-{value}%</Tag> : <span className="admin-muted">—</span>,
    },
    {
      title: "Kho",
      dataIndex: "quantity",
      key: "quantity",
      width: 70,
      render: (value: number) => Number(value ?? 0),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 110,
      render: (value: string) => {
        const meta = STATUS_LABEL[value] || { text: value || "—", color: "default" };
        return <Tag color={meta.color}>{meta.text}</Tag>;
      },
    },
    {
      title: "Tính năng",
      key: "actions",
      width: 120,
      fixed: "right" as const,
      render: (_: unknown, record: ApiProduct) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
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

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h1>Sản phẩm</h1>
          <p>Quản lý toàn bộ sản phẩm đang bán trên cửa hàng.</p>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadProducts} loading={loading}>
            Tải lại
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Thêm sản phẩm
          </Button>
        </Space>
      </div>

      <Card className="admin-card">
        <Space wrap style={{ marginBottom: 16 }}>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Tìm theo tên sản phẩm..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onPressEnter={applySearch}
            onBlur={applySearch}
            style={{ width: 260 }}
          />
          <Select
            allowClear
            placeholder="Danh mục"
            style={{ width: 180 }}
            value={category}
            onChange={(value) => {
              setPage(1);
              setCategory(value);
            }}
            options={categories.map((item) => ({ value: item._id, label: item.name }))}
          />
          <Select
            allowClear
            placeholder="Thương hiệu"
            style={{ width: 180 }}
            value={brand}
            onChange={(value) => {
              setPage(1);
              setBrand(value);
            }}
            options={brands.map((item) => ({ value: item._id, label: item.brand_name }))}
          />
          <Select
            allowClear
            placeholder="Trạng thái"
            style={{ width: 160 }}
            value={status}
            onChange={(value) => {
              setPage(1);
              setStatus(value);
            }}
            options={[
              { value: "available", label: "Còn hàng" },
              { value: "out_of_stock", label: "Hết hàng" },
              { value: "discontinued", label: "Ngừng bán" },
            ]}
          />
        </Space>

        <Table
          rowKey={(record) => record._id}
          columns={columns}
          dataSource={products}
          loading={loading}
          scroll={{ x: 1046 }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (value) => `${value} sản phẩm`,
            onChange: (nextPage, nextPageSize) => {
              setPage(nextPage);
              setPageSize(nextPageSize);
            },
          }}
          locale={{ emptyText: <Empty description="Chưa có sản phẩm nào" /> }}
        />
      </Card>

      <ProductModal
        visible={modalOpen}
        product={editingProduct}
        onClose={() => {
          setModalOpen(false);
          setEditingProduct(null);
        }}
        onReload={loadProducts}
      />
    </div>
  );
}

export default AdminProduct;
