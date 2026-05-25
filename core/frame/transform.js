export function toRadians(deg = 0) {
  return (Number(deg) || 0) * (Math.PI / 180);
}

export function makeLocalMatrix(node) {
  const x = Number(node?.x || 0);
  const y = Number(node?.y || 0);
  const r = toRadians(node?.rotation || 0);
  const sx = Number(node?.scaleX ?? 1) || 1;
  const sy = Number(node?.scaleY ?? 1) || 1;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return [c * sx, s * sx, -s * sy, c * sy, x, y];
}

export function multiplyMatrices(a, b) {
  return [
    a[0] * b[0] + a[2] * b[1],
    a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3],
    a[1] * b[2] + a[3] * b[3],
    a[0] * b[4] + a[2] * b[5] + a[4],
    a[1] * b[4] + a[3] * b[5] + a[5]
  ];
}

export function invertMatrix(m) {
  const det = m[0] * m[3] - m[1] * m[2];
  if (!det) return null;
  const invDet = 1 / det;
  const a = m[3] * invDet;
  const b = -m[1] * invDet;
  const c = -m[2] * invDet;
  const d = m[0] * invDet;
  const e = -(a * m[4] + c * m[5]);
  const f = -(b * m[4] + d * m[5]);
  return [a, b, c, d, e, f];
}

export function applyMatrix(point, m) {
  return {
    x: m[0] * point.x + m[2] * point.y + m[4],
    y: m[1] * point.x + m[3] * point.y + m[5]
  };
}

export function computeWorldMatrix(node, nodesById) {
  let matrix = makeLocalMatrix(node);
  let parentId = node?.parentId || null;
  while (parentId) {
    const parent = nodesById[parentId];
    if (!parent) break;
    matrix = multiplyMatrices(makeLocalMatrix(parent), matrix);
    parentId = parent.parentId || null;
  }
  return matrix;
}

export function toWorld(localPoint, node, nodesById) {
  const m = computeWorldMatrix(node, nodesById);
  return applyMatrix(localPoint, m);
}

export function toLocal(worldPoint, node, nodesById) {
  const m = computeWorldMatrix(node, nodesById);
  const inv = invertMatrix(m);
  if (!inv) return { x: worldPoint.x, y: worldPoint.y };
  return applyMatrix(worldPoint, inv);
}
