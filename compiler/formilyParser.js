// IMPORTS
const {INPUT_FIELD_TYPES} = require('./types');

class FieldParsers {
    // INPUT FIELD PARSER
    static Input(fieldDetail) {
      const title = fieldDetail['title'].replace(/\s/g, '');
      return {
        title,
        component: "Input",
        description: fieldDetail['description'] || "Description not provided",
        validation: fieldDetail['x-validator'] || "No validation provided",
      }
    }
  
    // SELECT FIELD PARSER
    static Select(fieldDetail) {
      const title = fieldDetail['title'].replace(/\s/g, '');
      return {
        title,
        component: "Select",
        description: fieldDetail['description'] || "Description not provided",
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
        title: "Error",
        component: "Error",
        description: "Component not found",
    }
  
  }
  
// Formily JSON Parser
// properties: DTO
/*
"properties": {
      "86b3q5s2s1f": {
        "type": "string",
        "title": "Input",
        "x-component": "Input",
        "x-validator": "email",
        "description": "Description 1"
      },
      "yr91f3tpb7e": {
        "title": "Select Item",
        "x-component": "Select",
        "x-validator": [],
        "enum": [
          {
            "children": [], // later
            "label": "Item 1 label",
            "value": "Item 1 value"
          },
          {
            "children": [],
            "label": "Item 2 label",
            "value": "Item 2 value"
          }
        ],
      }
    },
*/
const parseFormilyJSON = (properties) => {
    const fieldDetails = [];
    
    const fields = Object.keys(properties);
    fields.forEach((field) => {
      fieldDetails.push(parseFormilyInputFieldDetails(properties[field]));
    });
    return fieldDetails;
}

// fieldDetails: DTO
/*
{
    title: "Input",
    component: "Input",
    "description": "Description 1",
    "validation": "email"
},
{
    title: "SelectItem",
    component: "Select",
    description: "Description not provided",
    options: [
        {
            key: "Item 1 value",
            text: "Item 1 label",
            isEnabled: true,
            showTextInput: true
        },
        {
            key: "Item 2 value",
            text: "Item 2 label",
            isEnabled: true,
            showTextInput: true
        }
    ]
}
*/

module.exports = parseFormilyJSON;