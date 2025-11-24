// import type { ApexOptions } from "apexcharts";
// import Chart from "react-apexcharts";

// interface Props {
//   completed: number;
//   ongoing: number;
//   total: number;
// }

// export default function ConsultationDonut({ completed, ongoing, total }: Props) {
//   const series = [completed, ongoing, total - (completed + ongoing)];

//   const options: ApexOptions = {
//     chart: {
//       type: "donut",
//       sparkline: { enabled: false },
//     },
//     labels: ["تکمیل شده", "در حال انجام", "باقی مانده"],
//     colors: ["#10b981", "#f59e0b", "#ef4444"], 
//     plotOptions: {
//       pie: {
//         donut: {
//           size: "70%",
//           labels: {
//             show: true,
//             name: {
//               show: true,
//               fontSize: "14px",
//               color: "#888",
//             },
//             value: {
//               show: true,
//               fontSize: "18px",
//               fontWeight: "bold",
//             },
//             total: {
//               show: true,
//               label: "کل مشاوره‌ها",
//               formatter: function () {
//                 return total.toString();
//               },
//               fontSize: "16px",
//               color: "#444",
//             },
//           },
//         },
//         expandOnClick: false, 
//       },
//     },
//     dataLabels: {
//       enabled: true,
//       formatter: (val) => val.toFixed(0),
//     },
//     legend: {
//       position: "bottom",
//       horizontalAlign: "center",
//     },
//   };

//   return (
//     <div className="shadow p-4 rounded-xl bg-white w-full max-w-md mx-auto">
//       <Chart options={options} series={series} type="donut" height={200} />
//     </div>
//   );
// }
