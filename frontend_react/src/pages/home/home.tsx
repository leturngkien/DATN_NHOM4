"use client";

import { useEffect, useState } from "react";
import "./home.css";

import productsApi from "../../api/productsApi";
import categoryApi from "../../api/categoryApi";
import bannerApi from "../../api/bannerApi";
import SaleProduct from "../../components/saleproduct";
import HotProduct from "../../components/hotproduct";
import NewProduct from "../../components/newproduct";
import CateProduct from "../../components/cateproduct";

type ApiProduct = {
  _id?: string;
  id?: number | string;

  name?: string;
  title?: string;

  category?: string;
  category_id?: string;
  categoryId?: string;

  price?: number;
  oldPrice?: number;
  old_price?: number;

  image?: string;
  image_url?: string[];

  images?: string[];

  rating?: number;
  sold?: number;
  sold_count?: number;

  discount?: number;
  badge?: string;
  quantity?: number;
};

type ComponentProduct = {
  _id: string;
  name: string;
  price: number;
  image_url: string[];
  discount: number;
  quantity: number;
};

type Product = {
  id: string | number;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  image: string;
  rating: number;
  sold: number;
  badge?: string;
};

type Category = {
  _id: string;
  name: string;
};

type Banner = {
  _id?: string;
  title?: string;
  image_url: string;
  link_url?: string;
};

const formatPrice = (price: number) => {
  return Number(price || 0).toLocaleString("vi-VN") + "đ";
};

/**
 * Chuyển dữ liệu sản phẩm từ API
 * về đúng format mà giao diện mới đang sử dụng.
 */
const mapProduct = (
  item: ApiProduct,
  categoryName = "Sản phẩm"
): Product => {
  const price = Number(item.price || 0);

  const oldPrice =
    Number(item.oldPrice || item.old_price || 0) > price
      ? Number(item.oldPrice || item.old_price)
      : undefined;

  let badge = item.badge;

  if (!badge && oldPrice && oldPrice > price) {
    const discount = Math.round(
      ((oldPrice - price) / oldPrice) * 100
    );

    badge = `-${discount}%`;
  }

  if (!badge && item.discount) {
    badge = `-${item.discount}%`;
  }

  return {
    id: item._id || item.id || Math.random(),
    name: item.name || item.title || "Sản phẩm",
    category: item.category || categoryName,
    price,
    oldPrice,
    image:
      item.image_url?.[0] ||
      item.image ||
      item.images?.[0] ||
      "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=700&q=80",
    rating: Number(item.rating || 5),
    sold: Number(item.sold || item.sold_count || 0),
    badge,
  };
};

const mapComponentProduct = (
  item: ApiProduct
): ComponentProduct => ({
  _id: String(item._id || item.id || ""),
  name: item.name || item.title || "Sản phẩm",
  price: Number(item.price || 0),
  image_url: item.image_url || item.images || [],
  discount: Number(item.discount || 0),
  quantity: Number(item.quantity || 0),
});

function Home() {
  /* =========================
     STATE
  ========================= */

  const [loading, setLoading] = useState(true);

  const [products, setProducts] = useState<Product[]>([]);

  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);
  const [hotProducts, setHotProducts] = useState<Product[]>([]);

  const [newProductItems, setNewProductItems] =
    useState<ComponentProduct[]>([]);
  const [saleProductItems, setSaleProductItems] =
    useState<ComponentProduct[]>([]);
  const [hotProductItems, setHotProductItems] =
    useState<ComponentProduct[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);

  const [productsByCategory, setProductsByCategory] = useState<
    Record<string, Product[]>
  >({});

  const [componentProductsByCategory, setComponentProductsByCategory] =
    useState<Record<string, ComponentProduct[]>>({});

  const [banners, setBanners] = useState<Banner[]>([]);

  const [cartCount, setCartCount] = useState(0);

  const [search, setSearch] = useState("");

  const [activeCategory, setActiveCategory] =
    useState("Tất cả");

  const [likedProducts, setLikedProducts] =
    useState<Array<string | number>>([]);

  /* =========================
     LOAD DATA
  ========================= */

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        /*
         * =========================
         * LẤY DANH MỤC
         * =========================
         */

        const categoriesResponse =
          await categoryApi.getCategoriesActive();

        const categoriesData =
          categoriesResponse?.data?.result || [];

        setCategories(categoriesData);

        /*
         * =========================
         * LẤY SẢN PHẨM MỚI
         * =========================
         */

        const newProductResponse =
          await productsApi.getNewProducts();

        const newProductData =
          newProductResponse?.data?.result || [];

        setNewProductItems(
          newProductData.map((item: ApiProduct) =>
            mapComponentProduct(item)
          )
        );

        const mappedNewProducts = newProductData.map(
          (item: ApiProduct) =>
            mapProduct(item)
        );

        setNewProducts(mappedNewProducts);

        /*
         * =========================
         * LẤY SẢN PHẨM SALE
         * =========================
         */

        const saleProductResponse =
          await productsApi.getSaleproducts();

        const saleProductData =
          saleProductResponse?.data?.result || [];

        setSaleProductItems(
          saleProductData.map((item: ApiProduct) =>
            mapComponentProduct(item)
          )
        );

        const mappedSaleProducts = saleProductData.map(
          (item: ApiProduct) =>
            mapProduct(item)
        );

        setSaleProducts(mappedSaleProducts);

        /*
         * =========================
         * LẤY SẢN PHẨM HOT
         * =========================
         */

        const hotProductResponse =
          await productsApi.getHotproducts();

        const hotProductData =
          hotProductResponse?.data?.result || [];

        setHotProductItems(
          hotProductData.map((item: ApiProduct) =>
            mapComponentProduct(item)
          )
        );

        const mappedHotProducts = hotProductData.map(
          (item: ApiProduct) =>
            mapProduct(item)
        );

        setHotProducts(mappedHotProducts);


        try {
          const productsResponse =
            await productsApi.getAll();

          const productsData =
            productsResponse?.data?.result || [];

          const mappedProducts =
            productsData.map((item: ApiProduct) =>
              mapProduct(item)
            );

          setProducts(mappedProducts);
        } catch (error) {
          console.error(
            "Không lấy được tất cả sản phẩm:",
            error
          );

          const allProducts = [
            ...mappedNewProducts,
            ...mappedSaleProducts,
            ...mappedHotProducts,
          ];

          const uniqueProducts = allProducts.filter(
            (product, index, self) =>
              index ===
              self.findIndex(
                (p) => p.id === product.id
              )
          );

          setProducts(uniqueProducts);
        }

        /*
         * =========================
         * LẤY BANNER
         * =========================
         */

        try {
          const bannerResponse =
            await bannerApi.getActive();

          const bannerData =
            bannerResponse?.data?.data || [];

          setBanners(bannerData);
        } catch (error) {
          console.error(
            "Không lấy được banner:",
            error
          );

          setBanners([]);
        }
      } catch (error) {
        console.error(
          "Error fetching home data:",
          error
        );

        setCategories([]);
        setNewProducts([]);
        setSaleProducts([]);
        setHotProducts([]);
        setNewProductItems([]);
        setSaleProductItems([]);
        setHotProductItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /*
   * =========================
   * LẤY SẢN PHẨM THEO CATEGORY
   * =========================
   */

  useEffect(() => {
    const fetchProductsByCategory = async () => {
      if (!categories.length) {
        setProductsByCategory({});
        return;
      }

      try {
        const categoryPromises =
          categories.map(async (category) => {
            try {
              const response =
                await productsApi.getProductByCategoryID(
                  category._id
                );

              const data =
                response?.data?.result || [];

              const limitedData = data.slice(0, 8);

              const limitedProducts =
                limitedData
                  .map((item: ApiProduct) =>
                    mapProduct(
                      item,
                      category.name
                    )
                  );

              return {
                name: category.name,
                products: limitedProducts,
                componentProducts: limitedData.map(
                  (item: ApiProduct) =>
                    mapComponentProduct(item)
                ),
              };
            } catch (error) {
              console.error(
                `Lỗi lấy sản phẩm category ${category.name}:`,
                error
              );

              return {
                name: category.name,
                products: [],
                componentProducts: [],
              };
            }
          });

        const results =
          await Promise.all(categoryPromises);

        const productsMap: Record<
          string,
          Product[]
        > = {};
        const componentProductsMap: Record<
          string,
          ComponentProduct[]
        > = {};

        results.forEach((item) => {
          productsMap[item.name] =
            item.products;
          componentProductsMap[item.name] =
            item.componentProducts;
        });

        setProductsByCategory(productsMap);
        setComponentProductsByCategory(componentProductsMap);
      } catch (error) {
        console.error(
          "Error fetching products by category:",
          error
        );

        setProductsByCategory({});
        setComponentProductsByCategory({});
      }
    };

    fetchProductsByCategory();
  }, [categories]);

  /* =========================
     CATEGORY FILTER
  ========================= */

  const categoriesFilter = [
    "Tất cả",
    ...categories.map(
      (category) => category.name
    ),
  ];

  /*
   * =========================
   * FILTER PRODUCTS
   * =========================
   */

  const filteredProducts = products.filter(
    (product) => {
      const matchSearch =
        product.name
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchCategory =
        activeCategory === "Tất cả" ||
        product.category === activeCategory;

      return (
        matchSearch &&
        matchCategory
      );
    }
  );

  /* =========================
     CART
  ========================= */

  const addToCart = (
    product?: Product
  ) => {
    setCartCount(
      (prev) => prev + 1
    );

    /*
     * Nếu muốn lưu cart vào localStorage
     * thì có thể xử lý tại đây.
     */

    if (product) {
      console.log(
        "Thêm vào giỏ:",
        product
      );
    }
  };

  /* =========================
     LIKE
  ========================= */

  const toggleLike = (
    id: string | number
  ) => {
    setLikedProducts(
      (prev) =>
        prev.includes(id)
          ? prev.filter(
              (productId) =>
                productId !== id
            )
          : [...prev, id]
    );
  };

  /* =========================
     SCROLL CATEGORY
  ========================= */

  const scrollToCategory = (
    categoryName: string
  ) => {
    setActiveCategory(
      categoryName
    );

    setTimeout(() => {
      document
        .getElementById("products")
        ?.scrollIntoView({
          behavior: "smooth",
        });
    }, 100);
  };

  return (
    <div className="pet-page">

      {/* =====================================================
          TOP BAR
      ===================================================== */}

      <div className="topbar">
        <div className="container topbar-inner">

          <div>
            <span>
              📞 Hotline:{" "}
            </span>

            <strong>
              1900 6868
            </strong>
          </div>

          <div className="topbar-right">
            <span>
              Miễn phí vận chuyển cho
              đơn từ 500K
            </span>

            <span>•</span>

            <span>
              Hỗ trợ 24/7
            </span>
          </div>

        </div>
      </div>


      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="header">

        <div className="container header-inner">

          <a
            className="logo"
            href="#home"
          >

            <div className="logo-icon">
              🐾
            </div>

            <div>

              <div className="logo-name">
                PET CORNER
              </div>

              <div className="logo-sub">
                YOUR PET'S HAPPY PLACE
              </div>

            </div>

          </a>


          <nav className="navigation">

            <a
              className="active"
              href="#home"
            >
              Trang chủ
            </a>

            <a href="#products">
              Sản phẩm
            </a>

            <a href="#categories">
              Danh mục
            </a>

            <a href="#services">
              Dịch vụ
            </a>

            <a href="#about">
              Về chúng tôi
            </a>

          </nav>


          <div className="header-actions">

            <button
              className="icon-button search-button"
              onClick={() =>
                document
                  .getElementById(
                    "product-search"
                  )
                  ?.focus()
              }
            >
              🔍
            </button>

            <button
              className="icon-button"
              onClick={() =>
                alert(
                  "Danh sách yêu thích"
                )
              }
            >
              ♡
            </button>

            <button
              className="cart-button"
              onClick={() =>
                alert(
                  `Bạn có ${cartCount} sản phẩm trong giỏ`
                )
              }
            >
              🛒

              <span className="cart-number">
                {cartCount}
              </span>
            </button>

            <button className="login-button">
              Đăng nhập
            </button>

          </div>

        </div>

      </header>


      <main>

        {/* =====================================================
            HERO
        ===================================================== */}

        <section
          className="hero"
          id="home"
        >

          <div className="container hero-content">

            <div className="hero-text">

              <div className="hero-label">
                <span>🐾</span>
                CHĂM SÓC THÚ CƯNG TẬN TÂM
              </div>

              <h1>
                Người bạn nhỏ,
                <br />

                <span>
                  niềm vui lớn.
                </span>
              </h1>

              <p>
                Tất cả những gì thú cưng
                của bạn cần,
                <br />
                được chọn lọc bằng tình yêu.
              </p>

              <div className="hero-buttons">

                <a
                  href="#products"
                  className="primary-button"
                >
                  Khám phá sản phẩm
                  <span>→</span>
                </a>

                <a
                  href="#services"
                  className="secondary-button"
                >
                  Khám phá dịch vụ
                </a>

              </div>


              <div className="hero-features">

                <div>
                  <strong>
                    10K+
                  </strong>

                  <span>
                    Khách hàng
                  </span>
                </div>

                <div>
                  <strong>
                    {products.length > 0
                      ? `${products.length}+`
                      : "500+"}
                  </strong>

                  <span>
                    Sản phẩm
                  </span>
                </div>

                <div>
                  <strong>
                    4.9/5
                  </strong>

                  <span>
                    Đánh giá
                  </span>
                </div>

              </div>

            </div>


            <div className="hero-image">

              <div className="hero-circle"></div>

              <img
                src={
                  banners[0]?.image_url ||
                  "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1000&q=85"
                }
                alt={banners[0]?.title || "Happy dog"}
              />

              <div className="floating-card floating-card-one">

                <span className="floating-icon">
                  ❤️
                </span>

                <div>
                  <strong>
                    Yêu thương
                  </strong>

                  <small>
                    Mỗi ngày một chút
                  </small>
                </div>

              </div>


              <div className="floating-card floating-card-two">

                <span className="floating-icon">
                  ⭐
                </span>

                <div>
                  <strong>
                    4.9/5
                  </strong>

                  <small>
                    Đánh giá khách hàng
                  </small>
                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            SERVICE STRIP
        ===================================================== */}

        <section className="service-strip">

          <div className="container service-grid">

            <div className="service-item">

              <div className="service-icon">
                🚚
              </div>

              <div>
                <strong>
                  Giao hàng nhanh
                </strong>

                <span>
                  Toàn quốc trong 1-3 ngày
                </span>
              </div>

            </div>


            <div className="service-item">

              <div className="service-icon">
                🛡️
              </div>

              <div>
                <strong>
                  Sản phẩm chính hãng
                </strong>

                <span>
                  Cam kết chất lượng 100%
                </span>
              </div>

            </div>


            <div className="service-item">

              <div className="service-icon">
                💬
              </div>

              <div>
                <strong>
                  Tư vấn tận tâm
                </strong>

                <span>
                  Đội ngũ hỗ trợ 24/7
                </span>
              </div>

            </div>


            <div className="service-item">

              <div className="service-icon">
                ↩️
              </div>

              <div>
                <strong>
                  Đổi trả dễ dàng
                </strong>

                <span>
                  Trong vòng 7 ngày
                </span>
              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            CATEGORIES
        ===================================================== */}

        <section
          className="section categories-section"
          id="categories"
        >

          <div className="container">

            <div className="section-heading">

              <div>

                <span className="section-label">
                  DANH MỤC
                </span>

                <h2>
                  Mua sắm theo{" "}
                  <span>
                    nhu cầu
                  </span>
                </h2>

              </div>

              <a
                href="#products"
                className="view-all"
              >
                Xem tất cả →
              </a>

            </div>


            <div className="category-grid">

              {loading ? (

                <div className="empty-products">
                  Đang tải danh mục...
                </div>

              ) : categories.length === 0 ? (

                <div className="empty-products">
                  Chưa có danh mục
                </div>

              ) : (

                categories.map(
                  (category, index) => {

                    const icons = [
                      "🐶",
                      "🐱",
                      "🎾",
                      "🦴",
                      "🛁",
                      "🏠",
                    ];

                    return (
                      <button
                        className="category-card"
                        key={category._id}
                        onClick={() =>
                          scrollToCategory(
                            category.name
                          )
                        }
                      >

                        <div className="category-icon">
                          {
                            icons[
                              index %
                                icons.length
                            ]
                          }
                        </div>

                        <strong>
                          {category.name}
                        </strong>

                        <span>
                          {productsByCategory[
                            category.name
                          ]?.length || 0}{" "}
                          sản phẩm
                        </span>

                      </button>
                    );
                  }
                )

              )}

            </div>

          </div>

        </section>


        {/* =====================================================
            PRODUCTS
        ===================================================== */}

        <section
          className="section products-section"
          id="products"
        >

          <div className="container">

            <div className="section-heading">

              <div>

                <span className="section-label">
                  SẢN PHẨM
                </span>

                <h2>
                  Sản phẩm{" "}
                  <span>
                    nổi bật
                  </span>
                </h2>

              </div>


              <div className="search-box">

                <span>
                  🔍
                </span>

                <input
                  id="product-search"
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                />

              </div>

            </div>


            {/* FILTER */}

            <div className="filter-list">

              {categoriesFilter.map(
                (category) => (

                  <button
                    key={category}
                    className={
                      activeCategory ===
                      category
                        ? "filter active"
                        : "filter"
                    }
                    onClick={() =>
                      setActiveCategory(
                        category
                      )
                    }
                  >
                    {category}
                  </button>

                )
              )}

            </div>


            {/* PRODUCTS */}

            {loading ? (

              <div className="empty-products">

                <div>
                  ⏳
                </div>

                <h3>
                  Đang tải sản phẩm...
                </h3>

                <p>
                  Vui lòng chờ một chút.
                </p>

              </div>

            ) : (

              <div className="products-grid">

                {filteredProducts.map(
                  (product) => (

                    <article
                      className="product-card"
                      key={product.id}
                    >

                      <div className="product-image">

                        {product.badge && (
                          <span className="product-badge">
                            {product.badge}
                          </span>
                        )}


                        <button
                          className={
                            likedProducts.includes(
                              product.id
                            )
                              ? "favorite active"
                              : "favorite"
                          }
                          onClick={() =>
                            toggleLike(
                              product.id
                            )
                          }
                        >
                          {likedProducts.includes(
                            product.id
                          )
                            ? "♥"
                            : "♡"}
                        </button>


                        <img
                          src={
                            product.image
                          }
                          alt={
                            product.name
                          }
                        />


                        <button
                          className="quick-view"
                          onClick={() =>
                            addToCart(
                              product
                            )
                          }
                        >
                          + Thêm vào giỏ
                        </button>

                      </div>


                      <div className="product-info">

                        <span className="product-category">
                          {
                            product.category
                          }
                        </span>


                        <h3>
                          {product.name}
                        </h3>


                        <div className="rating">

                          <span>
                            {"★".repeat(
                              Math.min(
                                5,
                                Math.max(
                                  0,
                                  product.rating
                                )
                              )
                            )}

                            {"☆".repeat(
                              5 -
                                Math.min(
                                  5,
                                  Math.max(
                                    0,
                                    product.rating
                                  )
                                )
                            )}
                          </span>

                          <small>
                            ({product.sold} đã bán)
                          </small>

                        </div>


                        <div className="product-bottom">

                          <div className="price">

                            <strong>
                              {formatPrice(
                                product.price
                              )}
                            </strong>

                            {product.oldPrice && (
                              <del>
                                {formatPrice(
                                  product.oldPrice
                                )}
                              </del>
                            )}

                          </div>


                          <button
                            className="add-cart"
                            onClick={() =>
                              addToCart(
                                product
                              )
                            }
                          >
                            +
                          </button>

                        </div>

                      </div>

                    </article>

                  )
                )}

              </div>

            )}


            {!loading &&
              filteredProducts.length ===
                0 && (

                <div className="empty-products">

                  <div>
                    🔎
                  </div>

                  <h3>
                    Không tìm thấy sản phẩm
                  </h3>

                  <p>
                    Hãy thử từ khóa hoặc
                    danh mục khác.
                  </p>

                </div>

              )}


            <div className="center-button">

              <button className="outline-button">
                Xem tất cả sản phẩm →
              </button>

            </div>

          </div>

        </section>


        {/* =====================================================
            SẢN PHẨM MỚI TỪ API
        ===================================================== */}

        <section className="section">

          <div className="container">

            <div className="section-heading">

              <div>

                <span className="section-label">
                  MỚI NHẤT
                </span>

                <h2>
                  Sản phẩm{" "}
                  <span>
                    mới
                  </span>
                </h2>

              </div>

            </div>

            <NewProduct data={newProductItems} />


            <div className="products-grid">

              {newProductItems.length === 0 &&
                newProducts.map(
                (product) => (

                  <article
                    className="product-card"
                    key={`new-${product.id}`}
                  >

                    <div className="product-image">

                      <span className="product-badge">
                        Mới
                      </span>

                      <button
                        className={
                          likedProducts.includes(
                            product.id
                          )
                            ? "favorite active"
                            : "favorite"
                        }
                        onClick={() =>
                          toggleLike(
                            product.id
                          )
                        }
                      >
                        {likedProducts.includes(
                          product.id
                        )
                          ? "♥"
                          : "♡"}
                      </button>

                      <img
                        src={
                          product.image
                        }
                        alt={
                          product.name
                        }
                      />

                      <button
                        className="quick-view"
                        onClick={() =>
                          addToCart(
                            product
                          )
                        }
                      >
                        + Thêm vào giỏ
                      </button>

                    </div>


                    <div className="product-info">

                      <span className="product-category">
                        {
                          product.category
                        }
                      </span>

                      <h3>
                        {product.name}
                      </h3>

                      <div className="rating">

                        <span>
                          {"★".repeat(
                            product.rating
                          )}
                        </span>

                        <small>
                          ({product.sold} đã bán)
                        </small>

                      </div>


                      <div className="product-bottom">

                        <div className="price">

                          <strong>
                            {formatPrice(
                              product.price
                            )}
                          </strong>

                          {product.oldPrice && (
                            <del>
                              {formatPrice(
                                product.oldPrice
                              )}
                            </del>
                          )}

                        </div>

                        <button
                          className="add-cart"
                          onClick={() =>
                            addToCart(
                              product
                            )
                          }
                        >
                          +
                        </button>

                      </div>

                    </div>

                  </article>

                )
              )}

            </div>

          </div>

        </section>


        {/* =====================================================
            SALE
        ===================================================== */}

        <section className="promotion">

          <div className="container promotion-inner">

            <div className="promotion-content">

              <span className="promotion-label">
                🎁 ƯU ĐÃI ĐẶC BIỆT
              </span>

              <h2>
                Yêu thương nhiều hơn,
                <br />

                <span>
                  tiết kiệm nhiều hơn.
                </span>
              </h2>

              <p>
                Giảm ngay 20% cho đơn hàng
                đầu tiên.
                <br />
                Áp dụng cho tất cả sản phẩm.
              </p>

              <button className="white-button">
                Mua sắm ngay →
              </button>

            </div>


            <div className="promotion-image">

              <img
                src={
                  saleProducts[0]?.image ||
                  "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1000&q=85"
                }
                alt="Pet promotion"
              />

              <div className="discount-circle">

                <strong>
                  20%
                </strong>

                <span>
                  OFF
                </span>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            SALE PRODUCTS
        ===================================================== */}

        <section className="section">

          <div className="container">

            <div className="section-heading">

              <div>

                <span className="section-label">
                  ƯU ĐÃI
                </span>

                <h2>
                  Sản phẩm{" "}
                  <span>
                    giảm giá
                  </span>
                </h2>

              </div>

            </div>

            <SaleProduct data={saleProductItems} />


            <div className="products-grid">

              {saleProductItems.length === 0 &&
                saleProducts.map(
                (product) => (

                  <article
                    className="product-card"
                    key={`sale-${product.id}`}
                  >

                    <div className="product-image">

                      {product.badge && (
                        <span className="product-badge">
                          {product.badge}
                        </span>
                      )}

                      <button
                        className="favorite"
                        onClick={() =>
                          toggleLike(
                            product.id
                          )
                        }
                      >
                        {likedProducts.includes(
                          product.id
                        )
                          ? "♥"
                          : "♡"}
                      </button>

                      <img
                        src={
                          product.image
                        }
                        alt={
                          product.name
                        }
                      />

                      <button
                        className="quick-view"
                        onClick={() =>
                          addToCart(
                            product
                          )
                        }
                      >
                        + Thêm vào giỏ
                      </button>

                    </div>


                    <div className="product-info">

                      <span className="product-category">
                        {
                          product.category
                        }
                      </span>

                      <h3>
                        {product.name}
                      </h3>

                      <div className="rating">

                        <span>
                          {"★".repeat(
                            product.rating
                          )}
                        </span>

                        <small>
                          ({product.sold} đã bán)
                        </small>

                      </div>


                      <div className="product-bottom">

                        <div className="price">

                          <strong>
                            {formatPrice(
                              product.price
                            )}
                          </strong>

                          {product.oldPrice && (
                            <del>
                              {formatPrice(
                                product.oldPrice
                              )}
                            </del>
                          )}

                        </div>

                        <button
                          className="add-cart"
                          onClick={() =>
                            addToCart(
                              product
                            )
                          }
                        >
                          +
                        </button>

                      </div>

                    </div>

                  </article>

                )
              )}

            </div>

          </div>

        </section>


        {/* =====================================================
            HOT PRODUCTS
        ===================================================== */}

        <section className="section">

          <div className="container">

            <div className="section-heading">

              <div>

                <span className="section-label">
                  BÁN CHẠY
                </span>

                <h2>
                  Sản phẩm{" "}
                  <span>
                    bán chạy
                  </span>
                </h2>

              </div>

            </div>

            <HotProduct data={hotProductItems} />


            <div className="products-grid">

              {hotProductItems.length === 0 &&
                hotProducts.map(
                (product) => (

                  <article
                    className="product-card"
                    key={`hot-${product.id}`}
                  >

                    <div className="product-image">

                      <span className="product-badge">
                        Bán chạy
                      </span>

                      <button
                        className="favorite"
                        onClick={() =>
                          toggleLike(
                            product.id
                          )
                        }
                      >
                        {likedProducts.includes(
                          product.id
                        )
                          ? "♥"
                          : "♡"}
                      </button>

                      <img
                        src={
                          product.image
                        }
                        alt={
                          product.name
                        }
                      />

                      <button
                        className="quick-view"
                        onClick={() =>
                          addToCart(
                            product
                          )
                        }
                      >
                        + Thêm vào giỏ
                      </button>

                    </div>


                    <div className="product-info">

                      <span className="product-category">
                        {
                          product.category
                        }
                      </span>

                      <h3>
                        {product.name}
                      </h3>

                      <div className="rating">

                        <span>
                          {"★".repeat(
                            product.rating
                          )}
                        </span>

                        <small>
                          ({product.sold} đã bán)
                        </small>

                      </div>


                      <div className="product-bottom">

                        <div className="price">

                          <strong>
                            {formatPrice(
                              product.price
                            )}
                          </strong>

                          {product.oldPrice && (
                            <del>
                              {formatPrice(
                                product.oldPrice
                              )}
                            </del>
                          )}

                        </div>

                        <button
                          className="add-cart"
                          onClick={() =>
                            addToCart(
                              product
                            )
                          }
                        >
                          +
                        </button>

                      </div>

                    </div>

                  </article>

                )
              )}

            </div>

          </div>

        </section>


        {/* =====================================================
            PRODUCTS BY CATEGORY
        ===================================================== */}

        {categories.map(
          (category, index) => {

            const categoryProducts =
              productsByCategory[
                category.name
              ] || [];

            return (

              <section
                className={`section ${
                  index % 2 === 1
                    ? "category-white-section"
                    : ""
                }`}
                key={category._id}
              >

                <div className="container">

                  <div className="section-heading">

                    <div>

                      <span className="section-label">
                        DANH MỤC
                      </span>

                      <h2>
                        Dành cho{" "}
                        <span>
                          {category.name}
                        </span>
                      </h2>

                    </div>

                    <button
                      className="view-all"
                      onClick={() =>
                        scrollToCategory(
                          category.name
                        )
                      }
                    >
                      Xem tất cả →
                    </button>

                  </div>

                  <CateProduct
                    data={
                      componentProductsByCategory[
                        category.name
                      ] || []
                    }
                  />


                  {componentProductsByCategory[
                    category.name
                  ]?.length === 0 &&
                  categoryProducts.length > 0 ? (

                    <div className="products-grid">

                      {categoryProducts.map(
                        (product) => (

                          <article
                            className="product-card"
                            key={`category-${product.id}`}
                          >

                            <div className="product-image">

                              {product.badge && (
                                <span className="product-badge">
                                  {
                                    product.badge
                                  }
                                </span>
                              )}

                              <button
                                className="favorite"
                                onClick={() =>
                                  toggleLike(
                                    product.id
                                  )
                                }
                              >
                                {likedProducts.includes(
                                  product.id
                                )
                                  ? "♥"
                                  : "♡"}
                              </button>

                              <img
                                src={
                                  product.image
                                }
                                alt={
                                  product.name
                                }
                              />

                              <button
                                className="quick-view"
                                onClick={() =>
                                  addToCart(
                                    product
                                  )
                                }
                              >
                                + Thêm vào giỏ
                              </button>

                            </div>


                            <div className="product-info">

                              <span className="product-category">
                                {
                                  product.category
                                }
                              </span>

                              <h3>
                                {
                                  product.name
                                }
                              </h3>

                              <div className="rating">

                                <span>
                                  {"★".repeat(
                                    product.rating
                                  )}
                                </span>

                                <small>
                                  (
                                  {
                                    product.sold
                                  }{" "}
                                  đã bán)
                                </small>

                              </div>


                              <div className="product-bottom">

                                <div className="price">

                                  <strong>
                                    {formatPrice(
                                      product.price
                                    )}
                                  </strong>

                                  {product.oldPrice && (
                                    <del>
                                      {formatPrice(
                                        product.oldPrice
                                      )}
                                    </del>
                                  )}

                                </div>


                                <button
                                  className="add-cart"
                                  onClick={() =>
                                    addToCart(
                                      product
                                    )
                                  }
                                >
                                  +
                                </button>

                              </div>

                            </div>

                          </article>

                        )
                      )}

                    </div>

                  ) : (

                    <div className="empty-products">

                      <p>
                        Chưa có sản phẩm
                        trong danh mục này.
                      </p>

                    </div>

                  )}

                </div>

              </section>

            );
          }
        )}


        {/* =====================================================
            SERVICES
        ===================================================== */}

        <section
          className="section services-section"
          id="services"
        >

          <div className="container">

            <div className="center-heading">

              <span className="section-label">
                DỊCH VỤ
              </span>

              <h2>
                Chăm sóc bé{" "}
                <span>
                  toàn diện
                </span>
              </h2>

              <p>
                Không chỉ bán sản phẩm,
                Pet Corner đồng hành cùng bạn
                <br />
                trong từng khoảnh khắc chăm sóc
                thú cưng.
              </p>

            </div>


            <div className="service-cards">

              <div className="big-service-card">

                <div className="big-service-icon">
                  🛁
                </div>

                <h3>
                  Grooming & Spa
                </h3>

                <p>
                  Tắm, cắt tỉa và chăm sóc
                  lông chuyên nghiệp cho thú cưng.
                </p>

                <a href="#services">
                  Tìm hiểu thêm →
                </a>

              </div>


              <div className="big-service-card">

                <div className="big-service-icon">
                  🏥
                </div>

                <h3>
                  Chăm sóc sức khỏe
                </h3>

                <p>
                  Tư vấn dinh dưỡng và chăm sóc
                  sức khỏe cho người bạn nhỏ.
                </p>

                <a href="#services">
                  Tìm hiểu thêm →
                </a>

              </div>


              <div className="big-service-card">

                <div className="big-service-icon">
                  🏠
                </div>

                <h3>
                  Pet Hotel
                </h3>

                <p>
                  Không gian nghỉ dưỡng an toàn,
                  sạch sẽ và đầy yêu thương.
                </p>

                <a href="#services">
                  Tìm hiểu thêm →
                </a>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            ABOUT
        ===================================================== */}

        <section
          className="about-section"
          id="about"
        >

          <div className="container about-grid">

            <div className="about-images">

              <img
                className="about-main-image"
                src="https://images.unsplash.com/photo-1601758064133-2d8f3a3f1f16?auto=format&fit=crop&w=900&q=85"
                alt="Pet Corner"
              />

              <div className="about-small-card">

                <strong>
                  5+
                </strong>

                <span>
                  Năm đồng hành
                </span>

              </div>

            </div>


            <div className="about-content">

              <span className="section-label">
                VỀ PET CORNER
              </span>

              <h2>
                Vì chúng tôi tin rằng
                <br />

                <span>
                  mọi chú pet đều xứng đáng
                </span>

                <br />

                được yêu thương.
              </h2>

              <p>
                Pet Corner được tạo ra với một
                mục tiêu đơn giản: giúp những
                người yêu thú cưng dễ dàng tìm
                được sản phẩm tốt, dịch vụ chất
                lượng và những lời tư vấn đáng
                tin cậy.
              </p>


              <div className="about-list">

                <div>
                  <span>✓</span>
                  <p>
                    Sản phẩm được chọn lọc kỹ càng
                  </p>
                </div>

                <div>
                  <span>✓</span>
                  <p>
                    Đội ngũ am hiểu và yêu thú cưng
                  </p>
                </div>

                <div>
                  <span>✓</span>
                  <p>
                    Luôn đặt sức khỏe của pet lên đầu
                  </p>
                </div>

              </div>


              <button className="primary-button">
                Tìm hiểu về chúng tôi →
              </button>

            </div>

          </div>

        </section>


        {/* =====================================================
            REVIEWS
        ===================================================== */}

        <section className="section reviews-section">

          <div className="container">

            <div className="center-heading">

              <span className="section-label">
                KHÁCH HÀNG
              </span>

              <h2>
                Những người bạn nói{" "}
                <span>
                  gì?
                </span>
              </h2>

            </div>


            <div className="reviews-grid">

              <div className="review-card">

                <div className="review-stars">
                  ★★★★★
                </div>

                <p>
                  "Sản phẩm rất chất lượng,
                  đóng gói cẩn thận. Bé nhà mình
                  cực kỳ thích loại hạt này.
                  Chắc chắn sẽ quay lại mua tiếp!"
                </p>

                <div className="review-user">

                  <div className="avatar">
                    L
                  </div>

                  <div>
                    <strong>
                      Lan Anh
                    </strong>

                    <span>
                      Khách hàng thân thiết
                    </span>
                  </div>

                </div>

              </div>


              <div className="review-card">

                <div className="review-stars">
                  ★★★★★
                </div>

                <p>
                  "Nhân viên tư vấn cực kỳ
                  nhiệt tình. Mình không biết
                  chọn loại thức ăn nào cho mèo
                  và được tư vấn rất kỹ."
                </p>

                <div className="review-user">

                  <div className="avatar">
                    M
                  </div>

                  <div>
                    <strong>
                      Minh Hoàng
                    </strong>

                    <span>
                      Khách hàng
                    </span>
                  </div>

                </div>

              </div>


              <div className="review-card">

                <div className="review-stars">
                  ★★★★★
                </div>

                <p>
                  "Giao hàng nhanh, sản phẩm đúng
                  mô tả. Website cũng rất dễ sử dụng.
                  Mình đã giới thiệu Pet Corner cho
                  rất nhiều bạn."
                </p>

                <div className="review-user">

                  <div className="avatar">
                    N
                  </div>

                  <div>
                    <strong>
                      Ngọc Mai
                    </strong>

                    <span>
                      Khách hàng
                    </span>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            NEWSLETTER
        ===================================================== */}

        <section className="newsletter">

          <div className="container newsletter-inner">

            <div>

              <span>
                💌 NHẬN ƯU ĐÃI
              </span>

              <h2>
                Đừng bỏ lỡ những điều tốt nhất
                cho bé!
              </h2>

              <p>
                Đăng ký email để nhận ưu đãi
                và thông tin mới nhất.
              </p>

            </div>


            <form
              className="newsletter-form"
              onSubmit={(e) =>
                e.preventDefault()
              }
            >

              <input
                type="email"
                placeholder="Email của bạn..."
              />

              <button type="submit">
                Đăng ký
              </button>

            </form>

          </div>

        </section>

      </main>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="footer">

        <div className="container footer-grid">

          <div className="footer-brand">

            <a
              className="logo footer-logo"
              href="#home"
            >

              <div className="logo-icon">
                🐾
              </div>

              <div>

                <div className="logo-name">
                  PET CORNER
                </div>

                <div className="logo-sub">
                  YOUR PET'S HAPPY PLACE
                </div>

              </div>

            </a>


            <p>
              Nơi mọi người yêu thú cưng tìm thấy
              những sản phẩm tốt nhất và dịch vụ
              tận tâm nhất.
            </p>


            <div className="socials">

              <a href="#facebook">
                f
              </a>

              <a href="#instagram">
                ◎
              </a>

              <a href="#youtube">
                ▶
              </a>

              <a href="#tiktok">
                ♪
              </a>

            </div>

          </div>


          <div className="footer-column">

            <h3>
              Khám phá
            </h3>

            <a href="#home">
              Trang chủ
            </a>

            <a href="#products">
              Sản phẩm
            </a>

            <a href="#categories">
              Danh mục
            </a>

            <a href="#services">
              Dịch vụ
            </a>

          </div>


          <div className="footer-column">

            <h3>
              Hỗ trợ
            </h3>

            <a href="#contact">
              Liên hệ
            </a>

            <a href="#shipping">
              Chính sách giao hàng
            </a>

            <a href="#return">
              Đổi trả & hoàn tiền
            </a>

            <a href="#privacy">
              Chính sách bảo mật
            </a>

          </div>


          <div className="footer-column">

            <h3>
              Liên hệ
            </h3>

            <div className="contact-item">

              <span>
                📍
              </span>

              <p>
                123 Nguyễn Văn Linh,
                Quận 7, TP. Hồ Chí Minh
              </p>

            </div>


            <div className="contact-item">

              <span>
                ☎
              </span>

              <p>
                1900 6868
              </p>

            </div>


            <div className="contact-item">

              <span>
                ✉
              </span>

              <p>
                hello@petcorner.vn
              </p>

            </div>

          </div>

        </div>


        <div className="footer-bottom">

          <div className="container">

            <span>
              © 2026 Pet Corner.
              All rights reserved.
            </span>

            <span>
              Made with ❤️ for pets
            </span>

          </div>

        </div>

      </footer>

    </div>
  );
}

export default Home;