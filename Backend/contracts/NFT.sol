// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

error RobotNft__AlreadyMinted();

contract NFT is ERC721, ERC721URIStorage {

    uint256 tokenID ;

    event mintedRobotEvent (
        address indexed minter,
        uint256 indexed tokenId
    );

    constructor() ERC721("Robot", "RBT") {
        tokenID = 0 ;
    }

    mapping(uint256 => uint8) minted;


    function safeMint(string memory IPFStokenURI) public payable {

        if(minted[tokenID]==1){
            revert RobotNft__AlreadyMinted();
        }

        _safeMint(msg.sender, tokenID);
        _setTokenURI(tokenID, IPFStokenURI);
        minted[tokenID] = 1;
        tokenID = tokenID + 1;
    }

    function mintStatus(uint256 tokenId) public view returns(uint8){
        return minted[tokenId];
    }

    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

}
