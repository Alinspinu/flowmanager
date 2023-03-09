const gestiune = require("../models/gestiune");
const ingredient = require("../models/ingredient");
const Ingredient = require("../models/ingredient");
const Gestiune = require("../models/gestiune");
const Furnizor = require("../models/furnizor");
const Nir = require("../models/nir");
const Locatie = require("../models/locatie");
const Bon = require("../models/bon");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const ExpressError = require("../utilities/expressError");

module.exports.addIngTva = async (req, res, next) => {
  const locatie = req.user;
  const produse = req.body.nir.produse;
  const furnizor = await Furnizor.findById(req.body.nir.furId);
  const nir = new Nir(req.body.nir);
  nir.produse = produse;
  nir.furnizor = furnizor._id;
  nir.locatie = locatie;
  await nir.save();
  const options = { day: "2-digit", month: "2-digit", year: "numeric" };
  const date = nir.data
    .toLocaleDateString("en-GB", options)
    .replace(/\//g, "-");


  const promises = nir.produse.map((el) => {
    return Ingredient.findOneAndUpdate(
      { nume: el.nume, locatie: locatie._id, gestiune: el.gestiune },
      {
        $setOnInsert: {
          um: el.um,
          cotaTva: el.cotaTva,
          locatie: locatie,
          gestiune: el.gestiune,
        },
        $set: {
          pret: el.pretUmInt,
          pretT: el.pretUmInt * (1 + el.cotaTva / 100),
        },
        $inc: { cantitate: el.cantitate },
      },
      { upsert: true, new: true }
    ).exec();
  });

  Promise.all(promises)
    .then((results) => {
      console.log(`Updated/created documents: ${results}`);
      res.redirect(`/ingredient/Nir${nir.index}din${date}`);
    })
    .catch((err) => {
      console.log(`Error: ${err}`);
      next(err);
    });
};


module.exports.addIngFaraTva = async (req, res, next) => {
  const locatie = req.user;
  const produse = req.body.nir.produse;
  const furnizor = await Furnizor.findById(req.body.nir.furId);
  const nir = new Nir(req.body.nir);
  nir.produse = produse;
  nir.furnizor = furnizor._id;
  nir.locatie = locatie;
  await nir.save();
  const options = { day: "2-digit", month: "2-digit", year: "numeric" };
  const date = nir.data
    .toLocaleDateString("en-GB", options)
    .replace(/\//g, "-");

  const promises = nir.produse.map((el) => {
    return Ingredient.findOneAndUpdate(
      { nume: el.nume, locatie: locatie._id, gestiune: el.gestiune },
      {
        $setOnInsert: {
          um: el.um,
          cotaTva: el.cotaTva,
          locatie: locatie,
          gestiune: el.gestiune,
        },
        $set: {
          pret: el.pretUmInt,
        },
        $inc: { cantitate: el.cantitate },
      },
      { upsert: true, new: true }
    ).exec();
  });

  Promise.all(promises)
    .then((results) => {
      console.log(`Updated/created documents: ${results}`);
      res.redirect(`/ingredient/Nir${nir.index}din${date}`);
    })
    .catch((err) => {
      console.log(`Error: ${err}`);
      next(err);
    });
};




module.exports.printNir = async (req, res, next) => {
  const nir = await Nir.findOne({}, {}, { sort: { _id: -1 } })
    .populate({
      path: "furnizor",
      select: "nume cif",
    })
    .populate({
      path: "produse.gestiune",
      select: "nume",
    });
  const locatie = req.user;
  const firma = await Locatie.findById(locatie._id);
  const userLogat = req.user.nestedUsers.find(
    (user) => user._id === req.session.userId
  );
  const options = { day: "2-digit", month: "2-digit", year: "numeric" };
  const date = nir.data
    .toLocaleDateString("en-GB", options)
    .replace(/\//g, "-");

  const doc = new PDFDocument({
    size: "A4",
    layout: "landscape",
  });

  // Add header
  doc
    .fontSize(9)
    .text(
      `${firma.dateFirma.nume} ${firma.dateFirma.cif} ${firma.dateFirma.rc} `,
      10,
      20,
      {
        width: 280,
      }
    );
  doc.fontSize(9).text(`${firma.dateFirma.adresa}`, 10, 30, {
    width: 280,
  });

  doc.moveDown();

  doc.lineWidth(0.2);
  doc.moveTo(5, 40).lineTo(260, 40).stroke();

  doc.moveDown();
  doc.font("Helvetica-Bold");
  doc
    .fontSize(16)
    .text("Nota de receptie si constatare de diferente", 275, 75, {
      underline: true,
    });

  doc.moveDown();
  doc.font("Helvetica-Bold");
  doc.fontSize(12);
  doc.text("Nr. NIR", 20, 150, { width: 80, align: "center" });
  doc.text("Data", 110, 150, { width: 120, align: "center" });
  doc.text("Moneda", 240, 150, { width: 120, align: "center" });
  doc.text("Furnizor", 370, 150, { width: 220, align: "center" });
  doc.text("CIF", 590, 150, { width: 120, align: "center" });
  doc.text("Nr.Doc", 710, 150, { width: 80, align: "center" });

  doc.moveDown();
  doc.lineWidth(0.3);
  doc.moveTo(10, 163).lineTo(800, 163).stroke();

  doc.moveDown();
  doc.font("Helvetica");
  doc.fontSize(10);
  doc.text(nir.index, 20, 170, { width: 80, align: "center" });
  doc.text(date, 110, 170, { width: 120, align: "center" });
  doc.text("RON", 240, 170, { width: 120, align: "center" });
  doc.text(nir.furnizor.nume, 370, 170, { width: 220, align: "center" });
  doc.text(nir.furnizor.cif, 590, 170, { width: 120, align: "center" });
  doc.text(nir.nrDoc, 710, 170, { width: 80, align: "center" });

  doc.moveDown();
  let y = 220;
  // Table headers
  doc.font("Helvetica-Bold");
  doc.fontSize(10);
  doc.text("Denumire Articol", 10, y, { width: 110 });
  doc.text("UM", 115, y, { width: 40, align: "center" });
  doc.text("Qty", 160, y, { width: 40, align: "center" });
  doc.text("Tip", 225, y, { width: 70, align: "center" });
  doc.text("Gestiune", 300, y, { width: 70, align: "center" });

  if (locatie.platitorTva) {
    doc.text("Pret/F/Tva", 375, y, { width: 50, align: "center" });
  } else if (!locatie.platitorTva) {
    doc.text("Pret", 375, y, { width: 50, align: "center" });
  }
  doc.text("Valoare", 430, y, { width: 50, align: "center" });
  doc.text("Tva%", 495, y, { width: 30, align: "center" });
  doc.text("Val Tva", 530, y, { width: 50, align: "center" });
  doc.text("Total", 585, y, { width: 50, align: "center" });
  doc.text("Pret Vanzare", 640, y, { width: 60, align: "center" });
  doc.text("Val Vanzare", 705, y, { width: 60, align: "center" });
  doc.text("Total Tva", 770, y, { width: 60, align: "center" });

  // doc.moveDown();

  doc.lineWidth(0.2);
  doc.moveTo(5, 231).lineTo(825, 231).stroke();

  doc.moveDown();
  // Add table rows

  doc.font("Helvetica");
  doc.fontSize(10);
  let valoareIntTotal = 0;
  let valTvaTotal = 0;
  let valVanzare = 0;
  let valTvaVanzare = 0;
  let valTotal = 0;
  nir.produse.forEach((produs, i) => {
    doc.text(produs.nume, 10, y + i * 18 + 18, { width: 110 });
    doc.text(produs.um, 115, y + i * 18 + 18, { width: 40, align: "center" });
    doc.text(produs.cantitate.toString(), 160, y + i * 18 + 18, {
      width: 40,
      align: "center",
    });
    doc.text(produs.categorie, 225, y + i * 18 + 18, {
      width: 70,
      align: "center",
    });
    doc.text(cap(produs.gestiune.nume), 300, y + i * 18 + 18, {
      width: 70,
      align: "center",
    });
    doc.text(produs.pretUmInt, 375, y + i * 18 + 18, {
      width: 50,
      align: "center",
    });
    doc.text(produs.valoareInt, 435, y + i * 18 + 18, {
      width: 50,
      align: "center",
    });
    doc.text(produs.cotaTva, 495, y + i * 18 + 18, {
      width: 30,
      align: "center",
    });
    doc.text(produs.valTva, 530, y + i * 18 + 18, {
      width: 50,
      align: "center",
    });
    doc.text(produs.total, 585, y + i * 18 + 18, {
      width: 50,
      align: "center",
    });
    doc.text(
      `${produs.pretVanzareUm ? produs.pretVanzareUm : 0}`,
      640,
      y + i * 18 + 18,
      { width: 60, align: "center" }
    );
    doc.text(
      `${produs.pretVanzareUm ? produs.pretVanzareUm * produs.cantitate : 0}`,
      705,
      y + i * 18 + 18,
      { width: 60, align: "center" }
    );
    doc.text(
      `${produs.pretVanzareUm
        ? round(
          produs.pretVanzareUm * produs.cantitate * (produs.cotaTva / 100)
        )
        : "0"
      }`,
      770,
      y + i * 18 + 18,
      { width: 60, align: "center" }
    );
    valTotal += parseFloat(produs.total)
    valoareIntTotal += parseFloat(produs.valoareInt);
    valTvaTotal += parseFloat(produs.valTva);
    valVanzare +=
      parseFloat(produs.pretVanzareUm) * parseFloat(produs.cantitate);
    valTvaVanzare += round(
      parseFloat(produs.pretVanzareUm) *
      parseFloat(produs.cantitate) *
      (parseFloat(produs.cotaTva) / 100)
    );
  });
  const height = nir.produse.length * 18;
  doc.lineWidth(0.4);
  doc
    .moveTo(10, y + height + 18)
    .lineTo(830, y + height + 18)
    .stroke();
  doc.font("Helvetica-Bold");
  doc.fontSize(12);
  doc.text("Total:", 370, y + height + 26);
  doc.text(`${valoareIntTotal}`, 430, y + height + 26, {
    width: 50,
    align: "center",
  });
  doc.text(`${round(valTvaTotal)}`, 530, y + height + 26, {
    width: 50,
    align: "center",
  });
  if (locatie.platitorTva) {
    doc.text(`${valTvaTotal + valoareIntTotal}`, 585, y + height + 26, {
      width: 50,
      align: "center",
    });
  } else if (!locatie.platitorTva) {
    doc.text(`${valTotal}`, 585, y + height + 26, {
      width: 50,
      align: "center",
    });
  }
  doc.text(`${valVanzare}`, 705, y + height + 26, {
    width: 60,
    align: "center",
  });
  doc.text(`${valTvaVanzare}`, 770, y + height + 26, {
    width: 60,
    align: "center",
  });

  doc.lineWidth(0.6);
  doc
    .moveTo(365, y + height + 39)
    .lineTo(830, y + height + 39)
    .stroke();

  doc.font("Helvetica-Bold");
  doc.fontSize(14);
  doc.text("Responsabil", 80, y + height + 100);
  doc.text(`Data`, 400, y + height + 100);
  doc.text("Semnatura", 680, y + height + 100);
  doc.font("Helvetica");
  doc.fontSize(12);
  doc.text(`${cap(userLogat.nume)}`, 80, y + height + 120);
  doc.text(`${date}`, 400, y + height + 120);

  doc.end();

  res.type("application/pdf");
  doc.pipe(res);

  res.once("finish", () => {
    const chunks = [];
    doc.on("data", (chunk) => {
      chunks.push(chunk);
    });
    doc.on("end", () => {
      const buffer = Buffer.concat(chunks);
      const pdfUrl = `data:application/pdf;base64,${buffer.toString("base64")}`;
      res.send(
        `<iframe src="${pdfUrl}" style="width:100%;height:100%;" frameborder="0"></iframe>`
      );
    });
  });
};



module.exports.addInventar = async (req, res, next) => {
  const locatie = req.user;

  const { gestRecive, gestSend, data, ingredient } = req.body.bon;

  // parcurgem fiecare ingredient din bonul de consum
  for (const ing of ingredient) {
    const { nume, um, pret, cantitate } = ing;

    // căutăm ingredientul în baza de date
    const ingredientSursa = await Ingredient.findOne({
      nume,
      locatie: locatie,
      gestiune: gestSend,
    });

    if (!ingredientSursa) {
      req.flash(
        "error",
        `Ingredientul ${nume} nu există în gestiunea ${gestSend}`
      );
      return res.redirect("/produs/addProdus");
    }

    // verificăm dacă cantitatea de ingrediente este suficientă în magazia sursă
    if (ingredientSursa.cantitate < cantitate) {
      req.flash("error", `Ingredientul ${nume} nu are destulă cantitate`);
      return res.redirect("/produs/addProdus");
    }

    // actualizăm cantitatea ingredientului în magazia sursă
    ingredientSursa.cantitate -= cantitate;
    await ingredientSursa.save();

    // căutăm ingredientul în magazia destinatară
    let ingredientDestinatar = await Ingredient.findOne({
      nume,
      gestiune: gestRecive,
      locatie: locatie,
    });

    // dacă ingredientul nu există în magazia destinatară, îl creăm
    if (!ingredientDestinatar) {
      ingredientDestinatar = new Ingredient({
        nume,
        um,
        cantitate,
        pretT: ingredientSursa.pretT,
        pret,
        cotaTva: ingredientSursa.cotaTva,
        locatie: ingredientSursa.locatie,
        gestiune: gestRecive,
      });
    } else {
      // dacă ingredientul există deja în magazia destinatară, actualizăm cantitatea și prețul total
      ingredientDestinatar.cantitate += cantitate;
    }

    await ingredientDestinatar.save();

  }
  const bon = new Bon(req.body.bon);
  bon.locatie = locatie._id;
  bon.save();
  return res.redirect(`/ingredient/bon/Bon-${bon.index}-din-${data}`);
};





module.exports.bonTransfer = async (req, res, next) => {
  const bon = await Bon.findOne({}, {}, { sort: { _id: -1 } })
    .populate({
      path: "gestRecive",
      select: "nume",
    })
    .populate({
      path: "gestSend",
      select: "nume",
    });
  const locatie = req.user;
  const firma = await Locatie.findById(locatie._id);
  const userLogat = req.user.nestedUsers.find(
    (user) => user._id === req.session.userId
  );
  const options = { day: "2-digit", month: "2-digit", year: "numeric" };
  const date = bon.data
    .toLocaleDateString("en-GB", options)
    .replace(/\//g, "-");

  const doc = new PDFDocument({
    size: "A5",
    layout: "landscape",
  });

  // Add header
  doc
    .fontSize(9)
    .text(
      `${firma.dateFirma.nume} ${firma.dateFirma.cif} ${firma.dateFirma.rc} `,
      20,
      5,
      {
        width: 280,
      }
    );
  doc.fontSize(9).text(`${firma.dateFirma.adresa}`, 20, 15, {
    width: 280,
  });

  doc.moveDown();

  doc.lineWidth(0.2);
  doc.moveTo(15, 25).lineTo(260, 25).stroke();

  doc.moveDown();
  doc.font("Helvetica-Bold");
  doc.fontSize(12).text("Bon de transfer", 235, 40, {
    underline: true,
  });

  doc.moveDown();
  doc.font("Helvetica");
  doc.fontSize(10);
  doc.text("Nr. Bon", 130, 85, { width: 40, align: "center" });
  doc.text("Data", 185, 85, { width: 70, align: "center" });
  doc.text("Din Gesiunea", 255, 85, { width: 80, align: "center" });
  doc.text("In Gesiunea", 325, 85, { width: 80, align: "center" });

  doc.moveDown();
  doc.lineWidth(0.3);
  doc.moveTo(120, 98).lineTo(400, 98).stroke();

  doc.moveDown();
  doc.font("Helvetica");
  doc.fontSize(10);
  doc.text(bon.index, 130, 105, { width: 40, align: "center" });
  doc.text(date, 185, 105, { width: 70, align: "center" });
  doc.text(cap(bon.gestSend.nume), 255, 105, { width: 80, align: "center" });
  doc.text(cap(bon.gestRecive.nume), 325, 105, { width: 80, align: "center" });

  doc.moveDown();
  let y = 155;
  // Table headers
  doc.font("Helvetica-Bold");
  doc.fontSize(11);
  doc.text("Denumire Articol", 60, y, { width: 110, align: "left" });
  doc.text("UM", 220, y, { width: 60, align: "center" });
  doc.text("Qty", 330, y, { width: 60, align: "center" });
  doc.text("Pret", 430, y, { width: 100, align: "center" });

  // doc.moveDown();

  doc.lineWidth(0.2);
  doc
    .moveTo(50, y + 11)
    .lineTo(520, y + 11)
    .stroke();

  doc.moveDown();
  // Add table rows

  doc.font("Helvetica");
  doc.fontSize(10);
  let valoareIntTotal = 0;
  bon.ingredient.forEach((produs, i) => {
    doc.text(produs.nume, 60, y + i * 18 + 18, { width: 110, align: "left" });
    doc.text(produs.um, 220, y + i * 18 + 18, { width: 60, align: "center" });
    doc.text(produs.cantitate.toString(), 330, y + i * 18 + 18, {
      width: 60,
      align: "center",
    });
    doc.text(produs.pret, 430, y + i * 18 + 18, {
      width: 100,
      align: "center",
    });
    valoareIntTotal += parseFloat(produs.pret);
  });
  const height = bon.ingredient.length * 18;
  doc.lineWidth(0.4);
  doc
    .moveTo(50, y + height + 18)
    .lineTo(520, y + height + 18)
    .stroke();
  doc.font("Helvetica-Bold");
  doc.fontSize(12);
  doc.text("Total:", 370, y + height + 26);
  doc.text(`${valoareIntTotal}`, 430, y + height + 26, { align: "center" });
  doc.lineWidth(0.7);
  doc
    .moveTo(365, y + height + 40)
    .lineTo(520, y + height + 40)
    .stroke();

  doc.font("Helvetica-Bold");
  doc.fontSize(11);
  doc.text("Predat din gestiune", 15, y + height + 70, {
    width: 120,
    align: "left",
  });
  doc.text("Semnatura", 150, y + height + 70, { width: 70, align: "center" });
  doc.text("Primit in gestiune", 250, y + height + 70, {
    width: 100,
    align: "left",
  });
  doc.text("Semnatura", 380, y + height + 70, { width: 70, align: "center" });
  doc.text(`Data`, 460, y + height + 70, { width: 70, align: "center" });

  doc.font("Helvetica");
  doc.fontSize(11);
  doc.text("Nume:", 15, y + height + 88, {
    width: 120,
    align: "left",
  });
  doc.text("Prenume:", 15, y + height + 105, {
    width: 120,
    align: "left",
  });
  doc.text("Nume:", 250, y + height + 88, {
    width: 100,
    align: "left",
  });
  doc.text("Prenume:", 250, y + height + 105, {
    width: 100,
    align: "left",
  });
  doc.text(`${date}`, 460, y + height + 85, { width: 70, align: "center" });

  doc.end();

  res.type("application/pdf");
  doc.pipe(res);

  res.once("finish", () => {
    const chunks = [];
    doc.on("data", (chunk) => {
      chunks.push(chunk);
    });
    doc.on("end", () => {
      const buffer = Buffer.concat(chunks);
      const pdfUrl = `data:application/pdf;base64,${buffer.toString("base64")}`;
      res.send(
        `<iframe src="${pdfUrl}" style="width:100%;height:100%;" frameborder="0"></iframe>`
      );
    });
  });
};

module.exports.stocLive = async (req, res, next) => {
  const locatie = req.user;
  const ings = await Ingredient.find({ locatie: locatie });
  ings.sort((a, b) => (a.nume > b.nume ? 1 : b.nume > a.nume ? -1 : 0));
  res.render("stoc", { ings });
};

module.exports.renderEdit = async (req, res, next) => {
  const ing = await Ingredient.findById(req.params.id);
  res.render("ingEdit", { ing });
};

module.exports.edit = async (req, res, next) => {
  const { id } = req.params;
  const ingNou = await Ingredient.findByIdAndUpdate(id, { ...req.body.produs });
  await ingNou.save();
  req.flash("success", `Ai modificat cu succes ingredientul ${ingNou.nume}`);
  res.redirect("/produs/nomenclator");
};

module.exports.delete = async (req, res, next) => {
  const { id } = req.params;
  const ing = await Ingredient.findOne({ _id: id });
  await Ingredient.findByIdAndDelete(id);
  req.flash(
    "success",
    `Felicitări! Ai șters cu succes ingredientul: ${ing.nume}`
  );
  res.redirect("/produs/nomenclator");
};

module.exports.addFurnizor = async (req, res, next) => {
  const locatie = req.user;
  const { nume } = req.body.furnizor;
  const furnizor = new Furnizor(req.body.furnizor);
  furnizor.locatie = locatie;
  await furnizor.save();
  req.flash(
    "success",
    `Felicitări! Ai adăugat furnizorul ${nume} în baza de date!`
  );
  res.redirect("/produs/addProdus");
};

function round(num) {
  return Math.round(num * 1000) / 1000;
}

async function actualizeazaMagazie(req, res) {
  try {
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: "Eroare la actualizarea magaziei" });
  }
}

function cap(value) {
  return String(value).charAt(0).toUpperCase() + String(value).slice(1);
}
