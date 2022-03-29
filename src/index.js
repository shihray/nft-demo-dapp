import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App";
import * as serviceWorker from "./serviceWorker";
import "./bootstrap.min.css";

import { MoralisProvider } from "react-moralis";

const APP_ID = process.env.REACT_APP_MORALIS_APPLICATION_ID;
const SERVER_URL = process.env.REACT_APP_MORALIS_SERVER_URL

ReactDOM.render(
    <React.StrictMode>
        <MoralisProvider appId={APP_ID} serverUrl={SERVER_URL}>
            <App />
        </MoralisProvider>
    </React.StrictMode>,
    document.getElementById("root")
);


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
