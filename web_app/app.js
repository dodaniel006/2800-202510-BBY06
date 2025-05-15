import "dotenv/config"; // Load environment variables from .env file FIRST
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import expressLayouts from "express-ejs-layouts";
import session from "express-session";
import MongoStore from "connect-mongo";

//route imports
import healthConnect from "./backend/routes/healthConnect.js";
import db from "./backend/routes/db.js";
import files from "./backend/routes/files.js";
import game from "./backend/routes/game.js";
import task from "./backend/routes/task.js";
import user from "./backend/routes/user.js";
import diary from "./backend/routes/diary.js";
import gym from "./backend/routes/gym.js";
import authRouter from "./backend/routes/authentication.js"; // Import authRouter

// Model imports
import { connectToMongo } from "./backend/config/db.js";
import Food from "./backend/config/db_schemas/Food.js";
import Task from "./backend/config/db_schemas/Task.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8100;

const TTL = 60 * 60;

const sessionStore = MongoStore.create({
  mongoUrl: process.env.MONGODB_URI,
  collectionName: "sessions",
  ttl: TTL,
  autoRemove: "native",
  dbName: "Japples",
  crypto: {
    secret: process.env.SESSION_SECRET,
  },
});

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: TTL * 1000,
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    },
  })
);

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
app.use("/files", express.static("./frontend/assets/files"));

//Backend
app.use(express.urlencoded({ extended: false }));
app.use("/config", express.static("./backend/config"));
app.use("/api/diary", diary);
app.use("/api/healthConnect", healthConnect);
app.use("/api/db", db);
app.use("/api/game", game);
app.use("/api/task", task);
app.use("/api/files", files);
app.use("/api/gym", gym);
app.use("/api/user", user);
app.use("/api/auth", authRouter); // Use authRouter for /api/auth routes

const lifecycle = process.env.npm_lifecycle_event;

if (!["dev", "server"].includes(lifecycle)) {
  app.use((req, res, next) => {
    const frontendRoutes = ["/", "/login", "/initDB", "/register", "/files/health_connect.apk"];

    if (!req.session.authenticated && !frontendRoutes.includes(req.path)) {
      return res.redirect("/login");
    }

    if (
      req.session.authenticated &&
      ["/", "/login", "/register"].includes(req.path)
    ) {
      return res.redirect("/home");
    }

    next();
  });
} else {
  console.log(
    "⚠️ Route protection is disabled (running via npm run dev/server)"
  );
}

async function startServer() {
  try {
    await connectToMongo(); // Connect to MongoDB
    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start the server:", error);
    process.exit(1); // Exit if cannot connect to DB or start server
  }
}

startServer(); // Call the async function to start the server

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const defaultSettings = {
  pageCSS: false,
  pageJS: false,
  showNav: true,
  showFooter: true,
  mapPage: false,
};

function createSettings(userSettings) {
  let settings = Object.assign({}, defaultSettings, userSettings);
  return settings;
}

const autoRouteDir = path.join(process.cwd(), "./frontend/views/autoRoute");

const definedRoutes = new Set();

// Auto-register .ejs views as routes
fs.readdirSync(autoRouteDir).forEach((file) => {
  const ext = path.extname(file);
  const name = path.basename(file, ext);
  console.log("Loaded: " + name + ext);

  if (ext === ".ejs") {
    const route = `/${name}`;
    if (!definedRoutes.has(route)) {
      app.get(route, (req, res) => {
        let settings = createSettings({
          title: capitalizeFirst(name),
          layout: "layouts/default",
          pageCSS: `/css/${name}.css`,
          pageJS: `/js/${name}.js`,
        });
        res.render(`autoRoute/${name}`, settings);
      });
      definedRoutes.add(route);
    }
  }
});

//Manual param routes
app.get("/", (req, res) => {
  let settings = createSettings({
    title: "Index",
    showNav: false,
    showFooter: false,
  });
  res.render("index", settings);
});

app.get("/login", (req, res) => {
  let settings = createSettings({
    title: "Login",
    pageCSS: "/css/login.css",
    pageJS: "/js/login.js",
    showNav: false,
    showFooter: false,
  });
  res.render("login", settings);
});

app.get("/register", (req, res) => {
  let settings = createSettings({
    title: "Register",
    pageCSS: "/css/register.css",
    pageJS: "/js/register.js",
    showNav: false,
    showFooter: false,
  });
  res.render("register", settings);
});

app.get("/diary", async (req, res) => {
  // Connect to MongoDB and fetch food list
  await connectToMongo();

  // Get today's midnight (start of day)
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  // Get end of today (start of next day)
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  // Find food entries for the current user created today
  const foodList = await Food.find({
    userId: req.session.userId,
    createdAt: { $gte: startOfDay, $lt: endOfDay },
  });

  let settings = createSettings({
    title: "Diary",
    pageCSS: "/css/diary.css",
    pageJS: "/js/diary.js",
    foodList: foodList,
  });
  res.render("diary", settings);
});

app.get("/gymLog", (req, res) => {
  let settings = createSettings({
    title: "Gym Log",
    pageCSS: "/css/gymLog.css",
    pageJS: "/js/gymLog.js",
    mapPage: true,
  });
  res.render("gymLog", settings);
});

app.get("/*dummy404", (req, res) => {
  let body = `<div class=\"h-100 d-flex flex-column justify-content-center text-center\"><h1 class=\"mb-0\">Error: 404 Page not found</h1><br>
              <a href=\"/home\">Go Back Home</a></div>`;
  let settings = createSettings({
    title: "404",
    body: body,
  });
  res.render("./layouts/default", settings);
});
