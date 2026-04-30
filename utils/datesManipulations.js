const { DateTime } = require("luxon");

const APP_TIME_ZONE = "UTC"; // 🌍 backend standard timezone

const convertFromToPlusTime2CreatedAt = (from, to) => {
  let createdAt = {};

  if (from) {
    const fromDate = DateTime.fromJSDate(new Date(from), {
      zone: APP_TIME_ZONE,
    })
      .startOf("day")
      .toJSDate();

    createdAt.$gte = fromDate;
  }

  if (to) {
    const toDate = DateTime.fromJSDate(new Date(to), {
      zone: APP_TIME_ZONE,
    })
      .endOf("day")
      .toJSDate();

    createdAt.$lte = toDate;
  }

  return Object.keys(createdAt).length ? createdAt : undefined;
};

module.exports = {
  convertFromToPlusTime2CreatedAt,
};