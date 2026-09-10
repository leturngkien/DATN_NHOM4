import React from "react";
import { Typography, Button, Space, Card } from "antd";
import {
  CloseCircleOutlined,
  HomeOutlined,
  CustomerServiceOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const CancelPage = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 20px",
        background: "#f5f5f5",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 550,
          textAlign: "center",
          borderRadius: 16,
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
        }}
      >
        <div
          style={{
            fontSize: 80,
            color: "#ff4d4f",
            marginBottom: 15,
          }}
        >
          <CloseCircleOutlined />
        </div>

        <Title
          level={2}
          style={{
            color: "#ff4d4f",
            marginBottom: 15,
          }}
        >
          Hủy đơn hàng
        </Title>

        <Text
          type="secondary"
          style={{
            display: "block",
            fontSize: 16,
            lineHeight: 1.7,
            marginBottom: 30,
          }}
        >
          Đơn hàng của bạn đã được hủy.
          <br />
          Nếu bạn gặp vấn đề hoặc cần hỗ trợ, vui lòng liên hệ với chúng tôi.
        </Text>

        <Space
          direction="vertical"
          size="middle"
          style={{ width: "100%" }}
        >
          <Button
            type="primary"
            size="large"
            icon={<CustomerServiceOutlined />}
            block
          >
            Liên hệ hỗ trợ
          </Button>

          <Button
            size="large"
            icon={<HomeOutlined />}
            block
            onClick={() => navigate("/")}
          >
            Về trang chủ
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default CancelPage;