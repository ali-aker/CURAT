import { Card, Col, Row, Statistic, Typography } from "antd";
import {
  ShoppingCartOutlined,
  ShoppingOutlined,
  TeamOutlined,
  DollarOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

export default function DashboardPage() {
  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>
        الرئيسية
      </Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="مبيعات اليوم"
              value={0}
              prefix={<DollarOutlined />}
              suffix="ج.م"
              styles={{ content: { color: "#3f8600" } }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="فواتير اليوم"
              value={0}
              prefix={<ShoppingCartOutlined />}
              styles={{ content: { color: "#1677ff" } }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="مشتريات اليوم"
              value={0}
              prefix={<ShoppingOutlined />}
              styles={{ content: { color: "#faad14" } }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="العملاء"
              value={0}
              prefix={<TeamOutlined />}
              styles={{ content: { color: "#722ed1" } }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
