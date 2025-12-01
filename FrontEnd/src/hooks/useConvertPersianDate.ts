import { useMemo } from "react";
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";

export const useConvertPersianDate = (value: string | null | undefined) => {
  const persianDate = useMemo(() => {
    if (!value) return "-";

    try {
      const date = new DateObject(value);
      const converted = date.convert(persian);
      return converted.format("YYYY/MM/DD");
    } catch {
      return "-";
    }
  }, [value]);

  return persianDate;
};
