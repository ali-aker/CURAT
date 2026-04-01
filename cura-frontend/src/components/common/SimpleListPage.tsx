import { useState } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Switch,
  Typography,
  Popconfirm,
  message,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const { Title } = Typography;

interface Item {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  _count?: number;
}

interface SimpleListPageProps {
  title: string;
  queryKey: string;
  fetchFn: (tenant_id: string) => Promise<any>;
  createFn: (data: { tenant_id: string; name: string }) => Promise<any>;
  updateFn: (
    id: string,
    data: { name?: string; is_active?: boolean },
  ) => Promise<any>;
  deleteFn: (id: string) => Promise<any>;
  tenant_id: string;
  itemLabel?: string;
}

export default function SimpleListPage({
  title,
  queryKey,
  fetchFn,
  createFn,
  updateFn,
  deleteFn,
  tenant_id,
  itemLabel = "عنصر",
}: SimpleListPageProps) {
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [form] = Form.useForm();

  const { data: items, isLoading } = useQuery({
    queryKey: [queryKey, tenant_id],
    queryFn: () => fetchFn(tenant_id),
    enabled: !!tenant_id,
  });

  const createMutation = useMutation({
    mutationFn: (data: { tenant_id: string; name: string }) => createFn(data),
    onSuccess: () => {
      messageApi.success(`تم إضافة ${itemLabel} بنجاح`);
      queryClient.invalidateQueries({ queryKey: [queryKey, tenant_id] });
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
      data: { name?: string; is_active?: boolean };
    }) => updateFn(id, data),
    onSuccess: () => {
      messageApi.success(`تم تعديل ${itemLabel} بنجاح`);
      queryClient.invalidateQueries({ queryKey: [queryKey, tenant_id] });
      setModalOpen(false);
      form.resetFields();
      setEditingItem(null);
    },
    onError: (error: any) => {
      messageApi.error(typeof error === "string" ? error : "حدث خطأ");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFn,
    onSuccess: () => {
      messageApi.success(`تم حذف ${itemLabel} بنجاح`);
      queryClient.invalidateQueries({ queryKey: [queryKey, tenant_id] });
    },
    onError: (error: any) => {
      messageApi.error(typeof error === "string" ? error : "حدث خطأ");
    },
  });

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    form.setFieldsValue(item);
    setModalOpen(true);
  };

  const handleSubmit = (values: { name: string; is_active?: boolean }) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: values });
    } else {
      createMutation.mutate({ tenant_id, name: values.name });
    }
  };

  const columns = [
    {
      title: "الاسم",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "عدد الأصناف",
      dataIndex: "products_count",
      key: "products_count",
      render: (v: number) => <Tag color="blue">{v ?? 0} صنف</Tag>,
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
      render: (_: any, record: Item) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title={`هل أنت متأكد من حذف ${itemLabel}؟`}
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
          {title}
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          إضافة {itemLabel}
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={items ?? []}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingItem ? `تعديل ${itemLabel}` : `إضافة ${itemLabel} جديد`}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        okText="حفظ"
        cancelText="إلغاء"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="الاسم"
            rules={[{ required: true, message: "مطلوب" }]}
          >
            <Input />
          </Form.Item>
          {editingItem && (
            <Form.Item name="is_active" label="الحالة" valuePropName="checked">
              <Switch checkedChildren="نشط" unCheckedChildren="غير نشط" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}
