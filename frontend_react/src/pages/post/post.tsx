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
    <main style={{ background: "linear-gradient(180deg, #f7f4f0 0%, #f3efe9 100%)", minHeight: "100vh", padding: "40px 20px 90px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <header
          style={{
            marginBottom: 28,
            background: "linear-gradient(135deg, #232620 0%, #3a3d35 55%, #654936 100%)",
            borderRadius: 30,
            padding: "32px 28px",
            boxShadow: "0 18px 45px rgba(35,38,32,0.12)",
            color: "#fff",
          }}
        >
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 999, padding: "8px 14px", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>
            Pet Corner Journal
          </div>
          <h1 style={{ margin: "18px 0 10px", fontSize: "clamp(2.2rem, 5vw, 3.8rem)", lineHeight: 1.1, color: "#fff" }}>
            Khám phá những bài viết hữu ích
          </h1>
          <p style={{ margin: 0, maxWidth: 760, color: "rgba(255,255,255,0.8)", lineHeight: 1.8, fontSize: 17 }}>
            Mẹo chăm sóc thú cưng, tin tức mới nhất và những chia sẻ thiết thực để bạn nuôi thú cưng tốt hơn mỗi ngày.
          </p>
        </header>

        {loading && (
          <div style={{ textAlign: "center", color: "#726B5E", padding: "52px 0", fontSize: 16, fontWeight: 600 }}>
            Đang tải bài viết...
          </div>
        )}

        {!loading && error && (
          <div style={{ textAlign: "center", color: "#b42318", padding: "52px 0", fontSize: 16, fontWeight: 600 }}>{error}</div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div style={{ textAlign: "center", color: "#726B5E", padding: "52px 0", fontSize: 16, fontWeight: 600 }}>
            Hiện chưa có bài viết nào.
          </div>
        )}

        {!loading && !error && posts.length > 0 && (
          <>
            {posts.slice(0, 1).map((post) => {
              const excerpt = stripHtml(post.content).slice(0, 200);

              return (
                <Link
                  key={post._id}
                  to={`/blogs/${post._id}`}
                  style={{ textDecoration: "none", color: "inherit", display: "block", marginBottom: 30 }}
                >
                  <article
                    style={{
                      background: "#fff",
                      borderRadius: 30,
                      overflow: "hidden",
                      boxShadow: "0 18px 40px rgba(35,38,32,0.08)",
                      border: "1px solid rgba(35,38,32,0.06)",
                      display: "grid",
                      gridTemplateColumns: "1.2fr 0.8fr",
                    }}
                  >
                    <div style={{ minHeight: 340, background: "#efeae3", overflow: "hidden" }}>
                      <img
                        src={post.image_url || "/images/logo.jpg"}
                        alt={post.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>

                    <div style={{ padding: 30, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                      <div style={{ display: "inline-flex", alignSelf: "flex-start", background: "#E4572E", color: "#fff", borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: 1.2, padding: "8px 12px", marginBottom: 14 }}>
                        {post.author || "Pet Corner"}
                      </div>
                      <p style={{ margin: 0, color: "#726B5E", fontSize: 12, fontWeight: 700, letterSpacing: 1.3, textTransform: "uppercase" }}>
                        {formatDate(post.createdAt)}
                      </p>
                      <h2 style={{ margin: "12px 0 14px", color: "#232620", fontSize: "clamp(1.9rem, 3vw, 2.8rem)", lineHeight: 1.2 }}>
                        {post.title}
                      </h2>
                      <p style={{ margin: 0, color: "#726B5E", lineHeight: 1.8, fontSize: 16 }}>
                        {excerpt}
                        {stripHtml(post.content).length > 200 ? "..." : ""}
                      </p>
                      <div style={{ marginTop: 22, color: "#E4572E", fontWeight: 800, fontSize: 16 }}>
                        Đọc tiếp →
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 24,
              }}
            >
              {posts.slice(1).map((post) => {
                const excerpt = stripHtml(post.content).slice(0, 120);

                return (
                  <Link
                    key={post._id}
                    to={`/blogs/${post._id}`}
                    style={{ textDecoration: "none", color: "inherit", display: "flex", height: "100%" }}
                  >
                    <article
                      style={{
                        background: "#fff",
                        borderRadius: 24,
                        overflow: "hidden",
                        boxShadow: "0 14px 30px rgba(35,38,32,0.06)",
                        border: "1px solid rgba(35,38,32,0.05)",
                        height: "100%",
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      }}
                    >
                      <div style={{ height: 220, overflow: "hidden", background: "#f0efe9" }}>
                        <img
                          src={post.image_url || "/images/logo.jpg"}
                          alt={post.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>

                      <div style={{ padding: 20, display: "flex", flexDirection: "column", flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 12, color: "#726B5E", fontSize: 12 }}>
                          <span>{post.author || "Pet Corner"}</span>
                          <span>{formatDate(post.createdAt)}</span>
                        </div>
                        <h3 style={{ margin: "0 0 10px", color: "#232620", fontSize: 22, lineHeight: 1.4, minHeight: 64 }}>
                          {post.title}
                        </h3>
                        <p style={{ color: "#726B5E", lineHeight: 1.7, margin: 0, flex: 1 }}>
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
