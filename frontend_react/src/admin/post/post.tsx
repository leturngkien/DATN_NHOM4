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
}

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

	const loadData = async () => {
		setLoading(true);
		try {
			const [postResponse, categoryResponse] = await Promise.all([
				blogApi.getAllBlogs(),
				blogCategoryApi.getAll(),
			]);
			setPosts(postResponse.data.data || []);
			setCategories(categoryResponse.data.result || []);
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
		form.resetFields();
		form.setFieldsValue({ status: "active" });
		setModalOpen(true);
	};

	const openEditModal = (post: Blog) => {
		setEditingPost(post);
		setFileList([]);
		form.setFieldsValue({
			title: post.title,
			author: post.author,
			content: post.content,
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
	};

	const handleSubmit = async (values: BlogFormValues) => {
		const data = new FormData();
		Object.entries(values).forEach(([key, value]) => {
			if (value) data.append(key, value);
		});
		const selectedFile = fileList[0]?.originFileObj;
		if (selectedFile) data.append("image_url", selectedFile);

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
				await blogApi.delete(post._id);
				message.success("Đã xoá bài viết");
				await loadData();
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
		const matchesSearch = post.title.toLowerCase().includes(search.toLowerCase());
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
						<Upload {...uploadProps} listType="picture">
							<Button icon={<UploadOutlined />}>Chọn ảnh</Button>
						</Upload>
					</Form.Item>
				</Form>
			</Modal>
		</Card>
	);
};

export default Post;
