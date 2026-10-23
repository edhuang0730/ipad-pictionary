/**
 * Single-file self-contained Mobile Web Client served by the iPad's embedded HTTP server.
 * Includes:
 * - Automatic & manual Fullscreen API management + 100dvh viewport lock
 * - Front-camera Selfie capture over plain local HTTP (`capture="user"`)
 * - Client-side Canvas Avatar Simplification (center crop + cartoon posterization + circular badge)
 * - Real-time WebSocket client with auto-reconnect and 60fps live drawing canvas mirror
 */

export const PHONE_CLIENT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="theme-color" content="#0F172A" />
  <title>Pictionary Party — Player Controller</title>
  <style>
    :root {
      --bg: #0F172A;
      --card: #1E293B;
      --card-border: #334155;
      --accent: #6366F1;
      --accent-bright: #818CF8;
      --success: #10B981;
      --warning: #F59E0B;
      --danger: #EF4444;
      --text: #F8FAFC;
      --muted: #94A3B8;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-tap-highlight-color: transparent;
      user-select: none;
      -webkit-user-select: none;
    }
    html, body {
      width: 100%;
      height: 100dvh;
      overflow: hidden;
      overscroll-behavior: none;
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    input {
      user-select: text;
      -webkit-user-select: text;
    }
    #app {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100dvh;
      max-width: 600px;
      margin: 0 auto;
      position: relative;
    }
    /* Top Header */
    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      background: rgba(30, 41, 59, 0.95);
      border-bottom: 1px solid var(--card-border);
      flex-shrink: 0;
      z-index: 10;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 800;
      font-size: 15px;
      letter-spacing: -0.3px;
    }
    .status-dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: var(--warning);
      box-shadow: 0 0 8px var(--warning);
    }
    .status-dot.connected {
      background: var(--success);
      box-shadow: 0 0 8px var(--success);
    }
    .topbar-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .fs-btn {
      background: #334155;
      color: var(--text);
      border: 1px solid #475569;
      border-radius: 8px;
      padding: 6px 10px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .fs-btn:active {
      transform: scale(0.96);
    }
    /* Screens */
    .screen {
      display: none;
      flex: 1;
      flex-direction: column;
      overflow-y: auto;
      padding: 14px;
      gap: 12px;
    }
    .screen.active {
      display: flex;
    }
    .card {
      background: var(--card);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.25);
    }
    .title {
      font-size: 20px;
      font-weight: 800;
      text-align: center;
      margin-bottom: 4px;
    }
    .subtitle {
      font-size: 13px;
      color: var(--muted);
      text-align: center;
      margin-bottom: 12px;
    }
    /* Avatar Join Builder */
    .avatar-preview-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      margin: 6px 0 12px;
    }
    .avatar-circle {
      width: 112px;
      height: 112px;
      border-radius: 50%;
      border: 4px solid var(--accent-bright);
      background: #0F172A;
      object-fit: cover;
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.35);
    }
    .btn-row {
      display: flex;
      gap: 8px;
      width: 100%;
      justify-content: center;
      flex-wrap: wrap;
    }
    .btn {
      background: var(--accent);
      color: white;
      border: none;
      border-radius: 12px;
      padding: 12px 16px;
      font-size: 15px;
      font-weight: 800;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: transform 0.1s, opacity 0.15s;
    }
    .btn:active {
      transform: scale(0.97);
    }
    .btn.secondary {
      background: #334155;
      border: 1px solid #475569;
      font-size: 13px;
      padding: 9px 13px;
    }
    .btn.success {
      background: var(--success);
      width: 100%;
      padding: 14px;
      font-size: 17px;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
    }
    .preset-row {
      display: flex;
      gap: 6px;
      justify-content: center;
      flex-wrap: wrap;
      margin-top: 4px;
    }
    .preset-chip {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 2px solid #475569;
      background: #0F172A;
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .field-label {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: var(--muted);
      margin-bottom: 6px;
      display: block;
    }
    .text-input {
      width: 100%;
      background: #0F172A;
      border: 2px solid #475569;
      border-radius: 12px;
      padding: 12px 14px;
      color: white;
      font-size: 17px;
      font-weight: 700;
      outline: none;
      margin-bottom: 12px;
    }
    .text-input:focus {
      border-color: var(--accent-bright);
    }
    /* Player Grid in Lobby / Scoreboard */
    .player-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
      gap: 8px;
    }
    .player-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #0F172A;
      border: 1px solid #334155;
      padding: 8px 10px;
      border-radius: 12px;
    }
    .player-pill img {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--accent);
      flex-shrink: 0;
    }
    .player-pill-info {
      overflow: hidden;
    }
    .player-pill-name {
      font-size: 13px;
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .player-pill-score {
      font-size: 11px;
      color: var(--warning);
      font-weight: 700;
    }
    /* Active Drawing Screen */
    #screen-drawing {
      padding: 8px;
      gap: 8px;
      overflow: hidden;
    }
    .drawing-hud {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--card);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 8px 12px;
      flex-shrink: 0;
    }
    .drawer-badge {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .drawer-badge img {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 2px solid var(--warning);
    }
    .timer-pill {
      background: #0F172A;
      border: 2px solid var(--accent-bright);
      border-radius: 999px;
      padding: 4px 12px;
      font-size: 18px;
      font-weight: 900;
      font-variant-numeric: tabular-nums;
    }
    .timer-pill.urgent {
      border-color: var(--danger);
      color: var(--danger);
      animation: pulse 0.8s infinite;
    }
    .hint-bar {
      background: #0F172A;
      border: 1px solid #334155;
      border-radius: 10px;
      padding: 8px 10px;
      text-align: center;
      flex-shrink: 0;
    }
    .hint-category {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--accent-bright);
      letter-spacing: 0.5px;
    }
    .hint-blanks {
      font-size: 17px;
      font-weight: 900;
      letter-spacing: 1.5px;
      margin-top: 2px;
      font-family: monospace;
      color: #FDE047;
    }
    .canvas-container {
      flex: 1;
      width: 100%;
      background: #FFFFFF;
      border-radius: 14px;
      border: 3px solid #334155;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: inset 0 2px 8px rgba(0,0,0,0.08);
    }
    #live-canvas {
      width: 100%;
      height: 100%;
      display: block;
    }
    .shout-banner {
      background: linear-gradient(135deg, #4F46E5, #7C3AED);
      border-radius: 12px;
      padding: 10px 12px;
      text-align: center;
      font-weight: 800;
      font-size: 15px;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35);
    }
    .shout-banner.is-drawer {
      background: linear-gradient(135deg, #D97706, #EA580C);
    }
    /* Intermission Alert */
    .intermission-box {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      gap: 14px;
      padding: 20px;
      border-radius: 18px;
      background: var(--card);
      border: 2px solid var(--card-border);
    }
    .intermission-box.you-are-up {
      background: linear-gradient(160deg, #065F46, #047857);
      border-color: #34D399;
    }
    .countdown-giant {
      font-size: 56px;
      font-weight: 900;
      color: #FDE047;
      line-height: 1;
    }
    /* Celebration Toast Overlay */
    #celebration-overlay {
      position: absolute;
      inset: 0;
      background: rgba(15, 23, 42, 0.88);
      backdrop-filter: blur(4px);
      display: none;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 50;
      padding: 24px;
      text-align: center;
    }
    #celebration-overlay.show {
      display: flex;
      animation: popIn 0.25s ease-out;
    }
    @keyframes popIn {
      from { transform: scale(0.85); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.06); }
    }
  </style>
</head>
<body>
  <div id="app">
    <!-- Top Header -->
    <div class="topbar">
      <div class="brand">
        <div id="conn-dot" class="status-dot"></div>
        <span>🎨 Pictionary Party</span>
      </div>
      <div class="topbar-actions">
        <span id="my-score-badge" style="font-size:13px;font-weight:800;color:#FDE047;display:none;">0 pts</span>
        <button id="fs-toggle-btn" class="fs-btn" type="button">⛶ Fullscreen</button>
      </div>
    </div>

    <!-- SCREEN 1: JOIN / PROFILE SETUP -->
    <div id="screen-join" class="screen active">
      <div class="card">
        <div class="title">Join the Party!</div>
        <div class="subtitle">Take a quick selfie for your simplified game avatar & enter your name</div>

        <div class="avatar-preview-wrap">
          <img id="avatar-preview" class="avatar-circle" alt="Your Avatar" />
          <input id="selfie-input" type="file" accept="image/*" capture="user" style="display:none;" />
          <div class="btn-row">
            <button id="take-selfie-btn" class="btn" type="button">📸 Take Selfie</button>
            <button id="toggle-style-btn" class="btn secondary" type="button">✨ Cartoon Filter: ON</button>
          </div>
          <div style="font-size:11px;color:var(--muted);margin-top:2px;">Or pick a quick doodle avatar:</div>
          <div class="preset-row" id="preset-avatars"></div>
        </div>

        <label class="field-label" for="player-name-input">Your Player Name</label>
        <input id="player-name-input" class="text-input" type="text" maxlength="18" placeholder="Enter your name..." autocomplete="nickname" />

        <button id="join-game-btn" class="btn success" type="button">🚀 Join Game & Go Fullscreen</button>
      </div>
    </div>

    <!-- SCREEN 2: LOBBY WAITING ROOM -->
    <div id="screen-lobby" class="screen">
      <div class="card" style="text-align:center;">
        <img id="lobby-my-avatar" class="avatar-circle" style="width:84px;height:84px;margin-bottom:8px;" alt="Me" />
        <div id="lobby-my-name" class="title">Player</div>
        <div class="subtitle" style="margin-bottom:8px;">You're connected! Waiting for the host on the iPad to start...</div>
        <button id="edit-profile-btn" class="btn secondary" type="button">✏️ Edit Name / Retake Selfie</button>
      </div>

      <div class="card" style="flex:1;">
        <div class="field-label">Players in Lobby (<span id="lobby-count">0</span>)</div>
        <div id="lobby-player-list" class="player-list"></div>
      </div>
    </div>

    <!-- SCREEN 3: 10-SECOND INTERMISSION -->
    <div id="screen-intermission" class="screen">
      <div id="intermission-card" class="intermission-box">
        <div id="intermission-round-badge" style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#CBD5E1;">Round 1</div>
        <img id="intermission-drawer-avatar" class="avatar-circle" style="width:96px;height:96px;" alt="Next Drawer" />
        <div id="intermission-headline" class="title" style="font-size:24px;">Get Ready!</div>
        <div id="intermission-subtext" class="subtitle" style="color:#E2E8F0;font-size:14px;">Next turn starts in...</div>
        <div id="intermission-timer" class="countdown-giant">10</div>
      </div>

      <div class="card">
        <div class="field-label">Current Standings</div>
        <div id="intermission-scoreboard" class="player-list"></div>
      </div>
    </div>

    <!-- SCREEN 4: ACTIVE DRAWING TURN (LIVE MIRROR) -->
    <div id="screen-drawing" class="screen">
      <div class="drawing-hud">
        <div class="drawer-badge">
          <img id="drawing-drawer-avatar" src="" alt="Drawer" />
          <div>
            <div style="font-size:11px;color:var(--muted);font-weight:700;">DRAWING NOW</div>
            <div id="drawing-drawer-name" style="font-size:14px;font-weight:800;">Player</div>
          </div>
        </div>
        <div id="drawing-timer" class="timer-pill">60s</div>
      </div>

      <div class="hint-bar">
        <div id="drawing-category" class="hint-category">CATEGORY</div>
        <div id="drawing-hint" class="hint-blanks">_ _ _ _ _</div>
      </div>

      <div class="canvas-container" id="canvas-wrap">
        <canvas id="live-canvas"></canvas>
      </div>

      <div id="drawing-bottom-banner" class="shout-banner">
        🗣️ SHOUT OUT YOUR GUESS TO THE DRAWER!
      </div>
    </div>

    <!-- SCREEN 5: GAME OVER PODIUM -->
    <div id="screen-gameover" class="screen">
      <div class="card" style="text-align:center;">
        <div style="font-size:36px;">🏆</div>
        <div class="title" style="font-size:24px;">Game Over!</div>
        <div id="gameover-winner-text" class="subtitle" style="font-size:15px;color:#FDE047;font-weight:700;">Winner!</div>
        <div id="gameover-scoreboard" class="player-list" style="margin-top:12px;"></div>
      </div>
    </div>

    <!-- CELEBRATION OVERLAY -->
    <div id="celebration-overlay">
      <div style="font-size:44px;margin-bottom:8px;">🎉</div>
      <img id="celeb-avatar" class="avatar-circle" style="width:88px;height:88px;border-color:#10B981;margin-bottom:10px;" alt="Winner" />
      <div id="celeb-title" style="font-size:22px;font-weight:900;color:#34D399;">Player Got It!</div>
      <div id="celeb-word" style="font-size:26px;font-weight:900;color:#FDE047;margin:8px 0;">WORD</div>
      <div style="font-size:14px;color:#CBD5E1;font-weight:700;">+100 pts Guesser • +50 pts Drawer</div>
      <div style="font-size:12px;color:#94A3B8;margin-top:12px;">Next word incoming on the iPad...</div>
    </div>
  </div>

  <script>
    (function() {
      // ======================================================================
      // 1. FULLSCREEN CONTROLLER
      // ======================================================================
      var fsBtn = document.getElementById('fs-toggle-btn');

      function isFullscreenActive() {
        return !!(
          document.fullscreenElement ||
          document.webkitFullscreenElement ||
          document.msFullscreenElement
        );
      }

      function requestAppFullscreen() {
        var el = document.documentElement;
        try {
          if (el.requestFullscreen) {
            el.requestFullscreen().catch(function(){});
          } else if (el.webkitRequestFullscreen) {
            el.webkitRequestFullscreen();
          }
          window.scrollTo(0, 1);
        } catch (e) {}
      }

      function toggleFullscreen() {
        if (isFullscreenActive()) {
          if (document.exitFullscreen) document.exitFullscreen().catch(function(){});
          else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        } else {
          requestAppFullscreen();
        }
      }

      fsBtn.addEventListener('click', function() {
        toggleFullscreen();
      });

      document.addEventListener('fullscreenchange', updateFsButtonLabel);
      document.addEventListener('webkitfullscreenchange', updateFsButtonLabel);

      function updateFsButtonLabel() {
        fsBtn.textContent = isFullscreenActive() ? '⛶ Exit Full' : '⛶ Fullscreen';
      }

      // Automatically request fullscreen on first user interaction
      var hasAutoRequestedFs = false;
      document.addEventListener('click', function() {
        if (!hasAutoRequestedFs && !isFullscreenActive()) {
          hasAutoRequestedFs = true;
          requestAppFullscreen();
        }
      }, { passive: true });

      // ======================================================================
      // 2. AVATAR SIMPLIFICATION & PRESET GENERATOR
      // ======================================================================
      var currentAvatarDataUrl = '';
      var rawSelfieImage = null;
      var cartoonFilterEnabled = true;

      var PRESET_EMOJIS = [
        { emoji: '🦊', bg: '#EA580C' },
        { emoji: '🐼', bg: '#2563EB' },
        { emoji: '🐸', bg: '#16A34A' },
        { emoji: '🦄', bg: '#9333EA' },
        { emoji: '🐙', bg: '#E11D48' },
        { emoji: '🦁', bg: '#D97706' },
        { emoji: '🤖', bg: '#0891B2' },
        { emoji: '👽', bg: '#4F46E5' }
      ];

      function generateEmojiAvatar(emoji, bgColor) {
        var c = document.createElement('canvas');
        c.width = 128;
        c.height = 128;
        var ctx = c.getContext('2d');

        ctx.fillStyle = bgColor;
        ctx.beginPath();
        ctx.arc(64, 64, 62, 0, Math.PI * 2);
        ctx.fill();

        ctx.lineWidth = 5;
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();

        ctx.font = '64px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(emoji, 64, 68);

        return c.toDataURL('image/jpeg', 0.82);
      }

      /**
       * Simplifies a camera selfie into a stylized 128x128 circular game avatar:
       * - Center-crops square around the face
       * - Applies vibrant contrast + optional cartoon color posterization
       * - Clips into a clean badge with a bright ring
       */
      function simplifySelfieToAvatar(imgElement, applyCartoon) {
        var size = 128;
        var c = document.createElement('canvas');
        c.width = size;
        c.height = size;
        var ctx = c.getContext('2d');

        var sw = imgElement.naturalWidth || imgElement.width;
        var sh = imgElement.naturalHeight || imgElement.height;
        var minDim = Math.min(sw, sh);
        var sx = (sw - minDim) / 2;
        var sy = (sh - minDim) / 2;

        // Draw circular clip
        ctx.save();
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - 3, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(imgElement, sx, sy, minDim, minDim, 0, 0, size, size);

        if (applyCartoon) {
          try {
            var imgData = ctx.getImageData(0, 0, size, size);
            var d = imgData.data;
            // Posterize color levels & slightly boost saturation for an illustrated avatar look
            var levels = 6;
            var step = 255 / (levels - 1);
            for (var i = 0; i < d.length; i += 4) {
              var r = d[i];
              var g = d[i + 1];
              var b = d[i + 2];

              // Subtle contrast & warmth boost
              r = Math.min(255, Math.max(0, (r - 128) * 1.18 + 132));
              g = Math.min(255, Math.max(0, (g - 128) * 1.15 + 128));
              b = Math.min(255, Math.max(0, (b - 128) * 1.15 + 128));

              d[i] = Math.round(Math.round(r / step) * step);
              d[i + 1] = Math.round(Math.round(g / step) * step);
              d[i + 2] = Math.round(Math.round(b / step) * step);
            }
            ctx.putImageData(imgData, 0, 0);
          } catch (err) {}
        }
        ctx.restore();

        // Draw crisp outer avatar ring
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - 3, 0, Math.PI * 2);
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#818CF8';
        ctx.stroke();

        return c.toDataURL('image/jpeg', 0.78);
      }

      var avatarPreview = document.getElementById('avatar-preview');
      var selfieInput = document.getElementById('selfie-input');
      var takeSelfieBtn = document.getElementById('take-selfie-btn');
      var toggleStyleBtn = document.getElementById('toggle-style-btn');
      var presetContainer = document.getElementById('preset-avatars');

      // Render preset emoji buttons
      PRESET_EMOJIS.forEach(function(item) {
        var chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'preset-chip';
        chip.textContent = item.emoji;
        chip.addEventListener('click', function() {
          rawSelfieImage = null;
          currentAvatarDataUrl = generateEmojiAvatar(item.emoji, item.bg);
          avatarPreview.src = currentAvatarDataUrl;
        });
        presetContainer.appendChild(chip);
      });

      // Load saved profile or initialize default avatar
      var savedPlayerId = localStorage.getItem('pictionary_player_id') || '';
      var savedName = localStorage.getItem('pictionary_player_name') || '';
      var savedAvatar = localStorage.getItem('pictionary_player_avatar') || '';

      if (savedAvatar) {
        currentAvatarDataUrl = savedAvatar;
      } else {
        var randomPreset = PRESET_EMOJIS[Math.floor(Math.random() * PRESET_EMOJIS.length)];
        currentAvatarDataUrl = generateEmojiAvatar(randomPreset.emoji, randomPreset.bg);
      }
      avatarPreview.src = currentAvatarDataUrl;

      var nameInput = document.getElementById('player-name-input');
      if (savedName) {
        nameInput.value = savedName;
      }

      takeSelfieBtn.addEventListener('click', function() {
        selfieInput.click();
      });

      selfieInput.addEventListener('change', function(e) {
        var file = e.target.files && e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(ev) {
          var img = new Image();
          img.onload = function() {
            rawSelfieImage = img;
            currentAvatarDataUrl = simplifySelfieToAvatar(img, cartoonFilterEnabled);
            avatarPreview.src = currentAvatarDataUrl;
          };
          img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
      });

      toggleStyleBtn.addEventListener('click', function() {
        cartoonFilterEnabled = !cartoonFilterEnabled;
        toggleStyleBtn.textContent = cartoonFilterEnabled
          ? '✨ Cartoon Filter: ON'
          : '📷 Cartoon Filter: OFF';
        if (rawSelfieImage) {
          currentAvatarDataUrl = simplifySelfieToAvatar(rawSelfieImage, cartoonFilterEnabled);
          avatarPreview.src = currentAvatarDataUrl;
        }
      });

      // ======================================================================
      // 3. LIVE CANVAS RENDERER (NORMALIZED 0..1 COORDINATES)
      // ======================================================================
      var liveCanvas = document.getElementById('live-canvas');
      var liveCtx = liveCanvas.getContext('2d');
      var activeStrokes = [];

      function resizeCanvas() {
        var wrap = document.getElementById('canvas-wrap');
        if (!wrap) return;
        var rect = wrap.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;
        var dpr = window.devicePixelRatio || 1;
        liveCanvas.width = rect.width * dpr;
        liveCanvas.height = rect.height * dpr;
        redrawAllStrokes();
      }

      window.addEventListener('resize', resizeCanvas);

      function redrawAllStrokes() {
        var w = liveCanvas.width;
        var h = liveCanvas.height;
        liveCtx.clearRect(0, 0, w, h);
        liveCtx.fillStyle = '#FFFFFF';
        liveCtx.fillRect(0, 0, w, h);

        for (var i = 0; i < activeStrokes.length; i++) {
          drawSingleStroke(activeStrokes[i], w, h);
        }
      }

      function drawSingleStroke(stroke, w, h) {
        if (stroke.isFill && stroke.fillRects && stroke.fillRects.length > 0) {
          liveCtx.save();
          liveCtx.fillStyle = stroke.color || '#111827';
          for (var rIdx = 0; rIdx < stroke.fillRects.length; rIdx++) {
            var r = stroke.fillRects[rIdx];
            var rx = Math.max(0, r.x * w - 0.35);
            var ry = Math.max(0, r.y * h - 0.35);
            var rw = Math.min(w - rx, r.w * w + 0.7);
            var rh = Math.min(h - ry, r.h * h + 0.7);
            liveCtx.fillRect(rx, ry, rw, rh);
          }
          liveCtx.restore();
          return;
        }

        var pts = stroke.points;
        if (!pts || pts.length === 0) return;

        liveCtx.save();
        liveCtx.lineCap = 'round';
        liveCtx.lineJoin = 'round';
        liveCtx.strokeStyle = stroke.isEraser ? '#FFFFFF' : stroke.color;
        liveCtx.lineWidth = Math.max(2, (stroke.width || 0.008) * w);

        liveCtx.beginPath();
        if (pts.length === 1) {
          var x0 = pts[0].x * w;
          var y0 = pts[0].y * h;
          liveCtx.arc(x0, y0, liveCtx.lineWidth / 2, 0, Math.PI * 2);
          liveCtx.fillStyle = stroke.isEraser ? '#FFFFFF' : stroke.color;
          liveCtx.fill();
        } else {
          liveCtx.moveTo(pts[0].x * w, pts[0].y * h);
          for (var i = 1; i < pts.length - 1; i++) {
            var midX = ((pts[i].x + pts[i + 1].x) / 2) * w;
            var midY = ((pts[i].y + pts[i + 1].y) / 2) * h;
            liveCtx.quadraticCurveTo(pts[i].x * w, pts[i].y * h, midX, midY);
          }
          var last = pts[pts.length - 1];
          liveCtx.lineTo(last.x * w, last.y * h);
          liveCtx.stroke();
        }
        liveCtx.restore();
      }

      // ======================================================================
      // 4. WEBSOCKET CONNECTION & STATE SYNC
      // ======================================================================
      var ws = null;
      var hasJoinedLobby = false;
      var latestGameState = null;
      var celebTimeout = null;

      function connectWebSocket() {
        var proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        var wsUrl = proto + '//' + window.location.host + '/ws';
        ws = new WebSocket(wsUrl);

        ws.onopen = function() {
          document.getElementById('conn-dot').classList.add('connected');
          if (hasJoinedLobby) {
            sendJoinMessage();
          }
        };

        ws.onclose = function() {
          document.getElementById('conn-dot').classList.remove('connected');
          setTimeout(connectWebSocket, 1500);
        };

        ws.onmessage = function(ev) {
          try {
            var msg = JSON.parse(ev.data);
            handleServerMessage(msg);
          } catch (e) {}
        };
      }

      function sendJoinMessage() {
        if (!ws || ws.readyState !== WebSocket.OPEN) return;
        var playerName = (nameInput.value || 'Player').trim() || 'Player';
        localStorage.setItem('pictionary_player_name', playerName);
        localStorage.setItem('pictionary_player_avatar', currentAvatarDataUrl);

        ws.send(JSON.stringify({
          type: 'JOIN_PLAYER',
          playerId: savedPlayerId || undefined,
          name: playerName,
          avatarDataUrl: currentAvatarDataUrl
        }));
      }

      function handleServerMessage(msg) {
        if (msg.type === 'WELCOME') {
          savedPlayerId = msg.assignedPlayerId;
          localStorage.setItem('pictionary_player_id', savedPlayerId);
          applyGameState(msg.state);
        } else if (msg.type === 'STATE_SYNC') {
          applyGameState(msg.state);
        } else if (msg.type === 'TIMER_TICK') {
          if (latestGameState) {
            latestGameState.turnTimeRemaining = msg.turnTimeRemaining;
            latestGameState.intermissionTimeRemaining = msg.intermissionTimeRemaining;
            updateTimerDisplays(msg.phase, msg.turnTimeRemaining, msg.intermissionTimeRemaining);
          }
        } else if (msg.type === 'STROKE_START') {
          activeStrokes.push(msg.stroke);
          redrawAllStrokes();
        } else if (msg.type === 'STROKE_MOVE') {
          for (var i = activeStrokes.length - 1; i >= 0; i--) {
            if (activeStrokes[i].id === msg.strokeId) {
              activeStrokes[i].points.push.apply(activeStrokes[i].points, msg.points);
              break;
            }
          }
          redrawAllStrokes();
        } else if (msg.type === 'STROKE_UNDO') {
          activeStrokes = msg.strokes || [];
          redrawAllStrokes();
        } else if (msg.type === 'CANVAS_CLEAR') {
          activeStrokes = [];
          redrawAllStrokes();
        } else if (msg.type === 'WORD_GUESSED') {
          showCelebration(msg.event);
          applyGameState(msg.state);
        }
      }

      function showCelebration(event) {
        if (!event) return;
        var overlay = document.getElementById('celebration-overlay');
        document.getElementById('celeb-avatar').src = event.guesserAvatar || '';
        document.getElementById('celeb-title').textContent = event.guesserName + ' got it right!';
        document.getElementById('celeb-word').textContent = '"' + event.word + '"';
        overlay.classList.add('show');

        if (celebTimeout) clearTimeout(celebTimeout);
        celebTimeout = setTimeout(function() {
          overlay.classList.remove('show');
        }, 2400);
      }

      function showScreen(screenId) {
        var screens = document.querySelectorAll('.screen');
        for (var i = 0; i < screens.length; i++) {
          screens[i].classList.remove('active');
        }
        var target = document.getElementById(screenId);
        if (target) target.classList.add('active');
        if (screenId === 'screen-drawing') {
          setTimeout(resizeCanvas, 50);
        }
      }

      function renderPlayerGrid(containerId, players) {
        var container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';
        var sorted = players.slice().sort(function(a, b) { return b.score - a.score; });
        sorted.forEach(function(p) {
          var div = document.createElement('div');
          div.className = 'player-pill';
          var img = document.createElement('img');
          img.src = p.avatarDataUrl || '';
          var info = document.createElement('div');
          info.className = 'player-pill-info';
          var nm = document.createElement('div');
          nm.className = 'player-pill-name';
          nm.textContent = p.name + (p.id === savedPlayerId ? ' (You)' : '');
          var sc = document.createElement('div');
          sc.className = 'player-pill-score';
          sc.textContent = p.score + ' pts';
          info.appendChild(nm);
          info.appendChild(sc);
          div.appendChild(img);
          div.appendChild(info);
          container.appendChild(div);
        });
      }

      function updateTimerDisplays(phase, turnSec, intermissionSec) {
        if (phase === 'INTERMISSION') {
          document.getElementById('intermission-timer').textContent = intermissionSec + 's';
        } else if (phase === 'DRAWING') {
          var tEl = document.getElementById('drawing-timer');
          tEl.textContent = turnSec + 's';
          if (turnSec <= 10) tEl.classList.add('urgent');
          else tEl.classList.remove('urgent');
        }
      }

      function applyGameState(state) {
        latestGameState = state;
        activeStrokes = state.strokes || [];

        // Update personal score badge
        var me = null;
        for (var i = 0; i < state.players.length; i++) {
          if (state.players[i].id === savedPlayerId) {
            me = state.players[i];
            break;
          }
        }
        var scoreBadge = document.getElementById('my-score-badge');
        if (me) {
          scoreBadge.style.display = 'inline';
          scoreBadge.textContent = me.score + ' pts';
        }

        if (!hasJoinedLobby) {
          showScreen('screen-join');
          return;
        }

        if (state.phase === 'LOBBY') {
          showScreen('screen-lobby');
          document.getElementById('lobby-my-avatar').src = currentAvatarDataUrl;
          document.getElementById('lobby-my-name').textContent = me ? me.name : nameInput.value;
          document.getElementById('lobby-count').textContent = state.players.length;
          renderPlayerGrid('lobby-player-list', state.players);
        } else if (state.phase === 'INTERMISSION') {
          showScreen('screen-intermission');
          var drawer = state.players[state.currentDrawerIndex] || state.players[0];
          var isMeUpNext = drawer && drawer.id === savedPlayerId;
          var card = document.getElementById('intermission-card');

          document.getElementById('intermission-round-badge').textContent =
            'Round ' + state.currentRound + ' of ' + state.settings.totalRounds;
          if (drawer) {
            document.getElementById('intermission-drawer-avatar').src = drawer.avatarDataUrl;
          }

          if (isMeUpNext) {
            card.classList.add('you-are-up');
            document.getElementById('intermission-headline').textContent = '🎨 YOU ARE UP NEXT!';
            document.getElementById('intermission-subtext').textContent = 'Grab the iPad and get ready to draw!';
          } else {
            card.classList.remove('you-are-up');
            document.getElementById('intermission-headline').textContent =
              (drawer ? drawer.name : 'Next Player') + ' is up next!';
            document.getElementById('intermission-subtext').textContent =
              'Pass the iPad! Get ready to shout your guesses...';
          }
          document.getElementById('intermission-timer').textContent =
            state.intermissionTimeRemaining + 's';
          renderPlayerGrid('intermission-scoreboard', state.players);
        } else if (state.phase === 'DRAWING') {
          showScreen('screen-drawing');
          var currentDrawer = state.players[state.currentDrawerIndex] || state.players[0];
          var amIDrawing = currentDrawer && currentDrawer.id === savedPlayerId;

          if (currentDrawer) {
            document.getElementById('drawing-drawer-avatar').src = currentDrawer.avatarDataUrl;
            document.getElementById('drawing-drawer-name').textContent = currentDrawer.name;
          }
          document.getElementById('drawing-category').textContent =
            (state.currentWordCategory || 'All') + ' • ' + (state.currentWordDifficulty || '');
          document.getElementById('drawing-hint').textContent = state.maskedWordHint || '';
          updateTimerDisplays('DRAWING', state.turnTimeRemaining, state.intermissionTimeRemaining);

          var banner = document.getElementById('drawing-bottom-banner');
          if (amIDrawing) {
            banner.className = 'shout-banner is-drawer';
            banner.textContent = '🎨 YOU ARE DRAWING ON THE IPAD RIGHT NOW!';
          } else {
            banner.className = 'shout-banner';
            banner.textContent = '🗣️ SHOUT OUT YOUR GUESS TO THE DRAWER!';
          }

          redrawAllStrokes();
        } else if (state.phase === 'GAME_OVER') {
          showScreen('screen-gameover');
          var ranked = state.players.slice().sort(function(a, b) { return b.score - a.score; });
          var top = ranked[0];
          document.getElementById('gameover-winner-text').textContent = top
            ? '👑 ' + top.name + ' wins with ' + top.score + ' points!'
            : 'Thanks for playing!';
          renderPlayerGrid('gameover-scoreboard', state.players);
        }
      }

      // Join button handler
      document.getElementById('join-game-btn').addEventListener('click', function() {
        var val = (nameInput.value || '').trim();
        if (!val) {
          nameInput.focus();
          nameInput.style.borderColor = '#EF4444';
          return;
        }
        nameInput.style.borderColor = '#475569';
        requestAppFullscreen();
        hasJoinedLobby = true;
        sendJoinMessage();
        if (latestGameState) {
          applyGameState(latestGameState);
        } else {
          showScreen('screen-lobby');
        }
      });

      // Edit profile from lobby
      document.getElementById('edit-profile-btn').addEventListener('click', function() {
        hasJoinedLobby = false;
        showScreen('screen-join');
      });

      connectWebSocket();
    })();
  </script>
</body>
</html>`;
