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
const formily_select2 = fs.readFileSync('./formily/formily_select2.json');
const flowise_select2 = formily_flowise_compiler(JSON.parse(formily_select2));
fs.writeFileSync('./flowise/flowise_select2.json', JSON.stringify(flowise_select2, null, 2));

// Test case 5 (MIX)
const formily_mix1 = fs.readFileSync('./formily/formily_mix1.json');
const flowise_mix1 = formily_flowise_compiler(JSON.parse(formily_mix1));
fs.writeFileSync('./flowise/flowise_mix1.json', JSON.stringify(flowise_mix1, null, 2));

// Test Case 6 (Sapce separated TITLE)
const formily_space = fs.readFileSync('./formily/formily_space.json');
const flowise_space = formily_flowise_compiler(JSON.parse(formily_space));
fs.writeFileSync('./flowise/flowise_space.json', JSON.stringify(flowise_space, null, 2));