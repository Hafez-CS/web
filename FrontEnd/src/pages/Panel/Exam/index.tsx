import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {  useExamService } from "../../../services/exam/exam.service";
import { Button, Radio, Spin, Progress } from "antd";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function ExamPage() {
  const slug = "python-basics"; 
  const navigate = useNavigate()
  const {GetExam , SendExam} = useExamService()


  const { data: examData, isLoading } = useQuery({
    queryKey: ["Exam", slug],
    queryFn: () => GetExam(slug),
  });


  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSelect = (questionId: number, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };


  const submitMutation = useMutation({
    mutationFn: () => SendExam(slug, answers),
    onSuccess: () => {
      toast.success("آزمون با موفقیت ارسال شد");
      navigate("/helper")
    },
    onError: () => {
      toast.error("خطا در ارسال آزمون");
    },
  });

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-full">
        <Spin tip="در حال بارگذاری آزمون..." />
      </div>
    );

  if (!examData)
    return <p className="text-center text-gray-600">هیچ آزمونی یافت نشد</p>;

  const questions = examData.questions;
  const currentQuestion = questions[currentIndex];
  const total = questions.length;
  const progress = Math.round(((currentIndex + 1) / total) * 100);

  return (
    <section className="flex flex-col items-center justify-center w-full h-full bg-gray-50 dark:bg-gray-900 p-6">
      <div className="w-full max-w-[700px] bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 flex flex-col items-center space-y-6">
        <h1 className="text-2xl font-bold text-[#222222] dark:text-white text-center">
          آزمون: {examData.title}
        </h1>

        {/* Progress */}
        <Progress
          percent={progress}
          showInfo={false}
          strokeColor={{ from: "#108ee9", to: "#87d068" }}
          className="w-full"
        />
        <p className="text-gray-700 dark:text-gray-300 text-sm">
          سوال {currentIndex + 1} از {total}
        </p>

        <div className="w-full p-4 rounded-xl border dark:border-gray-700 bg-gray-100 dark:bg-gray-700">
          <p className="font-semibold mb-3 text-gray-800 dark:text-gray-200">
            {currentQuestion.text}
          </p>

          <Radio.Group
            onChange={(e) => handleSelect(currentQuestion.id, e.target.value)}
            value={answers[currentQuestion.id]}
          >
            {currentQuestion.options.map((opt : string, idx : number) => (
              <Radio
                key={idx}
                value={opt}
                className="block text-gray-700 dark:text-gray-300 mb-2"
              >
                {opt}
              </Radio>
            ))}
          </Radio.Group>
        </div>

       
        <div className="flex justify-between py-4 w-full ">
          <Button
            onClick={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
            disabled={currentIndex === 0}
          >
            قبلی
          </Button>

          {currentIndex < total - 1 ? (
            <Button
              type="primary"
              onClick={() => setCurrentIndex((i) => i + 1)}
              disabled={!answers[currentQuestion.id]}
            >
              بعدی
            </Button>
          ) : (
            <Button
              type="primary"
              danger
              onClick={() =>{
                submitMutation.mutate()
                // navigate("/helper")
              }
                }
              loading={submitMutation.isPending}
              disabled={
                Object.keys(answers).length !== total || !answers[currentQuestion.id]
              }
            >
              ارسال آزمون
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
