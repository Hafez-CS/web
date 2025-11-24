import { useQuery } from "@tanstack/react-query";

import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { PlatformAdmin } from "../../../../services/platformAdmin/platformadmin.service";

export default function PlatformManagerColumnChart() {
  const { TotalResult } = PlatformAdmin();
  const { data: Result } = useQuery({
    queryKey: ["TotalResultPlatformAdmin"],
    queryFn: TotalResult,
  });

  if (!Result) return null;

  const series = [
    {
      name: "تعداد",
      data: [
        { x: "کاربران", y: Result.active_users },
        { x: "مشاوران", y: Result.active_consultants },
        { x: "مدیران مدارس", y: Result.active_school_admins },
        
      ],
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 350,
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        distributed: true, // هر ستون رنگ متفاوت
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => val.toString(),
    },
    xaxis: {
      type: "category",
      labels: {
        rotate: -15,
      },
    },
    yaxis: {
      title: {
        text: "تعداد",
      },
    },
    colors: ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#6366f1", "#14b8a6"],
    title: {
      text: "آمار کاربران و مشاوره‌ها",
      align: "center",
      style: {
        fontSize: "16px",
        fontWeight: "bold",
      },
    },
  };

  return (
    <div className="p-4 bg-white shadow rounded-xl">
      <Chart options={options} series={series} type="bar" height={350} />
    </div>
  );
}
