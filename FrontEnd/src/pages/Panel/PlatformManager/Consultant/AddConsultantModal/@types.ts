export interface AddConsultantModalProps {
    status : boolean
    onOk? : () =>void
    onOpen? : () => void
    onClose : () => void
}
export interface AddConsultantData {
    username : string
    email : string
    password : string
    bio : string
}