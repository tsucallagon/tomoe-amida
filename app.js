(() => {
  "use strict";
  const svg = document.getElementById("ladder");
  const drawBtn = document.getElementById("drawBtn");
  const resetBtn = document.getElementById("resetBtn");
  const againBtn = document.getElementById("againBtn");
  const resultCard = document.getElementById("resultCard");
  const statusPill = document.getElementById("drawStatus");
  const animationStatus = document.getElementById("animationStatus");
  const NS = "http://www.w3.org/2000/svg";
  const X = [62, 180, 298], TOP = 62, BOTTOM = 365;
  let running = false;
  let lastResult = null;

  function el(tag, attrs = {}, text = null) {
    const node = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k,v]) => node.setAttribute(k, String(v)));
    if (text !== null) node.textContent = text;
    return node;
  }
  function getNames() {
    return [0,1,2].map(i => {
      const value = document.getElementById("team"+i).value.trim();
      return value || `チーム${["A","B","C"][i]}`;
    });
  }
  function shuffle(a) {
    for (let i=a.length-1; i>0; i--) {
      const j = Math.floor(Math.random()*(i+1));
      [a[i],a[j]]=[a[j],a[i]];
    }
    return a;
  }
  // 横線は隣り合う縦線だけを結び、同じ高さに重ならないように配置する。
  function makeRungs() {
    const ys = [];
    for (let y=94; y<=330; y+=18) ys.push(y);
    shuffle(ys);
    const rungs = [];
    let previous = -1;
    const count = 8 + Math.floor(Math.random()*4);
    for (const y of ys) {
      const possible = [0,1].filter(pair => pair !== previous);
      const pair = possible[Math.floor(Math.random()*possible.length)];
      rungs.push({ y, pair });
      previous = pair;
      if (rungs.length >= count) break;
    }
    return rungs.sort((a,b)=>a.y-b.y);
  }
  function tracePath(start, rungs) {
    let lane = start;
    let d = `M ${X[lane]} ${TOP}`;
    for (const rung of rungs) {
      d += ` L ${X[lane]} ${rung.y}`;
      if (lane === rung.pair) {
        d += ` L ${X[lane+1]} ${rung.y}`;
        lane++;
      } else if (lane === rung.pair+1) {
        d += ` L ${X[lane-1]} ${rung.y}`;
        lane--;
      }
    }
    d += ` L ${X[lane]} ${BOTTOM}`;
    return { d, lane };
  }
  function drawBase(names, rungs, activePath = null) {
    svg.replaceChildren();
    svg.appendChild(el("rect",{x:0,y:0,width:360,height:430,rx:14,fill:"#fbfdfb"}));
    // Top labels
    names.forEach((name,i) => {
      svg.appendChild(el("text",{x:X[i],y:25,"text-anchor":"middle","font-size":name.length>7?11:13,"font-weight":700,fill:"#1f2937"},name.length>9?name.slice(0,9)+"…":name));
      svg.appendChild(el("circle",{cx:X[i],cy:44,r:5,fill:["#dc2626","#2563eb","#16a34a"][i]}));
    });
    X.forEach(x => svg.appendChild(el("line",{x1:x,y1:TOP,x2:x,y2:BOTTOM,stroke:"#9ca3af","stroke-width":3,"stroke-linecap":"round"})));
    rungs.forEach(r => {
      svg.appendChild(el("line",{x1:X[r.pair],y1:r.y,x2:X[r.pair+1],y2:r.y,stroke:"#4b5563","stroke-width":4,"stroke-linecap":"round"}));
    });
    [0,1,2].forEach(i => {
      svg.appendChild(el("text",{x:X[i],y:394,"text-anchor":"middle","font-size":12,"font-weight":700,fill:"#374151"},`くじ ${i+1}`));
      svg.appendChild(el("circle",{cx:X[i],cy:412,r:5,fill:"#d1d5db"}));
    });
    if (activePath) {
      svg.appendChild(el("path",{d:activePath,fill:"none",stroke:"#f59e0b","stroke-width":7,"stroke-linecap":"round","stroke-linejoin":"round",opacity:.95}));
    }
  }
  function animatePath(pathD, color) {
    return new Promise(resolve => {
      const path = el("path",{d:pathD,fill:"none",stroke:color,"stroke-width":6,"stroke-linecap":"round","stroke-linejoin":"round"});
      svg.appendChild(path);
      const length = path.getTotalLength();
      path.style.strokeDasharray = String(length);
      path.style.strokeDashoffset = String(length);
      path.style.transition = "stroke-dashoffset 1.25s ease-in-out";
      // Force layout before transition.
      path.getBoundingClientRect();
      requestAnimationFrame(() => { path.style.strokeDashoffset = "0"; });
      window.setTimeout(() => resolve(), 1300);
    });
  }
  function renderInitial() {
    drawBase(getNames(), []);
  }
  async function runDraw() {
    if (running) return;
    const names = getNames();
    running = true;
    drawBtn.disabled = true;
    againBtn.disabled = true;
    resultCard.classList.remove("show");
    document.getElementById("copyStatus").textContent = "";
    statusPill.textContent = "抽選中…";
    animationStatus.textContent = "くじの線をたどっています…";

    const rungs = makeRungs();
    // A proper amidakuji gives a permutation of three bottom positions.
    const paths = names.map((_,i)=>tracePath(i,rungs));
    drawBase(names,rungs);
    const colors = ["#dc2626","#2563eb","#16a34a"];
    for (let i=0;i<3;i++) {
      const p = tracePath(i,rungs);
      animationStatus.textContent = `${names[i]} の線をたどっています…`;
      await animatePath(p.d, colors[i]);
      await new Promise(resolve => window.setTimeout(resolve, 180));
    }
    // Use the actual bottom order. The first two lottery positions play; the third waits.
    const bottom = [null,null,null];
    names.forEach((name,i) => { bottom[paths[i].lane] = name; });
    lastResult = { match: [bottom[0],bottom[1]], waiting: bottom[2], names };
    document.getElementById("matchA").textContent = lastResult.match[0];
    document.getElementById("matchB").textContent = lastResult.match[1];
    document.getElementById("waitingTeam").textContent = lastResult.waiting;
    resultCard.classList.add("show");
    statusPill.textContent = "抽選完了";
    animationStatus.textContent = "結果が決まりました！";
    running = false;
    drawBtn.disabled = false;
    againBtn.disabled = false;
    resultCard.scrollIntoView({behavior:"smooth",block:"nearest"});
  }
  drawBtn.addEventListener("click",runDraw);
  againBtn.addEventListener("click",runDraw);
  resetBtn.addEventListener("click",()=>{
    if (running) return;
    ["チームA","チームB","チームC"].forEach((v,i)=>document.getElementById("team"+i).value=v);
    resultCard.classList.remove("show");
    statusPill.textContent="まだ抽選していません";
    animationStatus.textContent="「あみだくじを引く」を押してください。";
    lastResult=null;
    renderInitial();
  });
  document.getElementById("shareBtn").addEventListener("click",async()=>{
    if (!lastResult) return;
    const text = `巴戦・初回対戦抽選\n第1試合：${lastResult.match[0]} vs ${lastResult.match[1]}\n待機：${lastResult.waiting}`;
    const status = document.getElementById("copyStatus");
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta=document.createElement("textarea"); ta.value=text; ta.style.position="fixed"; ta.style.opacity="0"; document.body.appendChild(ta); ta.select();
        const ok=document.execCommand("copy"); ta.remove(); if(!ok) throw new Error("copy failed");
      }
      status.textContent="結果をコピーしました。";
    } catch(e) {
      status.textContent=text;
    }
  });
  renderInitial();

  // Register offline cache when served from HTTPS or localhost.
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(err => console.warn("Service worker registration failed", err));
    });
  }
})();