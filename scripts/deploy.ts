import "@nomiclabs/hardhat-ethers";
import{ ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners(); 
  console.log("Deploying contracts with the account:", deployer.address); 

  const ExcaliburToken = await ethers.getContractFactory("ExcaliburToken");
  const excaliburToken = await ExcaliburToken.deploy();

  await excaliburToken.deployed();

  console.log("Token deployed to:", excaliburToken.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });