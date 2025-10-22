import * as bcrypt from 'bcrypt';
const saltRounds = 10;

export default class Hash{
    static make(password :string){
        return bcrypt.hashSync(password, saltRounds);
    }

    static compare(password:string, hash:string){
        return bcrypt.compareSync(password,hash);
    }
}