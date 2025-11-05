import jwt from 'jsonwebtoken'
export const genToken=(_id)=>{
    if(!_id){
        return null;
    }
    const token=jwt.sign({id:_id},process.env.JWT_SECRET,{
        expiresIn: '7d',
    })
    return token;
}