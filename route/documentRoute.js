const express = require("express");
const router = express.Router();
const documentController = require("../controller/documentController");

router.post("/createApplicants", documentController.createApplicants);
router.post("/addDocument", documentController.upload);

module.exports = router;
