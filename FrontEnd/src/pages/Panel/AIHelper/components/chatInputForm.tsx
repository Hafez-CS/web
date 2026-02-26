import { Form, Input, Button } from "antd";
import { SendOutlined } from "@ant-design/icons";
import { useWatch } from "antd/es/form/Form";

export default function ChatInputForm({
  loading,
  onSend,
  form,
}: {
  loading: boolean;
  onSend: (values: { content: string }) => void;
  form: any;
}) {
  const content = useWatch("content", form) || "";

  return (
    <Form
      form={form}
      onFinish={onSend}
      validateTrigger={[]}
      style={{
        width: "100%",
        padding: "24px",
      }}
    >
      <Form.Item name="content" style={{ margin: 0 }}>
        <div style={{ position: "relative", width: "100%" }}>
          <Input.TextArea
            placeholder="پیام خود را بنویسید..."
            autoSize={{ minRows: 1, maxRows: 12 }}
            style={{
              borderRadius: "14px",
              padding: "10px 45px 10px 10px",
            }}
          />

          {content.trim() && (
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SendOutlined />}
              style={{
                position: "absolute",
                right: "6px",
                top: "50%",
                transform: "translateY(-50%)",
                borderRadius: "10px",
                height: "34px",
                width: "34px",
                minWidth: "34px",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
          )}
        </div>
      </Form.Item>
    </Form>
  );
}