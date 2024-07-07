// CODE RUNNER : code -> needs '\n' at the end of each line.
// const msg = JSON.parse($0);
// msg.transformer.metaData.formInput = {"Name": msg.payload.text};
// msg.payload.text = "Please enter your father's name";
// return JSON.stringify(msg);

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

//
class FieldParsers {
  // INPUT FIELD PARSER
  static Input(fieldDetail) {
    return {
      title: fieldDetail['title'],
      component: "Input",
      description: fieldDetail['description'],
    }
  }

  // SELECT FIELD PARSER
  static Select(fieldDetail) {
    // TODO: Implement Select
  }

  // PASSWORD FIELD PARSER
  static Password(fieldDetail) {
    // TODO: Implement Password
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

    // Create Code Runner and User Feedback Loop Nodes for each field
    const fields = this.fields;
    fields.forEach((field, index) => {
      const id = `FIELD${index}`;

      // Create Code Runner Node
      const codeRunnerNODE = this.codeRunnerNode(field, id, index);

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
    const lastNode = this.codeRunnerNode({
      title: "Thank You!",
      description: "Thank You!",
    }, `END_${fields.length}`, fields.length);

    // Create Edge
    const prevNode = this.nodes.slice(-1)[0];
    const edge = this.createEdge(prevNode, lastNode);

    // Push to nodes and edges connecting previous node to current node
    this.nodes.push(lastNode);
    this.edges.push(edge);
  }

  codeRunnerNode(field, id, index){
    // TODO: 'code' needs to be generated based on the field
    const code = `
    const msg = JSON.parse($0);
    ${index != 0 && 'msg.transformer.metaData.formInput = {"${field.title}": msg.payload.text};'}
    msg.payload.text = "${field.description}";
    return JSON.stringify(msg);
    `;

    const node = {
      "id": `CODE_RUNNER_${id}`,
      "data": {
        "id": `CODE_RUNNER_${id}`,
        "name": "CODE_RUNNER",
        "type": "Output",
        "label": "Code Runner Transformer",
        "inputs": {
          "code": code,
          "xmessage": [
            index != 0 && `USER_FEEDBACK_LOOP_FIELD${index-1}.data.instance`,
            index == 0 && `start.data.instance`
          ]
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
    const node = {
      "id": `USER_FEEDBACK_LOOP_${id}`,
      "data": {
        "id": `USER_FEEDBACK_LOOP_${id}`,
        "name": "USER_FEEDBACK_LOOP",
        "type": "Output",
        "label": "User Feedback Loop",
        "inputs": {
          "xmessage": [`CODE_RUNNER_${id}.data.instance`]
        },
        "outputs": {
          "restoredState": "",
        },
        "category": "StateRestoreTransformer",
          "selected": false,
          "baseClasses": [
            "xMessage"
          ],
        "description": "User Feedback Loop",
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
            "label": "xMessage"
          }
        ],
        "outputAnchors": [
          {
            "id": `USER_FEEDBACK_LOOP_FIELD${index}-output-restoredState-xMessage`,
            "name": "onSuccess",
            "type": "xMessage",
            "label": "On Success"
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
const INPUT_FIELD_TYPES = {
  INPUT: "Input",
  SELECT: "Select",
  PASSWORD: "Password",
  TEXTAREA: "Input.TextArea",
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
      // TODO: Implement Select
      break;
    case INPUT_FIELD_TYPES.PASSWORD:
      // TODO: Implement Password
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

export default function formily_flowise_compiler(formilyJSON) {

  // Parsing formilyJSON -> Array of {component, description}
  const fieldDetails = parseFormilyJSON(formilyJSON.schema.properties);

  const flowiseJSON = new Flowise(fieldDetails);

  return flowiseJSON.toJSON();
}