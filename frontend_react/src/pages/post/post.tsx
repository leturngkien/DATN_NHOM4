import { useEffect, useState } from "react";
import blogApi from "../../api/blogApi";

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
  }, []);

  return (
    <main style={{ background: "#f8f6f2", minHeight: "100vh", padding: "40px 20px 80px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <p
            style={{
              color: "#E4572E",
              fontWeight: 700,
              letterSpacing: 2,
              fontSize: 12,
              marginBottom: 10,
            }}
          >
            PET CORNER
          </p>
          <h1 style={{ margin: 0, color: "#232620", fontSize: "clamp(2rem, 4vw, 3rem)" }}>
            Bài viết mới nhất
          </h1>
          <p style={{ marginTop: 12, color: "#726B5E", fontSize: 16 }}>
            Khám phá mẹo nuôi thú cưng, tin tức và kinh nghiệm chăm sóc hàng ngày.
          </p>
        </div>

        {loading && (
          <div style={{ textAlign: "center", color: "#726B5E", padding: "30px 0" }}>
            Đang tải bài viết...
          </div>
        )}

        {!loading && error && (
          <div style={{ textAlign: "center", color: "#b42318", padding: "30px 0" }}>{error}</div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div style={{ textAlign: "center", color: "#726B5E", padding: "30px 0" }}>
            Hiện chưa có bài viết nào.
          </div>
        )}

        {!loading && !error && posts.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 24,
            }}
          >
            {posts.map((post) => {
              const excerpt = stripHtml(post.content).slice(0, 130);

              return (
                <article
                  key={post._id}
                  style={{
                    background: "#fff",
                    borderRadius: 20,
                    overflow: "hidden",
                    boxShadow: "0 8px 28px rgba(35, 38, 32, 0.08)",
                    border: "1px solid rgba(35, 38, 32, 0.06)",
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
                        gap: 12,
                        marginBottom: 12,
                        color: "#726B5E",
                        fontSize: 12,
                      }}
                    >
                      <span>{post.author || "Pet Corner"}</span>
                      <span>{formatDate(post.createdAt)}</span>
                    </div>

                    <h2
                      style={{
                        color: "#232620",
                        fontSize: 22,
                        lineHeight: 1.4,
                        margin: "0 0 12px",
                        minHeight: 64,
                      }}
                    >
                      {post.title}
                    </h2>

                    <p style={{ color: "#726B5E", lineHeight: 1.7, margin: 0 }}>
                      {excerpt}
                      {stripHtml(post.content).length > 130 ? "..." : ""}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default PostPage;
