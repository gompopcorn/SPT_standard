// node_modules
const express = require('express');
const app = express();
const shell = require('shelljs');
const colors = require('colors');
const cors = require('cors');
const path = require('path');

// tools & constants
const tools = require('./tools/general-tools.js')
const bashFilesDir = ('./bash-files');
const PORT = process.argv[2] || 4000;

app.options('*', cors());
app.use(cors());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, HEAD, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});


app.use(express.json());  // parse application/json
app.use(express.json({type: 'application/vnd.api+json'}));  // parse application/vnd.api+json as json
app.use(express.urlencoded({ extended: true }));  // parse application/x-www-form-urlencoded

//set root folder to 'public'
app.use(express.static(path.join(__dirname, 'public')));


app.get("/", (req, res) => {
    return res.sendFile("index.html");
});


// register and enroll the user
app.post('/users/register', async (req, res) => 
{
    let username =  req.body.username;
    let orgName = req.body.orgName;
    let orgNumber = orgName.match(/\d/g).join("");

    // check if user exists
    let userExistence = await tools.checkIdentityExistence(username, orgName, res);


    // chekning user existence done - if failed, an Error will be returned to the user
    if (userExistence.success) 
    {
        // if username found
        if (userExistence.code === "userExists") {
            return res.status(400).send("User already exists!");
        }

        // if there is no the same username, register and enroll the user
        else 
        {
            // *****************************************************
            //             Register and Enroll the User
            // *****************************************************

            let shellResult = shell.exec(`${bashFilesDir}/userActions.sh ${username} ${orgName} ${orgNumber}`, {silent: true});
        
            if (shellResult.code !== 0) {
                let shellError = shellResult.stderr;
                console.log(colors.bgRed("Error in userActions.sh"));
                console.log(colors.red(shellError));
                return res.status(500).send("Error in registering/enrolling the user");
            }

            return res.send("User Enrolled Successfully");
        }
    }
});


// get users list
app.get('/users/list/:orgName', async (req, res) => 
{
    let orgName = req.params.orgName;


    // *****************************************************
    //                  Hard-Code Section
    // *****************************************************

    if (orgName === "Mihan") {
        let userObj = { "Ayoub_Paydari": tools.getClientId("Ayoub_Paydari", "org1", res) };
        return res.send(userObj);
    }

    else if (orgName === "Pegah") 
    {
        let userObj = { 
            "Abdollah_Ghoddusi": tools.getClientId("Abdollah_Ghoddusi", "org1", res),
            "Reza_KarimNejad": tools.getClientId("Reza_KarimNejad", "org1", res)
        };

        return res.send(userObj);
    }

    else if (orgName === "Ofogh Kourosh") 
    {
        let userObj = { 
            "Hosein_Saberi": tools.getClientId("Hosein_Saberi", "org2", res),
            "Ali_Ebrahimi": tools.getClientId("Ali_Ebrahimi", "org2", res)
        };
        
        return res.send(userObj);
    }




    // check if user exists
    let getUsersList = await tools.getUsersList(orgName, res, true);
    

    // if users list checked with NO errors
    if (getUsersList.success) 
    {
        let usersList = getUsersList.data;

        if (usersList.length > 0) 
        {
            let usersListWithId = {};
            let userClientId;

            // add each user's clientId to the list
            for (let i = 0; i < usersList.length; i++) 
            {
                // get clientId of the user
                userClientId = tools.getClientId(usersList[i], orgName, res);

                if (userClientId) {
                    usersListWithId[usersList[i]] = tools.getClientId(usersList[i], orgName, res);
                }

                else return res.status(500).send(`Could NOT get clientId of '${usersList[i]}'`);
            }

            return res.send(usersListWithId);
        }
        
        
        else return res.status(404).send("No users found!");
    }
});


// get user clientId
app.get('/users/clientId', async (req, res) => 
{
    let username = req.body.username;
    let orgName = req.body.orgName;
    let orgNumber = orgName.match(/\d/g).join("");


    // check if user exists
    let userExistence = await tools.checkIdentityExistence(username, orgName, res);
    
    // if users list checked with NO errors
    if (userExistence.success) 
    {
        // if the username found
        if (userExistence.code === "userExists") 
        {
            // *****************************************************
            //                 get user toekns info
            // *****************************************************

            let shellResult = shell.exec(`${bashFilesDir}/getClientId.sh ${username} ${orgNumber}`, {silent: true});
        
            if (shellResult.code !== 0) 
            {
                let shellError = shellResult.stderr;

                // if channel NOT found
                if (shellError.search(`'${channelName}' not found`)  !== -1) {
                    return tools.getErrorMessage("channelNotFound", res);
                }

                // if chaincode NOT found
                else if (shellError.search(`${chaincodeName} not found`)  !== -1) {
                    return tools.getErrorMessage("ccnNotFound", res);
                }

                console.log(colors.bgRed("Error in getClientId.sh"));
                console.log(colors.red(shellError));
                return res.status(500).send("Error in getting user clientId");
            }


            let userClientId = shellResult.stdout;
            return res.send(userClientId);
        }
        

        // if the user NOT found
        else return res.status(404).send("User NOT found!");
    }
});


// get users utxos
app.post('/tokens/getInfo', async (req, res) => 
{
    let username = req.body.username;
    let orgName = req.body.orgName;
    let orgNumber = orgName.match(/\d/g).join("");
    let channelName = req.body.channelName;
    let chaincodeName = req.body.chaincodeName;



    // check if user exists
    let userExistence = await tools.checkIdentityExistence(username, orgName, res);
    
    // if users list checked with NO errors
    if (userExistence.success) 
    {
        // if the username found
        if (userExistence.code === "userExists") 
        {
            // *****************************************************
            //                 get user toekns info
            // *****************************************************

            let shellResult = shell.exec(`${bashFilesDir}/getUserTokens.sh ${username} ${orgName} ${orgNumber} \
            ${channelName} ${chaincodeName}`, {silent: true});
        
            if (shellResult.code !== 0) 
            {
                let shellError = shellResult.stderr;

                // if channel NOT found
                if (shellError.search(`'${channelName}' not found`)  !== -1) {
                    return tools.getErrorMessage("channelNotFound", res);
                }

                // if chaincode NOT found
                else if (shellError.search(`${chaincodeName} not found`)  !== -1) {
                    return tools.getErrorMessage("ccnNotFound", res);
                }

                console.log(colors.bgRed("Error in getUserTokens.sh"));
                console.log(colors.red(shellError));
                return res.status(500).send("Error in getting user tokens info");
            }


            let tokensInfo = shellResult.stdout;

            // if ther user has NO token
            if ( tokensInfo.split()[0] === "\n"  ||  !tokensInfo.split().length ) {
                return res.status(400).send("No token found for the user");
            }

            else return res.send(JSON.parse(tokensInfo));
        }
        
        // if the user NOT found
        else return res.status(404).send("User NOT found!");
    }
});


// minnt tokens for a user
app.post('/tokens/mint', async (req, res) => 
{
    let username =  req.body.username;
    let orgName = req.body.orgName;
    let orgNumber = orgName.match(/\d/g).join("");
    let channelName = req.body.channelName;
    let chaincodeName = req.body.chaincodeName;
    let mintAmount = req.body.mintAmount;

    
    // check if user exists
    let userExistence = await tools.checkIdentityExistence(username, orgName, res);


    // chekning user existence done - if failed, an Error will be returned to the user
    if (userExistence.success) 
    {
        // if the username found
        if (userExistence.code === "userExists") 
        {
            // *****************************************************
            //                      Mint Tokens
            // *****************************************************

            let shellResult = shell.exec(`${bashFilesDir}/mintTokens.sh ${username} ${orgName} ${orgNumber} \
            ${channelName} ${chaincodeName} ${mintAmount}`, {silent: true});
        
            if (shellResult.code !== 0) 
            {
                let shellError = shellResult.stderr;

                // if channel NOT found
                if (shellError.search(`'${channelName}' not found`)  !== -1) {
                    return tools.getErrorMessage("channelNotFound", res);
                }

                // if chaincode NOT found
                else if (shellError.search(`${chaincodeName} not found`)  !== -1) {
                    return tools.getErrorMessage("ccnNotFound", res);
                }

                // if client is NOT allowed to mint tokens
                else if (shellError.search("client is not authorized to mint new tokens")  !== -1) {
                    return res.status(403).send("Client is not authorized to mint new tokens");
                }

                console.log(colors.bgRed("Error in mintTokens.sh"));
                console.log(colors.red(shellError));
                return res.status(500).send("Error in minting tokens for the user");
            }

            return res.send(`${mintAmount} tokens minted for the user ${username} successfully`);
        }


        // if the user NOT found
        else return res.status(404).send("User NOT found to mint");
    }
});


app.post('/tokens/transfer', async (req, res) => 
{
    let username =  req.body.username;
    let orgName = req.body.orgName;
    let orgNumber = orgName.match(/\d/g).join("");
    let channelName = req.body.channelName;
    let chaincodeName = req.body.chaincodeName;
    let senderInfo = req.body.senderInfo;   // object
    let receivers = req.body.receivers;     // array of objects

    senderInfo.username = username;

    
    // check if user exists
    let userExistence = await tools.checkIdentityExistence(username, orgName, res);


    // chekning user existence done - if failed, an Error will be returned to the user
    if (userExistence.success) 
    {
        // if the username found
        if (userExistence.code === "userExists") 
        {
            // *****************************************************
            //         compare username with sender's name
            // *****************************************************

            let compareResult = tools.compareWithBase64Info(username, orgName, senderInfo.owner);

            if (!compareResult) {
                return res.status(400).send(`Username: '${username}' and OrgName: ${orgName} MUST be the same as sender's`);
            }


            // *******************************************************
            //    check 'receiver' field to be an Array of Objects
            // *******************************************************

            let typeFlag = true;

            // check the type of 'receivers' to be an Array of Objects
            if (Array.isArray(receivers)) 
            {
                receivers.forEach(receiver => {
                    if (typeof(receiver) !== "object") {
                        return typeFlag = false;
                    }
                });

                // return to user, if any type error found in 'receivers'
                if (typeFlag === false) {
                    return res.status(400).send("'receivers' field MUST be an Array of Objects.");
                }
            }


            // if the 'receivers' field is empty
            if (!receivers.length) {
                return res.status(400).send("'receivers' field MUST include at least one receiver");
            }

            
            // *****************************************************************
            //    compare receiveres' usernames with their names(owner field)
            // *****************************************************************
            
            let compareErrorFalg = false;
            let userWithError_username, userWithError_owner;

            receivers.forEach(receiver => {
                let compareWithOwner = tools.compareWithBase64Info(receiver.username, receiver.orgName, receiver.owner);

                if (!compareWithOwner) {
                    userWithError_username = receiver.username;
                    userWithError_owner = receiver.owner;
                    return compareErrorFalg = true;
                }
            });
            
            // if any difference found between receiver's username and name(owner field)
            if (compareErrorFalg) {
                return res.status(400).send(`Username: '${userWithError_username}' MUST be the same as receiver's name: '${userWithError_owner}'`)
            }


            // *****************************************************
            //             check receiver users to exist
            // *****************************************************

            let notFoundUser = null;

            receivers.forEach(async receiver => 
            {
                // check if user exists
                let userExistence = await tools.checkIdentityExistence(receiver.username, receiver.orgName, res);

                // chekning user existence done - if failed, an Error will be returned to the user
                if (userExistence.success) {
                    if (userExistence.code !== "userExists") {
                        return notFoundUser = receiver.username;
                    }
                }
            });

            
            // if the a user from receivers NOT found
            if(notFoundUser) {
                return res.status(404).send(`User '${notFoundUser}' in receivers NOT found!`);
            }


            // *****************************************************
            //             transfer tokens between users
            // *****************************************************

            // prepare transfer command
            let participantsList = tools.prepareParticipantsList(senderInfo, receivers);
            let utxoKeysList = tools.prepareUtxosList(senderInfo.utxo_keys) 


            let shellResult = shell.exec(`${bashFilesDir}/transferTokens.sh ${username} ${orgName} ${orgNumber} \
            ${channelName} ${chaincodeName} ${utxoKeysList} [${participantsList}]`, {silent: true});
        
            if (shellResult.code !== 0) 
            {
                let shellError = shellResult.stderr;

                // if channel NOT found
                if (shellError.search(`'${channelName}' not found`)  !== -1) {
                    return tools.getErrorMessage("channelNotFound", res);
                }

                // if chaincode NOT found
                else if (shellError.search(`${chaincodeName} not found`)  !== -1) {
                    return tools.getErrorMessage("ccnNotFound", res);
                }

                console.log(colors.bgRed("Error in mintTokens.sh"));
                console.log(colors.red(shellError));
                return res.status(500).send("Error in minting tokens for the user");
            }


            // return res.send(`${mintAmount} tokens minted for the user ${username} successfully`);
            return res.send(`Transfere done successfully`);
        }


        // if the user NOT found
        else return res.status(404).send(`User '${username}' NOT found!`);
    }
});


app.post('/redeem', (req, res) => {

});




app.listen(PORT, function() {
    console.log(`=======================================\n`);
    console.log(`    Server listening on port: ${PORT}`);
    console.log(`\n=======================================\n`);
});