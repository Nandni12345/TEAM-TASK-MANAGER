const Task = require('../models/Task');
const Project = require('../models/Project');

const getTasksByProject = async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId }).populate('assignee', 'name email');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTask = async (req, res) => {
  try {
    const { title, description, projectId, assigneeId, status, priority, dueDate } = req.body;
    
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the project owner can create tasks' });
    }

    const task = await Task.create({
      title,
      description,
      project: projectId,
      assignee: assigneeId || null,
      status,
      priority,
      dueDate
    });

    // Auto-add assignee to project members so they can see the project
    if (assigneeId) {
      await Project.findByIdAndUpdate(
        projectId,
        { $addToSet: { members: assigneeId } }, // $addToSet prevents duplicate entries
        { new: true }
      );
    }

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const isOwner = req.user.role === 'Admin';
    const isAssignee = task.assignee && task.assignee.toString() === req.user.id;

    if (!isOwner && !isAssignee) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    // Members can only update status
    let updateData = req.body;
    if (!isOwner && isAssignee) {
      updateData = { status: req.body.status }; 
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, updateData, { new: true });

    // If admin reassigned the task to a new user, add them to project members too
    if (isOwner && req.body.assigneeId) {
      await Project.findByIdAndUpdate(
        task.project,
        { $addToSet: { members: req.body.assigneeId } },
        { new: true }
      );
    }

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to delete task' });
    }

    await task.deleteOne();
    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTasksByProject, createTask, updateTask, deleteTask };
