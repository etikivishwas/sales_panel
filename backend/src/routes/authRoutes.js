const r=require("express").Router(),{login}=require("../controllers/authController");r.post("/login",login);module.exports=r;
