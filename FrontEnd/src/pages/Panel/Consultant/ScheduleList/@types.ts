export interface IConsultantItem 
    {
        id: number,
        consultant: number,
        consultant_name: string,
        date: string,
        start_time: string,
        end_time: string,
        is_available: boolean,
        is_booked: boolean,
        can_modify: boolean,
        created_at: string
      }
export const Schedulecolumns = [
    {
      title: 'شناسه',
      dataIndex: 'id',
      key: 'id',
      
    },
    {
      title: 'شناسه مشاور',
      dataIndex: 'consultant',
      key: 'consultant',
    },
    {
      title: 'نام مشاور',
      dataIndex: 'consultant_name',
      key: 'consultant_name',
    },
    {
        title: 'تاریخ',
        dataIndex: 'date',
        key: 'date',
      },
      {
        title: 'ساعت شروع',
        dataIndex: 'start_time',
        key: 'start_time',
      },
      {
        title: 'ساعت پایان',
        dataIndex: 'end_time',
        key: 'end_time',
      },
      {
        title: 'وضعیت',
        dataIndex: 'is_available',
        key: 'is_available',
      },
      {
        title: 'وضعیت رزور',
        dataIndex: 'is_booked',
        key: 'is_booked',
        
      },
      {
        title: 'قابل تغیر؟',
        dataIndex: 'can_modify',
        key: 'can_modify',
      },
      {
        title: 'ساعت ساخت',
        dataIndex: 'created_at',
        key: 'created_at',
      },
  ];