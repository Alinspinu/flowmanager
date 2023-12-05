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
const Suma = require("../models/suma")
const Qr = require("../models/qr");
const fs = require("fs");
const qrcode = require('qrcode-terminal');
const ExpressError = require("../utilities/expressError");
const Entry = require('../models/entry')
const Day = require('../models/day')


// const toAscii = require('to-ascii')

module.exports.tva = async (req, res, next) => {

  const tva = req.user.platitorTva
  if (tva) {
    res.json('platitorTva')
  } else if (!tva) {
    res.json('neplatitorTva')
  }
}

module.exports.reciveReprint = async (req, res, next) => {
  const locatie = req.user
  // const fileName = "C:/Fisco_Daisy/Bonuri/nota.txt";
  const fileName = "nota.txt";
  let bon = []
  const nota = req.body;
  console.log("ceva", nota.unregistred)
  if(nota.unregistred){
    const notas = await Nota.findOneAndUpdate({_id: nota._id}, {unregistred: false}, {new: true})
    console.log(notas)
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
  fs.writeFileSync(fileName, bon.join("\n"));
  res.status(200).json('all good')
}

module.exports.reciveNota = async (req, res, next) => {
  // const fileName = "C:/Fisco_Daisy/Bonuri/nota.txt";
  const fileName = "nota.txt";
  let bon = [];
  let bonNf = [];
  const locatie = req.user;
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setUTCHours(23, 59, 59, 999);
  if (req.body.raport === "x") {
    bon.push(`Z,1,______,_,__;0;`);
    fs.writeFileSync(fileName, bon.join("\n"));
  } else if (req.body.raport === "z") {
    const note = await Nota.find({ data: { $gte: startOfDay, $lte: endOfDay }, locatie: locatie })
    let totalCash = 0
    for (let nota of note) {
      totalCash += nota.cash;
    }
    const nextDay = new Date(startOfDay);
    nextDay.setDate(dateObject.getDate() + 1);
    const day = await Day.findOne({ locatie: locatie, date: {$gte:startOfDay, $lt: nextDay} }).populate({ path: 'entry' })
    if (day) {
      const entry = await Entry.findOne({ locatie: locatie, date: {$gte:startOfDay, $lt: nextDay}, description: 'Raport Z' })
      console.log(entry)
      if (!entry) {
        const newEntry = new Entry({
          locatie: locatie,
          amount: totalCash,
          tip: 'income',
          date: startOfDay,
          description: 'Raport Z',
        })
        const daySum = day.entry.reduce((total, doc) => total + doc.amount, 0)
        const dayTotal = daySum + newEntry.amount + day.cashIn
        day.entry.push(newEntry)
        day.cashOut = dayTotal
        await newEntry.save()
        await day.save()
      }
    }
    await Suma.findOneAndUpdate({ locatie: locatie }, { sum: 0 }, { new: true })
    bon.push(`Z,1,______,_,__;1;`);
    fs.writeFileSync(fileName, bon.join("\n"));
    try {
      await Counter.findOneAndUpdate(
        { model: "Nota", locatie: locatie },
        { value: 0 }
      );
      await Counter.findOneAndUpdate(
        { model: "Comanda", locatie: locatie },
        { value: 0 }
      );
    } catch (err) {
      if (err) {
        console.log(err)
        req.flash('error', 'Counterul nu a fost resetat')
      }
    }
  } else if (req.body.addSuma) {
    const suma = await Suma.findOneAndUpdate(
      { locatie: locatie },
      { $inc: { sum: req.body.addSuma } },
      { new: true })
    bon.push(`I,1,______,_,__;0;${req.body.addSuma};;;;`);
    fs.writeFileSync(fileName, bon.join("\n"));
    res.json(suma.sum)
  } else if (req.body.redSuma) {
    const suma = await Suma.findOneAndUpdate(
      { locatie: locatie },
      { $inc: { sum: -req.body.redSuma } },
      { new: true })
    bon.push(`I,1,______,_,__;1;${req.body.redSuma};;;;`);
    fs.writeFileSync(fileName, bon.join("\n"));
    res.json(suma.sum)
  } else if (req.body.total) {
    const produse = req.body.prod
    const userId = req.session.userId;
    const usersArr = locatie.nestedUsers;
    const user = usersArr.find((user) => user._id === userId);
    const nota = new Nota(req.body);
    nota.locatie = locatie;
    nota.user.nume = user.nume;
    nota.user.id = user._id;
    let dataProd = []
    for (let produs of produse) {
      const data = {
        produs: produs.id,
        cantitate: produs.cantitate
      }
      dataProd.push(data)
    }
    nota.produse = dataProd;
    nota.unregistred = req.body.bon;
    const savedNota = await nota.save();
    // const qrAscii = qrcode.generate(savedNota, { small: true });
    const prod = req.body.prod;
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
    const data = req.body.prod;
    for (let i = 0; i < data.length; i++) {
      if (locatie.platitorTva) {
        const prod = await Produs.findOne({ _id: data[i].id })
        const produs = `S,1,______,_,__;${prod.nume};${prod.pret};${data[i].cantitate};1;1;${prod.cotaTva}%;0;0;buc`;
        bon.push(produs);
      } else if (!locatie.platitorTva) {
        const prod = await Produs.findOne({ _id: data[i].id })
        const produs = `S,1,______,_,__;${prod.nume};${prod.pret};${data[i].cantitate};1;1;5;0;0;buc`;
        bon.push(produs);
      }
    }
    for (let i = 0; i < data.length; i++) {
      const produs = `42,${data[i].nume} X ${data[i].cantitate}^1^0^0^0^0^`
      bonNf.push(produs)
    }
    // if (req.body.nrMasa.length) {
    //   const nrMasa = `42,Masa Nr: ${req.body.nrMasa}^1^0^1^0^1^`
    //   bonNf.push(nrMasa)
    // }

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

    // Create an array to store the update Promises

    const updatePromises = [];
    for (const el of req.body.prod) {
      const updatePromise = Produs.findOneAndUpdate(
        { _id: el.id },
        { cantitate: el.cantitate },
        { returnDocument: "after" }
      ).exec();

      updatePromises.push(updatePromise);
    }

    const updatedProduse = await Promise.all(updatePromises);

    for (const produs of updatedProduse) {
      const qtyProdus = round(produs.cantitate);

      for (const ing of produs.ingrediente) {
        const ingredientInv = await Ingredient.findOne({
          nume: ing.nume,
          locatie: locatie
        }).exec();

        if (!ingredientInv) {
          throw new Error(`Ingredientul ${ing.nume} nu a fost găsit în baza de date. Posibil ca în rețeta produsului ${produs.nume}, ingredientul să fie trecut greșit. Verifică ingredientul ${ing.nume} în nomenclator și verifică-l si în rețeta produsului ${produs.nume}. Trebuie să corespundă!`);
        }

        let cantFinal = parseFloat(ing.cantitate * qtyProdus);
        ingredientInv.cantitate -= round(cantFinal);

        await ingredientInv.save();
      }
    }
    if(!req.body.bon){
      fs.writeFileSync(fileName, bon.join("\n"));
    } else {
       
    }

    const note = await Nota.find({ data: { $gte: startOfDay, $lte: endOfDay }, locatie: locatie }).populate({ path: 'produse.produs' })
    let marfa = 0;
    let prep = 0;
    note.forEach(function (el) {
      let reducere = el.reducere
      el.produse.forEach(function (el) {
        const dep = el.produs.departament
        const qty = parseFloat(el.cantitate)
        const pret = el.produs.pret
        if (dep === '2') {
          prep += (qty * pret) - reducere
        } else if (dep === '1') {
          marfa += (qty * pret)
        }
      })
    })

    let totalCash = 0
    let totalCard = 0
    let unregistred = 0
    for (let nota of note) {
      if(!nota.unregistred){
        totalCard += nota.card;
        totalCash += nota.cash;
      } else {
        unregistred += nota.cash;
      }
    }
    res.json({ totalCard, totalCash, marfa, prep, unregistred })

  }
}



module.exports.orderDone = async (req, res, next) => {
  const userId = req.session.userId
  const { cmdId } = req.body
  const doc = await Comanda.findByIdAndUpdate(cmdId, { status: 'done', userId: userId })
  res.json()
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

module.exports.search = async (req, res, next) => {
  const locatie = req.user
  const docs = await Produs.find({ locatie: locatie })
  res.json(docs)
}

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
};


//********OLD CODE FOR INVENTAR********************** */


// req.body.produse.forEach(function (el) {
//   const updatePromise = new Promise((resolve, reject) => {
//     Produs.findOneAndUpdate(
//       { nume: el.nume, locatie: locatie },
//       { cantitate: el.cantitate },
//       { returnDocument: "after" },
//       (err, produs) => {
//         if (!produs) {
//           reject(`Produsul ${el.nume} nu a fost gasit in baza de date. Verifică nomenclatorul de produse!`);
//         } else if (err) {
//           reject(err);
//         } else {
//           const qtyProdus = round(produs.cantitate);
//           produs.ingrediente.forEach(function (ing) {
//             const ingredientPromise = new Promise((resolve, reject) => {
//               Ingredient.findOne(
//                 { nume: ing.nume, locatie: locatie },
//                 (err, ingredientInv) => {
//                   if (!ingredientInv) {
//                     reject(`Ingredientul ${ing.nume} nu a fost găsit în baza de date. Posibil ca în rețeta produsului ${produs.nume}, ingredientul să fie trecut greșit. Verifică ingredientul ${ing.nume} în nomenclator și verifică-l si în rețeta produsului ${produs.nume}. Trebuie să corespundă!`);
//                   } else if (err) {
//                     reject(err);
//                   } else {
//                     let cantFinal = parseFloat(ing.cantitate * qtyProdus);
//                     ingredientInv.cantitate -= round(cantFinal);
//                     ingredientInv.save((err, updateIngredient) => {
//                       if (err) {
//                         reject(err);
//                       } else {
//                         resolve();
//                       }
//                     });
//                   }
//                 }
//               );
//             });
//             updatePromises.push(ingredientPromise);
//           });
//           resolve();
//         }
//       }
//     );
//   });
//   updatePromises.push(updatePromise);
// });


// Wait for all update Promises to resolve
//   Promise.all(updatePromises)
//   .then(() => {
//     // All updates have completed successfully, so run the final code here        
//     fs.writeFileSync(fileName, bon.join("\n"));
//     const locatie = req.user
//     const startOfDay = new Date();
//     startOfDay.setUTCHours(0, 0, 0, 0);
//     const endOfDay = new Date();
//     endOfDay.setUTCHours(23, 59, 59, 999);
//     return Nota.find({ data: { $gte: startOfDay, $lte: endOfDay }, locatie: locatie })
//       .then((note) => {
//         let totalCash = 0
//         let totalCard = 0
//         for (let nota of note) {
//           totalCard += nota.card;
//           totalCash += nota.cash;
//         }
//         res.json({ totalCard, totalCash })
//       })

//   })
//   .catch((err) => {
//     console.log(err)
//     // An error occurred during the updates, so handle the error here
//     res.status(500).send(err);
//   });
// }