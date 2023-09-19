import logo from './logo.svg';
import './App.css';
import {BrowserRouter, Routes, Route, Link} from 'react-router-dom';
import axios from 'axios';

import LandingPage from "./pages/LandingPage";
import AccountPage from "./pages/AccountPage";
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import WalletPage from './pages/WalletPage'

const Header = () => {
    const isHeaderVisible = document.location.pathname !== '/login';
    if (!isHeaderVisible) {
        return null; 
    }

    const handleLogout = () => {
        window.location.href = "/logout";
    };

    return (
        <div className="app-header">
            <img src={require("./images/logoFox.png")} className="header-logo"/>
            <h3 className='header-text'>Crypto Wallet</h3>
            <button type="button" className="btn btn-primary btn-md" onClick={handleLogout}>Logout</button>       
        </div>
    );
};

function App() {
    return (
        <div className="vh-100 gradient-custom">
          <BrowserRouter>
            <Header />
            <div className="container">
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/account" element={<AccountPage />} />
                    <Route path="/wallet/:walletAddress" element={<WalletPage />} />
                </Routes>
            </div>
          </BrowserRouter>
        </div>
    );
}

export default App;
