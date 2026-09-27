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
    animation: {
      duration: 900,
      easing: 'easeOutQuart'
    },
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
        ticks: {
          color: '#94a3b8',
          font: { family: 'Inter', size: 10 }
        }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: {
          color: '#94a3b8',
          font: { family: 'Inter', size: 10 }
        }
      }
    }
  };

  // Doughnut Chart
  const categories = Object.keys(categoryStats || {});
  const categoryValues = Object.values(categoryStats || {});
  const categoryHasData = categoryValues.some(v => v > 0);

  const doughnutChartData = {
    labels: categories,
    datasets: [
      {
        data: categoryValues,
        backgroundColor: [
          'rgba(139, 92, 246, 0.5)',
          'rgba(6, 182, 212, 0.5)',
          'rgba(236, 72, 153, 0.5)',
          'rgba(245, 158, 11, 0.5)',
          'rgba(16, 185, 129, 0.5)',
          'rgba(100, 116, 139, 0.5)'
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
        hoverOffset: 7
      }
    ]
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
      easing: 'easeOutQuart'
    },
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
          label: (context) =>
            ` ${context.label}: ${formatHours(context.parsed)}`
        }
      }
    },
    cutout: '65%'
  };

  const statCardStyle = {
    background: 'rgba(0, 0, 0, 0.15)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.75rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '3px',
    animation: 'analyticsFadeUp 0.6s ease-out both',
    transition:
      'transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
    cursor: 'default'
  };

  return (
    <>
      {/* Animation Styles */}
      <style>
        {`
          @keyframes analyticsFadeUp {
            from {
              opacity: 0;
              transform: translateY(12px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes analyticsFloat {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-3px);
            }
          }

          .analytics-stat:hover {
            transform: translateY(-3px);
            border-color: rgba(167, 139, 250, 0.35) !important;
            box-shadow: 0 8px 25px rgba(139, 92, 246, 0.10);
          }

          .analytics-chart {
            animation: analyticsFadeUp 0.8s ease-out both;
          }

          .analytics-icon {
            animation: analyticsFloat 3s ease-in-out infinite;
          }

          @media (prefers-reduced-motion: reduce) {
            .analytics-stat,
            .analytics-chart,
            .analytics-icon {
              animation: none !important;
              transition: none !important;
            }
          }
        `}
      </style>

      <GlassCard padding="1.25rem" glow={false}>

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.25rem',
            animation: 'analyticsFadeUp 0.5s ease-out both'
          }}
        >
          <TrendingUp
            size={20}
            className="glow-text-purple analytics-icon"
            color="var(--accent-purple)"
          />

          <h2 style={{ fontSize: '1.25rem', fontWeight: 650 }}>
            Flow Insights
          </h2>
        </div>

        {/* Micro Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.75rem',
            marginBottom: '1.25rem'
          }}
        >

          {/* Focus Time */}
          <div
            className="analytics-stat"
            style={{
              ...statCardStyle,
              animationDelay: '0.05s'
            }}
          >
            <Clock size={16} color="var(--accent-cyan)" />

            <span
              style={{
                fontSize: '0.65rem',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase'
              }}
            >
              Focus Time
            </span>

            <span
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                color: '#fff'
              }}
            >
              {formatHours(totalMinutes)}
            </span>
          </div>

          {/* Sessions */}
          <div
            className="analytics-stat"
            style={{
              ...statCardStyle,
              animationDelay: '0.12s'
            }}
          >
            <Activity size={16} color="var(--accent-purple)" />

            <span
              style={{
                fontSize: '0.65rem',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase'
              }}
            >
              Sessions
            </span>

            <span
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                color: '#fff'
              }}
            >
              {totalSessions}
            </span>
          </div>

          {/* Tasks */}
          <div
            className="analytics-stat"
            style={{
              ...statCardStyle,
              animationDelay: '0.19s'
            }}
          >
            <CheckCircle2 size={16} color="var(--accent-green)" />

            <span
              style={{
                fontSize: '0.65rem',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase'
              }}
            >
              Tasks Done
            </span>

            <span
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                color: '#fff'
              }}
            >
              {tasks ? `${tasks.completed}/${tasks.total}` : '0/0'}
            </span>
          </div>
        </div>

        {/* Charts */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}
        >

          {/* Focus Activity */}
          <div
            className="analytics-chart"
            style={{ animationDelay: '0.25s' }}
          >
            <h3
              style={{
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                marginBottom: '0.5rem',
                fontWeight: 550
              }}
            >
              Recent Activity (Minutes)
            </h3>

            <div
              style={{
                height: '140px',
                position: 'relative'
              }}
            >
              {focusHistory && focusHistory.length > 0 ? (
                <Bar
                  data={barChartData}
                  options={barChartOptions}
                />
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: 'var(--text-muted)',
                    fontSize: '0.8rem'
                  }}
                >
                  No focus records yet
                </div>
              )}
            </div>
          </div>

          {/* Categories */}
          <div
            className="analytics-chart"
            style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              paddingTop: '1rem',
              animationDelay: '0.4s'
            }}
          >
            <h3
              style={{
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                marginBottom: '0.5rem',
                fontWeight: 550
              }}
            >
              Distribution by Category
            </h3>

            <div
              style={{
                height: '180px',
                position: 'relative'
              }}
            >
              {categoryHasData ? (
                <Doughnut
                  data={doughnutChartData}
                  options={doughnutChartOptions}
                />
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: 'var(--text-muted)',
                    fontSize: '0.8rem'
                  }}
                >
                  Complete focus sessions to see categories
                </div>
              )}
            </div>
          </div>

        </div>
      </GlassCard>
    </>
  );
};

export default Analytics;

