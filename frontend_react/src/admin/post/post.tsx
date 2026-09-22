import { useEffect, useState } from "react";
import {
	Button,
	Card,
	Form,
	Image,
	Input,
	Modal,
	Select,
	Space,
	Table,
	Tag,
	Upload,
	message,
} from "antd";
import type { UploadFile, UploadProps } from "antd";
import {
	DeleteOutlined,
	EditOutlined,
	PlusOutlined,
	SearchOutlined,
	UploadOutlined,
} from "@ant-design/icons";
import blogApi from "../../api/blogApi";
import blogCategoryApi from "../../api/blogCategoryApi";
import { notifyBlogUpdated } from "../../utils/blogSync";

interface BlogCategory {
	_id: string;
	name: string;
}

interface Blog {
	_id: string;
	title: string;
	author: string;
	content: string;
	image_url: string;
	status: "active" | "inactive";
	blog_category_id?: { _id: string; name: string } | string;
}

interface BlogFormValues {
	title: string;
	author: string;
	content: string;
	blog_category_id?: string;
	status: "active" | "inactive";
	image_url?: string;
}

const removeAccents = (value: string) =>
	value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");

const Post: React.FC = () => {
	const [form] = Form.useForm<BlogFormValues>();
	const [posts, setPosts] = useState<Blog[]>([]);
	const [categories, setCategories] = useState<BlogCategory[]>([]);
	const [loading, setLoading] = useState(false);
	const [modalOpen, setModalOpen] = useState(false);
	const [editingPost, setEditingPost] = useState<Blog | null>(null);
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState<string>();
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const [imageMode, setImageMode] = useState<"upload" | "url">("upload");

	const loadData = async () => {
		setLoading(true);
		try {
			const [postResponse, categoryResponse] = await Promise.all([
				blogApi.getAllBlogs(),
				blogCategoryApi.getAll(),
			]);
			setPosts(Array.isArray(postResponse.data.data) ? postResponse.data.data : []);
			setCategories(Array.isArray(categoryResponse.data.result) ? categoryResponse.data.result : []);
		} catch (error) {
			console.error("Không thể tải dữ liệu bài viết:", error);
			message.error("Không thể tải dữ liệu bài viết");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		void loadData();
	}, []);

	const openCreateModal = () => {
		setEditingPost(null);
		setFileList([]);
		setImageMode("upload");
		form.resetFields();
		form.setFieldsValue({ status: "active", image_url: "" });
		setModalOpen(true);
	};

	const openEditModal = (post: Blog) => {
		setEditingPost(post);
		setFileList([]);
		const currentImageUrl = typeof post.image_url === "string" ? post.image_url : "";
		setImageMode(currentImageUrl ? "url" : "upload");
		form.setFieldsValue({
			title: post.title,
			author: post.author,
			content: post.content,
			status: post.status,
			image_url: currentImageUrl,
			blog_category_id:
				typeof post.blog_category_id === "string"
					? post.blog_category_id
					: post.blog_category_id?._id,
		});
		setModalOpen(true);
	};

	const closeModal = () => {
		setModalOpen(false);
		setEditingPost(null);
		setImageMode("upload");
		form.resetFields();
		setFileList([]);
	};

	const handleSubmit = async (values: BlogFormValues) => {
		const data = new FormData();
		const selectedFile = fileList[0]?.originFileObj;
		const imageUrlValue = values.image_url?.trim();

		Object.entries(values).forEach(([key, value]) => {
			if (value === undefined || value === null || value === "") return;
			if (key === "image_url" && imageMode === "upload") return;
			if (key === "image_url" && imageMode === "url") {
				if (imageUrlValue) data.append("image_url", imageUrlValue);
				return;
			}
			data.append(key, String(value));
		});

		if (imageMode === "upload" && selectedFile) {
			data.append("image_url", selectedFile);
		}

		if (imageMode === "url" && imageUrlValue) {
			data.append("image_url", imageUrlValue);
		}

		try {
			if (editingPost) {
				await blogApi.update(editingPost._id, data);
				message.success("Cập nhật bài viết thành công");
			} else {
				await blogApi.create(data);
				message.success("Tạo bài viết thành công");
			}
			notifyBlogUpdated();
			closeModal();
			await loadData();
		} catch (error) {
			console.error("Không thể lưu bài viết:", error);
			message.error("Không thể lưu bài viết");
		}
	};

	const toggleStatus = async (post: Blog) => {
		const nextStatus = post.status === "active" ? "inactive" : "active";
		const previousStatus = post.status;

		setPosts((currentPosts) =>
			currentPosts.map((item) => (item._id === post._id ? { ...item, status: nextStatus } : item))
		);

		try {
			await blogApi.toggleStatus(post._id, nextStatus);
			notifyBlogUpdated();
			message.success(nextStatus === "active" ? "Đã hiện bài viết" : "Đã ẩn bài viết");
		} catch (error) {
			console.error("Không thể cập nhật trạng thái:", error);
			setPosts((currentPosts) =>
				currentPosts.map((item) =>
					item._id === post._id ? { ...item, status: previousStatus } : item
				)
			);
			message.error("Không thể cập nhật trạng thái bài viết");
		}
	};

	const deletePost = (post: Blog) => {
		Modal.confirm({
			title: "Xoá bài viết?",
			content: `Bài viết “${post.title}” sẽ bị xoá vĩnh viễn.`,
			okText: "Xoá",
			cancelText: "Huỷ",
			okButtonProps: { danger: true },
			onOk: async () => {
				try {
					await blogApi.delete(post._id);
					notifyBlogUpdated();
					message.success("Đã xoá bài viết");
					await loadData();
				} catch (error) {
					console.error("Không thể xoá bài viết:", error);
					message.error("Không thể xoá bài viết");
				}
			},
		});
	};

	const uploadProps: UploadProps = {
		accept: "image/*",
		maxCount: 1,
		fileList,
		beforeUpload: () => false,
		onChange: ({ fileList: nextFileList }) => setFileList(nextFileList),
		onRemove: () => setFileList([]),
	};

	const filteredPosts = posts.filter((post) => {
		const matchesSearch = removeAccents(post.title.toLowerCase()).includes(removeAccents(search.toLowerCase()));
		return matchesSearch && (!status || post.status === status);
	});

	const columns = [
		{
			title: "STT",
			key: "index",
			width: 70,
			render: (_value: unknown, _post: Blog, index: number) => index + 1,
		},
		{
			title: "Ảnh",
			dataIndex: "image_url",
			key: "image_url",
			width: 100,
			render: (imageUrl: string) =>
				imageUrl ? <Image src={imageUrl} width={72} height={52} style={{ objectFit: "cover" }} /> : "-",
		},
		{ title: "Tiêu đề", dataIndex: "title", key: "title" },
		{ title: "Tác giả", dataIndex: "author", key: "author", width: 160 },
		{
			title: "Danh mục",
			key: "category",
			width: 180,
			render: (_value: unknown, post: Blog) =>
				typeof post.blog_category_id === "object" ? post.blog_category_id?.name : "Chưa phân loại",
		},
		{
			title: "Trạng thái",
			dataIndex: "status",
			key: "status",
			width: 130,
			render: (postStatus: Blog["status"]) => (
				<Tag color={postStatus === "active" ? "success" : "default"}>
					{postStatus === "active" ? "Hiển thị" : "Đã ẩn"}
				</Tag>
			),
		},
		{
			title: "Thao tác",
			key: "actions",
			width: 190,
			render: (_value: unknown, post: Blog) => (
				<Space>
					<Button type="button" aria-label="Sửa bài viết" icon={<EditOutlined />} onClick={() => openEditModal(post)} />
					<Button type="button" onClick={() => void toggleStatus(post)}>
						{post.status === "active" ? "Ẩn" : "Hiện"}
					</Button>
					<Button type="button" danger aria-label="Xoá bài viết" icon={<DeleteOutlined />} onClick={() => deletePost(post)} />
				</Space>
			),
		},
	];

	return (
		<div style={{ padding: 8 }}>
			<Card
				title={
					<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", gap: 16 }}>
						<div>
							<div style={{ color: "#E4572E", fontWeight: 800, letterSpacing: 2, fontSize: 11, marginBottom: 6 }}>
								PET CORNER
							</div>
							<div style={{ fontSize: 28, fontWeight: 800, color: "#232620" }}>Quản lý bài viết</div>
						</div>
					</div>
				}
				bordered={false}
				style={{
					borderRadius: 24,
					background: "linear-gradient(180deg, #fffdfb 0%, #fff7f1 100%)",
					boxShadow: "0 18px 40px rgba(35,38,32,0.08)",
					border: "1px solid rgba(35,38,32,0.06)",
				}}
				extra={<Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal} style={{ height: 42, borderRadius: 12, fontWeight: 700 }}>Thêm bài viết</Button>}
			>
				<Space wrap style={{ marginBottom: 18, background: "rgba(255,255,255,0.7)", borderRadius: 16, padding: 10, border: "1px solid rgba(35,38,32,0.05)" }}>
					<Input
						allowClear
						prefix={<SearchOutlined />}
						placeholder="Tìm theo tiêu đề"
						value={search}
						onChange={(event) => setSearch(event.target.value)}
						style={{ width: 290, height: 42, borderRadius: 12 }}
					/>
					<Select
						allowClear
						placeholder="Lọc trạng thái"
						value={status}
						onChange={setStatus}
						options={[{ value: "active", label: "Hiển thị" }, { value: "inactive", label: "Đã ẩn" }]}
						style={{ width: 180, height: 42, borderRadius: 12 }}
					/>
				</Space>
				<Table
					rowKey="_id"
					columns={columns}
					dataSource={filteredPosts}
					loading={loading}
					scroll={{ x: 900 }}
					style={{ borderRadius: 18 }}
					pagination={{ pageSize: 8, showSizeChanger: false }}
				/>

				<Modal
					title={editingPost ? "Sửa bài viết" : "Thêm bài viết"}
					open={modalOpen}
					onCancel={closeModal}
					onOk={() => form.submit()}
					okText="Lưu"
					cancelText="Huỷ"
					destroyOnClose
					width={760}
				>
					<Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ status: "active", image_url: "" }}>
						<Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}>
							<Input maxLength={200} showCount style={{ borderRadius: 12 }} />
						</Form.Item>
						<Form.Item name="author" label="Tác giả" rules={[{ required: true, message: "Vui lòng nhập tác giả" }]}>
							<Input maxLength={100} style={{ borderRadius: 12 }} />
						</Form.Item>
						<Form.Item name="blog_category_id" label="Danh mục">
							<Select allowClear placeholder="Chọn danh mục" options={categories.map((category) => ({ value: category._id, label: category.name }))} style={{ borderRadius: 12 }} />
						</Form.Item>
						<Form.Item name="content" label="Nội dung" rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}>
							<Input.TextArea rows={8} style={{ borderRadius: 12 }} />
						</Form.Item>
						<Form.Item name="status" label="Trạng thái">
							<Select options={[{ value: "active", label: "Hiển thị" }, { value: "inactive", label: "Đã ẩn" }]} style={{ borderRadius: 12 }} />
						</Form.Item>
						<Form.Item label="Chọn hình ảnh">
							<Select
								value={imageMode}
								onChange={(value) => {
									setImageMode(value);
									setFileList([]);
									if (value === "upload") form.setFieldValue("image_url", "");
								}}
								options={[
									{ value: "upload", label: "Tải lên từ máy tính" },
									{ value: "url", label: "Dán URL từ website" },
								]}
								style={{ width: "100%", borderRadius: 12 }}
							/>
						</Form.Item>
						{imageMode === "upload" ? (
							<Form.Item label="Ảnh đại diện">
								<Upload {...uploadProps} listType="picture-card">
									<Button icon={<UploadOutlined />}>Chọn ảnh</Button>
								</Upload>
							</Form.Item>
						) : (
							<Form.Item name="image_url" label="URL hình ảnh" rules={[{ type: "url", message: "URL hình ảnh không hợp lệ" }]}>
								<Input placeholder="https://example.com/image.jpg" style={{ borderRadius: 12 }} />
							</Form.Item>
						)}
						{(imageMode === "url" && form.getFieldValue("image_url")) || (imageMode === "upload" && fileList[0]?.url) ? (
							<div style={{ marginBottom: 16 }}>
								<Image
									src={imageMode === "url" ? form.getFieldValue("image_url") : fileList[0]?.url || fileList[0]?.thumbUrl}
									alt="Preview"
									style={{ maxHeight: 180, objectFit: "cover", borderRadius: 12 }}
								/>
							</div>
						) : null}
					</Form>
				</Modal>
			</Card>
		</div>
	);
};

export default Post;
