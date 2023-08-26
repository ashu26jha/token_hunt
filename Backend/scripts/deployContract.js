const { ethers, upgrades } = require('hardhat');

async function main() {
  const AIPrompt = await ethers.getContractFactory('AIPrompt');
  console.log('Deploying AIPrompt...');
  const aiPrompt = await upgrades.deployProxy(AIPrompt, [], { initializer: 'initialize' });
  await aiPrompt.deployed();
  console.log('AIPrompt deployed to:', aiPrompt.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
});
