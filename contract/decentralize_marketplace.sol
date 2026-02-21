// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DigitalMarketplace is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    struct Listing {
        uint256 price;
        address seller;
        bool active;
    }

    mapping(uint256 => Listing) public listings;
    

    mapping(uint256 => uint256) public lastSoldPrice; 

    constructor() ERC721("DigitalAsset", "DAT") Ownable(msg.sender) {}

    function mintAsset(string memory tokenURI) public returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);
        lastSoldPrice[tokenId] = 0; 
        return tokenId;
    }


    function listAsset(uint256 tokenId, uint256 price) public {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(price > 0, "Price must be > 0");

        require(price > lastSoldPrice[tokenId], "New price must be higher than previous price!");
        
        listings[tokenId] = Listing(price, msg.sender, true);
        approve(address(this), tokenId); 
    }


    function buyAsset(uint256 tokenId) public payable {
        Listing memory item = listings[tokenId];
        require(item.active, "Item not for sale");
        require(msg.value >= item.price, "Insufficient funds");

        lastSoldPrice[tokenId] = item.price; 

        // Chuyển tiền (dùng call để tránh lỗi gas)
        (bool success, ) = payable(item.seller).call{value: item.price}("");
        require(success, "Transfer failed");

        _transfer(item.seller, msg.sender, tokenId);
        delete listings[tokenId];
    }
}