import { useMutation } from "@tanstack/react-query";
import { Button, Form, Input, Modal, Radio } from "antd";
import React, { useState } from "react";
import { exam } from "../../../services/exam/exam.service";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function ExamPage() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [examName , setExamName] = useState<string | null>(null)
  const [isExamStarted, setIsExamStarted] = useState<boolean>(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const navigate = useNavigate()

  const FindExam = useMutation({
    mutationFn: exam.GetExam,
    onError: (error) => {
      toast.error(error.message || "خطایی رخ داده است");
      toast.error("آزمونی پیدا نشد");
    },
    onSuccess: (data) => {
      
      console.log("🚀 ~ ExamPage ~ data.data.questions:", data.data.questions);
      setQuestions(data.data.questions || []);
      toast.success("آزمون با موفقیت یافت شد ");
      setIsModalOpen(false);
      setIsExamStarted(true);
      setCurrentIndex(0);
    },
  });

  
  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
    console.log("🚀 ~ handleAnswerChange ~ answers:", answers)
  };

  
  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      console.log("🚀 ~ nextQuestion ~ CurrentIndex:", currentIndex)
    }
  };

  
  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      console.log("🚀 ~ prevQuestion ~ currentIndex:", currentIndex)
    }
  };

  
  const handleSubmitAnswers = () => {
    console.log("🚀 ~ handleSubmitAnswers ~ answers:", answers)
    toast.success("جواب‌ها ثبت شد!");
    navigate(`/helper/${examName}`)
    setExamName(null)
    setCurrentIndex(0);
    setIsExamStarted(false)
  };

  const ExamModalSearch = (values: { examId: string }) => {
    setExamName(values.examId)
    FindExam.mutate(values.examId);
  };

  const currentQuestion = questions[currentIndex];

  return (
    <section className="w-full h-full flex items-center justify-center">
      <div className="w-full h-full flex justify-center items-center max-w-[1440px]">
       
        {!isExamStarted && (
          <div className="flex flex-col gap-6 items-center justify-center w-full">
            <h1 className="text-5xl font-extrabold text-center">آزمون</h1>
            <p className="text-lg">برای یافتن آزمون خود کلیک کنید:</p>
            <Button onClick={() => setIsModalOpen(true)} type="primary">
              یافتن آزمون
            </Button>
          </div>
        )}

        
        {isExamStarted && currentQuestion && (
          <div className="w-full max-w-xl bg-white shadow-xl rounded-2xl p-6 space-y-6">
            <h2 className="text-xl font-bold text-center">
              سوال {currentIndex + 1} از {questions.length}
            </h2>

            <p className="text-lg font-medium">{currentQuestion.question_text}</p>

            <Radio.Group
              onChange={(e) =>
                handleAnswerChange(currentQuestion.id, e.target.value)
              }
              value={answers[currentQuestion.id]}
              className="flex flex-col gap-3"
            >
              {Object.entries(currentQuestion.options).map(([key, value]) => (
                <Radio key={key} value={key}>
                  {value as string}
                </Radio>
              ))}
            </Radio.Group>

            <div className="flex justify-between gap-4">
              <Button onClick={prevQuestion} disabled={currentIndex === 0}>
                قبلی
              </Button>

              {currentIndex < questions.length - 1 ? (
                <Button type="primary" onClick={nextQuestion}>
                  بعدی
                </Button>
              ) : (
                <Button type="primary" onClick={handleSubmitAnswers}>
                  ثبت نهایی
                </Button>
              )}
            </div>
          </div>
        )}

        
        <Modal
          onCancel={() => setIsModalOpen(false)}
          open={isModalOpen}
          footer={null}
          title={"جستجوی آزمون"}
        >
          <Form onFinish={ExamModalSearch}>
            <Form.Item name="examId" rules={[{ required: true }]}>
              <Input placeholder="کد آزمون را وارد کنید" />
            </Form.Item>
            <Form.Item>
              <Button htmlType="submit" type="primary" block>
                جستجو
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </section>
  );
}
