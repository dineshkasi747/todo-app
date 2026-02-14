import Todo from '../models/Todo.js';
import User from '../models/User.js';
import { sendNotificationToUser } from '../services/notificationService.js';

// @desc    Get all todos for logged-in user
// @route   GET /api/todos
// @access  Private
export const getTodos = async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: todos.length,
      todos,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Get single todo by ID
// @route   GET /api/todos/:id
// @access  Private
export const getTodoById = async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({ 
        success: false,
        message: 'Todo not found' 
      });
    }

    // Check if todo belongs to user
    if (todo.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized' 
      });
    }

    res.status(200).json({
      success: true,
      todo,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Create new todo
// @route   POST /api/todos
// @access  Private
export const createTodo = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ 
        success: false,
        message: 'Title is required' 
      });
    }

    const todo = await Todo.create({
      title,
      description,
      user: req.user._id,
    });

    // ✅ SEND NOTIFICATION WHEN TODO CREATED
    try {
      const user = await User.findById(req.user._id);
      if (user && user.fcmToken) {
        await sendNotificationToUser(
          user.fcmToken,
          '✅ Todo Created',
          `New task: ${title}`,
          {
            type: 'todo_created',
            todoId: todo._id.toString(),
          }
        );
        console.log(`✅ Notification sent for todo creation: ${title}`);
      } else {
        console.log('⚠️ No FCM token found for user');
      }
    } catch (notifError) {
      // Don't fail the request if notification fails
      console.error('Notification error:', notifError.message);
    }

    res.status(201).json({
      success: true,
      todo,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Update todo
// @route   PUT /api/todos/:id
// @access  Private
export const updateTodo = async (req, res) => {
  try {
    let todo = await Todo.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({ 
        success: false,
        message: 'Todo not found' 
      });
    }

    // Check if todo belongs to user
    if (todo.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized' 
      });
    }

    todo = await Todo.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      todo,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Delete todo
// @route   DELETE /api/todos/:id
// @access  Private
export const deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({ 
        success: false,
        message: 'Todo not found' 
      });
    }

    // Check if todo belongs to user
    if (todo.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized' 
      });
    }

    // Save title before deletion for notification
    const todoTitle = todo.title;

    await Todo.findByIdAndDelete(req.params.id);

    // ✅ SEND NOTIFICATION WHEN TODO DELETED
    try {
      const user = await User.findById(req.user._id);
      if (user && user.fcmToken) {
        await sendNotificationToUser(
          user.fcmToken,
          '🗑️ Todo Deleted',
          `Removed: ${todoTitle}`,
          {
            type: 'todo_deleted',
            todoId: req.params.id,
          }
        );
        console.log(`🗑️ Notification sent for todo deletion: ${todoTitle}`);
      } else {
        console.log('⚠️ No FCM token found for user');
      }
    } catch (notifError) {
      // Don't fail the request if notification fails
      console.error('Notification error:', notifError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Todo deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};