import { useState } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  InputNumber,
  Typography,
  Popconfirm,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productsService } from "../../../services/products.service";
import { useAuthStore } from "../../../store/auth.store";
import type { Product, CreateProductDto } from "../../../types/product.types";

const { Title } = Typography;

export default function ProductsPage() {
  const { user } = useAuthStore();
  const tenant_id = user?.tenant_id ?? "";
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const [form] = Form.useForm();

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", tenant_id],
    queryFn: () => productsService.getProducts(tenant_id),
    enabled: !!tenant_id,
  });

  const { data: catalogs } = useQuery({
    queryKey: ["catalogs", tenant_id],
    queryFn: () => productsService.getCatalogs(tenant_id),
    enabled: !!tenant_id,
  });

  const { data: sections } = useQuery({
    queryKey: ["sections", tenant_id],
    queryFn: () => productsService.getSections(tenant_id),
    enabled: !!tenant_id,
  });

  const { data: brands } = useQuery({
    queryKey: ["brands", tenant_id],
    queryFn: () => productsService.getBrands(tenant_id),
    enabled: !!tenant_id,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateProductDto & { tenant_id: string }) =>
      productsService.createProduct(data),
    onSuccess: () => {
      messageApi.success("تم إضافة المنتج بنجاح");
      queryClient.invalidateQueries({ queryKey: ["products", tenant_id] });
      setModalOpen(false);
      form.resetFields();
    },
    onError: (error: any) => {
      messageApi.error(typeof error === "string" ? error : "حدث خطأ");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateProductDto>;
    }) => productsService.updateProduct(id, data),
    onSuccess: () => {
      messageApi.success("تم تعديل المنتج بنجاح");
      queryClient.invalidateQueries({ queryKey: ["products", tenant_id] });
      setModalOpen(false);
      form.resetFields();
      setEditingProduct(null);
    },
    onError: (error: any) => {
      messageApi.error(typeof error === "string" ? error : "حدث خطأ");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: productsService.deleteProduct,
    onSuccess: () => {
      messageApi.success("تم حذف المنتج بنجاح");
      queryClient.invalidateQueries({ queryKey: ["products", tenant_id] });
    },
    onError: (error: any) => {
      messageApi.error(typeof error === "string" ? error : "حدث خطأ");
    },
  });

  const handleAdd = () => {
    setEditingProduct(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    form.setFieldsValue(product);
    setModalOpen(true);
  };

  const handleSubmit = (values: CreateProductDto) => {
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: values });
    } else {
      createMutation.mutate({ ...values, tenant_id });
    }
  };

  const filteredProducts = (products ?? []).filter(
    (p: Product) =>
      p.name_ar.includes(search) ||
      p.name_en?.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode?.includes(search),
  );

  const columns = [
    {
      title: "الاسم بالعربي",
      dataIndex: "name_ar",
      key: "name_ar",
    },
    {
      title: "الاسم بالإنجليزي",
      dataIndex: "name_en",
      key: "name_en",
      render: (v: string) => v || "-",
    },
    {
      title: "المادة الفعالة",
      dataIndex: "scientific_name",
      key: "scientific_name",
      render: (v: string) => v || "-",
    },
    {
      title: "الباركود",
      dataIndex: "barcode",
      key: "barcode",
      render: (v: string) => v || "-",
    },
    {
      title: "الوحدة",
      dataIndex: "unit",
      key: "unit",
    },
    {
      title: "خاضع للضريبة",
      dataIndex: "is_taxable",
      key: "is_taxable",
      render: (v: boolean) => (
        <Tag color={v ? "green" : "default"}>{v ? "نعم" : "لا"}</Tag>
      ),
    },
    {
      title: "الحالة",
      dataIndex: "is_active",
      key: "is_active",
      render: (v: boolean) => (
        <Tag color={v ? "green" : "red"}>{v ? "نشط" : "غير نشط"}</Tag>
      ),
    },
    {
      title: "الإجراءات",
      key: "actions",
      render: (_: any, record: Product) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="هل أنت متأكد من الحذف؟"
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText="نعم"
            cancelText="لا"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {contextHolder}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          الأصناف
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          إضافة صنف
        </Button>
      </div>

      <Input
        prefix={<SearchOutlined />}
        placeholder="بحث باسم الصنف أو الباركود..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: 16, maxWidth: 400 }}
        allowClear
      />

      <Table
        columns={columns}
        dataSource={filteredProducts}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingProduct ? "تعديل صنف" : "إضافة صنف جديد"}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={700}
        okText="حفظ"
        cancelText="إلغاء"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name_ar"
            label="الاسم بالعربي"
            rules={[{ required: true, message: "مطلوب" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="name_en" label="الاسم بالإنجليزي">
            <Input dir="ltr" />
          </Form.Item>
          <Form.Item name="scientific_name" label="المادة الفعالة">
            <Input />
          </Form.Item>
          <Form.Item name="barcode" label="الباركود">
            <Input dir="ltr" />
          </Form.Item>
          <Form.Item
            name="unit"
            label="الوحدة الكبيرة"
            rules={[{ required: true, message: "مطلوب" }]}
          >
            <Input placeholder="علبة، كرتون..." />
          </Form.Item>
          <Form.Item name="sub_unit" label="الوحدة الصغيرة">
            <Input placeholder="قرص، كبسولة..." />
          </Form.Item>
          <Form.Item name="sub_unit_qty" label="عدد الوحدات الصغيرة في الكبيرة">
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="min_stock_alert" label="الحد الأدنى للمخزون">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="catalog_id" label="الكتالوج">
            <Select allowClear placeholder="اختر الكتالوج">
              {(catalogs ?? []).map((c: any) => (
                <Select.Option key={c.id} value={c.id}>
                  {c.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="section_id" label="القسم">
            <Select allowClear placeholder="اختر القسم">
              {(sections ?? []).map((s: any) => (
                <Select.Option key={s.id} value={s.id}>
                  {s.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="brand_id" label="الماركة">
            <Select allowClear placeholder="اختر الماركة">
              {(brands ?? []).map((b: any) => (
                <Select.Option key={b.id} value={b.id}>
                  {b.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="is_taxable"
            label="خاضع للضريبة"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
