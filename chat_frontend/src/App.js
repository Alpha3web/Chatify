import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Register from './ui/Layouts/Register';
import Login from './ui/Layouts/Login';
import "./App.css";
import HomeLayout from './ui/Layouts/Home';
import Chats from './ui/components/Chats';
import Users from './ui/components/Users';
import GroupCreationForm from './ui/Layouts/GroupCreationForm';
import { UserProvider } from './ui/context/UserContext';

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/chats/:chatId" element={<HomeLayout />} >
            <Route index element={<Chats />} />
          </Route>
          <Route path="/groups/:groupId" element={<HomeLayout />} >
            <Route index element={<Chats />} />
          </Route>
          <Route path="/" element={<HomeLayout />} >
            <Route index element={<Chats />} />
            <Route path='chats' element={<Chats />} />
            <Route path='users' element={<Users />} />
          </Route>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path='create-group' element={<GroupCreationForm />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;