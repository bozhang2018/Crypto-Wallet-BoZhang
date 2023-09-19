import React, { useState } from "react";
import axios from 'axios';
import {useNavigate, Link} from "react-router-dom";
import { useCookies } from 'react-cookie';

const LOGIN_EXPIRE = 3600 * 1000; // 1 hr

export default function LoginPage(){
    const [cookies, setCookie] = useCookies(['user_id']);
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
   
    const navigate = useNavigate();
    
    // Login error control
    const logInUser = () => {
        if(email.length === 0){
          alert("Email has left Blank!");
        }
        else if(password.length === 0){
          alert("password has left Blank!");
        }
        // execute
        else{
            axios.post('/api/login', {
                email: email,
                password: password
            })
            .then(function (response) {
                const expires = new Date();
                expires.setTime(expires.getTime() + LOGIN_EXPIRE);
                setCookie('user_id', response.data.id, { path: '/',  expires});
                window.location.href = "/account";
            })
            .catch(function (error) {
                if (error?.message) {
                    alert(error.message);
                }
            });
        }
    }
     
  return (
    <div className="center">
        <form className="form-login form-horizontal">
            <div className="form-group-title">
                <h1>Log Into Your Account</h1>
            </div>
            <div className="form-group">
                <label className="form-label" for="email">Email address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} id="email" className="form-control form-control-lg" placeholder="Enter a valid email address" />
            </div>
            <div className="form-group">
                <label className="form-label" for="password">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} id="password" className="form-control form-control-lg" placeholder="Enter password" />
            </div>
            <div className="form-group">
                <button type="button" className="btn btn-primary btn-md" onClick={logInUser} >Login</button>
                <a href="#!" className="text-body-1">Forgot password?</a>
                <p className="small fw-bold mt-2 pt-1 mb-0">
                    Don't have an account? <Link to="/register" className="link-danger">Register</Link>
                </p>
            </div>
        </form>
    </div>
  );
}