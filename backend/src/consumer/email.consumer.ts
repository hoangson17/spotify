import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import Mail from "src/utils/mail";

@Processor('mailRegister') // tên queue
export class EmailConsumer extends WorkerHost {
    constructor (private readonly mail: Mail) {
        super();
    }

    async process(job: Job, token?: string): Promise<any> {
         const { to, subject,content } = job.data as {
             to:string,
             subject:string,
             content:{ template: string; context?: any }
         }
         try{
            await this.mail.send(to,subject,content.template, content.context);
            console.log(`bắt đầu gửi mail: ${to}`);
            return {}; // tự động xóa job coi là hoàn tích
         }catch(e){
             console.log('gửi email bị lỗi:', e.message);
     console.log(e);
     throw e;
            // throw new Error('gửi mail bị lỗi');
         }
    }
}