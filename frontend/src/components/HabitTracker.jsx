import React, { useState } from 'react';
import { Plus, Trash2, Calendar, Flame, Check } from 'lucide-react';
import GlassCard from './GlassCard';

const HabitTracker = ({ habits, onAddHabit, onToggleHabit, onDeleteHabit }) => {
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [showInput, setShowInput] = useState(false);

  // Generate the list of the last 7 days (including today)
  const getRecentDays = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      days.push({
        dateStr: `${year}-${month}-${day}`,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate()
      });
    }
    return days;
  };

  const recentDays = getRecentDays();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;
    
    onAddHabit(newHabitTitle);
    setNewHabitTitle('');
    setShowInput(false);
  };

  return (
    <GlassCard padding="1.25rem" glow={false}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={20} className="glow-text-purple" color="var(--accent-purple)" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 650 }}>Habit Rituals</h2>
        </div>
        <button 
          onClick={() => setShowInput(!showInput)} 
          className="btn btn-secondary"
          style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', display: 'flex', gap: '4px', borderRadius: '8px' }}
        >
          <Plus size={14} />
          <span>Add Habit</span>
        </button>
      </div>

      {/* Add Habit Inline Form */}
      {showInput && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <input
            type="text"
            placeholder="Drink water, exercise, read..."
            required
            value={newHabitTitle}
            onChange={(e) => setNewHabitTitle(e.target.value)}
            style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
          />
          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}
          >
            Add
          </button>
        </form>
      )}

      {/* Habits Checklist Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {habits.length === 0 ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100px',
            color: 'var(--text-muted)',
            fontSize: '0.8rem',
            border: '1.5px dashed rgba(255, 255, 255, 0.03)',
            borderRadius: 'var(--radius-sm)',
            textAlign: 'center'
          }}>
            Establish your first habit to begin building streaks!
          </div>
        ) : (
          habits.map((habit) => (
            <div key={habit._id} className="habit-row">
              {/* Title & Streak Info */}
              <div className="habit-title-container">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 550, color: 'var(--text-primary)' }}>
                    {habit.title}
                  </span>
                  
                  {/* Streak display */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Flame 
                      size={12} 
                      color={habit.streak > 0 ? 'var(--accent-yellow)' : 'var(--text-muted)'} 
                      fill={habit.streak > 0 ? 'var(--accent-yellow)' : 'none'}
                    />
                    <span style={{ 
                      fontSize: '0.7rem', 
                      color: habit.streak > 0 ? 'var(--accent-yellow)' : 'var(--text-muted)',
                      fontWeight: habit.streak > 0 ? 600 : 400
                    }}>
                      {habit.streak} day streak
                    </span>
                  </div>
                </div>
              </div>

              {/* 7-Day Completion Checkboxes */}
              <div className="habit-week-grid">
                {recentDays.map((day) => {
                  const isCompleted = habit.completedDates.includes(day.dateStr);
                  return (
                    <div key={day.dateStr} className="habit-day-col">
                      <span className="habit-day-label">{day.dayName[0]}</span>
                      <button
                        onClick={() => onToggleHabit(habit._id, day.dateStr)}
                        className={`habit-day-checkbox ${isCompleted ? 'completed' : ''}`}
                        title={`${habit.title}: ${day.dayName} (${day.dateStr})`}
                      >
                        {isCompleted && <Check size={12} color="#fff" strokeWidth={3} />}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Delete button */}
              <button
                onClick={() => onDeleteHabit(habit._id)}
                className="btn-icon"
                style={{ padding: '0.35rem' }}
                title="Delete Habit"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))
        )}
      </div>
    </GlassCard>
  );
};

export default HabitTracker;
