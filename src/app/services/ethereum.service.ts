import { Injectable } from '@angular/core';
import { ethers, utils } from 'ethers';
import abi from '../contracts/Bank.json';
declare let window: any;

@Injectable({
  providedIn: 'root',
})
export class EthereumService {
  private contractAddress = '0x91fFb6202189A81F1854C789Acf971B0fDDd659c';
  private contractABI = abi.abi;

  isWalletConnected: boolean = false;
  isBankOwner: boolean = false;
  bankOwnerAddress: string = '';
  customerTotalBalance: string = '0';
  currentBankName: string = '';
  customerAddress: string = '';
  error: string = '';

  constructor() {}

  async checkIfWalletIsConnected(): Promise<void> {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        const account = accounts[0];
        this.isWalletConnected = true;
        this.customerAddress = account;
        console.log('Account Connected: ', account);
      } else {
        this.error = 'Please install a MetaMask wallet to use our bank.';
        console.log('No Metamask detected');
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getBankName(): Promise<void> {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(
          this.contractAddress,
          this.contractABI,
          signer
        );
        let bankName = await bankContract.bankName();
        console.log(bankName);
        if (bankName) {
          bankName = utils.parseBytes32String(bankName);
          this.currentBankName = bankName;
        }
      } else {
        console.log('Ethereum object not found, install Metamask.');
        this.error = 'Please install a MetaMask wallet to use our bank.';
      }
    } catch (error) {
      console.log(error);
    }
  }

  async setBankName(bankName: string): Promise<void> {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(
          this.contractAddress,
          this.contractABI,
          signer
        );
        const txn = await bankContract.setBankName(
          utils.formatBytes32String(bankName)
        );
        console.log('Setting Bank Name ...');
        await txn.wait();
        console.log('Bank Name Cahnged ', txn.hash);
        await this.getBankName();
      } else {
        console.log('Ethereum object not found, install Metamask.');
        this.error = 'Please install a MetaMask wallet to use our bank.';
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getBankOwner(): Promise<void> {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(
          this.contractAddress,
          this.contractABI,
          signer
        );
        let bankOwner = await bankContract.bankOwner();
        this.bankOwnerAddress = bankOwner;

        const [account] = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });

        if (account === this.bankOwnerAddress) {
          this.isBankOwner = true;
        }
      } else {
        console.log('Ethereum object not found, install Metamask.');
        this.error = 'Please install a MetaMask wallet to use our bank.';
      }
    } catch (error) {
      console.log(error);
    }
  }

  async customerBalance(): Promise<void> {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(
          this.contractAddress,
          this.contractABI,
          signer
        );

        let balance = await bankContract.getCustomerBalance();
        this.customerTotalBalance = utils.formatEther(balance);
        console.log('Customer Balance: ', balance);
      } else {
        console.log('Ethereum object not found, install Metamask.');
        this.error = 'Please install a MetaMask wallet to use our bank.';
      }
    } catch (error) {
      console.log(error);
    }
  }

  async depositMoney(amount: number): Promise<void> {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(
          this.contractAddress,
          this.contractABI,
          signer
        );
        const txn = await bankContract.depositMoney({
          value: ethers.utils.parseEther(amount.toString()),
        });
        console.log('Depositing Money ...');
        await txn.wait();
        console.log('Deposit Complete', txn.hash);
        await this.customerBalance();
      } else {
        console.log('Ethereum object not found, install Metamask.');
        this.error = 'Please install a MetaMask wallet to use our bank.';
      }
    } catch (error) {
      console.log(error);
    }
  }

  async withdrawMoney(amount: number): Promise<void> {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(
          this.contractAddress,
          this.contractABI,
          signer
        );

        let myAddress = await signer.getAddress();
        console.log('Provider signer...', myAddress);

        const txn = await bankContract.withdrawMoney(
          myAddress,
          ethers.utils.parseEther(amount.toString())
        );
        console.log('Withdrawing Money ...');
        await txn.wait();
        console.log('Withdraw Complete', txn.hash);
        await this.customerBalance();
      } else {
        console.log('Ethereum object not found, install Metamask.');
        this.error = 'Please install a MetaMask wallet to use our bank.';
      }
    } catch (error) {
      console.log(error);
    }
  }
}
