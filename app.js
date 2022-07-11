const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();
const { Sequelize, DataTypes } = require("sequelize");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const PassportLocal = require("passport-local").Strategy;

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

//Configuracion Passport (Libreria para iniciar session)
app.use(cookieParser("secreto"));
app.use(
  session({
    secret: "secreto",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

//Configuracion de la atentificacion de Passport
passport.use(
  new PassportLocal(async function (username, password, done) {
    const userLogin = await User.findOne({
      where: { username: username, password: password },
    });
    console.log("usuario", userLogin);
    if (userLogin !== null) return done(null, userLogin);

    done(null, false);
  })
);
//Serilizacion del inicio de sesion
passport.serializeUser(function (user, done) {
  console.log("datos serializados", user.dataValues);
  done(null, user.dataValues);
});
//Deserializacion del inicio de sesion
passport.deserializeUser(function (user, done) {
  console.log("datos deserializdos ", user);
  done(null, user);
});

//Creacion de modelos
const Area = sequelize.define("areas", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: DataTypes.STRING,
});

const EstadoTique = sequelize.define(
  "estados_tique",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    estado: {
      type: DataTypes.STRING,
    },
  },
  {
    freezeTableName: true,
  }
);

const EstadoUsuario = sequelize.define(
  "estados_usuario",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    estado: {
      type: DataTypes.STRING,
    },
  },
  {
    freezeTableName: true,
  }
);

const TiposTique = sequelize.define(
  "tipos_tique",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tipo: DataTypes.STRING,
  },
  {
    freezeTableName: true,
  }
);

const TiposUsuario = sequelize.define(
  "tipos_usuario",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tipo: Sequelize.STRING,
  },
  {
    freezeTableName: true,
  }
);

const User = sequelize.define(
  "usuarios",
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

const Tique = sequelize.define(
  "tiques",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
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
    area_id: {
      type: DataTypes.INTEGER,
    },
    tipo_tique_id: {
      type: DataTypes.INTEGER,
    },
    estado_tique_id: {
      type: DataTypes.INTEGER,
    },
    usuario_creador_id: {
      type: DataTypes.INTEGER,
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

//Rutas Aplicacion

app.get(
  "/",
  (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.redirect("/login");
  },
  (req, res) => {
    res.render("ejecutivo-mesa.ejs");
  }
);

app.get("/login", (req, res) => {
  res.render("signup.ejs");
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
  })
);

app.get("/crear-tique", (req, res) => {
  res.render("ejecutivo-mesa.ejs");
});

app.post("/crear-tique", (req, res) => {
  console.log("sesion", req.session);
  const nombre = req.body.nombre;
  const rut = req.body.rut;
  const telefono = req.body.telefono;
  const correo = req.body.correo;
  const criticidad = req.body.criticidad;
  const detalleServicio = req.body.detalleServicio;
  const detalleProblema = req.body.detalleProblema;
  const area = req.body.area;
  const tipoTique = req.body.tipoTique;

  Tique.create({
    nombre_cliente: nombre,
    rut_cliente: rut,
    telefono_cliente: telefono,
    correo_cliente: correo,
    criticidad: criticidad,
    detalle_servicio: detalleServicio,
    detalle_problema: detalleProblema,
    area_id: area,
    tipo_tique_id: tipoTique,
    estado_tique_id: 1,
    usuario_creador_id: req.session.passport.user.id,
  }).catch((err) => {
    if (err) {
      console.log(err);
    }
  });

  res.redirect("/crear-tique");
});

app.get("/jefe-mesa", async (req, res) => {
  const tiques = await Tique.findAll();
  console.log("Todos los tiques", tiques);
  res.render("jefe-mesa.ejs", { tiques: tiques });
});

app.post("/agregar-usuario", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  User.create({
    username: username,
    password: password,
  }).catch((err) => {
    if (err) {
      console.log(err);
    }
  });

  res.redirect("/jefe-mesa");
});

app.post("/eliminar-tique", (req, res) => {
  const id = req.body.id;
  Tique.destroy({
    where: {
      id: id,
    },
  }).catch((err) => {
    console.log(err);
  });

  res.redirect("/jefe-mesa");
});

app.get("/editar/tique/:id", async (req, res) => {
  const id = req.params.id;
  const tiqueEdit = await Tique.findOne({ where: { id: id } });

  console.log("Usuario a editar: ", tiqueEdit);
  res.render("edit-tique.ejs", { tique: tiqueEdit });
});

app.post("/editar-tique", (req, res) => {
  const id = req.body.id;
  const nombre = req.body.nombre;
  const rut = req.body.rut;
  const telefono = req.body.telefono;
  const correo = req.body.correo;
  const criticidad = req.body.criticidad;
  const detalleServicio = req.body.detalleServicio;
  const detalleProblema = req.body.detalleProblema;
  const area = req.body.area;
  const tipoTique = req.body.tipoTique;

  Tique.update(
    {
      nombre_cliente: nombre,
      rut_cliente: rut,
      telefono_cliente: telefono,
      correo_cliente: correo,
      criticidad: criticidad,
      detalle_servicio: detalleServicio,
      detalle_problema: detalleProblema,
      area_id: area,
      tipo_tique_id: tipoTique,
      estado_tique_id: 1,
    },
    {
      where: {
        id: id,
      },
    }
  );

  res.redirect("/jefe-mesa");
});

async function syncAllModels() {
  await sequelize.sync();
  console.log("All models were synchronized successfully.");
}

syncAllModels();

app.listen(3000, (req, res) => {
  console.log("Servidor corriendo en el puerto 3000!");
});
