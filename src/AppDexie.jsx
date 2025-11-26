import  { useState, useEffect } from "react";
import { useTodos } from "../src/hooks/useIndexedDB.jsx";
import { dbService } from "./db/dbService.jsx";
import { apiSaveTodoToServer , apiMultipleUpload, apiToggleCompleted, apiDelete } from "./db/apiService.jsx";
import { useDispatch, useSelector } from "react-redux";
import { addTodoLocal, removeTodo, setTodos, toggleTodo } from "./features/todoSlice.js";
import FileUploader from "./component/FileUploader.jsx";

const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
};

const AppDexie = () => {
  const [filter, setFilter] = useState("all");
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const isOnline = useOnlineStatus();

  const dispatch = useDispatch();
  const todos = useSelector((state) => state.todo.todos);

  const {
    loading,
    // addTodo,
    toggleComplete,
    deleteTodo,
    updateTodo,
  } = useTodos(filter);



const handleDelete = async (id) =>{
  debugger;
  if(isOnline){
    try {
      // API delete
      await apiDelete(id);
        // IndexedDB delete
      await deleteTodo(id);
      // Redux state
      dispatch(removeTodo(id));

        dbService.syncTodos();
console.log(todos );
    } catch (error) {
      console.error("Error deleting todo from server:", error);
    
    }
  }
}

  const handleAddTodo = async (e) => {
      e.preventDefault();
      debugger;

    if (newTodoTitle.trim() && isOnline) {
         console.log("Adding todo:", newTodoTitle);
      try {
       
          //add todo in APi DB
         const {data} =  await apiSaveTodoToServer ({
            Title: newTodoTitle
          });
          console.log("Todo saved to server:", data);
           //Add todo to index DB
            dbService.syncTodos();

              //add todo in Redux store
      dispatch(addTodoLocal(serverTodo));
      setNewTodoTitle("");
        
      } catch (error) {
        console.error("Error saving todo to server:", error);
      }
      
      //Add todo in IndexedDB
      // await addTodo(newTodoTitle
      // );

    
     
    }
    //For Offline Mode
    // else{
//    await db.syncQueue.add({
//   operation: "add",
//   table: "todos",
//   data: todo,
//   timestamp: Date.now()
// });


      // await dbService.addTodo(offlineTodo);
      // dispatch(addTodoLocal(offlineTodo));
      // await db.syncQueue.add(offlineTodo);
    // }
  };


const  handleToggleComplete = async (id) =>{
  debugger;
if(isOnline){
try {
  // DB update
  const {state:toggleState} = await apiToggleCompleted(id);

    //indexDb
   await toggleComplete(id, toggleState);

   //Redux state
    dispatch(toggleTodo({id, toggleState}));
console.log(todos, "todo state after toggle" );

} catch (error) {
  console.error("Error toggling todo complete status:", error);


}
  } 



}

  // useEffect(() => {


  //   if (isOnline) {
  //     debugger;
  //     dbService.syncTodos();

  //   async function fetchAndLoad() {
  //     const todosFromDexie = await dbService.getAllTodos();
  //     console.log(todosFromDexie , "Dexie Todos inside fetchAndLoad");
  //     dispatch(addTodoLocal(todosFromDexie));


  //   }
  //   fetchAndLoad();
  //   }
  // }, [isOnline]);
  useEffect(() => {
  if (!isOnline) return;

  (async () => {
    debugger;

    await dbService.syncTodos(); 

    const todosFromDexie = await dbService.getAllTodos();
    console.log(todosFromDexie, "Dexie Todos after sync");

    dispatch(setTodos(todosFromDexie));  // Redux now gets correct, updated todos
  })();

}, [isOnline]);

        // console.log("Redux Todos", todos);

// Event For Offline to Online Sync
//   useEffect(
//     ()=>{
      
// window.addEventListener("online", () => {
//   syncNow();
// });

//     }
//   )

  const OnlineStatusBanner = () => (
    <div
      className={`p-1 text-sm text-center font-medium rounded-t-lg transition-all duration-300 ${
        isOnline ? "bg-green-500 text-white" : "bg-red-500 text-white"
      }`}
    >
      {isOnline ? "Online " : "Offline "}
    </div>
  );




  return (

  
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">📝 Todo App</h1>
          <p className="text-gray-600">Powered by IndexedDB (Dexie)</p>

          <OnlineStatusBanner />
        </div>

        {/* Add Todo Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <form onSubmit={handleAddTodo} className="flex gap-3">
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
            <div className="text-center py-8 text-gray-500">
              Loading todos...
            </div>
          ) : todos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {filter === "all"
                ? "🎉 No todos yet! Add one above."
                : `No ${filter} todos.`}
            </div>
          ) : (
            <div className="space-y-3">
            
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center gap-3 p-4 border-l-4 rounded-lg"
                >
                  <input
                    type="checkbox"
                    checked={todo.Completed}
                    onChange={()=>handleToggleComplete(todo.id)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div
                      className={`font-medium ${
                        todo.completed
                          ? "line-through text-gray-500"
                          : "text-gray-800"
                      }`}
                    >
                      {todo.title || todo.Title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Created at:&nbsp;
                      {new Date(todo.Created || todo.created).toLocaleString()}&nbsp;
                      UpdatedAt: {todo.UpdatedAt? new Date(todo.UpdatedAt).toLocaleString():"N/A"}
                    </div>
                  </div>
                  <button
                    onClick={()=>handleDelete(todo.id)}
                    type="button"
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
          💾 All todos are stored in your browser's IndexedDB. They persist even
          after closing the browser!
        </div>
        {/* Upload */}
        {/* <form onSubmit={apiMultipleUpload}>
          <input type="file" name="file" multiple />
          <button type="submit">Upload Files</button>
        </form> */}

        {/* upload */}

        <FileUploader/>
      </div>
    </div>
  );
};

export default AppDexie;
