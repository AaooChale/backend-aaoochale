const jwt = require("jsonwebtoken");
const AWS = require('aws-sdk');
const Ride = require('../model/rideModel');
const fs = require('fs');
const Token = require("../model/fireBaseSchema");
const notificationController = require("../notification/notificationController");
const firebase = require("../notification/firebase");
const nearbyCities = require("nearby-cities");
const axios = require('axios');
const Helper = {};


Helper.response=(rescode,message,data,res)=>{
    data = (JSON.stringify(data)==='{}') ? [] : data;
    const status = rescode == 200 ? true : false;
    res.status(200).json({data:data,message:message,status:status});
}

Helper.bookingExpireTime = () =>{
    return 5;
}

Helper.dateFormatting =  (timestamp)=>{
    const currentDate = new Date(timestamp);
    const currentDayOfMonth = currentDate.getDate();
    const currentMonth = currentDate.getMonth(); // Be careful! January is 0, not 1
    const currentYear = currentDate.getFullYear();
    const currentDay = currentDate.getDay();
    const dateString = Helper.dayName(currentDay) +" "+currentDayOfMonth + " " + (Helper.monthName(currentMonth)) + " " + currentYear;
    return dateString;
}

Helper.timeFormatting =  (timestamp)=>{
    const currentDate = new Date(timestamp);
    const currentHour = currentDate.getHours();
    const currentMinute = currentDate.getMinutes();
    // const currentSeconds = currentDate.getSeconds();
    const dateString = currentHour + ":" + currentMinute;
    return dateString;
}



Helper.monthName = (key) =>{
    const months = ['Jan','Feb','Mar','Apr','May','June','July','Aug','Sept','Oct','Nov','Dec'];
    return months[key];
}

Helper.dayName = (key) =>{
    const daysName = ['Sun','Mon','Tue','Wed','Thus','Fri','Sat'];
    return daysName[key];
}

Helper.signToken = (id) => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

//AWS S3 image Upload Configuration
Helper.s3 = new AWS.S3({
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRETE_ACCESS_KEY,
});

//AWS S3 Image Upload 
Helper.imageUploadS3 = async (imagePath,imageName) =>{
    const base64FilePath = await Helper.getBase64File(imagePath,'base64');
    const base64Data = new Buffer.from(base64FilePath.replace(/^data:image\/\w+;base64,/, ""), 'base64');

    const type = base64FilePath.split(';')[0].split('/')[1];
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `${imageName}.${type}`, // type is not required
      Body: base64Data,
      ACL: 'public-read',
      ContentEncoding: 'base64', // required
      ContentType: `image/${type}` // required. Notice the back ticks
    }
    let location = '';
    let key = '';
    const { Location, Key } = await Helper.s3.upload(params).promise();
    location = Location;
    key = Key;
    return location;
}

//File Encoding
Helper.getBase64File = (imagePath,encoder) => "data:image/gif;base64,"+fs.readFileSync(imagePath, encoder);

Helper.getDayWithCalculate = (totalTime)=>{
    var res = {
      day:0,
      hour:0,
      minutes:0,
    }
    var timeArray = totalTime.split(" day ");
    timeArray.map((t)=>{
      if(t.slice(-1) == 'm' || t.slice(-1)=='h'){
        if(t.slice(-1) == "m"){
          hm = t.substring(0, t.length-1).split("h");
          res.hour = hm[0];
          res.minutes = hm[1];
        }else{
          res.hour = t.substring(0, t.length-1);
        }
      }else{
        res.day = t;
      }
    });
    return  res;
  }


Helper.sendRatingNotifictaion = async () => {
    const date = new Date();
    date.setDate(date.getDate - 7);
    const rides = await Ride.aggregate([
        {$lookup:
            {
                from:"bookedrides",
                localField:"_id",
                foreignField:"ride",
                as:"bookedRide"
            }
        },
        {$lookup:
            {
                from:"ratings",
                localField:"_id",
                foreignField:"rideId",
                as:"rating"
            }
        },
        {$match:{tripDate:{$gte:date},tripDate:{$lte:new Date()}}}
    ]);
    rides.map((r)=>{
        tDate = r.tripDate;
        tTime =r.tripTime;
        date = new Date(tDate).getDate();
        month = new Date(tDate).getMonth()+1;
        year = new Date(tDate).getFullYear();
        hour = new Date(tTime).getHours();
        minutes = new Date(tTime).getMinutes();
        seconds = new Date(tTime).getSeconds();
        var totalTIme = Helper.getDayWithCalculate(r.totalTime);
        var chkDate = new Date(year+'/'+month+'/'+date+' '+hour+':'+minutes+':'+seconds);
        chkDate.setDate(chkDate.getDate()+(Number(totalTIme.day)+7));
        chkDate.setHours(chkDate.getHours()+Number(totalTIme.hour));
        chkDate.setMinutes(chkDate.getMinutes()+Number(totalTIme.minutes));
        if((new Date(year+'/'+month+'/'+date+' '+hour+':'+minutes+':'+seconds) <= new Date()) && (new Date(chkDate) >= new Date())) {
            r.bookedRide.map(async (b)=>{
                rUser = r.rating.map((rat)=>rat.userId.toString());
                if(!rUser.includes(b.user.toString()) && b.status != 'Cancel'){
                    var message = `Please rate your travel experience with aaoochale for your ride from ${r.startLocation} to ${r.endLocation} on ${Helper.dateFormatting(r.tripDate)} ${Helper.timeFormatting(r.tripTime)}`;
                    await notificationController.postNotificationSelf(b.user, "Self", message,"TravelRatingAlert");
                    if (b.user) {
                        var content = {
                            title: "Travel Rating Alert",
                            body: message,
                            image: "https://www.bft.org/assets/1/13/rider_alert2.jpg",
                            click_action:"SOMEACTION",
                        };
                        const key = await Helper.GetToken(b.user);

                        if (key != "") {
                            var firebaseres = await firebase.sendNotification(key, content);
                        }
                    }
                }
            });
        }
    });
}

Helper.GetToken = async (userId) => {
    const list = await Token.findOne({ user_id: userId });
    if (list != null) {
      return list.token;
    } else {
      var token = "";
      return token;
    }
};

Helper.distanceCount = (latitude1, longitude1, latitude2, longitude2, units)=> {
    var p = 0.017453292519943295; //This is  Math.PI / 180
    var c = Math.cos;
    var a =
      0.5 -
      c((latitude2 - latitude1) * p) / 2 +
      (c(latitude1 * p) * c(latitude2 * p) * (1 - c((longitude2 - longitude1) * p))) / 2;
    var R = 6371; //  Earth distance in km so it will return the distance in km
    var dist = 2 * R * Math.asin(Math.sqrt(a));
    return dist;
}

Helper.cityRadius = (lat,lng) => {
    const query = {latitude: lat, longitude: lng};
    const cities = nearbyCities(query);
    const slicedCities = cities.slice(1,21);
    var avgDistance = 0;
    const data = slicedCities.map( (c)=>{
        dist = Helper.distanceCount(lat,lng,c.lat,c.lon);
        avgDistance += dist;
        d=  {...c,distance:dist};
        return d;
    });
    return Number(avgDistance/10);
}

Helper.getDataObjFaq =   (faqs) => {  
    const faq={
        "_id":faqs._id,
        "type_id":faqs.type_id,
        "question":faqs.question,
        "answer":faqs.answer,
        // "type_name":(faqs.type_data == '') ? '' : faqs.type_data[0].name,
        // "type_page":(faqs.type_data == '') ? '' : faqs.type_data[0].page,
        "status":faqs.status,
        "added_by":(faqs.user == undefined) ? 'Admin' : faqs.user[0].name ,
        "created_at":faqs.created_at,
        "updated_at":faqs.updated_at,
    }
    return faq;
}

Helper.getDataObjTestimonial = (testimonial) => {  
    const testimonials={
        "_id":testimonial._id,
        "name":testimonial.name,
        "designation":testimonial.designation,
        "review":testimonial.review,
        "image":testimonial.image,
        "status":testimonial.status,
        "added_by":(testimonial.user == undefined) ? 'Admin' : testimonial.user[0].name ,
        "created_at":testimonial.created_at,
        "updated_at":testimonial.updated_at,
    }
    return testimonials;
}


Helper.getDataObjBlog = (blog) => {  
    const blogs={
        "_id":blog._id,
        "title":blog.title,
        "thumbnail":blog.thumbnail,
        "description":blog.description,
        "shortDescription":blog.shortDescription,
        "status":blog.status,
        "added_by":(blog.user == undefined) ? 'Admin' : blog.user[0].name ,
        "created_at":blog.created_at,
        "updated_at":blog.updated_at,
    }
    return blogs;
}

Helper.sendWhatsappNotification = async (to,template_name,params) => {
    let data = JSON.stringify({
        "type": "template",
        "to": to,
        "content": {
            "template_name": template_name,
            "language": "en",
            "params": params,
            "ttl": "P1D"
        }
    });

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://webpostservice.com/api_v2.0/whatsapp/v1.0/index.php/dreamplaT/messages',
        headers: { 
            'Authorization': 'Bearer ZHJlYW1wbGFUOkg5WmlCRFZJ', 
            'Content-Type': 'application/json'
        },
        data : data
    };

    axios.request(config)
    .then((response) => {
        console.log(JSON.stringify(response.data));
    })
    .catch((error) => {
        console.log(error);
    });
}

module.exports = Helper;