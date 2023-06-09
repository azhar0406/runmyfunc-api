const express = require('express');
const { ethers } = require('ethers');

const provider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/polygon_mumbai');

const app = express();

app.get('/contract/:address/storage/:slot', async (req, res) => {
	
  try {
    const address = req.params.address;
    const slot = req.params.slot;

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

app.get('/combine', (req, res) => {
  const data = {
    "address": "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889",
    "eventName": "Transfer(address,address,uint256)",
    "blockNumber": 36096659,
    "logs": [{
      "blockNumber": 36096659,
      "blockHash": "0x108ad52c6fe787ef2a833aad6fc497d4c907aec6c240824e257ba7bd160096de",
      "transactionIndex": 1,
      "removed": false,
      "address": "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889",
      "data": "0x000000000000000000000000000000000000000000000000308716c94cbeec8a",
      "topics": [
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
        "0x0000000000000000000000000f65426268d78e563eadeaa865e92c4b948dd8a1",
        "0x000000000000000000000000af28cb0d9e045170e1642321b964740784e7dc64"
      ],
      "transactionHash": "0x53035f7d25b64ea3ec8282f7cab0fa4110dd8b7f8314ede880c781a0ec8a08b7",
      "logIndex": 8
    }]
  };

  const logs = data.logs;

  const tlength = Buffer.allocUnsafe(1);
  tlength.writeUIntBE(logs[0].topics.length, 0, 1);
  const topicsBuffers = logs[0].topics.map(topic => Buffer.from(topic.substr(2), 'hex'));
  const dataBuffer = Buffer.from(logs[0].data.substr(2), 'hex');

  const combinedBuffer = Buffer.concat([tlength,...topicsBuffers, dataBuffer]);
  console.log('Combined Buffer:', combinedBuffer.toString('hex'));

  const topicsLength = combinedBuffer.readUIntBE(0, 1);
  console.log(topicsLength);

const topicsBuffer_new = combinedBuffer.slice(1, 1 + topicsLength * 32);
console.log(topicsBuffer_new);
const dataBuffer_new = combinedBuffer.slice(1+topicsLength * 32);

const decodedTopics = [];
for (let i = 0; i < topicsLength; i++) {
  const topicBuffer = topicsBuffer_new.slice(i * 32, (i + 1) * 32);
  const topicHex = "0x"+topicBuffer.toString('hex');
  decodedTopics.push(topicHex);
}

const decodedData = "0x"+dataBuffer_new.toString('hex');

// console.log('Decoded Topics:', decodedTopics);
// console.log('Decoded Data:', decodedData);

  // const topicsLength = combinedBuffer.readUIntBE(0, 1);
  // console.log(topicsLength);
  // const decodedTopics = combinedBuffer.slice(0, topicsLength).map(buffer => buffer.toString('hex'));
 //  const decodedData = combinedBuffer.slice(topicsLength).toString('hex');
  //
  // console.log('Decoded Topics:', decodedTopics);
  // console.log('Decoded Data:', decodedData);

  res.json({
    topics: decodedTopics,
    data: decodedData,
  });
});

app.get('/decode', (req, res) => {
  const topicsBuffers = [
    Buffer.from('ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', 'hex'),
    Buffer.from('0000000000000000000000000f65426268d78e563eadeaa865e92c4b948dd8a1', 'hex'),
    Buffer.from('000000000000000000000000af28cb0d9e045170e1642321b964740784e7dc64', 'hex')
  ];
  const dataBuffer = Buffer.from('000000000000000000000000000000000000000000000000308716c94cbeec8a', 'hex');

  const decodedTopics = topicsBuffers.map(buffer => buffer.toString('utf8')); // Adjust the decoding logic based on the format
  // const decodedData = ethers.utils.bigNumberify(dataBuffer).toString(); // Adjust the decoding logic based on the format

  console.log('Decoded Topics:', decodedTopics);
  // console.log('Decoded Data:', decodedData);

  res.json({
    topics: decodedTopics,
    // data: decodedData,
  });
});
app.get('/contract/:address/logs/:eventName', async (req, res) => {

  try {
    const address = req.params.address;
    const eventName = req.params.eventName;
    const blockNumber = Number(req.query.blockNumber);

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

app.listen(3001, () => {
  console.log('Server listening on port 3000');
});

