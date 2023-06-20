const Faq = require('../model/Faq');
const Helper = require('../config/Helper');
var FaqController = {};

FaqController.add = (req,res,next) => {
    try {
        const faq = new Faq({ 
            question: req.body.question,
            answer: req.body.answer,
            status: req.body.status,
            added_by:req.user
        });
        
        faq.save().then(() => {
            var data = faq;
            res.status(200).json({
                status: true,
                message: "Faq Added Successfully!!",
                data:data,
            });
        }).catch((error) => {
            res.status(200).json({
                status: false,
                message: "Some Error Occured!!",
                data:{},
            });
        });
    } catch (error) {
        next(error);
    }
}

FaqController.list = async (req,res,next) => {
    try {
        const faq = await Faq.find().sort({created_at:-1});
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

FaqController.edit = (req,res) => {
    Faq.findOne({_id:req.body.id},(err,faq)=>{
        if(err){
            res.status(200).json({
                status: false,
                message: "Some Error Occured!!",
                data:{errors:err},
            });
        }else if(faq==undefined){
            res.status(200).json({
                status: false,
                message: "No Record Found!!",
                data:{},
            });
        }else {
            var data = faq
            res.status(200).json({
                status: true,
                message: "Faq data get Successfully!!",
                data:data,
            });
        }
    })
}


FaqController.update = (req,res) => {
    Faq.findOne({_id:req.body.id},(err,faq)=>{
        if(err){
            res.status(200).json({
                status: false,
                message: "Some Error Occured!!",
                data:{errors:err},
            });
        }else if(faq==undefined){
            res.status(200).json({
                status: false,
                message: "No Record Found!!",
                data:{},
            });
        }else {
            Faq.findOneAndUpdate({_id:req.body.id},{$set:
                {
                    //type_id: req.body.type_id,
                    question: req.body.question,
                    answer: req.body.answer,
                    status: req.body.status,
                }
            }).exec((err,ChangeRes)=>{
                Faq.findOne({_id:req.body.id},(err,faq)=>{
                    res.status(200).json({
                        status: true,
                        message: "Faq Updated Successfully!!",
                        data:faq,
                    });
                });
            });   
        }
    });
}

FaqController.delete = (req,res) => {
    Faq.findOne({_id:req.body.id},(err,faq)=>{
        if(err){
            res.status(200).json({
                status: false,
                message: "Some Error Occured!!",
                data:{errors:err},
            });
        }else if(faq==undefined){
            res.status(200).json({
                status: false,
                message: "No Record Found!!",
                data:{},
            });
        }else {
            Faq.deleteOne({_id:req.body.id},(err,faq)=>{
                if(err){
                    res.status(200).json({
                        status: false,
                        message: "Some Error Occured!!",
                        data:{errors:err},
                    });
                }else {
                    res.status(200).json({
                        status: true,
                        message: "Faq Deleted Successfully!!",
                        data:{},
                    });
                }
            });
        }
    })
}

module.exports = FaqController