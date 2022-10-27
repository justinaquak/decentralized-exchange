# D' Chemical Exchange
Decentralized Exchange Application

# Project Description
A minimal viable Decentralized Exchange (DEX) on Ethereum and a simple front-end website, which supports listing of available asset tokens on the marketplace, submission of trading order, matching and execution of orders (i.e., swapping/exchanging/trading assets), and most importantly, in our DEX, users have the ultimate controlof his/her own digital assets.

# How to Install and Run the Project
- clone the project with:
```
git clone https://github.com/justinaquak/fyp-blockchain/ name OR
download zip
```
- open project on Visual Studio Code
- npm install in frontend directory
```
cd frontend
npm install
```
- to start the client
```
npm start
```
- npm install in backend directory
```
cd backend
npm install
```
- to start server
```
npx hardhat node
npx hardhat compile
nodemon server
```
# Table of Contents
1. [Assumptions](#assumptions)
2. [Detailed Installation Guide](#detailed-installation-guide) 
3. [Faucet](#faucet)
4. [Limit Market](#limit-market)

# Assumptions
1. Private keys will be entrusted to the application. For testnet and mainnet do create an .env to store your private keys so that our application can retrieve your meta wallets
2. For testing purposes we will be using hardhat local network. Accounts are fixed and preconfigured.
3. Multiple terminals will be needed

# Detailed Installation Guide
## For Testnet and Mainnet users
In the root of the backend directory create an .env file (for testnet and mainnet) for example:

![image](https://user-images.githubusercontent.com/72204360/198324490-12f56bad-6efd-49df-9aea-a375da170685.png)

Change the default network to goerli for example or your prefered net

![image](https://user-images.githubusercontent.com/72204360/198324434-3b89acbb-c4b8-4f80-a7f6-24478e65e91d.png)

## For Local Hardhat Network
For users using the ```npx hardhat node``` command, accounts are already fixed and preconfigured, no actions is needed

![image](https://user-images.githubusercontent.com/72204360/198326003-93bb13d2-2142-4842-88a4-9b3851cb8240.png)

After the server has been hosted with ```node server```:

![image](https://user-images.githubusercontent.com/72204360/198327240-791a0c68-c055-4346-8edf-712dadd7485e.png)

Create another terminal for the client with to ```npm start```:

![image](https://user-images.githubusercontent.com/72204360/198327541-e472636d-d9b0-4fe1-9309-f5bc976e73b1.png)

The loaded webpage will auto deploy tokens and an interacting contract under your accounts

![image](https://user-images.githubusercontent.com/72204360/198328305-90e5c56a-3276-4aeb-91f1-c2e411e104f6.png)

# Faucet

Click on request to request GOLD SILVER and BRONZE

![image](https://user-images.githubusercontent.com/72204360/198329290-9625b5de-40e1-4d09-91b7-03425556eeeb.png)

Balance will be updated on click

![image](https://user-images.githubusercontent.com/72204360/198329475-c88c4002-88fe-47c2-9450-e0820587f32c.png)

Faucet supposed to be rate limited to once per day however for testing and grading purposes we rate limited per account to once per 2 minutes

![image](https://user-images.githubusercontent.com/72204360/198329511-175d4080-4984-44c8-9d05-103763249b84.png)
