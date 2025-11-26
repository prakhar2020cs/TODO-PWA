import { apiFetchTodosFromServer , apiSaveTodosToServer } from './apiService';
import { db } from './dexieService';
import {  useTodos } from '../hooks/useIndexedDB.jsx';




export class DbService {
  constructor() {
    this.todosTable = db.todos;
  }





  // ============ TODO METHODS ============


 async  syncTodos() {
  try {
    let localTodos = await this.getAllTodos();
       let  localTodosWOid = localTodos.map(todo => ({
           Title: todo.Title || todo.title,}));

   await apiSaveTodosToServer(localTodosWOid);

    const todosFromServer = await apiFetchTodosFromServer();
console.log('Todos fetched from server for sync:', todosFromServer);
    // Upsert into Dexie
  await db.transaction('rw', db.todos, async () => {
  for (const todo of todosFromServer) {
    await db.todos.put({
      id: todo.id,
      Title: todo.title,                  // map lowercase 'title' to 'Title'
      Content: todo.content ?? null,
      Created: todo.created ?? null,
      UpdatedAt: todo.updatedAt ?? new Date().toISOString(),
      Completed: todo.completed ?? false
    });
  }

  
});


    console.log('Sync complete: todos saved locally');
  } catch (err) {
    console.error('Sync failed', err);
  }
}
  
  // Create a new todo
  async addTodo(title) {
    const newTodo = {
      Title: title,
    };
    
    const id = await this.todosTable.add(newTodo);
    return { ...newTodo, id };
  }

  
  // Get all todos
  async getAllTodos() {
    return await this.todosTable.toArray();
  }


  // Get a single todo by ID
  async getTodo(id) {
    return await this.todosTable.get(id);
  }


  // Get todos by status
  async getTodosByStatus(Completed) {
    return await this.todosTable
      .filter(todo => todo.Completed === Completed)
      .toArray();
  }

  // Get todos by category
  async getTodosByCategory(category) {
    return await this.todosTable
      .filter(todo => todo.category === category)
      .toArray();
  }

  // Get todos by priority
  async getTodosByPriority(priority) {
    return await this.todosTable
      .filter(todo => todo.priority === priority)
      .toArray();
  }

  // Search todos by title
  async searchTodos(searchTerm) {
    const allTodos = await this.todosTable.toArray();
    return allTodos.filter(todo => 
      todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (todo.description && todo.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }

  // Update a todo
  async updateTodo(id, updates) {
    const updatedData = {
      ...updates,
      UpdatedAt: new Date().toISOString()
    };
    
    await this.todosTable.update(id, updatedData);
    return await this.getTodo(id);
  }

  // Toggle todo completion
  async toggleTodoComplete(id, state) {
    const todo = await this.getTodo(id);
    await this.todosTable.update(id, { 
      Completed: state,
      UpdatedAt: new Date().toISOString()
    });
    return await this.getTodo(id);
  }

  // Delete a todo
  async deleteTodo(id) {
    await this.todosTable.delete(id);
  }

  // Delete all completed todos
  async deleteCompletedTodos() {
    const completed = await this.getTodosByStatus(true);
    const ids = completed.map(todo => todo.id);
    await this.todosTable.bulkDelete(ids);
  }

  // Clear all todos
  async clearAllTodos() {
    await this.todosTable.clear();
  }
}

export const dbService = new DbService();