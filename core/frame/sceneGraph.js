let _seq = 1;

export const NODE_TYPE = {
  FRAME: 'FRAME',
  RECT: 'RECT',
  TEXT: 'TEXT',
  GROUP: 'GROUP'
};

export function uid(prefix = 'n') {
  _seq += 1;
  return `${prefix}_${Date.now().toString(36)}_${_seq.toString(36)}`;
}

export function createNode(partial = {}) {
  return {
    id: partial.id || uid('node'),
    type: partial.type || NODE_TYPE.RECT,
    parentId: partial.parentId ?? null,
    x: Number(partial.x || 0),
    y: Number(partial.y || 0),
    w: Math.max(0, Number(partial.w ?? 100)),
    h: Math.max(0, Number(partial.h ?? 100)),
    rotation: Number(partial.rotation || 0),
    scaleX: Number(partial.scaleX ?? 1),
    scaleY: Number(partial.scaleY ?? 1),
    style: partial.style || {},
    isVisible: partial.isVisible !== false,
    isLocked: partial.isLocked === true,
    childrenIds: Array.isArray(partial.childrenIds) ? [...partial.childrenIds] : [],
    zOrder: Number(partial.zOrder || 0),
    constraints: partial.constraints || { horizontal: 'LEFT', vertical: 'TOP' }
  };
}

export function createFrameNode(partial = {}) {
  const base = createNode({ ...partial, type: NODE_TYPE.FRAME });
  return {
    ...base,
    clipContent: partial.clipContent !== false,
    background: partial.background || '#ffffff',
    scroll: {
      isScrollable: !!partial.scroll?.isScrollable,
      scrollX: Math.max(0, Number(partial.scroll?.scrollX || 0)),
      scrollY: Math.max(0, Number(partial.scroll?.scrollY || 0))
    },
    layout: {
      mode: partial.layout?.mode || 'NONE',
      padding: {
        top: Number(partial.layout?.padding?.top || 0),
        right: Number(partial.layout?.padding?.right || 0),
        bottom: Number(partial.layout?.padding?.bottom || 0),
        left: Number(partial.layout?.padding?.left || 0)
      },
      itemSpacing: Number(partial.layout?.itemSpacing || 0),
      alignPrimary: partial.layout?.alignPrimary || 'START',
      alignCross: partial.layout?.alignCross || 'START'
    },
    guides: partial.guides || [],
    grid: partial.grid || null,
    contentBounds: partial.contentBounds || { x: 0, y: 0, w: 0, h: 0 }
  };
}

export function createScene() {
  return {
    rootId: uid('root'),
    nodesById: {}
  };
}

export function initSceneRoot(scene) {
  const root = createFrameNode({
    id: scene.rootId,
    type: NODE_TYPE.FRAME,
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    clipContent: false,
    background: 'transparent'
  });
  scene.nodesById[root.id] = root;
  return root;
}

export function addNode(scene, node, parentId = scene.rootId) {
  scene.nodesById[node.id] = node;
  node.parentId = parentId;
  const parent = scene.nodesById[parentId];
  if (!parent.childrenIds.includes(node.id)) parent.childrenIds.push(node.id);
  normalizeZOrder(scene, parentId);
  return node;
}

export function removeNode(scene, nodeId) {
  const node = scene.nodesById[nodeId];
  if (!node) return;
  const parent = scene.nodesById[node.parentId];
  if (parent) parent.childrenIds = parent.childrenIds.filter((id) => id !== nodeId);
  (node.childrenIds || []).forEach((cid) => removeNode(scene, cid));
  delete scene.nodesById[nodeId];
}

export function getChildren(scene, nodeId) {
  const n = scene.nodesById[nodeId];
  if (!n) return [];
  return n.childrenIds
    .map((id) => scene.nodesById[id])
    .filter(Boolean)
    .sort((a, b) => a.zOrder - b.zOrder);
}

export function normalizeZOrder(scene, parentId) {
  const parent = scene.nodesById[parentId];
  if (!parent) return;
  parent.childrenIds = parent.childrenIds
    .map((id) => scene.nodesById[id])
    .filter(Boolean)
    .sort((a, b) => a.zOrder - b.zOrder)
    .map((n, idx) => {
      n.zOrder = idx;
      return n.id;
    });
}

export function traverse(scene, nodeId = scene.rootId, visitor = () => {}) {
  const node = scene.nodesById[nodeId];
  if (!node) return;
  visitor(node);
  getChildren(scene, node.id).forEach((child) => traverse(scene, child.id, visitor));
}

export function serializeScene(scene) {
  return JSON.parse(JSON.stringify(scene));
}

export function deserializeScene(payload) {
  const scene = createScene();
  scene.rootId = payload.rootId;
  scene.nodesById = payload.nodesById || {};
  return scene;
}
