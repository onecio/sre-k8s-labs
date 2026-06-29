#!/usr/bin/env python3
"""Add shareable badge images for individual quiz achievements"""

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# ============================================
# 1. ADD BADGE CSS
# ============================================
badge_css = """
/* ===== SHAREABLE BADGE ===== */
.quiz-share-btn {
  display: none; margin-top: 8px; padding: 6px 14px;
  border: 1px solid var(--border); border-radius: var(--radius-sm);
  background: var(--bg-card); color: var(--text-secondary);
  font-size: 12px; font-weight: 500; cursor: pointer;
  transition: all var(--transition); align-items: center; gap: 6px;
}
.quiz-share-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-subtle); }
.quiz-share-btn.show { display: inline-flex; }
/* Badge Preview Modal */
.badge-overlay {
  display: none; position: fixed; inset: 0; z-index: 10002;
  background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
  align-items: center; justify-content: center; padding: 20px;
}
.badge-overlay.open { display: flex; }
.badge-dialog {
  background: var(--bg-secondary); border: 1px solid var(--border);
  border-radius: var(--radius-lg); width: 90%; max-width: 500px;
  box-shadow: var(--shadow-lg); overflow: hidden; text-align: center;
}
.badge-dialog-header {
  padding: 20px 24px 12px;
  border-bottom: 1px solid var(--border);
}
.badge-dialog-header h3 { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
.badge-dialog-header p { font-size: 13px; color: var(--text-muted); }
.badge-preview { padding: 20px; display: flex; justify-content: center; }
.badge-preview canvas {
  border-radius: var(--radius); box-shadow: var(--shadow-lg);
  max-width: 100%; height: auto;
}
.badge-actions {
  display: flex; gap: 10px; padding: 16px 24px;
  border-top: 1px solid var(--border); justify-content: center;
}
"""
last_style = content.rfind('</style>')
if last_style != -1:
    content = content[:last_style] + badge_css + "\n" + content[last_style:]
    print("1. Badge CSS added")

# ============================================
# 2. ADD BADGE MODAL HTML
# ============================================
badge_modal = """
<div class="badge-overlay" id="badgeOverlay" onclick="if(event.target===this)closeBadge()">
  <div class="badge-dialog">
    <div class="badge-dialog-header">
      <h3 id="badgeTitle">Badge de Conquista</h3>
      <p id="badgeSubtitle">Compartilhe sua conquista</p>
    </div>
    <div class="badge-preview">
      <canvas id="badgeCanvas" width="600" height="315"></canvas>
    </div>
    <div class="badge-actions">
      <button class="cert-btn primary" onclick="downloadBadge()">\\ud83d\\udcbe Baixar PNG</button>
      <button class="cert-btn secondary" onclick="copyBadgeText()">\\ud83d\\udccb Copiar Texto</button>
    </div>
  </div>
</div>
"""
anchor = '<!-- Certificate Modal -->'
idx = content.find(anchor)
if idx != -1:
    content = content[:idx] + badge_modal + "\n" + content[idx:]
    print("2. Badge modal HTML added")

# ============================================
# 3. ADD BADGE JS FUNCTIONS BEFORE CLOSING SCRIPT
# ============================================
script_end = content.rfind('</script>')
if script_end != -1:
    badge_js = """// ===== SHAREABLE BADGES =====
var _badgeQuizId = null, _badgeQuizName = '', _badgeScore = 0, _badgeTotal = 0, _badgePct = 0;

function shareQuizBadge(quizId) {
  var progress = getProgress();
  var data = progress.quizzes && progress.quizzes[quizId];
  if (!data || !data.completed) return;
  _badgeQuizId = quizId;
  _badgeQuizName = QUIZ_NAMES[quizId];
  _badgeScore = data.score;
  _badgeTotal = data.total;
  _badgePct = data.pct;
  document.getElementById('badgeTitle').textContent = (_badgePct === 100 ? 'Mestre em ' : 'Aprovado em ') + _badgeQuizName;
  document.getElementById('badgeSubtitle').textContent = 'Manual Kubernetes para SRE/DevOps';
  renderBadge();
  document.getElementById('badgeOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeBadge() {
  document.getElementById('badgeOverlay').classList.remove('open');
  document.body.style.overflow = '';
}
function renderBadge() {
  var canvas = document.getElementById('badgeCanvas');
  var ctx = canvas.getContext('2d');
  var w = canvas.width, h = canvas.height;
  var grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#0d1117'); grad.addColorStop(0.6, '#161b22');
  grad.addColorStop(1, _badgePct === 100 ? '#1a2a10' : '#1a1040');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = _badgePct === 100 ? '#3fb950' : '#58a6ff'; ctx.lineWidth = 3;
  rRect(ctx, 8, 8, w - 16, h - 16, 12); ctx.stroke();
  ctx.strokeStyle = _badgePct === 100 ? 'rgba(63,185,80,0.3)' : 'rgba(88,166,255,0.3)'; ctx.lineWidth = 1;
  rRect(ctx, 14, 14, w - 28, h - 28, 8); ctx.stroke();
  ctx.font = '48px serif'; ctx.textAlign = 'center';
  ctx.fillStyle = '#e6edf3';
  ctx.fillText(_badgePct === 100 ? 'PERFEITO' : (_badgePct >= 60 ? 'APROVADO' : 'EM PROGRESSO'), w / 2, 70);
  ctx.fillStyle = _badgePct === 100 ? '#3fb950' : '#e3b341';
  ctx.font = 'bold 26px Segoe UI, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(_badgeQuizName, w / 2, 110);
  ctx.fillStyle = '#8b949e'; ctx.font = '18px Segoe UI, sans-serif';
  ctx.fillText(_badgeScore + '/' + _badgeTotal + ' (' + _badgePct + '%)', w / 2, 145);
  ctx.strokeStyle = 'rgba(88,166,255,0.2)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(60, 170); ctx.lineTo(w - 60, 170); ctx.stroke();
  var barX = 80, barY = 195, barW = w - 160, barH = 20;
  ctx.fillStyle = '#21262d'; rRectFill(ctx, barX, barY, barW, barH, 10);
  var fillW = Math.max(barH, barW * _badgePct / 100);
  var bg = ctx.createLinearGradient(barX, 0, barX + barW, 0);
  if (_badgePct === 100) { bg.addColorStop(0, '#238636'); bg.addColorStop(1, '#3fb950'); }
  else if (_badgePct >= 60) { bg.addColorStop(0, '#1f6feb'); bg.addColorStop(1, '#58a6ff'); }
  else { bg.addColorStop(0, '#da3633'); bg.addColorStop(1, '#f85149'); }
  ctx.fillStyle = bg; rRectFill(ctx, barX, barY, fillW, barH, 10);
  ctx.fillStyle = '#ffffff'; ctx.font = 'bold 12px Segoe UI, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(_badgePct + '%', barX + barW / 2, barY + 14);
  ctx.fillStyle = '#8b949e'; ctx.font = '14px Segoe UI, sans-serif';
  ctx.fillText('Manual Kubernetes para SRE/DevOps', w / 2, 250);
  ctx.fillStyle = '#58a6ff'; ctx.font = '12px Consolas, monospace';
  ctx.fillText(window.location.origin + window.location.pathname, w / 2, 290);
}
function rRect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}
function rRectFill(ctx, x, y, w, h, r) { rRect(ctx, x, y, w, h, r); ctx.fill(); }
function downloadBadge() {
  var name = localStorage.getItem('k8s-cert-name') || 'k8s-quiz';
  var canvas = document.getElementById('badgeCanvas');
  var link = document.createElement('a');
  link.download = 'badge-' + _badgeQuizId + '-' + name.replace(/\\s+/g, '-').toLowerCase() + '.png';
  link.href = canvas.toDataURL('image/png'); link.click();
}
function copyBadgeText() {
  var name = localStorage.getItem('k8s-cert-name') || 'Estudante K8s';
  var emoji = _badgePct === 100 ? '\\ud83c\\udfc6' : (_badgePct >= 60 ? '\\u2705' : '\\ud83d\\udcda');
  var text = emoji + ' ' + (_badgePct === 100 ? 'Mestre' : 'Aprovado') + ' em ' + _badgeQuizName + '!\\n' +
    _badgeScore + '/' + _badgeTotal + ' (' + _badgePct + '%) de acerto\\n\\n' +
    '\\ud83d\\udcaa Manual Kubernetes para SRE/DevOps\\n' +
    '\\ud83d\\udd17 ' + window.location.origin + window.location.pathname;
  navigator.clipboard.writeText(text).then(function() {
    var btn = document.querySelector('#badgeOverlay .cert-btn.secondary');
    if (btn) { var orig = btn.innerHTML; btn.innerHTML = '\\u2705 Copiado!'; setTimeout(function() { btn.innerHTML = orig; }, 2000); }
  });
}
"""
    content = content[:script_end] + badge_js + "\n" + content[script_end:]
    print("3. Badge JS functions added")

# ============================================
# 4. UPDATE showScore TO ADD SHARE BUTTON
# ============================================
# After scoreEl.textContent = ..., add share button creation
old_score_end = "saveProgress(progress);\n  updateProgressUI();\n  checkAchievements();\n  showRetryButton(quizId);"
new_score_end = "saveProgress(progress);\n  updateProgressUI();\n  checkAchievements();\n  showRetryButton(quizId);\n  showShareButton(quizId);"
content = content.replace(old_score_end, new_score_end, 1)
print("4. showScore updated to call showShareButton")

# ============================================
# 5. ADD showShareButton FUNCTION (after showRetryButton)
# ============================================
old_retry_close = "  const retryBtn = quiz.querySelector('.quiz-retry');\n    if (retryBtn) retryBtn.classList.remove('show');\n  }\n}"
new_share_funcs = "  const retryBtn = quiz.querySelector('.quiz-retry');\n    if (retryBtn) retryBtn.classList.remove('show');\n  }\n}\n\nfunction showShareButton(quizId) {\n  var quiz = document.getElementById('quiz-' + quizId);\n  if (!quiz) return;\n  var progress = getProgress();\n  var data = progress.quizzes && progress.quizzes[quizId];\n  if (!data || !data.completed) return;\n  var shareBtn = quiz.querySelector('.quiz-share-btn');\n  if (!shareBtn) {\n    shareBtn = document.createElement('button');\n    shareBtn.className = 'quiz-share-btn show';\n    shareBtn.innerHTML = '\\ud83d\\udce4 Compartilhar Badge';\n    shareBtn.onclick = function() { shareQuizBadge(quizId); };\n    var retryBtn2 = quiz.querySelector('.quiz-retry');\n    if (retryBtn2) retryBtn2.parentNode.insertBefore(shareBtn, retryBtn2.nextSibling);\n    else {\n      var scoreEl = document.getElementById('score-' + quizId);\n      if (scoreEl) scoreEl.parentNode.insertBefore(shareBtn, scoreEl.nextSibling);\n    }\n  } else {\n    shareBtn.classList.add('show');\n  }\n}"
content = content.replace(new_retry_close, new_share_funcs, 1)
print("5. showShareButton function added")

# Also update restoreState to show share button
old_restore_score = "      }\n    }\n  });\n\n  LAB_IDS.forEach"
new_restore_score = "      }\n      showShareButton(id);\n    }\n  });\n\n  LAB_IDS.forEach"
content = content.replace(old_restore_score, new_restore_score, 1)
print("6. restoreState updated to call showShareButton")

# ============================================
# SAVE
# ============================================
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"\nDone! Final file size: {len(content):,} chars")
print("Shareable badges: modal, canvas rendering, PNG download, text copy")
