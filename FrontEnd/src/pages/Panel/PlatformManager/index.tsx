import { useQuery } from "@tanstack/react-query";
import { PlatformAdmin } from "../../../services/platformAdmin/platformadmin.service";

import PlatformManagerColumnChart from "./Users/ColumChart";



export default function Platform_Manager() {
  const { TotalResult } = PlatformAdmin();
  const { data: Result } = useQuery({
    queryKey: ["TotalResultPlatformAdmin"],
    queryFn: TotalResult,
  });

  if (!Result) return null;

  return (
    <div className="w-full  overflow-y-auto flex gap-4 justify-center flex-col items-center h-full  ">
      <div className="w-full max-w-[1024px] h-full">
      <PlatformManagerColumnChart/>
      </div>
      <div className="grid gap-4 max-w-[1024px] grid-cols-3 grid-rows-1 w-full h-full">
      </div>
    </div>
  );
}
