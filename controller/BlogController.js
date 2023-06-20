const Blog = require('../model/Blog');
const Helper = require("../config/Helper");
var BlogController = {};

BlogController.add = async (req,res,next) => {
    try {
        const file = req?.files?.image;
        if(file === undefined){
            res.status(200).json({
                status:false,
                message:"Please Provide Image!!",
                data:{}
            });
        }
        Helper.imageUploadS3(file.tempFilePath,'blog/'+Date())
        .then(async (location)=>{
            const blog = new Blog({ 
                title: req.body.title,
                thumbnail: location,
                description: req.body.description,
                shortDescription: req.body.shortDescription,
                status: req.body.status,
                added_by:req.user
            });
            
            blog.save().then(() => {
                var data = blog;
                res.status(200).json({status:true,message:'Blog Added Sucessfully!',data:data});
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

BlogController.list = async (req,res,next) => {
    try {
        const blogs = await Blog.find().sort({created_at:-1});
        if(blogs.length > 0){
            const datas =   blogs.map(Helper.getDataObjBlog);
            res.status(200).json({status:true,message:'Blog List get Sucessfully!',data:datas});
        }else{
            res.status(200).json({status: false,message: "No Record Found!!",data:{}});
        }
    } catch (error) {
        next(error);
    }
}

BlogController.edit = (req,res,next) => {
    try {
        Blog.findOne({_id:req.body.id},(err,blog)=>{
            if(err){
                res.status(200).json({status: false,message: "Some Error Occured!!",data:{errors:err}});
            }else if(blog==undefined){
                res.status(200).json({status: false,message: "No Record Found!!",data:{}});
            }else {
                var data = blog
                res.status(200).json({status:true,message:'Blog data get Sucessfully!',data:data});
            }
        })
    } catch (error) {
        next(error);
    }
}


BlogController.update = (req,res) => {
    try {
        Blog.findOne({_id:req.body.id},(err,blog)=>{
            if(err){
                res.status(200).json({status: false,message: "Some Error Occured!!",data:{errors:err}});
            }else if(blog==undefined){
                res.status(200).json({status: false,message: "No Record Found!!",data:{}});
            }else {
                const file = req?.files?.image;
                if(file === undefined){
                    Blog.findOneAndUpdate({_id:req.body.id},{$set:
                        {
                            title: req.body.title,
                            description: req.body.description,
                            shortDescription: req.body.shortDescription,
                            status: req.body.status,
                        }
                    }).exec((err,ChangeRes)=>{
                        Blog.findOne({_id:req.body.id},(err,blog)=>{
                            res.status(200).json({status:true,message:'Blog Updated Sucessfully!',data:blog});
                        });
                    });
                }else{
                    Helper.imageUploadS3(file.tempFilePath,'blog/'+Date())
                    .then(async (location)=>{
                        Blog.findOneAndUpdate({_id:req.body.id},{$set:
                            {
                                title: req.body.title,
                                thumbnail: location,
                                description: req.body.description,
                                shortDescription: req.body.shortDescription,
                                status: req.body.status
                            }
                        }).exec((err,ChangeRes)=>{
                            Blog.findOne({_id:req.body.id},(err,blog)=>{
                                res.status(200).json({status:true,message:'Blog Updated Sucessfully!',data:blog});
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

BlogController.delete = (req,res,next) => {
    try {
        Blog.findOne({_id:req.body.id},(err,blog)=>{
            if(err){
                res.status(200).json({status: false,message: "Some Error Occured!!",data:{errors:err}});
            }else if(blog==undefined){
                res.status(200).json({status: false,message: "No Record Found!!",data:{}});
            }else {
                Blog.deleteOne({_id:req.body.id},(err,blog)=>{
                    if(err){
                        res.status(200).json({status: false,message: "Some Error Occured!!",data:{errors:err}});
                    }else {
                        res.status(200).json({status:true,message:'Blog Deleted Sucessfully!',data:{}});
                    }
                });
            }
        })
    } catch (error) {
        next(error);
    }
}

module.exports = BlogController