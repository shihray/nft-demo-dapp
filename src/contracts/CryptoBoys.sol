// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;
pragma abicoder v2;

import "./Market.sol";

// CryptoBoys smart contract inherits ERC721 interface
contract CryptoBoys is Ownable, ERC721Enumerable {

    Market public market;

    // this contract's token collection name
    string public collectionName;
    // this contract's token symbol
    string public collectionNameSymbol;
    // total number of crypto boys minted
    uint256 public cryptoBoyCounter;
    // Base URI
    string private _baseURIextended;
    // Optional mapping for token URIs
    mapping (uint256 => string) private _tokenURIs;

    // check if token name exists
    mapping(string => bool) public tokenNameExists;
    // check if color exists
    mapping(string => bool) public colorExists;
    // check if token URI exists
    mapping(string => bool) public tokenURIExists;

    // avaxToken 
    uint256 constant TOTAL_NFTS_COUNT = 10000;
    address private _admin;
    address private _admin2;
    uint256 private _price = 0.1 ether;

    uint256 public reflectionBalance;
    uint256 public totalDividend;
    mapping (uint256 => uint256) public lastDividendAt;

    // initialize contract while deployment with contract's collection name and token
    constructor(address admin, address admin2, address marketAddress) ERC721("Taiwan Crypto Collection", "TC") {
        collectionName = name();
        collectionNameSymbol = symbol();

        _admin = admin;
        _admin2 = admin2;

        market = Market(marketAddress);
    }

    function setBaseURI(string memory baseURI_) external onlyOwner() {
        _baseURIextended = baseURI_;
    }

    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal virtual {
        require(_exists(tokenId), "ERC721Metadata: URI set of nonexistent token");
        _tokenURIs[tokenId] = _tokenURI;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseURIextended;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        string memory _tokenURI = _tokenURIs[tokenId];
        string memory base = _baseURI();
        
        if (bytes(base).length == 0) {
            return _tokenURI;
        }
        if (bytes(_tokenURI).length > 0) {
            return string(abi.encodePacked(base, _tokenURI));
        }
        return string(abi.encodePacked(base, tokenId));
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal virtual override(ERC721Enumerable) {
        if (totalSupply() > tokenId) claimReward(tokenId);
        super._beforeTokenTransfer(from, to, tokenId);
    }

    // mint a new crypto boy
    function mintCryptoBoy(string memory _name, string memory _tokenURI, string[] calldata _colors) external payable {
        require(msg.sender != address(0));
        cryptoBoyCounter ++;

        require(!_exists(cryptoBoyCounter));

        require(msg.value == _price, "must send correct price");
        require(cryptoBoyCounter <= TOTAL_NFTS_COUNT, "not enough avax apes left to mint amount");

        for(uint i=0; i<_colors.length; i++) {
            require(!colorExists[_colors[i]]);
        }
        require(!tokenURIExists[_tokenURI]);
        require(!tokenNameExists[_name]);

        // mint the token
        _mint(msg.sender, cryptoBoyCounter);
        _setTokenURI(cryptoBoyCounter, _tokenURI);

        for (uint i=0; i<_colors.length; i++) {
            colorExists[_colors[i]] = true;
        }
        tokenURIExists[_tokenURI] = true;
        tokenNameExists[_name] = true;

        market.appendCryptoBoy(cryptoBoyCounter, _name, _tokenURI, msg.sender, msg.sender, address(0), _price, 0, true);

        lastDividendAt[cryptoBoyCounter] = totalDividend;
        splitBalance(msg.value);
    }

    function transferToken(address from, address to, uint256 tokenId) public {
        _transfer(from, to, tokenId);
    }

    // get owner of the token
    function getTokenOwner(uint256 _tokenId) public view returns(address) {
        address _tokenOwner = ownerOf(_tokenId);
        return _tokenOwner;
    }

    // get metadata of the token
    function getTokenMetaData(uint _tokenId) public view returns(string memory) {
        string memory tokenMetaData = tokenURI(_tokenId);
        return tokenMetaData;
    }

    // get total number of tokens minted so far
    function getNumberOfTokensMinted() public view returns(uint256) {
        uint256 totalNumberOfTokensMinted = totalSupply();
        return totalNumberOfTokensMinted;
    }

    // get total number of tokens owned by an address
    function getTotalNumberOfTokensOwnedByAnAddress(address _owner) public view returns(uint256) {
        uint256 totalNumberOfTokensOwned = balanceOf(_owner);
        return totalNumberOfTokensOwned;
    }

    // check if the token already exists
    function getTokenExists(uint256 _tokenId) public view returns(bool) {
        bool tokenExists = _exists(_tokenId);
        return tokenExists;
    }

    function claimRewards() public {
        uint count = balanceOf(msg.sender);
        uint256 balance = 0;
        for(uint i=0; i < count; i++){
            uint tokenId = tokenOfOwnerByIndex(msg.sender, i);
            balance += getReflectionBalance(tokenId);
            lastDividendAt[tokenId] = totalDividend;
        }
        payable(msg.sender).transfer(balance);
    }

    function claimReward(uint256 tokenId) public {
        require(ownerOf(tokenId) == _msgSender() || getApproved(tokenId) == _msgSender(), "AvaxCoke: Only owner or approved can claim rewards");
        uint256 balance = getReflectionBalance(tokenId);
        payable(ownerOf(tokenId)).transfer(balance);
        lastDividendAt[tokenId] = totalDividend;
    }

    function getReflectionBalance(uint256 tokenId) public view returns (uint256){
        return totalDividend - lastDividendAt[tokenId];
    }

    function splitBalance(uint256 amount) private {
        uint256 reflectionShare = amount/10;
        uint256 mintingShare  = (amount - reflectionShare)/2;
        reflectDividend(reflectionShare);
        payable(_admin).transfer(mintingShare);
        payable(_admin2).transfer(mintingShare);
    }

    function reflectDividend(uint256 amount) private {
        reflectionBalance  = reflectionBalance + amount;
        totalDividend = totalDividend + (amount/totalSupply());
    }

    function reflectToOwners() public payable {
        reflectDividend(msg.value);
    }
}