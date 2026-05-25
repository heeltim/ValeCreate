/* ============================================================
   CONFIG
============================================================ */

let FONTS = [
  "Outfit","Sora","DM Sans","Nunito","Work Sans","Poppins","Montserrat",
  "Source Sans 3","IBM Plex Sans","Noto Sans","Plus Jakarta Sans",
  "Raleway","Lexend","Manrope",
];
let fontsLoaded = false;
const WEIGHTS = [
  {l:"Light 300",v:300},{l:"Regular 400",v:400},{l:"Medium 500",v:500},
  {l:"SemiBold 600",v:600},{l:"Bold 700",v:700},{l:"ExtraBold 800",v:800},{l:"Black 900",v:900},
];

const TOK_PRI = "__PRI__";
const TOK_SEC = "__SEC__";

const DEFAULT_TYPO = () => [
  {key:"Display",  fam:TOK_PRI, wt:300, sz:56, lh:1.10, ls:-1.0, al:"left", va:"top",    up:false, it:false},
  {key:"H1",       fam:TOK_PRI, wt:700, sz:40, lh:1.15, ls:-0.5, al:"left", va:"top",    up:false, it:false},
  {key:"H2",       fam:TOK_PRI, wt:700, sz:32, lh:1.20, ls:0.0,  al:"left", va:"top",    up:false, it:false},
  {key:"H3",       fam:TOK_PRI, wt:500, sz:24, lh:1.25, ls:0.0,  al:"left", va:"top",    up:false, it:false},
  {key:"Body",     fam:TOK_SEC, wt:400, sz:16, lh:1.55, ls:0.0,  al:"left", va:"top",    up:false, it:false},
  {key:"Small",    fam:TOK_SEC, wt:400, sz:14, lh:1.45, ls:0.0,  al:"left", va:"top",    up:false, it:false},
  {key:"Caption",  fam:TOK_SEC, wt:500, sz:12, lh:1.40, ls:2.0,  al:"left", va:"top",    up:true,  it:false},
  {key:"Button",   fam:TOK_SEC, wt:600, sz:14, lh:1.00, ls:0.5,  al:"center",va:"middle",up:false, it:false},
  {key:"Label",    fam:TOK_SEC, wt:700, sz:11, lh:1.30, ls:1.5,  al:"left", va:"middle", up:true,  it:false},
];
const DEFAULT_COLORS = () => [
  {id:uid("c"), hex:"#7F5AF0", alpha:100, pct:55, name:"Primária"},
  {id:uid("c"), hex:"#2CB67D", alpha:100, pct:30, name:"Secundária"},
  {id:uid("c"), hex:"#F4A261", alpha:100, pct:15, name:"Acento"},
];

/* ============================================================
   UTILS
============================================================ */
function uid(p){ return p+"_"+Math.random().toString(36).slice(2)+Date.now().toString(36); }
function clamp(n,a,b){ return Math.max(a,Math.min(b,n)); }
function esc(s){ return String(s??"").replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

function hexToRgb(h){
  h=(h||"").replace("#","").trim();
  if(h.length===3) h=h.split("").map(c=>c+c).join("");
  const n=parseInt(h,16);
  if(!Number.isFinite(n)) return null;
  return {r:(n>>16)&255,g:(n>>8)&255,b:n&255};
}
function rgbToHex(r,g,b){
  const t=v=>clamp(Math.round(v),0,255).toString(16).padStart(2,"0");
  return "#"+t(r)+t(g)+t(b);
}
function hsvToRgb(h,s,v){
  s/=100;v/=100;
  const c=v*s,x=c*(1-Math.abs((h/60)%2-1)),m=v-c;
  let r=0,g=0,b=0;
  if(h<60){r=c;g=x}else if(h<120){r=x;g=c}else if(h<180){g=c;b=x}
  else if(h<240){g=x;b=c}else if(h<300){r=x;b=c}else{r=c;b=x}
  return {r:(r+m)*255,g:(g+m)*255,b:(b+m)*255};
}
function rgbToHsv(r,g,b){
  r/=255;g/=255;b/=255;
  const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;
  let h=0;
  if(d){
    if(max===r) h=60*(((g-b)/d)%6);
    else if(max===g) h=60*((b-r)/d+2);
    else h=60*((r-g)/d+4);
  }
  if(h<0) h+=360;
  return {h,s:max?d/max*100:0,v:max*100};
}
function rgbToHsl(r,g,b){
  r/=255;g/=255;b/=255;
  const max=Math.max(r,g,b),min=Math.min(r,g,b);
  let h=0,s=0;const l=(max+min)/2;
  if(max!==min){
    const d=max-min;
    s=d/(l>.5?2-max-min:max+min);
    if(max===r) h=((g-b)/d+(g<b?6:0))/6;
    else if(max===g) h=((b-r)/d+2)/6;
    else h=((r-g)/d+4)/6;
  }
  return {h:Math.round(h*360),s:Math.round(s*100),l:Math.round(l*100)};
}
function rgba(hex,a){
  const rgb=hexToRgb(hex)||{r:0,g:0,b:0};
  return `rgba(${rgb.r},${rgb.g},${rgb.b},${(a/100).toFixed(2)})`;
}
function resolveFont(p,fam){
  if(fam===TOK_PRI) return p.fontPri||"Outfit";
  if(fam===TOK_SEC) return p.fontSec||"Outfit";
  return fam||"Outfit";
}
function famLabel(fam,p){
  if(fam===TOK_PRI) return `Primária${p?` (${p.fontPri})`:""}`;
  if(fam===TOK_SEC) return `Secundária${p?` (${p.fontSec})`:""}`;
  return fam;
}
function formatDate(ts){
  if(!ts) return "";
  const d=new Date(ts);
  return d.toLocaleDateString("pt-BR",{day:"2-digit",month:"short"});
}

/* ============================================================
   STORAGE
============================================================ */
const persistProjects = debounce((arr)=>{
  const ok = window.Storage ? window.Storage.save(arr) : false;
  if(ok) showSavedIndicator();
}, 1000);

function showSavedIndicator(){
  let indicator = document.getElementById('save-status');
  if(!indicator){
    indicator=document.createElement('div');
    indicator.id='save-status';
    indicator.className='save-status';
    indicator.textContent='Salvo';
    document.body.appendChild(indicator);
  }
  indicator.classList.add('visible');
  clearTimeout(showSavedIndicator._timer);
  showSavedIndicator._timer=setTimeout(()=>indicator.classList.remove('visible'),1100);
}

function load(){ return window.Storage ? window.Storage.load() : []; }
function save(arr){ persistProjects(arr); }

function mkProject(name=""){
  return {
    id:uid("p"), name:name||"Projeto",
    about:"", fontPri:"Outfit", fontSec:"Sora",
    typo:DEFAULT_TYPO(), colors:DEFAULT_COLORS(),
    logoSq:null, logoWd:null,
    brandImport:{xHeight:52,safeMargin:12,enabled:false,lastStats:null,place:{sq:{x:8,y:10,scale:100},wd:{x:52,y:52,scale:100}},extras:[]},
    exportLibrary:null,
    applications:[],
    createdAt:Date.now(), updatedAt:Date.now()
  };
}

/* ============================================================
   STATE
============================================================ */
const S = {
  projects: load(),
  pid: null,      // active project id
  styleKey: null, // active typo style key
  colorId: null,  // active color id
  hsv: {h:260,s:70,v:94},
  dragging: null, // picker drag target
};

const P = () => S.projects.find(p=>p.id===S.pid)||null;
const $ = id => document.getElementById(id);

function ensureBrandImportState(p){
  if(!p.brandImport) p.brandImport={xHeight:52,safeMargin:12,enabled:false,lastStats:null,place:{sq:{x:8,y:10,scale:100},wd:{x:52,y:52,scale:100}},extras:[]};
  if(!p.brandImport.place) p.brandImport.place={sq:{x:8,y:10,scale:100},wd:{x:52,y:52,scale:100}};
  if(!p.brandImport.place.sq) p.brandImport.place.sq={x:8,y:10,scale:100};
  if(!p.brandImport.place.wd) p.brandImport.place.wd={x:52,y:52,scale:100};
  if(!Array.isArray(p.brandImport.extras)) p.brandImport.extras=[];
  p.brandImport.xHeight=clamp(+p.brandImport.xHeight||52,20,90);
  p.brandImport.safeMargin=clamp(+p.brandImport.safeMargin||12,0,40);
}
function ensureExportLibrary(p){
  if(!p.exportLibrary){
    p.exportLibrary={folders:[],files:[],activeFolderId:null,expanded:{}};
  }
  if(!Array.isArray(p.exportLibrary.folders)) p.exportLibrary.folders=[];
  if(!Array.isArray(p.exportLibrary.files)) p.exportLibrary.files=[];
  if(!p.exportLibrary.expanded || typeof p.exportLibrary.expanded!=='object') p.exportLibrary.expanded={};
  ensureDefaultExportFolders(p);
}

function ensureDefaultExportFolders(p){
  const lib=p.exportLibrary;
  const ensureFolder=(id,name,parent)=>{
    let folder=lib.folders.find(f=>f.id===id);
    if(!folder){
      folder={id,name,parent};
      lib.folders.push(folder);
    }
    if(parent!==undefined) folder.parent=parent;
    if(id==='root-project'){
      if(folder.autoName!==false) folder.name=p.name||'Projeto';
      folder.autoName=true;
    }
    if(lib.expanded[id]===undefined) lib.expanded[id]=true;
    return folder;
  };

  ensureFolder('root-project',p.name||'Projeto',null);
  ensureFolder('root-brand','Marca','root-project');
  ensureFolder('root-apps','Aplicações','root-project');
  ensureFolder('root-library','Biblioteca','root-project');
  ensureFolder('root-brand-svg','SVG','root-brand');
  ensureFolder('root-brand-png','PNG','root-brand');
  ensureFolder('root-brand-pdf','PDF','root-brand');
  ensureFolder('root-brand-variants','Variações','root-brand');
  ensureFolder('root-library-tokens','Design Tokens','root-library');
  ensureFolder('root-library-css','CSS','root-library');
  ensureFolder('root-library-tailwind','Tailwind','root-library');
  ensureFolder('root-library-typography','Tipografia','root-library');

  if(!lib.activeFolderId || !lib.folders.some(f=>f.id===lib.activeFolderId)) lib.activeFolderId='root-brand';
}

function icon(name, size=16, cls=""){
  const klass = cls ? ` class="${cls}"` : "";
  return `<i data-lucide="${name}" data-size="${size}"${klass}></i>`;
}
function refreshIcons(){
  if(window.lucide?.createIcons) window.lucide.createIcons({attrs:{"stroke-width":1.9}});
}

/* ============================================================
   TOASTS
============================================================ */
function toast(msg, type="info", dur=2800){
  const icons={success:"check-circle-2",error:"circle-x",info:"info"};
  const el=document.createElement("div");
  el.className=`toast ${type}`;
  el.innerHTML=`<span class="toast-icon">${icon(icons[type]||"info",14)}</span>${esc(msg)}`;
  $("toastRoot").appendChild(el);
  refreshIcons();
  setTimeout(()=>{
    el.classList.add("out");
    el.addEventListener("animationend",()=>el.remove(),{once:true});
  },dur);
}

/* ============================================================
   CONTEXT MENU
============================================================ */
let ctxProjectId=null;
const ctx=$("ctxMenu");

function openCtx(e,pid){
  e.preventDefault();e.stopPropagation();
  ctxProjectId=pid;
  ctx.style.top=clamp(e.clientY,0,window.innerHeight-160)+"px";
  ctx.style.left=clamp(e.clientX,0,window.innerWidth-180)+"px";
  ctx.classList.add("open");
}
function closeCtx(){ ctx.classList.remove("open"); ctxProjectId=null; }
document.addEventListener("click",()=>closeCtx());
document.addEventListener("keydown",e=>e.key==="Escape"&&closeCtx());

ctx.querySelectorAll(".ctx-item").forEach(item=>{
  item.addEventListener("click",e=>{
    e.stopPropagation();
    const action=item.dataset.action;
    const proj=S.projects.find(p=>p.id===ctxProjectId);
    if(!proj){closeCtx();return;}
    if(action==="rename"){
      const n=prompt("Novo nome:",proj.name);
      if(n&&n.trim()){proj.name=n.trim();proj.updatedAt=Date.now();save(S.projects);renderHome();}
    }else if(action==="duplicate"){
      const cp=JSON.parse(JSON.stringify(proj));
      cp.id=uid("p");cp.name=proj.name+" (cópia)";cp.createdAt=Date.now();cp.updatedAt=Date.now();
      S.projects.unshift(cp);save(S.projects);renderHome();toast("Projeto duplicado","success");
    }else if(action==="delete"){
      if(confirm(`Excluir "${proj.name}"?`)){
        S.projects=S.projects.filter(p=>p.id!==ctxProjectId);
        save(S.projects);renderHome();
        if(S.pid===ctxProjectId){S.pid=null;nav("home");}
        toast("Projeto excluído","error");
      }
    }
    closeCtx();
  });
});

/* ============================================================
   NAVIGATION
============================================================ */
function nav(view, el){
  ["home","board","apps","editor","brandImport","export","appEditor"].forEach(v=>{
    $("view"+cap(v)).classList.toggle("active",v===view);
  });
  document.querySelectorAll(".sidebar-item").forEach(i=>i.classList.toggle("active",i.dataset.view===view));

  const shell=document.querySelector(".shell");
  if(shell) shell.classList.toggle("app-editor-mode", view==="appEditor");

  updateTopbar(view);

  if(view==="board") renderBoard();
  if(view==="apps") renderApps();
  if(view==="editor"){ loadEditor(); renderPreview(); }
  if(view==="brandImport") renderBrandImportWorkspace();
  if(view==="appEditor" && _appEdit.appId){
    const p=P();
    const a=(p?.applications||[]).find(x=>x.id===_appEdit.appId);
    if(a) ensureAppEditorReady(a,p);
  }
  if(view==="export") renderExport();
}
function cap(s){ return s.charAt(0).toUpperCase()+s.slice(1); }

function updateTopbar(view){
  const p=P();
  const bc=$("breadcrumb");
  const right=$("topbarRight");

  if(view==="home" || view==="appEditor"){
    bc.innerHTML=`<span>Projetos</span>`;
    right.innerHTML="";
    $("editorNav").style.display="none";
    return;
  }

  if(!p){
    bc.innerHTML=`<span>Projetos</span>`;
    right.innerHTML="";
    $("editorNav").style.display="none";
    return;
  }

  $("editorNav").style.display="block";
  $("editorNavLabel").textContent=p.name.slice(0,16)+(p.name.length>16?"…":"");

  const crumbBase=`<span style="color:var(--ink3)">Projetos</span><span style="color:var(--ink3)">›</span><span>${esc(p.name)}</span>`;
  if(view==="board") bc.innerHTML=crumbBase+`<span style="color:var(--ink3)">›</span><span>Brand Board</span>`;
  else if(view==="apps") bc.innerHTML=crumbBase+`<span style="color:var(--ink3)">›</span><span>Aplicações</span>`;
  else if(view==="editor") bc.innerHTML=crumbBase+`<span style="color:var(--ink3)">›</span><span>Editar</span>`;
  else if(view==="brandImport") bc.innerHTML=crumbBase+`<span style="color:var(--ink3)">›</span><span>Carregar sua marca</span>`;
  else if(view==="appEditor") bc.innerHTML=crumbBase+`<span style="color:var(--ink3)">›</span><span>Editor da Aplicação</span>`;
  else if(view==="export") bc.innerHTML=crumbBase+`<span style="color:var(--ink3)">›</span><span>Exportar</span>`;
  else bc.innerHTML=crumbBase;

  // right actions (contextual)
  if(view==="editor"){
    right.innerHTML=`<button class="btn btn-primary" onclick="saveProject()">
      ${icon("save",12)}
      Salvar
    </button>`;
  } else if(view==="brandImport") {
    right.innerHTML=`<button class="btn btn-primary" onclick="applyBrandImportToSlots()">${icon("check",12)}Aplicar</button>`;
  } else {
    right.innerHTML="";
  }
  refreshIcons();
}


/* ============================================================
   HOME
============================================================ */
function renderHome(){
  if(!S.projects.length){
    // seed examples
    const p1=mkProject("Marca Exemplo"); p1.colors=DEFAULT_COLORS();
    const p2=mkProject("App Conceito"); p2.colors=[
      {id:uid("c"),hex:"#E85D5D",alpha:100,pct:60,name:"Vermelho"},
      {id:uid("c"),hex:"#F4A261",alpha:100,pct:40,name:"Laranja"},
    ];
    S.projects=[p1,p2];save(S.projects);
  }

  // Render stats
  const statsEl=$("homeStats");
  if(statsEl){
    const totalApps = S.projects.reduce((a,p)=>(a+(p.applications?.length||0)),0);
    const totalColors = S.projects.reduce((a,p)=>(a+(p.colors?.length||0)),0);
    statsEl.innerHTML=[
      {val:S.projects.length, lbl:"Projetos"},
      {val:totalApps, lbl:"Aplicações"},
      {val:totalColors, lbl:"Cores totais"},
    ].map(s=>`<div>
      <div style="font-size:22px;font-weight:800;color:var(--ink)">${s.val}</div>
      <div style="font-size:11px;color:var(--ink3);margin-top:2px;font-weight:600;text-transform:uppercase;letter-spacing:.08em">${s.lbl}</div>
    </div>`).join("");
  }

  const grid=$("projGrid");
  grid.innerHTML="";
  S.projects.forEach(p=>{
    const card=document.createElement("div");
    card.className="proj-card anim-in";

    // Palette strip (taller, more visual)
    const strip=p.colors.map(c=>`<div style="flex:${c.pct};background:${rgba(c.hex,c.alpha)};transition:flex .3s ease"></div>`).join("");

    // Logo thumb
    const logoThumb = (p.logoSq||p.logoWd)
      ? `<img src="${p.logoSq?.type==='img'?p.logoSq?.data:(p.logoWd?.type==='img'?p.logoWd?.data:'')}" style="width:100%;height:100%;object-fit:contain" onerror="this.style.display='none'">`
      : `<div style="font-size:18px;font-weight:900;color:var(--accent);opacity:.7">${esc((p.name||'P').slice(0,1).toUpperCase())}</div>`;

    const appsCount = p.applications?.length||0;

    card.innerHTML=`
      <div style="
        height:72px;border-radius:10px;overflow:hidden;
        display:flex;border:1px solid var(--border2);
        margin-bottom:4px;
      ">${strip}</div>

      <div style="display:flex;align-items:center;gap:12px;margin-top:4px">
        <div style="
          width:44px;height:44px;border-radius:10px;flex-shrink:0;
          background:var(--surface2);border:1px solid var(--border2);
          display:grid;place-items:center;overflow:hidden;
        ">${logoThumb}</div>
        <div style="flex:1;min-width:0">
          <div class="proj-card-name" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(p.name)}</div>
          <div class="proj-card-meta">${p.colors?.length||0} cores · ${p.typo?.length||0} estilos · ${appsCount} aplic.</div>
        </div>
        <button class="proj-menu" data-pid="${p.id}">${icon('ellipsis',16)}</button>
      </div>

      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:10px;padding-top:10px;border-top:1px solid var(--border)">
        <span style="font-size:11px;color:var(--ink3);font-family:var(--mono)">${formatDate(p.updatedAt)}</span>
        <div style="display:flex;gap:4px">
          ${p.colors.slice(0,5).map(c=>`<div style="width:14px;height:14px;border-radius:4px;background:${c.hex};border:1px solid rgba(255,255,255,.1)" title="${esc(c.name||c.hex)}"></div>`).join("")}
        </div>
      </div>
    `;

    card.querySelector(".proj-menu").addEventListener("click",e=>openCtx(e,p.id));
    card.addEventListener("click",e=>{ if(e.target.closest(".proj-menu")) return; openProject(p.id); });
    grid.appendChild(card);
  });

  // Add card
  const addCard=document.createElement("div");
  addCard.className="proj-add-card";
  addCard.innerHTML=`
    ${icon("folder-plus",22)}
    <span style="font-size:13px;font-weight:600">Novo Projeto</span>
  `;
  addCard.onclick=createProject;
  grid.appendChild(addCard);
  refreshIcons();
}


function createProject(){
  const p=mkProject(`Projeto ${S.projects.length+1}`);
  S.projects.unshift(p);save(S.projects);
  renderHome();
  openProject(p.id);
  toast("Projeto criado!","success");
}

function openProject(pid){
  S.pid=pid;S.styleKey=null;
  const proj=P();
  ensureApps(proj);
  if(!proj.applications.length){
    const cfg={type:"web",unit:"px",w:1920,h:1080,dpi:72,bleed:0,safe:0,name:`${proj.name||"Projeto"} — Nova aplicação`};
    const app={ id:uid("a"), createdAt:Date.now(), svg:"",
      name:cfg.name, type:cfg.type, unit:cfg.unit, w:cfg.w, h:cfg.h, dpi:cfg.dpi, bleed:cfg.bleed, safe:cfg.safe
    };
    proj.applications.unshift(app);
    proj.updatedAt=Date.now();
    save(S.projects);
  }
  openAppEditor(proj.applications[0].id);
}

/* ============================================================
   EDITOR — LOAD
============================================================ */
function loadEditor(){
  const p=P(); if(!p) return;

  $("edProjectId").textContent=p.id.slice(-6);
  $("inpName").value=p.name||"";
  $("inpAbout").value=p.about||"";

fillFontSelects();
  $("selPrimary").value=p.fontPri||"Outfit";
  $("selSecondary").value=p.fontSec||"Sora";

  ensureBrandImportState(p);
  ensureExportLibrary(p);
  renderBrandQuickCard(p);

  normalizePercents(p);
  renderColors();
  renderTypoList();
  renderPreview();
}

/* ============================================================
   SAVE
============================================================ */
function saveProject(){
  const p=P(); if(!p) return;
  p.name=($("inpName").value||"").trim()||"Projeto";
  p.about=($("inpAbout").value||"").trim();
  p.fontPri=$("selPrimary").value;
  p.fontSec=$("selSecondary").value;
  p.updatedAt=Date.now();
  save(S.projects);
  gePushBrandData(p);
  updateTopbar("editor");
  renderHome();
  toast("Salvo!","success");
}

// auto-save on font change
["selPrimary","selSecondary"].forEach(id=>{
  $(id)?.addEventListener("change",()=>{
    const p=P();if(!p)return;
    p.fontPri=$("selPrimary").value;
    p.fontSec=$("selSecondary").value;
    p.updatedAt=Date.now();
    save(S.projects);
    gePushBrandData(p);
    renderTypoList();
    renderPreview();
  });
});

/* ============================================================
   FONT SELECTS
============================================================ */
function fillFontSelects(){
  ["selPrimary","selSecondary"].forEach(id=>{
    const el=$(id);
    if(!el) return;
    const current = el.value;
    el.innerHTML=FONTS.map(f=>`<option value="${esc(f)}">${esc(f)}</option>`).join("");
    if(current && FONTS.includes(current)) el.value=current;
  });
}

async function loadGoogleFontsCatalog(){
  if(fontsLoaded) return;
  fontsLoaded = true;
  try{
    const res = await fetch("https://fonts.google.com/metadata/fonts");
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    let txt = await res.text();
    if(txt.startsWith(")]}'")) txt = txt.slice(5);
    const data = JSON.parse(txt);
    const source = Array.isArray(data?.familyMetadataList) ? data.familyMetadataList : Object.values(data?.familyMetadataList || {});
    const families = source
      .map(entry=>String(entry?.family || "").trim())
      .filter(Boolean)
      .sort((a,b)=>a.localeCompare(b));
    if(families.length){
      FONTS = families;
      fillFontSelects();
      const p=P();
      if(p){
        [p.fontPri,p.fontSec].forEach(tryLoadGoogleFont);
        renderTypoList();
        renderPreview();
      }
    }
  }catch(err){
    console.warn("Google Fonts catalog indisponível, usando lista local.", err);
  }
}

/* ============================================================
   LOGO
============================================================ */
function triggerLogo(slot){
  $("fileLogo"+cap(slot)).click();
}
function openBrandImport(){
  const p=P(); if(!p){ toast("Abra um projeto primeiro","info"); return; }
  nav("brandImport");
}
function clearLogo(slot,e){
  if(e){e.preventDefault();e.stopPropagation();}
  const p=P();if(!p)return;
  ensureBrandImportState(p);
  p["logo"+cap(slot)]=null;
  p.brandImport.lastStats=collectBrandImportStats(p);
  p.updatedAt=Date.now();
  save(S.projects);
  gePushBrandData(p);
  renderBrandQuickCard(p);
  renderBrandImportWorkspace();
}

function addExtraLogoSlot(){
  const p=P();if(!p)return;
  ensureBrandImportState(p);
  const id=uid('lx');
  p.brandImport.extras.push({id,name:`Logo ${p.brandImport.extras.length+2}`,asset:null,place:{x:50,y:50,scale:100}});
  p.updatedAt=Date.now();
  save(S.projects);
  renderBrandImportWorkspace();
}

function removeExtraLogoSlot(id){
  const p=P();if(!p)return;
  ensureBrandImportState(p);
  p.brandImport.extras=p.brandImport.extras.filter(x=>x.id!==id);
  p.updatedAt=Date.now();
  save(S.projects);
  renderBrandImportWorkspace();
}

function triggerExtraLogo(id){
  const inp=$("fileLogoExtra");
  if(!inp) return;
  inp.dataset.target=id;
  inp.click();
}

function renderAssetInto(el,asset){
  if(!el) return;
  el.innerHTML="";
  if(!asset) return;
  if(asset.type==="svg"){
    const w=document.createElement("div");
    w.className="logo-preview-inner";
    w.style.width="100%";
    w.style.height="100%";
    w.innerHTML=asset.data;
    w.querySelectorAll("svg").forEach(s=>{s.style.width="100%";s.style.height="100%";});
    el.appendChild(w);
  } else {
    const img=document.createElement("img");img.src=asset.data;el.appendChild(img);
  }
}

function collectBrandImportStats(p){
  const stats={logos:0,vectors:0,bitmaps:0};
  [p.logoSq,p.logoWd].forEach(a=>{ if(!a) return; stats.logos++; a.type==='svg'?stats.vectors++:stats.bitmaps++; });
  (p.brandImport?.extras||[]).forEach(e=>{ if(!e?.asset) return; stats.logos++; e.asset.type==='svg'?stats.vectors++:stats.bitmaps++; });
  return stats;
}

function renderBrandQuickCard(p){
  const thumb=$("brandQuickThumb");
  const status=$("brandQuickStatus");
  if(!status && !thumb) return;
  const st=collectBrandImportStats(p);
  if(status){
    status.textContent = st.logos ? `${st.logos} ativo(s) • vetorial ${st.vectors} • bitmap ${st.bitmaps}` : "Sem ativos importados.";
  }
  if(thumb){
    thumb.innerHTML="";
    if(!p.logoSq && !p.logoWd){
      thumb.innerHTML=`<div class="upload-hint" style="height:96px">${icon("image-plus",16)}<span>Nenhum arquivo carregado</span></div>`;
    } else {
      renderAssetInto(thumb,p.logoWd||p.logoSq);
    }
  }
}

function renderBrandImportPalette(p){
  const root=$("brandImportPalette");
  if(!root || !p) return;
  root.innerHTML=(p.colors||[]).slice(0,4).map(c=>`
    <div style="display:flex;align-items:center;gap:10px;border:1px solid var(--border2);border-radius:10px;padding:8px 10px;background:var(--surface2)">
      <span style="width:16px;height:16px;border-radius:6px;background:${rgba(c.hex,c.alpha)};display:inline-block"></span>
      <span style="font-size:12px;color:var(--ink);font-weight:600">${esc(c.name||c.hex)}</span>
      <span style="font-size:11px;color:var(--ink3);margin-left:auto">${esc(c.hex)}</span>
    </div>
  `).join("") || `<div class="import-stats">Sem cores definidas ainda.</div>`;
}

function syncBrandImportInputs(p){
  if($("inpXHeight")) $("inpXHeight").value = p.brandImport.xHeight;
  if($("inpSafeMargin")) $("inpSafeMargin").value = p.brandImport.safeMargin;
  const sq=p.brandImport.place?.sq||{x:8,y:10,scale:100};
  const wd=p.brandImport.place?.wd||{x:52,y:52,scale:100};
  if($("advSqX")) $("advSqX").value = sq.x;
  if($("advSqY")) $("advSqY").value = sq.y;
  if($("advSqScale")) $("advSqScale").value = sq.scale;
  if($("advWdX")) $("advWdX").value = wd.x;
  if($("advWdY")) $("advWdY").value = wd.y;
  if($("advWdScale")) $("advWdScale").value = wd.scale;
}

function renderBrandImportWorkspace(){
  const p=P(); if(!p) return;
  ensureBrandImportState(p);
  if($("inpBrandBaseName")) $("inpBrandBaseName").value=(p.name||"minha-marca").toLowerCase().replace(/\s+/g,'-');
  p.brandImport.lastStats=collectBrandImportStats(p);
  syncBrandImportInputs(p);
  renderBrandQuickCard(p);
  renderBrandImportPalette(p);
  renderAssetInto($("advSlotSq"), p.logoSq);
  renderAssetInto($("advSlotWd"), p.logoWd);
  const extraList=$("extraUploadList");
  if(extraList){
    extraList.innerHTML=(p.brandImport.extras||[]).map((item,idx)=>`
      <div class="upload-row">
        <button class="btn btn-ghost" onclick="triggerExtraLogo('${item.id}')" style="justify-content:center">${esc(item.name||`Logo ${idx+2}`)}</button>
        <button class="btn btn-ghost mini" onclick="removeExtraLogoSlot('${item.id}')" style="justify-content:center">Limpar</button>
      </div>
    `).join("");
  }
  const extraPreview=$("advExtraPreview");
  if(extraPreview){
    extraPreview.innerHTML=(p.brandImport.extras||[]).map((item,idx)=>`
      <div class="brand-preview-panel">
        <div class="field-label" style="margin-bottom:6px">${esc(item.name||`Logo ${idx+2}`)}</div>
        <div class="brand-preview-slot" id="advExtraSlot-${item.id}"></div>
      </div>
    `).join("") || `<div class="import-stats">Adicione mais elementos da marca no botão +.</div>`;
    (p.brandImport.extras||[]).forEach(item=>renderAssetInto($("advExtraSlot-"+item.id),item.asset));
  }
  const st=p.brandImport.lastStats;
  if($("brandImportStats")){
    $("brandImportStats").textContent = st.logos ? `${st.logos} ativo(s) • vetorial: ${st.vectors} • bitmap: ${st.bitmaps} • Altura X ${p.brandImport.xHeight}% • Respiro ${p.brandImport.safeMargin}%` : "Sem ativos importados.";
  }
  renderCompositePreview(p);
}

function updateBrandPlacement(slot,key,val){
  const p=P(); if(!p) return;
  ensureBrandImportState(p);
  const place=p.brandImport.place[slot];
  place[key]=Number(val)||0;
  p.updatedAt=Date.now();
  save(S.projects);
  renderCompositePreview(p);
}

function renderCompositePreview(p){
  const host=$("brandCompositePreview");
  if(!host) return;
  host.innerHTML="";
  const add=(asset,slot)=>{
    if(!asset) return;
    const place=p.brandImport.place[slot]||{x:0,y:0,scale:100};
    const layer=document.createElement('div');
    layer.className='asset-layer';
    layer.style.left=clamp(place.x,0,90)+'%';
    layer.style.top=clamp(place.y,0,90)+'%';
    layer.style.width=(slot==='sq'?26:40)+'%';
    layer.style.height='40%';
    layer.style.transform=`translate(-50%, -50%) scale(${clamp((place.scale||100)/100,0.2,2.2)})`;
    renderAssetInto(layer,asset);
    host.appendChild(layer);
  };
  add(p.logoSq,'sq');
  add(p.logoWd,'wd');
  (p.brandImport?.extras||[]).forEach((item,idx)=>{
    if(!item?.asset) return;
    const layer=document.createElement('div');
    layer.className='asset-layer';
    const px=48 + ((idx%3)-1)*16;
    const py=72 + Math.floor(idx/3)*12;
    layer.style.left=clamp(px,8,92)+'%';
    layer.style.top=clamp(py,8,92)+'%';
    layer.style.width='26%';
    layer.style.height='28%';
    layer.style.transform='translate(-50%, -50%) scale(1)';
    renderAssetInto(layer,item.asset);
    host.appendChild(layer);
  });
}

function updateBrandImportSetting(key,val){
  const p=P();if(!p)return;
  ensureBrandImportState(p);
  const num=+val;
  if(key==='xHeight') p.brandImport.xHeight=clamp(num,20,90);
  if(key==='safeMargin') p.brandImport.safeMargin=clamp(num,0,40);
  p.brandImport.lastStats=collectBrandImportStats(p);
  p.updatedAt=Date.now();
  save(S.projects);
  renderBrandImportWorkspace();
}

function normalizeImportedLogo(asset,p){
  ensureBrandImportState(p);
  const marginPct=(p.brandImport.safeMargin||0)/100;
  if(asset?.type!=="svg") return asset;
  try{
    const doc=new DOMParser().parseFromString(String(asset.data||""),"image/svg+xml");
    const svg=doc.querySelector("svg");
    if(!svg) return asset;
    const vb=(svg.getAttribute("viewBox")||"0 0 1000 1000").trim().split(/\s+/).map(Number);
    if(vb.length===4 && vb.every(Number.isFinite)){
      const [x,y,w,h]=vb;
      svg.setAttribute("viewBox",`${x-(w*marginPct)} ${y-(h*marginPct)} ${w*(1+marginPct*2)} ${h*(1+marginPct*2)}`);
    }
    svg.setAttribute("data-x-height",String(p.brandImport.xHeight||52));
    return {type:'svg',data:svg.outerHTML};
  }catch{return asset;}
}

function applyBrandImportToSlots(){
  const p=P();if(!p)return;
  ["Sq","Wd"].forEach(s=>{
    const key="logo"+s;
    if(p[key]) p[key]=normalizeImportedLogo(p[key],p);
  });
  p.brandImport.lastStats=collectBrandImportStats(p);
  p.updatedAt=Date.now();
  save(S.projects);
  gePushBrandData(p);
  renderBrandQuickCard(p);
  renderBrandImportWorkspace();
  toast("Ajustes da marca aplicados","success");
}

["Sq","Wd"].forEach(s=>{
  const fileInput=$("fileLogo"+s);
  fileInput.addEventListener("change",async ()=>{
    const p=P();if(!p)return;
    ensureBrandImportState(p);
    const f=fileInput.files?.[0];if(!f)return;
    const key="logo"+s;
    const raw=await readAsset(f);
    p[key]=normalizeImportedLogo(raw,p);
    p.brandImport.lastStats=collectBrandImportStats(p);
    p.updatedAt=Date.now();
    save(S.projects);
    gePushBrandData(p);
    renderBrandQuickCard(p);
    renderBrandImportWorkspace();
    fileInput.value="";
    toast("Logo carregado!","success");
  });
});

$("fileLogoExtra")?.addEventListener("change",async ()=>{
  const p=P();if(!p)return;
  ensureBrandImportState(p);
  const inp=$("fileLogoExtra");
  const id=inp?.dataset?.target;
  const f=inp?.files?.[0];if(!f||!id) return;
  const slot=p.brandImport.extras.find(x=>x.id===id);
  if(!slot) return;
  const raw=await readAsset(f);
  slot.asset=normalizeImportedLogo(raw,p);
  p.brandImport.lastStats=collectBrandImportStats(p);
  p.updatedAt=Date.now();
  save(S.projects);
  renderBrandImportWorkspace();
  inp.value="";
  delete inp.dataset.target;
  toast("Elemento adicional carregado!","success");
});

async function readAsset(file){
  if(file.name.toLowerCase().endsWith(".svg")||file.type==="image/svg+xml") return {type:"svg",data:await file.text()};
  return new Promise((res,rej)=>{ const r=new FileReader();r.onload=()=>res({type:"img",data:r.result});r.onerror=rej;r.readAsDataURL(file); });
}

/* ============================================================
   COLORS
============================================================ */
function normalizePercents(p){
  if(!p.colors?.length){p.colors=DEFAULT_COLORS();return;}
  let sum=p.colors.reduce((a,c)=>a+(+c.pct||0),0);
  if(!sum){const ea=Math.round(100/p.colors.length);p.colors.forEach(c=>c.pct=ea);}
  else{const sc=100/sum;p.colors.forEach(c=>c.pct=Math.max(1,Math.round(c.pct*sc)));}
  let drift=100-p.colors.reduce((a,c)=>a+c.pct,0);
  if(p.colors.length) p.colors[p.colors.length-1].pct=Math.max(1,(p.colors[p.colors.length-1].pct+drift));
}

function renderColors(){
  const p=P();if(!p)return;
  normalizePercents(p);

  // bar
  const bar=$("colorBar");
  bar.innerHTML="";
  p.colors.forEach(c=>{
    const seg=document.createElement("div");
    seg.className="color-seg"+(S.colorId===c.id?" selected":"");
    seg.style.width=c.pct+"%";
    seg.style.background=rgba(c.hex,c.alpha);
    seg.textContent=c.pct+"%";
    seg.onclick=()=>{S.colorId=c.id;openColorModal();};
    bar.appendChild(seg);
  });

  // chips
  const chips=$("colorChips");
  chips.innerHTML="";
  p.colors.forEach(c=>{
    const chip=document.createElement("div");
    chip.className="color-chip"+(S.colorId===c.id?" selected":"");
    chip.innerHTML=`<div class="dot" style="background:${rgba(c.hex,c.alpha)}"></div>${esc(c.name||c.hex.toUpperCase())}`;
    chip.onclick=()=>{S.colorId=c.id;openColorModal();};
    chips.appendChild(chip);
  });
}

function addColor(){
  const p=P();if(!p)return;
  const c={id:uid("c"),hex:"#FFFFFF",alpha:100,pct:10,name:"Nova Cor"};
  p.colors.push(c);
  normalizePercents(p);
  p.updatedAt=Date.now();save(S.projects);
  gePushBrandData(p);
  S.colorId=c.id;
  renderColors();
  openColorModal();
}

/* ============================================================
   COLOR MODAL
============================================================ */
function openColorModal(){
  const p=P();if(!p)return;
  const c=p.colors.find(x=>x.id===S.colorId);if(!c)return;
  const rgb=hexToRgb(c.hex)||{r:127,g:90,b:240};
  S.hsv=rgbToHsv(rgb.r,rgb.g,rgb.b);
  $("mHex").value=c.hex.toUpperCase();
  $("mRgb").value=`${rgb.r}, ${rgb.g}, ${rgb.b}`;
  $("mAlpha").value=c.alpha??100;
  if($("mAlphaRange")) $("mAlphaRange").value=c.alpha??100;
  $("mPct").value=c.pct??10;
  $("mName").value=c.name||"";
  syncPicker();
  renderHistoryDots();
  $("modalBackdrop").classList.add("open");
}
function closeColorModal(){ $("modalBackdrop").classList.remove("open"); }

$("btnCloseModal").onclick=closeColorModal;
$("modalBackdrop").addEventListener("click",e=>{if(e.target===$("modalBackdrop"))closeColorModal();});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeColorModal();});
$("btnCloseBriefing")?.addEventListener("click", closeBriefingModal);
$("briefingBackdrop")?.addEventListener("click",e=>{if(e.target===$("briefingBackdrop")) closeBriefingModal();});

function syncPicker(){
  const {h,s,v}=S.hsv;
  const bw=$("pickerCanvas").getBoundingClientRect().width||320;
  const bh=$("pickerCanvas").getBoundingClientRect().height||230;

  const hueColor=hsvToRgb(h,100,100);
  $("pickerCanvas").style.background=`hsl(${h},100%,50%)`;

  // knob pos
  const kx=(s/100)*(bw||320);
  const ky=((100-v)/100)*(bh||230);
  $("pickerKnob").style.left=kx+"px";
  $("pickerKnob").style.top=ky+"px";

  // hue knob
  $("hueKnob").style.left=((h/360)*($("hueStrip").clientWidth||320))+"px";

  // alpha
  const alpha=parseFloat($("mAlpha").value)||100;
  const rgb=hsvToRgb(h,s,v);
  const hex=rgbToHex(rgb.r,rgb.g,rgb.b);
  $("alphaFill").style.background=`linear-gradient(90deg,transparent,${hex})`;
  $("alphaKnob").style.left=((alpha/100)*($("alphaStrip").clientWidth||320))+"px";

  // preview
  const hexFull=hex.toUpperCase();
  $("colorPreviewSwatch").style.background=rgba(hexFull,alpha);
  $("colorPreviewLabel").textContent=hexFull;

  // sync text inputs
  $("mHex").value=hexFull;
  const r2=Math.round(rgb.r),g2=Math.round(rgb.g),b2=Math.round(rgb.b);
  $("mRgb").value=`${r2}, ${g2}, ${b2}`;
}

function renderHistoryDots(){
  const p=P();
  $("historyDots").innerHTML=(p?.colors||[]).map(c=>`
    <div class="history-dot" style="background:${rgba(c.hex,c.alpha)}" title="${esc(c.name||c.hex)}" data-hex="${esc(c.hex)}"></div>
  `).join("");
  $("historyDots").querySelectorAll(".history-dot").forEach(d=>{
    d.onclick=()=>{
      const rgb=hexToRgb(d.dataset.hex)||{r:127,g:90,b:240};
      S.hsv=rgbToHsv(rgb.r,rgb.g,rgb.b);syncPicker();
    };
  });
}

// Picker interactions
function pickerDrag(el, cb){
  function go(e){
    const r=el.getBoundingClientRect();
    const cx=(e.touches?e.touches[0].clientX:e.clientX);
    const cy=(e.touches?e.touches[0].clientY:e.clientY);
    cb(clamp(cx-r.left,0,r.width),clamp(cy-r.top,0,r.height),r.width,r.height);
  }
  el.addEventListener("mousedown",e=>{go(e);S.dragging=el;});
  el.addEventListener("touchstart",e=>{e.preventDefault();go(e);S.dragging=el;},{passive:false});
}
document.addEventListener("mousemove",e=>{if(!S.dragging)return;
  const r=S.dragging.getBoundingClientRect();
  const cx=clamp(e.clientX-r.left,0,r.width);
  const cy=clamp(e.clientY-r.top,0,r.height);
  handlePickerMove(S.dragging.id,cx,cy,r.width,r.height);
});
document.addEventListener("mouseup",()=>S.dragging=null);
document.addEventListener("touchend",()=>S.dragging=null);
document.addEventListener("touchmove",e=>{if(!S.dragging)return;
  const r=S.dragging.getBoundingClientRect();
  const cx=clamp(e.touches[0].clientX-r.left,0,r.width);
  const cy=clamp(e.touches[0].clientY-r.top,0,r.height);
  handlePickerMove(S.dragging.id,cx,cy,r.width,r.height);
},{passive:false});

function handlePickerMove(id,x,y,w,h){
  if(id==="pickerCanvas"){ S.hsv.s=(x/w)*100; S.hsv.v=(1-(y/h))*100; syncPicker(); }
  else if(id==="hueStrip"){ S.hsv.h=(x/w)*360; syncPicker(); }
  else if(id==="alphaStrip"){
    const alpha=Math.round((x/w)*100);
    $("mAlpha").value=alpha;
    if($("mAlphaRange")) $("mAlphaRange").value=alpha;
    syncPicker();
  }
}

pickerDrag($("pickerCanvas"),(x,y,w,h)=>handlePickerMove("pickerCanvas",x,y,w,h));
pickerDrag($("hueStrip"),(x,y,w,h)=>handlePickerMove("hueStrip",x,y,w,h));
pickerDrag($("alphaStrip"),(x,y,w,h)=>handlePickerMove("alphaStrip",x,y,w,h));

$("mHex").addEventListener("input",()=>{
  const rgb=hexToRgb($("mHex").value);if(!rgb)return;
  S.hsv=rgbToHsv(rgb.r,rgb.g,rgb.b);syncPicker();
});
$("mRgb").addEventListener("input",()=>{
  const m=($("mRgb").value||"").match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if(!m)return;
  S.hsv=rgbToHsv(+m[1],+m[2],+m[3]);syncPicker();
});
$("mAlpha").addEventListener("input",()=>{
  const alpha=clamp(parseFloat($("mAlpha").value)||100,0,100);
  $("mAlpha").value=alpha;
  if($("mAlphaRange")) $("mAlphaRange").value=alpha;
  syncPicker();
});
$("mAlphaRange")?.addEventListener("input",()=>{
  const alpha=clamp(parseFloat($("mAlphaRange").value)||100,0,100);
  $("mAlpha").value=alpha;
  syncPicker();
});

$("btnCopyColor").onclick=async()=>{
  const mode=$("mCopyMode").value;
  const hex=($("mHex").value||"").toUpperCase();
  const rgb=hexToRgb(hex)||{r:0,g:0,b:0};
  const a=clamp(parseFloat($("mAlpha").value)||100,0,100)/100;
  const hsl=rgbToHsl(rgb.r,rgb.g,rgb.b);
  const p=P();
  let out=hex;
  if(mode==="rgb") out=`rgb(${rgb.r},${rgb.g},${rgb.b})`;
  else if(mode==="rgba") out=`rgba(${rgb.r},${rgb.g},${rgb.b},${a.toFixed(2)})`;
  else if(mode==="hsl") out=`hsl(${hsl.h},${hsl.s}%,${hsl.l}%)`;
  else if(mode==="css"){
    const c=p?.colors.find(x=>x.id===S.colorId);
    const varName=(c?.name||"cor").toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"");
    out=`--color-${varName}: ${hex};`;
  }
  try{await navigator.clipboard.writeText(out);toast("Copiado: "+out,"success");}
  catch{toast("Copie manualmente:\n"+out,"error");}
};

$("btnDeleteColor").onclick=()=>{
  const p=P();if(!p)return;
  if(p.colors.length<=1){toast("Mantenha ao menos 1 cor.","error");return;}
  if(!confirm("Excluir esta cor?"))return;
  p.colors=p.colors.filter(c=>c.id!==S.colorId);
  normalizePercents(p);p.updatedAt=Date.now();save(S.projects);
  gePushBrandData(p);
  S.colorId=p.colors[0]?.id||null;
  closeColorModal();renderColors();
  toast("Cor excluída","error");
};

$("btnApplyColor").onclick=()=>{
  const p=P();if(!p)return;
  const c=p.colors.find(x=>x.id===S.colorId);if(!c)return;
  const hex=($("mHex").value||"").trim().toUpperCase();
  if(!hexToRgb(hex)){toast("HEX inválido","error");return;}
  c.hex=hex;
  c.alpha=clamp(parseInt($("mAlpha").value)||100,0,100);
  c.pct=clamp(parseInt($("mPct").value)||10,1,100);
  c.name=($("mName").value||"").trim();
  normalizePercents(p);p.updatedAt=Date.now();save(S.projects);
  gePushBrandData(p);
  closeColorModal();renderColors();renderPreview();
  toast("Cor aplicada!","success");
};

/* ============================================================
   TYPOGRAPHY LIST
============================================================ */
function renderTypoList(){
  const p=P();if(!p)return;
  const list=$("typoList");list.innerHTML="";
  (p.typo||[]).forEach(s=>{
    const item=document.createElement("div");
    item.className="typo-item"+(S.styleKey===s.key?" active":"");
    const css = resolvedCSS(p,s);
    item.innerHTML=`
      <div>
        <div class="typo-item-name" style="font-family:${esc(css.fontFamily)};font-weight:${css.fontWeight};font-style:${css.fontStyle};">${esc(s.key)}</div>
        <div class="typo-item-meta">${esc(famLabel(s.fam,p))} • ${s.wt} • ${s.sz}px</div>
      </div>
      ${icon("chevron-right",12)}
    `;
    item.onclick=()=>{
      S.styleKey=S.styleKey===s.key?null:s.key;
      renderTypoList();
    };
    list.appendChild(item);
  });

  if(S.styleKey){
    const s=p.typo.find(x=>x.key===S.styleKey);
    if(s) openStyleEditor(p,s);
    $("activeStyleBadge").textContent=S.styleKey;
    $("activeStyleBadge").style.display="inline-block";
  } else {
    $("typoEditor").classList.remove("open");
    $("activeStyleBadge").style.display="none";
  }
  refreshIcons();
}

function buildFamOptions(p){
  const restricted=$("chkRestrict")?.checked!==false;
  let opts=[
    {l:`Primária (${p.fontPri})`,v:TOK_PRI},
    {l:`Secundária (${p.fontSec})`,v:TOK_SEC},
  ];
  if(!restricted){
    opts.push({l:"────",v:"__sep__",sep:true});
    FONTS.forEach(f=>opts.push({l:f,v:f}));
  }
  return opts;
}

function buildBaseStyleOptions(p,currentKey){
  return (p.typo||[])
    .filter(x=>x.key!==currentKey)
    .map(x=>({l:x.key,v:x.key}));
}

function applyBaseStyle(){
  const p=P();if(!p)return;
  const s=p.typo.find(x=>x.key===S.styleKey);if(!s)return;
  const baseKey=$("edBaseStyle")?.value;
  if(!baseKey||baseKey==="__none__") return;
  const base=(p.typo||[]).find(x=>x.key===baseKey);
  if(!base) return;
  s.fam=base.fam;
  s.wt=base.wt;
  s.sz=base.sz;
  s.lh=base.lh;
  s.ls=base.ls;
  s.al=base.al;
  s.va=base.va;
  s.up=!!base.up;
  s.it=!!base.it;
  openStyleEditor(p,s);
  renderPreview();
}

function openStyleEditor(p,s){
  const editor=$("typoEditor");
  editor.classList.add("open");

  // base style
  const baseOpts=buildBaseStyleOptions(p,s.key);
  $("edBaseStyle").innerHTML=[`<option value="__none__">Selecione…</option>`,...baseOpts.map(o=>`<option value="${esc(o.v)}">${esc(o.l)}</option>`)].join("\n");
  $("edBaseStyle").value="__none__";

  // family
  const famOpts=buildFamOptions(p);
  $("edFamily").innerHTML=famOpts.map(o=>o.sep?`<option disabled>${esc(o.l)}</option>`:`<option value="${esc(o.v)}">${esc(o.l)}</option>`).join("");
  $("edFamily").value=s.fam;
  if(!$("edFamily").value) $("edFamily").value=TOK_PRI;
  tryLoadGoogleFont(resolveFont(p,$("edFamily").value));

  // weight
  $("edWeight").innerHTML=WEIGHTS.map(w=>`<option value="${w.v}">${esc(w.l)}</option>`).join("");
  $("edWeight").value=s.wt;

  $("edSize").value=s.sz;
  $("edLine").value=s.lh;
  $("edTrack").value=s.ls;

  setAlignActive("al",s.al||"left");
  setAlignActive("va",s.va||"top");
  $("btnUpper").classList.toggle("active",!!s.up);
  $("btnItalic").classList.toggle("active",!!s.it);
}

function setAlignActive(type,val){
  const map={al:{left:"bLeft",center:"bCenter",right:"bRight"},va:{top:"bVTop",middle:"bVMid",bottom:"bVBot"}};
  Object.values(map[type]).forEach(id=>$(id)?.classList.remove("active"));
  const target=map[type][val];
  if(target) $(target)?.classList.add("active");
}

function applyAlign(v){ mutateStyle(s=>{s.al=v;setAlignActive("al",v);renderPreview();}); }
function applyVAlign(v){ mutateStyle(s=>{s.va=v;setAlignActive("va",v);}); }
function toggleStyle(key){ mutateStyle(s=>{s[key]=!s[key];$("btn"+cap(key)).classList.toggle("active",s[key]);renderPreview();}); }
function closeStyleEditor(){ S.styleKey=null;renderTypoList(); }

function mutateStyle(fn){
  const p=P();if(!p)return;
  const s=p.typo.find(x=>x.key===S.styleKey);if(!s)return;
  fn(s);
  p.updatedAt=Date.now();
  save(S.projects);
  gePushBrandData(p);
  renderTypoList();
  renderPreview();
}

function saveStyle(){
  const p=P();if(!p)return;
  const s=p.typo.find(x=>x.key===S.styleKey);if(!s)return;
  s.fam=$("edFamily").value;
  s.wt=+$("edWeight").value;
  s.sz=+$("edSize").value;
  s.lh=+$("edLine").value;
  s.ls=+$("edTrack").value;
  tryLoadGoogleFont(resolveFont(p,s.fam));
  p.updatedAt=Date.now();save(S.projects);
  gePushBrandData(p);
  S.styleKey=null;
  renderTypoList();renderPreview();
  toast("Estilo salvo!","success");
}

$("chkRestrict")?.addEventListener("change",()=>{ const p=P();if(p){const s=p.typo.find(x=>x.key===S.styleKey);if(s)openStyleEditor(p,s);} });
$("edBaseStyle")?.addEventListener("change",applyBaseStyle);
$("edFamily")?.addEventListener("change",()=>mutateStyle(s=>{ s.fam=$("edFamily").value; const p=P(); if(p) tryLoadGoogleFont(resolveFont(p,s.fam)); }));
$("edWeight")?.addEventListener("change",()=>mutateStyle(s=>{ s.wt=+$("edWeight").value||s.wt; }));
$("edSize")?.addEventListener("input",()=>mutateStyle(s=>{ s.sz=+$("edSize").value||s.sz; }));
$("edLine")?.addEventListener("input",()=>mutateStyle(s=>{ s.lh=+$("edLine").value||s.lh; }));
$("edTrack")?.addEventListener("input",()=>mutateStyle(s=>{ s.ls=+$("edTrack").value||s.ls; }));

/* ============================================================
   LIVE PREVIEW
============================================================ */
function resolvedCSS(p,s){
  const real=resolveFont(p,s.fam).replace(/"/g,"");
  return {
    fontFamily:`"${real}",ui-sans-serif,system-ui,sans-serif`,
    fontSize:`${s.sz}px`,
    fontWeight:s.wt,
    lineHeight:s.lh,
    letterSpacing:`${s.ls}px`,
    textTransform:s.up?"uppercase":"none",
    fontStyle:s.it?"italic":"normal",
    textAlign:s.al||"left",
  };
}

function renderPreview(){
  const p=P();if(!p)return;
  const container=$("livePreview");
  container.innerHTML="";

  const sampleTexts={
    Display:"Display Type",H1:"Título Principal",H2:"Subtítulo da Seção",
    H3:"Cabeçalho Terciário",Body:"Corpo do texto com uma frase de exemplo para visualização.",
    Small:"Texto menor e informativo.",Caption:"LEGENDA",Button:"Ação Primária",Label:"RÓTULO",
  };

  (p.typo||[]).forEach(s=>{
    const div=document.createElement("div");
    div.className="preview-item";
    const css=resolvedCSS(p,s);
    const sampleText=sampleTexts[s.key]||s.key;
    div.innerHTML=`
      <div class="preview-label">${esc(s.key)} — ${s.sz}px/${s.wt}</div>
      <div style="font-family:${esc(css.fontFamily)};font-size:${css.fontSize};font-weight:${css.fontWeight};line-height:${css.lineHeight};letter-spacing:${css.letterSpacing};text-transform:${css.textTransform};font-style:${css.fontStyle};text-align:${css.textAlign};color:var(--ink)">${esc(sampleText)}</div>
    `;
    container.appendChild(div);
  });
}

/* ============================================================
   EXPORT
============================================================ */

/* ════════════════════════════════════════════
   BRAND BOARD + APLICAÇÕES
════════════════════════════════════════════ */


function fmtDate(ts){
  try{
    const d=new Date(ts);
    return d.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric"})+" • "+d.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
  }catch{return "";}
}

function mmToPx(mm,dpi){ return (mm/25.4)*dpi; }

function ensureApps(p){ if(!p.applications) p.applications=[]; }

function renderBoard(){
  const p=P(); if(!p) return;
  ensureApps(p);

  const colors=(p.colors||[]).filter(c=>c.hex);
  const updated=`Atualizado ${fmtDate(p.updatedAt)}`;

  $("bbTitle").textContent="Brand Board";
  $("bbSubtitle").textContent="Dashboard visual da identidade, aplicações e referências do projeto.";
  $("bbUpdated").textContent=updated;

  renderBoardShowcase(p, colors);
  refreshIcons();
}



function renderBoardShowcase(p, colors){
  const showcase=$("bbShowcase");
  if(!showcase) return;

  const palette=(colors||[]).filter(c=>c?.hex);
  const heroLogo=p.logoWd||p.logoSq;
  const topColors=palette.slice(0,8);
  const allType=(p.typo||[]);
  const styleOrder=["Display","H1","H2","H3","Body","Small","Caption","Button"];
  const sortedType=allType.slice().sort((a,b)=>{
    const ai=styleOrder.indexOf(a.key); const bi=styleOrder.indexOf(b.key);
    return (ai<0?99:ai)-(bi<0?99:bi);
  });

  const accent=palette[0]?.hex||"#7f5af0";
  const accentAlt=palette[1]?.hex||"#2cb67d";
  const soft=rgba(accent,12);
  const softAlt=rgba(accentAlt,12);

  let logoHtml=`<div class="upload-hint">${icon("image",16)}<span>Sem logo</span></div>`;
  if(heroLogo){
    if(heroLogo.type==="svg") logoHtml=heroLogo.data;
    else logoHtml=`<img src="${esc(heroLogo.data)}" alt="Logo da marca">`;
  }

  const colorHtml=topColors.length?topColors.map(c=>`
    <div class="bb-chip">
      <div class="bb-chip-swatch" style="background:${c.hex}"></div>
      <b>${esc(c.name||"Cor")}</b>
      <span>${esc(c.hex)} · ${esc(String(c.pct||0))}%</span>
    </div>
  `).join(""):`<span class="badge">Adicione cores no editor</span>`;

  const typoHtml=sortedType.length?sortedType.map(s=>{
    const fam=resolveFont(p,s.fam).replace(/"/g,"");
    const preview=s.key==="Button"?"Ação principal":(s.key==="Caption"?"legenda / apoio":"A estética da marca em uso");
    return `<div class="bb-typo-item">
      <div class="preview-label" style="margin-bottom:6px">${esc(s.key)} · ${esc(fam)} · ${s.sz}px/${s.wt}</div>
      <div style="font-family:'${fam}',ui-sans-serif;font-size:${Math.max(11,Math.min(34,s.sz))}px;font-weight:${s.wt};line-height:${s.lh};letter-spacing:${s.ls}px;text-transform:${s.up?"uppercase":"none"};font-style:${s.it?"italic":"normal"};text-align:${s.al};">
        ${esc(preview)}
      </div>
    </div>`;
  }).join(""):`<span class="badge">Defina estilos tipográficos no editor</span>`;

  const realApps=(p.applications||[]).slice(0,6);
  const apps=realApps.length?realApps:[{id:'demo',name:'Aplicação exemplo',w:1080,h:1080,unit:'px',svg:''}];
  const appHtml=apps.map(a=>`<article class="bb-app-card">
      <div class="bb-app-head">
        <b>${esc(a.name||"Aplicação")}</b>
        <span>${esc(a.w)}×${esc(a.h)} ${esc(a.unit||"px")}</span>
      </div>
      <div class="bb-app-thumb">${a.svg?`<img src="${svgToDataUri(a.svg)}" alt="Preview ${esc(a.name||"Aplicação")}">`:`<div class="bb-app-empty">Preview da aplicação aparecerá aqui</div>`}</div>
      ${a.id==='demo'?`<button class="bb-link" onclick="createApplication()">Criar aplicação agora</button>`:`<button class="bb-link" onclick="openAppEditor('${a.id}')">Abrir editor</button>`}
    </article>`).join("");

  showcase.style.setProperty('--bb-accent', accent);
  showcase.style.setProperty('--bb-accent-soft', soft);
  showcase.style.setProperty('--bb-accent-alt', accentAlt);
  showcase.style.setProperty('--bb-accent-alt-soft', softAlt);

  showcase.innerHTML=`
    <section class="bb-card bb-card-hero bb-sec-logo">
      <h4>Identidade visual</h4>
      <div class="bb-logo-stage">${logoHtml}</div>
      <div class="bb-usage" style="margin-top:10px">
        <div class="bb-usage-row"><span>Projeto</span><b>${esc(p.name||"Projeto")}</b></div>
        <div class="bb-usage-row"><span>Aplicações</span><span class="bb-pill">${(p.applications||[]).length} arquivos</span></div>
      </div>
    </section>

    <section class="bb-card bb-sec-info">
      <h4>Cores principais + campos de texto futuros</h4>
      <p class="bb-desc">${esc((p.about||'Sem descrição ainda. Defina no editor para enriquecer o dashboard.').slice(0,180))}</p>
      <div class="bb-chip-grid">${colorHtml}</div>
      <div class="bb-color-band">
        ${topColors.map(c=>`<div style="flex:${Math.max(8,c.pct||10)};background:${c.hex}"></div>`).join("") || `<div style="flex:1;background:${accent}"></div>`}
      </div>
      <div class="bb-form-preview" style="margin-top:10px">
        <label>Nome</label>
        <div class="bb-input">Digite o nome da peça...</div>
        <label>Mensagem</label>
        <div class="bb-input bb-input-area">Texto de apoio para aplicação futura</div>
        <div class="bb-input bb-input-focus">Campo em foco</div>
      </div>
    </section>

    <section class="bb-card bb-card-wide bb-sec-typo">
      <h4>Sistema tipográfico (todos os estilos)</h4>
      <div class="bb-typo-list">${typoHtml}</div>
    </section>

    <section class="bb-card bb-card-wide bb-sec-visual">
      <h4>Elementos visuais</h4>
      <div class="bb-ui-kit">
        <button class="bb-btn bb-btn-primary">Primário</button>
        <button class="bb-btn bb-btn-secondary">Secundário</button>
        <span class="bb-tag">Tag / destaque</span>
      </div>
      <div class="bb-mini-card">
        <div class="bb-mini-dot"></div>
        <div>
          <b>Card de aplicação</b>
          <p>Prévia visual alinhada com identidade da marca.</p>
        </div>
      </div>
    </section>

    <section class="bb-card bb-card-wide bb-sec-apps">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px">
        <h4 style="margin:0">Aplicações do projeto</h4>
        <button class="bb-link" onclick="nav('apps')">Ver todas</button>
      </div>
      <div class="bb-app-grid">${appHtml}</div>
    </section>
  `;
}

function buildBrandBoardExportCSS(){
  return `
  :root{--ink:#14161f;--ink2:#505a70;--line:#dbe1ea;--surface:#fff;--surface2:#f7f9fd}
  body{font-family:Inter,Arial,sans-serif;background:#f2f5fb;color:var(--ink);margin:0;padding:24px}
  .sheet{max-width:1240px;margin:0 auto;background:#fff;border:1px solid var(--line);border-radius:20px;padding:22px}
  h1{margin:0 0 8px;font-size:30px} p{margin:0 0 18px;color:var(--ink2)}
  .bb-showcase{display:grid;grid-template-columns:minmax(280px,1fr) minmax(320px,1fr);grid-template-areas:"logo info" "typo typo" "visual visual" "apps apps";gap:14px}
  .bb-card{background:var(--surface2);border:1px solid var(--line);border-radius:14px;padding:14px}
  .bb-card-wide{grid-column:1/-1}
  .bb-sec-logo{grid-area:logo}.bb-sec-info{grid-area:info}.bb-sec-typo{grid-area:typo}.bb-sec-visual{grid-area:visual}.bb-sec-apps{grid-area:apps}
  .bb-card h4{margin:0 0 10px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#6f7891}
  .bb-desc{margin:0 0 10px;font-size:12px;color:#5f6880;line-height:1.5}
  .bb-logo-stage{min-height:140px;border-radius:12px;border:1px dashed var(--line);background:var(--surface);display:flex;align-items:center;justify-content:center;padding:10px}
  .bb-logo-stage img,.bb-logo-stage svg{max-width:100%;max-height:128px;object-fit:contain}
  .bb-chip-grid{display:grid;grid-template-columns:repeat(2,minmax(120px,1fr));gap:8px}
  .bb-chip{border:1px solid var(--line);border-radius:10px;padding:8px;background:#fff;font-size:11px;display:flex;flex-direction:column;gap:4px}
  .bb-chip-swatch{height:28px;border-radius:8px;border:1px solid rgba(0,0,0,.12)}
  .bb-color-band{margin-top:10px;height:16px;border-radius:999px;overflow:hidden;display:flex;border:1px solid var(--line)}
  .bb-typo-list{display:flex;flex-direction:column;gap:8px;max-height:360px;overflow:auto}
  .bb-typo-item{border:1px solid var(--line);border-radius:10px;padding:10px;background:#fff}
  .preview-label{font-size:10px;color:#6f7891;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
  .bb-usage{display:flex;flex-direction:column;gap:10px}.bb-usage-row{display:flex;justify-content:space-between;font-size:12px;color:#49536a}
  .bb-pill{border:1px solid var(--line);border-radius:999px;padding:5px 10px;background:#fff;font-size:11px;font-weight:700}
  .bb-link{border:0;background:none;color:var(--bb-accent,#7f5af0);font-size:12px;font-weight:700;cursor:pointer;padding:0}
  .bb-app-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:10px}
  .bb-app-card{border:1px solid var(--line);border-radius:12px;padding:10px;background:#fff;display:flex;flex-direction:column;gap:8px}
  .bb-app-head{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:11px;color:#6a7388}
  .bb-app-head b{color:var(--ink);font-size:12px}
  .bb-app-thumb{border:1px dashed var(--line);border-radius:10px;min-height:130px;background:var(--surface2);display:flex;align-items:center;justify-content:center;overflow:hidden}
  .bb-app-thumb img{width:100%;height:130px;object-fit:contain;display:block}
  .bb-app-empty{font-size:12px;color:#77809a;text-align:center;padding:0 12px}
  .bb-ui-kit{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px}
  .bb-btn{border:1px solid transparent;border-radius:999px;padding:7px 12px;font-size:12px;font-weight:700}
  .bb-btn-primary{background:var(--bb-accent,#7f5af0);color:#fff}
  .bb-btn-secondary{border-color:var(--bb-accent,#7f5af0);color:var(--bb-accent,#7f5af0);background:#fff}
  .bb-tag{font-size:11px;padding:6px 10px;border-radius:999px;background:var(--bb-accent-soft,rgba(127,90,240,.14));color:var(--bb-accent,#7f5af0)}
  .bb-mini-card{display:flex;gap:8px;align-items:flex-start;border:1px solid var(--line);border-radius:10px;padding:10px;background:#fff}
  .bb-mini-dot{width:12px;height:12px;border-radius:999px;background:var(--bb-accent-alt,#2cb67d);margin-top:3px}.bb-mini-card p{margin:2px 0 0;font-size:12px;color:#6a7388}
  .bb-form-preview{display:flex;flex-direction:column;gap:6px}.bb-form-preview label{font-size:11px;color:#5e6780}
  .bb-input{border:1px solid var(--line);background:#fff;border-radius:10px;min-height:34px;padding:8px 10px;font-size:12px;color:#3d4456;display:flex;align-items:center}
  .bb-input-area{min-height:58px;align-items:flex-start}.bb-input-focus{border-color:var(--bb-accent,#7f5af0);box-shadow:0 0 0 2px var(--bb-accent-soft,rgba(127,90,240,.14))}
  @media (max-width:980px){.bb-showcase{grid-template-columns:1fr;grid-template-areas:"logo" "info" "typo" "visual" "apps"}}
  `;
}

function downloadBrandBoard(){
  const board=$("viewBoard");
  const p=P();
  if(!board || !p) return;
  const showcase=$("bbShowcase");
  const html=`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Brand Board - ${esc(p.name||"Projeto")}</title>
    <style>${buildBrandBoardExportCSS()}</style></head><body>
      <div class="sheet">
        <h1>${esc(p.name||"Projeto")}</h1>
        <p>Exportado do painel de projeto em ${new Date().toLocaleString("pt-BR")}.</p>
        <div class="bb-showcase" style="--bb-accent:${showcase?.style.getPropertyValue('--bb-accent')||'#7f5af0'};--bb-accent-soft:${showcase?.style.getPropertyValue('--bb-accent-soft')||'rgba(127,90,240,.14)'};--bb-accent-alt:${showcase?.style.getPropertyValue('--bb-accent-alt')||'#2cb67d'};--bb-accent-alt-soft:${showcase?.style.getPropertyValue('--bb-accent-alt-soft')||'rgba(44,182,125,.14)'};">${showcase?.innerHTML||""}</div>
      </div>
    </body></html>`;
  const blob=new Blob([html],{type:"text/html;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const an=document.createElement("a");
  an.href=url;
  an.download=(p.name||"brand-board").replace(/[^\w\-]+/g,"_").slice(0,80)+"-board.html";
  document.body.appendChild(an); an.click(); an.remove();
  setTimeout(()=>URL.revokeObjectURL(url),800);
  toast("Painel exportado em HTML","success");
}

function svgToDataUri(svg=""){
  try{
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }catch{ return ""; }
}

function extractSvgFontFamilies(svg=""){
  const out=new Set();
  const generic=new Set(["serif","sans-serif","monospace","cursive","fantasy","system-ui","ui-sans-serif","ui-serif","ui-monospace","emoji","math","fangsong","inherit","initial","unset"]);
  try{
    const doc=new DOMParser().parseFromString(String(svg||""),"image/svg+xml");
    const root=doc.documentElement;
    if(!root || root.nodeName.toLowerCase()==="parsererror") return [];
    root.querySelectorAll("[font-family],[style]").forEach(el=>{
      const fromAttr=(el.getAttribute("font-family")||"").trim();
      const fromStyle=(el.getAttribute("style")||"").match(/font-family\s*:\s*([^;]+)/i)?.[1]||"";
      [fromAttr,fromStyle].filter(Boolean).forEach(raw=>{
        raw.split(",").forEach(part=>{
          const fam=part.replace(/['"]/g,"").trim();
          if(!fam) return;
          if(generic.has(fam.toLowerCase())) return;
          out.add(fam);
        });
      });
    });
  }catch{}
  return [...out];
}

function normalizeSvgForEditor(svg=""){
  const raw=String(svg||"").trim();
  if(!raw) return "";
  try{
    const doc=new DOMParser().parseFromString(raw,"image/svg+xml");
    const root=doc.documentElement;
    if(!root || root.nodeName.toLowerCase()==="parsererror") return raw;

    const vb=(root.getAttribute("viewBox")||"").trim().split(/\s+/).map(Number);
    if(vb.length!==4 || vb.some(n=>Number.isNaN(n))) return raw;
    const [x,y,w,h]=vb;
    if(Math.abs(x)<0.001 && Math.abs(y)<0.001) return raw;

    const wrap=doc.createElementNS("http://www.w3.org/2000/svg","g");
    wrap.setAttribute("transform",`translate(${-x} ${-y})`);
    const keepAtRoot=new Set(["defs","style","title","desc","metadata"]);
    [...root.childNodes].forEach(node=>{
      if(node.nodeType!==1){ return; }
      const tag=node.nodeName.toLowerCase();
      if(keepAtRoot.has(tag)) return;
      wrap.appendChild(node);
    });
    root.appendChild(wrap);
    root.setAttribute("viewBox",`0 0 ${w} ${h}`);
    if(root.hasAttribute("width")) root.setAttribute("width",String(w));
    if(root.hasAttribute("height")) root.setAttribute("height",String(h));
    return new XMLSerializer().serializeToString(root);
  }catch{
    return raw;
  }
}

function renderApps(){
  const p=P(); if(!p) return;
  ensureApps(p);
  [p.fontPri,p.fontSec].filter(Boolean).forEach(tryLoadGoogleFont);
  (p.applications||[]).forEach(a=>extractSvgFontFamilies(a.svg||"").forEach(tryLoadGoogleFont));
  const list=$("appsList");
  $("appsCount").textContent = p.applications.length ? `${p.applications.length} arquivo(s)` : "Nenhum arquivo ainda.";

  if(!p.applications.length){
    list.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <p>Você ainda não gerou nenhuma aplicação.</p>
      <button class="btn btn-primary" onclick="createApplication()">Nova Aplicação Rápida</button>
    </div>`;
    return;
  }

  const appsSorted = p.applications.slice().sort((a,b)=>b.createdAt-a.createdAt);
  list.innerHTML = appsSorted.map((a,i)=>`
    <article class="export-card app-grid-card anim-in" style="animation-delay:${i*40}ms" data-app-id="${a.id}">
      <div class="export-preview export-preview-visual app-card-preview">
        ${a.svg ? `<img class="app-svg-thumb" src="${svgToDataUri(a.svg)}" alt="Preview ${esc(a.name||"Aplicação")}" loading="lazy"/>` : `<div class="app-svg-empty">Abra no editor para criar</div>`}
      </div>
      <div>
        <div class="export-card-title">${esc(a.name||"Aplicação")}</div>
        <div class="export-card-desc">${esc(a.type==="print"?"Impressão":"Web")} • ${esc(a.w)}×${esc(a.h)} ${esc(a.unit)} • ${a.dpi}dpi • ${a.bleed||0}${a.unit==="mm"?"mm":""} sangria</div>
      </div>
      <div class="app-card-actions">
        <details class="app-actions-menu">
          <summary class="btn-icon" aria-label="Mais opções">${icon('ellipsis',16)}</summary>
          <div class="app-actions-popover">
            <button class="app-action-item" type="button" data-app-action="edit" data-app-id="${a.id}">${icon('pencil',14)}Editar</button>
            <button class="app-action-item" type="button" data-app-action="duplicate" data-app-id="${a.id}">${icon('copy',14)}Duplicar</button>
            <button class="app-action-item" type="button" data-app-action="download" data-app-id="${a.id}">${icon('download',14)}Baixar SVG</button>
            <button class="app-action-item danger" type="button" data-app-action="delete" data-app-id="${a.id}">${icon('trash-2',14)}Excluir</button>
          </div>
        </details>
      </div>
    </article>
  `).join("");

  list.querySelectorAll(".app-grid-card").forEach(card=>{
    card.addEventListener("dblclick",ev=>{
      if(ev.target.closest('.app-card-actions')) return;
      const appId = card.dataset.appId;
      if(appId) openAppEditor(appId);
    });
  });

  list.querySelectorAll(".app-action-item").forEach(btn=>{
    btn.addEventListener("click",()=>{
      btn.closest("details")?.removeAttribute("open");
      const id=btn.dataset.appId;
      const action=btn.dataset.appAction;
      if(!id||!action) return;
      if(action==="edit") openAppEditor(id);
      else if(action==="duplicate") duplicateApp(id);
      else if(action==="download") downloadApp(id);
      else if(action==="delete") deleteApp(id);
    });
  });
}

function generateApplicationSVG(p,cfg,{preview=false}={}){
  // size
  const dpi=cfg.dpi||300;
  const unit=cfg.unit;
  const w=cfg.w, h=cfg.h;
  const bleed=cfg.type==="print" ? (cfg.bleed||0) : 0;
  const safe=cfg.type==="print" ? (cfg.safe||0) : 0;

  const wPx = unit==="mm" ? mmToPx(w,dpi) : w;
  const hPx = unit==="mm" ? mmToPx(h,dpi) : h;
  const bleedPx = unit==="mm" ? mmToPx(bleed,dpi) : bleed;
  const safePx  = unit==="mm" ? mmToPx(safe,dpi)  : safe;

  const W = Math.max(1, wPx + bleedPx*2);
  const H = Math.max(1, hPx + bleedPx*2);

  const margin = Math.max(18, Math.min(W,H)*0.05);
  const colors=(p.colors||[]).filter(c=>c.hex);
  const bg = "#ffffff"; // neutro: você aplica no editor
  const assetLogo = p.logoWd || p.logoSq || null;
  const logoHref = assetLogo?.type==="img" ? (assetLogo.data||"") : "";

  const famPri = resolveFont(p, TOK_PRI).replace(/"/g,"");
  const famSec = resolveFont(p, TOK_SEC).replace(/"/g,"");

  const guides = `
    <g id="guides" stroke="#00A3FF" stroke-width="1" fill="none" opacity="0.55" data-guide="1">
      ${bleedPx>0 ? `<rect x="0.5" y="0.5" width="${W-1}" height="${H-1}" stroke-dasharray="6 4"/>` : ``}
      <rect x="${bleedPx+0.5}" y="${bleedPx+0.5}" width="${W-bleedPx*2-1}" height="${H-bleedPx*2-1}" opacity="0.9"/>
      ${safePx>0 ? `<rect x="${bleedPx+safePx+0.5}" y="${bleedPx+safePx+0.5}" width="${W-2*(bleedPx+safePx)-1}" height="${H-2*(bleedPx+safePx)-1}" stroke-dasharray="3 5" opacity="0.8"/>` : ``}
    </g>`;

  const footer = `
    <g id="notes" data-guide="1" font-family="${famSec}" font-size="11" fill="rgba(0,0,0,.45)">
      <text x="${margin}" y="${H-margin}">${Math.round(w)}×${Math.round(h)}${unit} • ${cfg.type==="print"?"Impressão":"Web"} • ${dpi}dpi</text>
    </g>`;

  const baseLayer = `
    <g id="content" data-layer="content">
      <rect id="bg" data-editable="1" data-name="Fundo" x="${bleedPx}" y="${bleedPx}" width="${W-bleedPx*2}" height="${H-bleedPx*2}" rx="0" fill="${bg}"/>
    </g>`;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <title>${esc(cfg.name)}</title>
  <desc>Gerado pelo Goblins Faz Brand Studio. Ajuste estilos no App Editor antes de exportar.</desc>
  ${guides}
  ${baseLayer}
  ${footer}
</svg>`;

  return svg;
}


const BRIEFING_DEFAULT_TEXT = `projeto: Feira Gastronômica
pasta: feira-gastronomica-2026

---
arquivo: faixa-comidas
formato: faixa impressa
tamanho: 3000x500mm
titulo: COMIDAS
subtitulo: sabores do evento

---
arquivo: post-comidas
formato: instagram post
titulo: COMIDAS
subtitulo: venha conhecer`;

let _briefingInterpretation = [];

const BRIEFING_PRESETS = {
  "instagram post": { type:"web", unit:"px", w:1080, h:1080, dpi:72, bleed:0, safe:0 },
  "story": { type:"web", unit:"px", w:1080, h:1920, dpi:72, bleed:0, safe:0 },
  "faixa impressa": { type:"print", unit:"mm", w:3000, h:500, dpi:300, bleed:3, safe:15 },
  "cartaz a3": { type:"print", unit:"mm", w:297, h:420, dpi:300, bleed:3, safe:10 },
  "a4 impresso": { type:"print", unit:"mm", w:210, h:297, dpi:300, bleed:3, safe:10 }
};

function openBriefingModal(){
  const p=P(); if(!p){ toast("Abra um projeto primeiro","error"); return; }
  if($("briefingBatchName")) $("briefingBatchName").value = `${p.name||"Projeto"} — Lote`;
  if($("briefingText") && !$("briefingText").value.trim()) $("briefingText").value = BRIEFING_DEFAULT_TEXT;
  _briefingInterpretation = [];
  renderBriefingPreview([]);
  $("briefingBackdrop")?.classList.add("open");
}

function closeBriefingModal(){
  $("briefingBackdrop")?.classList.remove("open");
}

function parseBriefingStructuredText(raw){
  const text=String(raw||"").replace(/\r/g,"");
  const chunks=text.split(/\n\s*---\s*\n/g).map(part=>part.trim()).filter(Boolean);
  if(!chunks.length) return {meta:{}, items:[]};

  const parseChunk=(chunk)=>{
    const obj={};
    chunk.split("\n").forEach(line=>{
      const row=line.trim();
      if(!row || row.startsWith("#")) return;
      const idx=row.indexOf(":");
      if(idx===-1) return;
      const key=row.slice(0,idx).trim().toLowerCase();
      const value=row.slice(idx+1).trim();
      if(key) obj[key]=value;
    });
    return obj;
  };

  const parsed=chunks.map(parseChunk).filter(x=>Object.keys(x).length>0);
  if(!parsed.length) return {meta:{}, items:[]};

  const first=parsed[0];
  const hasFileLike=(o)=>o.arquivo || o.formato || o.tamanho || o.titulo || o.subtitulo || o.tipo;
  const meta = hasFileLike(first) ? {} : first;
  const items = hasFileLike(first) ? parsed : parsed.slice(1);
  return {meta, items};
}

function parseSizeValue(sizeRaw){
  const txt=String(sizeRaw||"").trim().toLowerCase();
  const m=txt.match(/^(\d+(?:[\.,]\d+)?)\s*x\s*(\d+(?:[\.,]\d+)?)(mm|px)?$/i);
  if(!m) return null;
  const w=Number(m[1].replace(',','.'));
  const h=Number(m[2].replace(',','.'));
  const unit=(m[3]||"px").toLowerCase();
  if(!Number.isFinite(w)||!Number.isFinite(h)) return null;
  return {w,h,unit:unit==="mm"?"mm":"px"};
}

function normalizeBriefingItem(item, fallbackPreset=""){
  const format=(item.formato||fallbackPreset||"").toLowerCase().trim();
  const preset=BRIEFING_PRESETS[format] || { type:"web", unit:"px", w:1920, h:1080, dpi:72, bleed:0, safe:0 };
  const cfg={...preset};

  const explicitType=(item.tipo||"").toLowerCase().trim();
  if(explicitType==="impresso" || explicitType==="print") cfg.type="print";
  else if(explicitType==="digital" || explicitType==="web") cfg.type="web";

  const parsedSize=parseSizeValue(item.tamanho);
  if(parsedSize){
    cfg.w=parsedSize.w;
    cfg.h=parsedSize.h;
    cfg.unit=parsedSize.unit;
  }

  if(item.sangria && Number.isFinite(Number(item.sangria.replace(/[^\d.,-]/g,"").replace(',','.')))){
    cfg.bleed=Number(item.sangria.replace(/[^\d.,-]/g,"").replace(',','.'));
  }
  if(item.seguranca && Number.isFinite(Number(item.seguranca.replace(/[^\d.,-]/g,"").replace(',','.')))){
    cfg.safe=Number(item.seguranca.replace(/[^\d.,-]/g,"").replace(',','.'));
  }

  cfg.name=(item.arquivo||item.nome||"Nova aplicação").trim();
  cfg.title=(item.titulo||cfg.name||"").trim();
  cfg.subtitle=(item.subtitulo||"").trim();
  cfg.format = format;
  return cfg;
}

function renderBriefingPreview(items){
  const host=$("briefingPreview");
  if(!host) return;
  if(!items.length){
    host.innerHTML='<div class="briefing-preview-empty">Clique em <b>Interpretar</b> para visualizar os arquivos que serão criados.</div>';
    return;
  }
  host.innerHTML=items.map(it=>`<div class="briefing-preview-item"><div><div class="briefing-preview-name">${esc(it.name)}</div><div class="briefing-preview-meta">${esc(it.format||"custom")} • ${esc(it.w)}×${esc(it.h)} ${esc(it.unit)}</div></div><div class="briefing-preview-meta">${esc(it.type==="print"?"impresso":"digital")}</div></div>`).join('');
}

function interpretBriefing(){
  const raw=$("briefingText")?.value||"";
  const parsed=parseBriefingStructuredText(raw);
  const fallbackPreset=(($("briefingTemplateBase")?.value)||"").toLowerCase();
  const normalized=(parsed.items||[]).map(item=>normalizeBriefingItem(item,fallbackPreset)).filter(it=>it.name);
  _briefingInterpretation = normalized;
  renderBriefingPreview(normalized);
  if(!normalized.length){
    toast("Nenhum bloco de arquivo reconhecido","info");
    return;
  }
  toast(`${normalized.length} aplicação(ões) interpretada(s)`,"success");
}

function generateApplicationsFromBriefing(){
  const p=P(); if(!p){ toast("Abra um projeto primeiro","error"); return; }
  ensureApps(p);
  if(!_briefingInterpretation.length){
    interpretBriefing();
    if(!_briefingInterpretation.length) return;
  }

  _briefingInterpretation.forEach(item=>{
    const app={
      id:uid("a"), createdAt:Date.now(), svg:"",
      name:item.name, type:item.type, unit:item.unit, w:item.w, h:item.h, dpi:item.dpi, bleed:item.bleed||0, safe:item.safe||0
    };
    const svg=generateApplicationSVG(p,{...item,name:item.name});
    if(svg){
      let xml=svg;
      if(item.title) xml = xml.replace(/(<text id="title"[^>]*>)([^<]*)(<\/text>)/, `$1${esc(item.title)}$3`);
      if(item.subtitle) xml = xml.replace(/(<text id="subtitle"[^>]*>)([^<]*)(<\/text>)/, `$1${esc(item.subtitle)}$3`);
      app.svg=xml;
    }
    p.applications.unshift(app);
  });

  p.updatedAt=Date.now();
  save(S.projects);
  renderApps();
  closeBriefingModal();
  toast(`${_briefingInterpretation.length} aplicação(ões) gerada(s)`,"success");
}

function createApplication(){
  const p=P(); if(!p){ toast("Abra um projeto primeiro","error"); return; }
  ensureApps(p);

  const cfg={
    type:"web",
    unit:"px",
    w:1920,
    h:1080,
    dpi:72,
    bleed:0,
    safe:0,
    name:`${p.name||"Projeto"} — Nova aplicação`
  };

  const app={ id:uid("a"), createdAt:Date.now(), svg:"",
    name:cfg.name, type:cfg.type, unit:cfg.unit, w:cfg.w, h:cfg.h, dpi:cfg.dpi, bleed:cfg.bleed, safe:cfg.safe
  };
  p.applications.unshift(app);
  p.updatedAt=Date.now();
  save(S.projects);

  toast("Aplicação criada e aberta no editor","success");
  openAppEditor(app.id);
}

function duplicateApp(id){
  const p=P(); if(!p) return;
  const source=(p.applications||[]).find(x=>x.id===id); if(!source) return;
  const copy={
    ...source,
    id:uid("a"),
    createdAt:Date.now(),
    name:`${source.name||"Aplicação"} (cópia)`
  };
  p.applications.unshift(copy);
  p.updatedAt=Date.now();
  save(S.projects);
  renderApps();
  toast("Aplicação duplicada","success");
}

function downloadApp(id){
  const p=P(); if(!p) return;
  const a=(p.applications||[]).find(x=>x.id===id); if(!a) return;
  const blob=new Blob([a.svg],{type:"image/svg+xml;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const an=document.createElement("a");
  an.href=url;
  const safeName=(a.name||"aplicacao").replace(/[^\w\-]+/g,"_").slice(0,80);
  an.download = safeName + ".svg";
  document.body.appendChild(an); an.click(); an.remove();
  setTimeout(()=>URL.revokeObjectURL(url),800);
}

function deleteApp(id){
  const p=P(); if(!p) return;
  if(!confirm("Excluir esta aplicação?")) return;
  p.applications=(p.applications||[]).filter(x=>x.id!==id);
  p.updatedAt=Date.now();
  save(S.projects);
  renderApps();
  toast("Aplicação removida","info");
}

function buildGeneratedFiles(p){
  const out=[];
  const inferBrandFolder=(asset)=>{
    if(asset?.type==='svg') return 'root-brand-svg';
    if(asset?.type==='img') return 'root-brand-png';
    return 'root-brand-variants';
  };
  if(p.logoSq){
    const ext=p.logoSq.type==='svg'?'svg':'png';
    out.push({id:'brand-logo-sq',name:`logo-quadrado.${ext}`,source:'brand',kind:'logo',folderId:inferBrandFolder(p.logoSq)});
  }
  if(p.logoWd){
    const ext=p.logoWd.type==='svg'?'svg':'png';
    out.push({id:'brand-logo-wd',name:`logo-horizontal.${ext}`,source:'brand',kind:'logo',folderId:inferBrandFolder(p.logoWd)});
  }
  (p.brandImport?.extras||[]).forEach((item,idx)=>{
    if(!item?.asset) return;
    const ext=item.asset.type==='svg'?'svg':'png';
    const name=(item.name||`logo-extra-${idx+1}`).toLowerCase().replace(/[^a-z0-9-]+/g,'-').replace(/^-+|-+$/g,'')||`logo-extra-${idx+1}`;
    out.push({id:`brand-extra-${item.id}`,name:`${name}.${ext}`,source:'brand',kind:'logo',folderId:'root-brand-variants'});
  });
  (p.applications||[]).forEach(a=>{
    if(a.svg) out.push({id:`app-${a.id}`,name:`${(a.name||'aplicacao').replace(/[^\w-]+/g,'_')}.svg`,source:'application',kind:'application',folderId:'root-apps',appId:a.id});
  });
  return out;
}
function syncExportLibraryFiles(p){
  ensureExportLibrary(p);
  const generated=buildGeneratedFiles(p);
  const manual=(p.exportLibrary.files||[]).filter(f=>!f.generated);
  const gen=generated.map(g=>{
    const prev=(p.exportLibrary.files||[]).find(f=>f.id===g.id);
    return {...g, generated:true, folderId:prev?.folderId||g.folderId};
  });
  p.exportLibrary.files=[...manual,...gen];
}
function createExportFolder(parentId=null){
  const p=P();if(!p)return;
  ensureExportLibrary(p);
  const parent=parentId || p.exportLibrary.activeFolderId || 'root-project';
  const name=prompt('Nome da pasta:','Nova pasta');
  if(!name||!name.trim()) return;
  p.exportLibrary.folders.push({id:uid('fld'),name:name.trim(),parent,autoName:false});
  if(p.exportLibrary.expanded[parent]===undefined) p.exportLibrary.expanded[parent]=true;
  p.updatedAt=Date.now();
  save(S.projects);
  renderExport();
}
function renameExportFolder(folderId){
  const p=P();if(!p)return;
  ensureExportLibrary(p);
  const fld=p.exportLibrary.folders.find(f=>f.id===folderId);if(!fld)return;
  const name=prompt('Renomear pasta:',fld.name);
  if(!name||!name.trim()) return;
  fld.name=name.trim();
  fld.autoName=false;
  p.updatedAt=Date.now();
  save(S.projects);
  renderExport();
}
function renameExportFolderInline(folderId,rawName){
  const p=P();if(!p)return;
  ensureExportLibrary(p);
  const fld=p.exportLibrary.folders.find(f=>f.id===folderId);if(!fld)return;
  const name=(rawName||'').trim();
  if(!name){ renderExport(); return; }
  fld.name=name;
  fld.autoName=false;
  p.updatedAt=Date.now();
  save(S.projects);
  renderExport();
}
function setActiveExportFolder(folderId){
  const p=P();if(!p)return;
  ensureExportLibrary(p);
  p.exportLibrary.activeFolderId=folderId;
  save(S.projects);
  renderExport();
}
function toggleExportFolder(folderId,ev){
  if(ev){ ev.stopPropagation(); }
  const p=P();if(!p)return;
  ensureExportLibrary(p);
  p.exportLibrary.expanded[folderId]=!p.exportLibrary.expanded[folderId];
  save(S.projects);
  renderExport();
}
function getExportFolderDescendants(folderId){
  const p=P(); if(!p) return [];
  ensureExportLibrary(p);
  const byParent=new Map();
  (p.exportLibrary.folders||[]).forEach(f=>{
    const key=f.parent||'__root__';
    if(!byParent.has(key)) byParent.set(key,[]);
    byParent.get(key).push(f.id);
  });
  const out=[];
  const walk=(id)=>{
    const kids=byParent.get(id)||[];
    kids.forEach(k=>{ out.push(k); walk(k); });
  };
  walk(folderId);
  return out;
}
function countExportFolderFiles(folderId){
  const p=P(); if(!p) return 0;
  const ids=new Set([folderId,...getExportFolderDescendants(folderId)]);
  return (p.exportLibrary.files||[]).filter(x=>ids.has(x.folderId||'root-brand')).length;
}
function getExportFolderPath(folderId){
  const p=P(); if(!p) return [];
  const folders=p.exportLibrary.folders||[];
  const map=new Map(folders.map(f=>[f.id,f]));
  const path=[];
  let cur=map.get(folderId);
  while(cur){
    path.unshift(cur);
    cur=cur.parent?map.get(cur.parent):null;
  }
  return path;
}
function buildFolderChildrenMap(folders){
  const m=new Map();
  folders.forEach(f=>{
    const key=f.parent||'__root__';
    if(!m.has(key)) m.set(key,[]);
    m.get(key).push(f);
  });
  return m;
}
function exportMoveFolder(folderId,targetId,mode){
  const p=P();if(!p)return;
  ensureExportLibrary(p);
  const folders=p.exportLibrary.folders||[];
  const folder=folders.find(f=>f.id===folderId);
  const target=folders.find(f=>f.id===targetId);
  if(!folder||!target||folder.id==='root-project') return;
  const descendants=new Set(getExportFolderDescendants(folder.id));
  if(descendants.has(targetId)) return;

  if(mode==='inside'){
    folder.parent=target.id;
    p.exportLibrary.expanded[target.id]=true;
  }else{
    folder.parent=target.parent||'root-project';
    const siblings=folders.filter(f=>(f.parent||'root-project')===(folder.parent||'root-project') && f.id!==folder.id);
    const newSibs=[];
    siblings.forEach(sib=>{
      if(mode==='before' && sib.id===target.id) newSibs.push(folder);
      newSibs.push(sib);
      if(mode==='after' && sib.id===target.id) newSibs.push(folder);
    });
    if(!newSibs.find(x=>x.id===folder.id)) newSibs.push(folder);
    const others=folders.filter(f=>(f.parent||'root-project')!==(folder.parent||'root-project') && f.id!==folder.id);
    p.exportLibrary.folders=[...others,...newSibs];
  }

  p.updatedAt=Date.now();
  save(S.projects);
  renderExport();
}
function onExportTreeDragStart(ev,folderId){
  ev.stopPropagation();
  ev.dataTransfer.setData('text/export-folder',folderId);
  ev.dataTransfer.effectAllowed='move';
}
function onExportTreeDragOver(ev){
  ev.preventDefault();
}
function onExportTreeDrop(ev,targetId){
  ev.preventDefault();
  const sourceFolderId=ev.dataTransfer.getData('text/export-folder');
  const sourceFileId=ev.dataTransfer.getData('text/plain');
  if(sourceFolderId){
    const rect=ev.currentTarget.getBoundingClientRect();
    const y=ev.clientY-rect.top;
    const mode=y<rect.height*0.3?'before':(y>rect.height*0.7?'after':'inside');
    exportMoveFolder(sourceFolderId,targetId,mode);
    return;
  }
  if(sourceFileId){
    onExportFolderDrop(ev,targetId);
  }
}
function onExportFileDragStart(ev,fileId){
  ev.dataTransfer.setData('text/plain',fileId);
}
function onExportFolderDrop(ev,folderId){
  ev.preventDefault();
  const id=ev.dataTransfer.getData('text/plain');
  const p=P();if(!p||!id)return;
  const file=(p.exportLibrary?.files||[]).find(f=>f.id===id); if(!file)return;
  file.folderId=folderId;
  p.updatedAt=Date.now();
  save(S.projects);
  renderExport();
}
function onExportFolderDragOver(ev){ ev.preventDefault(); }
function renameExportFile(fileId){
  const p=P();if(!p)return;
  const file=(p.exportLibrary?.files||[]).find(f=>f.id===fileId); if(!file)return;
  const name=prompt('Renomear arquivo:',file.name);
  if(!name||!name.trim()) return;
  file.name=name.trim();
  p.updatedAt=Date.now();
  save(S.projects);
  renderExport();
}
function addManualExportFile(){
  const p=P();if(!p)return;
  ensureExportLibrary(p);
  const name=prompt('Nome do arquivo manual:','novo-arquivo.txt');
  if(!name||!name.trim()) return;
  p.exportLibrary.files.push({id:uid('file'),name:name.trim(),source:'manual',kind:'manual',folderId:p.exportLibrary.activeFolderId||'root-brand',generated:false});
  p.updatedAt=Date.now();
  save(S.projects);
  renderExport();
}
function renderExportTreeNodes(folderChildren,parentId,activeFolderId,depth){
  const p=P();
  const folders=folderChildren.get(parentId)||[];
  return folders.map(f=>{
    const isActive=f.id===activeFolderId;
    const children=folderChildren.get(f.id)||[];
    const expanded=p.exportLibrary.expanded[f.id]!==false;
    const count=countExportFolderFiles(f.id);
    const indent=depth*14;
    const chevron=children.length ? icon(expanded?'chevron-down':'chevron-right',12) : '<span class="tree-spacer"></span>';
    const kids=(children.length&&expanded)?renderExportTreeNodes(folderChildren,f.id,activeFolderId,depth+1):'';
    return `<div class="tree-node-wrap">      <div class="tree-item ${isActive?'active':''}" style="padding-left:${8+indent}px" onclick="setActiveExportFolder('${f.id}')" draggable="${f.id==='root-project'?'false':'true'}" ondragstart="onExportTreeDragStart(event,'${f.id}')" ondragover="onExportTreeDragOver(event)" ondrop="onExportTreeDrop(event,'${f.id}')">        <button class="tree-toggle" onclick="toggleExportFolder('${f.id}',event)">${chevron}</button>        ${icon('folder',12)}        <span class="name" ondblclick="event.stopPropagation();this.style.display='none';this.nextElementSibling.style.display='block';this.nextElementSibling.focus();this.nextElementSibling.select();">${esc(f.name)}</span>        <input class="tree-inline-edit" style="display:none" value="${esc(f.name)}" onblur="renameExportFolderInline('${f.id}',this.value)" onkeydown="if(event.key==='Enter'){renameExportFolderInline('${f.id}',this.value)} if(event.key==='Escape'){renderExport()}" />        <span class="count">${count}</span>        <button class="btn-icon" style="width:24px;height:24px" onclick="event.stopPropagation();renameExportFolder('${f.id}')">${icon('pencil',11)}</button>      </div>      ${kids}    </div>`;
  }).join('');
}

function renderExport(){
  const p=P();if(!p){$("exportGrid").innerHTML=`<div class="empty-state"><p>Nenhum projeto aberto.</p></div>`; const em=$("exportManager"); if(em) em.innerHTML=''; return;}
  ensureExportLibrary(p);
  syncExportLibraryFiles(p);

  const activeFolderId=p.exportLibrary.activeFolderId||'root-brand';
  const folders=p.exportLibrary.folders||[];
  const folderChildren=buildFolderChildrenMap(folders);
  const directFiles=(p.exportLibrary.files||[]).filter(f=>(f.folderId||'root-brand')===activeFolderId);
  const manager=$("exportManager");
  if(manager){
    const path=getExportFolderPath(activeFolderId);
    manager.innerHTML=`
      <div class="export-manager anim-in">
        <div class="export-manager-head">
          <div>
            <div class="export-manager-title">Pastas e arquivos exportados</div>
            <div class="export-manager-sub">Arraste pastas e arquivos para organizar a estrutura final antes de exportar.</div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn btn-ghost" onclick="createExportFolder('root-project')">${icon('folder-plus',12)} Nova pasta</button>
            <button class="btn btn-ghost" onclick="createExportFolder('${activeFolderId}')">${icon('folder-tree',12)} Nova subpasta</button>
            <button class="btn btn-ghost" onclick="addManualExportFile()">${icon('file-plus-2',12)} Novo arquivo</button>
            <button class="btn btn-primary" onclick="exportLibraryAsZip()">${icon('archive',12)} Exportar .zip</button>
          </div>
        </div>
        <div class="export-manager-body">
          <div class="folder-tree" ondragover="onExportTreeDragOver(event)" ondrop="onExportTreeDrop(event,'root-project')">
            ${renderExportTreeNodes(folderChildren,'__root__',activeFolderId,0)}
          </div>
          <div class="file-pane" ondragover="onExportFolderDragOver(event)" ondrop="onExportFolderDrop(event,'${activeFolderId}')">
            <div class="file-breadcrumb">${path.map((f,i)=>`<button class="crumb ${i===path.length-1?'active':''}" onclick="setActiveExportFolder('${f.id}')">${esc(f.name)}</button>`).join('<span>/</span>')}</div>
            ${directFiles.length?directFiles.map(file=>`<div class="file-item" draggable="true" ondragstart="onExportFileDragStart(event,'${file.id}')">
              ${icon(file.source==='application'?'file-code-2':(file.source==='brand'?'image':'file'),13)}
              <div style="flex:1">
                <div>${esc(file.name)}</div>
                <div class="file-meta">${file.source==='brand'?'Gerado da marca':file.source==='application'?'Gerado da aplicação':'Manual'}</div>
              </div>
              <button class="btn-icon" onclick="renameExportFile('${file.id}')">${icon('pencil',11)}</button>
            </div>`).join(''):`<div class="empty-state" style="padding:18px 8px"><p>Esta pasta ainda está vazia.</p><div style="display:flex;gap:8px;justify-content:center"><button class="btn btn-ghost" onclick="addManualExportFile()">${icon('file-plus-2',12)} Adicionar arquivo</button><button class="btn btn-ghost" onclick="createExportFolder('${activeFolderId}')">${icon('folder-tree',12)} Criar subpasta</button></div></div>`}
          </div>
        </div>
      </div>`;
  }

  const cssVars=[
    "/* === CORES === */",
    ...p.colors.map((c,i)=>{
      const name=(c.name||`cor-${i+1}`).toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"");
      const rgb=hexToRgb(c.hex)||{r:0,g:0,b:0};
      const hsl=rgbToHsl(rgb.r,rgb.g,rgb.b);
      return `--color-${name}: ${c.hex};
--color-${name}-rgb: ${rgb.r}, ${rgb.g}, ${rgb.b};
--color-${name}-hsl: ${hsl.h}, ${hsl.s}%, ${hsl.l}%;`;
    }),
    "",
    "/* === TIPOGRAFIA === */",
    `--font-primary: "${p.fontPri}";`,
    `--font-secondary: "${p.fontSec}";`,
    ...(p.typo||[]).map(st=>{
      const key=st.key.toLowerCase();
      return `--type-${key}-size: ${st.sz}px;
--type-${key}-weight: ${st.wt};
--type-${key}-line: ${st.lh};
--type-${key}-spacing: ${st.ls}px;`;
    }),
  ].join("\n");

  const tokens=JSON.stringify({
    color:Object.fromEntries(p.colors.map((c,i)=>{
      const name=(c.name||`color${i+1}`).toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"");
      return [name,{value:c.hex,alpha:c.alpha,usage:`${c.pct}%`}];
    })),
    typography:{fontPrimary:p.fontPri,fontSecondary:p.fontSec}
  },null,2);

  const tailwind=`// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
${p.colors.map((c,i)=>{const name=(c.name||`color${i+1}`).toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"");return `        "${name}": "${c.hex}",`;}).join("\n")}
      }
    }
  }
}`;

  const cards=[
    {title:"CSS Custom Properties",desc:"Cole no seu :root {} para usar em qualquer projeto web.",preview:":root {\n"+cssVars+"\n}",copy:":root {\n"+cssVars+"\n}"},
    {title:"Design Tokens (JSON)",desc:"Seção secundária: mantenha para pipeline quando necessário.",preview:tokens.slice(0,300)+(tokens.length>300?"…":""),copy:tokens},
    {title:"Tailwind Config",desc:"Seção secundária: exporte para seu tailwind.config.js.",preview:tailwind.slice(0,280)+"…",copy:tailwind},
  ];

  $("exportGrid").innerHTML=cards.map((card,i)=>`
    <div class="export-card anim-in tokens-muted" style="animation-delay:${i*60}ms">
      <div>
        <div class="export-card-title">${esc(card.title)}</div>
        <div class="export-card-desc">${esc(card.desc)}</div>
      </div>
      <div class="export-preview">${esc(card.preview)}</div>
      <button class="btn btn-ghost" onclick="copyExport(${i})" style="width:100%;justify-content:center">
        ${icon("copy",12)}
        Copiar ${esc(card.title)}
      </button>
    </div>
  `).join("");

  window._exportData=cards;
  save(S.projects);
  refreshIcons();
}




function getGeneratedFileContent(p,file){
  if(file.source==='brand'){
    if(file.id==='brand-logo-sq' && p.logoSq){
      return p.logoSq.type==='svg'?{content:p.logoSq.data,type:'image/svg+xml'}:{content:p.logoSq.data.split(',')[1]||'',type:'image/png',base64:true};
    }
    if(file.id==='brand-logo-wd' && p.logoWd){
      return p.logoWd.type==='svg'?{content:p.logoWd.data,type:'image/svg+xml'}:{content:p.logoWd.data.split(',')[1]||'',type:'image/png',base64:true};
    }
    if(file.id.startsWith('brand-extra-')){
      const extraId=file.id.replace('brand-extra-','');
      const extra=(p.brandImport?.extras||[]).find(x=>x.id===extraId);
      if(extra?.asset){
        return extra.asset.type==='svg'?{content:extra.asset.data,type:'image/svg+xml'}:{content:extra.asset.data.split(',')[1]||'',type:'image/png',base64:true};
      }
    }
  }
  if(file.source==='application' && file.appId){
    const app=(p.applications||[]).find(a=>a.id===file.appId);
    if(app?.svg) return {content:app.svg,type:'image/svg+xml'};
  }
  if(file.source==='manual') return {content:`Arquivo manual: ${file.name}
`,type:'text/plain'};
  return {content:'',type:'text/plain'};
}

async function exportLibraryAsZip(){
  const p=P(); if(!p){ toast('Abra um projeto primeiro','error'); return; }
  ensureExportLibrary(p);
  syncExportLibraryFiles(p);
  if(typeof window.JSZip==='undefined'){
    toast('Exportação ZIP indisponível (JSZip não carregado)','error');
    return;
  }
  const zip=new window.JSZip();
  const folders=p.exportLibrary.folders||[];
  const folderMap=new Map(folders.map(f=>[f.id,f]));
  const pathFor=(folderId)=>{
    const parts=[];
    let cur=folderMap.get(folderId);
    while(cur){
      parts.unshift(cur.name);
      cur=cur.parent?folderMap.get(cur.parent):null;
    }
    return parts.join('/');
  };
  (p.exportLibrary.files||[]).forEach(file=>{
    const folderPath=pathFor(file.folderId||'root-brand');
    const payload=getGeneratedFileContent(p,file);
    const target=folderPath ? `${folderPath}/${file.name}` : file.name;
    if(payload.base64) zip.file(target,payload.content,{base64:true});
    else zip.file(target,payload.content);
  });
  const blob=await zip.generateAsync({type:'blob'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  const safe=(p.name||'projeto').replace(/[^\w-]+/g,'_');
  a.download=`${safe}.zip`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),1200);
  toast('ZIP exportado com sucesso','success');
}

async function copyExport(i){
  const card=window._exportData?.[i];if(!card)return;
  try{await navigator.clipboard.writeText(card.copy);toast(card.title+" copiado!","success");}
  catch{toast("Erro ao copiar","error");}
}


/* ============================================================
   APP EDITOR — EDIT BEFORE EXPORT
============================================================ */
let _appEdit = { appId:null, selId:null, svgEl:null, guideVisible:true };

function openAppEditor(appId){
  const p=P(); if(!p) return;
  const a=(p.applications||[]).find(x=>x.id===appId);
  if(!a){ toast("Aplicação não encontrada","error"); return; }

  _appEdit.appId = appId;
  _appEdit.selId = null;
  nav("appEditor");
}

function ensureAppEditorReady(a,p){
  if($("appEditName")) $("appEditName").textContent = a.name || "Aplicação";
  if($("appEditMeta")) $("appEditMeta").textContent = `${a.type==="print"?"Impressão":"Web"} • ${a.w}×${a.h}${a.unit} • ${a.dpi}dpi`;
  if($("appEditNameInput")) $("appEditNameInput").value = a.name || "Aplicação";

  // Load iframe content (defined in post-template script)
  if(typeof geEnsureIframeLoaded === "function") geEnsureIframeLoaded();

  // Send document + current file data after iframe boots
  setTimeout(()=>{
    if(a){
      let w=Number(a.w), h=Number(a.h);
      if((a.unit||"px")==="mm"){ const dpi=Number(a.dpi)||72; w=(w/25.4)*dpi; h=(h/25.4)*dpi; }
      gePost({type:"setDoc", w, h, fit:true});
      const normalizedSvg=normalizeSvgForEditor(a.svg||"");
      extractSvgFontFamilies(normalizedSvg).forEach(tryLoadGoogleFont);
      gePost({type:"setSVG", svg:normalizedSvg});
    }
    gePushBrandData(p);
    gePost({
      type:"geSetApplicationMeta",
      name:a.name || "Aplicação",
      modeLabel:a.type==="print"?"Impressão":"Web",
      width:a.w,
      height:a.h,
      unit:a.unit||"px",
      dpi:a.dpi||72
    });
  }, 450);
}

function switchToFabricEditor(){
  // Hide SVG host, show Fabric iframe
  const host=$("appCanvasHost");
  const iframe=$("geEditorFrame");
  if(host) host.style.display="none";
  if(iframe){ iframe.style.display="block"; geEnsureIframeLoaded(); }

  // Send brand data to iframe
  const p=P();
  if(p) gePushBrandData(p);
  toast("Editor Avançado (Fabric.js) aberto","info");
}

function buildBrandLibrary(p){
  if(!p) return [];
  const items=[];
  if(p.logoSq?.data) items.push({kind:"logo",name:"Logo quadrado",src:p.logoSq.data});
  if(p.logoWd?.data) items.push({kind:"logo",name:"Logo horizontal",src:p.logoWd.data});
  (p.colors||[]).forEach(c=>{
    if(!c?.hex) return;
    items.push({kind:"color",name:c.name||c.hex,color:c.hex,alpha:c.alpha??100});
  });
  (p.typo||[]).forEach(s=>{
    items.push({
      kind:"text-style",
      name:s.key||"Texto",
      font:resolveFont(p,s.fam),
      weight:Number(s.wt)||400,
      size:Number(s.sz)||24,
      lineHeight:Number(s.lh)||1.2,
      letterSpacing:Number(s.ls)||0,
      italic:!!s.it,
      uppercase:!!s.up,
      align:s.al||"left"
    });
  });
  return items;
}

function gePushBrandData(project=P()){
  try{
    const p=project||P();
    if(!p) return;
    const colors=(p.colors||[]).filter(c=>c?.hex);
    const fonts=[p.fontPri,p.fontSec,...(typeof FONTS!=="undefined"?FONTS:[])].filter(Boolean);
    const library=buildBrandLibrary(p);
    gePost({type:"setBrand", colors, fonts, library});
  }catch(e){}
}

function switchToSvgEditor(){
  const host=$("appCanvasHost");
  const iframe=$("geEditorFrame");
  if(iframe) iframe.style.display="none";
  if(host) host.style.display="flex";
}

function appEditEsc(e){
  if(e.key==="Escape") closeAppEditor();
  else document.addEventListener("keydown", appEditEsc, {once:true});
}

function closeAppEditor(){
  nav("apps");
  _appEdit = { appId:null, selId:null, svgEl:null, guideVisible:true };
}

function buildLayerList(){
  const svg=_appEdit.svgEl; if(!svg) return;
  const items=[...svg.querySelectorAll("[data-editable='1']")].map(el=>{
    const name=el.getAttribute("data-name") || el.id || el.tagName;
    const type=el.tagName.toLowerCase();
    return { id: el.id, name, type };
  }).filter(x=>x.id);

  if($("layerCount")) $("layerCount").textContent = items.length;
  if($("layerList")) $("layerList").innerHTML = items.map(it=>{
    const active = it.id===_appEdit.selId ? "active" : "";
    return `<div class="layer-item ${active}" onclick="selectSvgElement('${it.id}')">
      <div>
        <div class="layer-name">${esc(it.name)}</div>
        <div class="layer-meta">${esc(it.type)}</div>
      </div>
      <div style="color:var(--ink3)">›</div>
    </div>`;
  }).join("");
}

function selectSvgElement(id){
  const svg=_appEdit.svgEl; if(!svg) return;
  // clear old
  if(_appEdit.selId){
    const old=svg.getElementById(_appEdit.selId);
    if(old){
      old.removeAttribute("data-selected");
      old.style.filter = "";
      // remove highlight stroke if we added one
      if(old._prevStroke!==undefined){
        old.setAttribute("stroke", old._prevStroke);
        old.setAttribute("stroke-width", old._prevStrokeW);
        old._prevStroke = undefined;
      }
    }
  }

  _appEdit.selId = id;
  const el = svg.getElementById(id);
  if(!el) return;

  // highlight
  el._prevStroke = el.getAttribute("stroke") || "";
  el._prevStrokeW = el.getAttribute("stroke-width") || "";
  el.setAttribute("stroke", "rgba(127,90,240,.85)");
  el.setAttribute("stroke-width", "2");
  el.style.filter = "drop-shadow(0 0 10px rgba(127,90,240,.28))";

  $("selTag").textContent = el.getAttribute("data-name") || id;
  $("selType").textContent = el.tagName.toLowerCase();

  // populate inspector
  const fill = el.getAttribute("fill") || "";
  if($("fillHex")) $("fillHex").value = fill.startsWith("#") ? fill : "";
  if($("fillColor") && fill.startsWith("#")) $("fillColor").value = fill;
  if(el.tagName.toLowerCase()==="text"){
    if($("textValue")) $("textValue").value = el.textContent || "";
  } else {
    if($("textValue")) $("textValue").value = "";
  }

  updateInspector(el);

  updateSelectionUI();
  buildLayerList();
}

function updateInspector(el){
  // show/hide controls based on element type
  const tag = (el?.tagName||"").toLowerCase();
  const isText = tag==="text";
  const isBox = (tag==="rect" || tag==="image");

  $("textStyleRow").style.display = isText ? "" : "none";
  $("sizeTitle").style.display = isBox ? "" : "none";
  $("sizeWRow").style.display = isBox ? "" : "none";
  $("sizeHRow").style.display = isBox ? "" : "none";
  $("radiusRow").style.display = tag==="rect" ? "" : "none";

  // position
  const x = el.getAttribute("x");
  const y = el.getAttribute("y");
  $("posX").value = x ?? "";
  $("posY").value = y ?? "";

  // size
  $("sizeW").value = el.getAttribute("width") ?? "";
  $("sizeH").value = el.getAttribute("height") ?? "";
  $("radius").value = el.getAttribute("rx") ?? "";

  // text style
  if(isText){
    $("fontSize").value = el.getAttribute("font-size") ?? "";
    $("fontWeight").value = el.getAttribute("font-weight") ?? "";
  } else {
    $("fontSize").value = "";
    $("fontWeight").value = "";
  }
}


/* ============================================================
   APP EDITOR — Selection box + resize handles (lightweight)
============================================================ */
let _selUI = { ready:false };
let _resize = { on:false, dir:null, id:null, sx:0, sy:0, ox:0, oy:0, ow:0, oh:0 };

function ensureSelectionUI(){
  const svg=_appEdit.svgEl; if(!svg) return;
  if(svg.getElementById("__ui")){ _selUI.ready=true; return; }

  const ui = document.createElementNS("http://www.w3.org/2000/svg","g");
  ui.setAttribute("id","__ui");
  ui.setAttribute("data-layer","ui");

  const rect = document.createElementNS("http://www.w3.org/2000/svg","rect");
  rect.setAttribute("id","__selRect");
  rect.setAttribute("fill","none");
  rect.setAttribute("stroke","rgba(127,90,240,.85)");
  rect.setAttribute("stroke-width","1.5");
  rect.setAttribute("stroke-dasharray","6 4");
  rect.setAttribute("pointer-events","none");
  rect.setAttribute("opacity","0");

  ui.appendChild(rect);

  const dirs=["nw","n","ne","e","se","s","sw","w"];
  dirs.forEach(d=>{
    const h = document.createElementNS("http://www.w3.org/2000/svg","circle");
    h.setAttribute("class","__h");
    h.setAttribute("data-dir", d);
    h.setAttribute("r","6");
    h.setAttribute("fill","#fff");
    h.setAttribute("stroke","rgba(127,90,240,.90)");
    h.setAttribute("stroke-width","2");
    h.setAttribute("opacity","0");
    h.style.cursor = (d==="n"||d==="s") ? "ns-resize" :
                     (d==="e"||d==="w") ? "ew-resize" :
                     (d==="ne"||d==="sw") ? "nesw-resize" : "nwse-resize";
    h.addEventListener("mousedown",(ev)=>{
      ev.preventDefault(); ev.stopPropagation();
      if(!_appEdit.selId) return;
      const el=svg.getElementById(_appEdit.selId);
      if(!el) return;
      const tag=el.tagName.toLowerCase();
      if(!(tag==="rect" || tag==="image")){ toast("Resize funciona em retângulo/imagem","info"); return; }

      const p=getSvgPoint(ev, svg);
      _resize.on=true;
      _resize.dir=d;
      _resize.id=_appEdit.selId;
      _resize.sx=p.x; _resize.sy=p.y;
      _resize.ox=parseFloat(el.getAttribute("x")||"0");
      _resize.oy=parseFloat(el.getAttribute("y")||"0");
      _resize.ow=parseFloat(el.getAttribute("width")||"0");
      _resize.oh=parseFloat(el.getAttribute("height")||"0");
    });
    ui.appendChild(h);
  });

  svg.appendChild(ui);
  _selUI.ready=true;
}

function updateSelectionUI(){
  const svg=_appEdit.svgEl; if(!svg) return;
  ensureSelectionUI();
  const ui=svg.getElementById("__ui");
  const box=svg.getElementById("__selRect");
  const handles=[...ui.querySelectorAll("circle.__h")];

  if(!_appEdit.selId){
    box.setAttribute("opacity","0");
    handles.forEach(h=>h.setAttribute("opacity","0"));
    return;
  }
  const el=svg.getElementById(_appEdit.selId);
  if(!el){ box.setAttribute("opacity","0"); handles.forEach(h=>h.setAttribute("opacity","0")); return; }

  let bb;
  try{ bb = el.getBBox(); }catch{ bb=null; }
  if(!bb){ box.setAttribute("opacity","0"); handles.forEach(h=>h.setAttribute("opacity","0")); return; }

  const pad=4;
  const x=bb.x-pad, y=bb.y-pad, w=bb.width+pad*2, h=bb.height+pad*2;

  box.setAttribute("x", x);
  box.setAttribute("y", y);
  box.setAttribute("width", w);
  box.setAttribute("height", h);
  box.setAttribute("rx","4");
  box.setAttribute("opacity","1");

  const pts={
    nw:[x,y], n:[x+w/2,y], ne:[x+w,y],
    e:[x+w,y+h/2], se:[x+w,y+h], s:[x+w/2,y+h],
    sw:[x,y+h], w:[x,y+h/2]
  };
  handles.forEach(hh=>{
    const d=hh.getAttribute("data-dir");
    const [px,py]=pts[d];
    hh.setAttribute("cx", px);
    hh.setAttribute("cy", py);
    hh.setAttribute("opacity","1");
  });
}

function moveResize(evt){
  if(!_resize.on) return;
  const svg=_appEdit.svgEl; if(!svg) return;
  const el=svg.getElementById(_resize.id);
  if(!el) return;

  const p=getSvgPoint(evt, svg);
  let dx = p.x - _resize.sx;
  let dy = p.y - _resize.sy;

  let x=_resize.ox, y=_resize.oy, w=_resize.ow, h=_resize.oh;

  const dir=_resize.dir;

  if(dir.includes("e")) w = _resize.ow + dx;
  if(dir.includes("s")) h = _resize.oh + dy;
  if(dir.includes("w")){ w = _resize.ow - dx; x = _resize.ox + dx; }
  if(dir.includes("n")){ h = _resize.oh - dy; y = _resize.oy + dy; }

  w = Math.max(8, w);
  h = Math.max(8, h);

  el.setAttribute("x", String(Math.round(x*100)/100));
  el.setAttribute("y", String(Math.round(y*100)/100));
  el.setAttribute("width", String(Math.round(w*100)/100));
  el.setAttribute("height", String(Math.round(h*100)/100));

  $("posX").value = el.getAttribute("x")||"";
  $("posY").value = el.getAttribute("y")||"";
  $("sizeW").value = el.getAttribute("width")||"";
  $("sizeH").value = el.getAttribute("height")||"";

  updateSelectionUI();
}

function endResize(){
  if(!_resize.on) return;
  _resize.on=false;
  persistAppSvg();
}

function fillStylePicker(){
  const p=P(); if(!p) return;
  const sel=$("stylePick");
  sel.innerHTML = `<option value="">—</option>` + (p.typo||[]).map(s=>`<option value="${esc(s.key)}">${esc(s.key)}</option>`).join("");
}

function applyStyleToSelection(styleKey){
  const p=P(); if(!p) return;
  const svg=_appEdit.svgEl; if(!svg) return;
  if(!_appEdit.selId) return;
  const el=svg.getElementById(_appEdit.selId);
  if(!el) return;

  const tag=el.tagName.toLowerCase();
  if(tag!=="text"){ toast("Estilo tipográfico funciona em textos","info"); return; }

  const s=(p.typo||[]).find(x=>x.key===styleKey);
  if(!s) return;

  // Compat: alguns builds antigos usavam nomes curtos (fam/sz/wt/lh/tr)
  const famTok = (s.family ?? s.fam ?? "__PRIMARY__");
  const size   = (s.size   ?? s.sz  ?? 16);
  const weight = (s.weight ?? s.wt  ?? 400);
  const line   = (s.line   ?? s.lh  ?? 1.4);
  const track  = (s.track  ?? s.tr  ?? 0);
  const upper  = (s.upper  ?? s.up  ?? false);
  const italic = (s.italic ?? s.it  ?? false);
  const align  = (s.align  ?? s.al  ?? "left");
  const vAlign = (s.vAlign ?? s.va  ?? "top");

  const fam = resolveFont(p, famTok).replace(/"/g,"");
  tryLoadGoogleFont(fam);

  el.setAttribute("font-family", fam);
  el.setAttribute("font-size", String(size));
  el.setAttribute("font-weight", String(weight));
  el.setAttribute("letter-spacing", String(track));
  el.setAttribute("font-style", italic ? "italic" : "normal");

  // line-height em SVG: usamos 'dominant-baseline' + dy leve (melhor no Illustrator)
  el.setAttribute("data-line", String(line));
  el.setAttribute("data-vAlign", vAlign);

  // Alinhamento horizontal via text-anchor
  if(align==="center") el.setAttribute("text-anchor","middle");
  else if(align==="right") el.setAttribute("text-anchor","end");
  else el.setAttribute("text-anchor","start");

  // Uppercase preservando original
  const orig = el.getAttribute("data-orig") ?? (el.textContent || "");
  el.setAttribute("data-orig", orig);
  el.setAttribute("data-upper", upper ? "1":"0");
  el.textContent = upper ? (orig.toUpperCase()) : orig;

  // Reflete no inspector
  $("fontSize").value = el.getAttribute("font-size") ?? "";
  $("fontWeight").value = el.getAttribute("font-weight") ?? "";

  // Atualiza UI de seleção/bbox
  updateSelectionUI();
  persistAppSvg();
  toast(`Estilo aplicado: ${styleKey}`,"success");
}

function applyFillHex(hex){
  const svg=_appEdit.svgEl; if(!svg) return;
  if(!_appEdit.selId) return;
  const el=svg.getElementById(_appEdit.selId);
  if(!el) return;
  const h=(hex||"").trim();
  if(!h) return;
  if(!/^#([0-9a-f]{6}|[0-9a-f]{3})$/i.test(h)){ return; }
  el.setAttribute("fill", h.toUpperCase());
  if($("fillHex")) $("fillHex").value = h.toUpperCase();
  if($("fillColor")) $("fillColor").value = h;
  persistAppSvg();
}

function applyTextValue(v){
  const svg=_appEdit.svgEl; if(!svg) return;
  if(!_appEdit.selId) return;
  const el=svg.getElementById(_appEdit.selId);
  if(!el) return;
  if(el.tagName.toLowerCase()!=="text") return;
  el.textContent = v;
  el.setAttribute("data-orig", v);
  persistAppSvg();
}

function applyTextAlign(anchor){
  const svg=_appEdit.svgEl; if(!svg) return;
  if(!_appEdit.selId) return;
  const el=svg.getElementById(_appEdit.selId);
  if(!el) return;
  if(el.tagName.toLowerCase()!=="text") return;
  el.setAttribute("text-anchor", anchor);
  persistAppSvg();
}

function applyTextVAlign(baseline){
  const svg=_appEdit.svgEl; if(!svg) return;
  if(!_appEdit.selId) return;
  const el=svg.getElementById(_appEdit.selId);
  if(!el) return;
  if(el.tagName.toLowerCase()!=="text") return;
  el.setAttribute("dominant-baseline", baseline);
  persistAppSvg();
}

function applyFontSize(v){
  const svg=_appEdit.svgEl; if(!svg) return;
  if(!_appEdit.selId) return;
  const el=svg.getElementById(_appEdit.selId);
  if(!el || el.tagName.toLowerCase()!=="text") return;
  const num = parseFloat(String(v).replace(",","."));
  if(!isFinite(num)) return;
  el.setAttribute("font-size", String(num));
  persistAppSvg();
}

function applyFontWeight(v){
  const svg=_appEdit.svgEl; if(!svg) return;
  if(!_appEdit.selId) return;
  const el=svg.getElementById(_appEdit.selId);
  if(!el || el.tagName.toLowerCase()!=="text") return;
  const val = String(v||"").trim();
  if(!val) return;
  el.setAttribute("font-weight", val);
  persistAppSvg();
}

function applyPos(axis, v){
  const svg=_appEdit.svgEl; if(!svg) return;
  if(!_appEdit.selId) return;
  const el=svg.getElementById(_appEdit.selId);
  if(!el) return;
  if(!el.hasAttribute("x") && !el.hasAttribute("y")) return;
  const num = parseFloat(String(v).replace(",","."));
  if(!isFinite(num)) return;
  el.setAttribute(axis, String(num));
  persistAppSvg();
}

function applySize(attr, v){
  const svg=_appEdit.svgEl; if(!svg) return;
  if(!_appEdit.selId) return;
  const el=svg.getElementById(_appEdit.selId);
  if(!el) return;
  if(!el.hasAttribute(attr)) return;
  const num = parseFloat(String(v).replace(",","."));
  if(!isFinite(num) || num<=0) return;
  el.setAttribute(attr, String(num));
  persistAppSvg();
}

function applyRadius(v){
  const svg=_appEdit.svgEl; if(!svg) return;
  if(!_appEdit.selId) return;
  const el=svg.getElementById(_appEdit.selId);
  if(!el || el.tagName.toLowerCase()!=="rect") return;
  const num = parseFloat(String(v).replace(",","."));
  if(!isFinite(num) || num<0) return;
  el.setAttribute("rx", String(num));
  el.setAttribute("ry", String(num));
  persistAppSvg();
}

function nextEditableId(prefix){
  const svg=_appEdit.svgEl; if(!svg) return prefix+"1";
  let i=1;
  while(svg.getElementById(prefix+i)) i++;
  return prefix+i;
}

function addTextInApp(){
  const p=P(); if(!p) return;
  const svg=_appEdit.svgEl; if(!svg){ toast("Abra uma aplicação primeiro","info"); return; }

  const id = nextEditableId("text_");
  const t = svg.ownerDocument.createElementNS("http://www.w3.org/2000/svg","text");
  t.setAttribute("id", id);
  t.setAttribute("data-editable","1");
  t.setAttribute("data-name","Texto novo");
  t.setAttribute("x", "80");
  t.setAttribute("y", "140");
  const fam = resolveFont(p, TOK_SEC).replace(/"/g,"");
  tryLoadGoogleFont(fam);
  t.setAttribute("font-family", fam);
  t.setAttribute("font-size", "18");
  t.setAttribute("font-weight", "500");
  t.setAttribute("fill", "#111111");
  t.textContent = "Novo texto";

  const layer = svg.getElementById("type") || svg;
  layer.appendChild(t);

  wireEditableElement(t);
  selectSvgElement(id);
  toast("Texto adicionado","success");
  persistAppSvg();
}

function addShapeInApp(){
  const svg=_appEdit.svgEl; if(!svg){ toast("Abra uma aplicação primeiro","info"); return; }
  const id = nextEditableId("rect_");
  const r = svg.ownerDocument.createElementNS("http://www.w3.org/2000/svg","rect");
  r.setAttribute("id", id);
  r.setAttribute("data-editable","1");
  r.setAttribute("data-name","Retângulo novo");
  r.setAttribute("x","80");
  r.setAttribute("y","180");
  r.setAttribute("width","220");
  r.setAttribute("height","120");
  r.setAttribute("rx","18");
  r.setAttribute("ry","18");
  r.setAttribute("fill","rgba(127,90,240,.18)");

  const layer = svg.getElementById("art") || svg;
  layer.appendChild(r);

  wireEditableElement(r);
  selectSvgElement(id);
  toast("Retângulo adicionado","success");
  persistAppSvg();
}

function wireEditableElement(el){
  if(!el) return;
  el.style.cursor="pointer";
  el.addEventListener("click",(ev)=>{
    ev.preventDefault(); ev.stopPropagation();
    selectSvgElement(el.id || null);
  });

  // drag start
  el.addEventListener("mousedown",(ev)=>{
    ev.preventDefault(); ev.stopPropagation();
    selectSvgElement(el.id || null);
    beginDrag(ev);
  });

  // quick edit: dblclick for text
  el.addEventListener("dblclick",(ev)=>{
    ev.preventDefault(); ev.stopPropagation();
    if(el.tagName.toLowerCase()!=="text") return;
    const cur = el.textContent || "";
    const nv = prompt("Editar texto:", cur);
    if(nv===null) return;
    el.textContent = nv;
    el.setAttribute("data-orig", nv);
    $("textValue").value = nv;
    persistAppSvg();
  });
}

// Drag to move selection (text/rect/image)
let _drag = {on:false, id:null, sx:0, sy:0, ox:0, oy:0};

function getSvgPoint(evt, svg){
  const pt = svg.createSVGPoint();
  pt.x = evt.clientX; pt.y = evt.clientY;
  const ctm = svg.getScreenCTM();
  if(!ctm) return {x:0,y:0};
  const sp = pt.matrixTransform(ctm.inverse());
  return {x: sp.x, y: sp.y};
}

function beginDrag(evt){
  const svg=_appEdit.svgEl; if(!svg) return;
  if(!_appEdit.selId) return;
  const el=svg.getElementById(_appEdit.selId);
  if(!el) return;

  const tag=el.tagName.toLowerCase();
  if(!(tag==="text" || tag==="rect" || tag==="image")) return;

  const p=getSvgPoint(evt, svg);
  const x=parseFloat(el.getAttribute("x")||"0");
  const y=parseFloat(el.getAttribute("y")||"0");
  _drag={on:true,id:_appEdit.selId,sx:p.x,sy:p.y,ox:x,oy:y};
}

function moveDrag(evt){
  if(!_drag.on) return;
  const svg=_appEdit.svgEl; if(!svg) return;
  const el=svg.getElementById(_drag.id);
  if(!el) return;
  const p=getSvgPoint(evt, svg);
  const nx = _drag.ox + (p.x - _drag.sx);
  const ny = _drag.oy + (p.y - _drag.sy);
  el.setAttribute("x", String(Math.round(nx*100)/100));
  el.setAttribute("y", String(Math.round(ny*100)/100));
  $("posX").value = el.getAttribute("x")||"";
  $("posY").value = el.getAttribute("y")||"";
}

function endDrag(){
  if(!_drag.on) return;
  _drag.on=false;
  persistAppSvg();
}

document.addEventListener("mousemove",(e)=>{ if(_resize.on) moveResize(e); else moveDrag(e); });
document.addEventListener("mouseup",()=>{ if(_resize.on) endResize(); endDrag(); });

// Nudge with arrows (Shift = 10)
document.addEventListener("keydown",(e)=>{
  if(!$("viewAppEditor")?.classList.contains("active")) return;
  if(e.target.matches("input,select,textarea")) return;
  const svg=_appEdit.svgEl; if(!svg) return;
  if(!_appEdit.selId) return;
  const el=svg.getElementById(_appEdit.selId);
  if(!el || !el.hasAttribute("x") || !el.hasAttribute("y")) return;

  const step = e.shiftKey ? 10 : 1;
  if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(e.key)){
    e.preventDefault();
    const x=parseFloat(el.getAttribute("x")||"0");
    const y=parseFloat(el.getAttribute("y")||"0");
    const nx = x + (e.key==="ArrowLeft"?-step:e.key==="ArrowRight"?step:0);
    const ny = y + (e.key==="ArrowUp"?-step:e.key==="ArrowDown"?step:0);
    el.setAttribute("x", String(nx));
    el.setAttribute("y", String(ny));
    $("posX").value = el.getAttribute("x")||"";
    $("posY").value = el.getAttribute("y")||"";
    persistAppSvg();
  }
});

function toggleGuides(){
  const svg=_appEdit.svgEl; if(!svg) return;
  _appEdit.guideVisible = !_appEdit.guideVisible;
  svg.querySelectorAll("[data-guide='1'], #guides").forEach(g=>{
    g.style.display = _appEdit.guideVisible ? "" : "none";
  });
}

function replaceLogoInApp(){
  const p=P(); if(!p) return;
  const svg=_appEdit.svgEl; if(!svg) return;
  const img=svg.getElementById("logo_img");
  const txt=svg.getElementById("logo_txt");
  const assetLogo = p.logoWd || p.logoSq || null;
  const href = assetLogo?.type==="img" ? assetLogo.data : "";
  if(!href){ toast("Envie um logo no projeto (Editor de identidade)","error"); return; }
  if(img){
    img.setAttribute("href", href);
  }else{
    // if only text placeholder exists, replace with image
    const slot=svg.getElementById("logo_slot");
    if(!slot){ toast("Slot de logo não encontrado","error"); return; }
    const x=parseFloat(slot.getAttribute("x"))+14;
    const y=parseFloat(slot.getAttribute("y"))+14;
    const w=parseFloat(slot.getAttribute("width"))-28;
    const h=parseFloat(slot.getAttribute("height"))-28;
    const imageEl = svg.ownerDocument.createElementNS("http://www.w3.org/2000/svg","image");
    imageEl.setAttribute("id","logo_img");
    imageEl.setAttribute("href", href);
    imageEl.setAttribute("x", x);
    imageEl.setAttribute("y", y);
    imageEl.setAttribute("width", w);
    imageEl.setAttribute("height", h);
    imageEl.setAttribute("preserveAspectRatio","xMidYMid meet");
    slot.parentNode.appendChild(imageEl);
    if(txt) txt.remove();
  }
  toast("Logo aplicado","success");
  persistAppSvg();
}

function persistAppSvg(){
  const p=P(); if(!p) return;
  const a=(p.applications||[]).find(x=>x.id===_appEdit.appId);
  if(!a) return;
  // serialize SVG
  const svg=_appEdit.svgEl;
  if(!svg) return;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` + new XMLSerializer().serializeToString(svg);
  a.svg = xml;
  p.updatedAt = Date.now();
  save(S.projects);
}

function exportCurrentSVG(){
  const p=P(); if(!p) return;
  const a=(p.applications||[]).find(x=>x.id===_appEdit.appId);
  if(!a) return;
  persistAppSvg();
  const blob=new Blob([a.svg],{type:"image/svg+xml;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const an=document.createElement("a");
  an.href=url;
  const safeName=(a.name||"aplicacao").replace(/[^\w\-]+/g,"_").slice(0,80);
  an.download = safeName + ".svg";
  document.body.appendChild(an); an.click(); an.remove();
  setTimeout(()=>URL.revokeObjectURL(url),800);
  toast("SVG exportado","success");
}

function tryLoadGoogleFont(family){
  // Very light: add a <link> for selected font (if not already)
  const fam=(family||"").trim();
  if(!fam) return;
  const id="gf_"+fam.toLowerCase().replace(/\s+/g,"_");
  if(document.getElementById(id)) return;
  const link=document.createElement("link");
  link.id=id;
  link.rel="stylesheet";
  const q=encodeURIComponent(fam).replace(/%20/g,"+");
  link.href=`https://fonts.googleapis.com/css2?family=${q}:wght@300;400;500;600;700;800;900&display=swap`;
  document.head.appendChild(link);
}


/* ============================================================
   KEYBOARD SHORTCUTS
============================================================ */
document.addEventListener("keydown",e=>{
  if(e.target.matches("input,select,textarea"))return;
  if((e.metaKey||e.ctrlKey)&&e.key==="s"){e.preventDefault();if(S.pid)saveProject();}
});

/* ============================================================
   BOOT
============================================================ */
if(window.ErrorHandler){
  window.ErrorHandler.init({
    onError: (error) => {
      if(typeof toast === 'function') toast(`Erro: ${error?.message || 'falha inesperada'}`,'error');
    }
  });
}

fillFontSelects();
loadGoogleFontsCatalog();
renderHome();
if(S.projects.length){
  S.pid = S.projects[0].id;
  const p=P();
  ensureApps(p);
  if(!p.applications.length){
    const cfg={type:"web",unit:"px",w:1920,h:1080,dpi:72,bleed:0,safe:0,name:`${p.name||"Projeto"} — Nova aplicação`};
    const app={ id:uid("a"), createdAt:Date.now(), svg:"",
      name:cfg.name, type:cfg.type, unit:cfg.unit, w:cfg.w, h:cfg.h, dpi:cfg.dpi, bleed:cfg.bleed, safe:cfg.safe
    };
    p.applications.unshift(app);
    p.updatedAt=Date.now();
    save(S.projects);
  }
  openAppEditor(p.applications[0].id);
}


function renameCurrentApplication(){
  const p=P(); if(!p){ toast('Abra um projeto primeiro','error'); return; }
  const a=(p.applications||[]).find(x=>x.id===_appEdit.appId);
  if(!a){ toast('Aplicação não encontrada','error'); return; }
  const inp=$("appEditNameInput");
  const nv=(inp?.value||"").trim();
  if(!nv){ toast('Digite um nome para a aplicação','info'); return; }
  a.name = nv;
  p.updatedAt = Date.now();
  save(S.projects);
  if($("appEditName")) $("appEditName").textContent = nv;
  renderApps();
  toast('Nome da aplicação atualizado','success');
}

function geEnsureIframeLoaded(){
    const frame = document.getElementById('geEditorFrame');
    const tpl = document.getElementById('geEditorTemplate');
    if(!frame || !tpl) return;
    if(!frame.dataset.loaded){
      // template content is HTML-escaped to avoid parsing; decode before using
      const txt = tpl.innerHTML;
      const ta = document.createElement('textarea');
      ta.innerHTML = txt;
      frame.srcdoc = ta.value;
      frame.dataset.loaded = "1";
    }
  }
  function gePost(msg){
    const frame = document.getElementById('geEditorFrame');
    if(frame && frame.contentWindow) frame.contentWindow.postMessage(msg, window.Security?.getParentOrigin?.() || '*');
  }
  function geFit(){ gePost({type:'fit'}); }
  function geExportPNG(){ gePost({type:'exportPNG'}); }
  function geExportSVG(){ gePost({type:'exportSVG'}); }

  function saveCurrentApplication(){
    const p=P(); if(!p){ toast('Abra um projeto primeiro','error'); return; }
    const a=(p.applications||[]).find(x=>x.id===_appEdit.appId);
    if(!a){ toast('Aplicação não encontrada','error'); return; }
    const nv=($("appEditNameInput")?.value||"").trim();
    if(nv) a.name = nv;
    geExportSVG();
  }

  window.addEventListener('message',(ev)=>{
    const frame = document.getElementById('geEditorFrame');
    if(window.Security && !window.Security.isTrustedMessageEvent(ev, { allowedSource: frame?.contentWindow })) return;
    const msg=ev.data||{};

    if(msg.type==="geCloseEditor"){
      closeAppEditor();
      return;
    }

    if(msg.type==="geRenameApplication"){
      const p=P(); if(!p) return;
      const a=(p.applications||[]).find(x=>x.id===_appEdit.appId);
      if(!a) return;
      const nv=String(msg.name||"").trim();
      if(!nv) return;
      a.name = nv;
      a.updatedAt = Date.now();
      p.updatedAt = Date.now();
      save(S.projects);
      renderApps();
      return;
    }

    if(msg.type!=="geExportSVG") return;
    const p=P(); if(!p) return;
    const a=(p.applications||[]).find(x=>x.id===_appEdit.appId);
    if(!a) return;

    if(msg.error){
      toast(msg.error,'error');
      return;
    }

    const raw=window.Security ? window.Security.sanitizeSVG(String(msg.svg||'').trim()) : String(msg.svg||'').trim();
    if(!raw){
      toast('Não foi possível salvar: SVG vazio','error');
      return;
    }

    const xml = raw.startsWith('<?xml') ? raw : `<?xml version="1.0" encoding="UTF-8"?>
${raw}`;
    const nv=String(msg.name || $("appEditNameInput")?.value || a.name || "").trim();
    if(nv) a.name = nv;
    a.svg = xml;
    a.updatedAt = Date.now();
    p.updatedAt = Date.now();
    if($("appEditName")) $("appEditName").textContent = a.name || 'Aplicação';
    save(S.projects);
    renderApps();
    toast('Aplicação salva em Aplicações','success');
  });
