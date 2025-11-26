import { useState, useEffect } from 'react';
import { dbService } from '../db/dbService';
import { useDispatch, useSelector } from 'react-redux';
import { addTodoLocal, setTodos } from '../features/todoSlice';

// Hook to manage all todos
export const useTodos = () => {
  // const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();

const todos = useSelector((state) => state.todo.todos);


  const loadTodos = async () => {
    setLoading(true);
    try {
      let data;
      
          data = await dbService.getAllTodos();
      console.log('Loaded todos from IndexedDB:', data);
      
      // Sort by createdAt (newest first)
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    dispatch(setTodos(data));      
      // Load stats
    } catch (error) {
      console.error('Error loading todos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodos();
  }, []);



  // const addTodo = async (todo) => {
  //   const newTodo = await dbService.addTodo(todo);
  //   await loadTodos(); // Refresh list
  //   return newTodo;
  // };

  const updateTodo = async (id, updates) => {
    await dbService.updateTodo(id, updates);
    await loadTodos();
  };

  const toggleComplete = async (id, state) => {
    await dbService.toggleTodoComplete(id, state);
    await loadTodos();
  };

  const deleteTodo = async (id) => {
    await dbService.deleteTodo(id);
    await loadTodos();
  };

 

  return {
    todos,
    loading,
    // addTodo,
    updateTodo,
    toggleComplete,
    deleteTodo,
    refresh: loadTodos
  };
};
