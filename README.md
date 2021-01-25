# Dark Forest Plugin Starter Repo
This repository is a quick starter for Dark Forest plugin developers who want to deploy contracts that interact with the core Dark Forest contracts.
This repository allows you to quickly get up and running with the ability to:
- Compile a Solidity contract with references to the core Dark Forest contracts
- Synchronise the source code of the Dark Forest core contracts from the [official contract repository](https://github.com/darkforest-eth/eth)
- Deploy your Solidity contract to the XDai net, and initialise the contract with the address of the core contract

## How to use this repo
Do once:
- `yarn install`
- `cp .env.example .env` and change the env file to include the mnemonic of your XDai account from which you want to deploy your contract
- `yarn sync-core-contracts` will download the latest version of the core contracts to the local directory and move them to the right place

To check that your contract compiles correctly:
- `yarn compile`


To deploy your contract to the XDai chain (make sure to have ran the __Do once__ steps)
- `yarn deploy`

## Example usage
An example achievement contract can be found in `./contracts/Contract.sol`. It is an ERC721 implementation of a simple achievement system. This contrat calls the Dark Forest core contract to verify the claim of the users requesting an achievement.