import React, { useEffect } from "react";
import { HashRouter, Route } from "react-router-dom";
import "./App.css";

import FormAndPreview from "./FormAndPreview/FormAndPreview";
import AllCryptoBoys from "./AllCryptoBoys/AllCryptoBoys";
import AccountDetails from "./AccountDetails/AccountDetails";
import ContractNotDeployed from "./ContractNotDeployed/ContractNotDeployed";
import Navbar from "./Navbar/Navbar";
import MyCryptoBoys from "./MyCryptoBoys/MyCryptoBoys";
import { useMoralis } from "react-moralis";
import ConnectToMoralis from "./ConnectMoralis/ConnectToMoralis";

const App = () => {
    const { isWeb3Enabled, enableWeb3, isAuthenticated, isWeb3EnableLoading } = useMoralis();

    useEffect(() => {
        const connectorId = window.localStorage.getItem("connectorId");
        if (isAuthenticated && !isWeb3Enabled && !isWeb3EnableLoading)
            enableWeb3({ provider: connectorId });
    }, [isAuthenticated, isWeb3Enabled]);

    const contractDetected = true;
    
    return (
        <div className="container">
        {!isAuthenticated || !isWeb3Enabled ? (
            <ConnectToMoralis />
        ) : !contractDetected ? (
            <ContractNotDeployed />
        ) : (
            <>
            <HashRouter basename="/">
                <Navbar />
                <Route
                    path="/"
                    exact
                    render={() => (
                        <AccountDetails />
                    )}
                />
                <Route
                    path="/mint"
                    render={() => (
                        <FormAndPreview />
                    )}
                />
                <Route
                    path="/marketplace"
                    render={() => (
                        <AllCryptoBoys />
                    )}
                />
                <Route
                    path="/my-tokens"
                    render={() => (
                        <MyCryptoBoys />
                    )}
                />
            </HashRouter>
            </>
        )}
        </div>
    );
}

export default App;