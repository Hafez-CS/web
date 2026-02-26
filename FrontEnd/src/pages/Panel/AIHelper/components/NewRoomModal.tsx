import { Form, Input, Button, Modal } from "antd";

export function NewRoomModal({
  open,
  loading,
  onClose,
  onSubmit,
}: {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
}) {
  return (
    <Modal title="اتاق جدید" open={open} onCancel={onClose} footer={null}>
      <Form onFinish={onSubmit}>
        <Form.Item
          name="name"
          rules={[{ required: true, message: "نام اتاق را وارد کنید!" }]}
        >
          <Input placeholder="نام چت جدید..." />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} className="w-full">
            ساختن
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}