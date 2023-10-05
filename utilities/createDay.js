const Day = require('../models/day')


const createCashRegisterDay = async (locatie) => {
  console.log(locatie._id)
  const currentDate = new Date()
  let defaultValue = 0

  const latestDocument = await Day.findOne({ locatie: locatie }, null, { sort: { date: -1 } });

  let startDate = latestDocument ? latestDocument.date : currentDate;
  let cashIn = latestDocument ? latestDocument.cashOut : defaultValue;

  while (startDate < currentDate) {
    const existingDocument = await Day.findOne({ date: startDate });
    if (!existingDocument) {
      const newDocument = new Day({ date: startDate, cashIn: cashIn, locatie: locatie._id });
      await newDocument.save();
      console.log(newDocument)
      console.log('Document created for', startDate);
    }
    startDate.setDate(startDate.getDate() + 1);
  }
};

module.exports = createCashRegisterDay