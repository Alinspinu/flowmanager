const Ingredient = require("../models/ingredient");
const Produs = require("../models/produs");
const Categorie = require("../models/categorie");
const MainCat = require("../models/mainCat");
const Gestiune = require("../models/gestiune");

const ExpressError = require("../utilities/expressError");
const Furnizor = require("../models/furnizor");

module.exports.nomenclator = async (req, res, next) => {
  const locatie = req.user;
  const produse = await Produs.find({ locatie: locatie });
  produse.sort((a, b) => (a.nume > b.nume ? 1 : b.nume > a.nume ? -1 : 0));
  const ings = await Ingredient.find({ locatie: locatie }).populate({
    path: "gestiune",
    select: "nume",
  });
  ings.sort((a, b) => (a.nume > b.nume ? 1 : b.nume > a.nume ? -1 : 0));
  res.render("nomenclator", { produse, ings });
};

module.exports.renderAddCategorie = async (req, res, next) => {
  const locatie = req.user;
  const mainCat = await MainCat.find({ locatie: locatie });
  res.render('adauga/categorie', { mainCat })
}

module.exports.renderAddFurnizor = async (req, res, next) => {
  res.render('adauga/furnizor')
}

module.exports.renderAddNirTva = async (req, res, next) => {
  const locatie = req.user;
  const furnizori = await Furnizor.find({ locatie: locatie })
  const gestiune = await Gestiune.find({ locatie: locatie })
  res.render('adauga/nir', { furnizori, gestiune })
}

module.exports.renderAddNirFaraTva = async (req, res, next) => {
  const locatie = req.user;
  const gestiune = await Gestiune.find({ locatie: locatie })
  const furnizori = await Furnizor.find({ locatie: locatie })
  res.render('adauga/nirFaraTva', { furnizori, gestiune })
}

module.exports.renderAddProdus = async (req, res, next) => {
  const locatie = req.user;
  const cats = await Categorie.find({ locatie: locatie });
  res.render('adauga/produs', { cats })
}

module.exports.renderTransfer = async (req, res, next) => {
  const locatie = req.user;
  const gestiune = await Gestiune.find({ locatie: locatie })
  res.render('adauga/transfer', { gestiune })
}

module.exports.addProdus = async (req, res, next) => {
  const locatie = req.user;
  const cat = await Categorie.findById(req.body.produs.categorie);
  const mainCat = await MainCat.findById(cat.mainCat);
  const produs = req.body.produs;
  if (!req.body.ingrediente) {
    req.flash(
      "error",
      `Produsul ${produs.nume} trebuie sa conțină cel putin un ingredient`
    );
    res.redirect("/produs/addProdus");
  } else {
    const ingNume = req.body.ingrediente.nume;
    const ingQty = req.body.ingrediente.cantitate;
    const ingPret = req.body.ingrediente.pret;
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
      cat.produs.push(produsNou);
      await produsNou.save();
      await cat.save();
      req.flash(
        "success",
        `Felicitări tocmani ai creat produsul ${produsNou.nume}!`
      );
    }

    res.redirect("/produs/addProdus");
  }
};

module.exports.renderEdit = async (req, res, next) => {
  const locatie = req.user;
  const produs = await Produs.findById(req.params.id);
  const cats = await Categorie.find({ locatie: locatie });
  res.render("produsEdit", { produs, cats });
};

module.exports.edit = async (req, res, next) => {
  // const cat = await Categorie.findById(req.body.produs.categorie)
  const { id } = req.params;
  const produs = req.body.produs;
  const ing = req.body.ingrediente;
  const produsNou = await Produs.findById(id);

  produsNou.nume = produs.nume;
  produsNou.pret = produs.pret;
  produsNou.departament = produs.departament;
  produsNou.cotaTva = produs.cotaTva
  // produsNou.categorie = produs.categorie
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
  res.redirect("/produs/nomenclator");
};

module.exports.delete = async (req, res, next) => {
  const { id } = req.params;
  const produs = await Produs.findOne({ _id: id });
  await Produs.findByIdAndDelete(id);
  req.flash(
    "success",
    `Felicitări! Ai șters cu succes produsul: ${produs.nume}`
  );
  res.redirect("/produs/nomenclator");
};

module.exports.addMainCat = async (req, res, next) => {
  const locatie = req.user;
  const { nume } = req.body.mainCat;
  const mainCat = new MainCat({
    nume,
    locatie,
  });
  await mainCat.save();
  req.flash("success", `Felicitări ai creat categoria ${mainCat.nume}!`);
  res.redirect("/produs/addCategorie");
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
  await cat.save();
  mCat.categorie.push(cat);
  await mCat.save();
  req.flash(
    "success",
    `Felicitări ai adaugat categoria ${cat.nume} la ${mCat.nume}!`
  );
  res.redirect("/produs/addCategorie");
};
