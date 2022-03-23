// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "./CryptoBoys.sol";

interface IERC2981Royalties {
    function royaltyInfo(uint256 _tokenId, uint256 _value)
        external
        view
        returns (address _receiver, uint256 _royaltyAmount);
}

contract Market is ERC721Enumerable, Ownable {

    IERC2981Royalties royaltyInterface;

    // this contract's token collection name & symbol
    string public collectionName;
    string public collectionNameSymbol;
    
    uint256 public communityFeePercent = 1;
    uint256 public marketFeePercent = 3;
    uint256 public cryptoBoyCounter = 0;
    uint256 public totalGivenRewardsPerToken = 0;
    mapping (uint256 => uint256) public communityRewards;

    // map cryptoboy's token id to crypto boy
    mapping(uint256 => CryptoBoy) public allCryptoBoys;

    struct CryptoBoy {
        uint256 tokenId;
        string tokenName;
        string tokenURI;
        address mintedBy;
        address currentOwner;
        address previousOwner;
        uint256 price;
        uint256 numberOfTransfers;
        bool forSale;
    }
    // Feature

    // initialize contract while deployment with contract's collection name and token
    constructor() ERC721("Taiwan Crypto Market", "TCM") {
        collectionName = name();
        collectionNameSymbol = symbol();

        royaltyInterface = IERC2981Royalties(address(this));
    }

    function adjustFees(uint256 newDistFee, uint256 newMarketFee) external onlyOwner {
        require(newDistFee <= 100, "Give a percentage value from 0 to 100");
        require(newMarketFee <= 100, "Give a percentage value from 0 to 100");

        communityFeePercent = newDistFee;
        marketFeePercent = newMarketFee;
    }

    function appendCryptoBoy(
        uint256 tokenId,
        string memory name,
        string memory uri,
        address mintedBy,
        address currOwner,
        address prevOwner,
        uint256 price,
        uint256 numOfTransfers,
        bool forSale
    ) public {

        CryptoBoy memory newCryptoBoy = CryptoBoy(tokenId, name, uri, mintedBy, currOwner, prevOwner, price, numOfTransfers, forSale);

        allCryptoBoys[tokenId] = newCryptoBoy;

        cryptoBoyCounter = tokenId;
    }

    // by a token by passing in the token's id
    function buyToken(address nftAddr, uint256 _tokenId) public payable {
        require(msg.sender != address(0));
        // require(_exists(_tokenId));
        
        CryptoBoy memory cryptoboy = allCryptoBoys[_tokenId];

        address tokenOwner = cryptoboy.currentOwner;
        require(tokenOwner != address(0));
        require(tokenOwner != msg.sender);

        require(msg.value >= cryptoboy.price, "Price Err");
        require(cryptoboy.forSale, "Not ForSale Err");

        // _transfer(tokenOwner, msg.sender, _tokenId);
        CryptoBoys(nftAddr).transferToken(tokenOwner, msg.sender, _tokenId);

        address sendTo = cryptoboy.currentOwner;
        payable(sendTo).transfer(msg.value);
        cryptoboy.previousOwner = cryptoboy.currentOwner;
        cryptoboy.currentOwner = msg.sender;
        cryptoboy.numberOfTransfers += 1;
        allCryptoBoys[_tokenId] = cryptoboy;


    }

    function changeTokenPrice(uint256 _tokenId, uint256 _newPrice) public {
        require(msg.sender != address(0));

        CryptoBoy memory cryptoboy = allCryptoBoys[_tokenId];

        require(cryptoboy.currentOwner == msg.sender);
        cryptoboy.price = _newPrice;
        allCryptoBoys[_tokenId] = cryptoboy;
    }

    // switch between set for sale and set not for sale
    function toggleForSale(uint256 _tokenId) public {
        // require caller of the function is not an empty address
        require(msg.sender != address(0));
        // require that token should exist
        require(_exists(_tokenId));
        // get the token's owner
        address tokenOwner = ownerOf(_tokenId);
        // check that token's owner should be equal to the caller of the function
        require(tokenOwner == msg.sender);
        // get that token from all crypto boys mapping and create a memory of it defined as (struct => CryptoBoy)
        CryptoBoy memory cryptoboy = allCryptoBoys[_tokenId];
        // if token's forSale is false make it true and vice versa
        if(cryptoboy.forSale) {
            cryptoboy.forSale = false;
        } else {
            cryptoboy.forSale = true;
        }
        // set and update that token in the mapping
        allCryptoBoys[_tokenId] = cryptoboy;
    }

    function getRewards() external view returns (uint256 amount) {
        uint256 rewards = 0;

        // Rewards of tokens owned by the sender
        for (uint256 i = 0; i <= cryptoBoyCounter; i++) {
            // uint256 tokenId = tokenOfOwnerByIndex(msg.sender, i);

            CryptoBoy memory cryptoboy = allCryptoBoys[i];

            address tokenOwner = ownerOf(cryptoboy.tokenId);

            if ( tokenOwner == msg.sender) {
                rewards += totalGivenRewardsPerToken - communityRewards[cryptoboy.tokenId];
            }
        }

        return rewards;
    }
}