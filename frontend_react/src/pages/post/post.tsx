import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import blogApi from "../../api/blogApi";
import { listenToBlogUpdates } from "../../utils/blogSync";

type BlogItem = {
  _id: string;
  title: string;
  author?: string;
  content?: string;
  image_url?: string;
  createdAt?: string;
  status?: string;
};

const stripHtml = (value?: string) => {
  if (!value) return "";
  return value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
};

const formatDate = (value?: string) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

function PostPage() {
  const [posts, setPosts] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await blogApi.getBlogActive();
        const list = response?.data?.data ?? response?.data?.result ?? [];
        setPosts(Array.isArray(list) ? list : []);
        setError("");
      } catch (requestError) {
        console.error("Không lấy được danh sách bài viết:", requestError);
        setError("Không thể tải danh sách bài viết.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();

    const unsubscribe = listenToBlogUpdates(() => {
      void fetchPosts();
    });

    return unsubscribe;
  }, []);

  return (
    <main style={{ background: "linear-gradient(180deg, #f8f6f2 0%, #f2efe9 100%)", minHeight: "100vh", padding: "42px 20px 90px" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto" }}>
        <div
          style={{
            marginBottom: 28,
            textAlign: "center",
            background: "rgba(255,255,255,0.7)",
            border: "1px solid rgba(35,38,32,0.06)",
            borderRadius: 28,
            boxShadow: "0 12px 35px rgba(35,38,32,0.06)",
            padding: "28px 20px 18px",
          }}
        >
          <p
            style={{
              color: "#E4572E",
              fontWeight: 800,
              letterSpacing: 3,
              fontSize: 12,
              margin: "0 0 10px",
            }}
          >
            PET CORNER
          </p>
          <h1 style={{ margin: 0, color: "#232620", fontSize: "clamp(2rem, 5vw, 3.4rem)", lineHeight: 1.1 }}>
            Bài viết mới nhất
          </h1>
          <p style={{ margin: "14px auto 0", color: "#726B5E", fontSize: 17, maxWidth: 740 }}>
            Khám phá mẹo nuôi thú cưng, tin tức và kinh nghiệm chăm sóc hàng ngày.
          </p>
        </div>

        {loading && (
          <div style={{ textAlign: "center", color: "#726B5E", padding: "40px 0" }}>
            Đang tải bài viết...
          </div>
        )}

        {!loading && error && (
          <div style={{ textAlign: "center", color: "#b42318", padding: "40px 0" }}>{error}</div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div style={{ textAlign: "center", color: "#726B5E", padding: "40px 0" }}>
            Hiện chưa có bài viết nào.
          </div>
        )}

        {!loading && !error && posts.length > 0 && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.3fr 0.7fr",
                gap: 30,
                marginBottom: 30,
              }}
            >
              {posts.slice(0, 1).map((post) => {
                const excerpt = stripHtml(post.content).slice(0, 180);

                return (
                  <Link
                    key={post._id}
                    to={`/blogs/${post._id}`}
                    style={{ textDecoration: "none", color: "inherit", display: "block" }}
                  >
                    <article
                      style={{
                        background: "#fff",
                        borderRadius: 30,
                        overflow: "hidden",
                        boxShadow: "0 20px 45px rgba(35,38,32,0.12)",
                        border: "1px solid rgba(35,38,32,0.07)",
                        display: "grid",
                        gridTemplateColumns: "1.2fr 0.8fr",
                        minHeight: 300,
                      }}
                    >
                      <div style={{ minHeight: 300, background: "#efeae3", overflow: "hidden" }}>
                        <img
                          src={post.image_url || "/images/logo.jpg"}
                          alt={post.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>

                      <div style={{ padding: 28, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignSelf: "flex-start",
                            background: "#E4572E",
                            color: "#fff",
                            borderRadius: 999,
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: 1.1,
                            padding: "8px 12px",
                            marginBottom: 14,
                          }}
                        >
                          {post.author || "Pet Corner"}
                        </span>
                        <p style={{ margin: 0, color: "#726B5E", fontSize: 12, fontWeight: 700, letterSpacing: 1.3, textTransform: "uppercase" }}>
                          {formatDate(post.createdAt)}
                        </p>
                        <h2 style={{ margin: "12px 0 14px", color: "#232620", fontSize: "clamp(1.8rem, 3vw, 2.5rem)", lineHeight: 1.2 }}>
                          {post.title}
                        </h2>
                        <p style={{ margin: 0, color: "#726B5E", lineHeight: 1.8, fontSize: 16 }}>
                          {excerpt}
                          {stripHtml(post.content).length > 180 ? "..." : ""}
                        </p>
                        <div style={{ marginTop: 18, color: "#E4572E", fontWeight: 800, fontSize: 16 }}>
                          Đọc tiếp →
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}

              <div style={{ display: "grid", gap: 20 }}>
                {posts.slice(1, 3).map((post) => {
                  const excerpt = stripHtml(post.content).slice(0, 110);

                  return (
                    <Link
                      key={post._id}
                      to={`/blogs/${post._id}`}
                      style={{ textDecoration: "none", color: "inherit", display: "block" }}
                    >
                      <article
                        style={{
                          background: "#fff",
                          borderRadius: 24,
                          overflow: "hidden",
                          boxShadow: "0 12px 28px rgba(35,38,32,0.08)",
                          border: "1px solid rgba(35,38,32,0.05)",
                          display: "grid",
                          gridTemplateColumns: "140px 1fr",
                          minHeight: 138,
                        }}
                      >
                        <div style={{ background: "#efeae3", overflow: "hidden" }}>
                          <img
                            src={post.image_url || "/images/logo.jpg"}
                            alt={post.title}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        </div>
                        <div style={{ padding: 18 }}>
                          <p style={{ margin: 0, color: "#726B5E", fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase" }}>
                            {formatDate(post.createdAt)}
                          </p>
                          <h3 style={{ margin: "10px 0 8px", color: "#232620", fontSize: 20, lineHeight: 1.35 }}>
                            {post.title}
                          </h3>
                          <p style={{ margin: 0, color: "#726B5E", lineHeight: 1.7 }}>
                            {excerpt}
                            {stripHtml(post.content).length > 110 ? "..." : ""}
                          </p>
                        </div>
                      </article>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 24,
              }}
            >
              {posts.slice(3).map((post) => {
                const excerpt = stripHtml(post.content).slice(0, 120);

                return (
                  <Link
                    key={post._id}
                    to={`/blogs/${post._id}`}
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                      display: "block",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    }}
                  >
                    <article
                      style={{
                        background: "#fff",
                        borderRadius: 24,
                        overflow: "hidden",
                        boxShadow: "0 12px 30px rgba(35,38,32,0.08)",
                        border: "1px solid rgba(35,38,32,0.05)",
                        height: "100%",
                      }}
                    >
                      <div style={{ height: 220, background: "#f0efe9", overflow: "hidden" }}>
                        <img
                          src={post.image_url || "/images/logo.jpg"}
                          alt={post.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>

                      <div style={{ padding: 20 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 10,
                            marginBottom: 12,
                            color: "#726B5E",
                            fontSize: 12,
                          }}
                        >
                          <span>{post.author || "Pet Corner"}</span>
                          <span>{formatDate(post.createdAt)}</span>
                        </div>

                        <h3 style={{ margin: "0 0 10px", color: "#232620", fontSize: 22, lineHeight: 1.4, minHeight: 64 }}>
                          {post.title}
                        </h3>

                        <p style={{ color: "#726B5E", lineHeight: 1.7, margin: 0 }}>
                          {excerpt}
                          {stripHtml(post.content).length > 120 ? "..." : ""}
                        </p>

                        <div style={{ marginTop: 18, color: "#E4572E", fontWeight: 700 }}>
                          Đọc tiếp →
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default PostPage;
