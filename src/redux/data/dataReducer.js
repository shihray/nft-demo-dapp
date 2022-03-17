const initialState = {
  loading: false,
  allZombies: [],
  allOwnerZombies: [],
  error: false,
  errorMsg: "",
  isOwner: false,
};

const dataReducer = (state = initialState, action) => {
  switch (action.type) {
    case "CHECK_DATA_REQUEST":
      return {
        ...initialState,
        loading: true,
      };
    case "CHECK_DATA_SUCCESS":
      return {
        ...initialState,
        loading: false,
        allZombies: action.payload.allZombies,
        allOwnerZombies: action.payload.allOwnerZombies,
        isOwner: action.payload.isOwner,
      };
    case "CHECK_DATA_FAILED":
      return {
        ...initialState,
        loading: false,
        error: true,
        errorMsg: action.payload,
      };
    default:
      return state;
  }
};

export default dataReducer;
