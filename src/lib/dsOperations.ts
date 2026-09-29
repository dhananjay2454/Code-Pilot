export interface BSTNode {
  id: string;
  value: number;
  left: BSTNode | null;
  right: BSTNode | null;
}

export interface LLNode {
  id: string;
  value: number;
}

export interface GraphVertex {
  id: string;
  value: number;
}

export interface GraphData {
  vertices: GraphVertex[];
  edges: { from: string; to: string }[];
}

let counter = 0;
export const genId = () => `n${counter++}`;

// BST
export function bstInsert(root: BSTNode | null, value: number): { root: BSTNode; path: string[] } {
  const newId = genId();
  const path: string[] = [];
  function ins(node: BSTNode | null): BSTNode {
    if (!node) { path.push(newId); return { id: newId, value, left: null, right: null }; }
    path.push(node.id);
    if (value < node.value) return { ...node, left: ins(node.left) };
    if (value > node.value) return { ...node, right: ins(node.right) };
    return node;
  }
  return { root: ins(root), path };
}

export function bstSearch(root: BSTNode | null, value: number): { found: boolean; path: string[] } {
  const path: string[] = [];
  let node = root;
  while (node) {
    path.push(node.id);
    if (value === node.value) return { found: true, path };
    node = value < node.value ? node.left : node.right;
  }
  return { found: false, path };
}

export function bstInorder(root: BSTNode | null): string[] {
  if (!root) return [];
  return [...bstInorder(root.left), root.id, ...bstInorder(root.right)];
}

export function bstPreorder(root: BSTNode | null): string[] {
  if (!root) return [];
  return [root.id, ...bstPreorder(root.left), ...bstPreorder(root.right)];
}

export function bstPostorder(root: BSTNode | null): string[] {
  if (!root) return [];
  return [...bstPostorder(root.left), ...bstPostorder(root.right), root.id];
}

export function bstToArray(root: BSTNode | null): { id: string; value: number; x: number; y: number }[] {
  const result: { id: string; value: number; x: number; y: number }[] = [];
  function layout(node: BSTNode | null, x: number, y: number, spread: number) {
    if (!node) return;
    result.push({ id: node.id, value: node.value, x, y });
    layout(node.left, x - spread, y + 70, spread * 0.55);
    layout(node.right, x + spread, y + 70, spread * 0.55);
  }
  layout(root, 300, 40, 120);
  return result;
}

export function bstEdges(root: BSTNode | null): { from: string; to: string }[] {
  const result: { from: string; to: string }[] = [];
  function collect(node: BSTNode | null) {
    if (!node) return;
    if (node.left) { result.push({ from: node.id, to: node.left.id }); collect(node.left); }
    if (node.right) { result.push({ from: node.id, to: node.right.id }); collect(node.right); }
  }
  collect(root);
  return result;
}

// Graph
export function graphBFS(data: GraphData, startId: string): string[] {
  const visited = new Set<string>();
  const order: string[] = [];
  const queue = [startId];
  visited.add(startId);
  while (queue.length) {
    const current = queue.shift()!;
    order.push(current);
    for (const edge of data.edges) {
      const neighbor = edge.from === current ? edge.to : edge.to === current ? edge.from : null;
      if (neighbor && !visited.has(neighbor)) { visited.add(neighbor); queue.push(neighbor); }
    }
  }
  return order;
}

export function graphDFS(data: GraphData, startId: string): string[] {
  const visited = new Set<string>();
  const order: string[] = [];
  function dfs(id: string) {
    visited.add(id);
    order.push(id);
    for (const edge of data.edges) {
      const neighbor = edge.from === id ? edge.to : edge.to === id ? edge.from : null;
      if (neighbor && !visited.has(neighbor)) dfs(neighbor);
    }
  }
  dfs(startId);
  return order;
}

// Defaults
export function buildDefaultBST(): BSTNode | null {
  let root: BSTNode | null = null;
  for (const v of [20, 10, 30, 5, 15, 25, 35]) root = bstInsert(root, v).root;
  return root;
}

export function buildDefaultGraph(): GraphData {
  const v = [1, 2, 3, 4, 5].map(val => ({ id: genId(), value: val }));
  return {
    vertices: v,
    edges: [
      { from: v[0].id, to: v[1].id },
      { from: v[1].id, to: v[2].id },
      { from: v[2].id, to: v[3].id },
      { from: v[3].id, to: v[4].id },
      { from: v[0].id, to: v[3].id },
    ],
  };
}
