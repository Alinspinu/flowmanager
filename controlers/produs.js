const Ingredient = require("../models/ingredient");
const Produs = require("../models/produs");
const Categorie = require("../models/categorie");
const MainCat = require("../models/mainCat");
const Gestiune = require("../models/gestiune");
const { cloudinary } = require('../cloudinary');

const ExpressError = require("../utilities/expressError");
const Furnizor = require("../models/furnizor");

module.exports.nomenclator = async (req, res, next) => {
  const locatie = req.user;
  const produse = await Produs.find({ locatie: locatie });
  const ings = await Ingredient.find({ locatie: locatie }).populate({
    path: "gestiune",
    select: "nume",
  });
  produse.sort((a, b) => (a.nume > b.nume ? 1 : b.nume > a.nume ? -1 : 0));
  ings.sort((a, b) => (a.nume > b.nume ? 1 : b.nume > a.nume ? -1 : 0));
  res.render("nomenclator", { produse, ings });
};





module.exports.addProdus = async (req, res, next) => {
  console.log(req.file)
  const locatie = req.user;
  const cat = await Categorie.findById(req.body.produs.categorie);
  const mainCat = await MainCat.findById(cat.mainCat);
  const produs = req.body.produs;
  if (!req.body.ingrediente) {
    req.flash(
      "error",
      `Produsul ${produs.nume} trebuie sa conțină cel putin un ingredient`
    );
    res.redirect("/rapoarte/dashboard");
  } else {
    const ingNume = req.body.ingrediente.nume;
    const ingQty = req.body.ingrediente.cantitate;
    const ingPret = req.body.ingrediente.pret;

    const ingNumeArr = Array.isArray(ingNume) ? ingNume : [ingNume];

    const ingredientsExist = await Promise.all(
      ingNumeArr.map(async (val) => {
        const ingredient = await Ingredient.findOne({ nume: val });
        return !!ingredient;
      })
    );

    if (!ingredientsExist.every((val) => val)) {
      req.flash(
        "error",
        `Unul sau mai multe ingrediente nu există în baza de date`
      );
      res.redirect("/rapoarte/dashboard");
    }
    if (Array.isArray(req.body.ingrediente.nume)) {
      let pretInt = ingPret.map(Number).reduce((acc, num) => acc + num, 0);
      const produsNou = new Produs(produs);
      let result = ingNume.map((val, index) => ({
        nume: val,
        cantitate: ingQty[index],
        pret: ingPret[index],
      }));
      produsNou.ingrediente.push(...result);
      produsNou.pretInt = parseFloat(pretInt);
      produsNou.locatie = locatie;
      produsNou.mainCat = mainCat._id;
      cat.produs.push(produsNou);
      if (req.file) {
        console.log(req.file)
        const { path, filename } = req.file
        produsNou.imagine.path = path;
        produsNou.imagine.filename = filename;
      }
      await produsNou.save();
      await cat.save();
      req.flash(
        "success",
        `Felicitări tocmani ai creat produsul ${produsNou.nume}!`
      );
    } else {
      const produsNou = new Produs(produs);
      produsNou.ingrediente.push(req.body.ingrediente);
      produsNou.pretInt = req.body.ingrediente.pret;
      produsNou.locatie = locatie;
      produsNou.mainCat = mainCat._id;
      if (req.file) {
        console.log(req.file)
        const { path, filename } = req.file
        produsNou.imagine.path = path;
        produsNou.imagine.filename = filename;
      }
      cat.produs.push(produsNou);
      await produsNou.save();
      await cat.save();
      req.flash(
        "success",
        `Felicitări tocmani ai creat produsul ${produsNou.nume}!`
      );
    }

    res.redirect("/rapoarte/dashboard");
  }
};

module.exports.renderEdit = async (req, res, next) => {
  const locatie = req.user;
  const produs = await Produs.findById(req.params.id);
  const cats = await Categorie.find({ locatie: locatie });
  res.render("produsEdit", { produs, cats });
};

module.exports.edit = async (req, res, next) => {
  const { id } = req.params;
  const produs = req.body.produs;
  const ing = req.body.ingrediente;
  const produsNou = await Produs.findById(id);
  if (req.file) {
    console.log(req.file)
    const { imagine } = produsNou
    if (imagine.filename) {
      await cloudinary.uploader.destroy(imagine.filename)
    }
    const { path, filename } = req.file
    produsNou.imagine.path = path;
    produsNou.imagine.filename = filename;
  }
  produsNou.nume = produs.nume;
  produsNou.pret = produs.pret;
  produsNou.departament = produs.departament;
  produsNou.cotaTva = produs.cotaTva
  if (Array.isArray(req.body.ingrediente.nume)) {
    let pretInt = ing.pret.map(Number).reduce((acc, num) => acc + num, 0);
    let result = ing.nume.map((val, index) => ({
      nume: val,
      cantitate: ing.cantitate[index],
      pret: ing.pret[index],
    }));
    produsNou.ingrediente = result;
    produsNou.pretInt = parseFloat(pretInt);
    await produsNou.save();
    req.flash(
      "success",
      `Felicitări tocmani ai modificat produsul ${produsNou.nume}!`
    );
  } else {
    produsNou.ingrediente = ing;
    produsNou.pretInt = ing.pret;
    await produsNou.save();
    req.flash(
      "success",
      `Felicitări tocmani ai modificat produsul ${produsNou.nume}!`
    );
  }
  res.redirect("/rapoarte/dashboard");
};

module.exports.delete = async (req, res, next) => {
  const { id } = req.params;
  const produs = await Produs.findOne({ _id: id });
  const { imagine } = produs
  if (imagine.filename) {
    await cloudinary.uploader.destroy(imagine.filename)
  }
  await Produs.findByIdAndDelete(id);
  req.flash(
    "success",
    `Felicitări! Ai șters cu succes produsul: ${produs.nume}`
  );
  res.redirect("/rapoarte/dashboard");
};

module.exports.addMainCat = async (req, res, next) => {
  const locatie = req.user;
  const { nume } = req.body.mainCat;
  const mainCat = new MainCat({
    nume,
    locatie,
  });
  if (req.file) {
    const { path, filename } = req.file
    mainCat.imagine.path = path;
    mainCat.imagine.filename = filename;
  }
  await mainCat.save();
  req.flash("success", `Felicitări ai creat categoria ${mainCat.nume}!`);
  res.redirect("/rapoarte/dashboard");
};

module.exports.addCat = async (req, res, next) => {
  const locatie = req.user;
  const { nume, mainCat } = req.body.categorie;
  const mCat = await MainCat.findById(mainCat);
  const cat = new Categorie({
    nume,
    locatie,
    mainCat,
  });
  if (req.file) {
    const { path, filename } = req.file
    cat.imagine.path = path;
    cat.imagine.filename = filename;
  }
  await cat.save();
  mCat.categorie.push(cat);
  await mCat.save();
  req.flash(
    "success",
    `Felicitări ai adaugat categoria ${cat.nume} la ${mCat.nume}!`
  );
  res.redirect("/rapoarte/dashboard");
 
};
