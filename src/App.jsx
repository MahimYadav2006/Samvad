import { react } from 'react'
import { Route,Routes } from 'react-router-dom'
import Messages from './pages/Messages.jsx'
import Login from './pages/auth/login.jsx'
function App() {

  return (
    <Routes>
      <Route index={true} path="/" element={<Messages/>} />
      <Route path="/auth/login" element={<Login/>} />
    </Routes>
  )
}

export default App
