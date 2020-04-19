const httpRespond = {};

httpRespond.severResponse = (res, response) => {
  return res.send(response);
};

module.exports = httpRespond;
