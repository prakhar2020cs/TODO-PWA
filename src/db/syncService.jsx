import { db } from "./dexieService";


async function syncNow() {
  const items = await db.syncQueue.toArray();

  for (const item of items) {
    if (item.operation === "add") {
      await apiSaveTodoToServer (item.data);
    }

    // after success → remove from queue
    await db.syncQueue.delete(item.id);
  }
}


export async function addTodoToQueue(todo) {


  await db.syncQueue.add({
    operation: "add",
    table: "todos",
    data: todo,
    timestamp: Date.now()
  });
}



//for sync registration sync when back online
export const registerBackgroundSync = async (tag = 'syncTodos') => {
  
  debugger;
  //checks if browser supports service workers and background sync
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register(tag);
      console.log('Background sync registered:', tag);
      return true;
    } catch (error) {
      console.error('Background sync registration failed:', error);
      return false;
    }
  } else {
    console.warn('Background sync not supported');
    return false;
  }
};