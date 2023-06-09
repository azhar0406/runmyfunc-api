const express = require('express');
const { ethers } = require('ethers');
const { whatsabi } = require("@shazow/whatsabi");
// const Web3 = require('web3');

// Create an ethers provider for the Mumbai Polygon network
const provider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/polygon_mumbai');

// const web3 = new Web3('https://polygon-mumbai.g.alchemy.com/v2/aPa9J4LAQCaLSwVmPfEF-6N6Txgh7w8b');

// Create an Express app
const app = express();

// Define an endpoint for querying storage slots of a contract address
app.get('/contract/:address/storage/:slot', async (req, res) => {
  try {
    const address = req.params.address;
    const slot = req.params.slot;

    const contract = new ethers.Contract(address, [], provider);
    const storageData = await contract.provider.getStorageAt(address, 
slot);

    res.json({ address, slot, storageData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/contract/:address/logs/:eventName', async (req, res) => {
  try {
    const address = req.params.address;
    const eventName = req.params.eventName;
    const blockNumber = Number(req.query.blockNumber);


    const eventSignature = eventName;
    const eventSelector = ethers.utils.id(eventSignature);
    
    // console.log(eventSelector);

    // const code = await provider.getCode(address);
    // const selectors = whatsabi.selectorsFromBytecode(code);

    // const abi = whatsabi.abiFromBytecode(code);

    // console.log(abi);

    // const abi2 = await whatsabi.autoload(address,{provider: provider,abiLoader: whatsabi.loaders.defaultABILoader,signatureLoader: whatsabi.loaders.defaultSignatureLookup,})
    
    // abi2.forEach(entry => {
    //   if (entry.type === 'function' && entry.stateMutability === 'view') {
    //     entry.constant = true;
    //   } else if (entry.type === 'function' && entry.stateMutability === 'payable') {

    //     entry.payable = true;

    //   }
    // });

    // const uniqueABI = [];
    // const uniqueCombinations = {};

    // abi2.forEach(entry => {
    //   const combination = entry.hash + entry.sig;
    //   if (!uniqueCombinations[combination]) {
    //     uniqueCombinations[combination] = true;
    //     uniqueABI.push(entry);
    //   }
    // });

    // console.log(uniqueABI);

    // console.log(abi2);

    // const eventSignature = 'transfer(address,uint256)';

    // const eventSelector = ethers.utils.id(eventSignature);

    // const slicedSelector = eventSelector.slice(0, 10);

    // const isEventPresent = selectors.includes(slicedSelector);

    // console.log(eventSelector);


    // const usdcContract = new web3.eth.Contract(uniqueABI, address);

    // console.log(usdcContract);

    // const approveEvents = await usdcContract.getPastEvents("Transfer", {
    //   fromBlock: blockNumber -1,
    //   toBlock: blockNumber,
    //   topics: [web3.utils.sha3('Transfer(address,address,uint256)')]
    // });
    
    // console.log(approveEvents);

    // const logs = approveEvents.map(event => (console.log(event)));

    const contract = new ethers.Contract(address, [], provider);

    // const contract = new ethers.Contract(address, [], provider);
    // console.log(typeof(blockNumber.toString()));
    const filter = {
      address: address,
      topics: [eventSelector],
    fromBlock: blockNumber - 1,
    toBlock: blockNumber,
    };

    const logs = await contract.provider.getLogs(filter);

// console.log(logs);
    // const filter = {
    //   address: address,
    //   topics: [eventSelector],
    //   fromBlock: ""+blockNumber+"",
    //   toBlock: 'latest',
    // };

    // const logs = await provider.getLogs({
    //   address: address,
    //   topics: [eventSelector],
    //   fromBlock: 'latest',
    //   toBlock: 'latest',
    // });

    // const filter = {
    //   topics: [eventSelector],
    // };
  
    // // Fetch the logs/events
    // const logs = await contract.queryFilter(filter,'latest','latest');
    

    res.json({ address, eventName, blockNumber,logs  });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Start the server
app.listen(3000, () => {
  console.log('Server listening on port 3000');
});

