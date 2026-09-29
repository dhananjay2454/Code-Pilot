import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type DSType = 'array' | 'linked-list' | 'stack' | 'queue' | 'bst' | 'graph';

export const DS_LABELS: Record<DSType, string> = {
  array: 'Array',
  'linked-list': 'Linked List',
  stack: 'Stack',
  queue: 'Queue',
  bst: 'BST',
  graph: 'Graph',
};

export const OPERATIONS: Record<DSType, string[]> = {
  array: ['Insert', 'Delete', 'Search', 'Sort', 'Reverse'],
  'linked-list': ['Insert Head', 'Insert Tail', 'Delete', 'Search'],
  stack: ['Push', 'Pop', 'Peek'],
  queue: ['Enqueue', 'Dequeue', 'Peek'],
  bst: ['Insert', 'Search', 'Inorder', 'Preorder', 'Postorder'],
  graph: ['Add Vertex', 'Add Edge', 'BFS', 'DFS'],
};

export const ALL_DS: DSType[] = ['array', 'linked-list', 'stack', 'queue', 'bst', 'graph'];

export function useProgress() {
  const { user } = useAuth();
  const [explored, setExplored] = useState<Record<string, string[]>>({});

  // Load progress from DB when user is logged in
  useEffect(() => {
    if (!user) {
      setExplored({});
      return;
    }
    supabase.from('user_progress')
      .select('ds_type, operation')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (!data) return;
        const map: Record<string, string[]> = {};
        data.forEach(row => {
          if (!map[row.ds_type]) map[row.ds_type] = [];
          map[row.ds_type].push(row.operation);
        });
        setExplored(map);
      });
  }, [user]);

  const markExplored = useCallback((ds: DSType, operation: string) => {
    setExplored(prev => {
      const current = prev[ds] || [];
      if (current.includes(operation)) return prev;
      return { ...prev, [ds]: [...current, operation] };
    });

    if (user) {
      supabase.from('user_progress')
        .upsert({ user_id: user.id, ds_type: ds, operation }, { onConflict: 'user_id,ds_type,operation' })
        .then(() => {});
    }
  }, [user]);

  const getProgress = useCallback((ds: DSType) => {
    const total = OPERATIONS[ds].length;
    const done = (explored[ds] || []).length;
    return { done, total, percent: total > 0 ? Math.round((done / total) * 100) : 0 };
  }, [explored]);

  const getOverallProgress = useCallback(() => {
    let totalOps = 0, doneOps = 0;
    ALL_DS.forEach(ds => {
      totalOps += OPERATIONS[ds].length;
      doneOps += (explored[ds] || []).length;
    });
    return totalOps > 0 ? Math.round((doneOps / totalOps) * 100) : 0;
  }, [explored]);

  return { explored, markExplored, getProgress, getOverallProgress };
}
