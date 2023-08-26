const { network, ethers } = require("hardhat")
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    // console.log(deploy);
    const { deployer } = await getNamedAccounts()
    const contract  = await deploy("AIPrompt",{
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: 1,
    })
    console.log(contract.address)
}

module.exports.tags = ["all", "raffle"]
