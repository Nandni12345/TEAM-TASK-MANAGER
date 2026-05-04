import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { CheckCircle, Clock, AlertTriangle, Layout } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard');
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="page-container">Loading dashboard...</div>;

  return (
    <div className="page-container">
      <h1 style={{ marginBottom: '2rem' }}>Dashboard Overview</h1>
      
      <div className="dashboard-grid">
        <div className="glass stat-card" style={{ borderTop: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-muted">Total Projects</span>
            <Layout size={20} color="var(--primary)" />
          </div>
          <div className="value">{stats?.totalProjects}</div>
        </div>
        
        <div className="glass stat-card" style={{ borderTop: '4px solid var(--status-progress)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-muted">Active Tasks</span>
            <Clock size={20} color="var(--status-progress)" />
          </div>
          <div className="value">{stats?.totalTasks}</div>
        </div>
        
        <div className="glass stat-card" style={{ borderTop: '4px solid var(--status-done)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-muted">Completed Tasks</span>
            <CheckCircle size={20} color="var(--status-done)" />
          </div>
          <div className="value">{stats?.doneTasks}</div>
        </div>
        
        <div className="glass stat-card" style={{ borderTop: '4px solid var(--priority-high)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-muted">Overdue Tasks</span>
            <AlertTriangle size={20} color="var(--priority-high)" />
          </div>
          <div className="value">{stats?.overdueTasks}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="glass" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Task Distribution</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { label: 'To Do', value: stats?.todoTasks, color: 'var(--status-todo)' },
              { label: 'In Progress', value: stats?.inProgressTasks, color: 'var(--status-progress)' },
              { label: 'Review', value: stats?.reviewTasks, color: 'var(--status-review)' },
              { label: 'Done', value: stats?.doneTasks, color: 'var(--status-done)' }
            ].map(item => (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  <span>{item.label}</span>
                  <span>{item.value}</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${stats?.totalTasks ? (item.value / stats.totalTasks) * 100 : 0}%`, height: '100%', background: item.color, borderRadius: '4px' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
