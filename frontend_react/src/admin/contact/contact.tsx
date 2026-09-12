import { useState, type FC } from "react";
import { Button, Card, Col, Form, Input, Row, Typography, message } from "antd";
import {
	EnvironmentOutlined,
	FacebookFilled,
	InstagramOutlined,
	MailOutlined,
	PhoneOutlined,
	SendOutlined,
} from "@ant-design/icons";
import contactApi from "../../api/contactApi";

const { Paragraph, Text, Title } = Typography;

interface ContactFormValues {
	name: string;
	email: string;
	phone?: string;
	message: string;
}

const contactItems = [
	{
		icon: <PhoneOutlined />,
		label: "Hotline",
		value: "0853665735",
		href: "tel:0853665735",
	},
	{
		icon: <MailOutlined />,
		label: "Email",
		value: "petcorner993@gmail.com",
		href: "mailto:petcorner993@gmail.com",
	},
	{
		icon: <EnvironmentOutlined />,
		label: "Địa chỉ",
		value: "116 Nguyễn Văn Thủ, P. Đa Kao, Q. 1, TP. HCM",
		href: "https://maps.google.com/?q=116+Nguyen+Van+Thu+Da+Kao+Quan+1+TPHCM",
	},
];

const Contact: FC = () => {
	const [form] = Form.useForm<ContactFormValues>();
	const [submitting, setSubmitting] = useState(false);

	const handleSubmit = async (values: ContactFormValues) => {
		setSubmitting(true);
		try {
			await contactApi.send(values);
			message.success("Gửi liên hệ thành công");
			form.resetFields();
		} catch (error: any) {
			console.error("Không thể gửi liên hệ:", error);
			message.error(error?.response?.data?.message || "Không thể gửi liên hệ lúc này");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<main className="min-h-screen bg-[#F7F5EF] px-4 py-10 sm:px-8 lg:px-[154px] lg:py-16">
			<section className="mx-auto max-w-6xl">
				<div className="mb-10 max-w-2xl">
					<Text className="font-semibold uppercase tracking-[0.18em] text-[#E4572E]">
						Pet Corner
					</Text>
					<Title className="!mb-3 !mt-3 !font-display !text-4xl !text-[#232620] sm:!text-5xl">
						Liên hệ với chúng tôi
					</Title>
					<Paragraph className="!mb-0 !text-base !leading-7 !text-[#726B5E]">
						Bạn cần tư vấn sản phẩm hoặc hỗ trợ đơn hàng? Hãy để lại lời nhắn,
						đội ngũ Pet Corner sẽ phản hồi sớm nhất.
					</Paragraph>
				</div>

				<Row gutter={[32, 32]} align="stretch">
					<Col xs={24} lg={9}>
						<Card className="h-full !border-0 !bg-[#232620] !shadow-none" bodyStyle={{ padding: 32 }}>
							<Title level={3} className="!mb-2 !text-white">
								Thông tin cửa hàng
							</Title>
							<Paragraph className="!mb-8 !text-[#D8D5CA]">
								Những người bạn đồng hành đáng tin cậy cho hành trình chăm sóc thú cưng.
							</Paragraph>
							<div className="flex flex-col gap-6">
								{contactItems.map((item) => (
									<div key={item.label} className="flex gap-4">
										<div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#E4572E] text-lg text-white">
											{item.icon}
										</div>
										<div>
											<Text className="block text-xs uppercase tracking-wider text-[#B7B8A9]">
												{item.label}
											</Text>
											<a
												href={item.href}
												target={item.href.startsWith("http") ? "_blank" : undefined}
												rel={item.href.startsWith("http") ? "noreferrer" : undefined}
												className="mt-1 block text-sm leading-6 text-white hover:text-[#F5AE16]"
											>
												{item.value}
											</a>
										</div>
									</div>
								))}
							</div>
							<div className="mt-10 flex gap-3 border-t border-white/15 pt-6">
								<a aria-label="Facebook" href="#" className="text-2xl text-white hover:text-[#F5AE16]"><FacebookFilled /></a>
								<a aria-label="Instagram" href="#" className="text-2xl text-white hover:text-[#F5AE16]"><InstagramOutlined /></a>
							</div>
						</Card>
					</Col>

					<Col xs={24} lg={15}>
						<Card className="h-full !border-0 !shadow-sm" bodyStyle={{ padding: 32 }}>
							<Title level={3} className="!mb-7 !text-[#232620]">
								Gửi tin nhắn
							</Title>
							<Form form={form} layout="vertical" onFinish={handleSubmit}>
								<Row gutter={16}>
									<Col xs={24} md={12}>
										<Form.Item name="name" label="Họ tên" rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}>
											<Input placeholder="Nguyễn Văn A" />
										</Form.Item>
									</Col>
									<Col xs={24} md={12}>
										<Form.Item name="email" label="Email" rules={[{ required: true, type: "email", message: "Email chưa hợp lệ" }]}>
											<Input placeholder="you@example.com" />
										</Form.Item>
									</Col>
								</Row>
								<Form.Item name="phone" label="Số điện thoại">
									<Input placeholder="0853665735" />
								</Form.Item>
								<Form.Item name="message" label="Nội dung" rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}>
									<Input.TextArea rows={6} placeholder="Bạn muốn Pet Corner hỗ trợ điều gì?" />
								</Form.Item>
								<Button type="primary" htmlType="submit" icon={<SendOutlined />} size="large" loading={submitting}>
									Gửi liên hệ
								</Button>
							</Form>
						</Card>
					</Col>
				</Row>
			</section>
		</main>
	);
};

export default Contact;
