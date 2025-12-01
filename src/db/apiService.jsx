   export const API_URL = 'https://localhost:7251/PWA';
   
   //Sync From DB
export const apiFetchTodosFromServer = async () => {
    console.log('Fetching todos from server...');
  const resp = await fetch(API_URL+'/GetSavedTodos');
  if (!resp.ok) throw new Error('Failed to fetch todos');
  const data = await resp.json();
  console.log('Fetched todos from server:', data);
  return data;  // assume it's an array of todo objects
}

export const apiSaveTodosToServer = async (todo) => {
    const resp = await fetch(API_URL+'/SaveTodos', {method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(todo)
});
    if (!resp.ok) throw new Error('Failed to save todo');
    const data = await resp.json();
    console.log('Saved todos to server:', data);

}

export const apiSaveTodoToServer = async (todo) => {
    const resp = await fetch(API_URL+'/SaveTodo', {method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(todo)
});
    if (!resp.ok) throw new Error('Failed to save todo');
    const data = await resp.json();
    console.log('Saved todo to server:', data);

    return data;
}

export const apiToggleCompleted =async(id)=>{
const resp = await fetch(API_URL+`/ToggleCompleted?id=${id}`, {method: 'PUT'});
    if (!resp.ok) throw new Error('Failed to toggle todo completion');
    const data = await resp.json();
    console.log('Toggled todo completion on server:', data);
    return data;  
} 

export const apiDelete =async(id)=>{
const resp = await fetch(API_URL+`/DeleteTodo?id=${id}`, {method: 'DELETE'});
    if (!resp.ok) throw new Error('Failed to delete todo');
    const data = await resp.json();
    console.log('Deleted todo on server:', data);


}


export const apiMultipleUpload = async (e) => {
  e.preventDefault();
;
  const fileInput = e.target.elements.file; 
  const selectedFiles = fileInput.files; // Get the full FileList

  if (!selectedFiles || selectedFiles.length === 0) {
    alert("Please select files first.");
    return;
  }

  const formData = new FormData();

  // 1. Iterate through the FileList
  // Important: The key 'files' must match the parameter name List<IFormFile> in your ASP.NET controller
  for (let i = 0; i < selectedFiles.length; i++) {
    // 2. Append each file individually
    formData.append("files", selectedFiles[i]); 
  }

  try {

    const response = await fetch(API_URL+"/Upload", {
      method: "POST",
      body: formData,
    });
    
    if (response.ok) {
        alert(`Successfully uploaded ${selectedFiles.length} files!`);
        // Optional: Reset the form/input
        e.target.reset();
    } else {
        alert("Upload failed. Check server response.");
    }
  } catch (error) {
    console.error("Fetch error:", error);
    alert("An error occurred during upload.");
  }
};




