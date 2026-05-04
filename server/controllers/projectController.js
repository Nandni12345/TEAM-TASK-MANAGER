const Project = require('../models/Project');

const getProjects = async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'Admin') {
      projects = await Project.find({ owner: req.user.id }).populate('members', 'name email');
    } else {
      projects = await Project.find({ members: req.user.id }).populate('owner', 'name email');
    }
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('members', 'name email').populate('owner', 'name email');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    // Check if user is owner or member
    if (project.owner._id.toString() !== req.user.id && !project.members.some(m => m._id.toString() === req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to view this project' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createProject = async (req, res) => {
  try {
    const { name, description, members } = req.body;
    const project = await Project.create({
      name,
      description,
      owner: req.user.id,
      members: members || []
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the owner can update the project' });
    }

    const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the owner can delete the project' });
    }

    await project.deleteOne();
    res.json({ message: 'Project removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProjects, getProjectById, createProject, updateProject, deleteProject };
