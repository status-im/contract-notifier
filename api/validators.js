const { hexValidator } = require("./utils");
const { check } = require("express-validator");

module.exports = {
  subscribe:  [
    check("signature")
      .exists()
      .isLength({ min: 132, max: 132 })
      .custom(hexValidator),
    check("address")
      .exists()
      .isLength({ min: 42, max: 42 })
      .custom(hexValidator),
    check("email")
      .exists()
      .isEmail(),
    check("dappId").exists()
  ],
  unsubscribe: [
    check("signature")
      .exists()
      .isLength({ min: 132, max: 132 })
      .custom(hexValidator),
    check("address")
      .exists()
      .isLength({ min: 42, max: 42 })
      .custom(hexValidator),
    check("dappId").exists()
  ],
  confirm: [check("token").exists()],
  userExists:  [
    check("address")
      .exists()
      .isLength({ min: 42, max: 42 })
      .custom(hexValidator),
    check("dappId").exists()
  ]
};
