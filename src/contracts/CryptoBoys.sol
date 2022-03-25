// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";

contract CryptoBoys is Context,  AccessControlEnumerable, ERC721Enumerable, ERC721URIStorage{
    using Counters for Counters.Counter;
    Counters.Counter public _tokenIdTracker;

    string private _baseTokenURI;
    uint256 private _price = 0.025 ether;
    uint private _max;
    address private _admin;
    address private _admin2;

    uint256 public reflectionBalance;
    uint256 public totalDividend;
    mapping (uint256 => uint256) public lastDividendAt;
    mapping (uint256 => address ) public minter;

    constructor(string memory baseTokenURI, uint max, address admin, address admin2) ERC721("CryptoBoys Tokens", "ACT") {
        _baseTokenURI = baseTokenURI;
        _max = max;
        _admin = admin;
        _admin2 = admin2;

        _setupRole(DEFAULT_ADMIN_ROLE, admin);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    function setBaseURI(string memory baseURI) external {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "CryptoBoys: must have admin role to change base URI");
        _baseTokenURI = baseURI;
    }

    function setTokenURI(uint256 tokenId, string memory _tokenURI) external {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "CryptoBoys: must have admin role to change token URI");
        _setTokenURI(tokenId, _tokenURI);
    }

    function setPrice(uint mintPrice) external {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "CryptoBoys: must have admin role to change price");
        _price = mintPrice;
    }

    function price() public view returns (uint256) {
        return _price;
    }

    function cryptoBoyCounter() public view returns (uint256) {
        return _tokenIdTracker.current();
    }

    function mint() public payable {

        uint256 currIndex = _tokenIdTracker.current();

        require(msg.value == _price, "CryptoBoys: must send correct price");
        require(currIndex <= _max, "CryptoBoys: not enough avax apes left to mint amount");
        _mint(msg.sender, currIndex);
        minter[currIndex] = msg.sender;
        lastDividendAt[currIndex] = totalDividend;
        _tokenIdTracker.increment();
        splitBalance(msg.value);
    }

    function tokenMinter(uint256 tokenId) public view returns(address){
        return minter[tokenId];
    }

    function _burn(uint256 tokenId) internal virtual override(ERC721, ERC721URIStorage) {
        return ERC721URIStorage._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return ERC721URIStorage.tokenURI(tokenId);
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal virtual override(ERC721, ERC721Enumerable) {
        if (totalSupply() > tokenId) claimReward(tokenId);
        super._beforeTokenTransfer(from, to, tokenId);
    }

    /**
    * @dev See {IERC165-supportsInterface}.
    */
    function supportsInterface(bytes4 interfaceId) public view virtual override(AccessControlEnumerable, ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function currentRate() public view returns (uint256){
        if(totalSupply() == 0) return 0;
        return reflectionBalance/totalSupply();
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

    function getReflectionBalances() public view returns(uint256) {
        uint count = balanceOf(msg.sender);
        uint256 total = 0;
        for(uint i=0; i < count; i++){
            uint tokenId = tokenOfOwnerByIndex(msg.sender, i);
            total += getReflectionBalance(tokenId);
        }
        return total;
    }

    function claimReward(uint256 tokenId) public {
        require(ownerOf(tokenId) == _msgSender() || getApproved(tokenId) == _msgSender(), "CryptoBoys: Only owner or approved can claim rewards");
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