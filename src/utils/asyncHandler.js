//this is a helper file 
const asyncHandler=(requestHandler)=>{
    return (req,res,next) =>{
        Promise.resolve(requestHandler(req,res,next)).catch((err)=> next(err))
    }
}

 

export default asyncHandler 


//way of try and catch method 
// const asyncHandler=(fn)=> async (requestAnimationFrame,resizeBy,next) =>{
//     try{
//         await fn(req,resizeBy,next)

//     }catch(error){
//         resizeBy.status(err.code||500).json({
//             success:false,
//             message:err.message
//         })
//     }
// }