import { Form, Input, Button, Card, Typography, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { authService } from "../../services/auth.service";
import { useAuthStore } from "../../store/auth.store";
import { type LoginRequest } from "../../types/auth.types";

const { Title } = Typography;

export default function LoginPage() {
  const { setAuth } = useAuthStore();
  const [messageApi, contextHolder] = message.useMessage();

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setAuth(data.user, data.access_token, data.refresh_token);
    },
    onError: (error: any) => {
      messageApi.error(
        typeof error === "string"
          ? error
          : "خطأ في البريد الإلكتروني أو كلمة المرور",
      );
    },
  });

  const onFinish = (values: LoginRequest) => {
    loginMutation.mutate(values);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      {contextHolder}
      <Card
        style={{
          width: 400,
          borderRadius: 16,
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Title level={2} style={{ margin: 0, color: "#1677ff" }}>
            كيورا
          </Title>
          <Typography.Text type="secondary">
            نظام إدارة الصيدليات
          </Typography.Text>
        </div>

        <Form name="login" onFinish={onFinish} layout="vertical" size="large">
          <Form.Item
            name="email"
            label="البريد الإلكتروني"
            rules={[
              { required: true, message: "أدخل البريد الإلكتروني" },
              { type: "email", message: "البريد الإلكتروني غير صحيح" },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="example@email.com"
              dir="ltr"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="كلمة المرور"
            rules={[{ required: true, message: "أدخل كلمة المرور" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="كلمة المرور"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loginMutation.isPending}
            >
              تسجيل الدخول
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
