# Contract notifier

Opt-in service to send email notifications when a contract event is emitted

## Requirements

- NodeJS (tested on node v10.16.0)
- MongoDB
- Yarn (recommended)

## Installation
```
git clone https://github.com/status-im/contract-notifier
cd contract-notifier
yarn
```

## Usage
### Configuration
#### General
`./config/index.js`
- `PORT`: port where the API will be available (default: `4000`)
- `RATE_LIMIT_MAX_REQ`: Max number of connections during `RATE_LIMIT_TIME` milliseconds before sending a 429 response. (default: `1`)
- `RATE_LIMIT_TIME`: How long in milliseconds to keep records of requests in memory. (default: `15`)
- `DB_CONNECTION`: MongoDB connection string
- `BLOCKCHAIN_CONNECTION_POINT`: URL string of an ethereum node. (default: `http://localhost:8545`)
- `SENDGRID_API_KEY`: To send emails.
- `BLOCK_DELAY`: Adds a delay in the number of blocks to avoid reorgs. (default: `6`)
- `POLL_SLEEP`: Interval of time wait for polling the chain for new events. (default: `30`)

The `ENV` variable can be used to set these variables,  as well as a `.secret.json` file.

#### Dapp
Each dapp should have their own configuration and templates to send emails. To add a dapp, create a folder inside `./dapps/` with the dapp name. Also, edit `./config/dapps.js` lines 10 and 16 to add the new dapp. (**This will change with a proper dapp registry, to avoid this manual process**)

Each dapp folder should have a `config.js` file and one or more .html and .txt templates. See `./dapps/teller-network/config.js` for a sample config. 

(TODO: document the config file)


### Execution

- To launch the API endpoint:

```
yarn api
```

API will be available in http://localhost:4000 or whatever port was configured

- To launch the contract events mailer:

```
yarn watch
```

### Rest API

The following methods are available in the API:

#### Subscribe
- `POST`
- http://localhost:4000/:dappId/subscribe
```
{
  "email": "user@email.com",
  "address": "0x1234...ABCD",
  "signature": "0x1234...ABCD"
}
```
- Signature must be the user's `email` signed by the `address`
- Replies with `OK` if the subscription was successful. Otherwise, an error message is shown
- Sends a signup email with a token that expires in 2hr.
- `:dappId` must be known by the service.

#### Verify
- `GET`
- http://localhost:4000/confirm/:token
- Replies with `OK` if the token is valid. Otherwise an error message is shown
- Used to confirm that the user received the signup email.

#### Unsubscribe
- `POST`
- http://localhost:4000/:dappId/unsubscribe
```
{
  "address": "0x1234...ABCD",
  "signature": "0x1234...ABCD"
}
```
- Signature must be the `:dappId` signed by the `address`
- Replies with `OK` if the user is unsubscribed successfully. Otherwise, an error message is shown
- `:dappId` must be known by the service.

#### User exists
- `GET`
- http://localhost:4000/:dappId/user/:address
- Replies with `OK` if an user with `:address` is subscribed to the dapp events
- `:dappId` must be known by the service.


## Contribution
Thank you for considering to help out with the source code! We welcome contributions from anyone on the internet, and are grateful for even the smallest of fixes!

If you'd like to contribute to this project, please fork, fix, commit and send a pull request for the maintainers to review and merge into the main code base. If you wish to submit more complex changes though, please check up with the core devs first on #embark-status channel to ensure those changes are in line with the general philosophy of the project and/or get some early feedback which can make both your efforts much lighter as well as our review and merge procedures quick and simple.

## License
MIT
