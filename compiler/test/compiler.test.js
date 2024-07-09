const formily_flowise_compiler = require('../compiler');
const fs = require('fs');

// Test case 1 (INPUT FIELD | SINGLE)
const formily_input1 = fs.readFileSync('./formily/formily_input1.json');
const flowise_output1 = formily_flowise_compiler(JSON.parse(formily_input1))
fs.writeFileSync('./flowise/flowise_output1.json', JSON.stringify(flowise_output1, null, 2));

// Test case 2 (INPUT FIELD | MULTIPLE)
const formily_input2 = fs.readFileSync('./formily/formily_input2.json');
const flowise_output2 = formily_flowise_compiler(JSON.parse(formily_input2))
fs.writeFileSync('./flowise/flowise_output2.json', JSON.stringify(flowise_output2, null, 2));

// Test case 3 (SELECT FIELD | SINGLE)
const formily_select1 = fs.readFileSync('./formily/formily_select1.json');
const flowise_select1 = formily_flowise_compiler(JSON.parse(formily_select1));
fs.writeFileSync('./flowise/flowise_select1.json', JSON.stringify(flowise_select1, null, 2));

// Test case 4 (SELECT FIELD | MULTIPLE)

// Test case 5 (MIX)

// Sapce separated field (SELECT, INPUT, mix)