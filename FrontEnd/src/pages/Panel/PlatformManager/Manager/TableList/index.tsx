import { Button, Form, Input, Modal, Table } from "antd";
import { PlatformAdmin } from "../../../../../services/platformAdmin/platformadmin.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useState } from "react";
import type { AddConsultant } from "../../../../../services/platformAdmin/@types";
import { useForm } from "antd/es/form/Form";

interface ManagerItem {
  id: number;
  username: string;
  email: string;
  role: string;
  bio: string;
}

export default function ManagerList({ DataSource }: { DataSource: ManagerItem[] }) {
  const queryClient = useQueryClient();
  const { DeleteAdminManager, EditAdminManager } = PlatformAdmin();

  const [form] = useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedConsultant, setSelectedConsultant] = useState<ManagerItem | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => DeleteAdminManager(id),
    onSuccess: () => {
      toast.success("مشاور با موفقیت حذف شد");
      queryClient.invalidateQueries({ queryKey: ["ManagerListPanelManager"] });
    },
    onError: (error: any) => {
      toast.error(`خطا در حذف مشاور: ${error?.message || error}`);
    },
  });

  const editMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: AddConsultant }) =>
      EditAdminManager(id, data),
    onSuccess: () => {
      toast.success("اطلاعات کاربر با موفقیت ویرایش شد");
      queryClient.invalidateQueries({ queryKey: ["ManagerListPanelManager"] });
      form.resetFields();
      setIsModalOpen(false);
      setSelectedConsultant(null);
    },
    onError: () => toast.error("خطا در ویرایش کاربر"),
  });

  const handleEditClick = (record: ManagerItem) => {
    setSelectedConsultant(record);
    form.setFieldsValue({
      username: record.username,
      email: record.email,
      bio: record.bio,
    });
    setIsModalOpen(true);
  };

  const handleEditSubmit = (values: any) => {
    if (selectedConsultant) {
      editMutation.mutate({ id: selectedConsultant.id, data: values });
    }
  };

  const columns = [
    { title: "شناسه", dataIndex: "id", key: "id" },
    { title: "نام کاربری", dataIndex: "username", key: "username" },
    { title: "ایمیل", dataIndex: "email", key: "email" },
    { title: "بیوگرافی", dataIndex: "bio", key: "bio" },
    {
      title: "عملیات",
      key: "actions",
      render: (_: any, record: ManagerItem) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            danger
            onClick={() => deleteMutation.mutate(record.id)}
            loading={deleteMutation.isPending}
          >
            حذف
          </Button>
          <Button type="primary" onClick={() => handleEditClick(record)}>
            ویرایش
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Table className='overflow-y-auto' rowKey="id" columns={columns} dataSource={DataSource} />

      <Modal
        title="ویرایش اطلاعات مدیر مدرسه"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        okText="ذخیره"
        cancelText="لغو"
        confirmLoading={editMutation.isPending}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleEditSubmit}>
          <Form.Item
            label="نام کاربری"
            name="username"
            rules={[{ required: true, message: "این فیلد اجباریه" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="ایمیل"
            name="email"
            rules={[{ required: true, message: "ایمیل رو وارد کن" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="بیوگرافی" name="bio">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
