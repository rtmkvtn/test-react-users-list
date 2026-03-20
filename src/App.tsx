import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { UsersPage } from '@/features/users/components/UsersPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UsersPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
