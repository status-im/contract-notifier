const Joi = require("@hapi/joi");

module.exports = Joi.object({
  from: [
    Joi.object({
      name: Joi.string(),
      email: Joi.string().email()
    }),
    Joi.string().email()
  ],
  templates: Joi.object({
    subscribe: Joi.string(),
    variables: Joi.object().optional(),
    contracts: Joi.object().pattern(
      Joi.string().pattern(/^0x[0-9A-Za-z]{40}$/),
      Joi.object().pattern(
        Joi.string(),
        Joi.object({
          ABI: Joi.object({
            name: Joi.string(),
            type: Joi.string().pattern(/^event$/),
            inputs: Joi.array().items(
              Joi.object({
                indexed: Joi.bool(),
                name: Joi.string(),
                type: Joi.string()
              })
            )
          }).unknown(),
          index: [Joi.string(), Joi.func().arity(3)],
          template: Joi.string(),
          data: Joi.func()
            .arity(2)
            .optional(),
          filter: Joi.func()
            .arity(2)
            .optional()
        })
      )
    )
  })
});
