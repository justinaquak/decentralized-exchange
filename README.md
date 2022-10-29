# D' Chemical Exchange
Decentralized Exchange Application

# Project Description
A minimal viable Decentralized Exchange (DEX) on Ethereum and a simple front-end website, which supports listing of available asset tokens on the marketplace, submission of trading order, matching and execution of orders (i.e., swapping/exchanging/trading assets), and most importantly, in our DEX, users have the ultimate control of his/her own digital assets.

# How to Install and Run the Project
- clone the project with:
```
git clone https://github.com/justinaquak/decentralized-exchange/ OR
download zip
```
- open project on Visual Studio Code
- npm install in frontend directory
```
cd frontend
npm install
```
- npm install in backend directory
```
cd backend
npm install
```
1. first terminal to start the hardhat local server in the backend directory
```
npx hardhat node
```
2. second terminal to compile the contracts and start the backend server in the backend directory
```
npx hardhat compile
node server
```
3. third terminal to start the client in the frontend directory
```
npm start
```

# Table of Contents
1. [Assumptions](#assumptions)
2. [Detailed Installation Guide](#detailed-installation-guide) 
3. [Diagrams](#diagrams)
4. [Feature Requirements](#feature-requirements)
5. [Faucet](#faucet)
6. [Limit Orders](#limit-orders)
7. [Market Orders](#market-orders)
8. [Cancel Order](#cancel-order)

# Assumptions
1. The application only supports up to 3 accounts and only three ERC20 tokens are created for this application ```GOLD, SILVER, BRONZE```
2. No decimals are accepted in our token exchange (eg 1.1, 10.003 ...) 
2. Private keys will be entrusted to the application. For users trying the testnet and mainnet do create an .env to store your private keys so that our application can retrieve your meta wallets / addresses
3. For testing purposes and demonstration purposes we will be using the hardhat local network. The accounts are already fixed and preconfigured.
4. If there is a need to restart any portion (eg. client or server), please restart **everything** ```npx hardhat node, client and server etc.``` for a smoother user experience. 
5. To simulate liquidity in the market, we set a value to each of our tokens, namely GOLD at $100, SILVER at $10 and BRONZE at $1. 

# Detailed Installation Guide

## For Testnet and Mainnet users
In the root of the backend directory create a ```.env``` file for example:

![image](https://user-images.githubusercontent.com/72204360/198837988-62dca814-a68e-4fb4-b715-f7f89700c18a.png)

Define your own testnet or mainnet network with the documentations [here](https://hardhat.org/hardhat-runner/docs/config). Then change the default network to your prefered net in ```hardhat.config.js```. We will be using hardhat's local server for demo purposes.

![image](https://user-images.githubusercontent.com/72204360/198838810-422ca8b8-b145-451c-a039-86f51f55a751.png)

## For Local Hardhat Network users
Users must start the hardhat server using the ```npx hardhat node``` command, the accounts are already fixed and preconfigured

![image](https://user-images.githubusercontent.com/72204360/198326003-93bb13d2-2142-4842-88a4-9b3851cb8240.png)

If the contract has not been compiled, do go ahead with ```npx hardhat compile``` to compile the contracts. <br />
After which, start the backend server with ```node server```:

![image](https://user-images.githubusercontent.com/72204360/198327240-791a0c68-c055-4346-8edf-712dadd7485e.png)

Create another terminal for the client and run the client using the command ```npm start```:

![image](https://user-images.githubusercontent.com/72204360/198327541-e472636d-d9b0-4fe1-9309-f5bc976e73b1.png)

The loaded webpage will automate the deployment process and deploy your own ERC20 tokens and an interacting contract under your first account

![image](https://user-images.githubusercontent.com/72204360/198328305-90e5c56a-3276-4aeb-91f1-c2e411e104f6.png)

# Diagrams
## Overarching Structure of Contracts
![UML diagram](https://user-images.githubusercontent.com/72204360/198621815-3cba2152-5e8b-459a-bc6a-0a25c34371d2.jpg)

## Architecture Diagram
![UML diagram (2)](https://user-images.githubusercontent.com/72204360/198623467-44568541-cf72-409c-a379-219d96c7aefa.jpg)

## Data Structure
![UML diagram (1)](https://user-images.githubusercontent.com/72204360/198623413-ec66c638-a8ce-41f6-aa46-7e4fc4ad3dd5.jpg)

# Feature Requirements
1. We have created three ERC20 tokens [GOLD(AU)](https://goerli.etherscan.io/tokens?q=0xEef920699f0f3D6C9a03346213C519a8F9A35376), [SILVER(AG)](https://goerli.etherscan.io/tokens?q=0x2496Cb30Df872EDDdc6b92dF526FDDd26A66AF7C), [BRONZE(CU)](https://goerli.etherscan.io/tokens?q=0x89637993E55c8f5F018987783014b1Ad54CbD07a) 

![image_2022-10-29_20-47-13](https://user-images.githubusercontent.com/73157214/198839881-392034f1-e911-4f69-9ca3-464528977100.png)


2. Submit buy and sell orders has been implemented in [limit orders](#limit-orders)
3. Matched orders in the marketplace will be fulfilled fully or partially with [limit orders](#limit-orders) and [market orders](#market-orders)
4. Users will be able to [cancel](#cancel-order) their orders and the locked funds will be dispensed
5. Orders can be matched between 3 users with [batch execution](#batch-execution)
6. Our [faucet request](#faucet) is a conditional order involving a time constraint

# Faucet

Click on ```Request``` to request GOLD, SILVER and BRONZE tokens

![image](https://user-images.githubusercontent.com/72204360/198329290-9625b5de-40e1-4d09-91b7-03425556eeeb.png)

Balance will be updated on click

![image](https://user-images.githubusercontent.com/72204360/198329475-c88c4002-88fe-47c2-9450-e0820587f32c.png)

Faucets supposed to be rate limited to once per day per account however for testing and grading purposes we rate limited per account to once per 2 minutes per account

![image](https://user-images.githubusercontent.com/72204360/198329511-175d4080-4984-44c8-9d05-103763249b84.png)

# Limit Orders

To place a buy limit order, select the token you want to buy on the left, with the price and the amount you would like. On the right, select the token you would like to exchange with. Once done, click on the exchange icon in the middle to execute the trade. Take note of the account selected at the top panel, as this is the account that would be executing the trade. If there are suitable orders, the order will be fulfilled instantly, else they will be added into the orderbook. 

![image](https://user-images.githubusercontent.com/73157214/198345470-46194302-857d-4ff2-9f31-ae3b2c25e7a5.png)

![image](https://user-images.githubusercontent.com/73157214/198347340-ef133fae-0ab3-454c-8e84-e93bb7506199.png)

After doing so, the orderbook should be updated (based on certain conditions), and the user's balance should be updated as well. This is because the exchange will lockup the token on the right, in this case the Bronze token. 

![image](https://user-images.githubusercontent.com/73157214/198346530-aec072f3-656b-4280-969e-46cb0fd86850.png)

If you would like to place a sell order instead, click on the top left "Buy" icon toggle to "Sell" instead. 

![image](https://user-images.githubusercontent.com/73157214/198347655-624cb927-ac74-406a-b9f4-3846cb71dca6.png)

For a sell order, the token on the left is the one we want to sell, and we are specifying the price and amount of the tokens. 

# Market Orders

For a market order, all you need to specify is the number of tokens, and the order will be fulfilled/partially fulfilled if there are suitable orders. 

![image](https://user-images.githubusercontent.com/73157214/198350603-802bf9bd-ecc1-4614-bf9d-b86c925101a2.png)

The exchange will also preemptively calculate the amount of tokens you would need in order to exchange for your wanted tokens.

# Batch Execution
![image](https://user-images.githubusercontent.com/73157214/198841178-65c8b5eb-27a5-4fa3-bc2f-b7471beb5e75.png)

https://user-images.githubusercontent.com/73157214/198841201-81dc3a9d-a082-4995-98fb-91c292e8b935.mp4

# Cancel Order

If a user would like to cancel their order, they can do so in the User Orders component. 

![image](https://user-images.githubusercontent.com/73157214/198353242-2134469d-cdba-4b28-b18f-853b0383f7fe.png)

After the order is cancelled, the locked up tokens are also returned to the user. 

![image](https://user-images.githubusercontent.com/73157214/198353346-acef55e6-0927-47e4-9344-b63593e4f9ec.png)


