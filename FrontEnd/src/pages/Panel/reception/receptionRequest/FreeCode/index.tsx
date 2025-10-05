import { Modal } from "antd";
import { toast } from "react-toastify";

interface IFreeCode {
  isOpen: boolean;
  onClose: () => void;
  Code: string;
}

export default function FreeCode({ isOpen, onClose, Code }: IFreeCode) {
  const handleCopyCode = () => {
    navigator.clipboard.writeText(Code);
    toast.success("کد با موفقیت کپی شد");
  };

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
        <span className="font-mono text-lg select-none">{Code}</span>
      </section>

      <p className="text-center py-2 mt-3 text-gray-500 text-sm">
        برای کپی کد روی آن کلیک کنید.
      </p>
    </Modal>
  );
}
