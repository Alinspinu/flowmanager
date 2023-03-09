const Locatie = require("../models/locatie");
const Nota = require("../models/nota");
const Categorie = require("../models/categorie");
const Counter = require("../models/counter");
const Ingredient = require("../models/ingredient");
const Produs = require("../models/produs");
const crypto = require("crypto");
const Client = require('../models/client')
const mongoose = require('mongoose');


module.exports.locatieLogin = async (req, res, next) => {
  const nume = req.user.username;
  req.flash("success", `Bine ai venit în ${cap(nume)}`);
  res.redirect("/locatie/user/login");
};

module.exports.locatieLogout = (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next();
    }
    req.flash("success", `Te-ai delogat cu succes! La revedere!`);
    res.redirect("/");
  });
};

module.exports.renderUserLogin = (req, res) => {
  res.render("locatie/loginUser");
};

module.exports.userLogin = async (req, res, next) => {
  const locatieId = req.user._id;
  const { username, parola } = req.body.user;
  const locatie = await Locatie.findById(locatieId);
  const nestedUser = locatie.nestedUsers.find((user) => user.username === username);
  if (nestedUser) {
    const isMatch = comparePasswords(parola, nestedUser.parola);
    if (isMatch) {
      req.session.userId = nestedUser._id
      req.session.userAdmin = parseInt(nestedUser.admin)
      if (nestedUser.admin === 2) {
        req.flash(
          "success",
          `Salut ${cap(nestedUser.nume)}, bine ai venit la ${cap(req.user.username)} aici este pagina unde vei primi comenzi!`
        );
        res.redirect('/comanda/barista')
      } else if (nestedUser.admin === 3) {
        req.flash(
          "success",
          `Salut ${cap(nestedUser.nume)}, bine ai venit la ${cap(req.user.username)} aici este pagina unde vei primi comenzi!`
        );
        res.redirect('/comanda/bucatarie')
      } else {
        req.flash(
          "success",
          `Salut ${cap(nestedUser.nume)}, bine ai venit la ${cap(req.user.username)} aici este modulul de vanzare!`
        );
        res.redirect("/vanzare");
      }
    } else {
      req.flash("error", "Datele de logare sunt incorecte");
      res.redirect("back");
    }
  } else {
    req.flash("error", "Datele de logare sunt incorecte");
    res.redirect("back");
  }
};

module.exports.renderUserRegister = (req, res) => {
  res.render("locatie/registerUser");
};

module.exports.userRegister = async (req, res, next) => {
  const locatieId = req.user._id;
  const { parola, nume, admin, username, email, confirmPassword } = req.body.user;
  const locatie = await Locatie.findById(locatieId);
  if (parola !== confirmPassword) {
    req.flash('error', 'Parolele nu sunt la fel')
    return res.redirect('/locatie/user/register')
  }

  const existingUser = locatie.nestedUsers.find(user => user.usernume === username);
  if (existingUser) {
    req.flash('error', `Numele ${nume} este deja folosit, încearcă altceva!`)
    return res.redirect('/locatie/user/register')
  }

  const admin1 = parseInt(admin)
  let functie = ''
  if (admin1 === 0) {
    functie = 'Casier'
  } else if (admin1 === 1) {
    functie = "Admin"
  } else if (admin1 === 2) {
    functie = 'Barista'
  } else if (admin1 === 3) {
    functie = "Bucatar"
  }
  const hashedPassword = hashPassword(parola);
  const newUser = {
    nume: nume,
    parola: hashedPassword,
    functie: functie,
    admin: parseInt(admin),
    username: username,
    email: email || "loser"
  };
  req.session.userId = newUser._id
  req.session.userAdmin = parseInt(admin)
  req.session.userNume = newUser.nume;
  locatie.nestedUsers.push(newUser);
  await locatie.save();
  if (newUser.admin === 2) {
    req.flash(
      "success",
      `Salut ${cap(nume)}, bine ai venit la ${cap(locatie.nume)} aici este pagina unde vei primi comenzi!`
    );
    return res.redirect('/comanda/barista')
  } else if (newUser.admin === 3) {
    req.flash(
      "success",
      `Salut ${cap(nume)}, bine ai venit la ${cap(locatie.nume)} aici este pagina unde vei primi comenzi!`
    );
    return res.redirect('/comanda/bucatarie')
  } else if (newUser.admin === 0) {
    req.flash(
      "success",
      `Salut ${cap(nume)}, bine ai venit la ${cap(locatie.nume)} aici este modulul de vanzare!`
    );
    res.redirect("/vanzare");
  }
};

module.exports.renderUsers = async (req, res, next) => {
  const locatieId = req.user._id;
  const locatie = await Locatie.findById(locatieId);
  const users = locatie.nestedUsers;
  res.render("locatie/users", { users, locatie });
};

module.exports.renderEdit = async (req, res, next) => {
  const username = req.params.id;
  const locatieId = req.user._id;
  const locatie = await Locatie.findById(locatieId);
  const user = locatie.nestedUsers.find((user) => user.username === username);
  const dateFirma = locatie.dateFirma;
  res.render("locatie/userEdit", { user, dateFirma });
};

module.exports.userEdit = async (req, res, next) => {
  const userN = req.params.id;
  const { nume, parola, admin, username, email, confirmPassword } = req.body.user;
  const locatieId = req.user._id;
  const locatie = await Locatie.findById(locatieId);
  const user = locatie.nestedUsers.find((user) => user.username === userN);
  if (parola) {
    if (parola !== confirmPassword) {
      req.flash('error', 'Parolele nu sunt la fel')
      return res.redirect('back')
    }
    const hashedPassword = hashPassword(parola);
    user.parola = hashedPassword;
  }
  if (admin) {
    user.admin = admin;
  }
  user.nume = nume;
  user.username = username;
  if (email) {
    user.email = email
  }
  user.email = email;
  const admin1 = parseInt(admin)
  let functie = ''
  if (admin1 === 0) {
    functie = 'Casier'
  } else if (admin1 === 1) {
    functie = "Admin"
  } else if (admin1 === 2) {
    functie = 'Barista'
  } else if (admin1 === 3) {
    functie = "Bucatar"
  }
  user.functie = functie
  locatie.markModified("nestedUsers");
  await locatie.save();
  res.redirect("/locatie/show");
};

module.exports.userDelete = async (req, res, next) => {
  const { id } = req.params;
  const locatieId = req.user._id;
  const locatie = await Locatie.findById(locatieId);
  const userIndex = locatie.nestedUsers.findIndex((user) => user.usernume === id);
  locatie.nestedUsers.splice(userIndex, 1);
  await locatie.save();
  req.flash("success", `Ai șters cu success pe ${cap(id)}!`);
  res.redirect("/locatie/show");
};

module.exports.userLogout = async (req, res, next) => {
  req.session.userId = null;
  req.session.userAdmin = null;
  req.flash("succes", "Bye, Bye Now!");
  res.redirect("/locatie/user/login");
};

module.exports.addFirma = async (req, res, next) => {
  const locatieId = req.user._id;
  const locatie = await Locatie.findById(locatieId);
  locatie.dateFirma = req.body.firma;
  await locatie.save();
  req.flash("success", `Ai adaugat cu success firma ${req.body.firma.nume}!`);
  res.redirect("/locatie/show");
};

module.exports.addClient = async (req, res, next) => {
  const locatie = req.user
  const { cif } = req.body.client
  const chekClient = await Client.findOne({ locatie: locatie, cif: cif })
  if (chekClient) {
    req.flash('error', `Clientul ${chekClient.nume} este deja în baza de date!`)
    return res.redirect('/rapoarte/factura')
  } else {
    const newClient = new Client(req.body.client)
    newClient.locatie = locatie._id
    await newClient.save()
    res.redirect('/rapoarte/factura')
  }
}

// module.exports.updateLocatie = async (req, res, next) => {
//     const locatie = await Locatie.find({username: 'cafetish'})
//     const id = locatie[0]._id
// await Produs.updateMany({}, { $set: { locatie: id} })
// await Ingredient.updateMany({}, { $set: { locatie: id } })
// await Nota.updateMany({locatie: { $exists: false }}, { $set: { locatie: id }})
// await Nota.updateMany({user: { $exists: false }}, { $set: { user:{nume: 'alin', id: '63e6a4f353ae7dd1b50e493c'}  } })
// await Categorie.updateMany({}, { $set: { locatie: id } })
// await Counter.updateMany({}, { $set: { locatie: id } })
// res.redirect('/vanzare')
// }

function comparePasswords(password, hashedPassword) {
  const [salt, originalHash] = hashedPassword.split("$");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return hash === originalHash;
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return [salt, hash].join("$");
}

function cap(value) {
  return String(value).charAt(0).toUpperCase() + String(value).slice(1);
}
