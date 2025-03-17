import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { Outlet } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Outlet />
        </main>
        <Footer />
      </div>
    </AuthProvider>
  )
}