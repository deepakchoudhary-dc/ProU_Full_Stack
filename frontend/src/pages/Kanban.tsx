import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../services/task';
import { Card, Button } from '../components/ui';
import type { Task } from '../types';

const Kanban = () => {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ['tasks', { limit: 200 }], queryFn: () => taskService.getTasks({ limit: 200 }) });
  const [columns, setColumns] = useState<Record<string, Task[]>>({});

  useEffect(() => {
    if (data?.data) {
      const tasks: Task[] = data.data;
      const cols: Record<string, Task[]> = { TODO: [], IN_PROGRESS: [], IN_REVIEW: [], COMPLETED: [] };
      tasks.forEach(t => cols[t.status || 'TODO'].push(t));
      setColumns(cols);
    }
  }, [data]);

  const reorderMutation = useMutation({
    mutationFn: (payload: { projectId: string; tasks: Array<{ id: string; order: number; status?: string }> }) =>
      taskService.reorderTasks(payload.projectId, payload.tasks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const onDragEnd = (_event: any) => {
    // Drag & drop is scaffolded in UI; install dnd-kit to enable interactive reordering.
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kanban</h1>
        <div>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['tasks'] })}>Refresh</Button>
        </div>
      </div>

      <div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.keys(columns).map((col) => (
            <div key={col}>
              <h3 className="font-semibold mb-2">{col.replace('_', ' ')}</h3>
              {columns[col].map(task => (
                <Card key={task.id} className="mb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{task.title}</div>
                      <div className="text-xs text-gray-500">{task.project?.name}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Kanban;
