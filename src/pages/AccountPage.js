import React, { useState, useEffect } from "react";
import axios from 'axios';
import {Link} from 'react-router-dom';
import {useNavigate} from "react-router-dom";
import { useCookies } from 'react-cookie';

export default function AccountPage(){
    const [account, setAccount] = useState([]);
    const [cookies, setCookie] = useCookies(['user_id']);
    useEffect(() => {
        console.log(cookies.user_id)
        axios.get('/api/getAccount')
        .then(response => {
            const accountData = {
                userName: [],
                wallets: []
            };
            if (response?.data?.addresses) {
                accountData.wallets = response?.data?.addresses.map(address => ({ address }));
            }
            if (response?.data?.user_name) {
                accountData.userName = response?.data?.user_name;
            }

                setAccount(accountData);
            })
            .catch(error => {
                if (error?.message) {
                    console.log(error.message);
                }
            });
    }, []);

    const handleCreate = (event) => {
        event.preventDefault();
        {
            axios.get('/api/createWallet')
            .then(function (response) {
                console.log(response)
                alert(response.data.message);
            })
            .catch(function (error) {
                if (error?.message) {
                    alert(error.message);
                }
            });
        }
    };

  return (
    <div>
        <div className="containerAccount">
            <div className="row h-100">
                <div className="app-section col-12">
                    <h1>Account Details</h1>
                    <hr 
                        style={{width: '50%'}}
                    />
                    <h4>User Name: {account?.userName}</h4>
                </div>
            </div>
            <div className="container">
                <div className="wallet-info">
                <div className="row">
                    <h1>Wallets</h1>
                    <hr style={{width:'70%'}}/>
                    {
                        account?.wallets?.map(wallet =>{
                            return (
                                <div>
                                    <ul className="wallet-list">
                                        <li>
                                            <Link to={"/wallet/" + wallet.address}>{wallet.address}</Link>
                                        </li>
                                    </ul>
                                </div>
                            );
                        })
                    }
                </div>
                </div>
                <div className="create-account">
                    <form className="form-login-search form-horizontal">
                        <div className="form-group-title">
                            <h1>Create a new wallet</h1>
                        </div>
                        <div>
                            <button type="button" className="btn btn-primary btn-md" onClick={handleCreate}>Create</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
  );
}