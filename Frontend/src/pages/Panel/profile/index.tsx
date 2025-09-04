import Cookies from "js-cookie";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ProfileItems, type IForm, type IProfileItems } from "./@types";
import { profileInfo } from "../../../services/profile/profile.service";
import { Button, Form, Input, Modal } from "antd";
import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const token_access = Cookies.get("token-access")
  const token_refresh = Cookies.get("token-refresh")
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { data: getProfileInfo, refetch } = useQuery({
    queryKey: ["ProfileInfo"],
    queryFn: profileInfo.getProfileInfo,
  });
  if(!token_access){
    navigate("/login")
  }
  if (getProfileInfo?.status === 401) {
    Cookies.remove("token-access");
    Cookies.remove("token-refresh");
    navigate("/login");
  }
  const UpdateProfileInfo = useMutation({
    mutationFn: profileInfo.updateProfileInfoPUT,
    onError: () => {
      toast.error("خط");
    },
    onSuccess: (data) => {
      console.log("🚀 ~ Profile ~ data:", data);
      toast.success("پروفایل با موفقیت آپدیت شد");
      refetch();
    },
  });
  const changeInfoFormHandleSubmit = (data: IForm) => {
    UpdateProfileInfo.mutate(data);
    console.log("🚀 ~ changeInfoFormHandleSubmit ~ data:", data);
    setIsModalOpen(false);
  };

  const dataList = ProfileItems.map((item: IProfileItems) => {
    let value: string | null = "";
    switch (item.id) {
      case 1:
        value = getProfileInfo?.data.username || "";
        break;
      case 2:
        value = getProfileInfo?.data.bio || "";
        break;
      case 3:
        value = getProfileInfo?.data.email || "";
        break;
      default:
        value = "";
    }
    return { ...item, value };
  });

  const token = Cookies.get("token-access");
  console.log("🚀 ~ Profile ~ token:", token);

  return (
    <>
      <div className="w-full h-full flex flex-col gap-5  justify-center items-center">
        <div className="w-full flex py-10 max-w-[1350px] justify-between items-center">
          <h1 className="font-bold text-2xl">مشخصات کاربری</h1>
          <Button onClick={() => setIsModalOpen(true)} type="primary">
            ویرایش
          </Button>
        </div>
        <section className="w-full h-full max-w-[1440px] gap-3 grid grid-cols-1 md:grid-cols-2 p-5 bg-gray-200 mt-20 rounded-md">
          {dataList.map((item) => (
            <div
              key={item.id}
              className="w-full min-w-[120px] h-[100px] bg-gray-300 rounded-md flex md:p-4 p-1 gap-2 items-center"
            >
              <p className="text-[16px] font-normal">{item.title}:</p>
              <span className="text-[20px] font-black">{item.value}</span>
            </div>
          ))}
        </section>
      </div>
      <Modal
        footer={null}
        onCancel={() => setIsModalOpen(false)}
        open={isModalOpen}
      >
        <Form
          style={{ padding: "40px 0px" }}
          onFinish={changeInfoFormHandleSubmit}
        >
          <Form.Item label={"نام کاربری "} name={"username"}>
            <Input />
          </Form.Item>
          <Form.Item label={"ایمیل"} name={"email"}>
            <Input />
          </Form.Item>
          <Form.Item label={"بیوگرافی "} name={"bio"}>
            <Input />
          </Form.Item>
          <Button htmlType="submit" type="primary">
            تایید
          </Button>
        </Form>
      </Modal>
    </>
  );
}
