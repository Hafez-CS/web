import { Button } from "antd";
import { useState } from "react";
import FreeCode from "./FreeCode";
import ConsultationsTable from "./Table";

export default function Request() {
  const [isFreeCodeModalOpen, setIsFreeCodeModalOpen] = useState(false);
  const [isSingleTableOpen , setIsSingleTableOpen] = useState(false)
  const [isPackageTableOpen , setIsPackageTableOpen] = useState(false)

  return (
    <section className="w-full flex flex-col items-start h-full p-6 gap-6 bg-gray-50 dark:bg-black">
      <div className="flex justify-center gap-3 flex-wrap">
        {!isSingleTableOpen && (
        <Button onClick={()=>setIsPackageTableOpen(prev => !prev)} type="primary" size="large">    
          {isPackageTableOpen ? "بازگشت" : "پک مشاوره"}
        </Button>
        )}
        {!isPackageTableOpen && (
        <Button onClick={()=>setIsSingleTableOpen(prev => !prev)} type="primary" size="large">
          {isSingleTableOpen ? "بازگشت" : "مشاوره تک جلسه‌ای"}
        </Button>
        )}
       {!isSingleTableOpen && !isPackageTableOpen && (
  <Button
    onClick={() => setIsFreeCodeModalOpen(true)}
    type="primary"
    size="large"
    danger
  >
    مشاوره رایگان!
  </Button>
)}

      </div>
    
       <ConsultationsTable packageShown={isPackageTableOpen}  singleShown={isSingleTableOpen}/>
  

     
      <FreeCode
        isOpen={isFreeCodeModalOpen}
        onClose={() => setIsFreeCodeModalOpen(false)}
      />
    </section>
  );
}
