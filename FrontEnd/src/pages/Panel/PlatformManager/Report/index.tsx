import { useQuery } from "@tanstack/react-query";
import type { ApexOptions } from "apexcharts";
import { PlatformAdmin } from "../../../../services/platformAdmin/platformadmin.service";
import Chart from "react-apexcharts";
// import ConsultationDonut from "../Users/ConsulationDonut";

export default function Reports() {
    // const { TotalResult } = PlatformAdmin();
//   const { data: Result } = useQuery({
//     queryKey: ["TotalResultPlatformAdmin"],
//     queryFn: TotalResult,
//   });
  const { consultResult } = PlatformAdmin();

  const { data: ConsultantReport, isLoading } = useQuery({
    queryKey: ["ConsultantReport"],
    queryFn: consultResult,
  });

  if (isLoading) return <p>در حال بارگذاری...</p>;
  if (!ConsultantReport) return <p>داده‌ای یافت نشد</p>;

  const { completed, pending, completion_rate } = ConsultantReport;

  const series = [completed, pending];

  const chartOptions : ApexOptions = {
    chart: {
      type: "donut",
    },
    labels: ["انجام شده", "در انتظار"],
    colors: ["#2ecc71", "#f39c12"],

    dataLabels: {
      enabled: true,
      formatter: function (val: number) {
        return Math.round(val) + "%";
      },
    },

    plotOptions: {
      pie: {
        customScale: 1, 
        expandOnClick: false,

        donut: {
          size: "65%", 
          labels: {
            show: true,

            total: {
              show: true,
              label: "درصد تکمیل",
              formatter: () => `${completion_rate}%`,
            },
          },
        },
      },
    },

    legend: {
      position: "bottom",
    },
  };

  return (
    <div
      style={{
        width: "350px",
        margin: "0 auto",
        background: "#fff",
        padding: "24px",
        borderRadius: "16px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
      }}
    >
      <h3 style={{ textAlign: "center", marginBottom: "12px" }}>
        وضعیت مشاوره‌ها
      </h3>

      <Chart options={chartOptions} series={series} type="donut" />
      {/* <ConsultationDonut
  completed={Result.completed_consultations}
  ongoing={Result.ongoing_consultations}
  total={Result.total_consultations}
/> */}
    </div>
  );
}
