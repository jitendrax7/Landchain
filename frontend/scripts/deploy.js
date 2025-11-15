const hre = require('hardhat')

async function main() {
  console.log('Deploying Marketplace contract...')

  const Marketplace = await hre.ethers.getContractFactory('Marketplace')
  const marketplace = await Marketplace.deploy()

  await marketplace.waitForDeployment()

  const deployedAddress = await marketplace.getAddress()
  console.log('Marketplace deployed to:', deployedAddress)
  console.log(
    '\nUpdate your NEXT_PUBLIC_CONTRACT_ADDRESS environment variable to:',
    deployedAddress
  )

  const fs = require('fs')
  const deploymentInfo = {
    contractAddress: deployedAddress,
    deployedAt: new Date().toISOString(),
    network: hre.network.name,
  }

  fs.writeFileSync('./deployment.json', JSON.stringify(deploymentInfo, null, 2))
  console.log('Deployment info saved to deployment.json')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
