import { useCallback, useMemo, useState } from "react";
import { Button, Table, Popconfirm } from "antd";
import DateObject from "react-date-object";
// import persian from "react-date-object/calendars/persian";

import { useAdminConsulation } from "../../../../services/consultations/adminConsultations.service";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { IConsultantItem } from "./@types";
import { CheckCircleTwoTone, CloseCircleOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import ScheduleModal, { type IPayload } from "../ScheduleModal";
import { PersianDateCell } from "../../../../utils/persianDateCell";

export default function ScheduleList() {
  const { ConsulationList, DeleteConsultantTime, EditConsultantTime ,  } =
    useAdminConsulation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<IConsultantItem | null>(null);

  const {
    data: ConsulationListData,
    refetch: RefetchTableData,
    isLoading,
  } = useQuery({
    queryKey: ["ConsulationListData"],
    queryFn: ConsulationList,
    staleTime: 1000 * 60,
  });


  const DeleteConsultant = useMutation({
    mutationFn: DeleteConsultantTime,
    onSuccess: () => {
      toast.success("تایم با موفقیت حذف شد");
      RefetchTableData();
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.error || "خطای ناشناخته";
      toast.error(msg);
    },
  });


  const EditConsultant = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: IPayload }) =>
      EditConsultantTime(id, payload),
    onSuccess: () => {
      toast.success("ادیت با موفقیت انجام شد");
      RefetchTableData();
      setIsModalOpen(false);
      setEditItem(null);
    },
    onError: (error: any) => {
      console.error("Edit error:", error);
      const msg =
        error?.response?.data?.non_field_errors?.[0] ||
        error?.response?.data?.detail || 
        error?.response?.data?.error
        "خطا در انجام ادیت";
      toast.error(msg);
    },
  });

 
  const handleEdit = useCallback((item: IConsultantItem) => {
    setEditItem(item);
    setTimeout(() => setIsModalOpen(true), 0);
  }, []);

  const handleDelete = useCallback((id: number) => {
    DeleteConsultant.mutate(id);
  }, []);

  const columns = useMemo(
    () => [
      { title: "شناسه", dataIndex: "id", key: "id" },

      {
        title: "تاریخ",
        dataIndex: "date",
        key: "date",
        render: (value: string) => {
          return(
            <PersianDateCell value={value}/>

          )
        },
      },

      { title: "ساعت شروع", dataIndex: "start_time", key: "start_time" },
      { title: "ساعت پایان", dataIndex: "end_time", key: "end_time" },

      {
        title: "وضعیت",
        dataIndex: "is_available",
        key: "is_available",
        render: (_: any, d: IConsultantItem) =>
          d.is_available ? <CheckCircleTwoTone /> : <CloseCircleOutlined />,
      },

      {
        title: "وضعیت رزور",
        dataIndex: "is_booked",
        key: "is_booked",
        render: (_: any, d: IConsultantItem) =>
          d.is_booked ? <CheckCircleTwoTone /> : <CloseCircleOutlined />,
      },

      {
        title: "ساعت ساخت",
        dataIndex: "created_at",
        key: "created_at",
        render: (value: string) => {
          return(

            <PersianDateCell value={value}/>
          )
        },
      },

      {
        title: "عملیات",
        key: "action",
        render: (_: any, d: IConsultantItem) => (
          <div className="flex gap-1">
            <Button onClick={() => handleEdit(d)} type="primary">
              ویرایش
            </Button>

            <Popconfirm
              title="آیا مطمئن هستید؟"
              onConfirm={() => handleDelete(d.id)}
              okText="بله"
              cancelText="خیر"
            >
              <Button danger loading={DeleteConsultant.isPending}>
                حذف
              </Button>
            </Popconfirm>
          </div>
        ),
      },
    ],
    [handleEdit, handleDelete, DeleteConsultant.isPending]
  );

  return (
    <>
      <Table
        columns={columns}
        dataSource={ConsulationListData ?? []}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
        scroll={{ y: 520 }}
      />

      {isModalOpen && editItem && (
        <ScheduleModal
          mode="edit"
          open={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditItem(null);
          }}
        
          InformationData={{
            date: new DateObject(editItem.date),
            startTime: editItem.start_time,
            endTime: editItem.end_time,
            isActive: editItem.is_available,
          }}
          onSubmit={(payload: IPayload) => {
            if (!editItem?.id) {
              toast.error("آیدی انتخاب نشده!");
              return;
            }
            EditConsultant.mutate({ id: editItem.id, payload });
          }}
        />
      )}
    </>
  );
}
