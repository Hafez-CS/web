export interface AddManagerModalProps {
    status : boolean
    onOk? : () =>void
    onOpen? : () => void
    onClose : () => void
}
export interface AddManagerData {
    username : string
    email : string
    password : string
    bio : string
}