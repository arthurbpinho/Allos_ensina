import { useMemo, useState, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ArrowRight, Loader2, Quote, BookOpen, X, ChevronDown, ChevronRight, FileText, Download } from 'lucide-react';
import { downloadMindMapHTML } from '../utils/exportMindMap';

const NODE_COLORS = {
  central: { bg: '#008c8c', border: '#00b3b3', text: '#f4f3eb' },
  primary: { bg: '#003d3b', border: '#008c8c', text: '#ccf2f2' },
  secondary: { bg: '#002b2a', border: '#007170', text: '#80e0e0' },
  tertiary: { bg: '#001f1e', border: '#005552', text: '#66d9d9' },
  detail: { bg: '#1a1800', border: '#c4862e', text: '#f0d4a3' },
  example: { bg: '#1a1800', border: '#e2a854', text: '#f0d4a3' },
};

function getColors(type) {
  return NODE_COLORS[type] || NODE_COLORS.secondary;
}

function flattenNodes(nodes, parentId = null, depth = 0) {
  const result = [];
  if (!nodes) return result;
  for (const node of nodes) {
    result.push({ ...node, depth, parentId });
    if (node.children?.length) {
      result.push(...flattenNodes(node.children, node.id, depth + 1));
    }
  }
  return result;
}

function buildFlowElements(data) {
  const nodes = [];
  const edges = [];

  if (!data?.nodes) return { nodes, edges };

  // Central node
  nodes.push({
    id: 'central',
    data: {
      label: (
        <div className="text-center p-1">
          <div className="font-bold text-sm leading-tight">{data.centralTopic}</div>
          {data.author && <div className="text-[10px] opacity-70 mt-1">{data.author}</div>}
          {data.theoreticalBase && <div className="text-[9px] opacity-50 mt-0.5">{data.theoreticalBase}</div>}
        </div>
      ),
      nodeData: { label: data.centralTopic, content: data.summary || '', type: 'central' },
    },
    position: { x: 0, y: 0 },
    style: {
      background: NODE_COLORS.central.bg,
      border: `2px solid ${NODE_COLORS.central.border}`,
      color: NODE_COLORS.central.text,
      borderRadius: '16px',
      padding: '14px 24px',
      fontSize: '14px',
      minWidth: '220px',
      cursor: 'pointer',
      boxShadow: '0 0 20px rgba(0,140,140,0.3)',
    },
  });

  const totalPrimary = data.nodes.length;
  const spacing = 380;
  const startX = -(totalPrimary - 1) * spacing / 2;

  data.nodes.forEach((node, i) => {
    const px = startX + i * spacing;
    const py = 180;
    const colors = getColors('primary');

    nodes.push({
      id: node.id,
      data: {
        label: (
          <div className="text-center p-1">
            <div className="font-semibold text-xs leading-tight">{node.label}</div>
            <div className="text-[9px] opacity-60 mt-1 leading-tight">
              {(node.description || '').slice(0, 60)}{(node.description || '').length > 60 ? '...' : ''}
            </div>
          </div>
        ),
        nodeData: node,
      },
      position: { x: px, y: py },
      style: {
        background: colors.bg,
        border: `2px solid ${colors.border}`,
        color: colors.text,
        borderRadius: '12px',
        padding: '10px 16px',
        fontSize: '12px',
        minWidth: '180px',
        maxWidth: '260px',
        cursor: 'pointer',
      },
    });

    edges.push({
      id: `central-${node.id}`,
      source: 'central',
      target: node.id,
      style: { stroke: '#008c8c', strokeWidth: 2 },
      animated: true,
    });

    // Level 2 - secondary
    if (node.children) {
      const childSpacing = 240;
      const childStartX = px - (node.children.length - 1) * childSpacing / 2;

      node.children.forEach((child, j) => {
        const cx = childStartX + j * childSpacing;
        const cy = py + 180;
        const cColors = getColors(child.type || 'secondary');

        nodes.push({
          id: child.id,
          data: {
            label: (
              <div className="text-center p-0.5">
                <div className="font-medium text-[11px] leading-tight">{child.label}</div>
              </div>
            ),
            nodeData: child,
          },
          position: { x: cx, y: cy },
          style: {
            background: cColors.bg,
            border: `1.5px solid ${cColors.border}`,
            color: cColors.text,
            borderRadius: '10px',
            padding: '8px 12px',
            fontSize: '11px',
            minWidth: '150px',
            maxWidth: '220px',
            cursor: 'pointer',
          },
        });

        edges.push({
          id: `${node.id}-${child.id}`,
          source: node.id,
          target: child.id,
          style: { stroke: cColors.border, strokeWidth: 1.5 },
        });

        // Level 3 - tertiary
        if (child.children) {
          const gcSpacing = 200;
          const gcStartX = cx - (child.children.length - 1) * gcSpacing / 2;

          child.children.forEach((gc, k) => {
            const gcx = gcStartX + k * gcSpacing;
            const gcy = cy + 150;
            const gcColors = getColors(gc.type || 'tertiary');

            nodes.push({
              id: gc.id,
              data: {
                label: (
                  <div className="text-center">
                    <div className="text-[10px] leading-tight">{gc.label}</div>
                  </div>
                ),
                nodeData: gc,
              },
              position: { x: gcx, y: gcy },
              style: {
                background: gcColors.bg,
                border: `1px solid ${gcColors.border}`,
                color: gcColors.text,
                borderRadius: '8px',
                padding: '6px 10px',
                fontSize: '10px',
                minWidth: '120px',
                maxWidth: '190px',
                cursor: 'pointer',
              },
            });

            edges.push({
              id: `${child.id}-${gc.id}`,
              source: child.id,
              target: gc.id,
              style: { stroke: gcColors.border, strokeWidth: 1 },
            });

            // Level 4 - detail
            if (gc.children) {
              const dSpacing = 170;
              const dStartX = gcx - (gc.children.length - 1) * dSpacing / 2;

              gc.children.forEach((d, l) => {
                const dx = dStartX + l * dSpacing;
                const dy = gcy + 130;
                const dColors = getColors(d.type || 'detail');

                nodes.push({
                  id: d.id,
                  data: {
                    label: (
                      <div className="text-center">
                        <div className="text-[9px] leading-tight">{d.label}</div>
                      </div>
                    ),
                    nodeData: d,
                  },
                  position: { x: dx, y: dy },
                  style: {
                    background: dColors.bg,
                    border: `1px solid ${dColors.border}`,
                    color: dColors.text,
                    borderRadius: '6px',
                    padding: '5px 8px',
                    fontSize: '9px',
                    minWidth: '100px',
                    maxWidth: '160px',
                    cursor: 'pointer',
                  },
                });

                edges.push({
                  id: `${gc.id}-${d.id}`,
                  source: gc.id,
                  target: d.id,
                  style: { stroke: dColors.border, strokeWidth: 1, strokeDasharray: '3,3' },
                });
              });
            }
          });
        }
      });
    }
  });

  // Cross-connections
  if (data.connections) {
    data.connections.forEach((conn, i) => {
      edges.push({
        id: `conn-${i}`,
        source: conn.from,
        target: conn.to,
        label: conn.relationship,
        style: { stroke: '#e2a854', strokeWidth: 1.5, strokeDasharray: '6,4' },
        labelStyle: { fill: '#ebc07a', fontSize: 9, fontWeight: 600 },
        labelBgStyle: { fill: '#001a19', fillOpacity: 0.85 },
        labelBgPadding: [4, 6],
        labelBgBorderRadius: 4,
      });
    });
  }

  return { nodes, edges };
}

// Side panel for node details
function NodePanel({ node, onClose, allNodes }) {
  const [expandedChildren, setExpandedChildren] = useState({});

  if (!node) return null;

  const toggleChild = (id) => {
    setExpandedChildren((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const typeLabels = {
    primary: 'Conceito Principal',
    secondary: 'Subconceito',
    tertiary: 'Detalhe',
    detail: 'Nuance',
    example: 'Exemplo',
    central: 'Tema Central',
  };

  const typeColors = {
    primary: 'text-allos-300 bg-allos-500/15 border-allos-500/30',
    secondary: 'text-allos-200 bg-allos-600/15 border-allos-600/30',
    tertiary: 'text-allos-200 bg-allos-700/20 border-allos-700/30',
    detail: 'text-gold-400 bg-gold-500/15 border-gold-500/30',
    example: 'text-gold-400 bg-gold-500/15 border-gold-500/30',
    central: 'text-allos-300 bg-allos-500/20 border-allos-500/30',
  };

  const renderChildTree = (children, depth = 0) => {
    if (!children?.length) return null;
    return (
      <div className={`space-y-2 ${depth > 0 ? 'ml-4 border-l border-allos-700/30 pl-3' : ''}`}>
        {children.map((child) => {
          const isExpanded = expandedChildren[child.id];
          const hasChildren = child.children?.length > 0;
          return (
            <div key={child.id}>
              <button
                onClick={() => toggleChild(child.id)}
                className="flex items-start gap-2 w-full text-left group"
              >
                {hasChildren ? (
                  isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-allos-400 mt-0.5 shrink-0" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-allos-500 mt-0.5 shrink-0" />
                  )
                ) : (
                  <span className="w-3.5 h-3.5 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-allos-600" />
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-cream-dim group-hover:text-cream transition-colors">
                    {child.label}
                  </span>
                  <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded border ${typeColors[child.type] || typeColors.secondary}`}>
                    {typeLabels[child.type] || child.type}
                  </span>
                </div>
              </button>

              {isExpanded && (
                <div className="mt-2 ml-5.5 space-y-2">
                  {child.content && (
                    <p className="text-sm text-cream-dim leading-relaxed bg-allos-900/50 rounded-lg p-3 border border-allos-800/40">
                      {child.content}
                    </p>
                  )}
                  {child.keyPoints?.length > 0 && (
                    <ul className="space-y-1">
                      {child.keyPoints.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-cream-muted">
                          <span className="text-gold-500 mt-0.5 shrink-0">-</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {child.quote && (
                    <blockquote className="border-l-2 border-gold-500/50 pl-3 py-1">
                      <p className="text-xs text-cream-muted italic">"{child.quote}"</p>
                    </blockquote>
                  )}
                  {renderChildTree(child.children, depth + 1)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-allos-950/95 backdrop-blur-md border-l border-allos-800/60 z-50 flex flex-col shadow-2xl shadow-black/50">
      {/* Header */}
      <div className="flex items-start justify-between p-5 border-b border-allos-800/50">
        <div className="flex-1 min-w-0 pr-4">
          <span className={`inline-block text-[10px] px-2 py-0.5 rounded border mb-2 ${typeColors[node.type] || typeColors.primary}`}>
            {typeLabels[node.type] || node.type}
          </span>
          <h3 className="text-lg font-bold text-cream leading-tight">{node.label}</h3>
          {node.description && (
            <p className="text-sm text-cream-muted mt-1">{node.description}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-allos-800/50 text-cream-muted hover:text-cream transition-colors shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Main content paragraph */}
        {node.content && (
          <div>
            <h4 className="text-xs font-semibold text-allos-400 uppercase tracking-wider mb-2">Conteúdo</h4>
            <p className="text-sm text-cream leading-relaxed bg-allos-900/40 rounded-xl p-4 border border-allos-800/40">
              {node.content}
            </p>
          </div>
        )}

        {/* Key Points */}
        {node.keyPoints?.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gold-500 uppercase tracking-wider mb-2">Pontos-Chave</h4>
            <ul className="space-y-2">
              {node.keyPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-cream-dim">
                  <span className="w-5 h-5 rounded-md bg-gold-500/15 text-gold-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Quote */}
        {node.quote && (
          <blockquote className="border-l-3 border-gold-500 pl-4 py-2 bg-gold-500/5 rounded-r-lg">
            <p className="text-sm text-cream-dim italic">"{node.quote}"</p>
          </blockquote>
        )}

        {/* Children tree */}
        {node.children?.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-allos-400 uppercase tracking-wider mb-3">
              Ramificações ({node.children.length})
            </h4>
            {renderChildTree(node.children)}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MindMapViewer({ data, onNext, hasContent, loading }) {
  const [selectedNode, setSelectedNode] = useState(null);

  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => buildFlowElements(data),
    [data]
  );
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const allFlatNodes = useMemo(() => flattenNodes(data?.nodes || []), [data]);

  const onNodeClick = useCallback((_, flowNode) => {
    const nodeData = flowNode.data?.nodeData;
    if (nodeData) {
      setSelectedNode(nodeData);
    }
  }, []);

  const totalNodes = useMemo(() => {
    let count = 0;
    const countNodes = (nodes) => {
      if (!nodes) return;
      for (const n of nodes) {
        count++;
        countNodes(n.children);
      }
    };
    countNodes(data?.nodes);
    return count;
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-cream">Mapa Mental</h2>
          <p className="text-cream-muted text-sm mt-1">
            {data.centralTopic}
            {data.author ? ` — ${data.author}` : ''}
            {data.theoreticalBase ? ` (${data.theoreticalBase})` : ''}
          </p>
          <p className="text-cream-muted/50 text-xs mt-1">
            {totalNodes} conceitos mapeados - clique em qualquer nó para expandir
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadMindMapHTML(data)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold-500/15 text-gold-400 border border-gold-500/30 hover:bg-gold-500/25 transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Baixar Mapa
          </button>
          <button
          onClick={onNext}
          disabled={!hasContent}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-allos-500 text-cream font-medium hover:bg-allos-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Gerando roteiros...
            </>
          ) : (
            <>
              Ver Roteiros
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
        </div>
      </div>

      {/* Epistemological Note */}
      {data.epistemologicalNote && (
        <div className="bg-allos-900/60 border border-allos-700/40 rounded-xl p-4">
          <p className="text-allos-200 text-sm leading-relaxed">
            <span className="font-semibold text-allos-300">Nota epistemológica:</span>{' '}
            {data.epistemologicalNote}
          </p>
        </div>
      )}

      {/* Summary */}
      {data.summary && (
        <div className="bg-allos-900/40 border border-allos-800/40 rounded-xl p-4">
          <p className="text-cream-dim text-sm leading-relaxed">
            <span className="font-semibold text-cream">Síntese:</span>{' '}
            {data.summary}
          </p>
        </div>
      )}

      {/* Flow Canvas */}
      <div className="h-[650px] bg-allos-900/40 rounded-2xl border border-allos-800/60 overflow-hidden relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.15}
          maxZoom={2}
        >
          <Background color="#005552" gap={20} />
          <Controls
            style={{ background: '#002b2a', borderColor: '#005552', borderRadius: '12px' }}
          />
          <MiniMap
            nodeColor={(n) => {
              const type = n.data?.nodeData?.type || 'secondary';
              return getColors(type).border;
            }}
            maskColor="rgba(0,27,26,0.85)"
            style={{ background: '#001a19', borderRadius: '8px', border: '1px solid #003d3b' }}
          />
        </ReactFlow>

        {/* Hint overlay */}
        {!selectedNode && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-allos-900/90 backdrop-blur-sm border border-allos-700/40 rounded-lg px-4 py-2 pointer-events-none">
            <p className="text-cream-muted text-xs flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-allos-400" />
              Clique em qualquer nó para ver o conteúdo completo
            </p>
          </div>
        )}
      </div>

      {/* Node Detail Panel */}
      {selectedNode && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setSelectedNode(null)}
          />
          <NodePanel
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            allNodes={allFlatNodes}
          />
        </>
      )}

      {/* Key Citations */}
      {data.keyCitations?.length > 0 && (
        <div className="bg-allos-900/50 border border-allos-800/50 rounded-2xl p-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-cream mb-4">
            <Quote className="w-5 h-5 text-gold-500" />
            Citações-Chave
          </h3>
          <div className="space-y-3">
            {data.keyCitations.map((citation, i) => (
              <blockquote
                key={i}
                className="border-l-3 border-gold-500 pl-4 py-2"
              >
                <p className="text-cream-dim text-sm italic">"{citation.text}"</p>
                <footer className="text-cream-muted text-xs mt-1">
                  — {citation.author}
                  {citation.context ? ` · ${citation.context}` : ''}
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      )}

      {/* Connections detail */}
      {data.connections?.length > 0 && (
        <div className="bg-allos-900/50 border border-allos-800/50 rounded-2xl p-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-cream mb-4">
            <BookOpen className="w-5 h-5 text-gold-400" />
            Conexões Inter-Conceituais
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            {data.connections.map((conn, i) => (
              <div key={i} className="bg-allos-800/30 rounded-xl p-4 border border-gold-500/15">
                <div className="flex items-center gap-2 text-xs text-cream-muted mb-2">
                  <span className="text-allos-300 font-medium">{conn.from}</span>
                  <span className="text-gold-500">→</span>
                  <span className="text-allos-300 font-medium">{conn.to}</span>
                </div>
                <p className="text-xs font-semibold text-gold-400 mb-1">{conn.relationship}</p>
                {conn.explanation && (
                  <p className="text-xs text-cream-muted leading-relaxed">{conn.explanation}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
