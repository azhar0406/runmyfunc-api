const express = require('express');
const { ethers } = require('ethers');

const provider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/polygon_mumbai');

const app = express();

app.get('/contract/:address/storage/:slot', async (req, res) => {
	
  try {
    const address = req.params.address;
    const slot = req.params.slot;

      // Validate address parameter
      if (!ethers.utils.isAddress(address)) {
        res.status(400).json({ error: 'Invalid address' });
        return;
      }

    // Validate required parameters
    if (!address || !slot) {
      res.status(400).json({ error: 'Missing address or slot parameter' });
      return;
    }

    const contract = new ethers.Contract(address, [], provider);
    const storageData = await contract.provider.getStorageAt(address, 
slot);
	res.setHeader('ngrok-skip-browser-warning', 'false');
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

      // Validate required parameters
      if ((!address && address != "logs") || !eventName) {
        res.status(400).json({ error: 'Missing address or eventName parameter' });
        return;
      }

        // Validate address parameter
    if (!ethers.utils.isAddress(address)) {
      res.status(400).json({ error: 'Invalid address' });
      return;
    }

          // Validate block number
    if (!blockNumber || isNaN(blockNumber)) {
      res.status(400).json({ error: 'Invalid blockNumber parameter' });
      return;
    }

    const eventSelector = ethers.utils.id(eventName);
    
    const contract = new ethers.Contract(address, [], provider);

    const filter = {
      address: address,
      topics: [eventSelector],
    fromBlock: blockNumber,
    toBlock: blockNumber,
    };

    const logs = await contract.provider.getLogs(filter);
	res.setHeader('ngrok-skip-browser-warning', 'false');
    res.json({ address, eventName, blockNumber, logs});

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Default 404 error middleware
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.listen(3001, () => {
  console.log('Server listening on port 3000');
});

