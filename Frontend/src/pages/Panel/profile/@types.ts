export interface IMenu {
    id : number
    name : string
    path : string
    icon? : string
}

export const MenuItems : IMenu[] = [
    {id : 1 , name : "پروفایل" , path : "/profile" , icon : "ri-profile-line"},
    {id : 2 , name : "پیشخوان" , path : "/reception" , icon : "ri-archive-drawer-line"},
    {id : 3 , name : "دستیار" , path : "/assistant" , icon : "ri-customer-service-2-line"},
    {id : 4 , name : "آزمون ها" , path : "/exams" , icon : "ri-contract-line"},
    {id : 5 , name : "مشاوره" , path : "/counseling" , icon : "ri-guide-line"},
    {id : 6 , name : "تنظیمات" , path : "/setting" , icon : "ri-window-line"}

]