// IMPORTS
const parseFormilyJSON = require('./formilyParser');
const Flowise = require('./flowise');

function formily_flowise_compiler(formilyJSON) {

  // Parsing formilyJSON -> Array of {title, component, description, validation(optional), options(optional)}
  const fieldDetails = parseFormilyJSON(formilyJSON.schema.properties);

  const flowiseJSON = new Flowise(fieldDetails);

  return flowiseJSON.toJSON();
}

module.exports = formily_flowise_compiler;