import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import parse from "html-react-parser";
import { addToCart } from "../../redux/slices/cartslice";
import productsApi from "../../api/productsApi";
import Loader from "../../components/loader";
import "./product-detail.css";

type PopulatedValue = string | { _id?: string; name?: string; brand_name?: string } | null;

type ProductDetailData = {
  _id: string;
  name: string;
  price: number;
  discount?: number;
  quantity?: number;
  image_url?: string[];
  description?: string;
  detail1?: string;
  detail2?: string;
  detail3?: string;
  detail4?: string;
  category_id?: PopulatedValue;
  brand_id?: PopulatedValue;
};

const getDisplayValue = (value: PopulatedValue | undefined) => {
  if (!value || typeof value === "string") return value || "";
  return value.name || value.brand_name || "";
};

const formatPrice = (price: number) =>
  Number(price || 0).toLocaleString("vi-VN") + "đ";

function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [product, setProduct] = useState<ProductDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError("Không tìm thấy mã sản phẩm.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await productsApi.getProductByID(id);
        const productData = response?.data?.product;

        if (!productData) {
          setError("Không tìm thấy sản phẩm.");
          return;
        }

        setProduct(productData);
      } catch (requestError) {
        console.error("Không lấy được chi tiết sản phẩm:", requestError);
        setError("Không thể tải chi tiết sản phẩm. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <Loader />;

  if (error || !product) {
    return (
      <main className="product-detail-page product-detail-state">
        <h1>{error || "Không tìm thấy sản phẩm."}</h1>
        <Link to="/" className="product-detail-back">
          Quay lại trang chủ
        </Link>
      </main>
    );
  }

  const images = product.image_url?.filter(Boolean) || [];
  const currentImage = images[selectedImage] || "/placeholder-image.jpg";
  const discount = Number(product.discount || 0);
  const salePrice = product.price * (1 - discount / 100);
  const stock = Number(product.quantity || 0);
  const isOutOfStock = stock <= 0;
  const details = [product.detail1, product.detail2, product.detail3, product.detail4].filter(Boolean);

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        item: {
          id: product._id,
          name: product.name,
          price: salePrice,
          image: currentImage,
          stockQuantity: stock,
        },
        quantity,
      })
    );
  };

  return (
    <main className="product-detail-page">
      <div className="product-detail-container">
        <Link to="/" className="product-detail-back">
          ← Quay lại trang chủ
        </Link>

        <section className="product-detail-main">
          <div className="product-gallery">
            <div className="product-thumbnails">
              {images.map((image, index) => (
                <button
                  type="button"
                  className={index === selectedImage ? "thumbnail active" : "thumbnail"}
                  key={`${image}-${index}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={image} alt={`${product.name} ${index + 1}`} />
                </button>
              ))}
            </div>
            <div className="product-main-image">
              <img src={currentImage} alt={product.name} />
            </div>
          </div>

          <div className="product-detail-info">
            <span className="product-detail-label">CHI TIẾT SẢN PHẨM</span>
            <h1>{product.name}</h1>
            <div className="product-detail-price">
              <strong>{formatPrice(salePrice)}</strong>
              {discount > 0 && <del>{formatPrice(product.price)}</del>}
              {discount > 0 && <span>-{discount}%</span>}
            </div>

            <div className="product-meta">
              {getDisplayValue(product.category_id) && (
                <p><b>Danh mục:</b> {getDisplayValue(product.category_id)}</p>
              )}
              {getDisplayValue(product.brand_id) && (
                <p><b>Thương hiệu:</b> {getDisplayValue(product.brand_id)}</p>
              )}
              <p className={isOutOfStock ? "out-of-stock" : "in-stock"}>
                <b>Tình trạng:</b> {isOutOfStock ? "Hết hàng" : `Còn ${stock} sản phẩm`}
              </p>
            </div>

            <div className="product-description">
              {product.description
                ? parse(product.description)
                : "Sản phẩm chất lượng dành cho thú cưng của bạn."}
            </div>

            <div className="product-detail-actions">
              <div className="quantity-control">
                <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>−</button>
                <span>{quantity}</span>
                <button type="button" onClick={() => setQuantity((value) => Math.min(stock || 1, value + 1))}>+</button>
              </div>
              <button
                type="button"
                className="add-to-cart-button"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
              >
                Thêm vào giỏ hàng
              </button>
              <button
                type="button"
                className="buy-now-button"
                disabled={isOutOfStock}
                onClick={() => {
                  handleAddToCart();
                  navigate("/checkout");
                }}
              >
                Mua ngay
              </button>
            </div>
          </div>
        </section>

        <section className="product-description-section">
          <h2>Thông tin sản phẩm</h2>
          {details.length > 0 ? (
            <ul>
              {details.map((detail, index) => <li key={`${detail}-${index}`}>{detail}</li>)}
            </ul>
          ) : (
            <div>
              {product.description
                ? parse(product.description)
                : "Thông tin sản phẩm đang được cập nhật."}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default ProductDetail;
