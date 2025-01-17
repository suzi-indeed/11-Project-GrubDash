const router = require("express").Router();

// TODO: Implement the /dishes routes needed to make the tests pass
// add two routes: /dishes, and /dishes/:dishId and attach the handlers (create, read, update, and list) exported from src/dishes/dishes.controller.js.
const controller = require("./dishes.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");
router
    .route("/:dishId")
    .get(controller.read)
    .put(controller.update)
    .all(methodNotAllowed);
router
    .route("/")
    .get(controller.list)
    .post(controller.create)
    .all(methodNotAllowed);

module.exports = router;

