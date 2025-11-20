import { createAsyncThunk } from "@reduxjs/toolkit";
import {dbService} from "../db/dbService"; // your Dexie service
import { addTodoLocal } from "./todoSlice";

export const addTodo = createAsyncThunk(
  "todo/addTodoLocal",
  async (todo:string, { dispatch }) => {
    await dbService.addTodo(todo);         // 💾 save to IndexedDB
    dispatch(addTodoLocal(todo));     // 🟡 update Redux store
  }
);
