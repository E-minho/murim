const fs = require('fs');
let code = fs.readFileSync('src/data/characters.ts', 'utf8');

// 1. 강무혁 추가
code = code.replace(
  "        characters: [\n          { name: '엄소하', desc:",
  "        characters: [\n          { name: '강무혁', desc: '혈호단 소속. \"강함이 모든 것을 증명한다.\"' },\n          { name: '엄소하', desc:"
);

// 2. 주작맹 주작천루 창설
const jujakBefore = `      {
        affId: 'yeomeungjeon',
        affName: '염응전',
        img: '/teams/염응전.png',
        characters: [
          { name: '응염', desc: '매(봉황발현), 절대지경에 오른 최연소 주작 루주. "불꽃은 타오르되, 태우는 대상을 가려야 한다."' },
          { name: '응려', desc: '매, 화경의 차기 루주급 무인. 오빠 응염을 보좌하는 여장부. "왕좌에 앉지 않아도 불꽃은 탈 수 있다."' },
          { name: '응위', desc: '매, 가문의 체면을 목숨처럼 지키는 생사경의 어머니. "직계의 품위는 지키는 것이 아니라 세우는 것이다."' },
          { name: '응채', desc: '매, 초절정의 약혼자. 루주의 곁을 묵묵히 지킨다. "불꽃은 혼자 타면 꺼진다."' },
          { name: '취연', desc: '독수리, 우화등선을 꿈꾸는 현경의 방계 천재. "다음은 없다. 이번 생에 우화등선을 이룬다."' },
          { name: '취모', desc: '독수리, 체면보다 실리를 중시하는 생사경의 방계 어머니. "어미의 역할은 날아가는 방향을 정해주는 것이 아니다."' },
          { name: '응검', desc: '송골매, 검술에 매진하는 초절정 독신주의 구도자. "날개는 둥지가 아니라 하늘을 위해 있다."' }
        ]
      },`;

const jujakAfter = `      {
        affId: 'jujakcheonru',
        affName: '주작천루',
        img: '/teams/주작천루.png',
        characters: [
          { name: '응염', desc: '매(봉황발현), 절대지경에 오른 최연소 주작 루주. "불꽃은 타오르되, 태우는 대상을 가려야 한다."' },
          { name: '응려', desc: '매, 화경의 차기 루주급 무인. 오빠 응염을 보좌하는 여장부. "왕좌에 앉지 않아도 불꽃은 탈 수 있다."' },
          { name: '응위', desc: '매, 가문의 체면을 목숨처럼 지키는 생사경의 어머니. "직계의 품위는 지키는 것이 아니라 세우는 것이다."' },
          { name: '응채', desc: '매, 초절정의 약혼자. 루주의 곁을 묵묵히 지킨다. "불꽃은 혼자 타면 꺼진다."' }
        ]
      },
      {
        affId: 'yeomeungjeon',
        affName: '염응전',
        img: '/teams/염응전.png',
        characters: [
          { name: '취연', desc: '독수리, 우화등선을 꿈꾸는 현경의 방계 천재. "다음은 없다. 이번 생에 우화등선을 이룬다."' },
          { name: '취모', desc: '독수리, 체면보다 실리를 중시하는 생사경의 방계 어머니. "어미의 역할은 날아가는 방향을 정해주는 것이 아니다."' },
          { name: '응검', desc: '송골매, 검술에 매진하는 초절정 독신주의 구도자. "날개는 둥지가 아니라 하늘을 위해 있다."' }
        ]
      },`;

code = code.replace(jujakBefore, jujakAfter);

// 3. 사해객잔 수라장 + 천리안
const sahaeBefore = `      {
        affId: 'surajang',
        affName: '수라장(객잔 본진)',
        img: '/teams/수라장.천리안.png',
        characters: [
          { name: '태극선(흑백웅)', desc: '큰곰, 중도의 결계를 긋고 관망하는 절대지경 맹주. "조화는 어느 한쪽을 누르는 것이 아니라 무효하게 만드는 것이다."' },
          { name: '흑연', desc: '판다, 역습과 도발로 상대의 약점을 찌르는 화경 무인. "나를 건드린 자가 손해다."' },
          { name: '백련', desc: '판다, 굳건한 태태극반탄강의 수호자이자 무심한 화경 방패. "동요는 곧 파동이다."' }
        ]
      },
      {
        affId: 'geumjeon',
        affName: '금전상단',
        img: '/teams/금전상단.png',
        characters: [
          { name: '상리', desc: '너구리, 식구들을 챙기지만 욕망과 이익 계산이 우선인 이류 상단주. "돈이 칼보다 날카로울 때가 있다."' },
          { name: '상양', desc: '양, 천재적인 회계와 무도입계의 물류관리자. "대체 불가의 존재는 잡아먹히지 않는다."' },
          { name: '상돈', desc: '돼지, 무시받는 외모 뒤에 가족애를 무기로 드는 든든한 방패. "겉이 아니라 속이 몸을 지킨다."' }
        ]
      },
      {
        affId: 'cheonrian',
        affName: '천리안',
        img: '/teams/수라장.천리안.png',
        characters: [
          { name: '서례', desc: '쥐, 단정함과 절제 속에서 정보 거래를 주무르는 절정의 상인. "예를 갖추면 어떤 일이든 부끄럽지 않다."' },
          { name: '천리안.서란', desc: '다람쥐, 유쾌하지만 대담하고 정보에 뛰어난 일류의 스파이. "재밌으면 됐지 뭐. 정보는 결과가 전부니까."' }
        ]
      },`;

const sahaeAfter = `      {
        affId: 'surajang_cheonrian',
        affName: '수라장(천리안 통합)',
        img: '/teams/수라장.천리안.png',
        characters: [
          { name: '태극선', desc: '큰곰, 중도의 결계를 긋고 관망하는 절대지경 맹주. "조화는 어느 한쪽을 누르는 것이 아니라 무효하게 만드는 것이다."' },
          { name: '흑연', desc: '판다, 역습과 도발로 상대의 약점을 찌르는 화경 무인. "나를 건드린 자가 손해다."' },
          { name: '백련', desc: '판다, 굳건한 태태극반탄강의 수호자이자 무심한 화경 방패. "동요는 곧 파동이다."' },
          { name: '서례', desc: '쥐, 단정함과 절제 속에서 정보 거래를 주무르는 절정의 상인. "예를 갖추면 어떤 일이든 부끄럽지 않다."' },
          { name: '천리안.서란', desc: '다람쥐, 유쾌하지만 대담하고 정보에 뛰어난 일류의 스파이. "재밌으면 됐지 뭐. 정보는 결과가 전부니까."' }
        ]
      },
      {
        affId: 'geumjeon',
        affName: '금전상단',
        img: '/teams/금전상단.png',
        characters: [
          { name: '상리', desc: '너구리, 식구들을 챙기지만 욕망과 이익 계산이 우선인 이류 상단주. "돈이 칼보다 날카로울 때가 있다."' },
          { name: '상양', desc: '양, 천재적인 회계와 무도입계의 물류관리자. "대체 불가의 존재는 잡아먹히지 않는다."' },
          { name: '상돈', desc: '돼지, 무시받는 외모 뒤에 가족애를 무기로 드는 든든한 방패. "겉이 아니라 속이 몸을 지킨다."' }
        ]
      },`;

code = code.replace(sahaeBefore, sahaeAfter);

fs.writeFileSync('src/data/characters.ts', code);
console.log("Done modifying characters.ts");
