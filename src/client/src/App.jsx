import './App.css'
import Navbar from './components/Navbar'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/auth/Login';
import PrivateRoutes from './helpers/routes/PrivateRoutes';
import Register from './pages/auth/Register';
import DocumentHome from './pages/main/DocumentHome';
import EditDocument from './pages/main/EditDocument';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';


function App() {

  return (
    <>
      <Router>
        <Navbar />
        <ToastContainer />
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />

          <Route path='/' element={<PrivateRoutes />}>
            <Route path='/home' element={<DocumentHome/>} />
            <Route path='/edit/:id' element={<EditDocument/>} />
          </Route>

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

        </Routes>
      </Router>
    </>
  )
}

export default App