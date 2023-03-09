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
const helmet = require('helmet')

const { isAdmin, isLoggedIn, isUser, isCasier } = require("./middleware");

mongoose.set("strictQuery", false);

const dbUrl = process.env.MONGO_URL_AZURE

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
  secret: process.env.SECRET,
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



const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
  "https://code.jquery.com",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/css/bootstrap.min.css",
  "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.2/font/bootstrap-icons.css",
  "https://kit-free.fontawesome.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
];
const fontSrcUrls = [
  "https://fonts.googleapis.com/",
  "https://fonts.gstatic.com",
  "https://cdn.jsdelivr.net",
];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      mediaSrc: ["https://res.cloudinary.com/"],
      connectSrc: [
        "http://localhost:3000/",
        "https://flowmanager.ro"
      ],
      formAction: ["'self'", "https://checkout.stripe.com"],
      scriptSrcAttr: ["'unsafe-inline'"],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      frameSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://www.youtube.com",
        "https://js.stripe.com",
        "https://www.facebook.com",
      ],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/dhetxk68c/",
        "https://images.unsplash.com/",
        "https://q.stripe.com",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);




app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://www.flowmanager.ro');
  next();
});


app.use("/api", apiRoutes);
app.use("/produs", produsRoutes);
app.use("/ingredient", addIng);
app.use("/rapoarte", rapoarte);
app.use("/locatie", locatie);
app.use("/comanda", comanda);

app.get("/vanzare", isLoggedIn, isCasier, (req, res, next) => {
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

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
  console.log(
    "Welcome to POS App. Open the browser at: http://localhost/3000 and enjoy a free app!"
  );
});
