import React, { Component } from "react";
import { HashRouter, Route } from "react-router-dom";
import "./App.css";
import Web3 from "web3";
import CryptoBoys from "../abis/CryptoBoys.json";
import Marketplace from "../abis/Market.json";

import FormAndPreview from "../components/FormAndPreview/FormAndPreview";
import AllCryptoBoys from "./AllCryptoBoys/AllCryptoBoys";
import AccountDetails from "./AccountDetails/AccountDetails";
import ContractNotDeployed from "./ContractNotDeployed/ContractNotDeployed";
import ConnectToMetamask from "./ConnectMetamask/ConnectToMetamask";
import Loading from "./Loading/Loading";
import Navbar from "./Navbar/Navbar";
import MyCryptoBoys from "./MyCryptoBoys/MyCryptoBoys";
import Queries from "./Queries/Queries";
import MarketClose from "./MarketClose/MarketClose";

const ipfsClient = require("ipfs-http-client");
const ipfs = ipfsClient({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
});

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            accountAddress: "",
            accountBalance: "",
            cryptoBoysContract: null,
            cryptoBoysAddress: "",
            marketContract : null,
            marketContractAddress: "",
            cryptoBoysCount: 0,
            cryptoBoys: [],
            loading: true,
            metamaskConnected: false,
            contractDetected: false,
            totalTokensMinted: 0,
            totalTokensOwnedByAccount: 0,
            nameIsUsed: false,
            colorIsUsed: false,
            colorsUsed: [],
            lastMintTime: null,
            isMarketOpen: false,
        };
    }

    componentWillMount = async () => {
        await this.loadWeb3();
        await this.loadBlockchainData();
        await this.setMetaData();
        await this.setMintBtnTimer();
    };

    setMintBtnTimer = () => {
        const mintBtn = document.getElementById("mintBtn");
        if (mintBtn !== undefined && mintBtn !== null) {
                this.setState({
                lastMintTime: localStorage.getItem(this.state.accountAddress),
            });
            this.state.lastMintTime === undefined || this.state.lastMintTime === null
                ? (mintBtn.innerHTML = "Mint My Crypto Boy")
                : this.checkIfCanMint(parseInt(this.state.lastMintTime));
        }
    };

    checkIfCanMint = (lastMintTime) => {
        const mintBtn = document.getElementById("mintBtn");
        const timeGap = 300000; //5min in milliseconds
        const countDownTime = lastMintTime + timeGap;
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const diff = countDownTime - now;
            if (diff < 0) {
            mintBtn.removeAttribute("disabled");
            mintBtn.innerHTML = "Mint My Crypto Boy";
            localStorage.removeItem(this.state.accountAddress);
            clearInterval(interval);
            } else {
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            mintBtn.setAttribute("disabled", true);
            mintBtn.innerHTML = `Next mint in ${minutes}m ${seconds}s`;
            }
        }, 1000);
    };

    loadWeb3 = async () => {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
        } else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider);
        } else {
            window.alert(
            "Non-Ethereum browser detected. You should consider trying MetaMask!"
            );
        }
    };

    loadBlockchainData = async () => {
        const web3 = window.web3;
        const accounts = await web3.eth.getAccounts();
        if (accounts.length === 0) {
            this.setState({ metamaskConnected: false });
        } else {
            this.setState({ metamaskConnected: true });
            this.setState({ loading: true });
            this.setState({ accountAddress: accounts[0] });

            let accountBalance = await web3.eth.getBalance(accounts[0]);
            accountBalance = web3.utils.fromWei(accountBalance, "Ether");
            
            this.setState({ accountBalance });
            this.setState({ loading: false });

            const networkId = await web3.eth.net.getId();
            const networkData = CryptoBoys.networks[networkId];

            if (networkData) {
                this.setState({ loading: true });
                const cryptoBoysContract = web3.eth.Contract(
                    CryptoBoys.abi,
                    networkData.address
                );
                this.setState({ cryptoBoysContract });
                this.setState({ contractDetected: true });
                this.setState({ cryptoBoysAddress: networkData.address });

                const cryptoBoysCount = await cryptoBoysContract.methods
                    .cryptoBoyCounter()
                    .call();
                this.setState({ cryptoBoysCount })

                this.setState({ loading: false });
            } else {
                this.setState({ contractDetected: false });
            }

            const marketNetworkId = await web3.eth.net.getId();
            const marketNetworkData = Marketplace.networks[marketNetworkId];

            if (marketNetworkData) {
                console.log("marketplace init");
                const marketContract = web3.eth.Contract(
                    Marketplace.abi,
                    marketNetworkData.address
                );
                this.setState({ marketContract: marketContract });
                this.setState({ marketContractAddress: marketNetworkData.address });

                let totalTokensMinted = await marketContract.methods
                    .totalListings()
                    .call();
                totalTokensMinted = totalTokensMinted.toNumber();
                this.setState({ totalTokensMinted });

                let totalTokensOwnedByAccount = await marketContract.methods
                    .getMyActiveListingsCount()
                    .call();
                totalTokensOwnedByAccount = totalTokensOwnedByAccount.toNumber();
                this.setState({ totalTokensOwnedByAccount });

                // marketOpen
                const isOpen = await marketContract.methods.isMarketOpen().call();
                this.setState({ isMarketOpen: isOpen });

                // TODO Show All nft
                const cryptoBoyList = await marketContract.methods.getActiveListings(0, 10000).call();
                for (var i = 0; i < cryptoBoyList.length; i++) {
                    this.setState({
                        cryptoBoys: [...this.state.cryptoBoys, cryptoBoyList[i]],
                    });
                }

                console.log("marketplace init done");
            } else {
                this.setState({ contractDetected: false });
            }
        }
    };

    connectToMetamask = async () => {
        await window.ethereum.enable();
        this.setState({ metamaskConnected: true });
        window.location.reload();
    };

    setMetaData = async () => {
        if (this.state.cryptoBoys.length !== 0) {
            this.state.cryptoBoys.map(async (cryptoboy) => {
            const result = await fetch(cryptoboy.tokenURI);
            const metaData = await result.json();
            this.setState({
                cryptoBoys: this.state.cryptoBoys.map((cryptoboy) =>
                cryptoboy.tokenId.toNumber() === Number(metaData.tokenId)
                    ? {
                        ...cryptoboy,
                        metaData,
                    }
                    : cryptoboy
                ),
            });
            });
        }
    };

    mintMyNFT = async () => {
        this.setState({ loading: true });

        const priceWithGwei = await this.state.cryptoBoysContract.methods.price().call();
        const contractPrice = await window.web3.utils.fromWei(priceWithGwei.toString());
        const price = window.web3.utils.toWei(contractPrice.toString(), "Ether");

        this.state.cryptoBoysContract.methods
            .mint()
            .send({ from: this.state.accountAddress, value: price })
            .on("confirmation", () => {
                localStorage.setItem(this.state.accountAddress, new Date().getTime());
                this.setState({ loading: false });
                window.location.reload();
            });
    };

    toggleForSale = (tokenId) => {
        this.setState({ loading: true });
        this.state.marketContract.methods
            .toggleForSale(tokenId)
            .send({ from: this.state.accountAddress })
            .on("confirmation", () => {
                this.setState({ loading: false });
                window.location.reload();
            });
    };

    changeTokenPrice = (tokenId, newPrice) => {
        this.setState({ loading: true });
        const newTokenPrice = window.web3.utils.toWei(newPrice, "Ether");

        this.state.marketContract.methods
            .changeTokenPrice(tokenId, newTokenPrice)
            .send({ from: this.state.accountAddress })
            .on("confirmation", () => {
                this.setState({ loading: false });
                window.location.reload();
            });
    };

    buyCryptoBoy = async (tokenId, price) => {
        // this.setState({ loading: true });
        await this.state.marketContract.methods
            .buyToken(this.state.cryptoBoysAddress, tokenId)
            .send({ from: this.state.accountAddress, value: price })
            .on("confirmation", () => {
                this.setState({ loading: false });
                window.location.reload();
            });
    };

    render() {
        return (
            <div className="container">
            {!this.state.metamaskConnected ? (
                <ConnectToMetamask connectToMetamask={this.connectToMetamask} />
            ) : !this.state.contractDetected ? (
                <ContractNotDeployed />
            ) : this.state.loading ? (
                <Loading />
            ) : !this.state.isMarketOpen ? (
                <MarketClose />
            ) : (
                <>
                <HashRouter basename="/">
                    <Navbar />
                    <Route
                    path="/"
                    exact
                    render={() => (
                        <AccountDetails
                            accountAddress={this.state.accountAddress}
                            accountBalance={this.state.accountBalance}
                        />
                    )}
                    />
                    <Route
                    path="/mint"
                    render={() => (
                        <FormAndPreview
                            mintMyNFT={this.mintMyNFT}
                            nameIsUsed={this.state.nameIsUsed}
                            colorIsUsed={this.state.colorIsUsed}
                            colorsUsed={this.state.colorsUsed}
                            setMintBtnTimer={this.setMintBtnTimer}
                        />
                    )}
                    />
                    <Route
                    path="/marketplace"
                    render={() => (
                        <AllCryptoBoys
                            accountAddress={this.state.accountAddress}
                            cryptoBoys={this.state.cryptoBoys}
                            totalTokensMinted={this.state.totalTokensMinted}
                            changeTokenPrice={this.changeTokenPrice}
                            toggleForSale={this.toggleForSale}
                            buyCryptoBoy={this.buyCryptoBoy}
                        />
                    )}
                    />
                    <Route
                    path="/my-tokens"
                    render={() => (
                        <MyCryptoBoys
                            accountAddress={this.state.accountAddress}
                            cryptoBoys={this.state.cryptoBoys}
                            totalTokensOwnedByAccount={
                                this.state.totalTokensOwnedByAccount
                        }
                        />
                    )}
                    />
                    <Route
                        path="/queries"
                        render={() => (
                            <Queries 
                                cryptoBoysContract={this.state.cryptoBoysContract}
                                marketContract={this.state.marketContract} 
                            />
                        )}
                    />
                </HashRouter>
                </>
            )}
            </div>
        );
    }
}

export default App;
