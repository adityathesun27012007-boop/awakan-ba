
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const mysql=require("mysql2");
const multer=require("multer");
require("dotenv").config();
const akn = express();

akn.use(cors());
akn.use(express.json());
const upload=multer({

storage:multer.memoryStorage()

})
//REGISTER PAGE ROUTE
akn.post("/R1", async (req, res) => {

    let user = req.body.username;
    let pass = req.body.password;
    let cityy = req.body.city;

    try {

        const hpass = await bcrypt.hash(pass, 10);

        console.log("Username:", user);
        console.log("Password:", hpass);
        console.log("City:", cityy);

        res.status(200).send("Data received successfully");

        connetion.query(`insert into Users(username,hpass,city)values("${user}","${hpass}","${cityy}")`,
            (err)=>{
                if(err){
                    console.log(err);
                }
                else{
                    console.log("siperr");
                }
            }
        )
    } catch (err) {

        console.log(err);
        res.status(500).send("error");

    }

});


//SERVER ROUTE
akn.listen(4000, () => {
    console.log("Server running on port 4000");
});

//LOGIN PAGE ROUTE
akn.post("/L1", (req, res) => {

    let user = req.body.u;
    let pass = req.body.p;

    connetion.query(
        "SELECT id, hpass FROM Users WHERE username = ?",
        [user],
        async (err, resp) => {

            if (err) {
                console.log(err);
                return res.status(500).send("Database Error");
            }
            if (resp.length === 0) {
                return res.status(401).json({
                   success: false,
                message: "Invalid username or password"
                });
        }

            try {

                const Hpass = resp[0].hpass;
                const uid = resp[0].id;

                const ress = await bcrypt.compare(pass, Hpass);

                if (ress) {
                    return res.json({
                        success: true,
                        uid: uid
                    });
                }

                return res.status(401).json({
                    success: false,
                    message: "Invalid username or password"
                });

            } catch (error) {
                console.log(error);
                return res.status(500).send("Server Error");
            }
        }
    );
});

//CFEED PAGE ROUTE
akn.post("/CF",async(req,res)=>{
let title=req.body.p1;
let des=req.body.p2;
let uid=req.body.p3;
console.log(title);
console.log(des);
console.log(uid);
res.send("got it");
connetion.query(`insert into Cfeed(uid,ctitle,cdes)values("${uid}","${title}","${des}")`,async(err)=>{
if (err){
    console.log(err);
}
})})
//CSNAPS PAGE ROUTE
akn.post("/CS",upload.single("imageinput"),async(req,res)=>{
    

let ct=req.body.titleinput;
let cd=req.body.descinput;
let uid=req.body.p3;

const iname=req.file.originalname;
const img=req.file.buffer;
console.log(req.body);
console.log(req.file);

console.log(ct);
console.log(cd);


connetion.query(`insert into CSnaps(uid,ctitle,cdes,iname,img)values("${uid}","${ct}","${cd}",?,?)`,[iname, img],
    (err,resp)=>{
if(err){
return res.status(500).send("errpr");
}
res.send("got it");
    }

)    
})
/*DATABASE CONNECTION
const connetion=mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"awakan2007",
    database:"A1"

});*/


//RETRIVE DATA TO USER HOME ROUTE

akn.get("/USER/:id", (req, res) => {

    connetion.query(
        "SELECT * FROM Users WHERE id = ?",
        [req.params.id],
        (err, resp) => {

            if (err) {
                return res.status(500).send("Error");
            }

            if (resp.length === 0) {
                return res.status(404).send("User not found");
            }

            res.json(resp[0]);
        }
    );

});
//CFEED fetch ROUTE
akn.get("/FEEDFETCH",(req,res)=>{



connetion.query(`SELECT Users.username,Cfeed.ctitle,Cfeed.cdes,Users.city
         FROM Cfeed
         INNER JOIN Users
         ON Cfeed.uid = Users.id`,(err,rest)=>{

if(err){
    return res.status(500).send(err);
}

res.json(rest);


});


});
//CSNAPS fetch route
akn.get("/CSNAPFETCH", (req, res) => {

    connetion.query(
        `SELECT Users.username,
                Users.city,
                CSnaps.id,
                CSnaps.uid,
                ctitle,
                cdes,
                iname,
                img
         FROM CSnaps
         INNER JOIN Users
         ON CSnaps.uid = Users.id`,
        (err, result) => {

            if (err) {
                console.log(err);
                return res.status(500).send(err);
            }

            const snaps = result.map(post => ({
                name: post.username,
                city: post.city,
                id: post.id,
                uid: post.uid,
                title: post.ctitle,
                desc: post.cdes,
                image: post.img
                    ? `data:image/jpeg;base64,${post.img.toString("base64")}`
                    : null
            }));

            res.json(snaps);
        }
    );
});
// AIVEN CONNETCION
const fs = require("fs");

const connetion = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    ssl: {
        ca: fs.readFileSync("./ca.pem")
    }
});

//test the connection
connetion.connect((err)=>{
if(err){
    console.log(err);
}
else{
    console.log("connectedo");
}


})


//check backened..


akn.get("/", (req, res) => {
    res.send("Backend is running!");
});


