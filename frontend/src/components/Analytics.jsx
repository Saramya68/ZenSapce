import React from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from 'chart.js';
import { Activity, Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import GlassCard from './GlassCard';

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Analytics = ({ stats }) => {
  if (!stats) return null;

  const { totalMinutes, totalSessions, categoryStats, focusHistory, tasks } = stats;

  const formatHours = (mins) => {
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return remainingMins > 0 ? `${hrs}h ${remainingMins}m` : `${hrs}h`;
  };

  // Bar Chart: Focus Hours Last 7 Days
  const barChartData = {
    labels: focusHistory ? focusHistory.map(day => day.label) : [],
    datasets: [
      {
        label: 'Focus Minutes',
        data: focusHistory ? focusHistory.map(day => day.minutes) : [],
        backgroundColor: 'rgba(167, 139, 250, 0.4)',
        borderColor: '#a78bfa',
        borderWidth: 1.5,
        borderRadius: 6,
        hoverBackgroundColor: 'rgba(167, 139, 250, 0.7)',
      }
    ]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(11, 7, 30, 0.9)',
        titleFont: { family: 'Outfit', size: 12 },
        bodyFont: { family: 'Inter', size: 12 },
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        callbacks: {
          label: (context) => ` ${context.parsed.y} mins`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { family: 'Inter', size: 10 } }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', font: { family: 'Inter', size: 10 } }
      }
    }
  };

  // Doughnut Chart: Categories distribution
  const categories = Object.keys(categoryStats || {});
  const categoryValues = Object.values(categoryStats || {});
  const categoryHasData = categoryValues.some(v => v > 0);

  const doughnutChartData = {
    labels: categories,
    datasets: [
      {
        data: categoryValues,
        backgroundColor: [
          'rgba(139, 92, 246, 0.5)',  // Coding
          'rgba(6, 182, 212, 0.5)',  // Design
          'rgba(236, 72, 153, 0.5)',  // Planning
          'rgba(245, 158, 11, 0.5)',  // Learning
          'rgba(16, 185, 129, 0.5)',  // Review
          'rgba(100, 116, 139, 0.5)'  // Other
        ],
        borderColor: [
          '#8b5cf6',
          '#06b6d4',
          '#ec4899',
          '#f59e0b',
          '#10b981',
          '#64748b'
        ],
        borderWidth: 1.5,
        hoverOffset: 4
      }
    ]
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#f8fafc',
          font: { family: 'Inter', size: 9 },
          padding: 8,
          boxWidth: 8,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'rgba(11, 7, 30, 0.9)',
        titleFont: { family: 'Outfit', size: 12 },
        bodyFont: { family: 'Inter', size: 12 },
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        callbacks: {
          label: (context) => ` ${context.label}: ${formatHours(context.parsed)}`
        }
      }
    },
    cutout: '65%'
  };

  return (
    <GlassCard padding="1.25rem" glow={false}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <TrendingUp size={20} className="glow-text-purple" color="var(--accent-purple)" />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 650 }}>Flow Insights</h2>
      </div>

      {/* Grid of Micro Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.75rem',
        marginBottom: '1.25rem'
      }}>
        {/* Stat 1 */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.15)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px'
        }}>
          <Clock size={16} color="var(--accent-cyan)" />
          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Focus Time</span>
          <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>{formatHours(totalMinutes)}</span>
        </div>

        {/* Stat 2 */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.15)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px'
        }}>
          <Activity size={16} color="var(--accent-purple)" />
          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Sessions</span>
          <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>{totalSessions}</span>
        </div>

        {/* Stat 3 */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.15)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px'
        }}>
          <CheckCircle2 size={16} color="var(--accent-green)" />
          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Tasks Done</span>
          <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
            {tasks ? `${tasks.completed}/${tasks.total}` : '0/0'}
          </span>
        </div>
      </div>

      {/* Grid of Charts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Chart 1: Focus Hours */}
        <div>
          <h3 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 550 }}>
            Recent Activity (Minutes)
          </h3>
          <div style={{ height: '140px', position: 'relative' }}>
            {focusHistory && focusHistory.length > 0 ? (
              <Bar data={barChartData} options={barChartOptions} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                No focus records yet
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Focus Categories */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '1rem' }}>
          <h3 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 550 }}>
            Distribution by Category
          </h3>
          <div style={{ height: '180px', position: 'relative' }}>
            {categoryHasData ? (
              <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                Complete focus sessions to see categories
              </div>
            )}
          </div>
        </div>

      </div>
    </GlassCard>
  );
};

export default Analytics;
