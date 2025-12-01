// import React from "react";
import { useConsultations } from "../../../../services/consultations/consultations.service";
import { useQuery } from "@tanstack/react-query";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

export default function ReportConsultant() {
  const { Report_Consultant } = useConsultations();

  const { data: reportData } = useQuery({
    queryKey: ["ReportConsultant"],
    queryFn: Report_Consultant,
  });

  if (!reportData) return <p>در حال بارگذاری...</p>;

  const options: ApexOptions = {
    chart: {
      type: "radialBar"
    },
    plotOptions: {
      radialBar: {
        hollow: {
          size: "60%"
        },
        dataLabels: {
          name: {
            show: true,
            fontSize: "16px"
          },
          value: {
            show: true,
            fontSize: "14px"
          }
        }
      }
    },
    labels: ["درصد تکمیل"],
    colors: ["#008ffb"]
  };
  

  const chartSeries = [reportData.completion_rate]; 

  return (
    <section className="w-full  flex justify-center items-center h-full">

    <div className=" items-center flex flex-col gap-6">
      <h1 className="text-2xl font-bold">گزارش عملکرد مشاور</h1>

     
      <Chart options={options} series={chartSeries} type="radialBar" width="400" />

     
      <div className="flex gap-6 text-lg">
        <p>کل جلسات: {reportData.total}</p>
        <p>تمام‌شده: {reportData.completed}</p>
        <p>در انتظار: {reportData.pending}</p>
      </div>
    </div>
    </section>
  );
}
