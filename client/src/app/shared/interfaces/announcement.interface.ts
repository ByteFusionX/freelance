export interface announcementPostData {
    title:String | null | undefined;
    description:String | null | undefined;
    date:Date | null | undefined;
    userId :String | null | undefined;
}

export interface announcementGetData {
    _id: string
    title: string
    description: string
    date: Date
    createdDate: Date,
    celeb: boolean
    viewedBy:string[]
  }
  
  