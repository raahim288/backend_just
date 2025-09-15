const express=require('express');

const router=express.Router();

// const {home,raahim}=require('../controolers/auth-controoler')
// OR
const auth_data=require('../controolers/auth-controoler')
router.route('/').get(auth_data.home)

// router.get('/', (req, res) => {
//     res.status(200).send('Welcome to mern series using router screen')
// })



// OR
// router.route('/raahim').get((req,res)=>{
//     res.status(200).send('Welcome to mern series using router screen with 2nd method')
// })


router.route('/raahim').post(auth_data.raahim)

module.exports=router