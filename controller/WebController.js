const BusinessSetting = require('../model/BusinessSetting');
const Testimonial = require('../model/Testimonial');
const Blog = require('../model/Blog');
const Faq = require('../model/Faq');
const Helper = require('../config/Helper');
require("dotenv").config();

exports.businessSettingGet = (req,res,next) =>{
    try{
    BusinessSetting.findOne({type:req.body.type},(err,setting)=>{
        if(err){
            res.status(200).json({
            status:false,
            message:"Internal Server Occured!!",
            data:{errors:err}
            });
        }else if(setting==undefined || (setting == '' || setting == null)){
            res.status(200).json({
            status:false,
            message:"No Record Found!!",
            data:{}
            });
        }else {
            var data = setting
            res.status(200).json({
            status:true,
            message:"Record Fetched Successfully!!",
            data:data
            });
        }
    });
    } catch (error) {
        next(error);
    }
}

exports.businessSettingGetAll = async (req,res,next) =>{
    try{
        const data = await BusinessSetting.find({});
        if(data.length > 0){
            res.status(200).json({
            status:true,
            message:"Record Fetched Successfully!!",
            data:data
            });
        }else{
            res.status(200).json({
            status:false,
            message:"No Record Found!!",
            data:data
            });
        }
    } catch (error) {
        next(error);
    }
}

exports.faqList = async (req,res,next) => {
    try {
        const faq = await Faq.find({}).sort({created_at:-1});
        if(faq.length > 0){
            const datas =   faq.map(Helper.getDataObjFaq);
            res.status(200).json({
                status: true,
                message: "Faq List get Successfully!!",
                data:datas,
            });
        }else{
            res.status(200).json({
                status: false,
                message: "No Record Found!!",
                data:{},
            });
        }
    } catch (error) {
        next(error);
    }
}

exports.testimonialList = async (req,res,next) => {
    try {
        const testimonials = await Testimonial.find({status:true}).sort({created_at:-1});
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

exports.blogList = async (req,res,next) => {
    try {
        const blog = await Blog.find({status:true}).sort({created_at:-1});
        if(blog.length > 0){
            const datas =   blog.map(Helper.getDataObjBlog);
            res.status(200).json({status:true,message:'Blog List get Sucessfully!',data:datas});
        }else{
            res.status(200).json({status: false,message: "No Record Found!!",data:{}});
        }
    } catch (error) {
        next(error);
    }
}

