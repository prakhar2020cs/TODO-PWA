import Dexie from 'dexie';

export class DexieService extends Dexie {
  constructor() {
    super('TodoAppDB'); // Database name
    
    // Define version and tables
    this.version(3).stores({
      // Todos table
      // ++ means auto-increment primary key
      todos: '++id, title, content, created',
      
      // Categories table (optional - for organizing todos)
    //   categories: '++id, name, color',
      
      // Tags table (optional - for tagging todos)
    //   tags: '++id, name'
    });
  }
}

// Create and export singleton instance
export const db = new DexieService();