import { Modal, TimePicker, Switch } from "antd";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import gregorian from "react-date-object/calendars/gregorian";

import dayjs from "dayjs";
import { useEffect, useState } from "react";
import type DateObject from "react-date-object";

export interface IPayload {
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface InfoData {
  date: DateObject | null;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: IPayload) => void;

  mode?: "create" | "edit";
  InformationData?: InfoData;
}

const format = "HH:mm";

export default function ScheduleModal({
  open,
  onClose,
  onSubmit,
  mode = "create",
  InformationData = {
    date: null,
    startTime: "00:00",
    endTime: "00:00",
    isActive: false,
  },
}: Props) {
  const [date, setDate] = useState<DateObject | null>(null);
  const [startTime, setStartTime] = useState(dayjs("00:00", format));
  const [endTime, setEndTime] = useState(dayjs("00:00", format));
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!open) return;

    setDate(InformationData.date ?? null);
    setStartTime(dayjs(InformationData.startTime ?? "00:00", format));
    setEndTime(dayjs(InformationData.endTime ?? "00:00", format));
    setIsActive(InformationData.isActive ?? false);
  }, [open]);

  const handleSubmit = () => {
    if (!date) {
      return void toastFallback("لطفاً تاریخ را انتخاب کنید");
    }

    const payload: IPayload = {
      date: date.convert(gregorian).format("YYYY-MM-DD"),
      start_time: startTime.format(format),
      end_time: endTime.format(format),
      is_available: isActive,
    };

    onSubmit(payload);
  };

  function toastFallback(msg: string) {
    try {
      const { toast } = require("react-toastify");
      toast.error(msg);
    } catch {}
  }

  return (
    <Modal
      title={mode === "edit" ? "ویرایش تایم" : "تعریف تایم"}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText={mode === "edit" ? "ویرایش" : "ثبت"}
      cancelText="لغو"
      centered
    >
      <div className="flex flex-col gap-4 mt-4" style={{ direction: "rtl" }}>
        <label>انتخاب تاریخ</label>
        <DatePicker
          value={date}
          onChange={(v) => setDate(v)}
          calendar={persian}
          locale={persian_fa}
          className="bg-white w-full"
        />

        <label>ساعت شروع</label>
        <TimePicker
          value={startTime}
          format={format}
          className="w-full"
          onChange={(v) => v && setStartTime(v)}
        />

        <label>ساعت پایان</label>
        <TimePicker
          value={endTime}
          format={format}
          className="w-full"
          onChange={(v) => v && setEndTime(v)}
        />

        <label>وضعیت</label>
        <Switch
          checked={isActive}
          onChange={setIsActive}
          checkedChildren="فعال"
          unCheckedChildren="غیرفعال"
        />
      </div>
    </Modal>
  );
}
