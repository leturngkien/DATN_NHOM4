import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
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

function PostDetailPage() {
  const { id } = useParams();
  const [post, setPost] = useState<BlogItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) {
        setError("Thiếu thông tin bài viết.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await blogApi.getBlogById(id);
        const item = response?.data?.data ?? response?.data ?? null;
        setPost(item);
        setError("");
      } catch (requestError) {
        console.error("Không lấy được chi tiết bài viết:", requestError);
        setError("Không tìm thấy bài viết này.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <main style={{ background: "#f8f6f2", minHeight: "100vh", padding: "40px 20px", display: "grid", placeItems: "center" }}>
        <div style={{ color: "#726B5E" }}>Đang tải bài viết...</div>
      </main>
    );
  }

  if (error || !post) {
    return (
      <main style={{ background: "#f8f6f2", minHeight: "100vh", padding: "40px 20px", display: "grid", placeItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ color: "#232620", marginBottom: 12 }}>{error || "Bài viết không tồn tại"}</h2>
          <Link to="/blogs" style={{ color: "#E4572E", fontWeight: 700, textDecoration: "none" }}>
            ← Quay lại danh sách bài viết
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ background: "linear-gradient(180deg, #f8f6f2 0%, #f2efe9 100%)", minHeight: "100vh", padding: "42px 20px 90px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Link
          to="/blogs"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            color: "#E4572E",
            fontWeight: 800,
            textDecoration: "none",
            marginBottom: 22,
            background: "rgba(255,255,255,0.7)",
            border: "1px solid rgba(35,38,32,0.05)",
            borderRadius: 999,
            padding: "10px 16px",
          }}
        >
          ← Quay lại bài viết
        </Link>

        <article
          style={{
            background: "#fff",
            borderRadius: 30,
            overflow: "hidden",
            boxShadow: "0 24px 60px rgba(35,38,32,0.10)",
            border: "1px solid rgba(35,38,32,0.06)",
          }}
        >
          <div style={{ height: 430, background: "#efebe4", position: "relative" }}>
            <img
              src={post.image_url || "/images/logo.jpg"}
              alt={post.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(180deg, rgba(19,19,19,0.15) 0%, rgba(19,19,19,0.42) 100%)",
              }}
            />
          </div>

          <div style={{ padding: "30px 28px 44px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
                color: "#726B5E",
                fontSize: 13,
                marginBottom: 18,
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  background: "#f5eadf",
                  color: "#5b3c2a",
                  borderRadius: 999,
                  padding: "8px 14px",
                  fontWeight: 700,
                }}
              >
                {post.author || "Pet Corner"}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", paddingTop: 8 }}>
                {formatDate(post.createdAt)}
              </span>
            </div>

            <h1
              style={{
                color: "#232620",
                fontSize: "clamp(2.2rem, 4vw, 4rem)",
                lineHeight: 1.15,
                margin: "0 0 22px",
              }}
            >
              {post.title}
            </h1>

            <div
              dangerouslySetInnerHTML={{ __html: post.content || "" }}
              style={{
                color: "#2f2d2a",
                lineHeight: 1.95,
                fontSize: 18,
              }}
            />
          </div>
        </article>
      </div>
    </main>
  );
}

export default PostDetailPage;
