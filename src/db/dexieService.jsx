import Dexie from 'dexie';

export class DexieService extends Dexie {
  constructor() {
    super('TodoAppDB'); // Database name
    
    // Define version and tables
    this.version(6).stores({
      // Todos table
      // ++ means auto-increment primary key
      todos: '++id, Title, Content, Created, Completed, UpdatedAt',
          // AddThis when using offline Sync
          // syncQueue: "++id, operation, table, timestamp"

    });

      // Hook to set default values before adding a todo
    this.todos.hook('creating', (primKey, obj, transaction) => {
      const now = new Date();
      if (obj.Content === undefined) obj.Content = null;
      if (obj.Created === undefined) obj.Created = null;
      if (obj.UpdatedAt === undefined) obj.UpdatedAt = null;
      if (obj.Completed === undefined) obj.Completed = false;
    });

  }
}

// Create and export singleton instance
export const db = new DexieService();