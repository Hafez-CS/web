
import { useQuery } from '@tanstack/react-query'
import { PlatformAdmin } from '../../../../services/platformAdmin/platformadmin.service'
import ConsultantList from './TableList'
import { Button } from 'antd'
import { useState } from 'react'
import AddConsultantModal from './AddConsultantModal'


export default function ConsultantPanelManager() {
    const [isModalOpen , setIsModalOpen] = useState(false)
    const {GetAdminConsultantList} = PlatformAdmin()
    const {data :ConsultantListData} = useQuery({
        queryKey : ["consultantListPanelManager"],
        queryFn : GetAdminConsultantList
    })

    
  return (
    <>
    <div className='flex w-full flex-col'>
        <div className='flex justify-between items-center'>
            <h1 className='text-3xl font-bold'>مشاوران</h1>
            <Button onClick={()=>setIsModalOpen(p => !p)}  color='green'>افزودن مشاور</Button>
        </div>
    <ConsultantList DataSource={ConsultantListData}   />
    <AddConsultantModal status={isModalOpen} onClose={()=>setIsModalOpen(false)} />
    </div>
    </>
  )
}
