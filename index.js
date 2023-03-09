if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const ExpressError = require("./utilities/expressError");
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const app = express();
const ejsMate = require("ejs-mate");
const MongoDbStore = require("connect-mongo");
const methodOverride = require("method-override");
const Produs = require("./models/produs");
const Locatie = require("./models/locatie");
const localStorage = require("local-storage");
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const apiRoutes = require("./routes/api");
const produsRoutes = require("./routes/produs");
const addIng = require("./routes/ingredient");
const rapoarte = require("./routes/rapoarte");
const locatie = require("./routes/locatie");
const comanda = require("./routes/comanda");

const { isAdmin, isLoggedIn, isUser, isCasier } = require("./middleware");

mongoose.set("strictQuery", false);

const dbUrl = "mongodb+srv://Alin:espsOCn7sllc@cluster0.m2r9yun.mongodb.net/?retryWrites=true&w=majority";
// process.env.MONGO_URL_ALINZ
mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 60000,
  keepAlive: true,
  maxIdleTimeMS: 60000,
  socketTimeoutMS: 60000

});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const sessionConfig = {
  store: MongoDbStore.create({
    mongoUrl: dbUrl,
    autoRemove: "interval",
    autoRemoveInterval: 10,
  }),
  secret: process.env.SECRET || "HlA71dvjIigafyX^N0CpA4PK*4$VXl8",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(flash());
app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(Locatie.authenticate()));

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.session = req.session;
  next();
});

app.use("/api", apiRoutes);
app.use("/produs", produsRoutes);
app.use("/ingredient", addIng);
app.use("/rapoarte", rapoarte);
app.use("/locatie", locatie);
app.use("/comanda", comanda);

app.get("/vanzare", isLoggedIn, isCasier, (req, res, next) => {
  console.log(req.user)
  res.render("vanzare");
});

app.get("/", async (req, res, next) => {
  res.render("locatie/login");
});



// app.get('/locatie/register', async (req, res, next) => {
//   const pass = 'true'
//   const locatie = new Locatie({ username: 'true', platitorTva: })
//   const registredLocatie = await Locatie.register(locatie, pass)
//   req.login(registredLocatie, err => {
//     if (err) return next(err);
//   })
//   res.send(registredLocatie)

// })

// const Counter = require("./models/counter");
// app.get("/addCounter", async (req, res, next) => {
//   const counter = new Counter({
//     model: "Bon",
//     locatie: req.user._id,
//   });
//   await counter.save();
//   console.log(counter);
// });

// const Gestiune = require('./models/gestiune')

// app.get('/gestiune/add', async (req, res, next) => {
//   const gst = new Gestiune({
//     nume: 'Principala',
//     locatie: "63e6a49d3120f663c6a11611"
//   })
//   await gst.save()
//   res.send(gst)
// })

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "O Noo! Something went wrong!";
  console.log(err.stack);
  res.status(statusCode).render("error", { err });
});

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
  console.log(
    "Welcome to POS App. Open the browser at: http://localhost/3000 and enjoy a free app!"
  );
});
