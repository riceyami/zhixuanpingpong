'use client';

import React, { useMemo } from 'react';

interface LandingPoint {
  x: number;
  y: number;
}

interface TableCourtProps {
  landingPoints: LandingPoint[];
  width?: number;
  height?: number;
}

const COURT_ASPECT_RATIO = 274 / 152.5;

function computeDensity(points: LandingPoint[], courtW: number, courtH: number): number[] {
  const gridSize = 20;
  const cols = Math.ceil(courtW / gridSize);
  const rows = Math.ceil(courtH / gridSize);
  const grid = new Array(cols * rows).fill(0);

  for (const p of points) {
    const col = Math.min(Math.floor(p.x / gridSize), cols - 1);
    const row = Math.min(Math.floor(p.y / gridSize), rows - 1);
    grid[row * cols + col]++;
  }

  const maxCount = Math.max(...grid, 1);
  return points.map((p) => {
    const col = Math.min(Math.floor(p.x / gridSize), cols - 1);
    const row = Math.min(Math.floor(p.y / gridSize), rows - 1);
    return grid[row * cols + col] / maxCount;
  });
}

function getPointColor(density: number): string {
  if (density > 0.75) return '#ef4444';
  if (density > 0.5) return '#f97316';
  if (density > 0.25) return '#eab308';
  return '#3b82f6';
}

const TableCourt: React.FC<TableCourtProps> = ({
  landingPoints = [],
  width = 500,
  height = width / COURT_ASPECT_RATIO,
}) => {
  const courtW = width * 0.85;
  const courtH = height * 0.9;
  const offsetX = (width - courtW) / 2;
  const offsetY = (height - courtH) / 2;

  if (landingPoints.length === 0) {
    return (
      <div className="flex items-center justify-center text-gray-400" style={{ width, height }}>
        暂无落点数据
      </div>
    );
  }

  const maxX = useMemo(() => Math.max(...landingPoints.map((p) => p.x), 1), [landingPoints]);
  const maxY = useMemo(() => Math.max(...landingPoints.map((p) => p.y), 1), [landingPoints]);

  const densities = useMemo(() => computeDensity(landingPoints, courtW, courtH), [landingPoints, courtW, courtH]);

  const scaleX = (x: number) => offsetX + (x / maxX) * courtW;
  const scaleY = (y: number) => offsetY + (y / maxY) * courtH;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="bg-gray-50 rounded-lg shadow-inner">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="1" stdDeviation="2" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* 球台背景 */}
      <rect
        x={offsetX}
        y={offsetY}
        width={courtW}
        height={courtH}
        fill="#1a6b3c"
        rx={6}
        ry={6}
      />

      {/* 球台外边框 */}
      <rect
        x={offsetX}
        y={offsetY}
        width={courtW}
        height={courtH}
        fill="none"
        stroke="white"
        strokeWidth={2.5}
        rx={6}
        ry={6}
      />

      {/* 球台底线 - 顶部 */}
      <line
        x1={offsetX}
        y1={offsetY + 6}
        x2={offsetX + courtW}
        y2={offsetY + 6}
        stroke="white"
        strokeWidth={1.5}
      />

      {/* 球台底线 - 底部 */}
      <line
        x1={offsetX}
        y1={offsetY + courtH - 6}
        x2={offsetX + courtW}
        y2={offsetY + courtH - 6}
        stroke="white"
        strokeWidth={1.5}
      />

      {/* 中线（白色虚线）- 纵向半区 */}
      <line
        x1={offsetX + courtW / 2}
        y1={offsetY + 6}
        x2={offsetX + courtW / 2}
        y2={offsetY + courtH - 6}
        stroke="white"
        strokeWidth={1.5}
        strokeDasharray="6,4"
      />

      {/* 球网 */}
      <line
        x1={offsetX}
        y1={offsetY + courtH / 2}
        x2={offsetX + courtW}
        y2={offsetY + courtH / 2}
        stroke="white"
        strokeWidth={4}
        strokeLinecap="round"
      />
      <line
        x1={offsetX}
        y1={offsetY + courtH / 2}
        x2={offsetX + courtW}
        y2={offsetY + courtH / 2}
        stroke="#94a3b8"
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray="4,3"
      />

      {/* 落点 - 方案A：直接绘制散点，通过密度着色 */}
      {landingPoints.map((point, index) => {
        const cx = scaleX(point.x);
        const cy = scaleY(point.y);
        const density = densities[index];
        const color = getPointColor(density);
        const r = Math.max(4, 7 - density * 2);

        return (
          <g key={index} filter="url(#shadow)">
            <circle cx={cx} cy={cy} r={r + 1.5} fill="white" opacity={0.6} />
            <circle cx={cx} cy={cy} r={r} fill={color} opacity={0.85} />
          </g>
        );
      })}

      {/* 图例 */}
      <g transform={`translate(${width - 110}, 12)`}>
        <rect x={0} y={0} width={100} height={80} rx={6} fill="white" fillOpacity={0.9} stroke="#e5e7eb" strokeWidth={1} />
        <text x={10} y={18} fontSize={10} fill="#6b7280" fontWeight={600}>落点密度</text>
        {[
          { color: '#ef4444', label: '密集', y: 34 },
          { color: '#f97316', label: '较多', y: 48 },
          { color: '#eab308', label: '适中', y: 62 },
          { color: '#3b82f6', label: '较少', y: 76 },
        ].map((item) => (
          <g key={item.label}>
            <circle cx={16} cy={item.y - 3} r={4} fill={item.color} opacity={0.85} />
            <text x={26} y={item.y} fontSize={10} fill="#6b7280">{item.label}</text>
          </g>
        ))}
      </g>

      {/* 统计信息 */}
      <text x={offsetX} y={height - 8} fontSize={11} fill="#9ca3af">
        落点总数: {landingPoints.length}
      </text>
    </svg>
  );
};

export default TableCourt;
