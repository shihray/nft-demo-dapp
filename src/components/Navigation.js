import React, { Component } from 'react'  
import { Link } from 'react-router-dom';  
import { connect } from "../redux/blockchain/blockchainActions";
import { useDispatch, useSelector } from "react-redux";
  

function Navigation(){
    const dispatch = useDispatch();
    const blockchain = useSelector((state) => state.blockchain);

    return (  
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container px-4 px-lg-5">
                <a className="navbar-brand" href="#!">Start Bootstrap</a>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation"><span className="navbar-toggler-icon"></span></button>
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
                        <li className="nav-item"><a className="nav-link active" aria-current="page" href="#!">Home</a></li>
                        <li className="nav-item"><a className="nav-link" href="#!">About</a></li>
                        <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle" id="navbarDropdown" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">Shop</a>
                            <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                                <li><a className="dropdown-item" href="#!">All Products</a></li>
                                <li><hr className="dropdown-divider" /></li>
                                <li><a className="dropdown-item" href="#!">Popular Items</a></li>
                                <li><a className="dropdown-item" href="#!">New Arrivals</a></li>
                            </ul>
                        </li>
                    </ul>
                    <form className="d-flex">
                    { blockchain.account == "" || blockchain.zombieToken == null ? (

                        <button className="btn btn-outline-dark"
                            onClick={(e) => {
                            e.preventDefault();
                            dispatch(connect());
                            }}
                        ><i className="bi-link"></i>
                            CONNECT
                        </button>
                    ) : (
                        <button className="btn btn-outline-dark">
                            <a>{ blockchain.account }</a>
                        </button>
                    )}
                    {blockchain.errorMsg !== "" ? (
                        <a>{blockchain.errorMsg}</a>
                    ) : null}
                    </form>
                </div>
            </div>
        </nav>
    )   
}

export default Navigation  