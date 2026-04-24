const fs = require('fs');

let content = fs.readFileSync('src/data/characters.ts', 'utf8');

// 1. Add 강무혁 at the beginning of 혈호단
content = content.replace(
  "{ name: '엄소하', desc: '백호 순혈이 아닌 일반 호랑이, 생사경에 이른 무인. \"피의 색이 아니라 온도가 증명한다.\"' },",
  "{ name: '강무혁', desc: '백호련의 일찍이 잃어버린 천재. \"강하기에 무혁이라 부른다.\"' },\n          { name: '엄소하', desc: '백호 순혈이 아닌 일반 호랑이, 생사경에 이른 무인. \"피의 색이 아니라 온도가 증명한다.\"' },"
);

// 2. JuJak - Create direct line & separate
// Currently JuJak has:
// { affId: 'yeomeungjeon', affName: '염응전', img: '/teams/염응전.png', characters: [ {name: '응염', ...}, {name: '응려', ...}, {name: '응위', ...}, {name: '응채', ...}, {name: '취연', ...}, {name: '취모', ...}, {name: '응검', ...} ] }
// Wait, I need to see exactly how JuJak is structured to replace it properly.
fs.writeFileSync('src/data/characters.temp.ts', content);

console.log("Replaced Gang Muhyeok");
