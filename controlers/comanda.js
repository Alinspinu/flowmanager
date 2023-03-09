const Nota = require("../models/nota");
const Categorie = require("../models/categorie");
const Comanda = require("../models/comanda");

module.exports.renderBuc = async (req, res, next) => {
  res.render("comanda/buc");
};

module.exports.sendComenziBuc = async (req, res, next) => {
  const since = req.query.since || Date.now();
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const changeStream = Comanda.watch({ fullDocument: "updateLookup" });
  changeStream.on("change", async (change) => {
    if (
      change.operationType === "insert" &&
      change.fullDocument.creataLa >= since
    ) {
      const newOrder = await Comanda.findOne({ _id: change.fullDocument._id, mainCat: '63fb45890a71528e8d49cb23' }).exec();

      res.write(`data: ${JSON.stringify(newOrder)}\n\n`);
    }
  });
};
module.exports.renderBar = async (req, res, next) => {
  res.render("comanda/barista");
};

module.exports.sendComenziBar = async (req, res, next) => {
  const since = req.query.since || Date.now();
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const changeStream = Comanda.watch({ fullDocument: "updateLookup" });
  changeStream.on("change", async (change) => {
    if (
      change.operationType === "insert" &&
      change.fullDocument.creataLa >= since
    ) {
      const newOrder = await Comanda.findOne({ _id: change.fullDocument._id, mainCat: '63fb457d0a71528e8d49cb1d' }).exec();

      res.write(`data: ${JSON.stringify(newOrder)}\n\n`);
    }
  });
}



module.exports.sendIstBuc = async (req, res, next) => {
  const userId = req.session.userId
  const locatie = req.user
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setUTCHours(23, 59, 59, 999);
  const comenzi = await Comanda.find({ creataLa: { $gte: startOfDay, $lte: endOfDay }, locatie: locatie, userId: userId })
  res.render('comanda/istoricBuc', { comenzi })
}



module.exports.sendIstBarista = async (req, res, next) => {
  const userId = req.session.userId
  const locatie = req.user
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setUTCHours(23, 59, 59, 999);
  const comenzi = await Comanda.find({ creataLa: { $gte: startOfDay, $lte: endOfDay }, locatie: locatie, userId: userId })
  res.render('comanda/istoricBarista', { comenzi })
}

module.exports.renderComNetBar = async (req, res, next) => {
  const locatie = req.user
  const comenzi = await Comanda.find({ locatie: locatie, mainCat: "63fb457d0a71528e8d49cb1d", status: "open" })
  res.json(comenzi)
}

module.exports.renderComNetBuc = async (req, res, next) => {
  const locatie = req.user
  const comenzi = await Comanda.find({ locatie: locatie, mainCat: "63fb45890a71528e8d49cb23", status: "open" })
  res.json(comenzi)
}