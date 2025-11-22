// ==UserScript==
// @name         ASHURA F BALANCE
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Visual-only balance & stats overlay (local only). DOES NOT modify network requests or server responses.
// @author       ASHURA GOD
// @match        *://stake.bet/*
// @match        *://rgs.twist-rgs.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  /************************************************************************
   * ASHURA F BALANCE - Visual-only overlay (safe, local storage only)
   * - This script stores and displays balances locally in localStorage.
   * - It does NOT modify fetch/XHR or responses. It won't alter site data.
   ************************************************************************/

  const APP_ID = 'ashura_f_balance_v1';
  const STORAGE_BAL_KEY = `${APP_ID}_balances`;
  const STORAGE_STATS_KEY = `${APP_ID}_stats`;
  const SUPPORTED_COINS = ['BTC','ETH','USDT','USDC','BNB','SOL','DOGE','TRX','XRP','LTC','BUSD','ADA','MATIC'];
  const DEFAULT_PRICES = {BTC:118595,ETH:4405,USDT:1,USDC:1,BNB:1020,SOL:218,DOGE:0.25,TRX:0.34,XRP:2.93,LTC:112.21,BUSD:1,ADA:0.45,MATIC:0.7};

  // In-memory
  let balances = loadBalances();
  let stats = loadStats();
  let uiOpen = false;

  /**********************
   * Utility: storage
   **********************/
  function loadBalances() {
    try {
      const s = localStorage.getItem(STORAGE_BAL_KEY);
      return s ? JSON.parse(s) : {};
    } catch (e) { return {}; }
  }
  function saveBalances() {
    localStorage.setItem(STORAGE_BAL_KEY, JSON.stringify(balances));
  }

  function loadStats() {
    try {
      const s = localStorage.getItem(STORAGE_STATS_KEY);
      if (!s) return { profit:0, wagered:0, wins:0, losses:0, profitHistory:[0] };
      const p = JSON.parse(s);
      if (!Array.isArray(p.profitHistory)) p.profitHistory = [p.profit || 0];
      return { profit:0, wagered:0, wins:0, losses:0, profitHistory:[0], ...p };
    } catch(e) {
      return { profit:0, wagered:0, wins:0, losses:0, profitHistory:[0] };
    }
  }
  function saveStats() {
    localStorage.setItem(STORAGE_STATS_KEY, JSON.stringify(stats));
  }

  /**********************
   * Small helpers
   **********************/
  function fmtAmount(amt, coin) {
    if (coin === 'USD' || !coin) return `$${Number(amt).toLocaleString()}`;
    return `${Number(amt).toLocaleString(undefined, {maximumFractionDigits:8})} ${coin}`;
  }
  function fmtUSD(v) {
    return `$${Number(v).toLocaleString(undefined, {maximumFractionDigits:2})}`;
  }

  /**********************
   * Create UI
   **********************/
  function createUI() {
    if (document.getElementById(`${APP_ID}_root`)) return;

    const style = document.createElement('style');
    style.textContent = `
      /* Ashura neon theme - compact styles */
      #${APP_ID}_root { position: fixed; inset: auto 20px 20px 20px; z-index: 2147483647; font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; }
      #${APP_ID}_widget { width: 420px; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,.7); background: linear-gradient(180deg, rgba(10,10,10,0.95), rgba(6,6,6,0.9)); border: 1px solid rgba(255,0,60,0.12); transform-origin:center right; }
      #${APP_ID}_header { display:flex; align-items:center; gap:12px; padding:16px; background: linear-gradient(90deg,#2b0022, #3a001a); border-bottom: 1px solid rgba(255,255,255,0.02); }
      #${APP_ID}_logo { width:44px; height:44px; border-radius:10px; background: radial-gradient(circle at 30% 30%, #ff4d6d, #a2002b); box-shadow: 0 6px 24px rgba(255,0,80,0.12); display:flex; align-items:center; justify-content:center; color:white; font-weight:800; font-size:16px; }
      #${APP_ID}_title { color: #fff; font-weight:800; font-size:14px; }
      #${APP_ID}_subtitle { color: #ffb6c1; font-size:11px; margin-top:2px; }
      #${APP_ID}_content { padding:14px; display:grid; grid-template-columns: 1fr 1fr; gap:12px; }
      .ashura-card { background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); border: 1px solid rgba(255,255,255,0.03); padding:12px; border-radius:10px; min-height:60px; }
      label.ashura-label { display:block; color:#d1c7d0; font-size:11px; font-weight:700; margin-bottom:6px; }
      select.ashura-select, input.ashura-input { width:100%; padding:10px 12px; border-radius:8px; background:#070707; color:#fff; border:1px solid rgba(255,255,255,0.03); font-size:13px; }
      button.ashura-btn { width:100%; padding:10px 12px; border-radius:8px; border:none; background: linear-gradient(90deg,#ff2d55,#ff7a97); color:white; font-weight:800; cursor:pointer; letter-spacing:0.6px; }
      button.ashura-ghost { background:transparent; border:1px solid rgba(255,255,255,0.05); color:#f6d7de; padding:8px 10px; border-radius:8px; cursor:pointer; }
      #${APP_ID}_footer { display:flex; gap:8px; padding:12px; align-items:center; justify-content:space-between; border-top:1px solid rgba(255,255,255,0.02); background: linear-gradient(180deg, rgba(255,255,255,0.01), rgba(255,255,255,0.005)); }
      .stat-big { font-size:16px; font-weight:800; color:#fff; }
      .small-muted { font-size:11px; color:#c6b7be; }
      #${APP_ID}_graph { width:100%; height:68px; background:linear-gradient(90deg, rgba(255,20,80,0.02), rgba(80,0,30,0.02)); border-radius:8px; overflow:hidden; display:block; }
      .row { display:flex; gap:8px; align-items:center; }
      #${APP_ID}_topright { display:flex; gap:8px; align-items:center; margin-left:auto; }
      .mini-btn { padding:6px 8px; border-radius:8px; border: none; cursor:pointer; background: rgba(255,255,255,0.02); color:#ffd7e0; font-weight:700; }
      #${APP_ID}_importfile { display:none; }
    `;

    const root = document.createElement('div');
    root.id = `${APP_ID}_root`;

    root.innerHTML = `
      <div id="${APP_ID}_widget" role="dialog" aria-label="Ashura F Balance">
        <div id="${APP_ID}_header">
          <div id="${APP_ID}_logo">AF</div>
          <div>
            <div id="${APP_ID}_title">ASHURA F BALANCE</div>
            <div id="${APP_ID}_subtitle">Visual-only balance overlay</div>
          </div>
          <div id="${APP_ID}_topright">
            <button id="${APP_ID}_export" class="mini-btn" title="Export balances">Export</button>
            <button id="${APP_ID}_import" class="mini-btn" title="Import balances">Import</button>
            <button id="${APP_ID}_close" class="mini-btn" title="Close (F2)">✕</button>
          </div>
        </div>

        <div id="${APP_ID}_content">
          <div class="ashura-card" style="grid-column:1/3">
            <label class="ashura-label">Quick overview</label>
            <div class="row" style="justify-content:space-between">
              <div>
                <div class="small-muted">Total (USD est.)</div>
                <div class="stat-big" id="${APP_ID}_total_usd">${fmtUSD(calcTotalUSD())}</div>
              </div>
              <div>
                <div class="small-muted">Profit</div>
                <div class="stat-big" id="${APP_ID}_profit">${fmtUSD(stats.profit || 0)}</div>
              </div>
              <div>
                <div class="small-muted">Wagered</div>
                <div class="stat-big" id="${APP_ID}_wagered">${fmtUSD(stats.wagered || 0)}</div>
              </div>
            </div>
            <div style="margin-top:10px;">
              <canvas id="${APP_ID}_graph_canvas" width="360" height="68"></canvas>
            </div>
          </div>

          <div class="ashura-card">
            <label class="ashura-label">Select coin</label>
            <select id="${APP_ID}_coin" class="ashura-select"></select>

            <label class="ashura-label" style="margin-top:10px">Balance</label>
            <input id="${APP_ID}_balance" class="ashura-input" type="number" step="any" placeholder="0.00">

            <div style="display:flex; gap:8px; margin-top:10px;">
              <button id="${APP_ID}_save" class="ashura-btn">Save</button>
              <button id="${APP_ID}_clear" class="ashura-ghost">Clear</button>
            </div>
          </div>

          <div class="ashura-card">
            <label class="ashura-label">Stats control</label>
            <div style="display:flex; gap:8px;">
              <button id="${APP_ID}_stat_win" class="ashura-ghost">Add Win</button>
              <button id="${APP_ID}_stat_loss" class="ashura-ghost">Add Loss</button>
              <button id="${APP_ID}_stat_reset" class="ashura-ghost">Reset Stats</button>
            </div>

            <div style="margin-top:8px;">
              <div class="small-muted">Wins: <span id="${APP_ID}_wins">${stats.wins||0}</span> &nbsp; Losses: <span id="${APP_ID}_losses">${stats.losses||0}</span></div>
            </div>

            <div style="margin-top:10px;">
              <label class="ashura-label">Manual simulate (amount)</label>
              <input id="${APP_ID}_sim_amount" class="ashura-input" type="number" step="any" placeholder="0.00">
            </div>
          </div>
        </div>

        <div id="${APP_ID}_footer">
          <div class="small-muted">Local-only overlay · Press F2 to toggle</div>
          <div style="display:flex; gap:8px;">
            <button id="${APP_ID}_import_file_btn" class="ashura-ghost">Load File</button>
            <button id="${APP_ID}_reset_all" class="ashura-ghost">Reset All</button>
          </div>
        </div>
      </div>

      <input id="${APP_ID}_importfile" type="file" accept="application/json">
    `;

    document.head.appendChild(style);
    document.body.appendChild(root);

    // populate coin list
    const coinSelect = document.getElementById(`${APP_ID}_coin`);
    SUPPORTED_COINS.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      coinSelect.appendChild(opt);
    });

    // load selected coin's balance into input
    coinSelect.value = SUPPORTED_COINS[0];
    const balInput = document.getElementById(`${APP_ID}_balance`);
    function refreshBalanceInput() {
      const coin = coinSelect.value;
      balInput.value = balances[coin] !== undefined ? balances[coin] : '';
    }
    refreshBalanceInput();

    // handlers
    document.getElementById(`${APP_ID}_save`).addEventListener('click', () => {
      const coin = coinSelect.value;
      const amt = parseFloat(balInput.value || 0);
      if (!Number.isFinite(amt) || amt < 0) { alert('Enter a valid non-negative number'); return; }
      balances[coin] = amt;
      saveBalances();
      updateTotals();
      flashMessage('Saved', 1000);
    });

    document.getElementById(`${APP_ID}_clear`).addEventListener('click', () => {
      const coin = coinSelect.value;
      if (balances[coin] !== undefined) delete balances[coin];
      saveBalances();
      refreshBalanceInput();
      updateTotals();
      flashMessage('Cleared', 900);
    });

    coinSelect.addEventListener('change', refreshBalanceInput);

    // export / import
    document.getElementById(`${APP_ID}_export`).addEventListener('click', () => {
      const payload = { balances, stats, exportedAt: new Date().toISOString() };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ashura_balances.json';
      a.click();
      URL.revokeObjectURL(url);
    });

    const importFileInput = document.getElementById(`${APP_ID}_importfile`);
    document.getElementById(`${APP_ID}_import`).addEventListener('click', () => importFileInput.click());
    document.getElementById(`${APP_ID}_import_file_btn`).addEventListener('click', () => importFileInput.click());

    importFileInput.addEventListener('change', (ev) => {
      const f = ev.target.files && ev.target.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          if (parsed.balances) balances = parsed.balances;
          if (parsed.stats) stats = parsed.stats;
          saveBalances();
          saveStats();
          refreshBalanceInput();
          updateTotals();
          flashMessage('Imported', 1500);
        } catch (err) {
          alert('Invalid JSON file');
        }
      };
      reader.readAsText(f);
      importFileInput.value = '';
    });

    // stats controls
    document.getElementById(`${APP_ID}_stat_win`).addEventListener('click', () => {
      const amt = parseFloat(document.getElementById(`${APP_ID}_sim_amount`).value || 0);
      // treat as payout > bet case; simple model
      stats.wins = (stats.wins || 0) + 1;
      stats.profit = (stats.profit || 0) + Math.abs(amt);
      stats.wagered = (stats.wagered || 0) + Math.abs(amt);
      stats.profitHistory.push(stats.profit);
      saveStats();
      updateTotals();
    });

    document.getElementById(`${APP_ID}_stat_loss`).addEventListener('click', () => {
      const amt = parseFloat(document.getElementById(`${APP_ID}_sim_amount`).value || 0);
      stats.losses = (stats.losses || 0) + 1;
      stats.profit = (stats.profit || 0) - Math.abs(amt);
      stats.wagered = (stats.wagered || 0) + Math.abs(amt);
      stats.profitHistory.push(stats.profit);
      saveStats();
      updateTotals();
    });

    document.getElementById(`${APP_ID}_stat_reset`).addEventListener('click', () => {
      if (!confirm('Reset stats locally?')) return;
      stats = { profit:0, wagered:0, wins:0, losses:0, profitHistory:[0] };
      saveStats();
      updateTotals();
      flashMessage('Stats reset', 900);
    });

    document.getElementById(`${APP_ID}_reset_all`).addEventListener('click', () => {
      if (!confirm('Reset all balances and stats locally?')) return;
      balances = {};
      stats = { profit:0, wagered:0, wins:0, losses:0, profitHistory:[0] };
      saveBalances();
      saveStats();
      refreshBalanceInput();
      updateTotals();
      flashMessage('All reset', 900);
    });

    document.getElementById(`${APP_ID}_close`).addEventListener('click', () => {
      toggleUI(false);
    });

    // simple flash
    function flashMessage(text, ms=1000) {
      const b = document.createElement('div');
      b.style.position='fixed';
      b.style.right='28px';
      b.style.bottom='28px';
      b.style.zIndex='2147483648';
      b.style.padding='10px 14px';
      b.style.background='linear-gradient(90deg,#ff6688,#ff2d55)';
      b.style.color='white';
      b.style.borderRadius='10px';
      b.style.boxShadow='0 8px 30px rgba(0,0,0,0.5)';
      b.style.fontWeight='800';
      b.textContent = text;
      document.body.appendChild(b);
      setTimeout(()=> b.style.opacity='0.02', ms-120);
      setTimeout(()=> b.remove(), ms);
    }

    // totals & UI update
    function calcTotalUSD() {
      let total = 0;
      for (const [c, v] of Object.entries(balances || {})) {
        const price = DEFAULT_PRICES[c] || 0;
        total += Number(v || 0) * Number(price);
      }
      return total;
    }

    function updateTotals() {
      try {
        document.getElementById(`${APP_ID}_total_usd`).textContent = fmtUSD(calcTotalUSD());
        document.getElementById(`${APP_ID}_profit`).textContent = fmtUSD(stats.profit || 0);
        document.getElementById(`${APP_ID}_wagered`).textContent = fmtUSD(stats.wagered || 0);
        document.getElementById(`${APP_ID}_wins`).textContent = stats.wins || 0;
        document.getElementById(`${APP_ID}_losses`).textContent = stats.losses || 0;
        drawGraphCanvas();
      } catch(e) {}
    }

    // draw a tiny sparkline
    function drawGraphCanvas() {
      const canvas = document.getElementById(`${APP_ID}_graph_canvas`);
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const data = (stats.profitHistory && stats.profitHistory.length > 1) ? stats.profitHistory.slice(-40) : [0];
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0,0,w,h);

      // background fill
      const grad = ctx.createLinearGradient(0,0,w,0);
      grad.addColorStop(0,'rgba(255,20,80,0.08)');
      grad.addColorStop(1,'rgba(120,0,40,0.06)');
      ctx.fillStyle = grad;
      ctx.fillRect(0,0,w,h);

      const max = Math.max(...data,0);
      const min = Math.min(...data,0);
      const range = (max - min) || 1;
      ctx.beginPath();
      for (let i=0;i<data.length;i++){
        const x = (i/(data.length-1))*(w-6) + 3;
        const y = h - ((data[i]-min)/range)*(h-12) - 6;
        if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.strokeStyle = stats.profit >= 0 ? 'rgba(34,197,94,0.95)' : 'rgba(239,68,68,0.95)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // fill under curve
      ctx.lineTo(w-3,h-6);
      ctx.lineTo(3,h-6);
      ctx.closePath();
      ctx.fillStyle = stats.profit >= 0 ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)';
      ctx.fill();
    }

    // initial update
    updateTotals();
  } // createUI end

  /**********************
   * Toggle UI
   **********************/
  function toggleUI(force) {
    const root = document.getElementById(`${APP_ID}_root`);
    if (!root) {
      createUI();
      uiOpen = true;
      return;
    }
    if (typeof force === 'boolean') {
      root.style.display = force ? 'block' : 'none';
      uiOpen = force;
    } else {
      const isHidden = getComputedStyle(root).display === 'none';
      root.style.display = isHidden ? 'block' : 'none';
      uiOpen = !isHidden;
    }
  }

  // initialize (create UI but keep visible)
  createUI();
  toggleUI(true);

  // Hotkey F2 to toggle
  document.addEventListener('keydown', (e) => {
    if (e.key === 'F2') {
      e.preventDefault();
      toggleUI();
    }
  });

  // expose a safe API on window for convenience (non-network)
  try {
    window.ASHURA_F_BALANCE = {
      getBalances: () => JSON.parse(JSON.stringify(balances)),
      setBalance: (coin, amt) => { balances[coin] = Number(amt); saveBalances(); },
      getStats: () => JSON.parse(JSON.stringify(stats)),
      addProfitSample: (value) => { stats.profit = (stats.profit||0) + Number(value); stats.profitHistory.push(stats.profit); saveStats(); },
    };
  } catch(e) {}

  // periodic save (defensive)
  setInterval(() => { saveBalances(); saveStats(); }, 5000);

})();
