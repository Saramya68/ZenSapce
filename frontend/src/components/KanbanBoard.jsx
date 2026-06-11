import React, { useState } from 'react';
import { Plus, Trash2, Tag, Calendar, LayoutGrid, CheckCircle2, Circle, Clock } from 'lucide-react';
import GlassCard from './GlassCard';

const KanbanBoard = ({ tasks, onAddTask, onUpdateTask, onDeleteTask }) => {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('Coding');

  // Drag and Drop handlers
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Required to allow drop
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onUpdateTask(taskId, { status: newStatus });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title,
      description,
      priority,
      category,
      status: 'todo'
    });

    // Reset Form
    setTitle('');
    setDescription('');
    setPriority('medium');
    setCategory('Coding');
    setShowForm(false);
  };

  // Filter tasks by column
  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const doneTasks = tasks.filter(t => t.status === 'done');

  const columns = [
    { id: 'todo', title: 'To Do', count: todoTasks.length, items: todoTasks, icon: <Circle size={16} color="var(--accent-pink)" /> },
    { id: 'in_progress', title: 'In Progress', count: inProgressTasks.length, items: inProgressTasks, icon: <Clock size={16} color="var(--accent-yellow)" /> },
    { id: 'done', title: 'Done', count: doneTasks.length, items: doneTasks, icon: <CheckCircle2 size={16} color="var(--accent-green)" /> }
  ];

  return (
    <GlassCard padding="1.25rem" glow={false}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <LayoutGrid size={20} className="glow-text-cyan" color="var(--accent-cyan)" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 650 }}>Task Workspace</h2>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="btn btn-primary"
          style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', borderRadius: '8px' }}
        >
          <Plus size={16} />
          <span>New Task</span>
        </button>
      </div>

      {/* Task Creation Form */}
      {showForm && (
        <div style={{
          background: 'rgba(0, 0, 0, 0.2)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-sm)',
          padding: '1rem',
          marginBottom: '1.25rem',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input
              type="text"
              placeholder="Task Title..."
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ fontSize: '0.9rem' }}
            />
            <textarea
              placeholder="Add details / description..."
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ fontSize: '0.85rem', resize: 'none' }}
            />
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>Priority</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{ fontSize: '0.85rem', padding: '0.5rem' }}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ fontSize: '0.85rem', padding: '0.5rem' }}>
                  <option value="Coding">Coding</option>
                  <option value="Design">Design</option>
                  <option value="Planning">Planning</option>
                  <option value="Learning">Learning</option>
                  <option value="Review">Review</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button 
                type="button" 
                onClick={() => setShowForm(false)} 
                className="btn btn-secondary"
                style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ padding: '0.4rem 1.2rem', fontSize: '0.8rem' }}
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Kanban Board columns */}
      <div className="kanban-container">
        {columns.map(col => (
          <div 
            key={col.id} 
            className="kanban-column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className="kanban-column-header">
              <span className="kanban-column-title">
                {col.icon}
                <span>{col.title}</span>
              </span>
              <span className="kanban-count">{col.count}</span>
            </div>

            <div className="kanban-cards-list">
              {col.items.length === 0 ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '80px',
                  color: 'var(--text-muted)',
                  fontSize: '0.75rem',
                  border: '1.5px dashed rgba(255,255,255,0.03)',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  Drop tasks here
                </div>
              ) : (
                col.items.map(task => (
                  <div
                    key={task._id}
                    className="kanban-card"
                    draggable
                    onDragStart={(e) => handleDragStart(e, task._id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <span className="kanban-card-title">{task.title}</span>
                      <button 
                        onClick={() => onDeleteTask(task._id)}
                        className="btn-icon"
                        style={{ padding: '3px', marginTop: '-3px', marginRight: '-3px' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    {task.description && (
                      <span className="kanban-card-desc">{task.description}</span>
                    )}

                    <div className="kanban-card-footer">
                      <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        <Tag size={10} color="var(--accent-cyan)" />
                        <span>{task.category}</span>
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

export default KanbanBoard;
