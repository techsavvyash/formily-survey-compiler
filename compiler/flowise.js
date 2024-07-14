// IMPORTS
const INPUT_FIELD_TYPES = require('./fieldTypes');
const { VALIDATION_TYPES, ValidationREGEX } = require('./validations');
const startNode = require('./startNode.json');


class FlowiseCode{
    static msg_init = "const msg = JSON.parse($0);\n";
    static msg_end = "return JSON.stringify(msg);";
  
    // ASK QUESTION CODE
    static AskQuestion(description){
      return `msg.payload.text = "${description}";\n`
    }
  
    // GET INPUT CODE
    static GetInput(title, validation){
        let validationCode = "";
        if(validation != "none"){
            validationCode = `if(!msg.payload.text.match(${ValidationREGEX[`${validation}`]})) throw new error('Wrong input, Please Retype');\n`;
        }

        const s1 =  `let formInput = msg.transformer.metaData.formInput;\n`;
        const s2 = `if(formInput){\n`;
        const s3 = `formInput = {...formInput, \"${title}\": msg.payload.text};\n`;
        const s4 = `} else {\n`;
        const s5 = `formInput = {\"${title}\": msg.payload.text};\n`;
        const s6 = `}\n`;
        const s7 = `msg.transformer.metaData.formInput = formInput;\n`;
        
        return validationCode+s1 + s2 + s3 + s4 + s5 + s6 + s7;
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
        // const prevCodeRunnerNode = this.nodes.length > 1 ? this.nodes.slice(-2)[0] : null;
        const edgeIn = this.createEdge(prevNode, codeRunnerNODE);
        let edgeError = null;
        if(prevNode["id"] != "start"){
          edgeError = this.createEdge(codeRunnerNODE, prevNode, true);
        }
        
        // Push to nodes and edges connecting previous node to current node
        this.nodes.push(codeRunnerNODE);
        this.edges.push(edgeIn);
        if(edgeError){
          this.edges.push(edgeError);
        }
        // if(prevCodeRunnerNode){
        //     const edgeOut = this.createEdge(codeRunnerNODE, prevCodeRunnerNode, true);
        //     this.edges.push(edgeOut);
        // }
  
        // Create User Feedback Loop Node
        const userFeedbackLoopNODE = this.userFeedbackLoopNode(field, id, index);
  
        // Create Edge
        const successEdge = this.createEdge(codeRunnerNODE, userFeedbackLoopNODE);
        // no error edge for user feedback loop node
        // const errorEdge = this.createEdge(codeRunnerNODE, userFeedbackLoopNODE, true);
  
        // Push to nodes and edges connecting current node to user feedback loop node
        this.nodes.push(userFeedbackLoopNODE);
        this.edges.push(successEdge);
        // this.edges.push(errorEdge);
      });
  
      // Create Last Node
      const prevField = fields.slice(-1)[0];
      // const prevCodeRunnerNode = this.nodes.length > 1 ? this.nodes.slice(-2)[0] : null;
      const lastNode = this.codeRunnerNode(prevField,{
        title: "Thank You!",
        description: "Thank You!",
        component: "END"
      }, `END_${fields.length}`, fields.length);
  
      // Create Edge
      const prevNode = this.nodes.slice(-1)[0];
      const edgeIn = this.createEdge(prevNode, lastNode);
      const edgeError = this.createEdge(lastNode, prevNode, true);
  
      // Push to nodes and edges connecting previous node to current node
      this.nodes.push(lastNode);
      this.edges.push(edgeIn);
      this.edges.push(edgeError);
      // if(prevCodeRunnerNode){
      //   const errorEdge = this.createEdge(lastNode, prevCodeRunnerNode, true);
      //   this.edges.push(errorEdge);
      // }
    }
  
    codeRunnerNode(prevField, field, id, index){
  
      const component = field['component'];
      let code = FlowiseCode.msg_init;
  
      // Take input from previous field and store it in formInputs (if index != 0)
      if(index != 0){
        code += FlowiseCode.GetInput(prevField['title'], prevField['validation']);
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
  
    createEdge(source, target, error=false){
        let Source_OutId;
        if(error && source["data"]["outputAnchors"].length > 1){
            Source_OutId = source["data"]["outputAnchors"][1]["id"];
        } else {
            Source_OutId = source["data"]["outputAnchors"][0]["id"];
        }
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

module.exports = Flowise;