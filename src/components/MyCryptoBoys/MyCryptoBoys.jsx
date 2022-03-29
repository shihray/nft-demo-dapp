import React, { useState, useEffect } from "react";
import CryptoBoyNFTImage from "../CryptoBoyNFTImage/CryptoBoyNFTImage";
import MyCryptoBoyNFTDetails from "../MyCryptoBoyNFTDetails/MyCryptoBoyNFTDetails";
import Loading from "../Loading/Loading";

import CryptoBoys from "../../abis/CryptoBoys.json";
import { useMoralisWeb3Api } from "react-moralis";
import { cryptoboysAddress, chain } from "../../config.js"

const MyCryptoBoys = () => {

    const Web3Api = useMoralisWeb3Api();

    const getNFT = async () => {
        
    }
    const [loading, setLoading] = useState(false);
    const [myCryptoBoys, setMyCryptoBoys] = useState([]);

    useEffect( async () => {
        const options = { 
            chain: chain, 
            token_address: cryptoboysAddress 
        };
        const myNFTs = await Web3Api.account.getNFTs(options);
                
        if (myNFTs.result.length !== 0) {
            if (myNFTs.result[0] !== undefined) {
                setLoading(loading);
            } else {
                setLoading(false);
            }
        }
        // const my_crypto_boys = myNFTs.filter(
        //     (cryptoboy) => cryptoboy.currentOwner === accountAddress
        // );
        setMyCryptoBoys(myNFTs.result);
    }, []);

    console.log(myCryptoBoys);

    return (
        <div>
            <div className="card mt-1">
                <div className="card-body align-items-center d-flex justify-content-center">
                    <h5>
                    {/* Total No. of CryptoBoy's You Own : {totalTokensOwnedByAccount} */}
                    CryptoBoy
                    </h5>
                </div>
            </div>
            <div className="d-flex flex-wrap mb-2">
            {myCryptoBoys.map((cryptoboy) => {
                return (
                <div
                    key={cryptoboy.token_id}
                    className="w-50 p-4 mt-1 border"
                >
                    <div className="row">
                    <div className="col-md-6">
                        {!loading ? (
                            <CryptoBoyNFTImage
                                colors={ cryptoboy.metaData !== undefined ? cryptoboy.metaData.metaData.colors : "" }
                            />
                        ) : (
                            <Loading />
                        )}
                    </div>
                    <div className="col-md-6 text-center">
                        <MyCryptoBoyNFTDetails
                            cryptoboy={cryptoboy}
                        />
                    </div>
                    </div>
                </div>
                );
            })}
            </div>
        </div>
    );
};

export default MyCryptoBoys;
