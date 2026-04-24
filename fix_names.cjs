const fs = require('fs');

let r = fs.readFileSync('src/data/characters.ts', 'utf8');
r = r.replace("img: '/teams/영음전.png',", "img: '/teams/염응전.png',");
r = r.replace("img: 'https://picsum.photos/seed/cheongryong_shingyo/200/200?blur=2',", "img: '/teams/신교 직속.png',");
r = r.replace("img: '/teams/대가족.png',", "img: '/teams/궁주 대가족.png',");
r = r.replace("img: '/teams/우승상.png',", "img: '/teams/우승상수리묘단.png',");
r = r.replace("img: '/teams/수라장.png',", "img: '/teams/수라장.천리안.png',");
r = r.replace("img: '/teams/천리안.png',", "img: '/teams/수라장.천리안.png',");
r = r.replace("img: '/teams/용병대.png',", "img: '/teams/용병단.png',");

fs.writeFileSync('src/data/characters.ts', r);

