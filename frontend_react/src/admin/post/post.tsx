import { useEffect, useState } from "react";
import {
	Button,
	Card,
	Form,
	Image,
	Input,
	Modal,
	Radio,
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
	image_url?: string;
	blog_category_id?: string;
	status: "active" | "inactive";
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
	const [imageMode, setImageMode] = useState<"file" | "url">("file");

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
		setImageMode("file");
		form.resetFields();
		form.setFieldsValue({ status: "active", image_url: "" });
		setModalOpen(true);
	};

	const openEditModal = (post: Blog) => {
		setEditingPost(post);
		setFileList([]);
		const hasImageUrl = Boolean(post.image_url && post.image_url.trim());
		setImageMode(hasImageUrl ? "url" : "file");
		form.setFieldsValue({
			title: post.title,
			author: post.author,
			content: post.content,
			image_url: post.image_url || "",
			status: post.status,
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
		form.resetFields();
		setFileList([]);
		setImageMode("file");
	};

	const handleSubmit = async (values: BlogFormValues) => {
		const data = new FormData();
		Object.entries(values).forEach(([key, value]) => {
			if (value && key !== "image_url") data.append(key, value);
		});

		if (imageMode === "url") {
			const imageUrlValue = values.image_url?.trim();
			if (imageUrlValue) data.append("image_url", imageUrlValue);
		} else {
			const selectedFile = fileList[0]?.originFileObj;
			if (selectedFile) data.append("image_url", selectedFile);
		}

		try {
			if (editingPost) {
				await blogApi.update(editingPost._id, data);
				message.success("Cập nhật bài viết thành công");
			} else {
				await blogApi.create(data);
				message.success("Tạo bài viết thành công");
			}
			closeModal();
			await loadData();
		} catch (error) {
			console.error("Không thể lưu bài viết:", error);
			message.error("Không thể lưu bài viết");
		}
	};

	const toggleStatus = async (post: Blog) => {
		try {
			const nextStatus = post.status === "active" ? "inactive" : "active";
			await blogApi.toggleStatus(post._id, nextStatus);
			message.success(nextStatus === "active" ? "Đã hiện bài viết" : "Đã ẩn bài viết");
			await loadData();
		} catch (error) {
			console.error("Không thể cập nhật trạng thái:", error);
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
		onChange: ({ fileList: nextFileList }) => {
			setFileList(nextFileList);
			if (nextFileList.length > 0) {
				setImageMode("file");
				form.setFieldValue("image_url", "");
			}
		},
		onRemove: () => {
			setFileList([]);
			form.setFieldValue("image_url", "");
		},
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
					<Button aria-label="Sửa bài viết" icon={<EditOutlined />} onClick={() => openEditModal(post)} />
					<Button onClick={() => void toggleStatus(post)}>
						{post.status === "active" ? "Ẩn" : "Hiện"}
					</Button>
					<Button danger aria-label="Xoá bài viết" icon={<DeleteOutlined />} onClick={() => deletePost(post)} />
				</Space>
			),
		},
	];

	return (
		<Card
			title="Quản lý bài viết"
			bordered={false}
			extra={<Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>Thêm bài viết</Button>}
		>
			<Space wrap style={{ marginBottom: 16 }}>
				<Input
					allowClear
					prefix={<SearchOutlined />}
					placeholder="Tìm theo tiêu đề"
					value={search}
					onChange={(event) => setSearch(event.target.value)}
					style={{ width: 260 }}
				/>
				<Select
					allowClear
					placeholder="Lọc trạng thái"
					value={status}
					onChange={setStatus}
					options={[{ value: "active", label: "Hiển thị" }, { value: "inactive", label: "Đã ẩn" }]}
					style={{ width: 160 }}
				/>
			</Space>
			<Table rowKey="_id" columns={columns} dataSource={filteredPosts} loading={loading} scroll={{ x: 900 }} />

			<Modal
				title={editingPost ? "Sửa bài viết" : "Thêm bài viết"}
				open={modalOpen}
				onCancel={closeModal}
				onOk={() => form.submit()}
				okText="Lưu"
				cancelText="Huỷ"
				destroyOnClose
			>
				<Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ status: "active" }}>
					<Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}>
						<Input maxLength={200} showCount />
					</Form.Item>
					<Form.Item name="author" label="Tác giả" rules={[{ required: true, message: "Vui lòng nhập tác giả" }]}>
						<Input maxLength={100} />
					</Form.Item>
					<Form.Item name="blog_category_id" label="Danh mục">
						<Select allowClear placeholder="Chọn danh mục" options={categories.map((category) => ({ value: category._id, label: category.name }))} />
					</Form.Item>
					<Form.Item name="content" label="Nội dung" rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}>
						<Input.TextArea rows={8} />
					</Form.Item>
					<Form.Item name="status" label="Trạng thái">
						<Select options={[{ value: "active", label: "Hiển thị" }, { value: "inactive", label: "Đã ẩn" }]} />
					</Form.Item>

					<Form.Item label="Ảnh đại diện">
						<Radio.Group
							value={imageMode}
							onChange={(event) => {
								const nextMode = event.target.value as "file" | "url";
								setImageMode(nextMode);
								if (nextMode === "file") {
									setFileList([]);
									form.setFieldValue("image_url", "");
								} else {
									setFileList([]);
								}
							}}
						>
							<Radio value="file">Chọn từ máy tính</Radio>
							<Radio value="url">Dán URL từ trang web</Radio>
						</Radio.Group>
					</Form.Item>

					{imageMode === "file" ? (
						<Form.Item label="File ảnh">
							<Upload {...uploadProps} listType="picture">
								<Button icon={<UploadOutlined />}>Chọn ảnh</Button>
							</Upload>
						</Form.Item>
					) : (
						<>
							<Form.Item name="image_url" label="URL ảnh">
								<Input placeholder="https://example.com/image.jpg" allowClear />
							</Form.Item>
							{form.getFieldValue("image_url") ? (
								<div style={{ marginTop: 8 }}>
									<Image
										src={form.getFieldValue("image_url")}
										alt="preview"
										style={{ maxWidth: 220, maxHeight: 160, objectFit: "cover" }}
									/>
								</div>
							) : null}
						</>
					)}
				</Form>
			</Modal>
		</Card>
	);
};

export default Post;
