#!/usr/bin/env python3
"""Minimal injector: reads parts/ files and injects into index.html"""
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Read CSS and inject before DARK READER section
with open('parts/edu_styles.css', 'r', encoding='utf-8') as f:
    css = f.read()
anchor = '/* ===== DARK READER COMPATIBILITY ===== */'
if anchor in html:
    html = html.replace(anchor, css + '\n' + anchor, 1)
    print('[OK] CSS injected')

# 2. Read sidebar and inject before </nav>
with open('parts/edu_sidebar.html', 'r', encoding='utf-8') as f:
    sidebar = f.read()
main_idx = html.find('<main class="main">')
if main_idx > 0:
    nav_close = html.rfind('</nav>', 0, main_idx)
    if nav_close > 0:
        html = html[:nav_close] + sidebar + '\n' + html[nav_close:]
        print('[OK] Sidebar injected')

# 3. Read HTML sections and inject before <script>
with open('parts/edu_sections.html', 'r', encoding='utf-8') as f:
    sections = f.read()
marker = '\n<script>\n'
script_idx = html.find(marker)
if script_idx > 0:
    html = html[:script_idx] + '\n' + sections + '\n' + marker + html[script_idx + len(marker):]
    print('[OK] HTML sections injected')

# 4. Read JS and inject before INIT ON DOM READY
with open('parts/edu_script.js', 'r', encoding='utf-8') as f:
    js = f.read()
js_anchor = '/* ===== INIT ON DOM READY ===== */'
if js_anchor in html:
    html = html.replace(js_anchor, js + '\n\n' + js_anchor, 1)
    print('[OK] JavaScript injected')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('[DONE] index.html updated: ' + str(len(html)) + ' chars')
