import { useQuery } from '@tanstack/react-query'
import { PlatformAdmin } from '../../../../services/platformAdmin/platformadmin.service'

import { Button } from 'antd'
import { useState } from 'react'
import AddManagerModal from './AddManagerModal'
import ManagerList from './TableList'


export default function PlatformAdminManager() {
  
     const [isModalOpen , setIsModalOpen] = useState(false)
        const { GetAdminManagerList} = PlatformAdmin()
        const {data :ConsultantListData} = useQuery({
            queryKey : ["ManagerListPanelManager"],
            queryFn : GetAdminManagerList
        })
        console.log("🚀 ~ PlatformAdminManager ~ ConsultantListData:", ConsultantListData)
    
        
      return (
        <>
        <div className='flex w-full flex-col'>
            <div className='flex justify-between items-center'>
                <h1 className='text-3xl font-bold'>مدیران</h1>
                <Button onClick={()=>setIsModalOpen(p => !p)}  color='green'>افزودن مدیر</Button>
            </div>
        <ManagerList DataSource={ConsultantListData}   />
        <AddManagerModal status={isModalOpen} onClose={()=>setIsModalOpen(false)} />
        </div>
        </>
      
  )
}
