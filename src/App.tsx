import { useState, useCallback } from 'react';

interface Task {
  id: string;
  title: string;
  priority: 'LOW' | 'MED' | 'HIGH';
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

const initialColumns: Column[] = [
  {
    id: 'backlog',
    title: 'BACKLOG',
    tasks: [
      { id: '1', title: 'Research brutalist architecture references', priority: 'MED' },
      { id: '2', title: 'Define project scope', priority: 'HIGH' },
      { id: '3', title: 'Gather requirements from stakeholders', priority: 'LOW' },
    ],
  },
  {
    id: 'in-progress',
    title: 'IN PROGRESS',
    tasks: [
      { id: '4', title: 'Build the foundation', priority: 'HIGH' },
      { id: '5', title: 'Pour concrete walls', priority: 'MED' },
    ],
  },
  {
    id: 'review',
    title: 'REVIEW',
    tasks: [
      { id: '6', title: 'Structural integrity check', priority: 'HIGH' },
    ],
  },
  {
    id: 'done',
    title: 'DONE',
    tasks: [
      { id: '7', title: 'Site preparation complete', priority: 'LOW' },
    ],
  },
];

const priorityStyles = {
  LOW: 'bg-[#B8B8B8] text-black',
  MED: 'bg-[#FFD93D] text-black',
  HIGH: 'bg-[#FF3333] text-white',
};

function App() {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [draggedTask, setDraggedTask] = useState<{ task: Task; fromColumnId: string } | null>(null);
  const [newTaskColumn, setNewTaskColumn] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  const handleDragStart = useCallback((task: Task, columnId: string) => {
    setDraggedTask({ task, fromColumnId: columnId });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDropTarget(columnId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDropTarget(null);
  }, []);

  const handleDrop = useCallback((toColumnId: string) => {
    if (!draggedTask) return;

    setColumns(prev => {
      const newColumns = prev.map(col => {
        if (col.id === draggedTask.fromColumnId) {
          return {
            ...col,
            tasks: col.tasks.filter(t => t.id !== draggedTask.task.id),
          };
        }
        if (col.id === toColumnId) {
          return {
            ...col,
            tasks: [...col.tasks, draggedTask.task],
          };
        }
        return col;
      });
      return newColumns;
    });

    setDraggedTask(null);
    setDropTarget(null);
  }, [draggedTask]);

  const addTask = useCallback((columnId: string) => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      priority: 'MED',
    };

    setColumns(prev =>
      prev.map(col =>
        col.id === columnId
          ? { ...col, tasks: [...col.tasks, newTask] }
          : col
      )
    );

    setNewTaskTitle('');
    setNewTaskColumn(null);
  }, [newTaskTitle]);

  const deleteTask = useCallback((taskId: string, columnId: string) => {
    setColumns(prev =>
      prev.map(col =>
        col.id === columnId
          ? { ...col, tasks: col.tasks.filter(t => t.id !== taskId) }
          : col
      )
    );
  }, []);

  const cyclePriority = useCallback((taskId: string, columnId: string) => {
    const priorities: Task['priority'][] = ['LOW', 'MED', 'HIGH'];
    setColumns(prev =>
      prev.map(col =>
        col.id === columnId
          ? {
              ...col,
              tasks: col.tasks.map(t =>
                t.id === taskId
                  ? { ...t, priority: priorities[(priorities.indexOf(t.priority) + 1) % 3] }
                  : t
              ),
            }
          : col
      )
    );
  }, []);

  return (
    <div className="min-h-screen bg-[#E8E4DF] relative overflow-hidden">
      {/* Noise overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Grid lines background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.08]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #000 1px, transparent 1px),
            linear-gradient(to bottom, #000 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 p-4 md:p-8 lg:p-12 flex flex-col min-h-screen">
        {/* Header */}
        <header className="mb-8 md:mb-12">
          <div className="border-4 border-black bg-black text-[#E8E4DF] inline-block p-3 md:p-4 transform -rotate-1 hover:rotate-0 transition-transform">
            <h1 className="font-mono text-2xl md:text-4xl lg:text-5xl font-bold tracking-tighter uppercase">
              KANBAN_
            </h1>
          </div>
          <div className="mt-4 border-l-4 border-black pl-4">
            <p className="font-mono text-xs md:text-sm text-black/60 uppercase tracking-widest">
              TASK MANAGEMENT SYSTEM // BRUTALIST EDITION
            </p>
          </div>
        </header>

        {/* Kanban Board */}
        <main className="flex-1 overflow-x-auto pb-4">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 min-w-full md:min-w-max">
            {columns.map((column, colIndex) => (
              <div
                key={column.id}
                className={`
                  flex-shrink-0 w-full md:w-72 lg:w-80
                  border-4 border-black bg-white
                  transform transition-all duration-200
                  ${dropTarget === column.id ? 'scale-[1.02] border-8' : ''}
                  ${colIndex % 2 === 0 ? 'rotate-0' : 'md:-rotate-[0.5deg]'}
                `}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDragLeave={handleDragLeave}
                onDrop={() => handleDrop(column.id)}
              >
                {/* Column Header */}
                <div className="border-b-4 border-black p-3 md:p-4 bg-black text-[#E8E4DF]">
                  <div className="flex items-center justify-between">
                    <h2 className="font-mono text-sm md:text-base font-bold tracking-wider">
                      {column.title}
                    </h2>
                    <span className="font-mono text-xs border-2 border-[#E8E4DF] px-2 py-1">
                      {column.tasks.length}
                    </span>
                  </div>
                </div>

                {/* Tasks */}
                <div className="p-3 md:p-4 space-y-3 min-h-[200px]">
                  {column.tasks.map((task, taskIndex) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task, column.id)}
                      className={`
                        group cursor-grab active:cursor-grabbing
                        border-4 border-black p-3 bg-[#E8E4DF]
                        transform transition-all duration-150
                        hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                        active:shadow-none active:translate-y-0
                        ${draggedTask?.task.id === task.id ? 'opacity-50 rotate-2' : ''}
                      `}
                      style={{
                        animationDelay: `${taskIndex * 50}ms`,
                      }}
                    >
                      {/* Priority Badge */}
                      <button
                        onClick={() => cyclePriority(task.id, column.id)}
                        className={`
                          font-mono text-[10px] md:text-xs font-bold px-2 py-1 mb-2
                          border-2 border-black inline-block
                          hover:scale-105 transition-transform
                          ${priorityStyles[task.priority]}
                        `}
                      >
                        {task.priority}
                      </button>

                      {/* Task Title */}
                      <p className="font-mono text-sm md:text-base font-medium leading-tight break-words">
                        {task.title}
                      </p>

                      {/* Delete Button */}
                      <button
                        onClick={() => deleteTask(task.id, column.id)}
                        className="
                          mt-3 font-mono text-xs border-2 border-black px-2 py-1
                          bg-white hover:bg-black hover:text-white
                          transition-colors opacity-0 group-hover:opacity-100
                          min-h-[36px] min-w-[36px]
                        "
                      >
                        [DEL]
                      </button>
                    </div>
                  ))}

                  {/* Add Task Form */}
                  {newTaskColumn === column.id ? (
                    <div className="border-4 border-dashed border-black p-3 bg-white">
                      <input
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') addTask(column.id);
                          if (e.key === 'Escape') setNewTaskColumn(null);
                        }}
                        placeholder="ENTER TASK..."
                        autoFocus
                        className="
                          w-full font-mono text-sm p-2 border-2 border-black
                          bg-[#E8E4DF] placeholder:text-black/40
                          focus:outline-none focus:border-black
                          min-h-[44px]
                        "
                      />
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => addTask(column.id)}
                          className="
                            flex-1 font-mono text-xs font-bold
                            border-2 border-black px-3 py-2
                            bg-black text-white
                            hover:bg-[#E8E4DF] hover:text-black
                            transition-colors min-h-[44px]
                          "
                        >
                          ADD
                        </button>
                        <button
                          onClick={() => {
                            setNewTaskColumn(null);
                            setNewTaskTitle('');
                          }}
                          className="
                            flex-1 font-mono text-xs font-bold
                            border-2 border-black px-3 py-2
                            bg-white hover:bg-black hover:text-white
                            transition-colors min-h-[44px]
                          "
                        >
                          CANCEL
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setNewTaskColumn(column.id)}
                      className="
                        w-full border-4 border-dashed border-black/30 p-3
                        font-mono text-sm text-black/50
                        hover:border-black hover:text-black
                        transition-all duration-200 min-h-[60px]
                      "
                    >
                      + ADD TASK
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-8 pt-4 border-t-2 border-black/10">
          <p className="font-mono text-[10px] md:text-xs text-black/40 tracking-wider text-center">
            Requested by @web-user · Built by @clonkbot
          </p>
        </footer>
      </div>

      {/* Decorative corner element */}
      <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 w-16 h-16 md:w-24 md:h-24 border-4 border-black bg-black transform rotate-12 opacity-10 pointer-events-none" />
      <div className="fixed top-4 right-4 md:top-8 md:right-8 w-8 h-8 md:w-12 md:h-12 border-4 border-black transform -rotate-6 opacity-10 pointer-events-none" />
    </div>
  );
}

export default App;
