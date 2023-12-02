'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

////////////////////////////////////////////////////////
// ---------------------------------- APPLICATION LOGIC

accounts.forEach(function(account) {
  account.username = account?.owner.toLowerCase().split(' ').map(name => name[0]).join('');
})

let account, timer;

const setLogoutTimer = function() {
  const logoutUser = function() {
    const minute = `${Math.trunc(totalTime / 60)}`.padStart(2, 0);
    const second = `${totalTime % 60}`.padStart(2, 0);
    labelTimer.textContent = `${minute}:${second}`;

    if (totalTime == 0) {
      clearInterval(setLogoutTimer);
      labelWelcome.textContent = `Login to get started`;
      containerApp.style.opacity = 0;
    }
    totalTime--;
  };

  let totalTime = 10 * 60;    // 10 minutes
  logoutUser();
  const timer = setInterval(logoutUser, 1000);
  return timer;
}

btnLogin.addEventListener('click', function(e) {
  e.preventDefault();

  const username = inputLoginUsername.value;
  const userPin = +(inputLoginPin.value);

  account = accounts.find(account => account?.username === username && account?.pin === userPin);

  if (account) {
    // Clear existing logout timer, if one exists
    clearInterval(timer);
    timer = setLogoutTimer();
    
    welcome(account);
  } else {
    alert('Invalid Credentials');
  }

  // Empty the input values and remove input focus
  inputLoginUsername.value = inputLoginPin.value = '';
  inputLoginUsername.blur();
  inputLoginPin.blur();
})


btnTransfer.addEventListener('click', function(e) {
  e.preventDefault();
  
  const receiverName = inputTransferTo.value;
  const transferAmount = +(inputTransferAmount.value);
  const receiverAccount = accounts.find(acc => acc?.username === receiverName);

  inputTransferTo.value = inputTransferAmount.value = '';
  inputTransferTo.blur();
  inputTransferAmount.blur();

  if (account.balance >= transferAmount && account.username !== receiverAccount?.username && receiverAccount && transferAmount > 0) {
    account.movements.push(-transferAmount);
    receiverAccount?.movements.push(transferAmount);
    const date = (new Date()).toISOString();
    account.movementsDates.push(date);
    receiverAccount?.movementsDates.push(date);
    updateUI(account);
    
    clearInterval(timer);
    timer = setLogoutTimer();
  } else {
    alert('Invalid Transaction. Please check the entered details and ensure you have enough balance.');
  }
})


btnLoan.addEventListener('click', function(e) {
  e.preventDefault();
  const loanAmount = +Math.floor(inputLoanAmount.value);
  const grantLoan = account.movements.some(amount => amount >= loanAmount * 0.1);
  if (grantLoan && loanAmount > 0) {
    setTimeout(function() {
      account.movements.push(loanAmount);
      const date = (new Date()).toISOString();
      account.movementsDates.push(date);  
      updateUI(account)
    }, 3000);
    
    clearInterval(timer);
    timer = setLogoutTimer();
  } else {
    alert('Loan Can\'t Be Sanctioned!!!');
  }

  inputLoanAmount.value = '';
  inputLoanAmount.blur();
})


btnClose.addEventListener('click', function(e) {
  e.preventDefault();
  const inputUsername = inputCloseUsername.value;
  const inputPin = +(inputClosePin.value);
  if (account.username === inputUsername && account.pin === inputPin) {
    const accountIndex = accounts.findIndex(acc => acc.username === inputUsername && acc.pin === inputPin);
    if (accountIndex >= 0) {
      // Delete account (Remove from accounts array)
      accounts.splice(accountIndex, 1);

      // Hide UI
      containerApp.style.opacity = 0;
    } else {
      alert('Invalid Credentials!!!');
    }
  } else {
    alert('Invalid Credentials!!!');
  }

  inputCloseUsername.value = inputClosePin.value = '';
  inputCloseUsername.blur();
  inputClosePin.blur();
})

let sorted = false;

btnSort.addEventListener('click', function(e) {
  e.preventDefault();
  displayMovements(account, !sorted);
  sorted = !sorted;
})


const welcome = function(account) {
  containerApp.style.opacity = 100;
  
  // Display Welcome Message
  greet(account);

  // Display Date
  displayDate();

  // Update UI with User details
  updateUI(account);
}

const displayDate = function() {
  const now = new Date();
  const dateOptions = {
    year: 'numeric',
    day: 'numeric',
    month: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }
  labelDate.textContent = new Intl.DateTimeFormat(account.locale, dateOptions).format(now);

  // const date = `${now.getDate()}`.padStart(2, 0);
  // const month = `${now.getMonth() + 1}`.padStart(2, 0);
  // const year = now.getFullYear();
  // const hours = `${now.getHours()}`.padStart(2, 0);
  // const minutes = `${now.getMinutes()}`.padStart(2, 0);
  // labelDate.textContent = `${date}/${month}/${year}, ${hours}:${minutes}`;
}

const updateUI = function(account) {
  // Display Movements (Transactions)
  displayMovements(account, false);

  // Display Balance
  calculateBalance(account);

  // Display Summary
  displayDeposits(account);
  displayWithdrawls(account);
  displayInterest(account);
}

const greet = function(account) {
  const firstName = account.owner.split(' ')[0];
  labelWelcome.textContent = `Good Day, ${firstName}!`;
}

const movementDate = function(date) {
  
  const now = new Date();
  const dateDifference = (dateInput) => Math.round(Math.abs(now - dateInput) / (1000 * 60 * 60 * 24));
  
  if (dateDifference(date) == 0) return 'Today';
  if (dateDifference(date) == 1) return 'Yesterday';
  if (dateDifference(date) == 2) return '2 days ago';
  if (dateDifference(date) == 3) return '3 days ago';
  if (dateDifference(date) == 4) return '4 days ago';
  if (dateDifference(date) == 5) return '5 days ago';
  if (dateDifference(date) == 6) return '6 days ago';
  if (dateDifference(date) == 7) return '7 days ago'; 
  else {
    const finalDate = new Intl.DateTimeFormat(account.locale).format(date);
    
    // const date_result = `${date.getDate()}`.padStart(2, 0);
    // const month_result = `${date.getMonth() + 1}`.padStart(2, 0);
    // const year_result = date.getFullYear();
    // const finalDate = `${date_result}/${month_result}/${year_result}`;

    return finalDate; 
  }
}

const formatAmount = function(value, locale, curr) {
  const options = {
    style: 'currency',
    currency: curr
  };
  const outputValue = new Intl.NumberFormat(locale, options).format(value);
  return outputValue;
}

const displayMovements = function(account, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort ? account.movements.slice().sort((first, second) => first-second) : account.movements;

  movs.forEach(function(value, index) {
    const type = value < 0 ? 'withdrawal' : 'deposit';

    let movement_date = new Date(account.movementsDates[index]);
    movement_date = movementDate(movement_date);

    const amountValue = formatAmount(value, account.locale, account.currency);

    const html = `<div class="movements__row">
                  <div class="movements__type movements__type--${type}">${index+1} ${type}</div>
                  <div class="movements__date">${movement_date}</div>
                  <div class="movements__value">${amountValue}</div>
                </div>`;
                
    containerMovements.insertAdjacentHTML('afterbegin', html);
  })
}

const calculateBalance = function(account) {
  const balance = account.movements.reduce((sum, currentValue) => sum + currentValue, 0);
  account.balance = balance;
  labelBalance.textContent = `${ formatAmount(balance, account.locale, account.currency) }`;
}

const displayDeposits = function(account) {
  const sumOfDeposits = account.movements.filter(ele => ele > 0).reduce((acc, curr) => acc + curr, 0);
  labelSumIn.textContent = `${ formatAmount(sumOfDeposits, account.locale, account.currency) }`;
}

const displayWithdrawls = function(account) {
  const sumOfWithdrawls = Math.abs(account.movements.filter(ele => ele < 0).reduce((acc, curr) => acc + curr, 0));
  labelSumOut.textContent = `${ formatAmount(sumOfWithdrawls, account.locale, account.currency) }`;
}

const displayInterest = function(account) {
  const interest = account.movements.filter(ele => ele > 0).map(ele => (ele * account.interestRate) / 100).reduce((acc, curr) => acc + curr);
  labelSumInterest.textContent = `${ formatAmount(interest, account.locale, account.currency) }`;
}

// FAKE LOGIN
// account = account1;
// welcome(account);

