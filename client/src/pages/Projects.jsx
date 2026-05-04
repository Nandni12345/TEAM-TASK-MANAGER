import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Plus, Users } from 'lucide-react';
import ProjectModal from '../components/ProjectModal';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useContext(AuthContext);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Projects</h1>
        {user?.role === 'Admin' && (
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> New Project
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {projects.map(project => (
          <Link key={project._id} to={`/projects/${project._id}`} className="glass project-card task-card">
            <h3>{project.name}</h3>
            <p>{project.description || 'No description provided.'}</p>
            <div className="project-footer">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                <Users size={16} />
                <span>{project.members?.length || 0} Members</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {new Date(project.createdAt).toLocaleDateString()}
              </span>
            </div>
          </Link>
        ))}
        {projects.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', background: 'var(--bg-card)', borderRadius: '12px' }}>
            <p className="text-muted">No projects found. {user?.role === 'Admin' ? 'Create one to get started!' : 'Wait for an admin to assign you to a project.'}</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <ProjectModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => {
            setIsModalOpen(false);
            fetchProjects();
          }} 
        />
      )}
    </div>
  );
}
