const home = async(req,res) => {
    try {
        res.status(200).send('Welcome to mern series using contrppler screen')
    } catch (error) {
        console.log(error);

    }
}

const raahim = async(req,res) => {
    try {
        console.log(req.body);
        
        res.status(200).json({message : req.body})
    } catch (error) {
        console.log(error);

    }
}





module.exports={home,raahim}