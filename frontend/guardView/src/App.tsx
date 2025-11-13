import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Routes,Route } from 'react-router-dom'
import {SignupPage,LoginPage,History,DashBoard,Scan} from './pages'
function App() {
  const [count, setCount] = useState(0)

  return (
    <Routes>
      <Route path='/signup' element={<SignupPage/>}/>
      <Route path='/login' element={<LoginPage/>}/>
      <Route path='/history' element={<History/>}/>
      <Route path='/' element={<DashBoard/>}/>
      <Route path='/scan' element={<Scan/>}/>
    </Routes>
  )
}

export default App
