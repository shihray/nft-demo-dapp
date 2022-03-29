import React from "react";
// import { useMoralis, useMoralisWeb3Api, useMoralisWeb3ApiCall } from "react-moralis";
// import CryptoBoyNFTImage from "../CryptoBoyNFTImage/CryptoBoyNFTImage";
import Web3 from "web3";
import CryptoBoys from "../../abis/CryptoBoys.json";
// import Marketplace from "../../abis/Market.json";
import { cryptoboysAddress } from "../../config.js"

async function loadWeb3() {
    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
    } else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
    } else {
        window.alert("Non-Ethereum browser detected. You should consider trying MetaMask!");
    }
};

async function mintNFT() {

    const web3 = window.web3;

    const accounts = await web3.eth.getAccounts();
    console.log(accounts);
    
    if (accounts.length > 0) {
        const networkData = CryptoBoys.abi;
        console.log(cryptoboysAddress);

        if (networkData) {
            const cryptoBoysContract = web3.eth.Contract(
                CryptoBoys.abi,
                cryptoboysAddress,
            );
            const priceWithGwei = await cryptoBoysContract.methods.price().call();
            const contractPrice = await window.web3.utils.fromWei(priceWithGwei.toString());
            const price = window.web3.utils.toWei(contractPrice.toString(), "Ether");

            cryptoBoysContract.methods
                .mint()
                .send({ from: accounts[0], value: price })
                .on("confirmation", () => {
                    // window.location.reload();
                    console.log("done");
                });
        }
    }
}

function FormAndPreview() {

    loadWeb3();
    return (
        <div>
            <div className="card mt-1">
                <div className="card-body align-items-center d-flex justify-content-center">
                <h5>Color Your Crypto Boy As You Want It To be!</h5>
                </div>
            </div>
            <div className="col-md-6">
                <button
                id="mintBtn"
                style={{ fontSize: "0.9rem", letterSpacing: "0.14rem" }}
                type="submit"
                className="btn mt-4 btn-block btn-outline-primary"
                onClick={mintNFT}
                >
                Mint My Crypto Boy
                </button>
            </div>
        </div>
    );
}

export default FormAndPreview;
