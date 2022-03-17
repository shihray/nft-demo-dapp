// log
import store from "../store";

const fetchDataRequest = () => {
  return {
    type: "CHECK_DATA_REQUEST",
  };
};

const fetchDataSuccess = (payload) => {
  return {
    type: "CHECK_DATA_SUCCESS",
    payload: payload,
  };
};

const fetchDataFailed = (payload) => {
  return {
    type: "CHECK_DATA_FAILED",
    payload: payload,
  };
};

export const fetchData = (account) => {
  return async (dispatch) => {
    dispatch(fetchDataRequest());
    try {
      let allZombies = await store.getState().blockchain.zombieToken.methods.getZombies().call();

      let allOwnerZombies = await store.getState().blockchain.zombieToken.methods.getOwnerZombies(account).call();

      let isOwner = await store.getState().blockchain.zombieToken.methods.isOwner(account).call();
      
      dispatch(
        fetchDataSuccess({
          allZombies,
          allOwnerZombies,
          isOwner,
        })
      );
    } catch (err) {
      console.log(err);
      dispatch(fetchDataFailed("Could not load data from contract."));
    }
  };
};
