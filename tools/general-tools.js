// node_modules
const shell = require('shelljs');
const colors = require('colors');
const { Base64 } = require('js-base64');

// paths
const test_network_dir = "/usr/local/go/src/github.com/hyperledger/fabric-samples/test-network";
const bashFilesDir = ('./bash-files');


// check if the identity exists
function checkIdentityExistence(username, orgName, res)
{
    let foundFlag = false;

    // get the list of users enrolled in an 'orgName'
    let usersList = getUsersList(orgName, res, true);


    if (usersList.success)
    {
        usersList.data.forEach(user => {
            // if username found
            if (user === username) {
                return foundFlag = true;
            }
        });
    
        // if username exists
        if (foundFlag) {
            return {
                success: true,
                code: "userExists"
            };
        }
        
        // if username NOT found
        else {
            return {
                success: true,
                code: "userNotFound"
            };
        }
    }
    
    else if (!usersList.success){
        return usersList;
    }
}


// get users list from MSP folder
function getUsersList(orgName, res, extractName) 
{
    let checkOrg = checkOrgExistence(orgName);

    // if organization NOT found
    if (checkOrg.success) {
        if (!checkOrg.found) {
            return getErrorMessage("orgNotFound", res);
        }
    }


    let usersFolder = `${test_network_dir}/organizations/peerOrganizations/${orgName}.example.com/users/`;

    // check the users directory contents
    const lsResult = shell.exec(`ls ${usersFolder}`, {silent: true});

    // if NO error
    if (lsResult.code === 0) 
    {
        let allUsersList = lsResult.stdout.split('\n');
        let usersList = [];     // filtered users (without 'Admin' and 'User1' users)


        // remove empty strings
        allUsersList.forEach((user, index) => 
        {
            // remove 'Admin' and 'User1' users from the list
            if (user.search("Admin") === -1  &&  user.search("User1") === -1  &&  user !== "") 
            {
                // extract only the username instead of e.g: 'username@org1.example.com'
                if (extractName) {
                    usersList.push(user.replace(`@${orgName}.example.com`, ""));
                }

                else usersList.push(user);
            }
        });


        return {
            success: true,
            data: usersList
        };
    }


    // any error in running 'ls' command
    else 
    {
        let lsError = lsResult.stderr;

        // if file or directory NOT found
        if (lsError.search("such file or directory") !== -1) {
            return {
                success: false,
                message: `There is no Organizations with name: ${orgName}`,
                code: "orgNotFound"
            }
        }

        else {
            console.log(colors.bgRed("Error in 'getUsersList' func"));
            console.log(colors.red(lsError));
            return {
                success: false,
                message: lsResult.stderr,
                code: "failureGetUsers"
            }
        }
    }
}


// check organization existence
function checkOrgExistence(orgName)
{
    let orgsFolder = `${test_network_dir}/organizations/peerOrganizations/`;

    // check the users directory contents
    const lsResult = shell.exec(`ls ${orgsFolder}`, {silent: true});


    // if NO error
    if (lsResult.code === 0) 
    {
        let foundFlag = false;
        let orgsList = lsResult.stdout.split('\n');

        orgsList.forEach(org => {
            if (org.search(orgName) !== -1) {
                return foundFlag = true;
            }
        });


        // if organization found
        if (foundFlag) return {
            success: true,
            found: true
        };

        else return {
            success: true,
            found: false
        };
    }


    // any error in running 'ls' command
    else 
    {
        let lsError = lsResult.stderr;

        console.log(colors.bgRed("Error in 'getUsersList' func"));
        console.log(colors.red(lsError));
        return {
            success: false,
            message: lsResult.stderr,
            code: "failureGetOrgs"
        }
    }
}


// get user clientId in a channel and chaincode
function getClientId(username, orgName, res)
{
    let orgNumber = orgName.match(/\d/g).join("");


    let shellResult = shell.exec(`${bashFilesDir}/getClientId.sh ${username} ${orgNumber}`, {silent: true});


    if (shellResult.code !== 0) {
        let shellError = shellResult.stderr;
        console.log(colors.bgRed("Error in getClientId.sh"));
        console.log(colors.red(shellError));
        // res.status(500).send("Error in getting clientId of the user");
        return false;
    }


    else 
    {
        let clintId = shellResult.stdout;

        // remove '\n' from the end of the strings
        if (clintId.slice(-1) === "\n") {
            clintId = clintId.slice(0, -1)
        }

        return clintId;
    }
}


// decode base64 clientID and find the username in it
function compareWithBase64Info(username, orgName, encodedBase64) 
{
    let decoded = Base64.decode(encodedBase64);
    
    if (decoded.search(username) !== -1  &&  decoded.search(orgName) !== -1) {
        return true;
    }
        
    return false;
}


// prepare transfer command
function prepareUtxosList(utxo_keys) 
{
    let utxoKeysArr = [];
    
    // add receivers to the participants list
    for (let i = 0, len = utxo_keys.length; i < len; i++) {
        let utxoKey = `\\"${utxo_keys[i]}\\"`;
        utxoKeysArr.push(JSON.stringify(utxoKey));
    }

    // return generated utxoKeys list
    return utxoKeysArr;
}


// prepare transfer command
function prepareParticipantsList(senderInfo, receiversInfo) 
{
    let senderProps = `{\\"utxo_key\\":\\"\\",\\"owner\\":\\"${senderInfo.owner}\\",\\"amount\\":${senderInfo.amount}}`;
    let participantsProps = [];

    // add sender to the participants list
    participantsProps.push(JSON.stringify(senderProps));

    
    // add receivers to the participants list
    for (let i = 0, len = receiversInfo.length; i < len; i++) {
        let props = `{\\"utxo_key\\":\\"\\",\\"owner\\":\\"${receiversInfo[i].owner}\\",\\"amount\\":${receiversInfo[i].amount}}`;
        participantsProps.push(JSON.stringify(props));
    }
    

    return participantsProps;
}


// generate proper error message and handle the request
function getErrorMessage(errorCode, res) 
{
    // organization NOT found
    if(errorCode === "orgNotFound") {
        return res.status(400).send(`There is no such Organization`);
    }

    // error in getting users list
    else if(errorCode === "failureGetUsers") {
        return res.status(500).send("Could NOT get users list!");
    }

    // chaincode NOT found
    else if(errorCode === "ccnNotFound") {
        return res.status(500).send("Chaincode does NOT exist!");
    }
    
    // channel NOT found
    else if(errorCode === "channelNotFound") {
        return res.status(500).send("Channel does NOT exist!");
    }
}




module.exports = {
    checkOrgExistence,
    checkIdentityExistence,
    getUsersList,
    getErrorMessage,
    getClientId,
    compareWithBase64Info,
    prepareParticipantsList,
    prepareUtxosList
}