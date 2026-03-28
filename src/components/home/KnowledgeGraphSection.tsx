"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { apiClient } from "@/lib/apiClient";

interface TypeMetaConfig {
  color: string;
  icon: string;
}

interface GraphDataNode {
  id: string;
  label: string;
  type: string;
  description: string;
}

interface GraphDataEdge {
  source: string;
  target: string;
  relation: string;
}

interface GraphData {
  status: string;
  seed_id: string;
  query: string;
  total_nodes: number;
  total_edges: number;
  type_meta: Record<string, TypeMetaConfig>;
  nodes: GraphDataNode[];
  edges: GraphDataEdge[];
}

interface LegalNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: string;
  r: number;
  info: string;
  colorHex: string;
}

interface LegalEdge extends d3.SimulationLinkDatum<LegalNode> {
  source: string | LegalNode;
  target: string | LegalNode;
  relation: string;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  node: LegalNode | null;
}

export default function KnowledgeGraphSection() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simRef = useRef<d3.Simulation<LegalNode, LegalEdge> | null>(null);
  
  const [data, setData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, node: null });
  const [dims, setDims] = useState({ w: 960, h: 580 });

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // GET /graph/demo?id=d7_k7_c
        const res = await apiClient.get<GraphData>("/graph/demo?id=d7_k7_c");
        if (res && res.nodes && res.edges) {
          setData(res);
        } else {
            // Some fallback empty
            setData({
                status: "error", seed_id: "", query: "", total_nodes: 0, total_edges: 0,
                type_meta: {}, nodes: [], edges: []
            });
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch graph data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Resize observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      setDims({ w, h: Math.min(640, Math.max(420, w * 0.6)) });
    });
    ro.observe(el);
    setDims({ w: el.offsetWidth, h: Math.min(640, Math.max(420, el.offsetWidth * 0.6)) });
    return () => ro.disconnect();
  }, []);

  // D3 Visualization
  useEffect(() => {
    if (!svgRef.current || dims.w === 0 || !data) return;
    if (data.nodes.length === 0) return;

    const { w, h } = dims;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const defs = svg.append("defs");

    // Glow filter
    const f = defs.append("filter").attr("id", "glow").attr("x", "-60%").attr("y", "-60%").attr("width", "220%").attr("height", "220%");
    f.append("feGaussianBlur").attr("stdDeviation", "5").attr("result", "blur");
    const fm = f.append("feMerge");
    fm.append("feMergeNode").attr("in", "blur");
    fm.append("feMergeNode").attr("in", "SourceGraphic");

    // Arrow marker
    defs.append("marker")
      .attr("id", "arr")
      .attr("viewBox", "0 0 8 8")
      .attr("refX", 8).attr("refY", 4)
      .attr("markerWidth", 4).attr("markerHeight", 4)
      .attr("orient", "auto-start-reverse")
      .append("path")
      .attr("d", "M0,0 L8,4 L0,8 Z")
      .attr("fill", "rgba(0,212,180,0.35)");

    const g = svg.append("g");

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.35, 3])
      .on("zoom", (ev) => g.attr("transform", ev.transform));
    svg.call(zoom);

    // Map API nodes to D3 LegalNodes
    const nodes: LegalNode[] = data.nodes.map((n) => {
        const hColor = data.type_meta[n.type]?.color || "#64748b";
        return {
            id: n.id,
            label: n.label.length > 20 ? n.label.substring(0, 20) + "..." : n.label, // limit label length
            type: n.type,
            r: n.type === "Entity" ? 10 : 14, // dynamically set radius based on some logic if needed
            info: n.description,
            colorHex: hColor
        };
    });

    // Determine target size for collisions
    const edges: LegalEdge[] = data.edges.map((e) => ({
        source: e.source,
        target: e.target,
        relation: e.relation
    }));

    const sim = d3.forceSimulation<LegalNode>(nodes)
      .force("link", d3.forceLink<LegalNode, LegalEdge>(edges)
        .id((d) => d.id)
        .distance((e) => ((e.source as LegalNode).r + (e.target as LegalNode).r) * 3.5)
        .strength(0.35))
      .force("charge", d3.forceManyBody().strength(-280))
      .force("center", d3.forceCenter(w / 2, h / 2).strength(0.07))
      .force("collision", d3.forceCollide<LegalNode>().radius((d) => d.r + 16))
      .alphaDecay(0.016)
      .velocityDecay(0.38);

    simRef.current = sim;

    const link = g.append("g").selectAll<SVGLineElement, LegalEdge>("line")
      .data(edges).join("line")
      .attr("stroke", "rgba(0,212,180,0.1)")
      .attr("stroke-width", 0.7)
      .attr("marker-end", "url(#arr)");

    const node = g.append("g").selectAll<SVGGElement, LegalNode>("g")
      .data(nodes).join("g")
      .attr("cursor", "pointer")
      .call(
        d3.drag<SVGGElement, LegalNode>()
          .on("start", (ev, d) => { if (!ev.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
          .on("drag",  (ev, d) => { d.fx = ev.x; d.fy = ev.y; })
          .on("end",   (ev, d) => { if (!ev.active) sim.alphaTarget(0); d.fx = null; d.fy = null; })
      );

    // Glow ring
    node.append("circle")
      .attr("r", (d) => d.r + 8)
      .attr("fill", (d) => d.colorHex)
      .attr("opacity", 0.28)
      .attr("filter", "url(#glow)");

    // Main circle
    node.append("circle")
      .attr("r", (d) => d.r)
      .attr("fill", (d) => d.colorHex + "bb")
      .attr("stroke", (d) => d.colorHex)
      .attr("stroke-width", 0.8);

    // Label
    node.append("text")
      .text((d) => d.label)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("font-size", (d) => Math.max(7.5, d.r * 0.5))
      .attr("font-weight", "600")
      .attr("font-family", "'JetBrains Mono', monospace")
      .attr("fill", "#f8fafc")
      .attr("pointer-events", "none");

    node
      .on("mouseenter", function (event, d) {
        const connected = new Set<string>([d.id]);
        edges.forEach((e) => {
          const s = (e.source as LegalNode).id;
          const t = (e.target as LegalNode).id;
          if (s === d.id) connected.add(t);
          if (t === d.id) connected.add(s);
        });

        link
          .attr("stroke", (e) => {
            const s = (e.source as LegalNode).id;
            const t = (e.target as LegalNode).id;
            return s === d.id || t === d.id ? "rgba(0,212,180,0.65)" : "rgba(0,212,180,0.03)";
          })
          .attr("stroke-width", (e) => {
            const s = (e.source as LegalNode).id;
            const t = (e.target as LegalNode).id;
            return s === d.id || t === d.id ? 1.5 : 0.4;
          });

        node.selectAll<SVGCircleElement, LegalNode>("circle:nth-child(2)")
          .attr("fill", (n) => connected.has(n.id) ? n.colorHex : n.colorHex + "22");

        const rect = svgRef.current!.getBoundingClientRect();
        setTooltip({
          visible: true,
          x: Math.min(event.clientX - rect.left + 14, dims.w - 235),
          y: Math.max(event.clientY - rect.top - 12, 8),
          node: d,
        });
      })
      .on("mouseleave", () => {
        link.attr("stroke", "rgba(0,212,180,0.1)").attr("stroke-width", 0.7);
        node.selectAll<SVGCircleElement, LegalNode>("circle:nth-child(2)")
          .attr("fill", (d) => d.colorHex + "bb");
        setTooltip((s) => ({ ...s, visible: false }));
      });

    sim.on("tick", () => {
      link
        .attr("x1", (e) => (e.source as LegalNode).x ?? 0)
        .attr("y1", (e) => (e.source as LegalNode).y ?? 0)
        .attr("x2", (e) => {
          const s = e.source as LegalNode, t = e.target as LegalNode;
          const dx = (t.x ?? 0) - (s.x ?? 0), dy = (t.y ?? 0) - (s.y ?? 0);
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          return (t.x ?? 0) - (dx / len) * (t.r + 5);
        })
        .attr("y2", (e) => {
          const s = e.source as LegalNode, t = e.target as LegalNode;
          const dx = (t.x ?? 0) - (s.x ?? 0), dy = (t.y ?? 0) - (s.y ?? 0);
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          return (t.y ?? 0) - (dy / len) * (t.r + 5);
        });

      node.attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    const interval = setInterval(() => {
      simRef.current?.alpha(0.06).restart();
    }, 14000);

    const onVis = () => { if (document.hidden) sim.stop(); else sim.restart(); };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      sim.stop();
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [dims, data]);

  return (
    <section style={{ background: "transparent", padding: "100px 24px 80px", position: "relative", zIndex: 10 }}>
      <div style={{ textAlign: "center", marginBottom: "52px" }}>
        <span style={{
          display: "inline-block", fontSize: "10px", letterSpacing: "0.2em",
          color: "#00d4b4", textTransform: "uppercase",
          fontFamily: "'JetBrains Mono',monospace", marginBottom: "18px",
          border: "1px solid rgba(0,212,180,0.25)", borderRadius: "99px", padding: "4px 14px",
        }}>
          Knowledge Graph
        </span>
        <h2 style={{
          fontSize: "clamp(26px,3.5vw,42px)", fontWeight: 800, color: "#f1f5f9",
          margin: "0 0 16px", lineHeight: 1.15, letterSpacing: "-0.025em",
        }}>
          Each answer has{" "}
          <span style={{ color: "#00d4b4" }}>an original solution</span>
          <br />clearly detailed down to every point.
        </h2>
        <p style={{
          color: "#475569", fontSize: "14px", maxWidth: "480px",
          margin: "0 auto", lineHeight: 1.75, fontFamily: "system-ui,sans-serif",
        }}>
          Hover to view details · Drag to move the node · Scroll to zoom
        </p>
      </div>

      <div ref={containerRef} style={{
        position: "relative", maxWidth: "1040px", margin: "0 auto",
        borderRadius: "20px", border: "1px solid rgba(0,212,180,0.1)",
        background: "rgba(0,212,180,0.015)", overflow: "hidden", minHeight: "420px"
      }}>
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center text-[#00d4b4] font-mono text-sm animate-pulse">
            Đang tải dữ liệu đồ thị...
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center text-red-400 font-mono text-sm">
            Lỗi tải dữ liệu: {error}
          </div>
        ) : (
          <svg ref={svgRef} style={{ display: "block", width: "100%", height: dims.h }} />
        )}

        {tooltip.visible && tooltip.node && (
          <div style={{
            position: "absolute", left: tooltip.x, top: tooltip.y,
            background: "rgba(5,8,16,0.97)",
            border: `1px solid ${tooltip.node.colorHex}44`,
            borderRadius: "10px", padding: "10px 14px",
            pointerEvents: "none", maxWidth: "220px", zIndex: 20,
            fontFamily: "system-ui,sans-serif",
          }}>
            <div style={{
              display: "inline-block", fontSize: "9px", letterSpacing: "0.12em",
              textTransform: "uppercase", color: tooltip.node.colorHex,
              fontFamily: "'JetBrains Mono',monospace", marginBottom: "5px",
              border: `1px solid ${tooltip.node.colorHex}44`,
              borderRadius: "4px", padding: "2px 7px",
            }}>
              {tooltip.node.type}
            </div>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#f1f5f9", marginBottom: "4px", lineHeight: 1.35 }}>
              {tooltip.node.label}
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", lineHeight: 1.55 }}>
              {tooltip.node.info}
            </div>
          </div>
        )}

        {data && data.nodes && data.nodes.length > 0 && (
          <div style={{
            position: "absolute", top: 14, left: 16, fontSize: "9px",
            letterSpacing: "0.14em", color: "rgba(0,212,180,0.5)",
            fontFamily: "'JetBrains Mono',monospace", pointerEvents: "none",
          }}>
            LEXMIND · {data.nodes.length} NODES · {data.edges.length} EDGES
          </div>
        )}
        <div style={{
          position: "absolute", bottom: 14, right: 16, fontSize: "9px",
          letterSpacing: "0.1em", color: "rgba(100,116,139,0.5)",
          fontFamily: "'JetBrains Mono',monospace", pointerEvents: "none",
        }}>
          SCROLL TO ZOOM · DRAG TO PAN
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "clamp(24px,5vw,64px)", marginTop: "60px", flexWrap: "wrap" }}>
        {[
          { v: "2,300+", l: "Legal nodes" },
          { v: "4,800+", l: "Relationships" },
          { v: "99%",   l: "Citations the latest enacted law" },
          { v: "<200ms", l: "Graph query" },
        ].map((s) => (
          <div key={s.l} style={{ textAlign: "center" }}>
            <div style={{
              fontSize: "clamp(24px,3vw,34px)", fontWeight: 800, color: "#00d4b4",
              lineHeight: 1, fontFamily: "'JetBrains Mono',monospace", letterSpacing: "-0.02em",
            }}>{s.v}</div>
            <div style={{
              fontSize: "11px", color: "#334155", marginTop: "6px",
              letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "system-ui,sans-serif",
            }}>{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
