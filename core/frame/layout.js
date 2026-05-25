import { getChildren } from './sceneGraph.js';

export function computeFrameContentBounds(scene, frame) {
  const children = getChildren(scene, frame.id);
  if (!children.length) {
    frame.contentBounds = { x: 0, y: 0, w: 0, h: 0 };
    return frame.contentBounds;
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const child of children) {
    minX = Math.min(minX, child.x);
    minY = Math.min(minY, child.y);
    maxX = Math.max(maxX, child.x + child.w);
    maxY = Math.max(maxY, child.y + child.h);
  }
  frame.contentBounds = { x: minX, y: minY, w: Math.max(0, maxX - minX), h: Math.max(0, maxY - minY) };
  return frame.contentBounds;
}

export function clampFrameScroll(frame) {
  const content = frame.contentBounds || { w: 0, h: 0 };
  const maxX = Math.max(0, content.w - frame.w);
  const maxY = Math.max(0, content.h - frame.h);
  frame.scroll.scrollX = clamp(frame.scroll.scrollX || 0, 0, maxX);
  frame.scroll.scrollY = clamp(frame.scroll.scrollY || 0, 0, maxY);
  return frame.scroll;
}

export function applyConstraintsOnFrameResize(scene, frame, prevSize, nextSize) {
  const children = getChildren(scene, frame.id);
  const sx = prevSize.w > 0 ? nextSize.w / prevSize.w : 1;
  const sy = prevSize.h > 0 ? nextSize.h / prevSize.h : 1;

  for (const child of children) {
    const h = child.constraints?.horizontal || 'LEFT';
    const v = child.constraints?.vertical || 'TOP';

    const left = child.x;
    const right = prevSize.w - (child.x + child.w);
    const top = child.y;
    const bottom = prevSize.h - (child.y + child.h);

    if (h === 'RIGHT') child.x = Math.max(0, nextSize.w - right - child.w);
    else if (h === 'LEFT_RIGHT') child.w = Math.max(0, nextSize.w - left - right);
    else if (h === 'CENTER') child.x = (nextSize.w - child.w) / 2;
    else if (h === 'SCALE') {
      child.x *= sx;
      child.w *= sx;
    }

    if (v === 'BOTTOM') child.y = Math.max(0, nextSize.h - bottom - child.h);
    else if (v === 'TOP_BOTTOM') child.h = Math.max(0, nextSize.h - top - bottom);
    else if (v === 'CENTER') child.y = (nextSize.h - child.h) / 2;
    else if (v === 'SCALE') {
      child.y *= sy;
      child.h *= sy;
    }
  }

  computeFrameContentBounds(scene, frame);
  clampFrameScroll(frame);
}

export function applyAutoLayout(scene, frame) {
  const mode = frame.layout?.mode || 'NONE';
  if (mode === 'NONE') return;
  const children = getChildren(scene, frame.id);
  const p = frame.layout.padding;
  const spacing = Number(frame.layout.itemSpacing || 0);

  let cursorX = p.left;
  let cursorY = p.top;

  if (mode === 'HORIZONTAL') {
    const innerW = Math.max(0, frame.w - p.left - p.right);
    const fill = children.filter((c) => c.sizing?.horizontal === 'FILL');
    const fixedW = children.reduce((acc, c) => acc + (c.sizing?.horizontal === 'FILL' ? 0 : c.w), 0);
    const spacingTotal = Math.max(0, children.length - 1) * spacing;
    const fillW = fill.length ? Math.max(0, (innerW - fixedW - spacingTotal) / fill.length) : 0;

    for (const child of children) {
      if (child.sizing?.horizontal === 'FILL') child.w = fillW;
      child.x = cursorX;
      child.y = alignCross(frame, child, 'y');
      cursorX += child.w + spacing;
    }
  } else if (mode === 'VERTICAL') {
    const innerH = Math.max(0, frame.h - p.top - p.bottom);
    const fill = children.filter((c) => c.sizing?.vertical === 'FILL');
    const fixedH = children.reduce((acc, c) => acc + (c.sizing?.vertical === 'FILL' ? 0 : c.h), 0);
    const spacingTotal = Math.max(0, children.length - 1) * spacing;
    const fillH = fill.length ? Math.max(0, (innerH - fixedH - spacingTotal) / fill.length) : 0;

    for (const child of children) {
      if (child.sizing?.vertical === 'FILL') child.h = fillH;
      child.y = cursorY;
      child.x = alignCross(frame, child, 'x');
      cursorY += child.h + spacing;
    }
  }

  computeFrameContentBounds(scene, frame);
  clampFrameScroll(frame);
}

function alignCross(frame, child, axis) {
  const align = frame.layout?.alignCross || 'START';
  const p = frame.layout.padding;
  if (axis === 'x') {
    const innerW = frame.w - p.left - p.right;
    if (align === 'CENTER') return p.left + (innerW - child.w) / 2;
    if (align === 'END') return frame.w - p.right - child.w;
    return p.left;
  }
  const innerH = frame.h - p.top - p.bottom;
  if (align === 'CENTER') return p.top + (innerH - child.h) / 2;
  if (align === 'END') return frame.h - p.bottom - child.h;
  return p.top;
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}
