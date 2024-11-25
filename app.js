const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = 3000;
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session=require("express-session");
const flash=require("connect-flash");

const Listing = require("./models/listing");
const ExpressError = require("./utils/ExpressError");
const wrapAsync = require("./utils/wrapAsync");
const { ListingSchema, reviewSchema} = require("./schema");
const Review = require("./models/review");

const listing=require("./router/listingg");
const reviews=require("./router/review");
const sessionopt={
    secret : "mysupersecretstring",
    resave : false,
    saveUninitialized : true,
    cookie :
    {
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge :7 * 24 * 60 * 60 * 1000,
        httpOnly : true
    }
};

app.use(methodOverride("_method"));
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.engine("ejs", ejsMate);
app.use(session(sessionopt));
app.use(flash());

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    next();
})


//Database Connection
main()
    .then(() => {
        console.log("connection succesful");
    })
    .catch((err) => {
        console.log(err);
    })


async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}




app.get('/', (req, res) => {
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




app.use("/listing",listing);
app.use("/listing/:id/reviews",reviews);

//Middleware --> Custom Error handler

app.get('*', (req, res, next) => {
    next(new ExpressError(404, "page not found"));
})

app.use((err, req, res, next) => {
    let { status = 500, message = "something went Wrong" } = err;
    // res.status(status).send(message);
    // res.send("It is an error !!");
    res.render("error.ejs", { message });
});


app.listen(port, () => {
    console.log(`running at http://localhost:${port}/listing`);
})