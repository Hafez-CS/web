
export interface IMenu {
    id : number
    name : string
    path : string
    icon? : string
}

export interface IProfileItems {
    id : number
    title : string
    
}

export const MenuItems : IMenu[] = [
    {id : 1 , name : "پروفایل" , path : "/profile" , icon : "ri-profile-line"},
    {id : 2 , name : "پیشخوان" , path : "/reception" , icon : "ri-archive-drawer-line"},
    {id : 3 , name : "دستیار" , path : "/assistant" , icon : "ri-customer-service-2-line"},
    {id : 4 , name : "آزمون ها" , path : "/exams" , icon : "ri-contract-line"},
    {id : 5 , name : "مشاوره" , path : "/counseling" , icon : "ri-guide-line"},
    {id : 6 , name : "تنظیمات" , path : "/setting" , icon : "ri-window-line"}
]

export const ProfileItems : IProfileItems[] = [
    {id :1 , title : "نام کاربری" },
    {id : 3 , title : "ایمیل"},
    {id :2 , title : "بیوگرافی" },
]

export interface IForm {
    username : string
    email : string 
    bio : string

}
export interface IForm2 {
    id : number 
    label : string
    name : string
}
export const FormData : IForm2[]  = [
    {id : 1 , label : "نام کاربری" ,name : "username"},
    {id : 2 , label : "ایمیل" ,name : "email"},
    {id : 3 , label : "بیوگرافی" ,name : "bio"},
]
