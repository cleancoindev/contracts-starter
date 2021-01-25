import * as util from "util";
import * as readlineSync from "readline-sync";
import HDWalletProvider from "@truffle/hdwallet-provider";

const rawExec = util.promisify(require("child_process").exec);

require("dotenv").config({
  path: ".env"
});


const DEPLOYER_MNEMONIC = process.env.deployer_mnemonic;
const CORE_CONTRACT_ADDRESS = process.env.core_contract_address
if (
  !CORE_CONTRACT_ADDRESS ||
  !DEPLOYER_MNEMONIC
) {
  console.error("environment variables not found!");
  console.log(CORE_CONTRACT_ADDRESS);
  console.log(DEPLOYER_MNEMONIC);
  throw "";
}

const network_url = "https://dai.poa.network/";


const exec = async (command: string) => {
  const { error, stdout, stderr } = await rawExec(command);
  console.log(">> ", command);

  if (error) {
    console.error(`{command} failed with error ${error} and stderr ${stderr}.`);
    throw "";
  } else {
    return stdout.trim();
  }
};

const deploy = async () => {
  // compile the contracts
  await exec(`oz compile --optimizer on --no-interactive`);

  const deployerWallet = new HDWalletProvider(DEPLOYER_MNEMONIC, network_url)
  // Only when deploying to production, give the deployer wallet money,
  // in order for it to be able to deploy the contracts
  console.log(`Give some xdai to ${deployerWallet.getAddress()}`);
  readlineSync.question("Press enter when you're done.");

  // deploy the contract
  const contractAddress = await deployContract();

  await exec(
    `oz send-tx -n xdai --to ${contractAddress} --method initialize --args ${CORE_CONTRACT_ADDRESS} --no-interactive`
  );

  // save the core contract json
  await exec(
    "cp build/contracts/Contract.json ./ContractABI.json"
  );
  console.log("Deployment finished. You can CTRL+C this process.")
};

const deployContract = async (): Promise<string> => {
  await exec(`oz add Contract`);
  await exec(`oz push -n xdai --no-interactive --reset --force`);
  const address = await exec(
    `oz deploy Contract -k upgradeable -n xdai --no-interactive`
  );
  console.log(`Contract deployed to ${address}.`);
  return address ;
};

deploy();