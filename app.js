const express=require("express");
const app=express();
const mongoose=require("mongoose");
const port=3000;
const Listing=require("./models/listing");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const ExpressError=require("./utils/ExpressError");
const wrapAsync = require("./utils/wrapAsync");



app.use(methodOverride("_method"));
app.set("views",path.join(__dirname,"/views"));
app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({ extended : true}));
app.set("view engine","ejs");
app.engine("ejs",ejsMate);


//Database Connection
main()
.then(()=>{
    console.log("connection succesful");
})
.catch((err)=>{
    console.log(err);
})


async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

app.get('/',(req,res)=>{
    res.send("Home Route");
})

// app.get('/listing', async (req,res)=>{
//     let list=new Listing(
//         {
//             title :"My new villa",
//             description : "this is a new villa",
//             price : 2500,
//             location : "AP",
//             country : "India"
//         }
//     );
//     await list.save()
//     .then((res)=>{
//         console.log(res);
//     })
// })


//Index Route
app.get("/listing",wrapAsync(async (req,res)=>{
    let lists = await Listing.find({});
    res.render('./listings/all.ejs',{ lists });
}));

//New Route
app.get('/listing/new',(req,res)=>{
    res.render('./listings/new.ejs');
});



//Show route
app.get('/listing/:id',wrapAsync(async (req,res)=>{
    let { id }=req.params;
    let lists=await Listing.findById(id);
    res.render('./listings/show.ejs',{ lists });
}))

app.post('/listing',wrapAsync(async (req,res)=>{
        // let { newtitle,newdescription,newimage,newprice,newlocation,newcountry }=req.body;
        // let list=await new Listing({
        //     title : newtitle,
        //     description :newdescription,
        //     image : newimage,
        //     price :newprice,
        //     location :newlocation,
        //     country : newcountry
        // });
        if(!req.body.listing)
        {
            throw new ExpressError(404,"Error occured");
        }
        if (isNaN(price)) {
            throw new ExpressError(400, "Error: Price must be a valid number.");
        }
        let list=new Listing(req.body.listing);
        console.log(list);
        list.save().then(()=>{
            console.log("data saved");
        });
        res.redirect('/listing');       
}));


app.get('/listing/:id/edit',wrapAsync(async (req,res)=>{
    let { id }=req.params;
    let lists=await Listing.findById(id);
    res.render('./listings/edit.ejs',{ lists })
}))

app.put('/listing/:id',wrapAsync(async(req,res)=>{
    if(!req.body.listing)
        {
            throw new ExpressError(404,"Error occured");
        }
    let { id }=req.params;
    let list=await Listing.findByIdAndUpdate(id,{...req.body.listing});
    console.log(list);
    res.redirect(`/listing/${id}`);
}))


app.delete('/listing/:id',wrapAsync(async(req,res)=>{
    let { id }=req.params;
    let list=await Listing.findByIdAndDelete(id);
    console.log(list);
    res.redirect('/listing');
}))


//Middleware --> Custom Error handler

app.get('*',(req,res,next)=>{
    next(new ExpressError (404,"page not found"));
})

app.use((err,req,res,next)=>{
    let { status=500 , message="something went Wrong" }=err;
    // res.status(status).send(message);
    // res.send("It is an error !!");
    res.render("error.ejs", { message });
});


app.listen(port,()=>{
    console.log(`running at http://localhost:${ port }/listing`);
})