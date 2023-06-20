const Testimonial = require('../model/Testimonial');
const Helper = require("../config/Helper");
var TestimonialController = {};

TestimonialController.add = async (req,res,next) => {
    try {
        const file = req?.files?.image;
        if(file === undefined){
            res.status(200).json({
                status:false,
                message:"Please Provide Image!!",
                data:{}
            });
        }
        Helper.imageUploadS3(file.tempFilePath,'testimonial/'+Date())
        .then(async (location)=>{
            const testimonial = new Testimonial({ 
                name: req.body.name,
                image: location,
                designation: req.body.designation,
                review: req.body.review,
                status: req.body.status,
                added_by:req.user
            });
            
            testimonial.save().then(() => {
                var data = testimonial;
                res.status(200).json({status:true,message:'Testimonial Added Sucessfully!',data:data});
            }).catch((error) => {
                res.status(200).json({status: false,message: "Some Error Occured!!",data:{errors:error}});
            });
        }).catch((err)=>{
          res.status(200).json({
            status:false,
            message:"Some Error Occured!!",
            data:{errors:err}
          });
        });
    } catch (error) {
        next(error);
    }
}

TestimonialController.list = async (req,res,next) => {
    try {
        const testimonials = await Testimonial.find().sort({created_at:-1});
        if(testimonials.length > 0){
            const datas =   testimonials.map(Helper.getDataObjTestimonial);
            res.status(200).json({status:true,message:'Testimonial List get Sucessfully!',data:datas});
        }else{
            res.status(200).json({status: false,message: "No Record Found!!",data:{}});
        }
    } catch (error) {
        next(error);
    }
}

TestimonialController.edit = (req,res,next) => {
    try {
        Testimonial.findOne({_id:req.body.id},(err,testimonial)=>{
            if(err){
                res.status(200).json({status: false,message: "Some Error Occured!!",data:{errors:err}});
            }else if(testimonial==undefined){
                res.status(200).json({status: false,message: "No Record Found!!",data:{}});
            }else {
                var data = testimonial
                res.status(200).json({status:true,message:'Testimonial Data get Sucessfully!',data:data});
            }
        })
    } catch (error) {
        next(error);
    }
}


TestimonialController.update = (req,res) => {
    try {
        Testimonial.findOne({_id:req.body.id},(err,testimonial)=>{
            if(err){
                res.status(200).json({status: false,message: "Some Error Occured!!",data:{errors:err}});
            }else if(testimonial==undefined){
                res.status(200).json({status: false,message: "No Record Found!!",data:{}});
            }else {
                const file = req?.files?.image;
                if(file === undefined){
                    Testimonial.findOneAndUpdate({_id:req.body.id},{$set:
                        {
                            name: req.body.name,
                            designation: req.body.designation,
                            review: req.body.review,
                            status: req.body.status,
                        }
                    }).exec((err,ChangeRes)=>{
                        Testimonial.findOne({_id:req.body.id},(err,testimonial)=>{
                            res.status(200).json({status:true,message:'Testimonial Updated Sucessfully!',data:testimonial});
                        });
                    });
                }else{
                    Helper.imageUploadS3(file.tempFilePath,'testimonial/'+Date())
                    .then(async (location)=>{
                        Testimonial.findOneAndUpdate({_id:req.body.id},{$set:
                            {
                                name: req.body.name,
                                image: location,
                                designation: req.body.designation,
                                review: req.body.review,
                                status: req.body.status,
                            }
                        }).exec((err,ChangeRes)=>{
                            Testimonial.findOne({_id:req.body.id},(err,testimonial)=>{
                                res.status(200).json({status:true,message:'Testimonial Updated Sucessfully!',data:testimonial});
                            });
                        });
                    }).catch((err)=>{
                        res.status(200).json({
                            status:false,
                            message:"Some Error Occured!!",
                            data:{errors:err}
                        });
                    });
                }   
            }
        });
    } catch (error) {
        next(error);
    }
}

TestimonialController.delete = (req,res,next) => {
    try {
        Testimonial.findOne({_id:req.body.id},(err,testimonial)=>{
            if(err){
                res.status(200).json({status: false,message: "Some Error Occured!!",data:{errors:err}});
            }else if(testimonial==undefined){
                res.status(200).json({status: false,message: "No Record Found!!",data:{}});
            }else {
                Testimonial.deleteOne({_id:req.body.id},(err,testimonial)=>{
                    if(err){
                        res.status(200).json({status: false,message: "Some Error Occured!!",data:{errors:err}});
                    }else {
                        res.status(200).json({status:true,message:'Testimonial Deleted Sucessfully!',data:{}});
                    }
                });
            }
        })
    } catch (error) {
        next(error);
    }
}

module.exports = TestimonialController