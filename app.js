import express from "express";
import path from 'path';
import fs from "fs";
import { fileURLToPath } from 'url';
import expressLayouts from "express-ejs-layouts";

//route imports
import healthConnect from './backend/routes/healthConnect.js';
import db from './backend/routes/db.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()
const port = process.env.PORT || 8100;

app.use(express.json());

// EJS + Layouts
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "frontend/views"));
app.use(expressLayouts);
app.set("layout", "layouts/default");
app.use(express.static(path.join(__dirname, "frontend")));

//Frontend
app.use("/js", express.static("./frontend/js"));
app.use("/css", express.static("./frontend/css"));
app.use("/images", express.static("./frontend/assets/images"));
app.use("/videos", express.static("./frontend/assets/videos"));
app.use("/fonts", express.static("./frontend/assets/fonts"));
app.use("/views", express.static("./frontend/views"));

//Backend
app.use("/config", express.static("./backend/config"));
app.use('/api/healthConnect', healthConnect);
app.use('/api/db', db);


function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const autoRouteDir = path.join(process.cwd(), "./frontend/views/autoRoute");

const definedRoutes = new Set();

// Auto-register .ejs views as routes
fs.readdirSync(autoRouteDir).forEach(file => {
  const ext = path.extname(file);
  const name = path.basename(file, ext);

  if (ext === ".ejs") {
    const route = `/${name}`;
    if (!definedRoutes.has(route)) {
      app.get(route, (req, res) => {
        res.render(`autoRoute/${name}`, {
          layout: "layouts/default",
          title: capitalizeFirst(name),
          pageCSS: `/css/${name}.css`,
          pageJS: `/js/${name}.js`,
          showNav: true,
          showFooter: true
        });
      });
      definedRoutes.add(route);
    }
  }
});

//Manual param routes
app.get("/", (req, res) => {
  res.render("index", {
    title: "Index",
    pageCSS: false,
    pageJS: false,
    showNav: false,
    showFooter: false
  });
});

app.get("/login", (req, res) => {
  res.render("login", {
    title: "Login",
    pageCSS: "/css/login.css",
    pageJS: "/js/login.js",
    showNav: false,
    showFooter: false
  });
});


app.get("/register", (req, res) => {
  res.render("register", {
    title: "Register",
    pageCSS: "/css/register.css",
    pageJS: "/js/register.js",
    showNav: false,
    showFooter: false
  });
});

app.get("/*dummy404", (req, res) => {
  res.render("./layouts/default", {
    title: "404",
    pageCSS: "/css/404.css",
    pageJS: false,
    body : "<h1>Error: 404 Page not found</h1>",
    showNav: true,
    showFooter: true
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
