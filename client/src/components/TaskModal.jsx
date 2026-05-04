import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function TaskModal({ projectId, task, members = [], onClose, onSuccess }) {
  const { user } = useContext(AuthContext);
  const [title, setTitle] = useState(task ? task.title : '');
  const [description, setDescription] = useState(task ? task.description : '');
  const [status, setStatus] = useState(task ? task.status : 'To Do');
  const [priority, setPriority] = useState(task ? task.priority : 'Medium');
  const [assigneeId, setAssigneeId] = useState(task && task.assignee ? (task.assignee._id || task.assignee) : '');
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/auth/users');
        setAllUsers(res.data);
      } catch (err) {
        console.error('Failed to load users:', err?.response?.data || err.message);
      }
    };
    fetchUsers();
  }, []);

  const isAdmin = user.role === 'Admin';
  const isAssignee = task && task.assignee && task.assignee._id === user._id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (task) {
        // Update task
        const payload = isAdmin ? { title, description, status, priority, assigneeId } : { status };
        await api.put(`/tasks/${task._id}`, payload);
      } else {
        // Create task
        await api.post('/tasks', { title, description, status, priority, assigneeId, projectId });
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="glass modal-content">
        <div className="modal-header">
          <h2>{task ? (isAdmin ? 'Edit Task' : 'Update Status') : 'Create Task'}</h2>
          <button onClick={onClose}><X size={24} color="var(--text-muted)" /></button>
        </div>
        
        {error && <div style={{ color: 'var(--priority-high)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          {isAdmin || !task ? (
            <>
              <div className="form-group">
                <label>Task Title</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  className="form-control" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select className="form-control" value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="form-group">
                <label>Assignee</label>
                <select className="form-control" value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
                  <option value="">Unassigned</option>
                  {allUsers.map(member => (
                    <option key={member._id} value={member._id}>{member.name}</option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>{task.title}</h3>
              <p className="text-muted">{task.description}</p>
            </div>
          )}

          <div className="form-group">
            <label>Status</label>
            <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Review">Review</option>
              <option value="Done">Done</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
