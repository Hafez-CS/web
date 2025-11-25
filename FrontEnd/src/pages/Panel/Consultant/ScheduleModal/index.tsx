import { Modal, TimePicker, Switch } from "antd"
import DatePicker from "react-multi-date-picker"
import persian from "react-date-object/calendars/persian"
import persian_fa from "react-date-object/locales/persian_fa"
import gregorian from "react-date-object/calendars/gregorian"

import dayjs from "dayjs"
import { useState } from "react"
import type DateObject from "react-date-object"

import { useMutation } from "@tanstack/react-query"
import { useAdminConsulation } from "../../../../services/consultations/adminConsultations.service"
import { toast } from "react-toastify"
import { queryClient } from "../../../../App"

interface IPayload {
  date: string
  start_time: string
  end_time: string
  is_available: boolean
}

interface Props {
  open: boolean
  onClose: () => void
  onSubmit?: (data: IPayload) => void
  type: "package" | "single"
}

const format = "HH:mm"

export default function ScheduleModal({ open, onClose, onSubmit, type }: Props) {
  const { SetConsultantTime, SetPackageConsultantTime } = useAdminConsulation()

  const [date, setDate] = useState<DateObject | null>(null)
  const [startTime, setStartTime] = useState(dayjs("00:00", format))
  const [endTime, setEndTime] = useState(dayjs("00:00", format))
  const [isActive, setIsActive] = useState(true)


  const mutation = useMutation({
    mutationFn: (data: IPayload) =>
      type === "single"
        ? SetConsultantTime(data)
        : SetPackageConsultantTime(data),

    onSuccess: () => {
      toast.success("تایم مشاوره با موفقیت ثبت شد")
      queryClient.invalidateQueries({queryKey : ['ConsulationListData']})
      onClose()
    },

    onError: (error : any) => {
      console.log("🚀 ~ ScheduleModal ~ error:", error)
      toast.error(error.response.data.non_field_errors[0] || "تیم تکراری" ||"خطا در ثبت تایم مشاوره")
    },
  })

  const handleSubmit = () => {
    if (!date) {
      toast.error("لطفاً تاریخ را انتخاب کنید")
      return
    }

    const miladi = date.convert(gregorian).format("YYYY-MM-DD")

    const payload: IPayload = {
      date: miladi,
      start_time: startTime.format(format),
      end_time: endTime.format(format),
      is_available: isActive,
    }

   
    onSubmit?.(payload)

    
    mutation.mutate(payload)
  }

  return (
    <Modal
    title={"تعریف تایم"}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="ثبت"
      cancelText="لغو"
      confirmLoading={mutation.isPending}
      centered
    >
      <div className="flex flex-col gap-4 mt-4" style={{ direction: "rtl" }}>

        <label className="text-sm text-gray-700">انتخاب تاریخ</label>
        <DatePicker
          value={date}
          onChange={(v) => setDate(v)}
          calendar={persian}
          locale={persian_fa}
          calendarPosition="bottom-right"
          className="bg-white shadow-sm rounded-md w-full"
        />

        <label className="text-sm text-gray-700">ساعت شروع</label>
        <TimePicker
          value={startTime}
          format={format}
          className="w-full"
          onChange={(t) => setStartTime(t)}
        />

        <label className="text-sm text-gray-700">ساعت پایان</label>
        <TimePicker
          value={endTime}
          format={format}
          className="w-full"
          onChange={(t) => setEndTime(t)}
        />

        <label className="text-sm text-gray-700">وضعیت</label>
        <Switch
          checked={isActive}
          onChange={setIsActive}
          checkedChildren="فعال"
          unCheckedChildren="غیرفعال"
        />
      </div>
    </Modal>
  )
}
