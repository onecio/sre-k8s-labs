import re
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Add print styles for new sections - hide interactive components in print
print_hide = '.terminal-sim, .yaml-explorer, .flashcard-area, .rollout-sim, .flashcard-controls, .flashcard-nav, .terminal-hint, .terminal-input-row, .rollout-controls, .rollout-log { display: none !important; }'
# Find the last entry in print hide list and add before closing brace
old_hide = '.hero-actions,\n  .skip-link,\n  .alert-icon,\n  .hero::before,\n  .hero::after,\n  .hero-badge .icon-svg { display: none !important; }'
new_hide = '.hero-actions,\n  .skip-link,\n  .alert-icon,\n  .hero::before,\n  .hero::after,\n  .hero-badge .icon-svg,\n  .terminal-sim,\n  .yaml-explorer,\n  .flashcard-area,\n  .rollout-sim,\n  .flashcard-controls,\n  .flashcard-nav,\n  .terminal-hint,\n  .terminal-input-row,\n  .rollout-controls,\n  .rollout-log { display: none !important; }'
if old_hide in html:
    html = html.replace(old_hide, new_hide, 1)
    print('[OK] Print styles added for new sections')

# 2. Add ARIA live region to terminal output
old_term = '<div class="terminal-output" id="terminalOutput">'
new_term = '<div class="terminal-output" id="terminalOutput" aria-live="polite" role="log">'
if old_term in html:
    html = html.replace(old_term, new_term, 1)
    print('[OK] ARIA live region added to terminal output')

# 3. Add aria-label to terminal input
old_input = 'class="terminal-input" id="terminalInput" placeholder="Digite um comando..."'
new_input = 'class="terminal-input" id="terminalInput" placeholder="Digite um comando..." aria-label="Digite um comando kubectl"'
if old_input in html:
    html = html.replace(old_input, new_input, 1)
    print('[OK] ARIA label added to terminal input')

# 4. Add role and aria-label to flashcard
old_fc = '<div class="flashcard" id="flashcard" onclick="flipFlashcard()">'
new_fc = '<div class="flashcard" id="flashcard" onclick="flipFlashcard()" role="button" tabindex="0" aria-label="Flashcard: clique ou pressione Enter para ver a resposta" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();flipFlashcard()}">'
if old_fc in html:
    html = html.replace(old_fc, new_fc, 1)
    print('[OK] ARIA and keyboard support added to flashcard')

# 5. Add Dark Reader compatibility for new components
dr_anchor = '/* Protect scrollbar colors from being overridden */'
dr_new = '''/* Protect new interactive components from Dark Reader */
.terminal-sim,
.terminal-output,
.terminal-prompt,
.terminal-line,
.yaml-explorer,
.yaml-code-panel,
.yaml-key,
.yaml-str,
.yaml-num,
.yaml-doc-panel,
.flashcard-area,
.flashcard,
.flashcard-front,
.flashcard-back,
.rollout-sim,
.rollout-pod,
.rollout-log {
  forced-color-adjust: none !important;
  -webkit-print-color-adjust: exact !important;
  color-adjust: exact !important;
}

/* Protect scrollbar colors from being overridden */'''
if dr_anchor in html:
    html = html.replace(dr_anchor, dr_new, 1)
    print('[OK] Dark Reader compatibility added for new components')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('[DONE] Review fixes applied: ' + str(len(html)) + ' chars')
