import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Todo {
  id: string
  text: string
  completed: boolean
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
    addTodoLocal: (state, action: PayloadAction<string>) => {
      state.todos.push({
        id: crypto.randomUUID(),
        text: action.payload,
        completed: false,
      })
    },

    removeTodo: (state, action: PayloadAction<string>) => {
      state.todos = state.todos.filter((t) => t.id !== action.payload)
    },

    toggleTodo: (state, action: PayloadAction<string>) => {
      const todo = state.todos.find((t) => t.id === action.payload)
      if (todo) {
        todo.completed = !todo.completed
      }
    },

    setTodos: (state, action: PayloadAction<Todo[]>) => {
      state.todos = action.payload
    },
  },
})

export const { addTodoLocal, removeTodo, toggleTodo, setTodos } = todoSlice.actions

export default todoSlice.reducer
