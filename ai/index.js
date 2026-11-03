const mockService = require("./mockAiService");
const realService = require("./realAiService");

function getAiMode() {
  return process.env.AI_MODE === "real" ? "real" : "mock";
}

function getAiService() {
  return getAiMode() === "real" ? realService : mockService;
}

module.exports = {
  getAiMode,
  getAiService
};
