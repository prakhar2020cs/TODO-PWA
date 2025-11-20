    //Sync From DB
  export  const   fetchTodosFromServer = async () => {
    console.log('Fetching todos from server...');
  const resp = await fetch('https://localhost:7251/PWA/GetSavedTodos');
  if (!resp.ok) throw new Error('Failed to fetch todos');
  const data = await resp.json();
  console.log('Fetched todos from server:', data);
  return data;  // assume it's an array of todo objects
}

export const   saveTodosToServer = async (todo) => {
    debugger;
    const resp = await fetch('https://localhost:7251/PWA/SaveTodos', {method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(todo)
});
    if (!resp.ok) throw new Error('Failed to save todo');
    const data = await resp.json();
    console.log('Saved todos to server:', data);

}

export const   saveTodoToServer = async (todo) => {
    debugger;
    const resp = await fetch('https://localhost:7251/PWA/SaveTodo', {method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(todo)
});
    if (!resp.ok) throw new Error('Failed to save todo');
    const data = await resp.json();
    console.log('Saved todo to server:', data);

}

export const handleUpload = async (e) => {
  e.preventDefault();
debugger;
  const fileInput = e.target.elements.file;     // get the <input name="file" />
  const file = fileInput.files[0];              // get selected file

  if (!file) {
    alert("Please select a file");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  await fetch("https://localhost:7251/PWA/UploadFile", {
    method: "POST",
    body: formData,
  });

  alert("Uploaded!");
};