import React, { Component, useEffect, useState } from 'react'  
import { useDispatch, useSelector } from "react-redux";
import { fetchData } from "../redux/data/dataActions";
  
function Header() { 
    
        const dispatch = useDispatch();
        const blockchain = useSelector((state) => state.blockchain);
        const [loading, setLoading] = useState(false);

        const mintNFT = (_account, _name) => {
            setLoading(true);
            blockchain.zombieToken.methods.createRandomZombie(_name).send({
                from: _account,
                value: blockchain.web3.utils.toWei("0.01", "ether"),
            })
            .once("error", (err) => {
                setLoading(false);
                console.log(err);
            })
            .then((receipt) => {
                setLoading(false);
                console.log(receipt);
                dispatch(fetchData(blockchain.account));
            });
        };

        return (  

<header className="bg-dark py-5">
    <div className="container px-4 px-lg-5 my-5">
        <div className="text-center text-white">
            <h1 className="display-4 fw-bolder">Zombie Game</h1>
            <p className="lead fw-normal text-white-50 mb-0">zombie nft</p>
        </div>
    </div>

    {blockchain.account == "" || blockchain.zombieToken == null ? null : (
        <button className="btn btn-outline-light"
            // disabled={loading ? 1 : 0}
            onClick={(e) => {
            e.preventDefault();
            mintNFT(blockchain.account, "Zombie");
            }}
        >
            Create NFT Zombie
        </button>
    )}
</header>

    )
}

export default Header  