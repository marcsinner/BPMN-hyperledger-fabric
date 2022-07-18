# BPMN-hyperledger-fabric

## Setup:

### 1. Setup binary files
curl -sSL https://raw.githubusercontent.com/hyperledger/fabric/main/scripts/bootstrap.sh| bash -s

### 2. In test-network repository
- ./network.sh down
- ./network.sh up createChannel -c mychannel -ca
- ./network.sh deployCC -ccn basic -ccp ../asset-transfer-basic/chaincode-typescript/ -ccl typescript

### 3. In asset-transfer-basic/application-gateway-typescript repository
- npm install (1st time use only)
- npm start


### 1. setup the paths to the binary files
export PATH=$PATH:/Users/marc/Documents/local-dev/blockchain-seminar/BPMN-hyperledger-fabric/bin
export PATH=$PATH:/Users/marc/Documents/local-dev/blockchain-seminar/BPMN-hyperledger-fabric/config

download bin files
curl -sSL https://raw.githubusercontent.com/hyperledger/fabric/master/scripts/bootstrap.sh | bash -s
