import React, { useEffect, useState } from "react";
import "./App.css";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import ZombieRenderer from "./components/zombieRenderer";
import _color from "./assets/images/bg/_color.png";

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [loading, setLoading] = useState(false);

  const mintNFT = (_account, _name) => {
    setLoading(true);
    blockchain.zombieToken.methods
      .createRandomZombie(_name)
      .send({
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

  const startMint = (_account) => {
    setLoading(true);
    blockchain.zombieToken.methods
      .setPaused(false)
      .send({
        from: _account,
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

  const levelUpZombie = (_account, _id) => {
    setLoading(true);
    blockchain.zombieToken.methods
      .levelUp(_id)
      .send({
        from: _account,
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

  useEffect(() => {
    if (blockchain.account != "" && blockchain.zombieToken != null) {
      dispatch(fetchData(blockchain.account));
    }
  }, [blockchain.zombieToken]);

  return (
    <s.Screen image={_color}>
      {blockchain.account == "" || blockchain.zombieToken == null ? (
        <s.Container flex={1} ai={"center"} jc={"center"}>
          <s.TextTitle>Connect to the game</s.TextTitle>
          <s.SpacerSmall />
          <button
            onClick={(e) => {
              e.preventDefault();
              dispatch(connect());
            }}
          >
            CONNECT
          </button>
          <s.SpacerXSmall />
          {blockchain.errorMsg !== "" ? (
            <s.TextDescription>{blockchain.errorMsg}</s.TextDescription>
          ) : null}
        </s.Container>
      ) : (
        <s.Container ai={"center"} style={{ padding: "24px" }}>
          <s.TextTitle>Welcome to the game</s.TextTitle>
          <s.SpacerSmall />
          <button
            disabled={loading ? 1 : 0}
            onClick={(e) => {
              e.preventDefault();
              mintNFT(blockchain.account, "Unknown");
            }}
          >
            Create NFT Zombie
          </button>
          <s.SpacerXSmall />
          {data.isOwner ? (
            <button
              disabled={loading ? 1 : 0}
              onClick={(e) => {
                e.preventDefault();
                startMint(blockchain.account);
              }}
            >
              Start Mint
            </button>
          ) : null}

          <s.SpacerMedium />
          <s.Container jc={"center"} fd={"row"} style={{ flexWrap: "wrap" }}>
            {data.allOwnerZombies.map((item, index) => {
              return (
                <s.Container key={index} style={{ padding: "15px" }}>
                  <ZombieRenderer zombie={item} />
                  <s.SpacerXSmall />
                  <s.Container>
                    <s.TextDescription>ID: {item.id}</s.TextDescription>
                    <s.TextDescription>DNA: {item.dna}</s.TextDescription>
                    <s.TextDescription>LEVEL: {item.level}</s.TextDescription>
                    <s.TextDescription>NAME: {item.name}</s.TextDescription>
                    <s.TextDescription>RARITY: {item.rarity}</s.TextDescription>
                    <s.SpacerXSmall />
                    <button
                      disabled={loading ? 1 : 0}
                      onClick={(e) => {
                        e.preventDefault();
                        levelUpZombie(blockchain.account, item.id);
                      }}
                    >
                      Level Up
                    </button>
                  </s.Container>
                </s.Container>
              );
            })}
          </s.Container>

          <s.Container jc={"center"} fd={"row"} style={{ flexWrap: "wrap" }}>
            {data.allZombies.map((item, index) => {
              return (
                <s.Container key={index} style={{ padding: "15px" }}>
                  <ZombieRenderer zombie={item} />
                  <s.SpacerXSmall />
                  <s.Container>
                    <s.TextDescription>ID: {item.id}</s.TextDescription>
                    <s.TextDescription>DNA: {item.dna}</s.TextDescription>
                    <s.TextDescription>LEVEL: {item.level}</s.TextDescription>
                    <s.TextDescription>NAME: {item.name}</s.TextDescription>
                    <s.TextDescription>RARITY: {item.rarity}</s.TextDescription>
                    <s.SpacerXSmall />
                  </s.Container>
                </s.Container>
              );
            })}
          </s.Container>

        </s.Container>
      )}
    </s.Screen>
  );
  }

  export default App;
