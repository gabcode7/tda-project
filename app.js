const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();
const { Sequelize, DataTypes } = require("sequelize");

//Conexion Base de datos
const sequelize = new Sequelize("mydb", "root", "", {
  host: "localhost",
  dialect: "mariadb",
});

//Probar Base de datos
async function testDatabase() {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

testDatabase();

//Creacion de modelo
const Tique = sequelize.define(
  "tiques",
  {
    rut_cliente: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nombre_cliente: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    telefono_cliente: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    correo_cliente: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    detalle_problema: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    detalle_servicio: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    criticidad: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

//Modules Config

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get("/", (req, res) => {
  res.render("signup.ejs");
});

app.get("/crear-tique", (req, res) => {
  res.render("ejecutivo-mesa.ejs");
});

app.post("/crear-tique", (req, res) => {
  const nombre = req.body.nombre;
  const rut = req.body.rut;
  const telefono = req.body.telefono;
  const correo = req.body.correo;
  const criticidad = req.body.criticidad;
  const detalleServicio = req.body.detalleServicio;
  const detalleProblema = req.body.detalleProblema;

  Tique.create({
    nombre_cliente: nombre,
    rut_cliente: rut,
    telefono_cliente: telefono,
    correo_cliente: correo,
    criticidad: criticidad,
    detalle_servicio: detalleServicio,
    detalle_problema: detalleProblema,
  }).catch((err) => {
    if (err) {
      console.log(err);
    }
  });

  res.redirect("/crear-tique");
});

app.listen(3000, (req, res) => {
  console.log("Servidor corriendo en el puerto 3000!");
});
