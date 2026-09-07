import './App.css'

const products = [
  { name: 'Hạt dinh dưỡng cho chó trưởng thành', price: '289.000 đ', image: 'https://images.unsplash.com/photo-1589924691106-0c821d727a45?auto=format&fit=crop&w=700&q=80', tag: 'Bán chạy' },
  { name: 'Bộ đồ chơi gặm nướu cho thú cưng', price: '159.000 đ', image: 'https://images.unsplash.com/photo-1601758174114-e711c0cbaa69?auto=format&fit=crop&w=700&q=80', tag: 'Mới' },
  { name: 'Vòng cổ da thủ công màu nâu', price: '199.000 đ', image: 'https://images.unsplash.com/photo-1558929996-da64ba858215?auto=format&fit=crop&w=700&q=80', tag: 'Yêu thích' },
]

function App() {
  return (
    <main className="home-page">
      <div className="announcement">Miễn phí giao hàng cho đơn từ 500.000 đ</div>
      <header className="site-header">
        <a className="brand" href="/" aria-label="Pet Corner trang chủ"><span className="brand-mark">PC</span><span>Pet Corner</span></a>
        <nav className="main-nav" aria-label="Điều hướng chính"><a href="#products">Sản phẩm</a><a href="#categories">Danh mục</a><a href="#story">Về Pet Corner</a></nav>
        <div className="header-actions"><button className="icon-button" type="button" aria-label="Tìm kiếm">⌕</button><button className="icon-button cart-button" type="button" aria-label="Giỏ hàng">♧<span>0</span></button></div>
      </header>

      <section className="hero-section">
        <div className="hero-copy"><p className="eyebrow">MÓN QUÀ NHỎ, NIỀM VUI LỚN</p><h1>Mỗi ngày của bé<br /><em>đều đáng yêu hơn.</em></h1><p className="hero-description">Đồ ăn ngon, phụ kiện xinh và những sản phẩm được chọn kỹ cho người bạn bốn chân của bạn.</p><a className="primary-button" href="#products">Khám phá sản phẩm <span>→</span></a></div>
        <div className="hero-image" role="img" aria-label="Chú chó đáng yêu trong không gian ấm áp" /><div className="hero-note"><strong>01</strong><span>Chăm sóc<br />từ trái tim</span></div>
      </section>

      <section className="trust-row" aria-label="Dịch vụ Pet Corner"><div><strong>Được chọn bởi người yêu thú cưng</strong><span>Sản phẩm an toàn, nguồn gốc rõ ràng</span></div><div><strong>Giao hàng tận nơi</strong><span>Đóng gói cẩn thận toàn quốc</span></div><div><strong>Tư vấn tận tâm</strong><span>Luôn sẵn sàng đồng hành cùng bạn</span></div></section>

      <section className="content-section" id="categories"><div className="section-heading"><div><p className="eyebrow">MUA SẮM THEO NHU CẦU</p><h2>Chọn điều bé thích</h2></div><a href="#products" className="text-link">Xem tất cả <span>→</span></a></div><div className="category-grid"><a className="category-card cat-food" href="#products"><span>01</span><strong>Thức ăn</strong><small>Cho bé khỏe mạnh mỗi ngày</small></a><a className="category-card cat-toy" href="#products"><span>02</span><strong>Đồ chơi</strong><small>Vui chơi, vận động, khám phá</small></a><a className="category-card cat-care" href="#products"><span>03</span><strong>Chăm sóc</strong><small>Thêm sạch sẽ và thoải mái</small></a></div></section>

      <section className="content-section products-section" id="products"><div className="section-heading"><div><p className="eyebrow">ĐƯỢC YÊU THÍCH NHẤT</p><h2>Gợi ý cho bé hôm nay</h2></div><a href="#products" className="text-link">Xem cửa hàng <span>→</span></a></div><div className="product-grid">{products.map((product) => <article className="product-card" key={product.name}><div className="product-image"><img src={product.image} alt={product.name} /><span>{product.tag}</span><button type="button" aria-label={`Thêm ${product.name} vào giỏ`}>+</button></div><p className="product-category">PET CORNER / ESSENTIALS</p><h3>{product.name}</h3><strong className="product-price">{product.price}</strong></article>)}</div></section>

      <section className="story-section" id="story"><div><p className="eyebrow">CÂU CHUYỆN CỦA CHÚNG MÌNH</p><h2>Vì bé xứng đáng<br />được yêu thương<br /><em>mỗi ngày.</em></h2><a className="text-link light-link" href="#story">Tìm hiểu thêm <span>→</span></a></div><p>Pet Corner bắt đầu từ tình yêu dành cho những người bạn nhỏ. Chúng mình tìm kiếm những sản phẩm tử tế để việc chăm sóc bé trở nên dễ dàng, vui vẻ và đầy gắn kết.</p></section>
      <footer className="site-footer"><strong>Pet Corner</strong><span>Made with care for every little friend.</span><span>© 2026 Pet Corner</span></footer>
    </main>
  )
}

export default App