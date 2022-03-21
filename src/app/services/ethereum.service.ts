import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
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

  constructor(private snackbar: MatSnackBar) {}

  async checkIfWalletIsConnected(): Promise<boolean> {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        const account = accounts[0];
        this.isWalletConnected = true;
        this.customerAddress = account;
        console.log('Account Connected: ', account);
        this.snackbar.open(
          '🎉🦊 Wallet connected! Account: ' + account,
          'Close',
          { duration: 5000 }
        );
        return true;
      } else {
        this.error = 'Please install a MetaMask wallet to use our bank.';
        console.log('No Metamask detected');
        this.snackbar.open(this.error, 'Dismiss');
        return false;
      }
    } catch (error) {
      this.snackbar.open(
        '🤔 Check if perhaps you dismissed the wallet connection popup',
        'Close'
      );
      console.log(error);
      return false;
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

  async setBankName(bankName: string): Promise<boolean> {
    if (bankName.length < 1) {
      return false;
    }
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
        return true;
      } else {
        console.log('Ethereum object not found, install Metamask.');
        this.error = 'Please install a MetaMask wallet to use our bank.';
        return false;
      }
    } catch (error) {
      console.log(error);
      return false;
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

  async depositMoney(amount: number): Promise<boolean> {
    if (amount <= 0) {
      this.snackbar.open('💸 Please enter a valid amount', 'Dismiss');
      return false;
    }
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
        return true;
      } else {
        console.log('Ethereum object not found, install Metamask.');
        this.error = 'Please install a MetaMask wallet to use our bank.';
        return false;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async withdrawMoney(amount: number): Promise<boolean> {
    if (amount <= 0) {
      this.snackbar.open('💸 Please enter a valid amount', 'Dismiss');
      return false;
    }
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
        return true;
      } else {
        console.log('Ethereum object not found, install Metamask.');
        this.error = 'Please install a MetaMask wallet to use our bank.';
        return false;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
