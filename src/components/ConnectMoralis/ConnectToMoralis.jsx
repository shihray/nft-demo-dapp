import React from "react";
import { useMoralis } from "react-moralis";
import metamaskIcon from "./metamask.svg";

const ConnectToMoralis = () => {

    const { authenticate, isAuthenticated, user, enableWeb3 } = useMoralis();

    const login = async () => {
        if (!user || !isAuthenticated) {
            await authenticate({signingMessage: "Log in using Moralis" })
                .then(function (user) {
                    console.log("logged in user:", user);
                    console.log(user.get("ethAddress"));
                })
                .catch(function (error) {
                    console.log(error);
                });
        } else {
            enableWeb3();
        }
    }

    return (
        <div className="jumbotron">
        <h1 className="display-5">
            CryptoBoy NFT Marketplace
        </h1>
        <p className="lead">
            This is an NFT marketplace where you can mint your ERC721 implemented{" "}
            <i>Crypto Boy NFTs</i> and manage them.
        </p>
        <hr className="my-4" />
        <button
            onClick={login}
            className="btn btn-primary d-flex align-items-center"
            style={{ fontSize: "0.9rem", letterSpacing: "0.14rem" }}
        >
            Moralis Metamask Login{" "}
        <img
            src={metamaskIcon}
            alt="metamask-icon"
            style={{ width: "2rem", marginLeft: "0.5rem" }}
        />
        </button>
    </div>
    );
}

export default ConnectToMoralis;
