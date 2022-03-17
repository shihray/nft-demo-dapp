import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchData } from "../redux/data/dataActions";
import ZombieRenderer from "./zombieRenderer";
import _color from "../assets/images/bg/_color.png";
  
function Home() {  
    const dispatch = useDispatch();
    const blockchain = useSelector((state) => state.blockchain);
    const data = useSelector((state) => state.data);
    const [loading, setLoading] = useState(false);

    console.log(data);

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

<div>
    <section className="py-5">
        <div className="container px-4 px-lg-5 mt-5">
            <div className="row gx-4 gx-lg-5 row-cols-2 row-cols-md-3 row-cols-xl-4 justify-content-center">

            {data.allZombies.map((item, index) => {

                let star_list = [];
                for(let i=0; i < item.level; i++ ){
                    star_list.push(<div className="bi-star-fill"></div>)
                }

                return (
                <div className="col mb-5">
                    <div className="card h-100">
                        <ZombieRenderer zombie={item} style="" />
                        <div className="card-body p-4">
                            <div className="text-center">
                                <h5 className="fw-bolder">#{item.id}</h5>
                                <div className="d-flex justify-content-center small text-warning mb-2">
                                    {star_list}
                                </div>
                                <p>NAME: {item.name}</p>
                                <p>DNA: {item.dna}</p>
                                <p>LEVEL: {item.level}</p>
                                <p>RARITY: {item.rarity}</p>
                            </div>
                        </div>
                    </div>
                </div>
                )
            })}
            </div>
        </div>
    </section>
</div>
            
    )
}

export default Home  