const { expect, assert } = require('chai');
const { ethers } = require('hardhat');

describe('AIPrompt Contract', function () {
  let aiPrompt;
  let nft;
  let owner, user1, user2;
  const TOKEN_ID = 0;
  const DURATION = 86400; 
  const AMOUNT = ethers.utils.parseEther('1'); 

  beforeEach(async function () {

    [owner, user1, user2] = await ethers.getSigners();
    const AIPrompt = await ethers.getContractFactory('AIPrompt');
    const NFT = await ethers.getContractFactory('NFT');

    nft = await NFT.deploy();
    aiPrompt = await AIPrompt.deploy();

    await nft.deployed();
    await aiPrompt.deployed();
  });
  
  it('Should retrieve current token ID', async function () {
    console.log('AI Prompt address',aiPrompt.address);
    console.log('NFT address', nft.address);

    console.log('Minting')
    await nft.safeMint("ipfs");

    console.log('Approving Raffle contract');
    await nft.setApprovalForAll(aiPrompt.address,true);

    console.log('Creating Raffle')
    await aiPrompt.createRaffle(0,100,nft.address);

    console.log('Entering Raffle')
    await aiPrompt.enterRaffle(0, {value : 1000, gasLimit: 6000000});

    const arr = await aiPrompt.getParticipants(0);
    console.log(arr);

    const index = await aiPrompt.particantCount(0);
    console.log(index);

    const rand = await aiPrompt.generateWinner(0,10,0,{gasLimit: 6000000});
    // console.log(rand)

    // const winner = await aiPrompt.winner(0,{gasLimit: 6000000});
    // console.log(winner)

    // await aiPrompt.winnerGetNFT(0,{gasLimit: 6000000});

    // const ownerCheck = await nft.ownerOf(0);
    // console.log(ownerCheck)
    // console.log(owner.address);
  });

  

});
