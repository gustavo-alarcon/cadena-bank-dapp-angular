import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EthereumService } from './services/ethereum.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  isWalletConnected: boolean = false;

  depositControl = new FormControl('');
  withdrawControl = new FormControl('');
  bankNameControl = new FormControl('');

  constructor(
    public ethereumService: EthereumService,
    private snackbar: MatSnackBar
  ) {
    this.ethereumService.checkIfWalletIsConnected().then((res) => {
      if (res) this.isWalletConnected = res;
    });
    this.ethereumService.getBankName();
    this.ethereumService.getBankOwner();
    this.ethereumService.customerBalance();
  }

  public deposit() {
    this.snackbar.open(
      '🙌🏻Transactions could take a while, so be patience',
      'Dismiss',
      { duration: 10000 }
    );
    this.ethereumService
      .depositMoney(this.depositControl.value)
      .then((res) => {
        if (res) {
          this.snackbar.open('✅ Deposit successful ', 'Accept', {
            duration: 6000,
          });
          this.depositControl.reset();
        } else {
          this.snackbar.open('💸 Please enter a valid amount', 'Dismiss');
          this.depositControl.reset();
        }
      })
      .catch((error) => {
        console.log(error);
        this.snackbar.open(
          '🚨 There was an issue, please try again',
          'Dismiss',
          {
            duration: 6000,
          }
        );
      });
  }

  public withdraw() {
    this.snackbar.open(
      '🙌🏻Transaction could take a while, so be patience',
      'Dismiss',
      { duration: 10000 }
    );
    this.ethereumService
      .withdrawMoney(this.withdrawControl.value)
      .then((res) => {
        if (res) {
          this.snackbar.open('✅ Withdraw successful ', 'Accept', {
            duration: 6000,
          });
          this.depositControl.reset();
        } else {
          this.snackbar.open('💸 Please enter a valid amount', 'Dismiss');
          this.depositControl.reset();
        }
      })
      .catch((error) => {
        console.log(error);
        this.snackbar.open(
          '🚨 There was an issue, please try again',
          'Dismiss',
          {
            duration: 6000,
          }
        );
      });
  }

  public setBankName() {
    this.ethereumService.setBankName(this.bankNameControl.value).then((res) => {
      if (res) {
        this.snackbar.open('✅ Name changed successfully ', 'Accept', {
          duration: 6000,
        });
        this.depositControl.reset();
      } else {
        this.snackbar.open('🚩 Please enter a valid name', 'Dismiss');
        this.depositControl.reset();
      }
    });
    this.bankNameControl.reset();
  }
}
