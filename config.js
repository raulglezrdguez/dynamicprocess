var config = {};

config.web = {};
//config.web.port = 443;
config.web.port = 8088;
config.web.host = "localhost";

config.mongoose = {};
config.mongoose.port = 27017;
config.mongoose.host = "localhost";
config.mongoose.db = "dyprocess";

config.upload = {};
config.upload.files = "./build/dyfiles/";
config.upload.images = "./build/dyimages/";

config.admin = {
  name: "Raúl Glez Rdguez",
  email: "raul@correo.cu",
  password: "raulin",
};

config.tprocess = [
  { name: "Estratégico" },
  { name: "Clave" },
  { name: "Operativo" },
  { name: "De soporte" },
];

module.exports = config;
