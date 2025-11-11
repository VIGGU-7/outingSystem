import {model,Schema} from 'mongoose'
const guardSchema=new Schema({
    guardId:{
        type:String,
        required:[true,"guardId is required"]
    },
    name:{
        type:String,
        required:[true,"Name is required"],
    
    },
    email:{
        type:String,
        required:[true,"Email is required !"],
        unique:true,
        validate:{
            validator:(value)=>{/^\S+@\S+\.\S+$/.test(value)},
            message:(props)=>`${props.value} is invalid email`
        }
    },
    password:{
        type:String,
        required:[true,"Password is required"],
        minLength:[8,"Password must be atleast 8 characters"]
    }
    
},{timestamps:true})
export const guardModel=model("Guard",guardSchema)