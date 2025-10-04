import { Button } from "antd";
import { useState } from "react";
import FreeCode from "./FreeCode";

export default function Request() {
  const [isFreeCodeModalOpen, setIsFreeCodeModalOpen] = useState(false);

  return (
    <section className="w-full flex flex-col items-center h-full p-6 gap-6 bg-gray-50 dark:bg-gray-900">
      <div className="flex justify-center gap-3 flex-wrap">
        <Button type="primary" size="large">
          پک مشاوره
        </Button>
        <Button type="primary" size="large">
          مشاوره تک جلسه‌ای
        </Button>
        <Button
          onClick={() => setIsFreeCodeModalOpen(true)}
          type="primary"
          size="large"
          danger
        >
          مشاوره رایگان!
        </Button>
      </div>

     
      <FreeCode
        Code="08080982340"
        isOpen={isFreeCodeModalOpen}
        onClose={() => setIsFreeCodeModalOpen(false)}
      />
    </section>
  );
}
