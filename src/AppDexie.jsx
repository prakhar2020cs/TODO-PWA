import React, { useState, useEffect } from 'react';
import { useTodos } from '../src/hooks/useIndexedDB.jsx';
import { dbService } from './db/dbService.jsx';
import  {saveTodoToServer, handleUpload }  from './db/apiService.jsx';
 import { addTodo } from './features/todoThunks.js';

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




const AppDexie = () => {
  const [filter, setFilter] = useState('all');
  const [newTodoTitle, setNewTodoTitle] = useState('');

  const isOnline = useOnlineStatus();



  const {
    
    todos,
    loading,
    // addTodo,
    toggleComplete,
    deleteTodo,
    updateTodo,
  } = useTodos(filter);

  const handleAddTodo = async (e) => {
    e.preventDefault();
  
    if (newTodoTitle.trim()) {

       if(isOnline){
      await saveTodoToServer({
       Title: newTodoTitle,
      Content:  '',
      Created: new Date().toISOString(),
      });
    }

   
      await addTodo({
        title: newTodoTitle,
      });
      setNewTodoTitle('');
    }
  };

  useEffect(()=>{
console.log(todos);
if(isOnline){
  dbService.syncTodos();
}

  },
   [isOnline] )


     const OnlineStatusBanner = () => (
    <div className={`p-1 text-sm text-center font-medium rounded-t-lg transition-all duration-300 ${
      isOnline ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`}>
      {isOnline ? 'Online ' : 'Offline '}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">📝 Todo App</h1>
          <p className="text-gray-600">Powered by IndexedDB (Dexie)</p>

          <OnlineStatusBanner/>
        </div>


        {/* Add Todo Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <form onSubmit={()=>addTodo(newTodoTitle)} className="flex gap-3">
            <input
              type="text"
              value={newTodoTitle}
              onChange={(e) => setNewTodoTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Add
            </button>
          </form>
        </div>

 

        {/* Todo List */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading todos...</div>
          ) : todos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {filter === 'all' 
                ? '🎉 No todos yet! Add one above.' 
                : `No ${filter} todos.`}
            </div>
          ) : (
            <div className="space-y-3">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className={`flex items-center gap-3 p-4 border-l-4 rounded-lg 
                  )}`}
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleComplete(todo.id)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div
                      className={`font-medium ${
                        todo.completed
                          ? 'line-through text-gray-500'
                          : 'text-gray-800'
                      }`}
                    >
                      {todo.Title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(todo.Created).toLocaleDateString()} • Priority: {todo.priority}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
          
        
        </div>

        {/* Info */}
        <div className="mt-6 text-center text-sm text-gray-600 bg-white rounded-lg shadow p-4">
          💾 All todos are stored in your browser's IndexedDB. They persist even after closing the browser!
        </div>
        {/* Upload */}
       <form onSubmit={handleUpload} className="mt-6 text-center text-sm text-gray-600 bg-white rounded-lg shadow p-4">
  <input type="file" name="file" />
  <button className="border" type="submit">Submit</button>
</form>
         
        
      </div>
    </div>
  );
};

export default AppDexie;