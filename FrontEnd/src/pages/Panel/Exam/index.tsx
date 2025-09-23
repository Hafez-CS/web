import { useQuery } from "@tanstack/react-query";
import ExamCard from "./components/ExamCard";
import { exam } from "../../../services/exam/exam.service";

export default function Exam() {
  const {data : ExamList} = useQuery({
    queryKey : ["Exams"],
    queryFn : () => exam.GetExam
  })
  console.log("🚀 ~ Exam ~ ExamList:", ExamList)
  return (
    <section className="flex justify-center w-full h-full items-center">
      <div className="w-full h-full p-1 overflow-y-auto   gap-12 max-w-[1280px] grid grid-cols-4">
        {/* {ExamList.map((data)=>{ */}
          {/* return( */}
            <ExamCard id={1} name="شیمی 12"/>
            <ExamCard id={1} name="شیمی 12"/>
            <ExamCard id={1} name="شیمی 12"/>
            <ExamCard id={1} name="شیمی 12"/>
            <ExamCard id={1} name="شیمی 12"/>
            <ExamCard id={1} name="شیمی 12"/>
            <ExamCard id={1} name="شیمی 12"/>
            <ExamCard id={1} name="شیمی 12"/>
            <ExamCard id={1} name="شیمی 12"/>
            <ExamCard id={1} name="شیمی 12"/>
            <ExamCard id={1} name="شیمی 12"/>
            <ExamCard id={1} name="شیمی 12"/>
            <ExamCard id={1} name="شیمی 12"/>
            <ExamCard id={1} name="شیمی 12"/>
            <ExamCard id={1} name="شیمی 12"/>
            <ExamCard id={1} name="شیمی 12"/>
            <ExamCard id={1} name="شیمی 12"/>
            <ExamCard id={1} name="شیمی 12"/>
          {/* ) */}
        {/* })} */}
      </div>
    </section>
  );
}
