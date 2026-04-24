/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, CSSProperties } from 'react';
import './styles/theme-part2.css';
import './styles/theme-part3.css';
import './styles/theme-part4.css';
import { TERRITORY } from './data/territory';
import { FACTION_DATA } from './data/characters';
import { DRIVE_MAP } from './data/driveMap';
import { LoadingScreen } from './components/LoadingScreen';

export function getImgSrc(type: 'chars' | 'teams' | 'teammark' | 'main', name: string, fallbackDir: string, size: number = 800) {
  let mapId = DRIVE_MAP[type]?.[name];

  if (mapId) {
    return `https://drive.google.com/thumbnail?id=${mapId}&sz=w${size}`;
  }
  return `${fallbackDir}/${name}`;
}

export function getAudioSrc(type: 'chars' | 'teams' | 'teammark' | 'main', name: string, fallbackDir: string) {
  const mapId = DRIVE_MAP[type]?.[name];
  if (mapId) {
    return `/api/audio/${mapId}`;
  }
  return `${fallbackDir}/${name}`;
}

export default function App() {
  const [activeChapter, setActiveChapter] = useState('ch-world');
  const [activeCharTab, setActiveCharTab] = useState('baekho');
  const [activeAffiliation, setActiveAffiliation] = useState<string | null>(null);
  const [activeCharacter, setActiveCharacter] = useState<string | null>(null);
  const [activeMapRegion, setActiveMapRegion] = useState<string | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(100);
  const [volume, setVolume] = useState(65);
  
  const [isLoading, setIsLoading] = useState(true);
  const [appStarted, setAppStarted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const activeTerritoryInfo = activeMapRegion ? TERRITORY[activeMapRegion] : null;

  useEffect(() => {
    // Preload territory banners and teammarks
    const imagesToLoad: string[] = [];
    Object.values(TERRITORY).forEach(territory => {
      if (territory.banner) {
        imagesToLoad.push(getImgSrc('main', territory.banner.startsWith('/') ? territory.banner.substring(1) : territory.banner, '', 1000));
      }
      if (territory.teams) {
        territory.teams.forEach(t => {
          imagesToLoad.push(getImgSrc('teammark', `${t.ko}.png`, `/teammark`, 400));
        });
      }
    });

    let loaded = 0;
    const loadCheck = () => {
      loaded++;
      if (loaded >= imagesToLoad.length) {
        setIsLoading(false);
      }
    };

    if (imagesToLoad.length === 0) {
      setIsLoading(false);
    } else {
      imagesToLoad.forEach(url => {
        const img = new Image();
        img.onload = loadCheck;
        img.onerror = loadCheck;
        img.src = url;
      });
    }

  }, []);

  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          setActiveChapter(e.target.id);
        }
      });
    }, { rootMargin: "-40% 0px -50% 0px", threshold: 0 });

    document.querySelectorAll('.chapter').forEach(c => io.observe(c));

    const handleFirstInteraction = () => {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);

    return () => {
      io.disconnect();
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  // Make sure we start playing BGM after loading screen completes
  const handleAppStart = () => {
    setAppStarted(true);
    // Audio play is primarily handled by interaction listeners,
    // but try to play it here too just in case they interacted early.
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const scrollToChapter = (id: string) => {
    const tgt = document.getElementById(id);
    if (tgt) tgt.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };


  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const handleAudioTimeUpdate = () => {
    if (audioRef.current?.duration) {
      const pct = 100 - (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(pct);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setProgress(100);
  };

  const toggleRegion = (key: string) => {
    setActiveMapRegion(prev => prev === key ? null : key);
  };

  const handleMapWrapClick = (e: any) => {
    if (!(e.target as Element).closest('.region')) {
      setActiveMapRegion(null);
    }
  };

  const menuItems = [
    { target: 'ch-world', idx: '一', label: '세계관', sub: '世界觀' },
    { target: 'ch-map', idx: '二', label: '월드맵', sub: '地圖' },
    { target: 'ch-char', idx: '三', label: '캐릭터', sub: '人物' },
    { target: 'ch-know', idx: '四', label: '무협지식', sub: '武俠知識' },
  ];

  return (
    <>
      <LoadingScreen onComplete={handleAppStart} isLoading={isLoading} />
      
      {!appStarted && (
         <div className="fixed inset-0 z-50 bg-black pointer-events-none" />
      )}
      
      <aside className="scroll-menu">
        <div className="scroll-cap-top"></div>
        <div className="scroll-menu-inner">
          {menuItems.map(item => (
            <button
              key={item.target}
              className={`menu-item ${activeChapter === item.target ? 'active' : ''}`}
              onClick={() => scrollToChapter(item.target)}
            >
              <span className="idx-seal">{item.idx}</span>
              {item.label}
              <span className="item-sub">{item.sub}</span>
            </button>
          ))}
        </div>
        <div className="scroll-cap-bot">
          <div className="scroll-rope">
            <svg viewBox="0 0 140 38">
              <defs>
                <pattern id="rope-twist" x="0" y="0" width="8" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(-20)">
                  <path d="M0 7 Q 2 0, 4 7 T 8 7" stroke="#6b4d2a" strokeWidth="2" fill="none" />
                </pattern>
              </defs>
              <ellipse cx="70" cy="20" rx="18" ry="13" fill="#8b6d45" stroke="#3a2618" strokeWidth="1.5" />
              <path d="M52 20 Q 60 10, 70 20 Q 80 30, 88 20" stroke="#3a2618" strokeWidth="1.5" fill="none" />
              <path d="M52 20 Q 60 30, 70 20 Q 80 10, 88 20" stroke="#3a2618" strokeWidth="1.5" fill="none" />
              <path d="M0 18 Q 20 16, 40 22 Q 48 24, 52 20" stroke="#8b6d45" strokeWidth="7" fill="none" strokeLinecap="round" />
              <path d="M0 18 Q 20 16, 40 22 Q 48 24, 52 20" stroke="url(#rope-twist)" strokeWidth="7" fill="none" strokeLinecap="round" opacity=".5" />
              <path d="M140 18 Q 120 16, 100 22 Q 92 24, 88 20" stroke="#8b6d45" strokeWidth="7" fill="none" strokeLinecap="round" />
              <path d="M140 18 Q 120 16, 100 22 Q 92 24, 88 20" stroke="url(#rope-twist)" strokeWidth="7" fill="none" strokeLinecap="round" opacity=".5" />
              <path d="M10 22 L 8 36 M 14 22 L 15 36 M 130 22 L 132 36 M 126 22 L 125 36" stroke="#6b4d2a" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </aside>

      <aside className="music-player">
        <audio 
          ref={audioRef} 
          src="/audio/Jade_Alley_Drifts.mp3"
          preload="auto" 
          loop
          onTimeUpdate={handleAudioTimeUpdate} 
          onEnded={handleAudioEnded}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        <div className="track-dots">
          {["ch-world", "ch-map", "ch-char", "ch-know"].map((id, idx) => {
            const titles = ["세계관", "월드맵", "캐릭터", "무협지식"];
            return (
              <div
                key={id}
                className={`track-dot ${activeChapter === id ? 'active' : ''}`}
                title={titles[idx]}
                onClick={() => scrollToChapter(id)}
              ></div>
            );
          })}
        </div>
        <button
          className={`play-btn ${isPlaying ? 'playing' : ''}`}
          aria-label="재생/일시정지"
          onClick={() => setIsPlaying(!isPlaying)}
        ></button>
        <div className="sliders">
          <div className="slider-col">
            <div className="slider-lbl">音</div>
            <div className="slider-track" onClick={(e) => {
               const r = e.currentTarget.getBoundingClientRect();
               const pct = Math.max(0, Math.min(100, ((r.bottom - e.clientY) / r.height) * 100));
               setVolume(pct);
               if (audioRef.current) audioRef.current.volume = pct / 100;
            }}>
              <div className="slider-fill" style={{ height: `${volume}%` }}></div>
              <div className="slider-thumb" style={{ bottom: `${volume}%` }}></div>
            </div>
            <div className="slider-lbl sub">VOL</div>
          </div>
          <div className="slider-col">
            <div className="slider-lbl">時</div>
            <div className="slider-track" onClick={(e) => {
               const r = e.currentTarget.getBoundingClientRect();
               const pct = Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100));
               setProgress(pct);
               if (audioRef.current && audioRef.current.duration) {
                 audioRef.current.currentTime = audioRef.current.duration * ((100 - pct) / 100);
               }
            }}>
              <div className="slider-fill" style={{ top: 0, bottom: 'auto', height: `${progress}%`, background: 'linear-gradient(180deg, var(--vermilion-d) 0%, var(--vermilion) 100%)' }}></div>
              <div className="slider-thumb" style={{ top: `${progress}%`, bottom: 'auto', transform: 'translate(-50%, -50%)' }}></div>
            </div>
            <div className="slider-lbl sub">SEEK</div>
          </div>
        </div>
      </aside>

      <main>
        {/* CHAPTER 1 */}
        <section className="chapter" id="ch-world">
          <div className="ch-head">
            <div className="ch-idx">一</div>
            <div className="ch-meta">
              <div className="ch-tag">第一 大目 · CHAPTER ONE</div>
              <h2>세계관 <span className="han">世界觀</span></h2>
              <div className="ch-sub">수화지기가 흐르는 대륙의 法則</div>
            </div>
          </div>
          <div className="world-hero" style={{ background: `url('${getImgSrc('main', 'worldbanners.png', '', 2000)}') center/cover no-repeat #0c0b0a` }}>
            <div className="world-hero-left"></div>
            <div className="world-hero-right">
              <div className="world-hero-card">
                <div className="world-quote">
                  태어날 때 몸에 <em>짐승이 깃든</em> 자들.<br />
                  그 자리에 <em>인간</em>은 남지 않았다.
                </div>
                <div className="world-quote-cite">── 무림사가(武林史家) 구술</div>
              </div>
              <div className="suhwa-card">
                <div className="s-k">獸化之氣<span className="s-ko">수화지기</span></div>
                <p>이 세계의 모든 생명체는 태어날 때부터 저마다 다른 <b>‘기(氣)의 속성(음양오행)’</b>을 품고 태어난다.</p>
                <p>영혼이 품고 있는 기의 형태가 육체를 서서히 <b>짐승의 모습으로</b> 빚어낸다 ── 이 현상을 <b>수화발현(獸化發現)</b>이라 부른다.</p>
              </div>
            </div>
          </div>

          <div className="synopsis">
            <div className="s-tag">── 세 계 관 · 연 대 기 ──</div>
            <h3>인간이 사라지고, 짐승의 피가 강해진 땅 ── 무림의 백 년 이야기.</h3>

            <div className="chap">
              <h4><span className="cnum">一</span>대공허와 사대종사<span className="ck">CHAPTER I</span></h4>
              <p>아주 먼 과거, 이 땅을 지배한 것은 인간이었다. 그들은 뛰어난 지혜로 <b>내공(기)</b>을 다뤘고, 무공은 인간의 자랑이었다.</p>
              <p>그러나 천하제일을 다투던 네 명의 대종사 ── 훗날 <b>사대종사</b>로 불린 이들 ── 는 한 걸음 더 멀리 나아가기를 원했다. 그들은 자연 속에서 살아남은 짐승들의 생태를 오래 관찰한 끝에, 짐승의 힘을 인간의 경락에 강제로 융합시키는 금단의 비기, <b>사신수결(四神獸訣)</b>을 창안한다.</p>
            </div>

            <div className="chap">
              <h4><span className="cnum">二</span>생존의 대가, 수화발현의 시작<span className="ck">CHAPTER II</span></h4>
              <p>인간 무인들은 가문과 문파를 지키기 위해 사신수결을 받아들였다. 짐승의 생명력으로 막힌 기맥을 뚫어내자, 그들은 전에 없던 무력을 손에 넣었다.</p>
              <p>그러나 대가는 뚜렷했다. 무공의 경지가 깊어질수록, 인간의 기운이 <b>짐승의 기운(수화지기)</b>에 먹혀 들어갔다. 극의(極意)를 추구한 고수일수록, 가장 완벽한 짐승의 형태로 변해갔다.</p>
              <p>처음에는 이 변이를 부끄러워하고 흉물로 여겼다. 그러나 짐승의 몸결이 곧 무력의 척도가 되는 난세가 도래하자, 외형의 변화는 오히려 <b>‘강함의 상징이자 긍지’</b>로 탈바꿈했다.</p>
            </div>

            <div className="chap">
              <h4><span className="cnum">三</span>무모족(인류)의 멸종<span className="ck">CHAPTER III</span></h4>
              <p>세대가 바뀌었다. 수화지기를 품은 자들의 후손은 아예 태어날 때부터 짐승의 형태로 태어났다.</p>
              <p>반면 끝까지 순수한 인간의 육체를 고집하며 변이를 거부한 <b>‘정통파 인간’</b>들은 도태됐다. 거칠어진 대륙의 환경을 버티지 못했고, 힘을 얻은 수인 문파들에게 학살당하거나 사냥당했다.</p>
              <p>수백 년이 지난 지금, 완전한 인간은 이 대륙에서 완전히 <b>멸종</b>했다. 그들은 이제 사해객잔의 뒷골목 전설이나, 잊혀진 지하 유적의 <b>‘털 없는 유인원 벽화’</b> 속에서나 모습을 드러낸다 ── 미스터리한 신족(神族)으로.</p>
            </div>

            <div className="sig">
              <div className="seal-tiny">皇</div>
              <span>武林史家 · 記</span>
            </div>
          </div>
        </section>

        {/* CHAPTER 2 */}
        <section className="chapter" id="ch-map">
          <div className="ch-head">
            <div className="ch-idx">二</div>
            <div className="ch-meta">
              <div className="ch-tag">第二 大目 · CHAPTER TWO</div>
              <h2>월드맵 <span className="han">中原 地圖</span></h2>
              <div className="ch-sub">수인들이 얽힌 大陸의 版圖</div>
            </div>
          </div>

          <div className="map-layout">
            <div className={`map-wrap ${activeMapRegion ? 'has-active' : ''}`} onClick={handleMapWrapClick}>
              <img className="map-layer map-base" src={getImgSrc('main', 'world_bg.png.jpg', '', 2000)} alt="四皇獸化記 世界地圖" />
              
              <img className={`map-layer map-part ${activeMapRegion === 'hyeonmu' ? 'active' : ''}`} data-part="hyeonmu" src={getImgSrc('main', 'hyeonmu.png.png', '', 1200)} alt="" />
              <img className={`map-layer map-part ${activeMapRegion === 'baekho' ? 'active' : ''}`} data-part="baekho" src={getImgSrc('main', 'baekho.png.png', '', 1200)} alt="" />
              <img className={`map-layer map-part ${activeMapRegion === 'sahae' ? 'active' : ''}`} data-part="sahae" src={getImgSrc('main', 'sahae.png.png', '', 1200)} alt="" />
              <img className={`map-layer map-part ${activeMapRegion === 'cheongryong' ? 'active' : ''}`} data-part="cheongryong" src={getImgSrc('main', 'cheongryong.png.png', '', 1200)} alt="" />
              <img className={`map-layer map-part ${activeMapRegion === 'yaseong' ? 'active' : ''}`} data-part="yaseong" src={getImgSrc('main', 'yaseong.png.png', '', 1200)} alt="" />
              <img className={`map-layer map-part ${activeMapRegion === 'jangan' ? 'active' : ''}`} data-part="jangan" src={getImgSrc('main', 'gangbuk.png.png', '', 1200)} alt="" />
              <img className={`map-layer map-part ${activeMapRegion === 'jujak' ? 'active' : ''}`} data-part="jujak" src={getImgSrc('main', 'jujak.png.png', '', 1200)} alt="" />
              <img className={`map-layer map-part ${activeMapRegion === 'nakyang' ? 'active' : ''}`} data-part="nakyang" src={getImgSrc('main', 'nakyang.png.png', '', 1200)} alt="" />

              <div className="map-dim"></div>

              <svg className="territory-svg" viewBox="0 0 864 1222" preserveAspectRatio="none">
                <polygon className={`region ${activeMapRegion === 'hyeonmu' ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); toggleRegion('hyeonmu'); }} points="40,116 450,116 450,356 40,356" />
                <polygon className={`region ${activeMapRegion === 'baekho' ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); toggleRegion('baekho'); }} points="40,356 230,356 230,976 40,976" />
                <polygon className={`region ${activeMapRegion === 'jangan' ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); toggleRegion('jangan'); }} points="230,356 450,356 450,529 230,529" />
                <polygon className={`region ${activeMapRegion === 'sahae' ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); toggleRegion('sahae'); }} points="230,529 450,529 450,714 230,714" />
                <polygon className={`region ${activeMapRegion === 'nakyang' ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); toggleRegion('nakyang'); }} points="230,714 450,714 450,816 230,816" />
                <polygon className={`region ${activeMapRegion === 'yaseong' ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); toggleRegion('yaseong'); }} points="230,816 450,816 450,1161 230,1161" />
                <polygon className={`region ${activeMapRegion === 'cheongryong' ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); toggleRegion('cheongryong'); }} points="450,285 826,285 826,714 450,714" />
                <polygon className={`region ${activeMapRegion === 'jujak' ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); toggleRegion('jujak'); }} points="450,714 826,714 826,1016 450,1016" />
              </svg>

              <div className={`map-pin ${activeMapRegion === 'hyeonmu' ? 'active' : ''}`} style={{ left: '42%', top: '13%' }}>
                <span className="pin-dot"></span><span className="pin-lbl">玄武北冥海<span className="pin-ko">현무북명해</span></span>
              </div>
              <div className={`map-pin ${activeMapRegion === 'baekho' ? 'active' : ''}`} style={{ left: '19%', top: '41%' }}>
                <span className="pin-dot"></span><span className="pin-lbl">白虎山脈<span className="pin-ko">백호산맥</span></span>
              </div>
              <div className={`map-pin neutral ${activeMapRegion === 'sahae' ? 'active' : ''}`} style={{ left: '48%', top: '51%' }}>
                <span className="pin-dot"></span><span className="pin-lbl">四海客棧<span className="pin-ko">사해객잔</span></span>
              </div>
              <div className={`map-pin ${activeMapRegion === 'cheongryong' ? 'active' : ''}`} style={{ left: '74%', top: '40%' }}>
                <span className="pin-dot"></span><span className="pin-lbl">青龍江 流域<span className="pin-ko">청룡강 유역</span></span>
              </div>
              <div className={`map-pin ${activeMapRegion === 'jangan' ? 'active' : ''}`} style={{ left: '40%', top: '36%' }}>
                <span className="pin-dot"></span><span className="pin-lbl">江北水鄕<span className="pin-ko">강북수향</span></span>
              </div>
              <div className={`map-pin ${activeMapRegion === 'nakyang' ? 'active' : ''}`} style={{ left: '40%', top: '63%' }}>
                <span className="pin-dot"></span><span className="pin-lbl">南域荒野<span className="pin-ko">남역황야</span></span>
              </div>
              <div className={`map-pin ${activeMapRegion === 'yaseong' ? 'active' : ''}`} style={{ left: '40%', top: '80%' }}>
                <span className="pin-dot"></span><span className="pin-lbl">野性敎 深山<span className="pin-ko">야성교심산</span></span>
              </div>
              <div className={`map-pin ${activeMapRegion === 'jujak' ? 'active' : ''}`} style={{ left: '79%', top: '72%' }}>
                <span className="pin-dot"></span><span className="pin-lbl">朱雀赤焰原<span className="pin-ko">주작적염원</span></span>
              </div>
            </div>

            <aside className="territory-info">
              {!activeMapRegion && (
                <div className="ti-empty">
                  <div className="ti-seal">疆</div>
                  <h4>疆 域 別 覽</h4>
                  <p>地圖 위 경계선에 마우스를 올려 놓으면, 그 領地의 내력이 이 자리에 펼쳐진다.</p>
                </div>
              )}
              {activeMapRegion && activeTerritoryInfo && (
                <div id="tiContent" className="is-shown">
                  <div className={`ti-banner ${activeTerritoryInfo.banner ? 'has-img' : ''}`}>
                    {activeTerritoryInfo.banner && <img className="loaded" src={getImgSrc('main', activeTerritoryInfo.banner.startsWith('/') ? activeTerritoryInfo.banner.substring(1) : activeTerritoryInfo.banner, '', 1000)} alt="" referrerPolicy="no-referrer" />}
                    <div className="ti-banner-ph">
                      <div className="ph-han">{activeTerritoryInfo.title.slice(0, 1)}</div>
                      <div className="ph-ko">{activeTerritoryInfo.ko}</div>
                      <div className="ph-hint">BANNER · 16 : 5</div>
                    </div>
                  </div>
                  <div className="ti-body">
                    <div className="ti-title">{activeTerritoryInfo.title}</div>
                    <div className="ti-ko">{activeTerritoryInfo.ko}</div>
                    <div className="ti-desc">
                      {activeTerritoryInfo.desc.map((p: string, i: number) => <p key={i}>{p}</p>)}
                    </div>
                  </div>
                  {activeTerritoryInfo.teams && activeTerritoryInfo.teams.length > 0 ? (
                     <div className="ti-teams">
                       {activeTerritoryInfo.teams.slice(0, 4).map((t: any, i: number) => (
                         <div className="ti-team only-img" key={i} style={{ padding: 0 }}>
                           <img 
                             className="tm-img" 
                             style={{ width: '100%', height: '100%', objectFit: 'cover', boxShadow: 'none', background: 'var(--ink)' }} 
                             src={getImgSrc('teammark', `${t.ko}.png`, `/teammark`, 400)} 
                             alt={t.ko} 
                             onError={(e) => { e.currentTarget.src = `https://picsum.photos/seed/${encodeURIComponent(t.ko)}/200/200`}} 
                             referrerPolicy="no-referrer" 
                           />
                         </div>
                       ))}
                     </div>
                  ) : null}
                </div>
              )}
            </aside>
          </div>
        </section>

      {/* CHAPTER 3 */}
      <section className="chapter" id="ch-char">
        <div className="ch-head">
          <div className="ch-idx">三</div>
          <div className="ch-meta">
            <div className="ch-tag">第三 大目 · CHAPTER THREE</div>
            <h2>캐릭터 <span className="han">人物 列傳</span></h2>
            <div className="ch-sub">진영 별 주요인물 설명</div>
          </div>
        </div>

        <div className="char-tabs">
          {FACTION_DATA.map(tab => (
            <button
              key={tab.factionId}
              className={`tab-btn ${activeCharTab === tab.factionId ? 'active' : ''}`}
              onClick={() => {
                setActiveCharTab(tab.factionId);
                setActiveAffiliation(null);
                setActiveCharacter(null);
              }}
            >
              {tab.factionName}
            </button>
          ))}
        </div>

        {FACTION_DATA.map(tab => (
          <div key={tab.factionId} className={`char-panel ${activeCharTab === tab.factionId ? 'active' : ''}`} style={{ display: activeCharTab === tab.factionId ? 'block' : 'none' }}>
            <div className="affiliations-grid">
              {tab.affiliations.map(aff => (
                <div 
                  key={aff.affId}
                  className={`aff-box ${activeAffiliation === aff.affId ? 'active' : ''}`}
                  onClick={() => {
                    setActiveAffiliation(activeAffiliation === aff.affId ? null : aff.affId);
                    if ((tab as any).isDirectCharacter) {
                      setActiveCharacter(activeAffiliation === aff.affId ? null : aff.characters[0].name);
                    } else {
                      setActiveCharacter(null);
                    }
                  }}
                >
                  <img src={(tab as any).isDirectCharacter ? getImgSrc('chars', `${aff.characters[0].name}.png`, '/characters', 400) : getImgSrc('teams', aff.img.startsWith('/') ? aff.img.split('/').pop()! : aff.img, '/teams', 800)} alt={aff.affName} className="aff-img" onError={(e) => { e.currentTarget.src = `https://picsum.photos/seed/${encodeURIComponent(aff.affName)}/200/200?blur=1` }} referrerPolicy="no-referrer" />
                  <div className="aff-title">{aff.affName}</div>
                </div>
              ))}
            </div>

            {/* 일반 소속인 경우: 인물 목록(char-row) + 선택 시 두루마리 UI 출력 */}
            {activeAffiliation && !(tab as any).isDirectCharacter && tab.affiliations.find(a => a.affId === activeAffiliation) && (
              <div className="char-sub-list">
                <div className="char-row">
                  {tab.affiliations.find(a => a.affId === activeAffiliation)?.characters.map((c, i) => (
                    <div 
                      key={i} 
                      className={`char-avatar ${activeCharacter === c.name ? 'active' : ''}`}
                      onClick={() => setActiveCharacter(activeCharacter === c.name ? null : c.name)}
                    >
                      <img src={getImgSrc('chars', `${c.name}.png`, '/characters', 400)} alt={c.name} onError={(e) => { e.currentTarget.src = `https://picsum.photos/seed/${encodeURIComponent(c.name)}/100/100?grayscale` }} referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>
                {activeCharacter && tab.affiliations.find(a => a.affId === activeAffiliation)?.characters.find(c => c.name === activeCharacter) && (
                  <div className="char-scroll-ui">
                    <div className="scroll-paper">
                      <span className="sc-name">{activeCharacter}</span>
                      <span className="sc-desc" style={{ whiteSpace: 'pre-wrap' }}>{tab.affiliations.find(a => a.affId === activeAffiliation)?.characters.find(c => c.name === activeCharacter)?.desc}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 객방/탈각림처럼 소속(중분류)가 곧 인물인 경우: 바로 두루마리 UI 출력 */}
            {activeAffiliation && (tab as any).isDirectCharacter && tab.affiliations.find(a => a.affId === activeAffiliation) && (
              <div className="char-sub-list direct-char-view">
                <div className="char-scroll-ui">
                  <div className="scroll-paper">
                    <span className="sc-name">{activeCharacter || tab.affiliations.find(a => a.affId === activeAffiliation)?.characters[0].name}</span>
                    <span className="sc-desc" style={{ whiteSpace: 'pre-wrap' }}>{tab.affiliations.find(a => a.affId === activeAffiliation)?.characters[0].desc}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </section>

        {/* CHAPTER 4 */}
        <section className="chapter" id="ch-know">
          <div className="ch-head">
            <div className="ch-idx">四</div>
            <div className="ch-meta">
              <div className="ch-tag">第四 大目 · CHAPTER FOUR</div>
              <h2>무협지식 <span className="han">武俠 知識</span></h2>
              <div className="ch-sub">무공지경 10단계 과 무형의 법칙</div>
            </div>
          </div>

          <h3 style={{ fontFamily: "'Ma Shan Zheng',serif", fontSize: 28, letterSpacing: '.1em', marginBottom: 10, color: 'var(--ink)' }}>무공지경 · 武功 境地</h3>
          <p style={{ fontSize: 13, color: 'var(--ink-mid)', marginBottom: 28, lineHeight: 1.7 }}>아래로 갈수록 먹빛이 짙어진다. 왼쪽은 입문, 오른쪽은 반신(半神).</p>

          <div className="tier-scroll-wrap">
            <span className="scroll-cap l"></span>
            <span className="scroll-cap r"></span>
            <div className="tier-scroll">
              {[
                { lv: '0.00', idx: '01 / 十', han: '三流', ko: '삼류', desc: '수인으로서의 수화지기를 처음 단전에 감지하고, 기본 權法(권법)과 검술 투로를 익히는 단계.', accent: false },
                { lv: '0.11', idx: '02 / 十', han: '二流', ko: '이류', desc: '격투에 내공을 실을 수 있다. 강한 자를 만나도 한두 합은 버틸 수 있는 경지.', accent: false },
                { lv: '0.22', idx: '03 / 十', han: '一流', ko: '일류', desc: '무공의 영역에 몰입. 본격 무인으로서의 전투가 가능해진다.', accent: false },
                { lv: '0.33', idx: '04 / 十', han: '絶頂', ko: '절정', desc: '짐승의 본성을 제압한 경지', accent: false },
                { lv: '0.45', idx: '05 / 十', han: '超絶頂', ko: '초절정', desc: '수인 종족으로서 동일 원체 종족을 완전히 다스릴 경지', accent: false },
                { lv: '0.57', idx: '06 / 十', han: '化境', ko: '화경', desc: '기를 意(의)로 변전 시키는 경지', accent: false },
                { lv: '0.69', idx: '07 / 十', han: '玄境', ko: '현경', desc: '기의 본원을 직접 관조하는 경지', accent: false },
                { lv: '0.81', idx: '08 / 十', han: '生死境', ko: '생사경', desc: '陰(음)의 한계를 넘어선 성스러운 짐승의 경지', accent: false },
                { lv: '0.92', idx: '09 / 十', han: '絶對之境', ko: '절대지경', desc: '原形質(원형질)에 닿은 半神(반신)의 경지. 현재 世代(세대)에 실존이 극소수', accent: true },
                { lv: '1.00', idx: '10 / 十', han: '羽化登仙', ko: '우화등선', desc: "현존 무인 중에는 없다. 오직 고대에 이 세계를 창조하고 비급을 남긴 '절대자'만이 이 경지였다고 전해진다.", accent: true },
              ].map(t => (
                <div className={`tier ${t.accent ? 'accent' : ''}`} style={{ '--lv': t.lv } as CSSProperties} key={t.lv}>
                  <div className="t-idx">{t.idx}</div>
                  <div className="t-han">{t.han}</div>
                  <div className="t-ko">{t.ko}</div>
                  <div className="t-dot"></div>
                  <div className="t-desc">{t.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <h3 style={{ fontFamily: "'Ma Shan Zheng',serif", fontSize: 28, letterSpacing: '.1em', marginBottom: 10, color: 'var(--ink)' }}>무협의 基本 · 처음 온 이를 위한 일곱 가지</h3>
          <p style={{ fontSize: 13, color: 'var(--ink-mid)', marginBottom: 28, lineHeight: 1.7 }}>판타지·게임 용어로 옮겨 읽어도 좋다. 무협은 어려운 장르가 아니다.</p>

          <div className="knowledge-grid">
            <div className="know span-2">
              <div className="k-han">氣</div>
              <div className="k-label">01 · 힘의 根源</div>
              <h4>기(氣)와 수화지기 <span className="han">獸化之氣</span></h4>
              <p>자연의 에너지를 호흡으로 빨아들여 몸속에 쌓는 것을 <b>기(氣)</b> 혹은 <b>내공(內功)</b>이라 한다. 판타지 게임의 <b>마나</b>와 같다고 보면 쉽다.</p>
              <p><b>만수무림의 특수성</b> ─ 이 세계에선 기를 쌓을수록 육체가 강해지는 동시에 <b>짐승의 모습</b>으로 변한다. 털에 윤기가 돌고 덩치가 커질수록 "저 사람 내공이 엄청난 고수구나!"로 읽어주면 된다. <b>순수한 인간은 이 세계에 존재하지 않는다.</b></p>
            </div>
            <div className="know">
              <div className="k-han">功</div>
              <div className="k-label">02 · 戰鬪 스타일</div>
              <h4>내공(內功) · 외공(外功)</h4>
              <dl className="k-row"><dt>내공</dt><dd>몸 <b>안</b>을 다스린다. 방어막. <b>마법사·힐러</b> 포지션. 사슴·거북·새·뱀 같은 유연한 종족에서 발달.</dd></dl>
              <dl className="k-row"><dt>외공</dt><dd>몸 <b>밖</b>을 단련한다. 근력·맷집·속도. 기운을 터뜨려 바위를 부수는 <b>전사·탱커</b>. 호랑이·소·고양이·곰 같은 맹수 종족에서 발달.</dd></dl>
            </div>
            <div className="know">
              <div className="k-han">狂</div>
              <div className="k-label">03 · 最惡의 병</div>
              <h4>야화(野化) <span className="han">走火入魔</span></h4>
              <p>원래 무협의 <b>주화입마</b> ─ 무공을 잘못 익히거나 크게 분노해 기운이 뒤틀리면 피를 토하고 미쳐버리는 병.</p>
              <p>만수무림에선 <b>버서커(광전사) 타락</b>과 겹친다. 이성의 끈을 놓치고 짐승의 본능에 잡아먹혀, <b>아군도 물어뜯는 괴물(마수)</b>로 전락한다. 무인이 가장 두려워하는 최후.</p>
            </div>
            <div className="know">
              <div className="k-han">蛻</div>
              <div className="k-label">04 · 궁극의 覺醒</div>
              <h4>탈피(蛻皮) <span className="han">換骨奪胎</span></h4>
              <p><b>환골탈태</b> ─ 뼛골을 바꾸고 껍질을 벗어 반신(半神)의 육체로 재탄생하는 일. <b>궁극기 각성·전직</b>에 해당.</p>
              <p>만수무림에선 <b>생물학적 진화</b>와 포개진다. 고수가 이 경지에 닿으면 낡은 가죽과 털이 찢어지며(뱀이 허물 벗듯) <b>신성한 짐승</b>으로 다시 태어난다. 늙은 짐승도 이때 젊어진다.</p>
            </div>
            <div className="know">
              <div className="k-han">罡</div>
              <div className="k-label">05 · 戰鬪의 시각화</div>
              <h4>검기(劍氣) · 강기(罡氣)</h4>
              <dl className="k-row"><dt>검기</dt><dd>칼에 내공을 주입해 <b>빛나는 에너지</b>를 뿜어낸 상태.</dd></dl>
              <dl className="k-row"><dt>강기</dt><dd>검기가 단단히 굳어 <b>무엇이든 자르는 절대 공·방</b>이 된 단계.</dd></dl>
              <p>만수무림에선 철제 무기는 <b>피뢰침</b> 역할에 가깝다. 휘두르면 무기에서 <b>종족속성의 기</b>를 발산하며 적을 공격한다.</p>
            </div>

            <div className="know span-3">
              <div className="k-han">派</div>
              <div className="k-label">06 · 勢力 構圖</div>
              <h4>무림의 세 갈래 <span className="han">正 · 邪 · 魔</span></h4>
              <p>무협의 팩션은 성향으로 세 갈래. 만수무림의 진영도 이 결을 따른다.</p>
              <div className="faction-tri">
                <div className="ftri jeong">
                  <div className="ft-han">正派</div>
                  <div className="ft-ko">정파 · 질서와 위선</div>
                  <div className="ft-tag">"우리는 대의와 평화를 수호한다."</div>
                  <div className="ft-list">명분·예의·규칙을 앞세우지만, 뒷편으론 꼰대거나 이익을 챙기는 면모가 섞인다.<br /><br /><b>소속</b> · 현무해궁, 주작천루, 탈각림</div>
                </div>
                <div className="ftri sa">
                  <div className="ft-han">邪派</div>
                  <div className="ft-ko">사파 · 자유와 패도</div>
                  <div className="ft-tag">"명분 같은 소리, 강한 놈이 짱이다."</div>
                  <div className="ft-list">실용주의·약육강식·돈. 얽매이기를 싫어하고, 거칠지만 의외로 솔직한 매력이 있다.<br /><br /><b>소속</b> · 백호련, 사해객잔, 야차개방</div>
                </div>
                <div className="ftri ma">
                  <div className="ft-han">魔敎</div>
                  <div className="ft-ko">마교 · 광신과 타락</div>
                  <div className="ft-tag">"우리의 신만이 옳다."</div>
                  <div className="ft-list">무림 전체의 공적. 식인·세뇌·학살의 금기를 태연히 범하며 교주를 광신한다.<br /><br /><b>소속</b> · 청룡신교, 야성교</div>
                </div>
              </div>
            </div>

            <div className="know span-3">
              <div className="k-han">術</div>
              <div className="k-label">07 · 戰鬪 用語集</div>
              <h4>알아두면 좋은 네 가지</h4>
              <div className="term-grid">
                <div className="term">
                  <div className="tm-han">輕功術</div>
                  <div className="tm-ko">경공술</div>
                  <div className="tm-desc">몸을 깃털처럼 가볍게 만드는 이동 기술. 하늘을 날고, 물 위를 뛰고, 초고속으로 달린다.</div>
                </div>
                <div className="term">
                  <div className="tm-han">獅子吼</div>
                  <div className="tm-ko">사자후</div>
                  <div className="tm-desc">내공을 목소리에 실은 초음파 공격. 듣는 순간 고막이 터지고 기절한다. 고래·호랑이 수인이 주로 쓴다.</div>
                </div>
                <div className="term">
                  <div className="tm-han">暗器</div>
                  <div className="tm-ko">암기</div>
                  <div className="tm-desc">몰래 던지는 표창·독침. 주작의 깃털 투척, 야성교 거미 수인의 독침 등이 여기 속한다.</div>
                </div>
                <div className="term">
                  <div className="tm-han">陣法</div>
                  <div className="tm-ko">진법</div>
                  <div className="tm-desc">여럿이 대열을 맞춰 강적을 가둬 싸우는 전술. 혼자서는 못 이길 상대를 마법진처럼 봉쇄. 초식동물·들개 용병이 특화.</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

