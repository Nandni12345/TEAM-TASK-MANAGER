import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Plus } from 'lucide-react';
import TaskModal from '../components/TaskModal';

const STATUSES = ['To Do', 'In Progress', 'Review', 'Done'];

export default function Board() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const { user } = useContext(AuthContext);

  const fetchData = async () => {
    try {
      const projRes = await api.get(`/projects/${id}`);
      setProject(projRes.data);
      const tasksRes = await api.get(`/tasks/project/${id}`);
      setTasks(tasksRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDrop = async (e, status) => {
    const taskId = e.dataTransfer.getData('taskId');
    const task = tasks.find(t => t._id === taskId);
    
    // Check permission (Admins or Assignees can update)
    if (user.role !== 'Admin' && (!task.assignee || task.assignee._id !== user._id)) {
      alert("You don't have permission to update this task.");
      return;
    }

    try {
      await api.put(`/tasks/${taskId}`, { status });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (!project) return <div className="page-container">Loading board...</div>;

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>{project.name}</h1>
          <p className="text-muted">{project.description}</p>
        </div>
        {user?.role === 'Admin' && (
          <button className="btn btn-primary" onClick={() => { setSelectedTask(null); setIsModalOpen(true); }}>
            <Plus size={18} /> Add Task
          </button>
        )}
      </div>

      <div className="board">
        {STATUSES.map(status => (
          <div 
            key={status} 
            className="board-column glass"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, status)}
            style={{ padding: '1rem', border: '1px dashed transparent' }}
          >
            <div className="column-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: `var(--status-${status.toLowerCase().replace(' ', '')})` }}></div>
                {status}
              </span>
              <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>
                {tasks.filter(t => t.status === status).length}
              </span>
            </div>
            
            <div className="task-list" style={{ marginTop: '1rem' }}>
              {tasks.filter(t => t.status === status).map(task => (
                <div 
                  key={task._id} 
                  className="task-card glass" 
                  draggable 
                  onDragStart={(e) => handleDragStart(e, task._id)}
                  onClick={() => { setSelectedTask(task); setIsModalOpen(true); }}
                  style={{ cursor: 'pointer', borderLeft: `3px solid var(--priority-${task.priority.toLowerCase()})` }}
                >
                  <div className="task-header">
                    <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{task.title}</h4>
                  </div>
                  {task.description && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {task.description}
                    </p>
                  )}
                  <div className="task-footer">
                    <span className={`badge priority-${task.priority.toLowerCase()}`} style={{ background: 'rgba(255,255,255,0.05)' }}>
                      {task.priority}
                    </span>
                    {task.assignee && (
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }} title={task.assignee.name}>
                        {task.assignee.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <TaskModal 
          projectId={id}
          task={selectedTask}
          members={project.members}
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => {
            setIsModalOpen(false);
            fetchData();
          }} 
        />
      )}
    </div>
  );
}
