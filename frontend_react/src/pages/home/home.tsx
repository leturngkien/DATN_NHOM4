"use client";
import type { ReactNode } from "react";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import Slider from "react-slick";
import { useState, useEffect, useRef } from "react";
import SaleProduct from "../../components/saleproduct";
import HotProduct from "../../components/hotproduct";
import NewProduct from "../../components/newproduct";
import CateProduct from "../../components/cateproduct";
import "slick-carousel/slick/slick.css"; // Import CSS cho slick
import "slick-carousel/slick/slick-theme.css"; // Import theme CSS
import productsApi from "../../api/productsApi";
import categoryApi from "../../api/categoryApi";
import bannerApi from "../../api/bannerApi";
import { Link } from "react-router-dom";

const BannerPrevArrow = ({ onClick }: any) => (
  <button
    onClick={onClick}
    aria-label="Banner trước"
    className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#232620]/60 text-white backdrop-blur-sm transition-colors hover:bg-[#E4572E] sm:left-4 sm:h-11 sm:w-11"
  >
    <LeftOutlined />
  </button>
);
 
const BannerNextArrow = ({ onClick }: any) => (
  <button
    onClick={onClick}
    aria-label="Banner tiếp theo"
    className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#232620]/60 text-white backdrop-blur-sm transition-colors hover:bg-[#E4572E] sm:right-4 sm:h-11 sm:w-11"
  >
    <RightOutlined />
  </button>
);
 
/**
 * Tiêu đề khu vực dùng chung: chữ serif lớn bên trái, gạch chân ngắn màu nhấn,
 * liên kết "Xem tất cả" bên phải. Thay cho pill cam viết hoa toàn bộ ở bản cũ.
 */
const SectionHeading = ({
  title,
  to,
  accent = "#E4572E",
}: {
  title: string;
  to?: string;
  accent?: string;
}) => (
  <div className="mb-6 flex items-end justify-between gap-4">
    <div>
      <h2 className="font-display text-2xl leading-tight text-[#232620] sm:text-[28px]">
        {title}
      </h2>
      <span
        className="mt-2 block h-[3px] w-10 rounded-full"
        style={{ backgroundColor: accent }}
      />
    </div>
    {to && (
      <Link
        to={to}
        className="whitespace-nowrap text-sm text-[#726B5E] underline decoration-[#726B5E]/30 decoration-1 underline-offset-4 transition-colors hover:text-[#232620] hover:decoration-[#232620]"
      >
        Xem tất cả
      </Link>
    )}
  </div>
);
 
export default function Home() {
  const [newProduct, setNewProduct] = useState([]);
  const [saleProduct, setSaleProduct] = useState([]);
  const [hotProduct, setHotProduct] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState<{
    [key: string]: any[];
  }>({}); // Lưu sản phẩm theo danh mục
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>(
    []
  );
 
  const [banners, setBanners] = useState<any[]>([]);
 
  const sliderRef = useRef<any>(null); // Ref cho Slider
  const categorySectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>(
    {}
  );
 
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Lấy danh mục
        const categoriesResponse = await categoryApi.getCategoriesActive();
        const categoriesData = await categoriesResponse.data.result;
        setCategories(categoriesData);
 
        const newProductResponse = await productsApi.getNewProducts();
        const newProductData = newProductResponse.data.result;
        setNewProduct(newProductData || []);
 
        const saleProductResponse = await productsApi.getSaleproducts();
        const saleProductData = await saleProductResponse.data.result;
        setSaleProduct(saleProductData || []);
 
        const hotProductResponse = await productsApi.getHotproducts();
        const hotProductData = await hotProductResponse.data.result;
        setHotProduct(hotProductData || []);
 
        const bannerResponse = await bannerApi.getActive();
        const bannerData = bannerResponse.data.data;
        setBanners(bannerData || []);
      } catch (error) {
        console.error("Error fetching products:", error);
        setCategories([]);
      }
    };
    fetchProducts();
  }, []);
 
  // Lấy sản phẩm theo danh mục sau khi categories được cập nhật
  useEffect(() => {
    const fetchProductsByCategory = async () => {
      if (categories.length === 0) return; // Không làm gì nếu categories rỗng
 
      try {
        const categoryPromises = categories.map(async (category) => {
          const productResponse = await productsApi.getProductByCategoryID(
            category._id
          );
          const productData = await productResponse.data.result;
          const limitedProducts = productData ? productData.slice(0, 8) : [];
          return { [category.name]: limitedProducts };
        });
 
        const categoryProducts = await Promise.all(categoryPromises);
        const productsMap = categoryProducts.reduce((acc, curr) => {
          return { ...acc, ...curr };
        }, {});
        setProductsByCategory(productsMap);
      } catch (error) {
        console.error("Error fetching products by category:", error);
        setProductsByCategory({}); // Reset nếu lỗi
      }
    };
    fetchProductsByCategory();
  }, [categories]);
 
  const scrollToCategory = (id: string) => {
    categorySectionRefs.current[id]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };
 
  // Cấu hình settings cho Slider
  const settings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    arrows: banners.length > 1,
    prevArrow: <BannerPrevArrow />,
    nextArrow: <BannerNextArrow />,
    fade: true,
    appendDots: (dots: ReactNode) => (
      <div className="custom-dots-container absolute bottom-3 left-0 right-0 flex justify-center">
        <ul className="flex gap-2">{dots}</ul>
      </div>
    ),
    customPaging: () => (
      <div className="h-1.5 w-1.5 rounded-full bg-white/60 transition-all duration-300 hover:bg-white" />
    ),
  };
 
  return (
    <div className="bg-[#F7F5EF]">
      {/* Banner + dải danh mục nổi đè lên mép dưới banner */}
      {banners.length > 0 && (
        <div className="relative px-4 pt-4 sm:px-[40px] lg:px-[154px]">
          <Slider ref={sliderRef} {...settings}>
            {banners.map((banner, index) => {
              const slide = (
                <div
                  key={banner._id || index}
                  className="relative h-[160px] w-full overflow-hidden rounded-2xl sm:h-[260px] md:h-[360px] lg:h-[420px]"
                >
                  <img
                    src={banner.image_url}
                    alt={banner.title || `Banner ${index + 1}`}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#232620]/50 via-transparent to-transparent" />
                  {banner.title && (
                    <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:max-w-md">
                      <p className="font-display text-xl text-white sm:text-2xl md:text-3xl">
                        {banner.title}
                      </p>
                    </div>
                  )}
                </div>
              );
              return banner.link_url ? (
                <a
                  key={banner._id || index}
                  href={banner.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {slide}
                </a>
              ) : (
                slide
              );
            })}
          </Slider>
 
          {/* Chip danh mục — nổi nửa trên nửa dưới mép banner, cuộn ngang trên mobile */}
          {categories.length > 0 && (
            <div className="relative z-10 -mt-6 flex gap-2 overflow-x-auto px-1 pb-1 sm:-mt-7 sm:px-2 [&::-webkit-scrollbar]:hidden">
              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => scrollToCategory(category._id)}
                  className="flex-shrink-0 rounded-full border border-[#232620]/10 bg-white px-4 py-2 text-sm font-medium text-[#232620] shadow-sm transition-colors hover:border-[#E4572E] hover:text-[#E4572E]"
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
 
      {/* Sản phẩm mới */}
      <div className="mt-10 px-4 sm:px-[40px] lg:px-[154px]">
        <SectionHeading title="Sản phẩm mới" accent="#E4572E" />
        <NewProduct data={newProduct} />
      </div>
 
      {/* Sản phẩm giảm giá — dải nền vàng mù tạt nhạt để tách biệt "khu giảm giá" */}
      <div className="mt-12 bg-[#C9A227]/10 py-8">
        <div className="px-4 sm:px-[40px] lg:px-[154px]">
          <SectionHeading title="Ưu đãi hôm nay" accent="#C9A227" />
          <SaleProduct data={saleProduct} />
        </div>
      </div>
 
      {/* Sản phẩm bán chạy */}
      <div className="mt-12 px-4 sm:px-[40px] lg:px-[154px]">
        <SectionHeading title="Bán chạy nhất" accent="#3F6640" />
        <HotProduct data={hotProduct} />
      </div>
 
      {/* Sản phẩm theo danh mục — nhịp điệu xen kẽ nền trắng / nền giấy */}
      {categories.map((category, index) => (
        <div
          key={category._id}
          ref={(el) => (categorySectionRefs.current[category._id] = el)}
          className={`mt-12 scroll-mt-24 px-4 py-10 sm:px-[40px] lg:px-[154px] ${
            index % 2 === 1 ? "bg-white" : ""
          }`}
        >
          <SectionHeading
            title={`Dành cho ${category.name}`}
            accent={index % 2 === 0 ? "#E4572E" : "#3F6640"}
          />
 
          <CateProduct data={productsByCategory[category.name] || []} />
 
          <div className="mt-6">
            <Link
              to={`/product?category=${category.name.toLowerCase()}`}
              className="text-sm text-[#232620] underline decoration-[#232620]/30 decoration-1 underline-offset-4 transition-colors hover:decoration-[#232620]"
            >
              Xem thêm sản phẩm dành cho {category.name}
            </Link>
          </div>
        </div>
      ))}
 
      {/* PetNews */}
      <div className="w-full bg-white p-3 sm:p-4 md:p-6 lg:p-8 xl:px-[154px]">
        {/* Brand Logos Section */}
      </div>
    </div>
  );
}