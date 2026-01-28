import { useMemo, useState } from 'react';
import type { Project, WorktreeWithBranches, Branch } from '../../types';

// Layout constants
const WT_W = 200;
const WT_H = 56;
const BR_W = 180;
const BR_H = 40;
const WT_GAP = 100;
const BR_GAP = 50;
const H_GAP = 120;
const L_MARGIN = 80;
const T_MARGIN = 40;

// Color palette per worktree
const COLORS = [
  { accent: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.3)' },
  { accent: '#8b5cf6', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.3)' },
  { accent: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.3)' },
  { accent: '#0ea5e9', bg: 'rgba(14,165,233,0.08)', border: 'rgba(14,165,233,0.3)' },
  { accent: '#f43f5e', bg: 'rgba(244,63,94,0.08)', border: 'rgba(244,63,94,0.3)' },
];

interface LayoutBranch extends Branch {
  x: number;
  y: number;
  connectorPath: string;
}

interface LayoutWorktree {
  id: string;
  name: string;
  x: number;
  y: number;
  branches: LayoutBranch[];
}

interface LayoutResult {
  worktrees: LayoutWorktree[];
  connectors: { x: number; y1: number; y2: number }[];
  totalWidth: number;
  totalHeight: number;
}

function computeLayout(worktrees: WorktreeWithBranches[]): LayoutResult {
  const worktreeNodes: LayoutWorktree[] = [];
  const connectors: { x: number; y1: number; y2: number }[] = [];
  let maxRightX = 0;
  let maxBottomY = 0;

  for (let i = 0; i < worktrees.length; i++) {
    const wt = worktrees[i];
    const wtX = L_MARGIN;
    const wtY = T_MARGIN + i * (WT_H + WT_GAP);
    const wtCenterY = wtY + WT_H / 2;

    const branchCount = wt.branches.length;
    const totalBranchHeight = (branchCount - 1) * BR_GAP;
    const branchStartY = wtCenterY - totalBranchHeight / 2 - BR_H / 2;
    const branchX = wtX + WT_W + H_GAP;

    const branches: LayoutBranch[] = wt.branches.map((br, j) => {
      const brY = branchStartY + j * BR_GAP;
      const brCenterY = brY + BR_H / 2;

      const startX = wtX + WT_W;
      const startY = wtCenterY;
      const endX = branchX;
      const endY = brCenterY;
      const cpX = startX + (endX - startX) / 2;
      const connectorPath = `M${startX},${startY} C${cpX},${startY} ${cpX},${endY} ${endX},${endY}`;

      maxBottomY = Math.max(maxBottomY, brY + BR_H);

      return { ...br, x: branchX, y: brY, connectorPath };
    });

    maxRightX = Math.max(maxRightX, branchX + BR_W);
    maxBottomY = Math.max(maxBottomY, wtY + WT_H);

    worktreeNodes.push({ id: wt.id, name: wt.name, x: wtX, y: wtY, branches });

    if (i < worktrees.length - 1) {
      const nextWtY = T_MARGIN + (i + 1) * (WT_H + WT_GAP);
      connectors.push({
        x: wtX + WT_W / 2,
        y1: wtY + WT_H,
        y2: nextWtY,
      });
    }
  }

  return {
    worktrees: worktreeNodes,
    connectors,
    totalWidth: maxRightX + L_MARGIN,
    totalHeight: maxBottomY + T_MARGIN,
  };
}

interface RepoMindmapProps {
  project: Project;
  worktrees: WorktreeWithBranches[];
  onBranchClick: (projectId: string, worktreeId: string, branchName: string) => void;
}

export function RepoMindmap({ project, worktrees, onBranchClick }: RepoMindmapProps) {
  const layout = useMemo(() => computeLayout(worktrees), [worktrees]);
  const [hoveredBranch, setHoveredBranch] = useState<string | null>(null);

  const iconBg = project.icon.backgroundColor || '#3b82f6';
  const iconContent =
    project.icon.type === 'emoji'
      ? project.icon.value
      : project.icon.value.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span
          className="w-6 h-6 rounded flex items-center justify-center text-xs font-medium shrink-0"
          style={{ backgroundColor: iconBg, color: '#fff' }}
        >
          {iconContent}
        </span>
        <h2 className="text-lg font-semibold text-foreground">{project.name}</h2>
      </div>

      {/* SVG Canvas */}
      <div className="flex-1 overflow-auto rounded-xl border border-border bg-[#0a0e1a]/60">
        <svg
          width={layout.totalWidth}
          height={layout.totalHeight}
          className="min-w-full min-h-full"
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="6"
              refX="8"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L8,3 L0,6 Z" fill="#4b5563" />
            </marker>
          </defs>

          {/* Vertical connectors between worktrees */}
          {layout.connectors.map((conn, i) => (
            <line
              key={`vc-${i}`}
              x1={conn.x}
              y1={conn.y1}
              x2={conn.x}
              y2={conn.y2}
              stroke="#2d3548"
              strokeWidth={2}
              strokeDasharray="6 4"
            />
          ))}

          {/* Worktrees and branches */}
          {layout.worktrees.map((wt, wtIdx) => {
            const color = COLORS[wtIdx % COLORS.length];

            return (
              <g key={wt.id}>
                {/* Worktree node */}
                <rect
                  x={wt.x}
                  y={wt.y}
                  width={WT_W}
                  height={WT_H}
                  rx={12}
                  fill="#141a2a"
                  stroke={color.border}
                  strokeWidth={1.5}
                />
                <text
                  x={wt.x + WT_W / 2}
                  y={wt.y + WT_H / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#e2e8f0"
                  fontSize={14}
                  fontWeight={600}
                  fontFamily="inherit"
                >
                  /{wt.name}
                </text>

                {/* Branches */}
                {wt.branches.map((br) => {
                  const brKey = `${wt.id}-${br.name}`;
                  const isHovered = hoveredBranch === brKey;

                  return (
                    <g
                      key={br.name}
                      onClick={() => onBranchClick(project.id, wt.id, br.name)}
                      onMouseEnter={() => setHoveredBranch(brKey)}
                      onMouseLeave={() => setHoveredBranch(null)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Bezier connector */}
                      <path
                        d={br.connectorPath}
                        fill="none"
                        stroke={color.accent}
                        strokeWidth={1.5}
                        strokeOpacity={isHovered ? 0.7 : 0.3}
                        markerEnd="url(#arrowhead)"
                        style={{ transition: 'stroke-opacity 150ms ease' }}
                      />

                      {/* Branch rect */}
                      <rect
                        x={br.x}
                        y={br.y}
                        width={BR_W}
                        height={BR_H}
                        rx={8}
                        fill={isHovered ? color.bg : '#1a1f2e'}
                        stroke={isHovered ? color.accent : color.border}
                        strokeWidth={isHovered ? 1.5 : 1}
                        style={{ transition: 'all 150ms ease' }}
                      />

                      {/* Current branch indicator */}
                      {br.isCurrent && (
                        <circle
                          cx={br.x + 14}
                          cy={br.y + BR_H / 2}
                          r={3.5}
                          fill="#10b981"
                        />
                      )}

                      {/* Branch name */}
                      <text
                        x={br.x + (br.isCurrent ? 26 : 12)}
                        y={br.y + BR_H / 2}
                        dominantBaseline="central"
                        fill={isHovered ? '#f1f5f9' : '#cbd5e1'}
                        fontSize={12}
                        fontFamily="inherit"
                        style={{ transition: 'fill 150ms ease' }}
                      >
                        {br.name.length > 18 ? br.name.slice(0, 18) + '...' : br.name}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export default RepoMindmap;
