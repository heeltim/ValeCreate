import { getChildren, NODE_TYPE } from './sceneGraph.js';
import { toLocal } from './transform.js';

export function hitTest(scene, worldPoint, rootId = scene.rootId) {
  const root = scene.nodesById[rootId];
  if (!root) return null;
  return hitNode(scene, root, worldPoint);
}

function hitNode(scene, node, worldPoint) {
  if (!node.isVisible) return null;

  const local = toLocal(worldPoint, node, scene.nodesById);
  const inside = pointInRect(local, { x: 0, y: 0, w: node.w, h: node.h });

  if (node.type === NODE_TYPE.FRAME && node.clipContent && !inside) return null;

  const children = getChildren(scene, node.id).slice().sort((a, b) => b.zOrder - a.zOrder);
  for (const child of children) {
    const adjustedPoint = child.parentId === node.id && node.type === NODE_TYPE.FRAME && node.scroll?.isScrollable
      ? {
          x: worldPoint.x + node.scroll.scrollX,
          y: worldPoint.y + node.scroll.scrollY
        }
      : worldPoint;
    const hit = hitNode(scene, child, adjustedPoint);
    if (hit) return hit;
  }

  if (inside) return node;
  return null;
}

function pointInRect(p, r) {
  return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
}
