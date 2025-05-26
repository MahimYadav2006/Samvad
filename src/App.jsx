import { react } from 'react'
import { Route,Routes } from 'react-router-dom'
import Messages from './pages/Messages.jsx'
import Login from './pages/auth/login.jsx'
import Signup from "./pages/auth/Signup.jsx"
import Verification from './pages/auth/Verification.jsx'
function App() {

  return (
    <Routes>
      <Route index={true} path="/" element={<Messages/>} />
      <Route path="/auth/login" element={<Login/>} />
      <Route path="/auth/signup" element={<Signup/>} />
      <Route path="/verification" element={<Verification/>}></Route>
    </Routes>
  )
}

export default App
