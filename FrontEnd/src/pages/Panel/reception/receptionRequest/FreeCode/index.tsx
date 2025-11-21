import { useMutation } from "@tanstack/react-query";
import { Modal } from "antd";
import { toast } from "react-toastify";
import { useConsultations, type ICode } from "../../../../../services/consultations/consultations.service";
import { useEffect, useState } from "react";

interface IFreeCode {
  isOpen: boolean;
  onClose: () => void;
}

export default function FreeCode({ isOpen, onClose }: IFreeCode) {
    const { Request_Free_Coupon} = useConsultations()
  const [codeData , setCodeData] = useState<ICode | null>(null)
  const freeCode = useMutation({
  mutationFn: () => Request_Free_Coupon(),
  onSuccess: (data : ICode) => {
    console.log("🚀 ~ FreeCode ~ data:", data);
    setCodeData(data)
  }
});



  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeData?.coupon.code as string);
    toast.success("کد با موفقیت کپی شد");
  };

  useEffect(()=>{
    freeCode.mutate()
  },[isOpen])


  return (
    <Modal
      footer={null}
      onCancel={onClose} 
      title="کد تخفیف شما"
      open={isOpen}
    >
      <section
        onClick={handleCopyCode}
        className="w-full flex justify-center items-center h-[60px] bg-gray-200 dark:bg-gray-700 rounded-2xl cursor-pointer hover:bg-gray-300 transition"
      >
        <span className="font-mono text-lg select-none">{codeData?.coupon.code as string}</span>
      </section>

      <p className="text-center py-2 mt-3 text-gray-500 text-sm">
        {codeData?.coupon.used ? "شما از این کد تخفیف استفاده کردید" : "برای کپی کد روی آن کلیک کنید."}
      </p>
    </Modal>
  );
}
