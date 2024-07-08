const formily_flowise_compiler = require('../compiler');
const fs = require('fs');

// Test case 1 (INPUT FIELD)
const formily_input1 = fs.readFileSync('./formily/formily_input1.json');
const flowise_output1 = formily_flowise_compiler(JSON.parse(formily_input1))
fs.writeFileSync('./flowise/flowise_output1.json', JSON.stringify(flowise_output1, null, 2));