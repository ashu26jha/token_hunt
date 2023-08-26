// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "./IPrngSystemContract.sol";

error AIPrompt__NOTOPEN();
error AIPrompt__FUND();

contract AIPrompt is IERC721Receiver, IPrngSystemContract {

    struct Raffle {
        uint256 tokenId;
        uint256 amount;
        address creator;
        bool isOpen;
        uint256 entries;
        address[] addresses;
        address nftAddress;
        address winner;
    }

    mapping(address => Raffle) private s_raffles;
    mapping(uint256 => address) private s_raffleId;
    mapping(address => uint256) private s_proceeds;
    mapping (uint256 => string) token_URI;

    uint256 raffleId = 0;
    uint256 s_tokenId = 0;

    address constant PRECOMPILE_ADDRESS = address(0x169);
    uint32 randNum;

    function getPseudorandomSeed() external returns (bytes32 randomBytes) {
        (bool success, bytes memory result) = PRECOMPILE_ADDRESS.call(
            abi.encodeWithSelector(
                IPrngSystemContract.getPseudorandomSeed.selector
            )
        );
        require(success);
        randomBytes = abi.decode(result, (bytes32));
        // IERC721 nft = IERC721(s_raffles[s_raffleId[0]].nftAddress);
        // nft.transferFrom(address(this),s_raffles[s_raffleId[0]].addresses[0],s_raffles[s_raffleId[0]].tokenId);
    }

    /**
     * Returns a pseudorandom number in the range [lo, hi) using the seed generated from "getPseudorandomSeed"
     */

    function getPseudorandomNumber(
        uint32 lo,
        uint32 hi    
    ) public returns (uint32) {
        (bool success, bytes memory result) = PRECOMPILE_ADDRESS.call(
            abi.encodeWithSelector(
                IPrngSystemContract.getPseudorandomSeed.selector
            )
        );
        require(success);
        uint32 choice;
        assembly {
            choice := mload(add(result, 0x20))
        }
        
        randNum = lo + (choice % (hi - lo));
        return randNum;
    }

    function generateWinner(uint32 lo, uint32 hi, uint256 _id) public {
        getPseudorandomNumber(lo, hi);
        s_raffles[s_raffleId[_id]].winner = s_raffles[s_raffleId[_id]].addresses[randNum];
    }

    function winner(uint256 _id) public view returns (address){
        return s_raffles[s_raffleId[_id]].addresses[randNum];
    }

    function winnerGetNFT(uint256 _id)public{
        uint256  hello = uint256(randNum) ;
        IERC721 nft = IERC721(s_raffles[s_raffleId[_id]].nftAddress);
        nft.transferFrom(address(this),s_raffles[s_raffleId[_id]].addresses[hello],s_raffles[s_raffleId[0]].tokenId);
    }

    function createRaffle( uint256 _tokenId, uint256 amount, address _nftaddress) public {

        IERC721 nft = IERC721(_nftaddress);

        if (nft.ownerOf(_tokenId)!=msg.sender) {
            revert ("Not Owner");
        }

        address [] memory  temp;
        Raffle memory newRaffle;
        newRaffle.tokenId = _tokenId;
        newRaffle.amount = amount;
        newRaffle.isOpen = true;
        newRaffle.creator = msg.sender;
        newRaffle.addresses = temp;
        newRaffle.nftAddress = _nftaddress;

        // Giving rights to contract
        nft.approve(address(this),_tokenId);

        // Transfer NFT to contract
        nft.transferFrom(msg.sender,address(this),_tokenId);

        s_raffleId[raffleId] = msg.sender;
        raffleId += 1;
        s_raffles[msg.sender] = newRaffle;
    }

    function enterRaffle(uint256 _raffleId) public payable {
        s_raffles[s_raffleId[_raffleId]].addresses.push(msg.sender);
        s_proceeds[s_raffleId[_raffleId]] = s_proceeds[s_raffleId[_raffleId]] + msg.value;
        s_raffles[s_raffleId[_raffleId]].entries = s_raffles[s_raffleId[_raffleId]].entries + 1;
    }

    function getURI(uint256 id) public view returns (string memory){
        return token_URI[id];
    }

    function getCurrentTokenId() public view returns (uint256) {
        // Current token ID of NFT
        return s_tokenId;
    }

    function getParticipants(uint256 _raffleId) public view returns (address[] memory) {
        // Should return array of participants
        return s_raffles[s_raffleId[_raffleId]].addresses;
    }

    function particantCount(uint256 _raffleId) public view returns (uint256) {
        // Should return number of participants
        return s_raffles[s_raffleId[_raffleId]].entries;
    }

    function raffleFee(uint256 _raffleId) public view returns (uint256) {
        // Should return price to enter
        return s_raffles[s_raffleId[_raffleId]].amount;
    }

    function getRaffleTokenId(uint256 _raffleId) public view returns (uint256) {
        // Should return token Id
        return s_raffles[s_raffleId[_raffleId]].tokenId;
    }

    function addressCreator(uint256 _raffleId) public view returns (address) {
        // Should return who created raffle
        return s_raffleId[_raffleId];
    }

    function currentBalance() public view returns (uint256) {
        return s_proceeds[msg.sender];
    }

    // WITHDRAW FUNCTION : ANUJ

    function onERC721Received(address, address, uint256, bytes calldata) external pure returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}
