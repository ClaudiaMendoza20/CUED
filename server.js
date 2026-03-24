const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("../Database/system.db");

app.get("/", (req,res)=>{
    res.send("Servidor funcionando");
});

app.listen(3000, ()=>{
    console.log("Servidor en http://localhost:3000");
});