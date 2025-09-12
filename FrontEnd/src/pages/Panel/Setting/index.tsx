import { useMutation } from "@tanstack/react-query";
import { Button, Popconfirm } from "antd";
import { profileInfo } from "../../../services/profile/profile.service";
import { toast } from "react-toastify";

import { useNavigate } from "react-router-dom";

import { useTheme } from "../../../context/ThemeContext";
import { MoonOutlined, SunOutlined } from "@ant-design/icons";

export default function Setting() {
    const navigate = useNavigate()
    const { theme, toggleTheme } = useTheme();

  const deleteAccountMutation = useMutation({
    mutationFn: () => profileInfo.DeleteAccount(),
    onError: () => {
      toast.error("خطا");
    },
    onSuccess: () => {
      toast.success("اکانت شما با موفقیت حذف شد");
    },
  });

  const handleDeleteAccount = () => {
    deleteAccountMutation.mutate();
    navigate("/login")
  };

  return (
    <section className="w-full h-full flex justify-center  items-center">
      <div className="w-full h-full flex gap-5 justify-end p-4 items-start">
      <Popconfirm
    title="حذف حساب"
    description="آیا از حذف حساب خود اطمینان دارید؟"
    onConfirm={handleDeleteAccount}
    // onCancel={}
    okText="بله"
    cancelText="خیر"
  >
        <Button danger type="primary">
          حذف حساب
        </Button>
  </Popconfirm>
  <div className="flex flex-row justify-center items-center gap-4">
    <Button onClick={toggleTheme} color="blue" >
    {theme === "dark" ?  <SunOutlined /> : <MoonOutlined/>}
    </Button>

   
  </div>
      </div>
    </section>
  );
}
