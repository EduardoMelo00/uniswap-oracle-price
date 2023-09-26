require('dotenv').config();
import { Request, Response, NextFunction } from 'express';

const { ethers } = require("ethers");
const { abi: IUniswapV3PoolABI } = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json");
const { abi: QuoterABI } = require("@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json");

const { getAbi, getPoolImmutables } = require('./helpers')

require('dotenv').config()
const INFURA_URL = process.env.INFURA_URL
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY

const provider = new ethers.providers.JsonRpcProvider(INFURA_URL)

const poolAddress = '0xf8a95b2409c27678a6d18d950c5d913d5c38ab03'

const quoterAddress = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6"



const getPrice = async (req: Request, res: Response) => {

    let amount: string = req.params.amount;
   

    const poolContract = new ethers.Contract(
      poolAddress,
      IUniswapV3PoolABI,
      provider
    )
  
    const tokenAddress0 = await poolContract.token0();
    const tokenAddress1 = await poolContract.token1();

    console.log(tokenAddress0)
    console.log(tokenAddress1)
  
    const tokenAbi0 = await getAbi(tokenAddress0)
    const tokenAbi1 = await getAbi(tokenAddress1)
  
    const tokenContract0 = new ethers.Contract(
      tokenAddress0,
      tokenAbi0,
      provider
    )
    const tokenContract1 = new ethers.Contract(
      tokenAddress1,
      tokenAbi1,
      provider
    )
  
    const tokenSymbol0 = await tokenContract0.symbol()
    const tokenSymbol1 = await tokenContract1.symbol()
    const tokenDecimals0 = await tokenContract0.decimals()
    const tokenDecimals1 = await tokenContract1.decimals()

    
    const quoterContract =  new ethers.Contract(
      quoterAddress,
      QuoterABI,
      provider
    )

  
    const immutables = await getPoolImmutables(poolContract)


    const amountIn  = await ethers.utils.parseUnits(
        amount,
      tokenDecimals0
    )

    console.log(immutables.token0)
    console.log(immutables.token1)
  
    console.log(immutables.fee)
    console.log(amountIn)
  


    const quotedAmountOut = await quoterContract.callStatic.quoteExactInputSingle(
      immutables.token0,
      immutables.token1,
      10000,
      BigInt(amountIn),
      0
    )

    console.log('AQUI10')
    

  
    const amountOut =  ethers.utils.formatUnits(quotedAmountOut, tokenDecimals1)


    return res.status(200).json({
        message: `${amount} ${tokenSymbol0} can be swapped for ${amountOut} ${tokenSymbol1}`
    });
  }



export default { getPrice };