const localStorage = require("local-storage");
const Produs = require("../models/produs");
const Ingredient = require("../models/ingredient");
const Nota = require("../models/nota");
const Counter = require("../models/counter");
const Categorie = require("../models/categorie");
const Comanda = require("../models/comanda");
const Furnizor = require("../models/furnizor");
const MainCat = require("../models/mainCat");
const Client = require("../models/client")
const Qr = require("../models/qr");
const fs = require("fs");
const ExpressError = require("../utilities/expressError");


// const toAscii = require('to-ascii')

module.exports.tva = async (req, res, next) => {
  const tva = req.user.platitorTva
  if (tva) {
    res.json('platitorTva')
  } else if (!tva) {
    res.json('neplatitorTva')
  }
}

module.exports.reciveNota = async (req, res, next) => {
  let bon = [];
  let bonNf = [];
  const locatie = req.user;

  if (req.body.raport === "x") {
    bon.push(`Z,1,______,_,__;0;`);
  } else if (req.body.raport === "z") {
    bon.push(`Z,1,______,_,__;1;`);
    await Counter.findOneAndUpdate(
      { model: "Nota", locatie: locatie },
      { value: 0 }
    );
    await Counter.findOneAndUpdate(
      { model: "Comanda", locatie: locatie },
      { value: 0 }
    );
  } else if (req.body.addSuma) {
    bon.push(`I,1,______,_,__;0;${req.body.addSuma};;;;`);
  } else if (req.body.redSuma) {
    bon.push(`I,1,______,_,__;1;${req.body.redSuma};;;;`);
  } else if (req.body.total) {
    const userId = req.session.userId;
    const usersArr = locatie.nestedUsers;
    const user = usersArr.find((user) => user._id === userId);
    const nota = new Nota(req.body);
    nota.locatie = locatie;
    nota.user.nume = user.nume;
    nota.user.id = user._id;
    await nota.save();
    const prod = req.body.produse;
    const bucItems = prod.filter(
      (item) => item.mainCat === "63fb45890a71528e8d49cb23"
    );
    const baristaItems = prod.filter(
      (item) => item.mainCat === "63fb457d0a71528e8d49cb1d"
    );

    if (baristaItems.length) {
      const cmdBarista = new Comanda({
        produse: baristaItems,
        mainCat: "63fb457d0a71528e8d49cb1d",
        locatie: locatie,
        creataLa: req.body.data,
        nrMasa: req.body.nrMasa,
      });
      await cmdBarista.save();

    }
    if (bucItems.length) {
      const cmdBuc = new Comanda({
        produse: bucItems,
        mainCat: "63fb45890a71528e8d49cb23",
        locatie: locatie,
        creataLa: req.body.data,
        nrMasa: req.body.nrMasa,
      });
      await cmdBuc.save();

    }

    if (req.body.cif) {
      const cif = req.body.cif;
      bon.push(`K,1,______,_,__;${cif};`);
    }
    const data = req.body.produse;
    for (let i = 0; i < data.length; i++) {
      if (locatie.platitorTva) {
        const produs = `S,1,______,_,__;${data[i].nume};${data[i].pret};${data[i].cantitate};1;1;${data[i].cotaTva}%;0;0;buc`;
        bon.push(produs);
      } else if (!locatie.platitorTva) {
        const produs = `S,1,______,_,__;${data[i].nume};${data[i].pret};${data[i].cantitate};1;1;5;0;0;buc`;
        bon.push(produs);
      }
    }
    for (let i = 0; i < data.length; i++) {
      const produs = `42,${data[i].nume} X ${data[i].cantitate}^1^0^0^0^0^`
      bonNf.push(produs)
    }
    if (req.body.nrMasa.length) {
      const nrMasa = `42,Masa Nr: ${req.body.nrMasa}^1^0^1^0^1^`
      bonNf.push(nrMasa)
    }

    if (nota.reducere) {
      bon.push("T,1,______,_,__;4;;;;;");
      bon.push(`C,1,______,_,__;3;${nota.reducere};;;;`);
    }
    if (nota.cash > 0 && nota.card > 0) {
      const totalNotaCash = `T,1,______,_,__;0;${nota.cash};;;;`;
      const totalNotaCard = `T,1,______,_,__;1;${nota.card};;;;`;
      bon.push(totalNotaCash, totalNotaCard);
    }
    if (nota.cash == 0 || nota.cash == isNaN || !nota.cash) {
      const totalNotaCard = `T,1,______,_,__;1;${nota.card};;;;`;
      bon.push(totalNotaCard);
    }
    if (nota.card == 0 || nota.card == isNaN || !nota.card) {
      const totalNotaCash = `T,1,______,_,__;0;${nota.cash};;;;`;
      bon.push(totalNotaCash);
    }

    req.body.produse.forEach(function (el) {
      Produs.findOneAndUpdate(
        { nume: el.nume, locatie: locatie },
        { cantitate: el.cantitate },
        { returnDocument: "after" },
        (err, produs) => {
          if (err) {
            res.status(500).send(err);
          } else {
            const qtyProdus = round(produs.cantitate);
            produs.ingrediente.forEach(function (ing) {
              Ingredient.findOne(
                { nume: ing.nume, locatie: locatie },
                (err, ingredientInv) => {
                  if (err) {
                    res.status(500).send(err);
                  } else {
                    let cantFinal = parseFloat(ing.cantitate * qtyProdus);
                    ingredientInv.cantitate -= round(cantFinal);

                    ingredientInv.save((err, updateIngredient) => {
                      if (err) {
                        res.status(500).send(err);
                      }
                    });
                  }
                }
              );
            });
          }
        }
      );
    });
  }

  const fileName = 'nota.txt'

  fs.writeFileSync(fileName, bon.join('\n'));
  const fileName1 = 'nota1.txt'
  setTimeout(() => {
    fs.writeFileSync(fileName1, bonNf.join('\n'))
  }, 500)





  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setUTCHours(23, 59, 59, 999);
  const note = await Nota.find({
    data: { $gte: startOfDay, $lte: endOfDay },
    locatie: locatie,
  });
  let totalCash = 0;
  let totalCard = 0;
  for (let nota of note) {
    totalCard += nota.card;
    totalCash += nota.cash;
  }
  res.json({ totalCard, totalCash });
};

module.exports.orderDone = async (req, res, next) => {
  const userId = req.session.userId
  const { cmdId } = req.body
  const doc = await Comanda.findByIdAndUpdate(cmdId, { status: 'done', userId: userId })
  // res.json()
}


function round(num) {
  return Math.round(num * 1000) / 1000;
}

module.exports.sendProduse = async (req, res, next) => {
  const locatie = req.user;
  let nume = [];
  let pret = [];
  const userData = req.body.search;
  const produse = await Produs.find({ locatie: locatie });
  produse.forEach(function (el) {
    nume.push(el.nume);
    pret.push(el.pret);
  });
  let prod = nume.map((val, index) => ({ nume: val, pret: pret[index] }));
  let result = prod.filter((object) =>
    object.nume.toLocaleLowerCase().includes(userData.toLocaleLowerCase())
  );

  res.json(result);
};

module.exports.sendCat = async (req, res, next) => {
  const locatie = req.user;
  const mainCat = await MainCat.find({ locatie: locatie }).populate({
    path: "categorie",
    populate: { path: "produs" },
  });
  res.json(mainCat);
};

module.exports.querySearchIng = async (req, res, next) => {
  const locatie = req.user;
  let nume = [];
  let um = [];
  let cotaTva = [];
  let pret = [];
  let qty = [];
  const userData = req.body.search;
  const ings = await Ingredient.find({ locatie: locatie });
  ings.forEach((el) => {
    nume.push(el.nume);
    um.push(el.um);
    cotaTva.push(el.cotaTva);
    pret.push(el.pret);
    qty.push(el.cantitate);
  });
  let ingNameUm = nume.map((val, index) => ({
    nume: val,
    um: um[index],
    cotaTva: cotaTva[index],
    pret: pret[index],
    qty: qty[index],
  }));
  let result = ingNameUm.filter((object) =>
    object.nume.toLocaleLowerCase().includes(userData.toLocaleLowerCase())
  );

  res.json(result);
};


module.exports.querySearchIngFaraTva = async (req, res, next) => {
  const locatie = req.user;
  let nume = [];
  let um = [];
  let pret = [];
  let qty = [];
  const userData = req.body.search;
  const ings = await Ingredient.find({ locatie: locatie });
  ings.forEach((el) => {
    nume.push(el.nume);
    um.push(el.um);
    pret.push(el.pret);
    qty.push(el.cantitate);
  });
  let ingNameUm = nume.map((val, index) => ({
    nume: val,
    um: um[index],
    pret: pret[index],
    qty: qty[index],
  }));
  let result = ingNameUm.filter((object) =>
    object.nume.toLocaleLowerCase().includes(userData.toLocaleLowerCase())
  );

  res.json(result);
};


module.exports.sendFurnizor = async (req, res, next) => {
  const locatie = req.user;
  let furNames = [];
  let cif = [];
  let Id = [];
  const userData = req.body.search;
  const furnizor = await Furnizor.find({ locatie: locatie });
  furnizor.forEach(function (el) {
    furNames.push(el.nume);
    cif.push(el.cif);
    Id.push(el._id);
  });
  let furNameUm = furNames.map((val, index) => ({
    nume: val,
    cif: cif[index],
    Id: Id[index],
  }));
  let result = furNameUm.filter((object) =>
    object.nume.toLocaleLowerCase().includes(userData.toLocaleLowerCase())
  );

  res.json(result);
};

module.exports.sendClient = async (req, res, next) => {
  const locatie = req.user;
  let clientNames = [];
  let cif = [];
  let Id = [];
  const userData = req.body.search;
  const client = await Client.find({ locatie: locatie });
  client.forEach(function (el) {
    clientNames.push(el.nume);
    cif.push(el.cif);
    Id.push(el._id);
  });
  let clientNameUm = clientNames.map((val, index) => ({
    nume: val,
    cif: cif[index],
    Id: Id[index],
  }));
  let result = clientNameUm.filter((object) =>
    object.nume.toLocaleLowerCase().includes(userData.toLocaleLowerCase())
  );

  res.json(result);
}
