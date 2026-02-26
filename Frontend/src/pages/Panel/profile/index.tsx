import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import useProfileApi from "../../../services/profile/profile.service";
import {
  Button,
  Card,
  Form,
  Input,
  Modal,

  Typography,

  Avatar,
  Skeleton,
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import { FormData, type IForm } from "./@types";
import { toast } from "react-toastify";

const { Title, Text, Paragraph } = Typography;

export default function Profile() {
  const { getProfileInfo, updateProfileInfoPUT } = useProfileApi();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const { data: profile, refetch, isLoading } = useQuery({
    queryKey: ["ProfileInfo"],
    queryFn: getProfileInfo,
  });

  useEffect(() => {
    if (profile?.data) {
      form.setFieldsValue({
        username: profile.data.username,
        bio: profile.data.bio,
        email: profile.data.email,
      });
    }
  }, [profile, form]);

  const updateMutation = useMutation({
    mutationFn: updateProfileInfoPUT,
    onSuccess: (data) => {
      toast.success(data.data.message);
      refetch();
      setIsModalOpen(false);
    },
    onError: (error : any) => toast.error(`خطا : ${error}`),
  });

  const onSubmit = (data: IForm) => {
    updateMutation.mutate(data);
  };

  return (
    <div
      style={{
        width: "100%",
        padding: "10px 10px 10px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "40px",
      }}
    >
      {/* ===== Profile Card ===== */}
      <Card
        bordered={false}
        style={{
          width: "100%",
          maxWidth: "900px",
          borderRadius: "28px",
          background: "var(--profile-hero-bg)",
          boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
          textAlign: "center",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: 180,
            width: "100%",
            
            background: "linear-gradient(135deg,#4facfe,#00f2fe)",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              bottom: -48,
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            {isLoading ? (
              <Skeleton.Avatar active size={96} />
            ) : (
              <Avatar
                size={96}
                icon={<UserOutlined />}
                style={{
                  border: "6px solid var(--profile-hero-bg)",
                  boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
                }}
              />
            )}
          </div>
        </div>

        <div style={{ paddingTop: 70, paddingBottom: 40 }}>
          <Title level={3} style={{ marginBottom: 8 }}>
            {profile?.data.username || "—"}
          </Title>

          <Text type="secondary" style={{ fontSize: 16 }}>
            {profile?.data.email || "—"}
          </Text>

          <Paragraph
            style={{
              maxWidth: 500,
              margin: "18px auto 0",
              fontSize: 15,
              color: "rgba(0,0,0,0.65)",
            }}
          >
            {profile?.data.bio || "—"}
          </Paragraph>

          <Button
            type="primary"
            size="large"
            onClick={() => setIsModalOpen(true)}
            style={{
              marginTop: 28,
              borderRadius: 14,
              paddingInline: 36,
              height: 46,
              fontWeight: 600,
              boxShadow: "0 6px 16px rgba(24,144,255,0.25)",
            }}
          >
            ویرایش اطلاعات
          </Button>
        </div>
      </Card>

      {/* ===== Edit Modal ===== */}
      <Modal
        title="ویرایش مشخصات کاربری"
        open={isModalOpen}
        footer={null}
        onCancel={() => setIsModalOpen(false)}
        centered
        width={480}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onSubmit}
          style={{ marginTop: 24 }}
        >
          {FormData.map((field) => (
            <Form.Item
              label={field.label}
              name={field.name}
              key={field.id}
              rules={[{ required: true, message: "این فیلد الزامی است" }]}
            >
              <Input size="large" style={{ borderRadius: 14 }} />
            </Form.Item>
          ))}

          <Button
            htmlType="submit"
            type="primary"
            block
            size="large"
            loading={updateMutation.isPending}
            style={{
              marginTop: 28,
              borderRadius: 14,
              fontWeight: 600,
              height: 48,
            }}
          >
            ذخیره تغییرات
          </Button>
        </Form>
      </Modal>
    </div>
  );
}