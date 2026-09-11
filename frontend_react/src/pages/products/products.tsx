import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import productsApi from "../../api/productsApi";
import categoryApi from "../../api/categoryApi";
import "./products.css";

type Product = {
  _id: string;
  name: string;
  price: number;
  discount?: number;
  image_url?: string[];
  category_id?: string | { _id?: string; name?: string } | null;
};

type Category = {
  _id: string;
  name: string;
};

const formatPrice = (price: number) =>
  Number(price || 0).toLocaleString("vi-VN") + "đ";

const getCategoryId = (category: Product["category_id"]) =>
  typeof category === "string" ? category : category?._id || "";

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const [productsResponse, categoriesResponse] = await Promise.all([
          productsApi.getProductActive(),
          categoryApi.getCategoriesActive(),
        ]);

        setProducts(productsResponse?.data?.result || []);
        setCategories(categoriesResponse?.data?.result || []);
      } catch (requestError) {
        console.error("Không lấy được danh sách sản phẩm:", requestError);
        setError("Không thể tải danh sách sản phẩm.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchSearch = !keyword || product.name.toLowerCase().includes(keyword);
      const matchCategory =
        selectedCategory === "all" ||
        getCategoryId(product.category_id) === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [products, search, selectedCategory]);

  return (
    <main className="products-page">
      <div className="products-page-container">
        <div className="products-page-heading">
          <div>
            <span className="products-page-label">PET CORNER</span>
            <h1>Tất cả sản phẩm</h1>
            <p>Chọn những sản phẩm tốt nhất cho người bạn nhỏ.</p>
          </div>
          <Link to="/" className="products-home-link">← Về trang chủ</Link>
        </div>

        <div className="products-toolbar">
          <label className="products-search">
            <span>⌕</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              type="search"
            />
          </label>

          <div className="products-filters" role="tablist" aria-label="Lọc theo danh mục">
            <button
              type="button"
              className={selectedCategory === "all" ? "active" : ""}
              onClick={() => setSelectedCategory("all")}
            >
              Tất cả
            </button>
            {categories.map((category) => (
              <button
                type="button"
                className={selectedCategory === category._id ? "active" : ""}
                key={category._id}
                onClick={() => setSelectedCategory(category._id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {loading && <div className="products-state">Đang tải sản phẩm...</div>}
        {!loading && error && <div className="products-state error">{error}</div>}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="products-state">Không tìm thấy sản phẩm phù hợp.</div>
        )}

        {!loading && !error && filteredProducts.length > 0 && (
          <div className="products-page-grid">
            {filteredProducts.map((product) => {
              const discount = Number(product.discount || 0);
              const salePrice = product.price * (1 - discount / 100);

              return (
                <Link to={`/detail/${product._id}`} className="catalog-product-card" key={product._id}>
                  <div className="catalog-product-image">
                    {discount > 0 && <span>-{discount}%</span>}
                    <img
                      src={product.image_url?.[0] || "/placeholder-image.jpg"}
                      alt={product.name}
                    />
                  </div>
                  <div className="catalog-product-info">
                    <small>
                      {typeof product.category_id === "object"
                        ? product.category_id?.name || "Sản phẩm"
                        : "Sản phẩm"}
                    </small>
                    <h2>{product.name}</h2>
                    <strong>{formatPrice(salePrice)}</strong>
                    {discount > 0 && <del>{formatPrice(product.price)}</del>}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default Products;
