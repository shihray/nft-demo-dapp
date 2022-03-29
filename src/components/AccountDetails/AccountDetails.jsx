import React from "react";
import { useMoralis, useNativeBalance } from "react-moralis";

const AccountDetails = (props) => {

    const { data: balance } = useNativeBalance(props);
    const { account, isAuthenticated } = useMoralis();

    if (!account || !isAuthenticated) return null;

    return (
        <div>
            <div className="jumbotron">
                <h1 className="display-5">CryptoBoy NFT Marketplace</h1>
                    <p className="lead">
                        This is an NFT marketplace where you can mint ERC721 implemented{" "}
                        <i>Crypto Boy NFTs</i> and manage them.
                    </p>
                <hr className="my-4" />
                    <p className="lead">Account address :</p>
                <h4>{account}</h4>
                    <p className="lead">Account balance :</p>
                <h4>{balance.formatted} Ξ</h4>
            </div>
        </div>
    );
};

export default AccountDetails;
