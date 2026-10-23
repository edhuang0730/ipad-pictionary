import { FillRect, Point, Stroke } from '../types/game';

export const FLOOD_GRID_W = 240;
export const FLOOD_GRID_H = 180;

/**
 * Rasterizes existing canvas strokes onto a 240x180 virtual grid and runs a
 * 4-connected scanline/BFS flood fill from `seed`.
 * Returns an array of vertically-merged normalized FillRects, or null if the
 * seed pixel already has `fillColor`.
 */
export function computeFloodFillRects(
  strokes: Stroke[],
  seed: Point,
  fillColor: string
): FillRect[] | null {
  const W = FLOOD_GRID_W;
  const H = FLOOD_GRID_H;
  const totalCells = W * H;

  // Color table: 0 is always '#FFFFFF' (canvas background)
  const colorToId = new Map<string, number>();
  colorToId.set('#FFFFFF', 0);
  let nextColorId = 1;

  const getColorId = (hex: string): number => {
    const norm = hex.trim().toUpperCase();
    let id = colorToId.get(norm);
    if (id === undefined) {
      id = nextColorId++;
      colorToId.set(norm, id);
    }
    return id;
  };

  const grid = new Uint16Array(totalCells); // Initialized to 0 (#FFFFFF)

  // Replay all existing strokes in chronological order
  for (const stroke of strokes) {
    const hex = stroke.isEraser ? '#FFFFFF' : stroke.color;
    const colorId = getColorId(hex);

    if (stroke.isFill && stroke.fillRects) {
      for (const r of stroke.fillRects) {
        const x0 = Math.max(0, Math.min(W, Math.round(r.x * W)));
        const y0 = Math.max(0, Math.min(H, Math.round(r.y * H)));
        const x1 = Math.max(0, Math.min(W, Math.round((r.x + r.w) * W)));
        const y1 = Math.max(0, Math.min(H, Math.round((r.y + r.h) * H)));
        for (let y = y0; y < y1; y++) {
          const rowOffset = y * W;
          for (let x = x0; x < x1; x++) {
            grid[rowOffset + x] = colorId;
          }
        }
      }
      continue;
    }

    const pts = stroke.points;
    if (!pts || pts.length === 0) continue;

    // Visual half-width in grid cells; keep >= 0.78 so diagonal lines are 100% 4-connected watertight
    const visualHalfW = ((stroke.width || 0.008) * W) / 2;
    const radius = Math.max(0.78, visualHalfW * 0.8);

    if (pts.length === 1) {
      stampDisc(grid, W, H, pts[0].x * W, pts[0].y * H, Math.max(0.9, visualHalfW), colorId);
    } else if (pts.length === 2) {
      rasterizeLineSegment(
        grid,
        W,
        H,
        pts[0].x * W,
        pts[0].y * H,
        pts[1].x * W,
        pts[1].y * H,
        radius,
        colorId
      );
    } else {
      // Match the quadratic curve path used by DrawingCanvas & phoneClientHtml
      let prevX = pts[0].x * W;
      let prevY = pts[0].y * H;

      for (let i = 1; i < pts.length - 1; i++) {
        const cx = pts[i].x * W;
        const cy = pts[i].y * H;
        const midX = ((pts[i].x + pts[i + 1].x) / 2) * W;
        const midY = ((pts[i].y + pts[i + 1].y) / 2) * H;
        rasterizeQuadraticCurve(
          grid,
          W,
          H,
          prevX,
          prevY,
          cx,
          cy,
          midX,
          midY,
          radius,
          colorId
        );
        prevX = midX;
        prevY = midY;
      }

      const last = pts[pts.length - 1];
      rasterizeLineSegment(
        grid,
        W,
        H,
        prevX,
        prevY,
        last.x * W,
        last.y * H,
        radius,
        colorId
      );
    }
  }

  const fillColorId = getColorId(fillColor);
  const sx = Math.max(0, Math.min(W - 1, Math.floor(seed.x * W)));
  const sy = Math.max(0, Math.min(H - 1, Math.floor(seed.y * H)));
  const startIdx = sy * W + sx;
  const targetColorId = grid[startIdx];

  if (targetColorId === fillColorId) {
    return null;
  }

  // 4-connected BFS flood fill
  const visited = new Uint8Array(totalCells);
  const queue = new Int32Array(totalCells);
  let head = 0;
  let tail = 0;

  visited[startIdx] = 1;
  queue[tail++] = startIdx;

  while (head < tail) {
    const idx = queue[head++];
    const x = idx % W;
    const y = (idx - x) / W;

    // Left
    if (x > 0) {
      const nIdx = idx - 1;
      if (visited[nIdx] === 0 && grid[nIdx] === targetColorId) {
        visited[nIdx] = 1;
        queue[tail++] = nIdx;
      }
    }
    // Right
    if (x + 1 < W) {
      const nIdx = idx + 1;
      if (visited[nIdx] === 0 && grid[nIdx] === targetColorId) {
        visited[nIdx] = 1;
        queue[tail++] = nIdx;
      }
    }
    // Up
    if (y > 0) {
      const nIdx = idx - W;
      if (visited[nIdx] === 0 && grid[nIdx] === targetColorId) {
        visited[nIdx] = 1;
        queue[tail++] = nIdx;
      }
    }
    // Down
    if (y + 1 < H) {
      const nIdx = idx + W;
      if (visited[nIdx] === 0 && grid[nIdx] === targetColorId) {
        visited[nIdx] = 1;
        queue[tail++] = nIdx;
      }
    }
  }

  if (tail === 0) {
    return null;
  }

  // Fast path: entire canvas was filled
  if (tail === totalCells) {
    return [{ x: 0, y: 0, w: 1, h: 1 }];
  }

  // Extract horizontal spans per row and merge identical spans vertically
  // Key: `${x0}_${x1}` -> active rect { x0, x1, y0, y1 }
  let activeSpans = new Map<string, { x0: number; x1: number; y0: number; y1: number }>();
  const finishedRects: { x0: number; x1: number; y0: number; y1: number }[] = [];

  for (let y = 0; y < H; y++) {
    const rowOffset = y * W;
    const nextSpans = new Map<string, { x0: number; x1: number; y0: number; y1: number }>();

    let x = 0;
    while (x < W) {
      while (x < W && visited[rowOffset + x] === 0) {
        x++;
      }
      if (x >= W) break;
      const x0 = x;
      while (x < W && visited[rowOffset + x] !== 0) {
        x++;
      }
      const x1 = x;
      const key = `${x0}_${x1}`;
      const existing = activeSpans.get(key);
      if (existing) {
        existing.y1 = y + 1;
        nextSpans.set(key, existing);
        activeSpans.delete(key);
      } else {
        nextSpans.set(key, { x0, x1, y0: y, y1: y + 1 });
      }
    }

    for (const span of activeSpans.values()) {
      finishedRects.push(span);
    }
    activeSpans = nextSpans;
  }

  for (const span of activeSpans.values()) {
    finishedRects.push(span);
  }

  return finishedRects.map((r) => ({
    x: Math.round((r.x0 / W) * 10000) / 10000,
    y: Math.round((r.y0 / H) * 10000) / 10000,
    w: Math.round(((r.x1 - r.x0) / W) * 10000) / 10000,
    h: Math.round(((r.y1 - r.y0) / H) * 10000) / 10000,
  }));
}

/**
 * Converts normalized FillRects into a single SVG path string for crisp rendering.
 * Adds a tiny sub-pixel overlap (0.4px) between adjacent merged spans to prevent hairline seams.
 */
export function fillRectsToSvgPath(
  rects: FillRect[],
  width: number,
  height: number
): string {
  if (!rects || rects.length === 0) return '';
  const parts: string[] = [];
  for (let i = 0; i < rects.length; i++) {
    const r = rects[i];
    const x0 = Math.max(0, r.x * width - 0.25);
    const y0 = Math.max(0, r.y * height - 0.25);
    const x1 = Math.min(width, (r.x + r.w) * width + 0.25);
    const y1 = Math.min(height, (r.y + r.h) * height + 0.25);
    parts.push(
      `M${x0.toFixed(1)} ${y0.toFixed(1)}H${x1.toFixed(1)}V${y1.toFixed(
        1
      )}H${x0.toFixed(1)}Z`
    );
  }
  return parts.join('');
}

function stampDisc(
  grid: Uint16Array,
  W: number,
  H: number,
  cx: number,
  cy: number,
  r: number,
  colorId: number
): void {
  const minX = Math.max(0, Math.floor(cx - r));
  const maxX = Math.min(W - 1, Math.floor(cx + r));
  const minY = Math.max(0, Math.floor(cy - r));
  const maxY = Math.min(H - 1, Math.floor(cy + r));
  const rSq = r * r;

  for (let y = minY; y <= maxY; y++) {
    const dy = y + 0.5 - cy;
    const dySq = dy * dy;
    const rowOffset = y * W;
    for (let x = minX; x <= maxX; x++) {
      const dx = x + 0.5 - cx;
      if (dx * dx + dySq <= rSq) {
        grid[rowOffset + x] = colorId;
      }
    }
  }
}

function rasterizeLineSegment(
  grid: Uint16Array,
  W: number,
  H: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  r: number,
  colorId: number
): void {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const dist = Math.hypot(dx, dy);
  const steps = Math.max(1, Math.ceil(dist * 3));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    stampDisc(grid, W, H, x0 + dx * t, y0 + dy * t, r, colorId);
  }
}

function rasterizeQuadraticCurve(
  grid: Uint16Array,
  W: number,
  H: number,
  x0: number,
  y0: number,
  cx: number,
  cy: number,
  x1: number,
  y1: number,
  r: number,
  colorId: number
): void {
  const approxLen = Math.hypot(cx - x0, cy - y0) + Math.hypot(x1 - cx, y1 - cy);
  const steps = Math.max(2, Math.ceil(approxLen * 3));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const inv = 1 - t;
    const x = inv * inv * x0 + 2 * inv * t * cx + t * t * x1;
    const y = inv * inv * y0 + 2 * inv * t * cy + t * t * y1;
    stampDisc(grid, W, H, x, y, r, colorId);
  }
}
