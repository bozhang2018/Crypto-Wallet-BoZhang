import React, { useState, useEffect } from "react";
import axios from 'axios';
import {Link} from 'react-router-dom';
import {useNavigate, useParams} from "react-router-dom";
import TransactionTable from "../components/TransactionTable";
 
export default function WalletPage(){
    const { walletAddress } = useParams();
    const [wallet, setWallet] = useState([]);
    const [addressTo, setAddressTo] = useState('');
    const [amount, setAmount] = useState('');
    const [publicAddress, setPublicAddress] = useState('');

    useEffect(() => {
        axios.get(`/api/getWallet/${walletAddress}`)
            .then(response => {
                const walletData = {
                    address: [],
                    privkey: [],
                    balance: [],
                    base64Image: [],
                    transactions: []
                };
                if (response?.data) {
                    const walletInfo = response.data[response.data.length - 1];
                    walletData.transactions = response.data.slice(0, response.data.length-1);
                    walletData.address = walletInfo.address;
                    walletData.privkey = walletInfo.privkey;
                    walletData.balance = walletInfo.balance;
                    walletData.base64Image = walletInfo.qr_code;
                }
                setWallet(walletData);
            });
    }, []);

    const handleSent = (event) => {
        event.preventDefault();
        if(addressTo.length === 0){
            alert("addressTo has left Blank!");
          }
          else if(amount.length === 0){
            alert("amount has left Blank!");
          }
          // execute
          else{
              let amountSend = Number(amount)
              axios.post('/api/sendMoney', {
                  amount: amountSend,
                  address_to: addressTo,
                  privkey: wallet.privkey,
                  address_from: wallet.address
              })
              .then(function (response) {
                  console.log(response)
                  alert(response.data.message);
                //   document.location.reload();
                //   window.location.href = "/wallet/:walletAddress";
              })
              .catch(function (error) {
                  if (error?.message) {
                      alert(error.message);
                  }
              });
          }
    };

    const handleSearch = (event) => {
        event.preventDefault();
        if(publicAddress.length === 0){
            alert("address has left Blank!");
          }
          // execute
          else{
              axios.get(`/api/searchWallet${publicAddress}`)
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
        <div className="nav-link">
            <Link to="/account">Back to Account</Link>
        </div>
        <div className="container">
            <div className="wallet-info">
                <div className="row">
                    <div>
                        <h1>Wallet Details</h1>
                    </div>
                    <hr />
                    <div> <span className="bold"> Privkey:</span> {wallet.privkey}</div>
                    <div> <span className="bold"> Address:</span> {wallet.address}</div>
                    <div> <span className="bold"> Balance:</span> {wallet.balance}</div>
                </div>
                <div className="row">
                    <div>
                        <h1>Transactions</h1>
                    </div>
                    <hr />
                        {
                            wallet.transactions?.map(transaction =>{
                                return (
                                    <div className="transaction">
                                        <ul className="trans-list">
                                            <li><span className="bold">Tx_ref:</span> {transaction.tx_ref}</li>
                                            <li><span className="bold">Amount:</span> {transaction.amount}</li>
                                            <li><span className="bold">Status:</span> {transaction.status}</li>
                                            <li><span className="bold">Confirmation:</span> {transaction.confirmation}</li>
                                            <li><span className="bold">Address from:</span> {transaction.address_from}</li>
                                            <li><span className="bold">Address to:</span> {transaction.address_to}</li>
                                        </ul> 
                                    </div>
                                );
                            })
                        } 
                </div>
            </div>

            <div className="Send-money">
                <div className="QR-code">
                    <div className="QR-code-title">
                        <h1>Your Wallet QR Code</h1>
                    </div>
                    <img src={`data:image/png;base64,${wallet.base64Image}`} alt="QR Code" />
                </div>
                <form className="form-login-search form-horizontal">
                    <div className="form-group-title">
                        <h1>Search an public wallet address</h1>
                    </div>
                    <div className="form-group">
                        <label className="form-label" for="publicAddress">Enter the wallet address</label>
                        <input type="text" value={publicAddress} onChange={(e) => setPublicAddress(e.target.value)} id="publicAddress" className="form-control form-control-lg" placeholder="Enter an address to search" />
                    </div>
                    <div>
                        <button type="button" className="btn btn-primary btn-md" onClick={handleSearch}>Search</button>
                    </div>
                </form>
                <form className="form-login-search form-horizontal">
                        <div className="form-group-title">
                            <h1>Send Money</h1>
                        </div>
                        <div className="form-group">
                            <label className="form-label" for="addressTo">Send to address</label>
                            <input type="text" value={addressTo} onChange={(e) => setAddressTo(e.target.value)} id="addressTo" className="form-control form-control-lg" placeholder="Enter an address to send" />
                        </div>
                        <div className="form-group">
                            <label className="form-label" for="amount">Amount to send</label>
                            <input type="number" step="any" value={amount} onChange={(e) => setAmount(e.target.value)} id="amount" className="form-control form-control-lg" placeholder="Enter an amount to send" />
                        </div>
                        <div>
                            <button type="button" className="btn btn-primary btn-md" onClick={handleSent}>Sent</button>
                        </div>
                </form>
            </div>
        </div>
    </div>
  );
}