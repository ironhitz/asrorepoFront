import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Agent } from '../types';

interface AgentGraphProps {
  agents: Agent[];
}

const AgentGraph: React.FC<AgentGraphProps> = ({ agents }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || agents.length === 0) return;

    const width = svgRef.current.clientWidth;
    const height = 400;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    svg.selectAll('*').remove();

    const nodes = agents.map(a => ({ ...a }));
    const links: any[] = [];

    // Create some mock links for visualization if none exist
    if (nodes.length > 1) {
      for (let i = 1; i < nodes.length; i++) {
        links.push({ source: nodes[0].id, target: nodes[i].id });
      }
    }

    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', '#3f3f46')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4');

    const node = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .enter().append('g')
      .call(d3.drag<any, any>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    node.append('circle')
      .attr('r', 24)
      .attr('fill', d => d.status === 'busy' ? '#FC6D26' : d.status === 'error' ? '#ef4444' : '#27272a')
      .attr('stroke', '#3f3f46')
      .attr('stroke-width', 2);

    node.append('text')
      .text(d => d.name.split(' ')[0])
      .attr('text-anchor', 'middle')
      .attr('dy', 4)
      .attr('fill', 'white')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold');

    node.append('text')
      .text(d => d.role)
      .attr('text-anchor', 'middle')
      .attr('dy', 40)
      .attr('fill', '#71717a')
      .attr('font-size', '10px');

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as any).x)
        .attr('y1', d => (d.source as any).y)
        .attr('x2', d => (d.target as any).x)
        .attr('y2', d => (d.target as any).y);

      node
        .attr('transform', d => `translate(${(d as any).x},${(d as any).y})`);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

  }, [agents]);

  return (
    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Live Orchestration Graph</h3>
          <p className="text-sm text-zinc-500 text-zinc-400">Real-time agent interactions and task flow</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gitlab-orange animate-pulse"></div>
            <span className="text-xs text-zinc-400">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-zinc-700"></div>
            <span className="text-xs text-zinc-400">Idle</span>
          </div>
        </div>
      </div>
      <svg ref={svgRef} className="w-full h-[400px]"></svg>
    </div>
  );
};

export default AgentGraph;
