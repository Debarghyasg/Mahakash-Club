const express = require('express');
const app = express();
const path = require('path');
const port=3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.get("/",(req,res)=>{
    res.render("index.ejs");
});

app.get("/ventures",(req,res)=>{
    res.render("ventures.ejs");
});
app.get("/team",(req,res)=>{
    res.render("team.ejs");
});
app.get("/about",(req,res)=>{
    res.render("about.ejs");
});
// app.get("/contact",(req,res)=>{
//     res.render("contactmb.ejs");
// });













app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});