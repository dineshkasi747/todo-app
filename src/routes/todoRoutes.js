import express from 'express';
import {
  getTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
} from '../controllers/todoController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/todos
// @desc    Get all todos
// @access  Private
router.get('/', getTodos);

// @route   POST /api/todos
// @desc    Create new todo
// @access  Private
router.post('/', createTodo);

// @route   GET /api/todos/:id
// @desc    Get single todo
// @access  Private
router.get('/:id', getTodoById);

// @route   PUT /api/todos/:id
// @desc    Update todo
// @access  Private
router.put('/:id', updateTodo);

// @route   DELETE /api/todos/:id
// @desc    Delete todo
// @access  Private
router.delete('/:id', deleteTodo);

export default router;