import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { useSelector } from 'react-redux';

export interface Todo {
     id: any;
    Title: any;
    Content: string;
    Created: string;
    UpdatedAt: string;
    Completed: boolean;
}

export interface TodoState {
  todos: Todo[]
}

const initialState: TodoState = {
  todos: [],
}

export const todoSlice = createSlice({
  name: 'todo',
  initialState,
  reducers: {
    addTodoLocal: (state, action: PayloadAction<Todo>) => {
      state.todos.push(action.payload)
    },

    removeTodo: (state, action: PayloadAction<string>) => {
      state.todos = state.todos.filter((t) => t.id !== action.payload)
    },

    toggleTodo: (state, action: PayloadAction<{id:any, toggleState:boolean } >) => {
      const {id, toggleState} = action.payload;
      const todo = state.todos.find((t) => t.id === id)
      if (todo) {
        todo.Completed = toggleState
      }
    },

    setTodos: (state, action: PayloadAction<Todo[]>) => {
      state.todos = action.payload
    },
  },
})

export const { addTodoLocal, removeTodo,  setTodos, toggleTodo } = todoSlice.actions

export default todoSlice.reducer
