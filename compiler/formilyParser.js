// IMPORTS
const {INPUT_FIELD_TYPES} = require('./types');

class FieldParsers {
    // INPUT FIELD PARSER
    static Input(fieldDetail) {
      const title = fieldDetail['title'].replace(/\s/g, '');
      return {
        title,
        component: "Input",
        description: fieldDetail['description'],
      }
    }
  
    // SELECT FIELD PARSER
    static Select(fieldDetail) {
      const title = fieldDetail['title'].replace(/\s/g, '');
      return {
        title,
        component: "Select",
        description: fieldDetail['description'],
        options: fieldDetail['enum'].map((option, index) => {
            return ({
              key: option['value'],
              text: option['label'],
              isEnabled: true,
              showTextInput: true
            })
          }),
      }
    }
  
    // TEXTAREA FIELD PARSER
    static TextArea(fieldDetail) {
      // TODO: Implement TextArea
    }
  }

  // Formily Input Field Details Parser
const parseFormilyInputFieldDetails = (fieldDetail) => {
    const component = fieldDetail['x-component'];  
    // Switch case for each type of component
  
    switch (component) {
      case INPUT_FIELD_TYPES.INPUT:
        return FieldParsers.Input(fieldDetail);
        break;
      case INPUT_FIELD_TYPES.SELECT:
        return FieldParsers.Select(fieldDetail)
        break;
      case INPUT_FIELD_TYPES.TEXTAREA:
        // TODO: Implement TextArea
        break;
    }
  
    return {
      component: "Error",
      description: "Component not found",
    }
  
  }
  
// Formily JSON Parser
const parseFormilyJSON = (properties) => {
    const fieldDetails = [];
    
    const fields = Object.keys(properties);
    fields.forEach((field) => {
      fieldDetails.push(parseFormilyInputFieldDetails(properties[field]));
    });
    return fieldDetails;
}

module.exports = parseFormilyJSON;