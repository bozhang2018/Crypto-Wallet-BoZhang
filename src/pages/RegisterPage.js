import React, { useState } from "react";
import axios from 'axios';
import {useNavigate} from "react-router-dom";
 
export default function RegisterPage(){
 
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
   
    const navigate = useNavigate();
     
    const registerUser = () => {
        axios.post('/api/signup', {
            email: email,
            password: password
        })
        .then(function (response) {
             console.log(response);
             alert(response.data.message);
            navigate("/login");
        })
        .catch(function (error) {
            console.log(error, 'error');
            if (error.response.status === 401) {
                alert("Invalid credentials");
            }
        });
    };
     
  return (
    <div>
        <div className="center">
            <div className="form-login form-horizontal">
                <form>
                  <div className="form-group-title">
                    <h1>Create Your Account</h1>
                  </div>
 
                  <div className="form-group">
                    <label className="form-label" for="form3Example3">Email address</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} id="form3Example3" className="form-control form-control-lg" placeholder="Enter a valid email address" />
                  </div>
 
             
                  <div className="form-group">
                    <label className="form-label" for="form3Example4">Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} id="form3Example4" className="form-control form-control-lg" placeholder="Enter password" />
                  </div>
 
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="form-check mb-0">
                      <input className="form-check-input me-2" type="checkbox" value="" id="form2Example3" />
                      <label className="form-check-label" for="form2Example3">
                        Remember me
                      </label>
                    </div>
                  </div>
 
                  <div className="text-center text-lg-start mt-4 pt-2">
                    <button type="button" className="btn btn-primary btn-lg" onClick={() => registerUser()} >Sign Up</button>
                    <p className="small fw-bold mt-2 pt-1 mb-0">Login to your account <a href="/login" className="link-danger">Login</a></p>
                  </div>
 
                </form>
              {/* <div className="col-md-9 col-lg-6 col-xl-5">
                <img src={imgs[0]} className="img-fluid"/>
              </div> */}
            </div>
        </div>
    </div>
  );
}