const express = require("express");
const router = express.Router();

router.get("*",(req,res)=>{
    res.status(404).send(req.url + "page not found");
})

module.exports = router ;