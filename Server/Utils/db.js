const mongoose=require('mongoose')
const bcrypt = require('bcrypt')

mongoose.connect()

const connectDb=async()=>{
try {
    await mongoose.connect
    
} catch (error) {
    console.error('database connection failed')
    process.exit(0)
}
}