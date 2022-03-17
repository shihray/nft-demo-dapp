// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ZombieToken is ERC721, Ownable {
    constructor(string memory _name, string memory _symbol)
    ERC721(_name, _symbol)
    {}

    uint256 COUNTER;

    uint256 fee = 0.01 ether;

    struct Zombie {
        string name;
        uint256 id;
        uint256 dna;
        uint8 level;
        uint8 rarity;
    }

    Zombie[] public lips;

    event NewZombie(address indexed owner, uint256 id, uint256 dna);

    // Helpers
    function _createRandomNum(uint256 _mod) internal view returns (uint256) {
        uint256 randomNum = uint256(
            keccak256(abi.encodePacked(block.timestamp, msg.sender))
        );
        return randomNum % _mod;
    }

    function updateFee(uint256 _fee) external onlyOwner {
        fee = _fee;
    }

    function withdraw() external payable onlyOwner {
        address payable _owner = payable(owner());
        _owner.transfer(address(this).balance);
    }

    // Creation
    function _createZombie(string memory _name) internal {
        uint8 randRarity = uint8(_createRandomNum(100));
        uint256 randDna = _createRandomNum(10**16);
        Zombie memory newZombie = Zombie(_name, COUNTER, randDna, 1, randRarity);
        lips.push(newZombie);
        _safeMint(msg.sender, COUNTER);
        emit NewZombie(msg.sender, COUNTER, randDna);
        COUNTER++;
    }

    function createRandomZombie(string memory _name) public payable {
        require(msg.value >= fee);
        _createZombie(_name);
    }

    // Getters
    function getZombies() public view returns (Zombie[] memory) {
        return lips;
    }

    function getOwnerZombies(address _owner) public view returns (Zombie[] memory) {
        Zombie[] memory result = new Zombie[](balanceOf(_owner));
        uint256 counter = 0;
        for (uint256 i = 0; i < lips.length; i++) {
            if (ownerOf(i) == _owner) {
            result[counter] = lips[i];
            counter++;
            }
        }
        return result;
    }

    function isOwner(address _owner) public view returns (bool) {
        if (_owner == owner()) {
            return true;
        }
        return false;
    }

    // Actions
    function levelUp(uint256 _lipId) public {
        require(ownerOf(_lipId) == msg.sender);
        Zombie storage lip = lips[_lipId];
        lip.level++;
    }
}
