import { getChildren, NODE_TYPE } from './sceneGraph.js';
import { applyAutoLayout, clampFrameScroll, computeFrameContentBounds } from './layout.js';

export function renderScene(ctx, scene, rootId = scene.rootId) {
  const root = scene.nodesById[rootId];
  if (!root) return;
  ctx.save();
  renderNode(ctx, scene, root);
  ctx.restore();
}

function renderNode(ctx, scene, node) {
  if (!node || !node.isVisible) return;

  ctx.save();
  ctx.translate(node.x, node.y);
  if (node.rotation) ctx.rotate((node.rotation * Math.PI) / 180);
  if ((node.scaleX ?? 1) !== 1 || (node.scaleY ?? 1) !== 1) ctx.scale(node.scaleX ?? 1, node.scaleY ?? 1);

  if (node.type === NODE_TYPE.FRAME) {
    applyAutoLayout(scene, node);
    computeFrameContentBounds(scene, node);
    clampFrameScroll(node);

    drawRect(ctx, 0, 0, node.w, node.h, node.background || '#fff', node.style?.stroke);
    const children = getChildren(scene, node.id);

    if (node.clipContent) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, node.w, node.h);
      ctx.clip();
      ctx.translate(-(node.scroll?.scrollX || 0), -(node.scroll?.scrollY || 0));
      children.forEach((child) => renderNode(ctx, scene, child));
      ctx.restore();
    } else {
      ctx.translate(-(node.scroll?.scrollX || 0), -(node.scroll?.scrollY || 0));
      children.forEach((child) => renderNode(ctx, scene, child));
    }
  } else if (node.type === NODE_TYPE.RECT) {
    drawRect(ctx, 0, 0, node.w, node.h, node.style?.fill || '#d9ddff', node.style?.stroke || '#6f7bfd');
  } else if (node.type === NODE_TYPE.TEXT) {
    drawText(ctx, node);
  }

  ctx.restore();
}

function drawRect(ctx, x, y, w, h, fill, stroke) {
  if (fill && fill !== 'transparent') {
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, Math.max(0, w - 1), Math.max(0, h - 1));
  }
}

function drawText(ctx, node) {
  ctx.fillStyle = node.style?.fill || '#111';
  ctx.font = `${node.style?.fontWeight || 500} ${node.style?.fontSize || 14}px ${node.style?.fontFamily || 'Arial'}`;
  ctx.textBaseline = 'top';
  ctx.fillText(node.style?.text || 'Text', 0, 0, node.w);
}
