module.exports = {
  delay: function (timeout) {
    return new Promise((resolve) => setTimeout(resolve, timeout));
  },
};
