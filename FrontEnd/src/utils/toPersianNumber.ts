export const toPersianNumber = (num: any) =>
    num.toString().replace(/[0-9]/g, (d : number) => "۰۱۲۳۴۵۶۷۸۹"[d]);
  