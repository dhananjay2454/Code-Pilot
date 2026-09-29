// Algorithm step types for visualization
export interface AlgorithmStep {
  array: number[];
  comparing?: number[];
  swapping?: number[];
  sorted?: number[];
  found?: number;
  pivot?: number;
  searching?: number;
  visited?: number[];
  currentLine: number;
  description: string;
  // Real-time complexity tracking
  stepTime?: string;
  stepSpace?: string;
  comparisons?: number;
  swaps?: number;
  operations?: number;
  auxSpaceUnits?: number;
  auxSpaceLabel?: string;
  peakSpaceUnits?: number;
}

// ---- SORTING ----

export function bubbleSortSteps(input: number[]): AlgorithmStep[] {
  const arr = [...input];
  const steps: AlgorithmStep[] = [];
  const sorted: number[] = [];
  let comparisons = 0;
  let swaps = 0;
  let operations = 0;

  steps.push({
    array: [...arr],
    sorted: [],
    currentLine: 0,
    description: 'Start Bubble Sort',
    stepTime: 'O(1)',
    stepSpace: 'O(1)',
    comparisons,
    swaps,
    operations,
    auxSpaceUnits: 1,
    auxSpaceLabel: 'O(1) in-place',
    peakSpaceUnits: 1,
  });

  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = 0; j < arr.length - 1 - i; j++) {
      comparisons++;
      operations++;
      steps.push({
        array: [...arr],
        comparing: [j, j + 1],
        sorted: [...sorted],
        currentLine: 2,
        description: `Compare arr[${j}]=${arr[j]} and arr[${j + 1}]=${arr[j + 1]}`,
        stepTime: 'O(1)',
        stepSpace: 'O(1)',
        comparisons,
        swaps,
        operations,
        auxSpaceUnits: 1,
        auxSpaceLabel: 'O(1) in-place',
        peakSpaceUnits: 1,
      });
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swaps++;
        operations++;
        steps.push({
          array: [...arr],
          swapping: [j, j + 1],
          sorted: [...sorted],
          currentLine: 3,
          description: `Swap ${arr[j + 1]} and ${arr[j]}`,
          stepTime: 'O(1)',
          stepSpace: 'O(1)',
          comparisons,
          swaps,
          operations,
          auxSpaceUnits: 1,
          auxSpaceLabel: 'O(1) (temp swap var)',
          peakSpaceUnits: 1,
        });
      }
    }
    sorted.push(arr.length - 1 - i);
    operations++;
    steps.push({
      array: [...arr],
      sorted: [...sorted],
      currentLine: 4,
      description: `Element at index ${arr.length - 1 - i} is sorted`,
      stepTime: 'O(1)',
      stepSpace: 'O(1)',
      comparisons,
      swaps,
      operations,
      auxSpaceUnits: 1,
      auxSpaceLabel: 'O(1) in-place',
      peakSpaceUnits: 1,
    });
  }
  sorted.push(0);
  operations++;
  steps.push({
    array: [...arr],
    sorted: Array.from({ length: arr.length }, (_, i) => i),
    currentLine: 5,
    description: 'Array is sorted!',
    stepTime: 'O(1)',
    stepSpace: 'O(1)',
    comparisons,
    swaps,
    operations,
    auxSpaceUnits: 1,
    auxSpaceLabel: 'O(1) in-place',
    peakSpaceUnits: 1,
  });
  return steps;
}

export function insertionSortSteps(input: number[]): AlgorithmStep[] {
  const arr = [...input];
  const steps: AlgorithmStep[] = [];
  const sorted: number[] = [0];
  let comparisons = 0;
  let swaps = 0;
  let operations = 0;

  steps.push({
    array: [...arr],
    sorted: [0],
    currentLine: 0,
    description: 'Start Insertion Sort — first element is trivially sorted',
    stepTime: 'O(1)',
    stepSpace: 'O(1)',
    comparisons,
    swaps,
    operations,
    auxSpaceUnits: 1,
    auxSpaceLabel: 'O(1) in-place',
    peakSpaceUnits: 1,
  });

  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    operations++;
    steps.push({
      array: [...arr],
      comparing: [i],
      sorted: [...sorted],
      currentLine: 1,
      description: `Pick key = arr[${i}] = ${key}`,
      stepTime: 'O(1)',
      stepSpace: 'O(1)',
      comparisons,
      swaps,
      operations,
      auxSpaceUnits: 1,
      auxSpaceLabel: '1 key var stored',
      peakSpaceUnits: 1,
    });
    let j = i - 1;
    while (j >= 0) {
      comparisons++;
      operations++;
      const shouldShift = arr[j] > key;
      steps.push({
        array: [...arr],
        comparing: [j, j + 1],
        sorted: [...sorted],
        currentLine: 3,
        description: shouldShift ? `arr[${j}]=${arr[j]} > ${key}, shift right` : `arr[${j}]=${arr[j]} <= ${key}, stop shifting`,
        stepTime: 'O(1)',
        stepSpace: 'O(1)',
        comparisons,
        swaps,
        operations,
        auxSpaceUnits: 1,
        auxSpaceLabel: '1 key var stored',
        peakSpaceUnits: 1,
      });
      if (shouldShift) {
        arr[j + 1] = arr[j];
        swaps++;
        operations++;
        steps.push({
          array: [...arr],
          swapping: [j, j + 1],
          sorted: [...sorted],
          currentLine: 4,
          description: `Shifted arr[${j}] to arr[${j + 1}]`,
          stepTime: 'O(1)',
          stepSpace: 'O(1)',
          comparisons,
          swaps,
          operations,
          auxSpaceUnits: 1,
          auxSpaceLabel: '1 key var stored',
          peakSpaceUnits: 1,
        });
        j--;
      } else {
        break;
      }
    }
    arr[j + 1] = key;
    operations++;
    sorted.push(i);
    steps.push({
      array: [...arr],
      sorted: [...sorted],
      currentLine: 5,
      description: `Placed key ${key} at index ${j + 1}`,
      stepTime: 'O(1)',
      stepSpace: 'O(1)',
      comparisons,
      swaps,
      operations,
      auxSpaceUnits: 1,
      auxSpaceLabel: 'O(1) in-place',
      peakSpaceUnits: 1,
    });
  }
  steps.push({
    array: [...arr],
    sorted: Array.from({ length: arr.length }, (_, i) => i),
    currentLine: 6,
    description: 'Array is sorted!',
    stepTime: 'O(1)',
    stepSpace: 'O(1)',
    comparisons,
    swaps,
    operations,
    auxSpaceUnits: 1,
    auxSpaceLabel: 'O(1) in-place',
    peakSpaceUnits: 1,
  });
  return steps;
}

export function mergeSortSteps(input: number[]): AlgorithmStep[] {
  const arr = [...input];
  const steps: AlgorithmStep[] = [];
  let comparisons = 0;
  let swaps = 0;
  let operations = 0;
  let peakSpace = 1;

  steps.push({
    array: [...arr],
    currentLine: 0,
    description: 'Start Merge Sort',
    stepTime: 'O(1)',
    stepSpace: 'O(1)',
    comparisons,
    swaps,
    operations,
    auxSpaceUnits: 1,
    auxSpaceLabel: 'Stack depth: 1',
    peakSpaceUnits: 1,
  });

  function mergeSort(a: number[], left: number, right: number, depth: number) {
    peakSpace = Math.max(peakSpace, depth);
    if (left >= right) return;
    const mid = Math.floor((left + right) / 2);
    operations++;
    steps.push({
      array: [...arr],
      comparing: [left, mid, right],
      currentLine: 1,
      description: `Divide [${left}..${right}] at mid=${mid}`,
      stepTime: 'O(1)',
      stepSpace: 'O(log n)',
      comparisons,
      swaps,
      operations,
      auxSpaceUnits: depth,
      auxSpaceLabel: `Stack depth: ${depth}`,
      peakSpaceUnits: peakSpace,
    });

    mergeSort(a, left, mid, depth + 1);
    mergeSort(a, mid + 1, right, depth + 1);

    // merge
    const temp: number[] = [];
    let i = left, j = mid + 1;
    while (i <= mid && j <= right) {
      comparisons++;
      operations++;
      const currentSpace = depth + temp.length;
      peakSpace = Math.max(peakSpace, currentSpace);
      steps.push({
        array: [...arr],
        comparing: [i, j],
        currentLine: 3,
        description: `Compare arr[${i}]=${arr[i]} and arr[${j}]=${arr[j]}`,
        stepTime: 'O(1)',
        stepSpace: 'O(n)',
        comparisons,
        swaps,
        operations,
        auxSpaceUnits: currentSpace,
        auxSpaceLabel: `Stack: ${depth} + Buffer: ${temp.length}`,
        peakSpaceUnits: peakSpace,
      });
      if (arr[i] <= arr[j]) {
        temp.push(arr[i++]);
      } else {
        temp.push(arr[j++]);
      }
      swaps++;
    }
    while (i <= mid) {
      temp.push(arr[i++]);
      swaps++;
      operations++;
    }
    while (j <= right) {
      temp.push(arr[j++]);
      swaps++;
      operations++;
    }
    for (let k = 0; k < temp.length; k++) {
      arr[left + k] = temp[k];
      swaps++;
      operations++;
    }
    const merged = Array.from({ length: temp.length }, (_, k) => left + k);
    const mergeSpace = depth + temp.length;
    peakSpace = Math.max(peakSpace, mergeSpace);
    steps.push({
      array: [...arr],
      swapping: merged,
      currentLine: 5,
      description: `Merged [${left}..${right}] → [${temp.join(', ')}]`,
      stepTime: 'O(k)',
      stepSpace: 'O(n)',
      comparisons,
      swaps,
      operations,
      auxSpaceUnits: mergeSpace,
      auxSpaceLabel: `Merged ${temp.length} items (Stack: ${depth})`,
      peakSpaceUnits: peakSpace,
    });
  }

  mergeSort(arr, 0, arr.length - 1, 1);
  steps.push({
    array: [...arr],
    sorted: Array.from({ length: arr.length }, (_, i) => i),
    currentLine: 6,
    description: 'Array is sorted!',
    stepTime: 'O(1)',
    stepSpace: 'O(1)',
    comparisons,
    swaps,
    operations,
    auxSpaceUnits: 1,
    auxSpaceLabel: 'O(1) memory freed',
    peakSpaceUnits: peakSpace,
  });
  return steps;
}

export function quickSortSteps(input: number[]): AlgorithmStep[] {
  const arr = [...input];
  const steps: AlgorithmStep[] = [];
  const sorted: number[] = [];
  let comparisons = 0;
  let swaps = 0;
  let operations = 0;
  let peakSpace = 1;

  steps.push({
    array: [...arr],
    currentLine: 0,
    description: 'Start Quick Sort',
    stepTime: 'O(1)',
    stepSpace: 'O(1)',
    comparisons,
    swaps,
    operations,
    auxSpaceUnits: 1,
    auxSpaceLabel: 'Stack depth: 1',
    peakSpaceUnits: 1,
  });

  function qs(low: number, high: number, depth: number) {
    peakSpace = Math.max(peakSpace, depth);
    if (low >= high) {
      if (low === high) sorted.push(low);
      return;
    }
    const pivotVal = arr[high];
    operations++;
    steps.push({
      array: [...arr],
      pivot: high,
      sorted: [...sorted],
      currentLine: 1,
      description: `Pivot = arr[${high}] = ${pivotVal}`,
      stepTime: 'O(1)',
      stepSpace: 'O(log n)',
      comparisons,
      swaps,
      operations,
      auxSpaceUnits: depth,
      auxSpaceLabel: `Stack depth: ${depth}`,
      peakSpaceUnits: peakSpace,
    });
    let i = low;
    for (let j = low; j < high; j++) {
      comparisons++;
      operations++;
      steps.push({
        array: [...arr],
        comparing: [j, high],
        pivot: high,
        sorted: [...sorted],
        currentLine: 2,
        description: `Compare arr[${j}]=${arr[j]} with pivot ${pivotVal}`,
        stepTime: 'O(1)',
        stepSpace: 'O(log n)',
        comparisons,
        swaps,
        operations,
        auxSpaceUnits: depth,
        auxSpaceLabel: `Stack depth: ${depth}`,
        peakSpaceUnits: peakSpace,
      });
      if (arr[j] < pivotVal) {
        [arr[i], arr[j]] = [arr[j], arr[i]];
        swaps++;
        operations++;
        steps.push({
          array: [...arr],
          swapping: [i, j],
          pivot: high,
          sorted: [...sorted],
          currentLine: 3,
          description: `Swap arr[${i}] and arr[${j}]`,
          stepTime: 'O(1)',
          stepSpace: 'O(log n)',
          comparisons,
          swaps,
          operations,
          auxSpaceUnits: depth,
          auxSpaceLabel: `Stack depth: ${depth}`,
          peakSpaceUnits: peakSpace,
        });
        i++;
      }
    }
    [arr[i], arr[high]] = [arr[high], arr[i]];
    swaps++;
    operations++;
    sorted.push(i);
    steps.push({
      array: [...arr],
      swapping: [i, high],
      sorted: [...sorted],
      currentLine: 4,
      description: `Place pivot at index ${i}`,
      stepTime: 'O(1)',
      stepSpace: 'O(log n)',
      comparisons,
      swaps,
      operations,
      auxSpaceUnits: depth,
      auxSpaceLabel: `Stack depth: ${depth}`,
      peakSpaceUnits: peakSpace,
    });
    qs(low, i - 1, depth + 1);
    qs(i + 1, high, depth + 1);
  }

  qs(0, arr.length - 1, 1);
  steps.push({
    array: [...arr],
    sorted: Array.from({ length: arr.length }, (_, i) => i),
    currentLine: 5,
    description: 'Array is sorted!',
    stepTime: 'O(1)',
    stepSpace: 'O(1)',
    comparisons,
    swaps,
    operations,
    auxSpaceUnits: 1,
    auxSpaceLabel: 'Stack cleared (O(1))',
    peakSpaceUnits: peakSpace,
  });
  return steps;
}

// ---- SEARCHING ----

export function linearSearchSteps(input: number[], target: number): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  let comparisons = 0;
  let operations = 0;

  steps.push({
    array: [...input],
    currentLine: 0,
    description: `Linear Search for ${target}`,
    stepTime: 'O(1)',
    stepSpace: 'O(1)',
    comparisons,
    swaps: 0,
    operations,
    auxSpaceUnits: 1,
    auxSpaceLabel: 'O(1) in-place (pointer i)',
    peakSpaceUnits: 1,
  });

  for (let i = 0; i < input.length; i++) {
    comparisons++;
    operations++;
    steps.push({
      array: [...input],
      searching: i,
      currentLine: 1,
      description: `Check arr[${i}] = ${input[i]}`,
      stepTime: 'O(1)',
      stepSpace: 'O(1)',
      comparisons,
      swaps: 0,
      operations,
      auxSpaceUnits: 1,
      auxSpaceLabel: 'O(1) in-place (pointer i)',
      peakSpaceUnits: 1,
    });
    if (input[i] === target) {
      operations++;
      steps.push({
        array: [...input],
        found: i,
        currentLine: 2,
        description: `Found ${target} at index ${i}!`,
        stepTime: 'O(1)',
        stepSpace: 'O(1)',
        comparisons,
        swaps: 0,
        operations,
        auxSpaceUnits: 1,
        auxSpaceLabel: 'O(1) found',
        peakSpaceUnits: 1,
      });
      return steps;
    }
    steps.push({
      array: [...input],
      currentLine: 3,
      description: `${input[i]} ≠ ${target}, move to next`,
      stepTime: 'O(1)',
      stepSpace: 'O(1)',
      comparisons,
      swaps: 0,
      operations,
      auxSpaceUnits: 1,
      auxSpaceLabel: 'O(1) in-place',
      peakSpaceUnits: 1,
    });
  }
  steps.push({
    array: [...input],
    currentLine: 4,
    description: `${target} not found in the array`,
    stepTime: 'O(1)',
    stepSpace: 'O(1)',
    comparisons,
    swaps: 0,
    operations,
    auxSpaceUnits: 1,
    auxSpaceLabel: 'O(1) in-place',
    peakSpaceUnits: 1,
  });
  return steps;
}

export function binarySearchSteps(input: number[], target: number): AlgorithmStep[] {
  const arr = [...input].sort((a, b) => a - b);
  const steps: AlgorithmStep[] = [];
  let comparisons = 0;
  let operations = 0;

  steps.push({
    array: [...arr],
    sorted: Array.from({ length: arr.length }, (_, i) => i),
    currentLine: 0,
    description: `Binary Search for ${target} (sorted array)`,
    stepTime: 'O(1)',
    stepSpace: 'O(1)',
    comparisons,
    swaps: 0,
    operations,
    auxSpaceUnits: 3,
    auxSpaceLabel: 'Pointers (low, mid, high)',
    peakSpaceUnits: 3,
  });

  let low = 0, high = arr.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    comparisons++;
    operations++;
    steps.push({
      array: [...arr],
      comparing: [low, mid, high],
      currentLine: 1,
      description: `low=${low}, mid=${mid}, high=${high} → arr[${mid}]=${arr[mid]}`,
      stepTime: 'O(1)',
      stepSpace: 'O(1)',
      comparisons,
      swaps: 0,
      operations,
      auxSpaceUnits: 3,
      auxSpaceLabel: `Pointers: low=${low}, mid=${mid}, high=${high}`,
      peakSpaceUnits: 3,
    });
    if (arr[mid] === target) {
      operations++;
      steps.push({
        array: [...arr],
        found: mid,
        currentLine: 2,
        description: `Found ${target} at index ${mid}!`,
        stepTime: 'O(1)',
        stepSpace: 'O(1)',
        comparisons,
        swaps: 0,
        operations,
        auxSpaceUnits: 3,
        auxSpaceLabel: 'Target found',
        peakSpaceUnits: 3,
      });
      return steps;
    }
    if (arr[mid] < target) {
      comparisons++;
      operations++;
      steps.push({
        array: [...arr],
        currentLine: 3,
        description: `${arr[mid]} < ${target}, search right half`,
        stepTime: 'O(1)',
        stepSpace: 'O(1)',
        comparisons,
        swaps: 0,
        operations,
        auxSpaceUnits: 3,
        auxSpaceLabel: 'Searching right half',
        peakSpaceUnits: 3,
      });
      low = mid + 1;
    } else {
      comparisons++;
      operations++;
      steps.push({
        array: [...arr],
        currentLine: 4,
        description: `${arr[mid]} > ${target}, search left half`,
        stepTime: 'O(1)',
        stepSpace: 'O(1)',
        comparisons,
        swaps: 0,
        operations,
        auxSpaceUnits: 3,
        auxSpaceLabel: 'Searching left half',
        peakSpaceUnits: 3,
      });
      high = mid - 1;
    }
  }
  steps.push({
    array: [...arr],
    currentLine: 5,
    description: `${target} not found`,
    stepTime: 'O(1)',
    stepSpace: 'O(1)',
    comparisons,
    swaps: 0,
    operations,
    auxSpaceUnits: 3,
    auxSpaceLabel: 'O(1) in-place',
    peakSpaceUnits: 3,
  });
  return steps;
}

// ---- GRAPH (BFS/DFS with steps) ----

export interface GraphAlgoStep {
  visited: string[];
  current: string;
  queue?: string[];
  stack?: string[];
  currentLine: number;
  description: string;
  // Real-time complexity tracking
  stepTime?: string;
  stepSpace?: string;
  comparisons?: number;
  swaps?: number;
  operations?: number;
  auxSpaceUnits?: number;
  auxSpaceLabel?: string;
  peakSpaceUnits?: number;
}

export interface SimpleGraph {
  nodes: { id: string; label: string }[];
  edges: { from: string; to: string }[];
}

export function buildSampleGraph(): SimpleGraph {
  const nodes = ['A', 'B', 'C', 'D', 'E', 'F'].map(l => ({ id: l, label: l }));
  return {
    nodes,
    edges: [
      { from: 'A', to: 'B' }, { from: 'A', to: 'C' },
      { from: 'B', to: 'D' }, { from: 'C', to: 'E' },
      { from: 'D', to: 'F' }, { from: 'E', to: 'F' },
    ],
  };
}

function getNeighbors(graph: SimpleGraph, id: string): string[] {
  const neighbors: string[] = [];
  for (const e of graph.edges) {
    if (e.from === id) neighbors.push(e.to);
    else if (e.to === id) neighbors.push(e.from);
  }
  return neighbors;
}

export function bfsSteps(graph: SimpleGraph, startId: string): GraphAlgoStep[] {
  const steps: GraphAlgoStep[] = [];
  const visited = new Set<string>();
  const queue = [startId];
  visited.add(startId);
  let operations = 0;
  let peakSpace = queue.length + visited.size;

  steps.push({
    visited: [startId],
    current: startId,
    queue: [...queue],
    currentLine: 0,
    description: `Start BFS from ${startId}`,
    stepTime: 'O(1)',
    stepSpace: 'O(V)',
    comparisons: 0,
    swaps: 0,
    operations: 0,
    auxSpaceUnits: queue.length + visited.size,
    auxSpaceLabel: `Queue: ${queue.length}, Visited: ${visited.size}`,
    peakSpaceUnits: peakSpace,
  });

  while (queue.length) {
    const current = queue.shift()!;
    operations++;
    peakSpace = Math.max(peakSpace, queue.length + visited.size);
    steps.push({
      visited: [...visited],
      current,
      queue: [...queue],
      currentLine: 1,
      description: `Dequeue ${current}, process it`,
      stepTime: 'O(1)',
      stepSpace: 'O(V)',
      comparisons: 0,
      swaps: 0,
      operations,
      auxSpaceUnits: queue.length + visited.size,
      auxSpaceLabel: `Queue: ${queue.length}, Visited: ${visited.size}`,
      peakSpaceUnits: peakSpace,
    });
    for (const n of getNeighbors(graph, current)) {
      operations++;
      if (!visited.has(n)) {
        visited.add(n);
        queue.push(n);
        peakSpace = Math.max(peakSpace, queue.length + visited.size);
        steps.push({
          visited: [...visited],
          current: n,
          queue: [...queue],
          currentLine: 2,
          description: `Discover neighbor ${n}, enqueue`,
          stepTime: 'O(1)',
          stepSpace: 'O(V)',
          comparisons: 0,
          swaps: 0,
          operations,
          auxSpaceUnits: queue.length + visited.size,
          auxSpaceLabel: `Queue: ${queue.length}, Visited: ${visited.size}`,
          peakSpaceUnits: peakSpace,
        });
      }
    }
  }
  steps.push({
    visited: [...visited],
    current: '',
    currentLine: 3,
    description: 'BFS complete!',
    stepTime: 'O(1)',
    stepSpace: 'O(V)',
    comparisons: 0,
    swaps: 0,
    operations,
    auxSpaceUnits: visited.size,
    auxSpaceLabel: `All ${visited.size} vertices visited`,
    peakSpaceUnits: peakSpace,
  });
  return steps;
}

export function dfsSteps(graph: SimpleGraph, startId: string): GraphAlgoStep[] {
  const steps: GraphAlgoStep[] = [];
  const visited = new Set<string>();
  let operations = 0;
  let peakSpace = 1;

  function dfs(id: string, depth: number) {
    visited.add(id);
    operations++;
    const currentSpace = depth + visited.size;
    peakSpace = Math.max(peakSpace, currentSpace);
    steps.push({
      visited: [...visited],
      current: id,
      currentLine: 1,
      description: `Visit ${id}`,
      stepTime: 'O(1)',
      stepSpace: 'O(V)',
      comparisons: 0,
      swaps: 0,
      operations,
      auxSpaceUnits: currentSpace,
      auxSpaceLabel: `Stack: ${depth}, Visited: ${visited.size}`,
      peakSpaceUnits: peakSpace,
    });

    for (const n of getNeighbors(graph, id)) {
      operations++;
      if (!visited.has(n)) {
        steps.push({
          visited: [...visited],
          current: n,
          currentLine: 2,
          description: `Recurse into neighbor ${n}`,
          stepTime: 'O(1)',
          stepSpace: 'O(V)',
          comparisons: 0,
          swaps: 0,
          operations,
          auxSpaceUnits: depth + 1 + visited.size,
          auxSpaceLabel: `Stack: ${depth + 1}, Visited: ${visited.size}`,
          peakSpaceUnits: Math.max(peakSpace, depth + 1 + visited.size),
        });
        dfs(n, depth + 1);
      }
    }
    steps.push({
      visited: [...visited],
      current: id,
      currentLine: 3,
      description: `Backtrack from ${id}`,
      stepTime: 'O(1)',
      stepSpace: 'O(V)',
      comparisons: 0,
      swaps: 0,
      operations,
      auxSpaceUnits: depth + visited.size,
      auxSpaceLabel: `Backtracking (Stack: ${depth})`,
      peakSpaceUnits: peakSpace,
    });
  }

  steps.push({
    visited: [],
    current: startId,
    currentLine: 0,
    description: `Start DFS from ${startId}`,
    stepTime: 'O(1)',
    stepSpace: 'O(V)',
    comparisons: 0,
    swaps: 0,
    operations: 0,
    auxSpaceUnits: 1,
    auxSpaceLabel: `Start DFS from ${startId}`,
    peakSpaceUnits: 1,
  });
  dfs(startId, 1);
  steps.push({
    visited: [...visited],
    current: '',
    currentLine: 4,
    description: 'DFS complete!',
    stepTime: 'O(1)',
    stepSpace: 'O(V)',
    comparisons: 0,
    swaps: 0,
    operations,
    auxSpaceUnits: visited.size,
    auxSpaceLabel: `All ${visited.size} vertices visited`,
    peakSpaceUnits: peakSpace,
  });
  return steps;
}

// ---- PSEUDOCODE ----

export const PSEUDOCODE: Record<string, string[]> = {
  'Bubble Sort': [
    'function bubbleSort(arr):',
    '  for i = 0 to n-2:',
    '    for j = 0 to n-2-i:',
    '      if arr[j] > arr[j+1]: swap',
    '    // element at n-1-i is sorted',
    '  return arr',
  ],
  'Insertion Sort': [
    'function insertionSort(arr):',
    '  for i = 1 to n-1:',
    '    key = arr[i]',
    '    j = i - 1',
    '    while j >= 0 and arr[j] > key:',
    '      arr[j+1] = arr[j]; j--',
    '    arr[j+1] = key',
  ],
  'Merge Sort': [
    'function mergeSort(arr, l, r):',
    '  mid = (l + r) / 2',
    '  mergeSort(arr, l, mid)',
    '  mergeSort(arr, mid+1, r)',
    '  merge left and right halves',
    '  copy merged result back',
    '  return sorted array',
  ],
  'Quick Sort': [
    'function quickSort(arr, low, high):',
    '  pivot = arr[high]',
    '  for j = low to high-1:',
    '    if arr[j] < pivot: swap(arr[i], arr[j])',
    '  swap(arr[i], arr[high]) // place pivot',
    '  return sorted array',
  ],
  'Linear Search': [
    'function linearSearch(arr, target):',
    '  for i = 0 to n-1:',
    '    if arr[i] == target: return i',
    '    else: continue',
    '  return -1 // not found',
  ],
  'Binary Search': [
    'function binarySearch(arr, target):',
    '  low=0, high=n-1, mid=(l+h)/2',
    '  if arr[mid] == target: return mid',
    '  if arr[mid] < target: low = mid+1',
    '  if arr[mid] > target: high = mid-1',
    '  return -1 // not found',
  ],
  'BFS': [
    'function BFS(graph, start):',
    '  dequeue current, process',
    '  for each neighbor:',
    '    if not visited: enqueue',
    '  // BFS complete',
  ],
  'DFS': [
    'function DFS(graph, start):',
    '  mark current visited',
    '  for each neighbor:',
    '    if not visited: recurse',
    '  backtrack',
    '  // DFS complete',
  ],
};

// ---- COMPLEXITY DATA ----

export const COMPLEXITY: Record<string, { time: string; space: string; best?: string; worst?: string }> = {
  'Bubble Sort': { best: 'O(n)', time: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
  'Insertion Sort': { best: 'O(n)', time: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
  'Merge Sort': { best: 'O(n log n)', time: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)' },
  'Quick Sort': { best: 'O(n log n)', time: 'O(n log n)', worst: 'O(n²)', space: 'O(log n)' },
  'Linear Search': { best: 'O(1)', time: 'O(n)', worst: 'O(n)', space: 'O(1)' },
  'Binary Search': { best: 'O(1)', time: 'O(log n)', worst: 'O(log n)', space: 'O(1)' },
  'BFS': { time: 'O(V + E)', space: 'O(V)', worst: 'O(V + E)' },
  'DFS': { time: 'O(V + E)', space: 'O(V)', worst: 'O(V + E)' },
};

// DS operation complexities
export const DS_COMPLEXITY: Record<string, Record<string, { time: string; space: string }>> = {
  'Array': {
    'Insert': { time: 'O(n)', space: 'O(1)' },
    'Delete': { time: 'O(n)', space: 'O(1)' },
    'Search': { time: 'O(n)', space: 'O(1)' },
    'Sort': { time: 'O(n²)', space: 'O(1)' },
    'Reverse': { time: 'O(n)', space: 'O(1)' },
  },
  'Linked List': {
    'Insert Head': { time: 'O(1)', space: 'O(1)' },
    'Insert Tail': { time: 'O(n)', space: 'O(1)' },
    'Delete': { time: 'O(n)', space: 'O(1)' },
    'Search': { time: 'O(n)', space: 'O(1)' },
  },
  'Stack': {
    'Push': { time: 'O(1)', space: 'O(1)' },
    'Pop': { time: 'O(1)', space: 'O(1)' },
    'Peek': { time: 'O(1)', space: 'O(1)' },
  },
  'Queue': {
    'Enqueue': { time: 'O(1)', space: 'O(1)' },
    'Dequeue': { time: 'O(1)', space: 'O(1)' },
    'Peek': { time: 'O(1)', space: 'O(1)' },
  },
  'BST': {
    'Insert': { time: 'O(log n)', space: 'O(1)' },
    'Search': { time: 'O(log n)', space: 'O(1)' },
    'Inorder': { time: 'O(n)', space: 'O(n)' },
    'Preorder': { time: 'O(n)', space: 'O(n)' },
    'Postorder': { time: 'O(n)', space: 'O(n)' },
  },
  'Graph': {
    'Add Vertex': { time: 'O(1)', space: 'O(1)' },
    'Add Edge': { time: 'O(1)', space: 'O(1)' },
    'BFS': { time: 'O(V+E)', space: 'O(V)' },
    'DFS': { time: 'O(V+E)', space: 'O(V)' },
  },
};
