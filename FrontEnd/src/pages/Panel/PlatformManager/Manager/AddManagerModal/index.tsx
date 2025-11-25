import { Form, Input, Modal } from "antd";
import { useMutation } from "@tanstack/react-query";
import { PlatformAdmin } from "../../../../../services/platformAdmin/platformadmin.service";
import { useForm } from "antd/es/form/Form";


import { toast } from "react-toastify";
import { queryClient } from "../../../../../App";
import type { AddManagerData, AddManagerModalProps } from "./@types";

export default function AddManagerModal({ status, onClose }: AddManagerModalProps) {
  
  const { CreateAdminManager } = PlatformAdmin();
  
  const [form] = useForm();
  const addNewConsultant = useMutation({
    mutationFn: CreateAdminManager,
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['ManagerListPanelManager'] })
      form.resetFields();
      onClose();
    },
    onError : () =>{
        toast.error("همچین کاربری با این مشخصات وجود دارد")
    }
  });

  const handleAdd = (data : AddManagerData) => {
    addNewConsultant.mutate(data);
  };

  return (
    <Modal
    title={"افزودن مشاور"}
      cancelText="لغو"
      okText="ایجاد"
      open={status}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={addNewConsultant.isPending}
    >
      <Form form={form} layout="vertical" onFinish={handleAdd}>
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

        <Form.Item
          label="رمز عبور"
          name="password"
          rules={[{ required: true, message: "رمز عبور لازمه" }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item label="بیوگرافی" name="bio">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}
