<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>EtherXWord — Interactive README Presentation</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    :root{
      --bg:#0b0b0b; --card:#0f0f10; --muted:#bfbfbf; --accent:#ffd54f; --glass: rgba(255,255,255,0.04);
      --glass-2: rgba(255,255,255,0.02);
    }
    *{box-sizing:border-box}
    html,body{height:100%;margin:0;font-family:Inter,ui-sans-serif,system-ui,Segoe UI,Roboto,'Helvetica Neue',Arial}
    body{background:linear-gradient(180deg,#071018 0%, #0b0b0b 100%);color:#eaeaea;line-height:1.5}

    .container{max-width:1100px;margin:28px auto;padding:20px}
    .hero{display:flex;gap:20px;align-items:center}
    .logo{width:84px;height:84px;border-radius:12px;background:linear-gradient(135deg,#111 0,#222);display:flex;align-items:center;justify-content:center;font-weight:700;color:var(--accent);font-size:20px;box-shadow:0 8px 30px rgba(0,0,0,0.6)}
    .title{flex:1}
    .title h1{margin:0;font-size:28px}
    .title p{margin:6px 0 0;color:var(--muted)}

    .controls{display:flex;gap:10px;align-items:center}
    .btn{background:transparent;border:1px solid rgba(255,255,255,0.06);padding:8px 14px;border-radius:10px;color:var(--accent);cursor:pointer;backdrop-filter: blur(6px)}
    .btn.secondary{color:var(--muted);border-color:rgba(255,255,255,0.03)}

    .grid{display:grid;grid-template-columns:1fr 380px;gap:20px;margin-top:20px}

    .card{background:linear-gradient(180deg,var(--glass),var(--glass-2));padding:16px;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.6);border:1px solid rgba(255,255,255,0.03)}
    .section-title{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
    .chips{display:flex;gap:8px}
    .chip{background:rgba(255,255,255,0.03);padding:6px 10px;border-radius:999px;color:var(--muted);font-size:13px}

    pre.md{white-space:pre-wrap;background:transparent;padding:12px;border-radius:8px;color:var(--muted);font-size:13px}

    .list{margin:0;padding-left:18px}
    .tech-list{display:flex;flex-wrap:wrap;gap:8px}
    .tech{background:#0a0a0a;padding:8px 10px;border-radius:8px;border:1px solid rgba(255,255,255,0.03);color:var(--muted);font-size:13px}

    .accordion{margin-top:12px}
    .item{border-top:1px dashed rgba(255,255,255,0.03);padding:12px 0}
    .item h4{margin:0;display:flex;justify-content:space-between;align-items:center;cursor:pointer}
    .item p{margin:8px 0 0;color:var(--muted);font-size:14px}

    .progress-wrap{display:flex;gap:18px;align-items:center}
    .progress{width:120px;height:120px;display:grid;place-items:center;background:linear-gradient(180deg,#0b0b0b,#111);border-radius:999px;border:6px solid rgba(255,255,255,0.03)}
    .progress strong{font-size:20px;color:var(--accent)}

    footer{color:var(--muted);text-align:center;margin-top:26px}

    /* animations */
    .fade-up{animation:fadeUp .7s ease both}
    @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}

    /* responsive */
    @media (max-width:980px){.grid{grid-template-columns:1fr;}.title h1{font-size:22px}.progress{display:none}}

    /* download button style */
    .download{background:linear-gradient(90deg,#ffd54f,#ffca28);color:#000;border:none;padding:10px 14px;border-radius:10px;cursor:pointer;font-weight:600}
    .toggle{display:flex;align-items:center;gap:8px}
    .toggle input{display:none}
    .switch{width:44px;height:24px;border-radius:999px;background:#222;position:relative}
    .switch::after{content:'';width:18px;height:18px;background:white;border-radius:50%;position:absolute;left:3px;top:3px;transition:all .18s}
    .toggle input:checked + .switch{background:var(--accent)}
    .toggle input:checked + .switch::after{left:23px}

  </style>
</head>
<body>
  <div class="container fade-up">
    <div class="hero">
      <div class="logo">E X</div>
      <div class="title">
        <h1>EtherXWord — Interactive README</h1>
        <p>Presentation view of your README with animations, charts and download option.</p>
      </div>
      <div class="controls">
        <button class="btn" id="downloadBtn">Download README.md</button>
        <label class="toggle">
          <input type="checkbox" id="themeToggle">
          <span class="switch"></span>
        </label>
      </div>
    </div>

    <div class="grid">
      <div>
        <div class="card">
          <div class="section-title">
            <h3>Project Overview</h3>
            <div class="chips"><div class="chip">MERN</div><div class="chip">Realtime</div><div class="chip">Docs</div></div>
          </div>
          <p style="color:var(--muted)">EtherXWord is an advanced document editor offering rich editing, export options and collaboration features. Below is a visual summary of the README content for quick review.</p>

          <hr style="border:none;height:1px;background:rgba(255,255,255,0.03);margin:12px 0">

          <div style="display:flex;gap:12px;flex-wrap:wrap">
            <div style="flex:1;min-width:260px">
              <h4>Key Features</h4>
              <ul class="list" style="color:var(--muted)">
                <li>JWT Authentication & OTP email verification</li>
                <li>Multi-page A4 editor with formatting</li>
                <li>PDF & DOCX export, import support</li>
                <li>Version history & share links</li>
                <li>Dark/Light themes + responsive UI</li>
              </ul>
            </div>
            <div style="width:220px">
              <h4>Status</h4>
              <div class="progress-wrap">
                <div class="progress"><div style="text-align:center"><small style="display:block;color:var(--muted)">Completed</small><strong id="progressPercent">95%</strong></div></div>
                <div style="flex:1">
                  <p style="color:var(--muted);margin:0 0 8px">Completed features vs Pending</p>
                  <canvas id="statusChart" width="300" height="160"></canvas>
                </div>
              </div>
            </div>
          </div>

          <hr style="border:none;height:1px;background:rgba(255,255,255,0.03);margin:12px 0">

          <h4>Tech Stack</h4>
          <div class="tech-list" style="margin-top:8px">
            <div class="tech">React 18</div><div class="tech">Vite</div><div class="tech">Node.js</div><div class="tech">Express</div><div class="tech">MongoDB</div><div class="tech">Chart.js</div>
          </div>

          <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn secondary" onclick="scrollToSection('routes')">Frontend Routes</button>
            <button class="btn secondary" onclick="scrollToSection('apis')">API Endpoints</button>
            <button class="btn secondary" onclick="scrollToSection('security')">Security</button>
          </div>
        </div>

        <div class="card" style="margin-top:16px">
          <div class="section-title"><h3>Routes & Pages</h3><div class="chips"><div class="chip">/editor</div><div class="chip">/signin</div></div></div>

          <div class="accordion" id="routes">
            <div class="item">
              <h4 onclick="toggle(this)">Frontend Routes <span style="color:var(--muted);font-size:13px">click to expand</span></h4>
              <div class="content" style="display:none">
                <p class="md">/ - Home dashboard
/signin - User login
/signup - User registration
/forgot-password - Password reset request
/verify-otp - OTP verification
/editor - New document editor
/editor/:id - Edit existing document
/viewer/:id - View shared document
/templates - Template gallery
/profile - User profile
/settings - Application settings</p>
              </div>
            </div>

            <div class="item">
              <h4 onclick="toggle(this)">Backend API Endpoints <span style="color:var(--muted);font-size:13px">click to expand</span></h4>
              <div class="content" style="display:none">
                <p class="md">Auth: POST /api/auth/signup, signin, refresh, forgot-password, verify-otp, reset-password
Documents: GET /api/documents, POST /api/documents, search, favorites, trash, /:id endpoints for CRUD, share, versions
Collaboration: /api/collaboration/documents, collaborators endpoints, versions & restore</p>
              </div>
            </div>

            <div class="item">
              <h4 onclick="toggle(this)">Security Highlights</h4>
              <div class="content" style="display:none">
                <p class="md">JWT + Refresh tokens, bcrypt hashing, OTP verification, rate-limiting, helmet, input validation, CORS and secure sharing.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="card" style="margin-top:16px">
          <h3>How to run</h3>
          <pre class="md">1. git clone &amp; install
2. Configure .env for server &amp; client
3. npm run dev (server)
4. npm run dev (client)
5. Open http://localhost:3000

Environment examples and ports are included in the original README.</pre>
        </div>

      </div>

      <aside>
        <div class="card">
          <div class="section-title"><h3>Progress & Metrics</h3><div class="chips"><div class="chip">95% Done</div></div></div>
          <canvas id="pieChart" width="300" height="220"></canvas>
          <hr style="border:none;height:1px;background:rgba(255,255,255,0.03);margin:12px 10px">
          <h4>Quick Links</h4>
          <p style="color:var(--muted);font-size:14px;margin:6px 0">Open ports: Frontend 3000 • Backend 5030 • DB: MongoDB URI</p>
          <div style="display:flex;flex-direction:column;gap:8px;margin-top:8px">
            <button class="btn secondary" onclick="copyText('VITE_API_URL=http://localhost:5030')">Copy VITE_API_URL</button>
            <button class="btn secondary" onclick="copyText('PORT=5030\nMONGODB_URI=...')">Copy Server .env</button>
            <button class="download" id="downloadDemo">Download README.md</button>
          </div>
        </div>

        <div class="card" style="margin-top:16px">
          <h4>Visual Summary</h4>
          <p style="color:var(--muted);font-size:14px;margin-bottom:8px">Completed features, pending items, and production readiness.</p>
          <div style="height:120px;display:grid;place-items:center">
            <svg width="120" height="120" viewBox="0 0 36 36">
              <path stroke="#1b1b1b" stroke-width="3.8" fill="none" d="M18 2.0845a15.9155 15.9155 0 1 0 0 31.831A15.9155 15.9155 0 1 0 18 2.0845"/>
              <path stroke="var(--accent)" stroke-width="3.8" fill="none" stroke-dasharray="95 5" d="M18 2.0845a15.9155 15.9155 0 1 0 0 31.831"/>
              <text x="18" y="20" font-size="4" text-anchor="middle" fill="#fff">95%</text>
            </svg>
          </div>
        </div>
      </aside>
    </div>

    <footer>
      EtherXWord • Interactive README • MIT License
    </footer>
  </div>

  <script>
    // README content used for download
    const README_MD = `# EtherXWord - Advanced Document Editor

A comprehensive MERN stack document editor with real-time collaboration, advanced formatting, and professional document management features.

## How to run

(Shortened demo README included in the interactive presentation.)\n`;

    function downloadFile(filename, content){
      const a = document.createElement('a');
      const blob = new Blob([content], {type:'text/markdown'});
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      URL.revokeObjectURL(a.href);
    }

    document.getElementById('downloadBtn').addEventListener('click',()=>downloadFile('README.md', README_MD));
    document.getElementById('downloadDemo').addEventListener('click',()=>downloadFile('README.md', README_MD));

    // Chart: statusChart
    const ctx = document.getElementById('statusChart').getContext('2d');
    const statusChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Completed','Pending'],
        datasets:[{label:'Features',data:[95,5],borderRadius:6}]
      },
      options:{plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,max:100,ticks:{color:'#bbb'}},x:{ticks:{color:'#bbb'}}}
    }
    });

    const pieCtx = document.getElementById('pieChart').getContext('2d');
    const pieChart = new Chart(pieCtx, {
      type:'doughnut',
      data:{labels:['Completed','Pending'],datasets:[{data:[95,5],backgroundColor:['#ffd54f','#333']}]} ,
      options:{plugins:{legend:{position:'bottom',labels:{color:'#bbb'}}}}
    });

    // Accordion toggle
    function toggle(el){
      const content = el.nextElementSibling;
      content.style.display = content.style.display === 'none' ? 'block' : 'none';
    }

    function scrollToSection(id){
      const el = document.getElementById(id);
      if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
    }

    function copyText(text){
      navigator.clipboard.writeText(text).then(()=>{alert('Copied to clipboard')});
    }

    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('change', ()=>{
      if(themeToggle.checked){
        document.documentElement.style.setProperty('--bg','#fff');
        document.documentElement.style.setProperty('--card','#fff');
        document.documentElement.style.setProperty('--muted','#444');
        document.documentElement.style.setProperty('--accent','#ff8f00');
        document.body.style.background = 'linear-gradient(180deg,#fff,#f7f7f7)';
        document.body.style.color = '#111';
      }else{
        document.documentElement.style.setProperty('--bg','#0b0b0b');
        document.documentElement.style.setProperty('--card','#0f0f10');
        document.documentElement.style.setProperty('--muted','#bfbfbf');
        document.documentElement.style.setProperty('--accent','#ffd54f');
        document.body.style.background = 'linear-gradient(180deg,#071018,#0b0b0b)';
        document.body.style.color = '#eaeaea';
      }
    });

  </script>
</body>
</html>