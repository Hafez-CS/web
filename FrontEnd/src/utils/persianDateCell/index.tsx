import { useConvertPersianDate } from "../../hooks/useConvertPersianDate";

export const PersianDateCell = ({ value }: { value: string }) => {
    const date = useConvertPersianDate(value);
    return <span>{date}</span>;
  };
  