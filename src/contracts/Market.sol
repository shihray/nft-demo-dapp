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
    
    uint256 constant TOTAL_NFTS_COUNT = 10000;
    uint256 public communityFeePercent = 1;
    uint256 public marketFeePercent = 3;
    uint256 public cryptoBoyCounter = 0;
    uint256 public communityHoldings = 0;
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
    bool public isMarketOpen = true;
    bool public emergencyDelisting = false;
    string public nftAddress;

    // initialize contract while deployment with contract's collection name and token
    constructor(address _nftAddress) ERC721("Taiwan Crypto Market", "TCM") {
        collectionName = name();
        collectionNameSymbol = symbol();

        royaltyInterface = IERC2981Royalties(address(this));
        nftAddress = _nftAddress;
    }

    function openMarket() external onlyOwner {
        isMarketOpen = true;
    }

    function closeMarket() external onlyOwner {
        isMarketOpen = false;
    }

    function allowEmergencyDelisting() external onlyOwner {
        emergencyDelisting = true;
    }

    function adjustFees(uint256 newDistFee, uint256 newMarketFee) external onlyOwner {
        require(newDistFee <= 100, "Give a percentage value from 0 to 100");
        require(newMarketFee <= 100, "Give a percentage value from 0 to 100");

        communityFeePercent = newDistFee;
        marketFeePercent = newMarketFee;
    }

    function emergencyDelist(address nftAddr, uint256 _tokenId) external {
        require(emergencyDelisting && !isMarketOpen, "Only in emergency.");
        require(_tokenId <= cryptoBoyCounter, "Invalid CryptoBoy");

        CryptoBoy memory cryptoboy = allCryptoBoys[_tokenId];

        CryptoBoys(nftAddr).transferFrom(address(this), cryptoboy.currentOwner, cryptoboy.tokenId);
    }

    // NFT
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
        require(isMarketOpen, "Market is closed.");
        CryptoBoy memory newCryptoBoy = CryptoBoy(tokenId, name, uri, mintedBy, currOwner, prevOwner, price, numOfTransfers, forSale);

        allCryptoBoys[tokenId] = newCryptoBoy;

        cryptoBoyCounter = tokenId;
    }

    // by a token by passing in the token's id
    function buyToken(uint256 _tokenId) public payable {
        require(isMarketOpen, "Market is closed.");
        require(msg.sender != address(0));
        // require(_exists(_tokenId));
        
        CryptoBoy memory cryptoboy = allCryptoBoys[_tokenId];

        address tokenOwner = cryptoboy.currentOwner;
        require(tokenOwner != address(0));
        require(tokenOwner != msg.sender);

        require(msg.value >= cryptoboy.price, "Price Err");
        require(cryptoboy.forSale, "Not ForSale Err");

        (address originalMinter, uint256 royaltyAmount) = royaltyInterface.royaltyInfo(_tokenId, cryptoboy.price);
        uint256 community_cut = (cryptoboy.price * communityFeePercent) / 100;
        uint256 market_cut = (cryptoboy.price * marketFeePercent) / 100;
        uint256 holder_cut = cryptoboy.price - royaltyAmount - community_cut - market_cut;

        // _transfer(tokenOwner, msg.sender, _tokenId);
        CryptoBoys(nftAddress).transferToken(tokenOwner, msg.sender, _tokenId);

        address sendTo = cryptoboy.currentOwner;
        // payable(sendTo).transfer(msg.value);
        cryptoboy.previousOwner = cryptoboy.currentOwner;
        cryptoboy.currentOwner = msg.sender;
        cryptoboy.numberOfTransfers += 1;
        allCryptoBoys[_tokenId] = cryptoboy;

        uint256 perToken = community_cut / TOTAL_NFTS_COUNT;
        totalGivenRewardsPerToken += perToken;
        communityHoldings += perToken * TOTAL_NFTS_COUNT;

        payable(sendTo).transfer(holder_cut);    
        payable(originalMinter).transfer(royaltyAmount);
    }

    function changeTokenPrice(uint256 _tokenId, uint256 _newPrice) public {
        require(isMarketOpen, "Market is closed.");
        require(msg.sender != address(0));

        CryptoBoy memory cryptoboy = allCryptoBoys[_tokenId];

        require(cryptoboy.currentOwner == msg.sender);
        cryptoboy.price = _newPrice;
        allCryptoBoys[_tokenId] = cryptoboy;
    }

    // switch between set for sale and set not for sale
    function toggleForSale(uint256 _tokenId) public {
        require(isMarketOpen, "Market is closed.");
        require(msg.sender != address(0));
        // require(_exists(_tokenId));

        CryptoBoy memory cryptoboy = allCryptoBoys[_tokenId];

        address tokenOwner = cryptoboy.currentOwner;
        require(tokenOwner == msg.sender);
        
        if(cryptoboy.forSale) {
            cryptoboy.forSale = false;
        } else {
            cryptoboy.forSale = true;
        }
        
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

    function claimListedRewards(uint256 from, uint256 length) external {
        require(
            from + length <= userActiveListings[msg.sender].length,
            "Out of index"
        );

        uint256 rewards = 0;
        uint256 newCommunityHoldings = communityHoldings;

        // Rewards of tokens owned by the sender, but listed on this marketplace
        uint256[] memory myListings = userActiveListings[msg.sender];
        for (uint256 i = 0; i < myListings.length; i++) {
            uint256 tokenId = listings[myListings[i]].tokenId;
            if (tokenId < TOTAL_NFTS_COUNT) {
                uint256 tokenReward = totalGivenRewardsPerToken -
                    communityRewards[tokenId];
                rewards += tokenReward;
                newCommunityHoldings -= tokenReward;
                communityRewards[tokenId] = totalGivenRewardsPerToken;
            }
        }

        communityHoldings = newCommunityHoldings;
        payable(msg.sender).transfer(rewards);
    }

    function claimOwnedRewards(uint256 from, uint256 length) external {
        // CryptoBoys(nftAddress).
        uint256 numTokens = nftContract.balanceOf(msg.sender);
        require(from + length <= numTokens, "Out of index");

        uint256 rewards = 0;
        uint256 newCommunityHoldings = communityHoldings;

        // Rewards of tokens owned by the sender
        for (uint256 i = 0; i < length; i++) {
            uint256 tokenId = nftContract.tokenOfOwnerByIndex(
                msg.sender,
                i + from
            );
            if (tokenId < TOTAL_NFTS_COUNT) {
                uint256 tokenReward = totalGivenRewardsPerToken -
                    communityRewards[tokenId];
                rewards += tokenReward;
                newCommunityHoldings -= tokenReward;
                communityRewards[tokenId] = totalGivenRewardsPerToken;
            }
        }

        communityHoldings = newCommunityHoldings;
        payable(msg.sender).transfer(rewards);
    }

    function claimRewards() external {
        uint256 numTokens = nftContract.balanceOf(msg.sender);
        uint256 rewards = 0;
        uint256 newCommunityHoldings = communityHoldings;

        // Rewards of tokens owned by the sender
        for (uint256 i = 0; i < numTokens; i++) {
            uint256 tokenId = nftContract.tokenOfOwnerByIndex(msg.sender, i);
            if (tokenId < TOTAL_NFTS_COUNT) {
                uint256 tokenReward = totalGivenRewardsPerToken -
                    communityRewards[tokenId];
                rewards += tokenReward;
                newCommunityHoldings -= tokenReward;
                communityRewards[tokenId] = totalGivenRewardsPerToken;
            }
        }

        // Rewards of tokens owned by the sender, but listed on this marketplace
        uint256[] memory myListings = userActiveListings[msg.sender];
        for (uint256 i = 0; i < myListings.length; i++) {
            uint256 tokenId = listings[myListings[i]].tokenId;
            if (tokenId < TOTAL_NFTS_COUNT) {
                uint256 tokenReward = totalGivenRewardsPerToken -
                    communityRewards[tokenId];
                rewards += tokenReward;
                newCommunityHoldings -= tokenReward;
                communityRewards[tokenId] = totalGivenRewardsPerToken;
            }
        }

        communityHoldings = newCommunityHoldings;

        payable(msg.sender).transfer(rewards);
    }

    function withdrawableBalance() public view returns (uint256 value) {
        if (address(this).balance <= communityHoldings) {
            return 0;
        }
        return address(this).balance - communityHoldings;
    }

    function withdrawBalance() external onlyOwner {
        uint256 withdrawable = withdrawableBalance();
        payable(_msgSender()).transfer(withdrawable);
    }

    function emergencyWithdraw() external onlyOwner {
        payable(_msgSender()).transfer(address(this).balance);
    }
}