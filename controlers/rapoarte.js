const Nota = require('../models/nota')
const ExpressError = require('../utilities/expressError')
const PDFDocument = require("pdfkit");
const Client = require('../models/client')
const Produs = require('../models/produs')
const Factura = require('../models/factura')
const Ingredient = require('../models/ingredient')
const Furnizor = require('../models/furnizor')
const Gestiune = require('../models/gestiune')
const MainCat = require('../models/mainCat');
const Categorie = require('../models/categorie');
const Day = require('../models/day')
const Entry = require('../models/entry')


module.exports.api = async (req, res, next) => {
    const locatie = req.user
    const note = await Nota.find({ locatie: locatie })
    res.json(note)
}

module.exports.apiRecive = async (req, res, next) => {
    const userId = req.body.user
    const locatie = req.user
    const startDate = new Date(req.body.start)
    const endDate = new Date(req.body.end)
    if (userId === '1') {
        const note = await Nota.find({ data: { $gte: startDate, $lte: endDate }, locatie: locatie }).populate({ path: 'produse.produs' })
        res.json(note);
    } else {
        const note = await Nota.find({
            'user.id': userId,
            data: { $gte: startDate, $lte: endDate },
            locatie: locatie,
        }).populate({ path: 'produse.produs' })
        res.json(note)
    }
}


module.exports.apiNota = async (req, res, next) => {
    const locatie = req.user
    const id = req.body.id
    const nota = await Nota.findOne({ _id: id, locatie: locatie }).populate({ path: 'produse.produs' })
    // console.log(nota)
    res.json(nota)
}



module.exports.refreshTotal = async (req, res, next) => {
    const locatie = req.user
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setUTCHours(23, 59, 59, 999);
    const note = await Nota.find({ data: { $gte: startOfDay, $lte: endOfDay }, locatie: locatie }).populate({ path: 'produse.produs' })
    let marfa = 0;
    let prep = 0;
    let totalCash = 0;
    let totalCard = 0;
    let unregistred = 0;
    for (let nota of note) {
        if(!nota.unregistred){
            totalCard += nota.card;
            totalCash += nota.cash;
        } else {
            unregistred += nota.cash
        }
    }
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
    res.json({ totalCard, totalCash, marfa, prep, unregistred })
}

module.exports.renderFacturaForm = async (req, res, next) => {
    res.render('factura')
}

module.exports.renderDashboard = async (req, res, next) => {
    const locatie = req.user
    const produse = await Produs.find({ locatie: locatie })
    const ings = await Ingredient.find({ locatie: locatie }).populate({
        path: "gestiune",
        select: "nume",
    });
    const users = locatie.nestedUsers
    const furnizori = await Furnizor.find({ locatie: locatie })
    const gestiune = await Gestiune.find({ locatie: locatie })
    const mainCat = await MainCat.find({ locatie: locatie })
    const cats = await Categorie.find({ locatie: locatie })
    produse.sort((a, b) => (a.nume > b.nume ? 1 : b.nume > a.nume ? -1 : 0));
    ings.sort((a, b) => (a.nume > b.nume ? 1 : b.nume > a.nume ? -1 : 0));
    res.render('dashboard', { produse, ings, users, furnizori, gestiune, mainCat, cats, locatie })
}

module.exports.sendEntry = async (req, res, next) => {
    const locatie = req.user;
    const data = req.query.data
    const dateParts = data.split(".")
    const year = parseInt(dateParts[2]) + 2000
    const month = parseInt(dateParts[1]) - 1
    const day = parseInt(dateParts[0])
    const dateObject = new Date();
    dateObject.setFullYear(year);
    dateObject.setMonth(month);
    dateObject.setDate(day);
    dateObject.setUTCHours(0, 0, 0, 0);
    const regDay = await Day.findOne({ date: dateObject, locatie: locatie }).populate({ path: 'entry' })
    res.json({ regDay })
}

module.exports.addEntry = async (req, res, next) => {
    const locatie = req.user
    const { tip, date, description, amount } = req.body.entry
    const entryDate = new Date(date)
    const newEntry = new Entry({
        tip: tip,
        date: entryDate,
        description: description,
        amount: tip === 'expense' ? -amount : amount,
        locatie: locatie,
    })
    newEntry.save()
    const day = await Day.findOne({ date: entryDate, locatie: locatie }).populate({ path: 'entry' })
    if (day) {
        const daySum = day.entry.reduce((total, doc) => total + doc.amount, 0)
        day.entry.push(newEntry)
        const dayTotal = daySum + newEntry.amount + day.cashIn
        day.cashOut = dayTotal
        await day.save()
    } else {
        const newDay = new Day({
            locatie: locatie,
            date: entryDate,
            cashOut: newEntry.amount
        })
        newDay.entry.push(newEntry)
        await newDay.save()
        console.log('first day created')
    }

    res.redirect('back')
}

module.exports.deleteEntry = async (req, res, next) => {
    const locatie = req.user;
    const { id } = req.body;
    try {
        const entry = await Entry.findById(id)
        const day = await Day.findOne({ date: entry.date })
        await Entry.findByIdAndDelete(id)
        await Day.findOneAndUpdate({ _id: day._id }, { $pull: { entry: entry._id } }).exec()
        day.cashOut = day.cashOut - entry.amount
        day.save()
        res.status(200).json({ message: `Entry ${entry.description}, with the amount ${entry.amount} was deleted` })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: err.message })
    }
}

module.exports.factura = async (req, res, next) => {
    const locatie = req.user;
    const userLogat = locatie.nestedUsers.find(
        (user) => user._id === req.session.userId
    );
    const { nume, adresa, cif, rc, banca, telefon, email } = locatie.dateFirma
    const bancaNume = banca[0].nume
    const cont = banca[0].cont
    const { nrBon, clientId } = req.body.factura
    const startDate = new Date(req.body.factura.dataBon)
    const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000)
    const nota = await Nota.find({ data: { $gte: startDate, $lt: endDate }, locatie: locatie._id, index: nrBon })
    if (!nota.length) {
        req.flash('error', "Bonul nu a fost gasit!")
        return res.redirect('back')
    }
    if (!clientId) {
        req.flash('error', "Clientul nu a fost gasit!")
        return res.redirect('back')
    }
    const client = await Client.findById(clientId)

    const produseNota = nota[0].produse
    let produseFact = []
    for (let i = 0; i < produseNota.length; i++) {
        const nume = produseNota[i].nume
        const produsDb = await Produs.find({ locatie: locatie, nume: nume })
        produseFact.push(...produsDb)
    };
    const data = Date.now()
    const factura = new Factura({
        serie: 'CFT',
        data: data,
        locatie: locatie._id,
        client: clientId,
        produse: produseFact
    })
    await factura.save()
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    const date = factura.data
        .toLocaleDateString("en-GB", options)
        .replace(/\//g, "-");

    const doc = new PDFDocument({
        size: "A4",
        layout: "portrait",
    });

    //HEADER FURNIZOR

    //Nume furnizor
    doc.fontSize(10)
    doc.text('Furnizor', 25 + 10, 10)
    doc.fontSize(18);
    doc.font('Times-Bold')
    doc.text(`${nume}`, 25 + 10, 25);
    doc.lineWidth(1.3);
    doc.moveTo(25 + 10, 45).lineTo(560, 45).stroke();

    //header date firma
    doc.fontSize(10);
    doc.text(`C.I.F.:`, 25 + 10, 50, { width: 30, align: "left" });
    doc.text(`Nr. Reg. Com.:`, 25 + 10, 62, { width: 70, align: "left" });
    doc.text(`Capital social:`, 25 + 10, 74, { width: 70, align: "left" });
    doc.text(`Adresa:`, 25 + 10, 86, { width: 38, align: "left" })
    doc.text(`Telefon:`, 25 + 10, 122, { width: 40, align: "left" })
    doc.text(`Email:`, 25 + 10, 134, { width: 35, align: "left" })
    doc.text(`Banca:`, 25 + 10, 146, { width: 35, align: "left" })
    doc.text(`Cont:`, 25 + 10, 158, { width: 30, align: "left" })

    //date firma

    doc.fontSize(10);
    doc.font('Times-Roman')
    doc.text(`${cif}`, 55 + 10, 50);
    doc.text(`${rc}`, 95 + 10, 62);
    doc.text(`200 lei`, 95 + 10, 74);
    doc.text(`${adresa}`, 25 + 10, 86 + 12, { width: 220, align: "left" })

    doc.text(`${telefon}`, 65 + 10, 122)
    doc.text(`${email}`, 60 + 10, 134)
    doc.text(`${bancaNume}`, 60 + 10, 146)
    doc.text(`${cont}`, 55 + 10, 158)

    //HEADER CLIENT
    //Nume client
    doc.fontSize(10)

    doc.fontSize(12);
    doc.font('Times-Bold')


    // header date client
    doc.fontSize(10);
    doc.font('Times-Bold')
    doc.text('Client:', 395 - 40, 50, { width: 35, align: "left" })
    doc.text(`C.I.F.:`, 395 - 40, 70 - 7, { width: 30, align: "left" });
    doc.text(`Nr. Reg. Com.:`, 395 - 40, 82 - 7, { width: 70, align: "left" });
    doc.text(`Adresa:`, 395 - 40, 94 - 7, { width: 40, align: "left" })
    doc.text(`Telefon:`, 395 - 40, 118 + 5, { width: 40, align: "left" })
    doc.text(`Email:`, 395 - 40, 130 + 5, { width: 35, align: "left" })
    doc.text(`Banca:`, 395 - 40, 142 + 5, { width: 35, align: "left" })
    doc.text(`Cont:`, 395 - 40, 154 + 5, { width: 35, align: "left" })

    //date client
    doc.fontSize(10);
    doc.font('Times-Roman')
    doc.text(`${client.nume}`, 430 - 40, 50, { width: 130, align: "left" });
    doc.text(`${client.cif}`, 415 + 10 - 40, 70 - 7, { width: 145, align: "left" });
    doc.text(`${client.rc}`, 455 + 10 - 40, 82 - 7, { width: 105, align: "left" });
    doc.text(`${client.adresa || ''}`, 395 - 40, 94 + 5, { width: 215, align: "left" })
    doc.text(`${client.telefon || ''}`, 425 + 10 - 40, 118 + 5, { width: 165, align: "left" })
    doc.text(`${client.email || ''}`, 420 + 10 - 40, 130 + 5, { width: 170, align: "left" })
    doc.text(`${client.banca[0].nume || ''}`, 420 + 10 - 40, 142 + 5, { width: 170, align: "left" })
    doc.text(`${client.banca[0].cont || ''}`, 420 + 10 - 40, 154 + 5, { width: 170, align: "left" })

    //Titlu factura

    doc.roundedRect(220, 220, 130, 50, 5)
    doc.lineWidth(0.5);
    doc.stroke()
    doc.font('Times-Roman')
    doc.fontSize(24)
    doc.text('FACTURA', 228, 190)
    doc.fontSize(11)
    doc.text('Numar:', 225, 190 + 35, { width: 40, align: "left" })
    doc.text('Serie:', 225, 205 + 35, { width: 40, align: "left" })
    doc.text('Data:', 225, 220 + 35, { width: 40, align: "left" })

    // Titlu Factura Date
    doc.font('Times-Bold')
    doc.text(`${factura.nr}`, 265, 190 + 35)
    doc.text(`${factura.serie}`, 265, 205 + 35)
    doc.text(`${date}`, 265, 220 + 35)

    //header produse
    doc.rect(25, 280, 18, 30)
    doc.lineWidth(0.5);
    doc.stroke()

    doc.font('Times-Roman')
    doc.fontSize(9)
    doc.text('Nr.', 26, 281)
    doc.text('crt.', 26, 296)

    doc.rect(43, 280, 230, 30)
    doc.lineWidth(0.5);
    doc.stroke()

    doc.text('Denumirea produselor si serviciilor', 44, 293, { width: 228, align: "center" })

    doc.rect(273, 280, 30, 30)
    doc.lineWidth(0.5);
    doc.stroke()

    doc.text('U.M.', 275, 293, { width: 28, align: "center" })

    doc.rect(303, 280, 60, 30)
    doc.lineWidth(0.5);
    doc.stroke()

    doc.text('Cantitate', 305, 293, { width: 58, align: "center" })

    doc.rect(363, 280, 60, 30)
    doc.lineWidth(0.5);
    doc.stroke()

    doc.text('Pret unitar', 365, 287, { width: 58, align: "center" })
    doc.text('fara T.V.A.', 365, 299, { width: 58, align: "center" })

    doc.rect(423, 280, 60, 30)
    doc.lineWidth(0.5);
    doc.stroke()

    doc.text('Valoare', 425, 287, { width: 58, align: "center" })
    doc.text('fara T.V.A.', 425, 299, { width: 58, align: "center" })

    doc.rect(483, 280, 77, 30)
    doc.lineWidth(0.5);
    doc.stroke()

    doc.text('T.V.A.', 485, 285, { width: 75, align: "center" })
    doc.text('Cota', 485, 299, { width: 35, align: "left" })
    doc.text('Valoare', 521, 299, { width: 38, align: "right" })

    //little header
    doc.rect(25, 311, 18, 15)
    doc.lineWidth(0.5);
    doc.stroke()

    doc.text('0', 26, 315, { width: 17, align: "center" })

    doc.rect(43, 311, 230, 15)
    doc.lineWidth(0.5);
    doc.stroke()

    doc.text('1', 44, 315, { width: 228, align: "center" })

    doc.rect(273, 311, 30, 15)
    doc.lineWidth(0.5);
    doc.stroke()

    doc.text('2', 274, 315, { width: 28, align: "center" })

    doc.rect(303, 311, 60, 15)
    doc.lineWidth(0.5);
    doc.stroke()

    doc.text('3', 304, 315, { width: 58, align: "center" })

    doc.rect(363, 311, 60, 15)
    doc.lineWidth(0.5);
    doc.stroke()

    doc.text('4', 364, 315, { width: 58, align: "center" })

    doc.rect(423, 311, 60, 15)
    doc.lineWidth(0.5);
    doc.stroke()

    doc.text('5 = 3 x 4', 424, 315, { width: 58, align: "center" })

    doc.rect(483, 311, 77, 15)
    doc.lineWidth(0.5);
    doc.stroke()

    doc.text('6', 484, 315, { width: 75, align: "center" })
    y = 317
    let heghtValue = 12
    //Body produse
    doc.rect(25, 327, 18, 330)
    doc.lineWidth(0.5);
    doc.stroke()

    doc.rect(43, 327, 230, 330)
    doc.lineWidth(0.5);
    doc.stroke()

    doc.rect(273, 327, 30, 330)
    doc.lineWidth(0.5);
    doc.stroke()

    doc.rect(303, 327, 60, 330)
    doc.lineWidth(0.5);
    doc.stroke()

    doc.rect(363, 327, 60, 330)
    doc.lineWidth(0.5);
    doc.stroke()

    doc.rect(423, 327, 60, 330)
    doc.lineWidth(0.5);
    doc.stroke()

    doc.rect(483, 327, 77, 330)
    doc.lineWidth(0.5);
    doc.stroke()
    // radare produse

    let valFaraTva = 0
    let valTva = 0

    factura.produse.forEach((el, i) => {
        let newValue = y + heghtValue
        doc.text(`${i + 1}`, 26, newValue, { width: 17, align: "center" })
        doc.text(`${el.nume}`, 47, newValue, { width: 225, align: 'left' })
        doc.text(`Buc`, 274, newValue, { width: 28, align: "center" })
        doc.text(`${el.cantitate}.00`, 304, newValue, { width: 58, align: "center" })
        doc.text(`${round(el.pret - (el.pret * (el.cotaTva / 100)))}`, 364, newValue, { width: 58, align: "center" })
        doc.text(`${round(el.cantitate * (el.pret - (el.pret * (el.cotaTva / 100))))}`, 424, newValue, { width: 58, align: "center" })
        doc.text(`${el.cotaTva}%`, 486, newValue, { width: 35, align: "left" })
        doc.text(`${round((el.cantitate * el.pret) - (el.cantitate * (el.pret - (el.pret * (el.cotaTva / 100)))))}0`, 523, newValue, { width: 30, align: "right" })
        const valTotProdFaraTva = round(el.cantitate * (el.pret - (el.pret * (el.cotaTva / 100))))
        const valTotProdTva = round((el.cantitate * el.pret) - (el.cantitate * (el.pret - (el.pret * (el.cotaTva / 100)))))
        valFaraTva += valTotProdFaraTva
        valTva += valTotProdTva
        heghtValue += 12
    })

    doc.fontSize(10)
    doc.font('Times-Roman')
    doc.text(`Document intocmit de ${userLogat.nume}`, 27, 659)
    //footer factura
    doc.rect(25, 669, 100, 105)
    doc.lineWidth(0.5);
    doc.stroke()

    doc.fontSize(10)
    doc.font('Times-Roman')
    doc.text('Semnatura si', 26, 675, { width: 98, align: 'center' })
    doc.text('stampila', 26, 687, { width: 98, align: 'center' })
    doc.text('furnizorului', 26, 699, { width: 98, align: 'center' })

    doc.rect(125, 669, 238, 105)
    doc.lineWidth(0.5);
    doc.stroke()

    doc.fontSize(9)
    doc.text('Numele delegatului:', 126, 672, { width: 80, align: 'right' })
    doc.text('Buletin/CI:', 126, 688, { width: 80, align: 'right' })
    doc.text('Seria:', 216, 688, { width: 30, align: 'left' })
    doc.text('Nr.:', 256, 688, { width: 50, align: 'left' })
    doc.text('Eliberat:', 126, 704, { width: 80, align: 'right' })

    doc.text('Semnatura Delegat', 126, 722)
    doc.rect(363, 669, 60, 105)
    doc.lineWidth(0.5);
    doc.stroke()
    doc.font('Times-Bold')
    doc.fontSize(12)
    doc.text('TOTAL', 365, 672)
    doc.text('TOTAL', 425, 725)
    doc.text(`${round(valFaraTva + valTva)} Lei`, 484, 725, { width: 73, align: 'right' })
    doc.fontSize(9)
    doc.font('Times-Roman')
    doc.text('Semnatura', 364, 721, { width: 58, align: 'center' })
    doc.text('de', 364, 734, { width: 58, align: 'center' })
    doc.text('primire', 364, 746, { width: 58, align: 'center' })
    doc.font('Times-Bold')
    doc.text(`${round(valFaraTva)} Lei`, 424, 675, { width: 58, align: 'center' })
    doc.text(`${round(valTva)} Lei`, 484, 675, { width: 73, align: 'right' })
    doc.lineWidth(0.3);
    doc.moveTo(125, 719).lineTo(560, 719).stroke();



    doc.rect(423, 669, 60, 105)
    doc.lineWidth(0.5);
    doc.stroke()

    doc.rect(483, 669, 77, 105)
    doc.lineWidth(0.5);
    doc.stroke()







    doc.end()
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
    })
}

function round(num) {
    return Math.round(num * 1000) / 1000;
}


// module.exports.apiTotal = async (req, res, next) => {
//     const closeConnection = req.query.close
//     console.log(closeConnection)
//     res.setHeader("Content-Type", "text/event-stream");
//     res.setHeader("Cache-Control", "no-cache");
//     res.setHeader("Connection", "keep-alive");

//     const locatie = req.user
//     const startOfDay = new Date();
//     startOfDay.setUTCHours(0, 0, 0, 0);
//     const endOfDay = new Date();
//     endOfDay.setUTCHours(23, 59, 59, 999);

//     const changeStream = Nota.watch({ fullDocument: "updateLookup" });
//     changeStream.on("change", async (change) => {
//         if (
//             change.operationType === "insert"
//         ) {
//             const note = await Nota.find({ data: { $gte: startOfDay, $lte: endOfDay }, locatie: locatie }).exec()
//             let totalCash = 0
//             let totalCard = 0
//             for (let nota of note) {
//                 totalCard += nota.card;
//                 totalCash += nota.cash;
//             }
//             const totals = { cash: totalCash, card: totalCard }
//             console.log(totals)
//             console.log(closeConnection)
//             if (closeConnection) {
//                 changeStream.close()
//                 res.end();
//                 return;
//             }
//             res.write(`data: ${JSON.stringify(totals)}\n\n`);
//         }
//     });
// }