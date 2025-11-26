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
