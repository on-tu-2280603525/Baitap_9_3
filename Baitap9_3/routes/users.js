var express = require("express");
var router = express.Router();
let { postUserValidator, validateResult } = require('../utils/validatorHandler')
let userController = require('../controllers/users')

let { checkLogin, checkRole } = require('../utils/authHandler.js')


let userModel = require("../schemas/users");
//- Strong password

router.get("/", checkLogin,
  checkRole("ADMIN", "MODERATOR"), async function (req, res, next) {
    let users = await userModel
      .find({ isDeleted: false })
      .populate({
        'path': 'role',
        'select': "name"
      })
    res.send(users);
  });

router.get("/:id", checkLogin, async function (req, res, next) {
  try {
    // allow if admin/mod or requesting own profile
    let allowed = false;
    if (req.userId == req.params.id) allowed = true;
    let me = await userModel.findById(req.userId).populate('role');
    if (me && (me.role.name === 'ADMIN' || me.role.name === 'MODERATOR')) allowed = true;
    if (!allowed) return res.status(403).send({ message: 'ban khong co quyen' });

    let result = await userModel
      .find({ _id: req.params.id, isDeleted: false })
    if (result.length > 0) {
      res.send(result);
    }
    else {
      res.status(404).send({ message: "id not found" });
    }
  } catch (error) {
    res.status(404).send({ message: "id not found" });
  }
});

router.post("/", checkLogin, checkRole("ADMIN"), postUserValidator, validateResult,
  async function (req, res, next) {
    try {
      let newItem = await userController.CreateAnUser(
        req.body.username,
        req.body.password,
        req.body.email,
        req.body.role
      )
      // populate cho đẹp
      let saved = await userModel
        .findById(newItem._id)
      res.send(saved);
    } catch (err) {
      res.status(400).send({ message: err.message });
    }
  });

router.put("/:id", checkLogin, checkRole("ADMIN"), async function (req, res, next) {
  try {
    let id = req.params.id;
    let updatedItem = await userModel.findById(id);
    for (const key of Object.keys(req.body)) {
      updatedItem[key] = req.body[key];
    }
    await updatedItem.save();

    if (!updatedItem) return res.status(404).send({ message: "id not found" });

    let populated = await userModel
      .findById(updatedItem._id)
    res.send(populated);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

router.delete("/:id", checkLogin, checkRole("ADMIN"), async function (req, res, next) {
  try {
    let id = req.params.id;
    let updatedItem = await userModel.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );
    if (!updatedItem) {
      return res.status(404).send({ message: "id not found" });
    }
    res.send(updatedItem);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

// change password endpoint for authenticated user
router.put('/change-password', checkLogin, async function (req, res, next) {
  try {
    let { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).send({ message: 'oldPassword and newPassword are required' });
    }
    let updated = await userController.ChangePassword(
      req.userId,
      oldPassword,
      newPassword
    );
    res.send({ message: 'password updated successfully' });
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

module.exports = router;