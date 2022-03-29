import React from "react";
import Web3 from "web3";

async function loadWeb3() {
    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
    } else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
    } else {
        window.alert("Non-Ethereum browser detected. You should consider trying MetaMask!");
    }
};

const MyCryptoBoyNFTDetails = (props) => {
    loadWeb3();

    const {
        tokenId,
        tokenName,
        price,
        mintedBy,
        previousOwner,
        numberOfTransfers,
    } = props.cryptoboy;
    return (
        <div key={Number(tokenId)} className="mt-4 ml-3">
            <p>
                <span className="font-weight-bold">Token Id</span> :{" "}
                {Number(tokenId)}
            </p>
            <p>
                <span className="font-weight-bold">Name</span> : {tokenName}
            </p>
            <p>
                <span className="font-weight-bold">Price</span> :{" "}
                {window.web3.utils.fromWei(price.toString(), "Ether")} Ξ
            </p>
            <p>
                <span className="font-weight-bold">No. of Transfers</span> :{" "}
                {Number(numberOfTransfers)}
            </p>
            
        </div>
    );
};

export default MyCryptoBoyNFTDetails;
