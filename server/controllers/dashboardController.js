const Task = require('../models/Task');
const Project = require('../models/Project');

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    let projects;
    let taskFilter = {};

    if (role === 'Admin') {
      projects = await Project.find({ owner: userId });
      taskFilter = { project: { $in: projects.map(p => p._id) } };
    } else {
      projects = await Project.find({ members: userId });
      taskFilter = { assignee: userId };
    }

    const tasks = await Task.find(taskFilter);

    const stats = {
      totalProjects: projects.length,
      totalTasks: tasks.length,
      todoTasks: tasks.filter(t => t.status === 'To Do').length,
      inProgressTasks: tasks.filter(t => t.status === 'In Progress').length,
      reviewTasks: tasks.filter(t => t.status === 'Review').length,
      doneTasks: tasks.filter(t => t.status === 'Done').length,
      overdueTasks: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done').length,
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats };
