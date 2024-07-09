// START NODE
const startNode = {
        "id": "start",
        "data": {
          "id": "start",
          "name": "start",
          "type": "Output",
          "label": "Start",
          "inputs": {},
          "outputs": {
            "startPointer": ""
          },
          "category": "Miscellaneous",
          "selected": false,
          "baseClasses": [
            "xMessage"
          ],
          "description": "Start pointer Points to node  ",
          "inputParams": [],
          "inputAnchors": [],
          "outputAnchors": [
            {
              "id": "start-output-startPointer-xMessage",
              "name": "startPointer",
              "type": "xMessage",
              "label": "start Pointer"
            }
          ]
        },
        "type": "customNode",
        "width": 300,
        "height": 113,
        "dragging": false,
        "position": {
          "x": 409.5560193025037,
          "y": 25.92199759211908
        },
        "selected": false,
        "positionAbsolute": {
          "x": 409.5560193025037,
          "y": 25.92199759211908
        },
        "style": {}
      };

const INPUT_FIELD_TYPES = {
  INPUT: "Input",
  SELECT: "Select",
  TEXTAREA: "Input.TextArea",
}

class FlowiseCode{
  static msg_init = "const msg = JSON.parse($0);\n";
  static msg_end = "return JSON.stringify(msg);";

  // ASK QUESTION CODE
  static AskQuestion(description){
    return `msg.payload.text = "${description}";\n`
  }

  // GET INPUT CODE
  static GetInput(title){
    const s1 =  `let formInput = msg.transformer.metaData.formInput;\n`;
    const s2 = `if(formInput){\n`;
    const s3 = `formInput = {...formInput, \"${title}\": msg.payload.text};\n`;
    const s4 = `} else {\n`;
    const s5 = `formInput = {\"${title}\": msg.payload.text};\n`;
    const s6 = `}\n`;
    const s7 = `msg.transformer.metaData.formInput = formInput;\n`;

    return s1 + s2 + s3 + s4 + s5 + s6 + s7;
  }

  // INPUT FIELD CODE
  static Input(fieldDetail) {
    return this.AskQuestion(fieldDetail['description']);
  }

  // SELECT FIELD CODE
  static Select(fieldDetail) {
    const ask = this.AskQuestion(fieldDetail['description']);
    const buttonChoices = "msg.payload.buttonChoices =";
    const optionsJSON = JSON.stringify({
      header: fieldDetail['description'],
      choices: fieldDetail['options'],
    });
    const options = `${optionsJSON};\n`;
    return ask + buttonChoices + options;
  }

  // TEXTAREA FIELD CODE
  static TextArea(fieldDetail) {}
}

// Field Parsers
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

class Flowise {
  constructor(parsedformilyFields){
    this.fields = parsedformilyFields;
    this.nodes = [startNode];
    this.edges = [];
    this.createGraph();
  }

  toJSON() {
    return {
      "nodes": this.nodes,
      "edges": this.edges,
      "viewport": {
        "x": -89.25227931693917,
        "y": 282.4605317435965,
        "zoom": 0.4464677076656672
      },
      "name": ""
    }
  }

  createGraph() {
    // Start Node was already created
    const fields = this.fields;
    // console.log("All Fields: ", fields);

    // Create Code Runner and User Feedback Loop Nodes for each field
    fields.forEach((field, index) => {
      const id = `FIELD_${index}`;
      const prevField = index != 0 ? fields[index-1] : null;

      // Create Code Runner Node
      const codeRunnerNODE = this.codeRunnerNode(prevField, field, id, index);

      // Create Edge
      const prevNode = this.nodes.slice(-1)[0];
      const edgeIn = this.createEdge(prevNode, codeRunnerNODE);

      // Push to nodes and edges connecting previous node to current node
      this.nodes.push(codeRunnerNODE);
      this.edges.push(edgeIn);

      // Create User Feedback Loop Node
      const userFeedbackLoopNODE = this.userFeedbackLoopNode(field, id, index);

      // Create Edge
      const edgeOut = this.createEdge(codeRunnerNODE, userFeedbackLoopNODE);

      // Push to nodes and edges connecting current node to user feedback loop node
      this.nodes.push(userFeedbackLoopNODE);
      this.edges.push(edgeOut);
    });

    // Create Last Node
    const prevField = fields.slice(-1)[0];
    const lastNode = this.codeRunnerNode(prevField,{
      title: "Thank You!",
      description: "Thank You!",
      component: "END"
    }, `END_${fields.length}`, fields.length);

    // Create Edge
    const prevNode = this.nodes.slice(-1)[0];
    const edge = this.createEdge(prevNode, lastNode);

    // Push to nodes and edges connecting previous node to current node
    this.nodes.push(lastNode);
    this.edges.push(edge);
  }

  codeRunnerNode(prevField, field, id, index){
    // console.log("Prev: ",prevField);
    // console.log("Field: ",field);
    // console.log("ID: ",id);
    // console.log("Index: ",index);

    const component = field['component'];
    let code = FlowiseCode.msg_init;

    // Take input from previous field and store it in formInputs (if index != 0)
    if(index != 0){
      code += FlowiseCode.GetInput(prevField['title']);
    }
    // ASK NEXT QUESTION: set payload for the current field (description) handle different components differently
    switch (component) {
      case INPUT_FIELD_TYPES.INPUT:
        code += FlowiseCode.Input(field);
        break;
      case INPUT_FIELD_TYPES.SELECT:
        code += FlowiseCode.Select(field);
        break;
      case INPUT_FIELD_TYPES.TEXTAREA:
        // TODO: Implement TextArea
        break;
      case "END":
        code += FlowiseCode.AskQuestion("Thank You!");
        break;
    }

    // If last field, then return the msg
    code += FlowiseCode.msg_end;

    const xMessage = [`start.data.instance`];
    for(let i=0; i<index; i++){
      xMessage.push(`USER_FEEDBACK_LOOP_FIELD_${i}.data.instance`);
    }
    
    const node = {
      "id": `CODE_RUNNER_${id}`,
      "data": {
        "id": `CODE_RUNNER_${id}`,
        "name": "CODE_RUNNER",
        "type": "Output",
        "label": "Code Runner Transformer",
        "inputs": {
          "code": code,
          "xmessage": xMessage
        },
        "outputs": {
          "onError": "",
          "onSuccess": ""
        },
        "category": "GenericTransformer",
        "selected": false,
        "baseClasses": [
          "xMessage"
        ],
        "description": "A code runner capable of running custom JS code.",
        "inputParams": [
          {
            "id": `CODE_RUNNER_${id}-input-code-ide`,
            "name": "code",
            "rows": 2,
            "type": "ide",
            "label": "Code"
          },
          {
            "id": `CODE_RUNNER_${id}-input-sideEffects-json`,
            "name": "sideEffects",
            "rows": 2,
            "type": "json",
            "label": "SideEffects"
          }
        ],
        "inputAnchors": [
          {
            "id": `CODE_RUNNER_${id}-input-xmessage-xMessage`,
            "list": true,
            "name": "xmessage",
            "type": "xMessage",
            "label": "XMessage"
          }
        ],
        "outputAnchors": [
          {
            "id": `CODE_RUNNER_${id}-output-onSuccess-xMessage`,
            "name": "onSuccess",
            "type": "xMessage",
            "label": "On Success"
          },
          {
            "id": `CODE_RUNNER_${id}-output-onError-xMessage`,
            "name": "onError",
            "type": "xMessage",
            "label": "On Error"
          }
        ]
      },
      "type": "customNode",
      "width": 300,
      "height": 569,
      "dragging": false,
      "position": {
        "x": 3255.789032183661,
        "y": -141.0959960862705
      },
      "selected": false,
      "positionAbsolute": {
        "x": 3255.789032183661,
        "y": -141.0959960862705
      },
      "style": {}
    };
    return node;
  }

  userFeedbackLoopNode(field, id, index){
    const xMessage = [];
    for(let i=0; i<=index; i++){
      xMessage.push(`CODE_RUNNER_FIELD_${i}.data.instance`);
    }
    const node = {
      "id": `USER_FEEDBACK_LOOP_${id}`,
      "data": {
        "id": `USER_FEEDBACK_LOOP_${id}`,
        "name": "USER_FEEDBACK_LOOP",
        "type": "Output",
        "label": "User Feedback Loop",
        "inputs": {
          "xmessage": xMessage
        },
        "outputs": {
          "restoreState": "",
        },
        "category": "StateRestoreTransformer",
          "selected": false,
          "baseClasses": [
            "xMessage"
          ],
        "description": "A transformer which restores state to a specific node after sending a message to user.",
        "inputParams": [
          {
            "id": `USER_FEEDBACK_LOOP_${id}-input-sideEffects-json`,
              "name": "sideEffects",
              "rows": 2,
              "type": "json",
              "label": "SideEffects"
          }
        ],
        "inputAnchors": [
          {
            "id": `USER_FEEDBACK_LOOP_${id}-input-xmessage-xMessage`,
            "list": true,
            "name": "xmessage",
            "type": "xMessage",
            "label": "XMessage"
          }
        ],
        "outputAnchors": [
          {
            "id": `USER_FEEDBACK_LOOP_${id}-output-restoreState-xMessage`,
            "name": "restoreState",
            "type": "xMessage",
            "label": "Restore State"
          }
        ]
      },
      "type": "customNode",
      "width": 300,
      "height": 569,
      "dragging": false,
      "position": {
        "x": 3255.789032183661,
        "y": -141.0959960862705
      },
      "selected": false,
      "positionAbsolute": {
        "x": 3255.789032183661,
        "y": -141.0959960862705
      },
      "style": {}
    };
    return node;
    }

  createEdge(source, target){

    const Source_OutId = source["data"]["outputAnchors"][0]["id"];
    const Target_InId = target["data"]["inputAnchors"][0]["id"];

    const edgeId = `${source.id}-${target.id}`;

    const edge = {
      "id": edgeId,
      "data": {
        "label": ""
      },
      "type": "buttonedge",
      "source": source.id,
      "target": target.id,
      "sourceHandle": Source_OutId,
      "targetHandle": Target_InId,
    }
    return edge;
}
}

// INPUT FIELD TYPES: ENUM (properties.[id]['x-component'] from formily)

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

function formily_flowise_compiler(formilyJSON) {

  // Parsing formilyJSON -> Array of {title, component, description}
  const fieldDetails = parseFormilyJSON(formilyJSON.schema.properties);

  const flowiseJSON = new Flowise(fieldDetails);

  return flowiseJSON.toJSON();

  // This was for testing

  // fs.writeFileSync('./flowise.json', JSON.stringify(json, null, 2));
}

// This was for testing

// const formily = fs.readFileSync('./samples/formily2.json');
// formily_flowise_compiler(JSON.parse(formily));


module.exports = formily_flowise_compiler;