import type { ApexOptions } from "apexcharts";
import Chart from "react-apexcharts";


interface Props {
  label: string;
  value: number;
  max: number;
}

export default function MiniKPI({ label, value, max }: Props) {
  const percent = max > 0 ? Math.round((value / max) * 100) : 0;

  const options: ApexOptions = {
    chart: {
      type: "donut",
      sparkline: { enabled: true },
    },
    stroke: {
      width: 0,
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "75%",
          labels: {
            show: true,
            total: {
              show: true,
              label: label,
              fontSize: "12px",
              color: "#666",
            },
            value: {
              formatter: () => value.toString(),
              fontSize: "20px",
              fontWeight: "bold",
            },
          },
        },
      },
    },
    colors: ["#4f46e5", "#e5e7eb"],
  };

  const series = [percent, 100 - percent];

  return (
    <div className="shadow p-4 rounded-xl bg-white flex flex-col items-center w-full min-w-[100px]">
      <Chart options={options} series={series} type="donut" width="140" />
    </div>
  );
}
