export function generateMindMapHTML(data) {
  const json = JSON.stringify(data);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Mapa Mental — ${(data.centralTopic || '').replace(/"/g, '')}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #001a19; color: #f4f3eb; font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; }
  .header { background: #002b2a; border-bottom: 1px solid #003d3b; padding: 20px 32px; }
  .header h1 { font-size: 22px; font-weight: 700; color: #f4f3eb; }
  .header .sub { font-size: 13px; color: #8a897f; margin-top: 4px; }
  .header .meta { display: flex; gap: 16px; margin-top: 8px; flex-wrap: wrap; }
  .header .badge { font-size: 11px; background: #008c8c20; color: #33cccc; border: 1px solid #008c8c40; padding: 2px 10px; border-radius: 6px; }
  .container { max-width: 900px; margin: 0 auto; padding: 24px 16px 80px; }
  .epnote { background: #002b2a90; border: 1px solid #00555260; border-radius: 12px; padding: 14px 18px; margin-bottom: 20px; font-size: 13px; color: #80e0e0; }
  .epnote strong { color: #33cccc; }
  .summary { background: #002b2a60; border: 1px solid #003d3b60; border-radius: 12px; padding: 14px 18px; margin-bottom: 24px; font-size: 13px; color: #c4c3bc; }
  .summary strong { color: #f4f3eb; }
  .node { border-radius: 12px; margin-bottom: 12px; overflow: hidden; border: 1px solid #003d3b; }
  .node-header { display: flex; align-items: center; gap: 10px; padding: 14px 18px; cursor: pointer; user-select: none; transition: background 0.15s; }
  .node-header:hover { background: #ffffff08; }
  .node-arrow { font-size: 12px; color: #008c8c; transition: transform 0.2s; min-width: 16px; }
  .node-arrow.open { transform: rotate(90deg); }
  .node-label { font-weight: 600; font-size: 14px; flex: 1; }
  .node-type { font-size: 10px; padding: 2px 8px; border-radius: 4px; border: 1px solid; white-space: nowrap; }
  .type-primary { background: #008c8c15; color: #33cccc; border-color: #008c8c30; }
  .type-secondary { background: #00717015; color: #80e0e0; border-color: #00717030; }
  .type-tertiary { background: #00555215; color: #66d9d9; border-color: #00555230; }
  .type-detail, .type-example { background: #e2a85415; color: #f0d4a3; border-color: #e2a85430; }
  .node-body { padding: 0 18px 16px; display: none; }
  .node-body.open { display: block; }
  .node-content { background: #001a1980; border: 1px solid #003d3b40; border-radius: 10px; padding: 14px; font-size: 13px; color: #c4c3bc; margin-bottom: 12px; line-height: 1.7; }
  .keypoints { list-style: none; margin-bottom: 12px; }
  .keypoints li { display: flex; align-items: flex-start; gap: 8px; font-size: 12px; color: #c4c3bc; margin-bottom: 6px; }
  .keypoints .num { min-width: 20px; height: 20px; background: #e2a85420; color: #ebc07a; border-radius: 5px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; }
  .quote { border-left: 3px solid #e2a854; padding: 8px 14px; background: #e2a85408; border-radius: 0 8px 8px 0; font-size: 12px; color: #c4c3bc; font-style: italic; margin-bottom: 12px; }
  .children { margin-left: 20px; border-left: 2px solid #003d3b40; padding-left: 16px; }
  .depth-1 { background: #002b2a; }
  .depth-2 { background: #001f1e; }
  .depth-3 { background: #001a19; }
  .depth-4 { background: #1a180060; }
  .connections { margin-top: 24px; }
  .connections h2 { font-size: 16px; font-weight: 600; color: #f4f3eb; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
  .connections h2::before { content: ''; display: inline-block; width: 4px; height: 20px; background: #e2a854; border-radius: 2px; }
  .conn-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 10px; }
  .conn-card { background: #002b2a50; border: 1px solid #e2a85415; border-radius: 10px; padding: 14px; }
  .conn-nodes { font-size: 11px; color: #8a897f; margin-bottom: 4px; }
  .conn-nodes span { color: #33cccc; font-weight: 500; }
  .conn-rel { font-size: 12px; color: #ebc07a; font-weight: 600; margin-bottom: 4px; }
  .conn-expl { font-size: 12px; color: #8a897f; }
  .citations { margin-top: 24px; }
  .citations h2 { font-size: 16px; font-weight: 600; color: #f4f3eb; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
  .citations h2::before { content: ''; display: inline-block; width: 4px; height: 20px; background: #e2a854; border-radius: 2px; }
  .cite { border-left: 3px solid #e2a854; padding: 10px 14px; margin-bottom: 10px; }
  .cite p { font-size: 13px; color: #c4c3bc; font-style: italic; }
  .cite footer { font-size: 11px; color: #8a897f; margin-top: 4px; }
  .footer { text-align: center; padding: 32px; font-size: 11px; color: #8a897f40; border-top: 1px solid #003d3b30; margin-top: 40px; }
</style>
</head>
<body>

<div class="header">
  <h1 id="title"></h1>
  <div class="sub" id="subtitle"></div>
  <div class="meta" id="meta"></div>
</div>

<div class="container">
  <div id="epnote"></div>
  <div id="summary"></div>
  <div id="nodes"></div>
  <div id="connections"></div>
  <div id="citations"></div>
</div>

<div class="footer">Allos Ensina — Mapa Mental Interativo</div>

<script>
const data = ${json};

document.getElementById('title').textContent = data.centralTopic || '';
document.getElementById('subtitle').textContent = (data.author && data.author !== 'Não identificado' ? data.author + ' — ' : '') + (data.theoreticalBase || '');

const meta = document.getElementById('meta');
function countNodes(nodes) { let c = 0; if (!nodes) return 0; nodes.forEach(n => { c++; c += countNodes(n.children); }); return c; }
const total = countNodes(data.nodes);
meta.innerHTML = '<span class="badge">' + total + ' conceitos</span>';

if (data.epistemologicalNote) {
  document.getElementById('epnote').innerHTML = '<strong>Nota epistemológica:</strong> ' + esc(data.epistemologicalNote);
  document.getElementById('epnote').classList.add('epnote');
}
if (data.summary) {
  document.getElementById('summary').innerHTML = '<strong>Síntese:</strong> ' + esc(data.summary);
  document.getElementById('summary').classList.add('summary');
}

function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

function typeClass(t) { return 'type-' + (t || 'secondary'); }
function typeLabel(t) { return {primary:'Conceito Principal',secondary:'Subconceito',tertiary:'Detalhe',detail:'Nuance',example:'Exemplo'}[t] || t || 'Conceito'; }

function renderNode(node, depth) {
  const d = depth || 1;
  let html = '<div class="node depth-' + Math.min(d, 4) + '">';
  html += '<div class="node-header" onclick="toggle(this)">';
  html += '<span class="node-arrow">▶</span>';
  html += '<span class="node-label">' + esc(node.label) + '</span>';
  html += '<span class="node-type ' + typeClass(node.type) + '">' + typeLabel(node.type) + '</span>';
  html += '</div>';
  html += '<div class="node-body">';

  if (node.description) {
    html += '<div style="font-size:12px;color:#8a897f;margin-bottom:10px;">' + esc(node.description) + '</div>';
  }
  if (node.content) {
    html += '<div class="node-content">' + esc(node.content) + '</div>';
  }
  if (node.keyPoints && node.keyPoints.length) {
    html += '<ul class="keypoints">';
    node.keyPoints.forEach(function(p, i) {
      html += '<li><span class="num">' + (i+1) + '</span><span>' + esc(p) + '</span></li>';
    });
    html += '</ul>';
  }
  if (node.quote) {
    html += '<div class="quote">"' + esc(node.quote) + '"</div>';
  }
  if (node.children && node.children.length) {
    html += '<div class="children">';
    node.children.forEach(function(c) { html += renderNode(c, d + 1); });
    html += '</div>';
  }
  html += '</div></div>';
  return html;
}

let nodesHtml = '';
if (data.nodes) { data.nodes.forEach(function(n) { nodesHtml += renderNode(n, 1); }); }
document.getElementById('nodes').innerHTML = nodesHtml;

if (data.connections && data.connections.length) {
  let ch = '<div class="connections"><h2>Conexões Inter-Conceituais</h2><div class="conn-grid">';
  data.connections.forEach(function(c) {
    ch += '<div class="conn-card">';
    ch += '<div class="conn-nodes"><span>' + esc(c.from) + '</span> → <span>' + esc(c.to) + '</span></div>';
    ch += '<div class="conn-rel">' + esc(c.relationship) + '</div>';
    if (c.explanation) ch += '<div class="conn-expl">' + esc(c.explanation) + '</div>';
    ch += '</div>';
  });
  ch += '</div></div>';
  document.getElementById('connections').innerHTML = ch;
}

if (data.keyCitations && data.keyCitations.length) {
  let ci = '<div class="citations"><h2>Citações-Chave</h2>';
  data.keyCitations.forEach(function(c) {
    ci += '<div class="cite"><p>"' + esc(c.text) + '"</p>';
    ci += '<footer>— ' + esc(c.author) + (c.context ? ' · ' + esc(c.context) : '') + '</footer></div>';
  });
  ci += '</div>';
  document.getElementById('citations').innerHTML = ci;
}

function toggle(el) {
  const body = el.nextElementSibling;
  const arrow = el.querySelector('.node-arrow');
  body.classList.toggle('open');
  arrow.classList.toggle('open');
}
</script>
</body>
</html>`;
}

export function downloadMindMapHTML(data) {
  const html = generateMindMapHTML(data);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mapa-mental-${(data.centralTopic || 'export').replace(/\s+/g, '-').toLowerCase()}.html`;
  a.click();
  URL.revokeObjectURL(url);
}
