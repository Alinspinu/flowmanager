if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const app = express();
const ejsMate = require("ejs-mate");
const MongoDbStore = require("connect-mongo");
const methodOverride = require("method-override");
const Locatie = require("./models/locatie");
const Suma = require('./models/suma')
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const apiRoutes = require("./routes/api");
const produsRoutes = require("./routes/produs");
const addIng = require("./routes/ingredient");
const rapoarte = require("./routes/rapoarte");
const locatie = require("./routes/locatie");
const comanda = require("./routes/comanda");
const recipe = require("./routes/recipe")
const helmet = require('helmet');
const helmetConfig = require('./config/helmet')
const createCashRegisterDay = require('./utilities/createDay')

const { isAdmin, isLoggedIn, isUser, isCasier } = require("./middleware");


mongoose.set("strictQuery", false);

const dbCloudUrl = process.env.MONGO_URL_AZURE
const dbLocalUrl = process.env.LOCAL_DB

mongoose.connect(dbCloudUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 60000,
  keepAlive: true,
  maxIdleTimeMS: 60000,
  socketTimeoutMS: 6000
}).then(() => {
  console.log('Conected to Mongo Cloud')
}).catch((error) => {
  console.log('Error connecting Mongo Db Cloud', error)
  connectToLocalMongo()
})

function connectToLocalMongo() {
  return mongoose.connect(dbLocalUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 60000,
    keepAlive: true,
    maxIdleTimeMS: 60000,
    socketTimeoutMS: 6000
  }).then(() => {
    console.log('Conected to Mongo Local')
  }).catch((error) => {
    console.log('Error connecting Mongo Local retry in 3 seconds', error)
    setTimeout(connectToLocalMongo, 3000)
  })
}

const db = mongoose.connection;
db.on("error", (error) => {
  console.log("Connection Error:", error)
  if (error) {
    connectToLocalMongo()
  }
});
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
    mongoUrl: dbLocalUrl,
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

app.use(helmet.contentSecurityPolicy(helmetConfig));

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
app.use("/recipes", recipe)

const bcrypt = require('bcrypt')

app.get("/vanzare", isLoggedIn, async (req, res, next) => {
  const result = await Suma.findOne({ locatie: req.user })
  createCashRegisterDay(req.user)
  // const password = 'miau'
  // const pass = req.user.passowrd
  // const passwordMatch = await bcrypt.compare(password, pass)
  // console.log(passwordMatch)
  res.render("vanzare", { result });
});

app.get("/", async (req, res, next) => {
  res.render("locatie/login");
});



// app.get('/locatie/register', async (req, res, next) => {
//   const pass = ''
//   const locatie = new Locatie({ username: '', platitorTva: false })
//   const registredLocatie = await Locatie.register(locatie, pass)
//   const suma = new Suma({ locatie: locatie._id })
//   const cashRegister = new Register({ locatie: locatie._id })
//   const counter = new Counter({
//     model: 'Bon',
//     locatie: locatie._id
//   })
//   const counter1 = new Counter({
//     model: 'Entry',
//     locatie: locatie._id
//   })
//   await suma.save()
//   await counter.save()
//   await counter1.save()
//   req.login(registredLocatie, err => {
//     if (err) return next(err);
//   })
//   res.send(registredLocatie)

// })

// const Counter = require("./models/counter");
// app.get("/addCounter", async (req, res, next) => {
//   const counter = new Counter({
//     model: "Entry",
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

// app.get('/suma/add', async (req, res, next) => {
//   const suma = new Suma({
//     locatie: req.user
//   })
//   await suma.save()
//   res.send(suma)
// })



app.get('/error', async (req, res, next) => {
  const errorMessage = req.query.message
  console.log(errorMessage)
  res.render('partials/error', { errorMessage })
})

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
