import { useMutation, useQuery } from "@tanstack/react-query";
import { FormData, ProfileItems, type IForm, type IProfileItems } from "./@types";
import useProfileApi from "../../../services/profile/profile.service";
import { Button, Card, Col, Form, Input, Modal, Row, Typography, Space } from "antd";
import { useState } from "react";
import { toast } from "react-toastify";

const { Title, Text } = Typography;

export default function Profile() {
  const { getProfileInfo, updateProfileInfoPUT } = useProfileApi();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: GetProfileInfo, refetch } = useQuery({
    queryKey: ["ProfileInfo"],
    queryFn: getProfileInfo,
  });

  const UpdateProfileInfo = useMutation({
    mutationFn: updateProfileInfoPUT,
    onSuccess: (data) => {
      toast.success(data.data.message);
      refetch();
      setIsModalOpen(false);
    },
    onError: () => toast.error("خطا"),
  });

  const onSubmit = (data: IForm) => {
    UpdateProfileInfo.mutate(data);
  };

  const dataList = ProfileItems.map((item: IProfileItems) => ({
    ...item,
    value:
      item.id === 1
        ? GetProfileInfo?.data.username
        : item.id === 2
        ? GetProfileInfo?.data.bio
        : item.id === 3
        ? GetProfileInfo?.data.email
        : "",
  }));

  return (
    <>
      <div className="w-full h-full flex gap-6 flex-col items-center px-5 pt-10">
        
        <div className="w-full max-w-[1350px] flex justify-between items-center mb-10">
          <Title level={3}>مشخصات کاربری</Title>
          <Button type="primary" onClick={() => setIsModalOpen(true)}>
            ویرایش
          </Button>
        </div>

        <Row gutter={[16, 16]} className="w-full max-w-[1350px]">
          {dataList.map((item) => (
            <Col xs={24} sm={12} lg={8} key={item.id}>
              <Card
              className="hover:scale-105 transition-all"
                style={{
                  height: 150,
                  borderRadius: 12,
                }}
                bodyStyle={{ padding: "20px" }}
              >
                <Space direction="vertical">
                  <Text  type="secondary" style={{ fontSize: 14  , fontFamily : "Vazir" , fontWeight : "bold"}}>
                    {item.title}
                  </Text>
                  <Text strong style={{ fontSize: 18 }}>
                    {item.value || "—"}
                  </Text>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      <Modal
        title="ویرایش مشخصات کاربری"
        footer={null}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form layout="vertical" onFinish={onSubmit}>
          {FormData.map((field) => (
            <Form.Item label={field.label} name={field.name} key={field.id}>
              <Input />
            </Form.Item>
          ))}

          <Button htmlType="submit" type="primary" block>
            تایید
          </Button>
        </Form>
      </Modal>
    </>
  );
}
