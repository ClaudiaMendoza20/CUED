const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

/* ===============================
   CONEXION MYSQL
================================ */

const db = mysql.createConnection({

host:"localhost",
user:"root",
password:"",
database:"cued"

});

db.connect(err=>{

if(err){
console.log("Error DB:",err);
}else{
console.log("MySQL conectado");
}

});

/* ===============================
   DASHBOARD
================================ */

app.get("/api/dashboard",(req,res)=>{

let data={}

db.query("SELECT COUNT(*) total FROM proyectos",(e,r)=>{

data.proyectos=r[0].total

db.query(`
SELECT
(SELECT COUNT(*) FROM electrico)+
(SELECT COUNT(*) FROM hvac)+
(SELECT COUNT(*) FROM hidraulico)+
(SELECT COUNT(*) FROM incendios)
AS total
`,(e,r)=>{

data.calculos=r[0].total

db.query("SELECT COUNT(*) total FROM cotizaciones",(e,r)=>{

data.cotizaciones=r[0].total

db.query(`
SELECT nombre,area,progreso
FROM proyectos
ORDER BY id DESC
LIMIT 5
`,(e,r)=>{

data.recientes=r

res.json(data)

})

})

})

})

})

/* ===============================
   PROYECTOS
================================ */

app.get("/api/proyectos",(req,res)=>{

db.query("SELECT * FROM proyectos ORDER BY id DESC",(e,r)=>{

res.json(r)

})

})

app.post("/api/proyectos",(req,res)=>{

let {nombre,area,progreso}=req.body

db.query(

"INSERT INTO proyectos(nombre,area,progreso) VALUES(?,?,?)",
[nombre,area,progreso],

(e,r)=>{

res.json({ok:true})

}

)

})

/* ===============================
   CALCULO ELECTRICO
================================ */

app.post("/api/electrico",(req,res)=>{

let {watts,voltaje,fases}=req.body

let corriente=0

if(fases=="Monofasico"){

corriente=watts/voltaje

}else{

corriente=watts/(voltaje*1.732)

}

let calibre=""

if(corriente<15) calibre="14 AWG"
else if(corriente<20) calibre="12 AWG"
else if(corriente<30) calibre="10 AWG"
else if(corriente<40) calibre="8 AWG"
else calibre="6 AWG"

let proteccion=Math.ceil(corriente/10)*10+"A"

db.query(
"INSERT INTO electrico(watts,voltaje,fases,corriente,calibre,proteccion) VALUES(?,?,?,?,?,?)",
[watts,voltaje,fases,corriente,calibre,proteccion]
)

res.json({

corriente:corriente.toFixed(2),
calibre,
proteccion

})

})

/* ===============================
   HVAC
================================ */

app.post("/api/hvac",(req,res)=>{

let {area,altura}=req.body

let volumen=area*altura

let btu=volumen*200

let ton=btu/12000

db.query(
"INSERT INTO hvac(area,altura,btu,ton) VALUES(?,?,?,?)",
[area,altura,btu,ton]
)

res.json({

btu:Math.round(btu),
ton:ton.toFixed(2)

})

})

/* ===============================
   HIDRAULICO
================================ */

app.post("/api/hidraulico",(req,res)=>{

let {gasto,diametro}=req.body

let area=Math.PI*(diametro/2)*(diametro/2)

let velocidad=gasto/area

db.query(
"INSERT INTO hidraulico(gasto,diametro,velocidad) VALUES(?,?,?)",
[gasto,diametro,velocidad]
)

res.json({

velocidad:velocidad.toFixed(2)

})

})

/* ===============================
   CONTRA INCENDIOS
================================ */

app.post("/api/incendios",(req,res)=>{

let {area}=req.body

let rociadores=Math.ceil(area/12)

db.query(
"INSERT INTO incendios(area,rociadores) VALUES(?,?)",
[area,rociadores]
)

res.json({

rociadores

})

})

/* ===============================
   COTIZACIONES
================================ */

app.post("/api/cotizacion",(req,res)=>{

let {cliente,proyecto,total}=req.body

db.query(

"INSERT INTO cotizaciones(cliente,proyecto,total) VALUES(?,?,?)",
[cliente,proyecto,total],

(e,r)=>{

res.json({ok:true})

}

)

})

app.get("/api/cotizaciones",(req,res)=>{

db.query("SELECT * FROM cotizaciones ORDER BY id DESC",(e,r)=>{

res.json(r)

})

})

/* ===============================
   USUARIOS
================================ */

app.post("/api/usuarios",(req,res)=>{

let {nombre,email,password}=req.body

db.query(

"INSERT INTO usuarios(nombre,email,password) VALUES(?,?,?)",
[nombre,email,password],

(e,r)=>{

res.json({ok:true})

}

)

})

app.get("/api/usuarios",(req,res)=>{

db.query("SELECT id,nombre,email FROM usuarios",(e,r)=>{

res.json(r)

})

})

/* ===============================
   SERVER
================================ */

app.listen(3000,()=>{

console.log("Servidor corriendo en http://localhost:3000")

})