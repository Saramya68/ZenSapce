import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Auth from './components/Auth';
import KanbanBoard from './components/KanbanBoard';
import PomodoroTimer from './components/PomodoroTimer';
import HabitTracker from './components/HabitTracker';
import AmbientSounds from './components/AmbientSounds';
import Analytics from './components/Analytics';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Authenticate user on mount if token exists
  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Fetch all dashboard data when user is authenticated
  useEffect(() => {
    if (user && token) {
      fetchDashboardData(token);
    }
  }, [user, token]);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/user', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Unauthorized');
      }
      const data = await response.json();
      setUser(data);
    } catch (err) {
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async (authToken) => {
    const activeToken = authToken || token;
    if (!activeToken) return;
    try {
      const headers = { 'Authorization': `Bearer ${activeToken}` };
      
      const [tasksRes, habitsRes, statsRes] = await Promise.all([
        fetch('/api/tasks', { headers }),
        fetch('/api/habits', { headers }),
        fetch('/api/analytics/stats', { headers })
      ]);

      if (tasksRes.ok) setTasks(await tasksRes.json());
      if (habitsRes.ok) setHabits(await habitsRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  };

  const handleAuthSuccess = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    setTasks([]);
    setHabits([]);
    setStats(null);
  };

  const refreshStats = async () => {
    try {
      const response = await fetch('/api/analytics/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setStats(await response.json());
      }
    } catch (err) {
      console.error('Error refreshing stats:', err);
    }
  };

  // --- Task Operations ---
  const handleAddTask = async (taskData) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(taskData)
      });
      if (response.ok) {
        const newTask = await response.json();
        setTasks(prev => [newTask, ...prev]);
        refreshStats();
      }
    } catch (err) {
      console.error('Error adding task:', err);
    }
  };

  const handleUpdateTask = async (taskId, fieldsToUpdate) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(fieldsToUpdate)
      });
      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(prev => prev.map(t => t._id === taskId ? updatedTask : t));
        refreshStats();
      }
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setTasks(prev => prev.filter(t => t._id !== taskId));
        refreshStats();
      }
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  // --- Habit Operations ---
  const handleAddHabit = async (title) => {
    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title })
      });
      if (response.ok) {
        const newHabit = await response.json();
        setHabits(prev => [newHabit, ...prev]);
      }
    } catch (err) {
      console.error('Error adding habit:', err);
    }
  };

  const handleToggleHabit = async (habitId, dateStr) => {
    try {
      const response = await fetch(`/api/habits/${habitId}/toggle`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ date: dateStr })
      });
      if (response.ok) {
        const updatedHabit = await response.json();
        setHabits(prev => prev.map(h => h._id === habitId ? updatedHabit : h));
      }
    } catch (err) {
      console.error('Error toggling habit:', err);
    }
  };

  const handleDeleteHabit = async (habitId) => {
    try {
      const response = await fetch(`/api/habits/${habitId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setHabits(prev => prev.filter(h => h._id !== habitId));
      }
    } catch (err) {
      console.error('Error deleting habit:', err);
    }
  };

  // --- Focus Timer Operations ---
  const handleFocusSessionComplete = async (sessionData) => {
    try {
      const response = await fetch('/api/analytics/focus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(sessionData)
      });
      if (response.ok) {
        refreshStats();
      }
    } catch (err) {
      console.error('Error saving focus session:', err);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        color: 'var(--text-secondary)'
      }}>
        <h2>Loading Sanctuary...</h2>
      </div>
    );
  }

  return (
    <div className="app-container">
      {user ? (
        <>
          <Navbar 
            user={user} 
            onLogout={handleLogout} 
            totalFocusTime={stats ? stats.totalMinutes : 0} 
          />
          <div className="dashboard-grid">
            {/* Left Main Workspace: Kanban Task Board */}
            <div className="left-column">
              <KanbanBoard 
                tasks={tasks}
                onAddTask={handleAddTask}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
              />
            </div>

            {/* Right Side: Focus Timer, Sounds, Habits & Analytics */}
            <div className="right-column">
              <PomodoroTimer 
                onSessionComplete={handleFocusSessionComplete} 
              />
              <AmbientSounds />
              <HabitTracker 
                habits={habits}
                onAddHabit={handleAddHabit}
                onToggleHabit={handleToggleHabit}
                onDeleteHabit={handleDeleteHabit}
              />
              <Analytics 
                stats={stats} 
              />
            </div>
          </div>
        </>
      ) : (
        <Auth onAuthSuccess={handleAuthSuccess} />
      )}
    </div>
  );
};

export default App;
