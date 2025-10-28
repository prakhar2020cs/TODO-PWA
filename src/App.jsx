import React, { useState, useEffect, useCallback, useMemo } from 'react';

// NOTE: LocalForage dependency removed to fix the compilation error.
// Data persistence now uses native localStorage, which is inherently available.

// --- Custom Hook for Online Status Detection (Still useful for PWAs) ---
const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
     return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

// --- Data Persistence Layer (localStorage CRUD Operations) ---

// Key used to store the entire todos array in localStorage
const STORAGE_KEY = 'todoList';

/** Fetches todos from localStorage (Requires parsing as it stores strings) */
const getLocalTodos = async () => {
    try {
        const storedJson = localStorage.getItem(STORAGE_KEY);
        // If data exists, parse it. Otherwise, return an empty array.
        const storedTodos = storedJson ? JSON.parse(storedJson) : [];
        return Array.isArray(storedTodos) ? storedTodos : [];
    } catch (e) {
        console.error("Error reading from local storage:", e);
        return [];
    }
};

/** Saves the current array of todos back to localStorage (Requires stringification) */
const saveLocalTodos = async (currentTodos) => {
    try {
        // localStorage only accepts strings, so we must serialize the array
        const jsonString = JSON.stringify(currentTodos);
        localStorage.setItem(STORAGE_KEY, jsonString);
    } catch (e) {
        console.error("Error writing to local storage:", e);
    }
};


// --- UI Components (Moved outside App for performance and focus fix) ---

const TodoItem = React.memo(({ todo, toggleTodo, deleteTodo }) => (
    <div 
      className={`flex items-center justify-between p-4 mb-2 rounded-lg shadow transition duration-300 ease-in-out 
        ${todo.completed 
          ? 'bg-green-100 dark:bg-green-800 border-l-4 border-green-500' 
          : 'bg-white dark:bg-gray-700 hover:shadow-lg'}`
      }
    >
      <div 
        className="flex-1 mr-4 cursor-pointer" 
        onClick={() => toggleTodo(todo.id, todo.completed)}
      >
        <p className={`text-gray-900 dark:text-gray-100 text-lg font-medium 
          ${todo.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}
        >
          {todo.text}
        </p>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => toggleTodo(todo.id, todo.completed)}
          className={`p-2 rounded-full transition duration-150 ease-in-out 
            ${todo.completed 
              ? 'bg-green-500 hover:bg-green-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-200'}`
          }
          aria-label={todo.completed ? "Mark as Incomplete" : "Mark as Complete"}
        >
          {/* Check/Circle Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {todo.completed ? 
              <polyline points="20 6 9 17 4 12"></polyline> : 
              <circle cx="12" cy="12" r="10"></circle>
            }
          </svg>
        </button>

        <button
          onClick={() => deleteTodo(todo.id)}
          className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition duration-150 ease-in-out"
          aria-label="Delete Todo"
        >
          {/* Trash Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    </div>
  ));

const AddTodo = React.memo(({ newTodoText, setNewTodoText, addTodo }) => {
    const handleSubmit = (e) => {
      e.preventDefault();
      addTodo(newTodoText);
    };

    return (
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-inner">
        <input
          type="text"
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          placeholder="What needs to be done?"
          // Key added to prevent component remounting/losing focus
          key="todo-input-field" 
          className="flex-grow p-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
        <button
          type="submit"
          disabled={!newTodoText.trim()}
          className="p-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
        >
          Add Task
        </button>
      </form>
    );
  });


// --- Main App Component ---
const App = () => {
  const [todos, setTodos] = useState([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isOnline = useOnlineStatus();

  // 1. Initial Data Load from localStorage (on Mount)
  useEffect(() => {
    const loadTodos = async () => {
      try {
        const loadedTodos = await getLocalTodos();
        setTodos(loadedTodos);
      } catch (e) {
        setError("Failed to load tasks from local storage.");
        console.error("Initialization Error:", e);
      } finally {
        setLoading(false);
      }
    };
    loadTodos();
  }, []);

    // 2. Global Effect to Save Data (Saves any time the 'todos' state changes)
  // This is the key change to ensure persistence on every mutation.
  useEffect(() => {
    if (!loading) {
        saveLocalTodos(todos);
    }
  }, [todos, loading]);

  // --- CRUD Operations (Optimized using functional state updates) ---

  const addTodo = useCallback(async (text) => {
    if (!text.trim()) return;
    
    const newTodo = {
      id: crypto.randomUUID(), // Standalone ID generation
      text: text.trim(),
      completed: false,
      createdAt: Date.now(),
    };
    
    let updatedTodos = [];

    // 1. Use functional state update to safely prepend the new task
    setTodos(prevTodos => {
      updatedTodos = [newTodo, ...prevTodos]; // Calculate new array
      return updatedTodos; // Update React state
    });
    
    // 2. Persist the calculated array to local storage
    await saveLocalTodos(updatedTodos);
    
    setNewTodoText('');
  }, []); 

  const toggleTodo = useCallback(async (id, completed) => {
    let updatedTodos = [];

    // 1. Use functional state update to safely toggle the item
    setTodos(prevTodos => {
      updatedTodos = prevTodos.map(todo => 
        todo.id === id ? { ...todo, completed: !completed } : todo
      );
      return updatedTodos;
    });
    
    // 2. Persist the calculated array to local storage
    await saveLocalTodos(updatedTodos);
  }, []); 

  const deleteTodo = useCallback(async (id) => {
    let updatedTodos = [];

    // 1. Use functional state update to safely filter the item
    setTodos(prevTodos => {
      updatedTodos = prevTodos.filter(todo => todo.id !== id);
      return updatedTodos;
    });
    
    // 2. Persist the calculated array to local storage
    await saveLocalTodos(updatedTodos);
  }, []); 

  // --- UI Components ---

  const OnlineStatusBanner = () => (
    <div className={`p-3 text-sm text-center font-medium rounded-t-lg transition-all duration-300 ${
      isOnline ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`}>
      {isOnline ? 'Online (Data in localStorage)' : 'Offline (Data in localStorage)'}
    </div>
  );

  const pendingTodos = useMemo(() => todos.filter(t => !t.completed).length, [todos]);
  const sortedTodos = useMemo(() => 
    [...todos].sort((a, b) => b.createdAt - a.createdAt)
  , [todos]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans flex flex-col items-center">
      <OnlineStatusBanner />
      
      <div className="w-full max-w-2xl p-4 sm:p-8">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
            PWA Todo List (Standalone)
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            {loading ? "Loading tasks..." : `${pendingTodos} task${pendingTodos !== 1 ? 's' : ''} remaining.`}
          </p>
        </header>

        {error && (
          <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">
            <span className="font-medium">Error:</span> {error}
          </div>
        )}

        <AddTodo 
            newTodoText={newTodoText}
            setNewTodoText={setNewTodoText}
            addTodo={addTodo}
        />

        <div className="space-y-3">
          {loading ? (
            <div className="text-center p-10 text-gray-500 dark:text-gray-400">Loading...</div>
          ) : sortedTodos.length === 0 ? (
            <div className="text-center p-10 bg-white dark:bg-gray-700 rounded-xl shadow-lg">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                Your to-do list is empty! Add a new task above.
              </p>
            </div>
          ) : (
            sortedTodos.map(todo => 
              <TodoItem 
                key={todo.id} 
                todo={todo} 
                toggleTodo={toggleTodo} 
                deleteTodo={deleteTodo} 
              />
            )
          )}
        </div>

        <footer className="text-center text-xs text-gray-400 mt-10 p-4 border-t dark:border-gray-700">
            <p>Data persisted locally using localStorage (No external dependencies).</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
