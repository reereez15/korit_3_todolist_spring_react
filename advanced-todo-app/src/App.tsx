import './App.css'
import { useEffect, useState } from 'react';
import type { Todo } from './types/Todo';
import TodoForm from "./components/TodoForm"
import {TodoList} from "./components/TodoList"
import { addTodoApi, deleteTodoApi, gerAllTodos, toggleTodoApi } from './services/todoService';
// import axios from 'axios';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';

function App() {
  const [ todos, setTodos ] = useState<Todo[]>([]);
  const [ isLoading, setIsLoding ] = useState<boolean>(false);
  const [ authToken, setAuthToken ] = useState<string | null>(() => localStorage.getItem('authToken'));

  const handleLoginSuccess = (credentialResponse: CredentialResponse) => {
    const idToken = credentialResponse.credential;
    if(idToken) {
      setAuthToken(idToken);
      localStorage.setItem('authToken', idToken);
    }
  }

  const handleloginError = () => {
    console.log('로그인에 실패하였습니다.');
  }

  const handleLogout = () => {
    setAuthToken(null);
    localStorage.removeItem('authToken');
    setTodos([]);
  }

  // 최초 렌더링 시 useEffect
  useEffect(()=>{
    const fetchTodosFromServer = async () : Promise<void> => {
        if (authToken){
        try {
          setIsLoding(true);
          const serverTodos = await gerAllTodos();
          setTodos(serverTodos);
        } catch (error) {
          console.log('서버에서 데이터를 가지고 오는 데 실패했습니다. :', error);
          if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
            handleLogout();
          }
        } finally {
          setIsLoding(false);
        }
      }
    }
    fetchTodosFromServer();
  }, [authToken]);

  const handleAddTodo = async (text: string): Promise<void> => {
    if (!authToken) return;
    try {
      setIsLoding(true);
      const newTodo = await addTodoApi(text);
      setTodos(prevTodos => [...prevTodos, newTodo]);
      setIsLoding(false);
    } catch (error) {
      console.log('todo를 추가하는 데 실패했습니다: ', error)
    } finally {
      setIsLoading(false);        // 추가했습니다.
    }
  }

  const handletoggleComplete = async (id: number): Promise<void> => {
    if (!authToken) return;
    try {
      const todoToToggle = todos.find(todo => todo.id === id);
      if(!todoToToggle) return;
      const updatedTodo = await toggleTodoApi(id);       // 수정했습니다.
      setTodos(prevTodo =>
        prevTodo.map(todo => (todo.id === id ? updatedTodo : todo))
      );
    } catch (error) {
      console.log("완료 상태 변경에 실패했습니다. : ", error)
    }
  }

  const handleDeleteTodo = async (id: number): Promise<void> => {
    try {
      await deleteTodoApi(id);
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
    } catch (error) {
      console.log("todo를 지우는데 실패했습니다. : ", error)
    }
  }

  return (
    <div className="app-container">
      <header className='app-header'>
        <h1>Todo List</h1>
        <div>
          {
            authToken ? (
              <button onClick={handleLogout}>Logout</button>
            ) : (
              <GoogleLogin onSuccess={handleLoginSuccess} onError={handleloginError}>
              
              </GoogleLogin>
            )
          }
        </div>
      </header>
      <main className='app-main'>
        {
          authToken ? (
            isLoading ? (
              <p>목록을 불러오는 중입니다...</p>
            ) : (
              <>
                <TodoForm onAddTodo={handleAddTodo}/>
                <TodoList todos={todos} onToggleComplete={handletoggleComplete} onDeleteTodo={handleDeleteTodo}/>
              </>
            )
          ) : (
            <h2>로그인하여 To do List를 작성해보세요</h2>
          )
        }
      </main>
    </div>
  )
}

export default App