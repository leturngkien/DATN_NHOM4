"use client";
import { useEffect, useState } from "react";
import {
    Avatar,
    Button,
    Form,
    Input,
    Upload,
    message,
} from "antd";
import { DatePicker } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import userApi from "../api/userApi";
import "./account.css";

const { Item } = Form;

interface User {
    _id: string;
    email: string;
    fullname: string;
    password: string;
    phone_number: string;
    role: string;
    avatar: string;
    reset_password_token: string | null;
    reset_password_expires: string | null;
    refreshToken: string;
    dateOfBirth: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export default function Account() {
    const [form] = Form.useForm();
    const [user, setUser] = useState<User | null>(null);
    const [fileList, setFileList] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem("accessToken");
            const accountID = localStorage
                .getItem("accountID")
                ?.replace(/"/g, "")
                .trim();

            if (!token || !accountID) {
                setUser(null);
                return;
            }

            try {
                const userResponse = await userApi.getUserById(accountID);
                setUser(userResponse.data.data);
            } catch (error) {
                console.error("Failed to fetch user data:", error);
                setUser(null);
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        if (user) {
            form.setFieldsValue({
                fullname: user.fullname || "",
                email: user.email || "",
                phone: user.phone_number || "",
                birthDate: user.dateOfBirth ? dayjs(user.dateOfBirth, "YYYY-MM-DD") : null,
            });
        }
    }, [user, form]);

    const handleCancel = () => {
        if (user) {
            form.resetFields();
            form.setFieldsValue({
                fullname: user.fullname || "",
                email: user.email || "",
                phone: user.phone_number || "",
                birthDate: user.dateOfBirth ? dayjs(user.dateOfBirth, "YYYY-MM-DD") : null,
            });
        }
        setFileList([]);
    };

    const onFinish = async (values: any) => {
        const token = localStorage.getItem("accessToken");
        const accountID = localStorage.getItem("accountID")?.replace(/"/g, "").trim();

        if (!token || !accountID) {
            message.error("Thiếu token hoặc accountID!");
            return;
        }

        const formData = new FormData();
        formData.append("fullname", values.fullname || "");
        formData.append("email", values.email || "");
        formData.append("phone_number", values.phone || "");
        formData.append("dateOfBirth", values.birthDate?.format("YYYY-MM-DD") || "");

        if (fileList.length > 0) {
            const file = fileList[0].originFileObj;
            if (!file) {
                message.error("Vui lòng chọn file để upload!");
                return;
            }

            if (file.size > 1024 * 1024) {
                message.error("Dung lượng file tối đa là 1MB!");
                return;
            }

            const allowedTypes = ["image/jpeg", "image/png"];
            if (!allowedTypes.includes(file.type)) {
                message.error("Chỉ hỗ trợ định dạng JPG, PNG!");
                return;
            }

            formData.append("avatar", file);
        }

        setUploading(true);

        try {
            const userUpdateResponse = await userApi.update(accountID, formData);
            const data = userUpdateResponse.data;
            const updatedUser = {
                ...user,
                ...data.data,
                fullname: values.fullname || data.data?.fullname || user?.fullname,
                email: values.email || data.data?.email || user?.email,
                phone_number: values.phone || data.data?.phone_number || user?.phone_number,
                dateOfBirth: values.birthDate?.format("YYYY-MM-DD") || data.data?.dateOfBirth || user?.dateOfBirth,
            };

            setUser(updatedUser);
            localStorage.setItem("userData", JSON.stringify(updatedUser));
            message.success("Cập nhật thành công!");
            setFileList([]);
            window.location.reload();
        } catch (error) {
            message.error(`Cập nhật thất bại: ${error instanceof Error ? error.message : "Lỗi không xác định"}`);
        }
    };

    const validatePhoneNumber = (_: any, value: string) => {
        const phoneRegex = /^(03|05|07|08|09)[0-9]{8}$/;
        if (value && !phoneRegex.test(value)) {
            return Promise.reject(new Error('Số điện thoại không hợp lệ! Phải bắt đầu bằng 03, 05, 07, 08, 09 và đủ 10 số.'));
        }
        return Promise.resolve();
    };

    const uploadProps = {
        onRemove: () => {
            setFileList([]);
        },
        beforeUpload: (file: any) => {
            setFileList([file]);
            return false;
        },
        fileList,
        onChange: (info: any) => {
            let newFileList = [...info.fileList];
            newFileList = newFileList.slice(-1);
            setFileList(newFileList);
        },
    };

    return (
        <main className="account-page">
            <div className="account-shell">
                <nav className="account-tabs" aria-label="Khu vực tài khoản">
                    <Link className="account-tab account-tab-active" to="/userprofile/account">Hồ sơ của tôi</Link>
                    <Link className="account-tab" to="/userprofile/orders">Đơn hàng của tôi</Link>
                </nav>
                <header className="account-heading">
                    <div>
                        <span>THÔNG TIN TÀI KHOẢN</span>
                        <h1>Hồ sơ của tôi</h1>
                        <p>Cập nhật thông tin để Pet Corner phục vụ bạn tốt hơn.</p>
                    </div>
                    <div className="account-heading-badge">Tài khoản</div>
                </header>

                <section className="account-card">
                    <div className="account-card-title">
                        <div>
                            <h2>Thông tin cá nhân</h2>
                            <p>Thông tin này được sử dụng cho đơn hàng và liên hệ.</p>
                        </div>
                    </div>

                    <div className="account-form-layout">
                        <div className="account-form-column">
                    <Form form={form} layout="vertical" className="space-y-4" onFinish={onFinish}>
                        <Item 
                            name="fullname" 
                            label={<span className="text-base font-semibold">Họ và tên</span>}
                            rules={[
                                { required: true, message: 'Vui lòng nhập họ và tên!' }
                            ]}
                        >
                            <Input className="rounded border border-gray-300 p-2"/>
                        </Item>
                        <Item name="email" label={<span className="text-base font-semibold">Email</span>}>
                            <Input className="rounded border border-gray-300 p-2" disabled />
                        </Item>
                        <Item 
                            name="phone" 
                            label={<span className="text-base font-semibold">Số điện thoại</span>}
                            rules={[
                                { validator: validatePhoneNumber }
                            ]}
                        >
                            <Input placeholder="Nhập số điện thoại" className="rounded border border-gray-300 p-2"/>
                        </Item>
                        <Item name="birthDate" label={<span className="text-base font-semibold">Ngày sinh</span>}>
                            <DatePicker
                                placeholder="Chọn ngày sinh"
                                className="w-full rounded border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-[#22A6DF]"
                                format="DD-MM-YYYY"
                            />
                        </Item>
                            <Item>
                                <Button htmlType="submit" className="w-1/4 bg-[#22A6DF] hover:bg-[#1890ff] rounded text-white mr-2" loading={uploading}>Lưu</Button>
                                <Button className="w-1/4 bg-gray-300 hover:bg-gray-400 rounded text-gray-700" onClick={handleCancel} disabled={uploading}>Hủy</Button>
                            </Item>
                    </Form>
                        </div>
                        <div className="account-avatar-column">
                    <div className="account-avatar-ring">
                        <Avatar size={120} src={user?.avatar || "/images/avatar/avatar1.png"} />
                    </div>
                    <h3>Ảnh đại diện</h3>
                    <Upload {...uploadProps}>
                        <Button
                            icon={<UploadOutlined />}
                            className="account-upload-button"
                        >
                            Chọn ảnh
                        </Button>
                    </Upload>
                    <p>Dung lượng tối đa 1MB<br />JPG hoặc PNG</p>
                        </div>
                    </div>
                </section>
                </div>
        </main>
    )
}