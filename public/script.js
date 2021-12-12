// 'setTimeout' container
let timeoutContainer;


$(document).ready(function()
{
    // ***********************************************
    //                header buttons
    // ***********************************************

    $("#registerEnrollBtn").on("click", async function(event) 
    {
        $("#usernameContainer, #orgNameContainer").slideDown();
        $("#inputContainer, #minterOrgContainer, #minterUser, #mintAmount").slideUp();

        $("#registerEnrollBtn").css("background-color", "#f68114");
        $("#transfer, #mintTokenBtn").css("background-color", "#cccbcb");
        
        $("#transfer, #mintTokenBtn").attr("enabled", "false");
        $("#registerEnrollBtn").attr("enabled", "true");

        $("#receiversTableContainer").slideUp();     // hide receivers table
        $("#utxoTableContainer").slideUp();         // hide the utxo table
    });

    
    $("#mintTokenBtn").on("click", async function(event) 
    {
        $("#usernameContainer, #orgNameContainer, #inputContainer").slideUp();
        $("#minterOrgContainer, #minterUser, #mintAmount").slideDown();

        // $("#inputContainer").css("display", "flex");
        $("#registerEnrollBtn, #transfer").css("background-color", "#cccbcb");
        $("#mintTokenBtn").css("background-color", "#f68114");

        $("#mintTokenBtn").attr("enabled", "true");
        $("#registerEnrollBtn, #transfer").attr("enabled", "false");

        $("#receiversTableContainer").slideUp();
        $("#utxoTableContainer").slideUp();

        // get the users of 'org1'
        getUsersOfOrg("Pegah", "#dropdownMinter", "mintersList"); 
    });


    $("#transfer").on("click", async function(event) 
    {
        $("#usernameContainer, #orgNameContainer, #minterOrgContainer, #minterUser, #mintAmount").slideUp();
        $("#inputContainer").slideDown();

        $("#inputContainer").css("display", "flex");
        $("#registerEnrollBtn, #mintTokenBtn").css("background-color", "#cccbcb");
        $("#transfer").css("background-color", "#f68114");

        $("#transfer").attr("enabled", "true");
        $("#registerEnrollBtn, #mintTokenBtn").attr("enabled", "false");

        // show receiverfs table
        if (hasReceiverTableReceivers()) {
            $("#receiversTableContainer").slideDown();
        }

        // show the utxo table
        if(hasUtxoTableUtxos()) {
            $("#utxoTableContainer").slideDown(); 
        }
    });


    // ***************************************************************************
    //                              dropdown Section
    // ***************************************************************************

    // clear inputs at start
    $("#usernameInput, #orgNameInput, #usernameContainer, #orgNameContainer, \
    #senderOrgInput, #senderUserInput, #receiverOrgInput, #receiverUserInput").val("");
    

    // ***********************************************
    //                Register and Enroll
    // ***********************************************

    $("#downArrowEnrollOrg").on("click", async function(event) {
        $("#dropdownEnrollOrg").slideToggle();     
    });

    $(".orgEnrollList").on("click", async function(event) 
    {
        event.preventDefault();
        let selectedOrg = $(this).text();
        $("#orgNameInput").val(selectedOrg);    
        $("#dropdownEnrollOrg").slideToggle();  
    });


    // ***********************************************
    //                  Mint Section
    // ***********************************************

    $("#downArrowMinter").on("click", async function(event) {
        $("#dropdownMinter").slideToggle();        
    });

    $(".minterOrgsList").on("click", async function(event) 
    {
        event.preventDefault();
        let selectedOrg = $(this).text();

        // $("#minterOrgInput").val(selectedOrg);    
        // $("#dropdownMinterOrg").slideUp();
    });


    $(document).on('click', '.mintersList', function(event) 
    {
        let hasUsers = $("#dropdownMinter").attr("has-users");

        if (hasUsers === "true") 
        {
            let username = $(this).text();

            $("#minterUser").attr("is-selected", "true");
            $("#mintUserInput").val(username);        
            $("#dropdownMinter").slideUp();        
        }
    });


    // ***********************************************
    //         Transfere Section - Sender Org
    // ***********************************************

    $("#downArrowOrg").on("click", async function(event) {
        $("#dropdownOrg").slideToggle();        
        $("#dropdownUser, #dropdownMinter").slideUp();   
        $("#dropdownReceiverOrg").slideUp();   
        $("#dropdownReceiverUser").slideUp();
    });

    $(".orgList").on("click", async function(event) 
    {
        event.preventDefault();
        let selectedOrg = $(this).text();

        $("#senderOrgInput").val(selectedOrg);    
        $("#senderOrgContainer").attr("is-selected", "true");
        $("#dropdownOrg").slideUp();
        
        $("#senderUserInput").val("");
        $("#senderUserContainer").attr("is-selected", "false");

        $("#utxoTableContainer").slideUp(); // hide the utxo table
        clearUtxoTable();

        getUsersOfOrg(selectedOrg, "#dropdownUser", "senderUserList");  
    });


    // ***********************************************
    //        Transfere Section - Sender User
    // ***********************************************

    $("#downArrowUser").on("click", async function(event) {
        $("#dropdownUser").slideToggle();     
        $("#dropdownOrg , #dropdownMinter").slideUp();
        $("#dropdownReceiverOrg").slideUp();
        $("#dropdownReceiverUser").slideUp();
    });

    $(document).on('click', '.senderUserList', function(event) 
    {
        let isOrgSelected = $("#senderOrgContainer").attr("is-selected");
        let hasUsers = $("#dropdownUser").attr("has-users");

        
        if (isOrgSelected === "true" && hasUsers === "true") 
        {
            let username = $(this).text();
            let org = $("#senderOrgInput").val();

            $("#senderUserContainer").attr("is-selected", "true");
            $("#senderUserInput").val(username);        
            $("#dropdownUser").slideUp();        

            // get utoxs of the selected user
            getUtxos(username, org);
        }
    });


    // ***********************************************
    //       Transfere Section - Receiver Org
    // ***********************************************

    $("#downArrowReceiverOrg").on("click", async function(event) {
        $("#dropdownReceiverOrg").slideToggle();        
        $("#dropdownUser").slideUp();  
        $("#dropdownReceiverUser").slideUp();  
        $("#dropdownOrg").slideUp();
    });

    $(".receiverOrgList").on("click", async function(event) 
    {
        event.preventDefault();
        let selectedOrg = $(this).text();
        $("#receiverUserInput").val("");
        $("#receiverUserContainer").attr("is-selected", "false");

        $("#receiverOrgInput").val(selectedOrg);    
        $("#receiverOrgContainer").attr("is-selected", "true");
        $("#dropdownReceiverOrg").slideUp();

        getUsersOfOrg(selectedOrg, "#dropdownReceiverUser", "receiverUserList"); 
    });


    // check the input to be ONLY NUMBERS
    $("#mintUserAmount").keypress(function(event) 
    {
        event.preventDefault();
        
        let prevInputContent = $("#mintUserAmount").val();
        let charAssciiCode = event.which; // digit code is between 48 to 57
        let inputCharacter = String.fromCharCode(charAssciiCode);

        if (charAssciiCode >= 48 && charAssciiCode <= 57) {
            let newContent = prevInputContent + inputCharacter;
            $("#mintUserAmount").val(newContent);
        }
    });

    // ***********************************************
    //       Transfere Section - Receiver user
    // ***********************************************

    $("#downArrowReceiverUser").on("click", async function(event) {
        $("#dropdownReceiverUser").slideToggle();        
        $("#dropdownOrg").slideUp();  
        $("#dropdownReceiverOrg").slideUp();  
        $("#dropdownOrg").slideUp();
        $("#dropdownUser").slideUp();
    });
    
    $(document).on('click', '.receiverUserList', function(event) 
    {
        let selectedOrg = $(this).text();
        let isOrgSelected = $("#receiverOrgContainer").attr("is-selected");
        let hasUsers = $("#dropdownReceiverUser").attr("has-users");

        if (isOrgSelected === "true" && hasUsers === "true") {
            $("#receiverUserInput").val(selectedOrg);    
            $("#receiverUserContainer").attr("is-selected", "true");
            $("#dropdownReceiverUser").slideUp();        
        }
    });


    // check the input to be ONLY NUMBERS
    $("#transferAmountInput").keypress(function(event) 
    {
        event.preventDefault();
        
        let prevInputContent = $("#transferAmountInput").val();
        let charAssciiCode = event.which; // digit code is between 48 to 57
        let inputCharacter = String.fromCharCode(charAssciiCode);

        if (charAssciiCode >= 48 && charAssciiCode <= 57) {
            let newContent = prevInputContent + inputCharacter;
            $("#transferAmountInput").val(newContent);
        }

    });


    // ***********************************************
    //           Add Receiver to the Table
    // ***********************************************

    $("#addReceiverBtn").on("click", async function(event) 
    {
        let isOrgSelected = $("#receiverOrgContainer").attr("is-selected");
        let isUserSelected = $("#receiverUserContainer").attr("is-selected");
        let transferAmount = $("#transferAmountInput").val();
        
        // let selectedUtxoAmount = getSelectedUtxoAmount();    // return false if no utxo is selected
        let totalUtxoAmount = getTotalUtxosAmount();    // return false if no utxo is selected
        let sumOfUtxoAmounts = getTotalReceiverUtxosAmount();       // return 0 if no utxo is selected


        // if all required fields for receiver are filled
        if (isOrgSelected == "true"  &&  isUserSelected == "true"  &&  transferAmount.trim()) 
        {
            // // check if any utxo is selected 
            // if (!selectedUtxoAmount) {
            //     return alert("Please select a UTXO to transfer from.\nTo do that, first you need to select a sender user.")
            // }

            // check the sum of amounts
            if (sumOfUtxoAmounts + +transferAmount  >  totalUtxoAmount) {
                return alert(`Sum of receiver's amounts(${sumOfUtxoAmounts+ +transferAmount}) MUST ba less than or \
                equal to the total utxo amout(${totalUtxoAmount})`);
            }


            let receiverOrg = $("#receiverOrgInput").val();
            let receiverUser = $("#receiverUserInput").val();

            // let orgNumber = receiverOrg.match(/\d/g).join("");
            // let receiverOrgName = `org${orgNumber}`;
            let receiverOrgName = receiverOrg;

            let usersListWithClientId = $("#receiverUserInput ~ div a");
            let userClientId;
            for (let i = 0; i < usersListWithClientId.length; i++) {
                if(usersListWithClientId[i].innerText === receiverUser) {
                    userClientId = $(usersListWithClientId[i]).attr("clientId");
                    break;
                }
            }
            

            // ***********************************************
            //           Add Receiver to the Table
            // ***********************************************

            let tableBody = $("#receiverTbody");

            // 'td's of the row
            let editCol = `<td class="editBtnCol"><img src="./files/images/edit.png" alt="remove" class="editIcon"></td>`;
            let orgName = `<td>${receiverOrgName}</td>`;
            let receiver = `<td>${receiverUser}</td>`;
            let amount = `<td>${transferAmount}</td>`;
            let removeCol = `<td class="removeBtnCol"><img src="./files/images/remove.png" alt="remove" class="removeIcon"></td>`;
        
            // glue the 'td's together
            let gluedElems = editCol + orgName + receiver + amount + removeCol;
        
            // put data in a 'tr'
            let markup = `<tr clientId="${userClientId}">${gluedElems}</tr>`;
        
            $(tableBody).append(markup);

            
            // clean the input
            $("#receiverUserInput").val("");
            $("#transferAmountInput").val("");

            // show the table if NOT visible
            if (hasReceiverTableReceivers()) {
                $("#receiversTableContainer").slideDown();
            }
        }


        else return alert("All fields are required.");
    });

    

    // ***********************************************
    //                 Transfere Table
    // ***********************************************

    $(document).on('click', '.removeIcon', function(event) {
        $(this).parent().parent().remove();    
        if (!hasReceiverTableReceivers()) {
            $("#receiversTableContainer").slideUp();
        }
    });



    // ***********************************************
    //                Submit Section
    // ***********************************************

    $("#submitBtn").on("click", async function(event) 
    {  
        event.preventDefault(); 
        
        // register and enroll a user
        if ($("#registerEnrollBtn").attr("enabled") === "true") 
        {
            // values of inputs
            let username = $('#usernameInput').val();
            let org = $('#orgNameInput').val();
            
            if (!username.trim() || !org.trim()) {
                return alert("Both fields are required.")
            }

            // let orgNumber = org.match(/\d/g).join("");
            // let orgName = `org${orgNumber}`;
            let orgName = getAliasNameOfOrgs(org);

            registerAndEnroll(username, orgName);
        }


        // mint tokens
        else if ($("#mintTokenBtn").attr("enabled") === "true") 
        {
            let org = $("#minterOrgInput").val();
            // let orgNumber = org.match(/\d/g).join("");
            // let orgName = `org${orgNumber}`;
            let orgName = getAliasNameOfOrgs(org);
            let username = $("#mintUserInput").val();
            let mintAmount = $("#mintUserAmount").val();

            if (!username || !mintAmount) {
                return alert("All fields are required.");
            }


            $.ajax(
            {
                method: "POST",
                url: `http://51.38.54.24:4000/tokens/mint`,

                data: {
                    username,
                    orgName,
                    channelName: "mychannel",
                    chaincodeName: "token_utxo",
                    mintAmount
                },

                beforeSend: function() {
                    showHideLoading("loading");
                },
        
                success: function(data) {
                    showHideLoading("registerDone");
                    alert(`${mintAmount} tokens minted to ${username} successfully,`);
                },
        
                error: function(jqXHR, textStatus, errorThrown) 
                {
                    if (jqXHR.status == 403 || jqXHR.status == 404) {
                        alert(errorThrown);
                        console.error(errorThrown);
                    }
                    
                    else {
                        console.error(errorThrown);
                        alert("An error occurred in getting users list in Mint section.\nSee the console for more info.");
                    }
        
                    showHideLoading("registerDone");
                }
            });
        }


        // transfer tokens
        else if ($("#transfer").attr("enabled") === "true") 
        {
            // check if there is any receiver in the table
            // sener user and utxo selection also are checked
            let hasReceivers = hasReceiverTableReceivers();

            if (hasReceivers)
            {
                // values of inputs
                let senderUser = $("#senderUserInput").val();
                let senderOrg = $("#senderOrgInput").val();
                // let orgNumber = senderOrg.match(/\d/g).join("");
                // let orgName = `org${orgNumber}`;
                let orgName = getAliasNameOfOrgs(senderOrg);
                let transferAmount = +getTotalReceiverUtxosAmount();

                // select utxos based on the amount of transfer amount
                let sortedUtxos = sortUtxos();
                let selectedUtxos = selectProperUtxos(sortedUtxos, +transferAmount).utxos;
                let selectedUtxoKeys = selectProperUtxos(sortedUtxos, +transferAmount).keys;


                $.ajax(
                {
                    method: "POST",
                    url: `http://51.38.54.24:4000/tokens/transfer`,

                    data: {
                        username: senderUser,
                        orgName,
                        channelName: "mychannel",
                        chaincodeName: "token_utxo",
                        senderInfo: {
                            utxo_keys: selectedUtxoKeys,
                            owner: $("#utxoTableBody").attr("owner"),
                            amount: sumOfMultiUtxoAmount(selectedUtxos) - getTotalReceiverUtxosAmount()
                        },

                        receivers: createReceiversTransferArray()
                    },

                    beforeSend: function() {
                        showHideLoading("loading");
                    },
            
                    success: function(data) 
                    {
                        $("#utxoTableContainer").slideUp(); // hide the utxo table
                        clearReceiversTable();
                        showHideLoading("registerDone");

                        alert("Transfer done successfully\nAfter 2 seconds, the UTXO table will refresh automatically.");

                        setTimeout(function() {
                            getUtxos(senderUser, orgName);
                        }, 2000);
                    },
            
                    error: function(jqXHR, textStatus, errorThrown) 
                    {
                        if (jqXHR.status == 404) {
                            alert(errorThrown);
                            console.error(errorThrown);
                        }
                        
                        else {
                            console.error(errorThrown);
                            alert("An error occurred in transfering tokens.\nSee the console for more info.");
                        }
            
                        showHideLoading("registerDone");
                    }
                });
            }

            else {
                return alert("At least one receiver MUST be included.")
            }
        }
    });
});



// **************************************************************************************************
//                                              functions
// **************************************************************************************************

// register and enroll the user in organization
function registerAndEnroll(username, org) 
{  
    // let orgNumber = org.match(/\d/g).join("");
    // let orgName = `org${orgNumber}`;
    let orgName = getAliasNameOfOrgs(org);


    $.ajax(
        {
        method: "POST",
        url: `http://51.38.54.24:4000/users/register`,

        data: {
            username,
            orgName
        },

        beforeSend: function() {
            showHideLoading("loading");
            $('#tableBody tr:nth-child(1n+1)').remove();
        },

        success: function(data) {
            showHideLoading("registerDone");
            // alert(`User: '${username}' enrolled in Organization: '${orgName}'`);
            alert(`User: '${username}' enrolled`);
        },

        error: function(jqXHR, textStatus, errorThrown) 
        {
            if (jqXHR.status == 400) {
                alert(`User exists in Organization: '${orgName}'`);
            }
            
            else {
                console.error(errorThrown);
                console.log("Error: ", textStatus);
                alert("An error occurred in register/enroll process.\nSee the console for more info.");
            }

            showHideLoading("registerDone");
        }
    });
}


// get the users list of an organization
function getUsersOfOrg(org, dropdownElem, usersClassName)
{
    // let orgNumber = org.match(/\d/g).join("");
    // let orgName = `org${orgNumber}`;
    // let orgName = getAliasNameOfOrgs(org);
    let orgName = org;

    $.ajax(
    {
        method: "GET",
        url: `http://51.38.54.24:4000/users/list/${orgName}`,

        success: function(data) {
            addUsersToOrgList(data, dropdownElem, usersClassName);
        },

        error: function(jqXHR, textStatus, errorThrown) 
        {
            if (jqXHR.status == 404) {
                alert(`No users found in this Organization`);
            }
            
            else {
                console.error(errorThrown);
                alert("An error occurred in getting users list.\nSee the console for more info.");
            }

            showHideLoading("registerDone");
        }
    });
}


// add users of an organization to the list bellow its name
function addUsersToOrgList(usersObj, dropdownElem, usersClassName)
{
    $(`${dropdownElem}`).attr("has-users", "true");
    $(`${dropdownElem}`).empty();     // remove previous usrers from the list

    // add users to the list
    for (let key in usersObj) {
        $(`${dropdownElem}`).append(`<a href="#" class="${usersClassName}" clientId="${usersObj[key]}">${key}</a>`);
    }
}


// create receivers array for tansfer
function createReceiversTransferArray()
{
    let receiversInTable = $("#receiverTbody").children();
    let receiversInfo = [];

    let aliasOrgName;

    for (let i = 0, len = receiversInTable.length; i < len; i++) 
    {
        let receiverInfo = $(receiversInTable[i]).children();
        aliasOrgName = getAliasNameOfOrgs($(receiverInfo[1])[0].innerText);
        
        let clientId = $(receiversInTable[i]).attr("clientId");
        // let receiverOrgName = $(receiverInfo[1])[0].innerText;
        let receiverOrgName = aliasOrgName;
        let receiverUsername = $(receiverInfo[2])[0].innerText;
        let receiverAmount = $(receiverInfo[3])[0].innerText;

        let receiverObj = {
            username: receiverUsername,
            orgName: receiverOrgName,
            owner: clientId,
            amount: receiverAmount
        }

        receiversInfo.push(receiverObj)
    }


    return receiversInfo;
}


// check if the receivers table has any receiver
function hasReceiverTableReceivers() {
    let numOfRows = $("#receiverTbody").children().length;
    return numOfRows;
}

// check if the utxo table has any utxo
function hasUtxoTableUtxos() {
    let numOfRows = $("#utxoTableBody").children().length;
    return numOfRows;
}


// get sum of utxo amount for receivers
function getTotalReceiverUtxosAmount()
{
    let tableBody = $("#receiverTbody");
    let rowsOfTable = tableBody.children();
    let numOfReceivers = rowsOfTable.length;

    let sumOfUtxoAmounts = 0;

    // if therew is any receiver
    if (numOfReceivers)
    {
        for (let i = 0; i < numOfReceivers; i++) {
            let row = rowsOfTable[i];
            let amount = $(row).children()[3].innerText;
            sumOfUtxoAmounts += +amount;
        }

        return sumOfUtxoAmounts;
    }

    return 0;
}


// get total amount of all utxos
function getTotalUtxosAmount()
{
    let tableBody = $("#utxoTableBody");
    let rowsOfTable = tableBody.children();
    let numOfUtxos = rowsOfTable.length;

    let sumOfUtxoAmounts = 0;

    // if there is any utxo
    if (numOfUtxos)
    {
        for (let i = 0; i < numOfUtxos; i++) {
            let row = rowsOfTable[i];
            let amount = $(row).children()[1].innerText;

            // do not include the total field
            if ($(row).attr("id") !== "utxoTableLastLine") {
                sumOfUtxoAmounts += +amount;
            }
        }

        return sumOfUtxoAmounts;
    }

    return 0;
}


// get utxos of a users
function getUtxos(username, org)
{
    // let orgNumber = org.match(/\d/g).join("");
    // let orgName = `org${orgNumber}`;
    let orgName = getAliasNameOfOrgs(org);

    $.ajax(
    {
        method: "POST",
        url: `http://51.38.54.24:4000/tokens/getInfo`,

        data: {
            username: `${username}`,
            orgName: orgName,
            channelName: "mychannel",
            chaincodeName: "token_utxo"
        },

        success: function(data) {
            addUtxosToTable(data);
        },

        error: function(jqXHR, textStatus, errorThrown) 
        {
            if (jqXHR.status == 400) {
                alert(`User: '${username} of Organization: '${orgName}' has NO tokens'`);
                $("#utxoTableContainer").slideUp(); 
            }
            
            else {
                console.error(errorThrown);
                alert("An error occurred in getting user's utxos.\nSee the console for more info.");
            }

            showHideLoading("registerDone");
        }
    });
}


// sprt utxos based on the amount
function sortUtxos()
{
    let tableBody = $("#utxoTableBody");
    let rowsOfTable = tableBody.children();
    let numOfUtxos = rowsOfTable.length - 1;    // last line is the total amount

    // if there is any utxo
    if (numOfUtxos)
    {
        let utxosArr = [];
        let utxoObj = {};

        for (let i = 0; i < numOfUtxos; i++) 
        {
            let row = rowsOfTable[i];
            let utxoKey = $(row).children()[0].innerText;
            let amount = $(row).children()[1].innerText;

            utxoObj = {
                key: utxoKey,
                amount: +amount,
            }

            // add utxo info to the array
            utxosArr.push(utxoObj);
        }

        // sort the utxos based on their amount - ascending
        utxosArr.sort((a,b) => (a.amount > b.amount) ? 1 : ((b.amount > a.amount) ? -1 : 0));
        return utxosArr;
    }

    return false;
}


// select peroper utxos based on the amount of transfer amount
function selectProperUtxos(sortedUtxos, transferAmount)
{
    let selectedUtxos = [];
    let selectedUtxoKeys = [];
    let sumOfSelectedUtxosAmount = 0;

    for (let i = 0; i < sortedUtxos.length; i++)
    {
        if (sumOfSelectedUtxosAmount < +transferAmount) {
            selectedUtxos.push(sortedUtxos[i]);
            selectedUtxoKeys.push(sortedUtxos[i].key);
            sumOfSelectedUtxosAmount += +sortedUtxos[i].amount;
        }

        else break;
    }

    return {
        keys: selectedUtxoKeys,
        utxos: selectedUtxos
    };
}


// clear the utxo table for new data
function clearUtxoTable() {
    $("#utxoTableBody").empty();
}

// clear the receivers table for new data
function clearReceiversTable() {
    $("#receiverTbody").empty();
    $("#receiversTableContainer").slideUp();
}


// get the amount of the selected utxo
function getSelectedUtxoAmount() 
{
    let selectedRadioBtn = $('input[name="utxo"]:checked');
    let utxoAmount;

    if (selectedRadioBtn.length) {
        utxoAmount = $(selectedRadioBtn).parent().parent().find("td:nth-child(2)")[0].innerText;
        return +utxoAmount;
    }

    return false;
}


// get the amount of the selected utxos - multi utxo
function sumOfMultiUtxoAmount(utxosArr) 
{
    let sumOfAmount = 0;

    utxosArr.forEach(utxo => {
        sumOfAmount += +utxo.amount;
    });

    return sumOfAmount;
}


// get 'utxo_key' of the selected utxo
function getSelectedUtxoKey() 
{
    let selectedRadioBtn = $('input[name="utxo"]:checked');

    if (selectedRadioBtn.length) {
        let utxoKey = $(selectedRadioBtn).parent().parent().find("td:nth-child(1)")[0].innerText;
        return utxoKey;
    }

    return false;
}


// add utxos to the table
function addUtxosToTable(utxoData) 
{  
    $("#utxoTableContainer").slideUp(); // hide the utxo table
    clearUtxoTable();

    let tableBody = $('#utxoTableBody');

    // put the owner of utxos to the table attrs
    $(tableBody).attr("owner", utxoData[0].owner)

    
    for (let i = 0; i < utxoData.length; i++)
    {    
        // 'td's of the row
        let utxoKey = `<td>${utxoData[i].utxo_key}</td>`;
        let amount = `<td>${utxoData[i].amount}</td>`;
        // let radioBtn = `<td><input type="radio" name="utxo" class="utxoRadioInput"></td>`;
    
        // glue the 'td's together
        let gluedElems = utxoKey + amount;
        // let gluedElems = utxoKey + amount + radioBtn;
    
        // put data in a 'tr'
        let markup = `<tr>${gluedElems}</tr>`;
    
        tableBody.append(markup);
    }

    
    // add total amount of all utxos to the end of the table
    let totalUtxoAmount = getTotalUtxosAmount();
    let totalUtxoAmountRow = `<tr id="utxoTableLastLine"><td>Total</td><td id="totalUtxoAmount">${totalUtxoAmount}</td></tr>`;
    tableBody.append(totalUtxoAmountRow);

    // show the table if NOT visible
    $("#utxoTableContainer").slideDown();
}


// get alias name of orgs
function getAliasNameOfOrgs(orgName) 
{
    if (orgName === "org1" || orgName === "Mihan" || orgName === "Pegah" || orgName === "Choupan") {
        return "org1";
    }

    else return "org2";
}


// show/hide loading animations
function showHideLoading(status) 
{  
    if (status === "loading") {
        $("#submitBtn").css("display", "none");
        $("#loading").css("display", "block");
    }
    
    else if (status === "registerDone") {
        $("#loading").css("display", "none");
        $("#submitBtn").css("display", "block");
    }

    else if (status === "doneByParams") {
        $("#submitBtn").css("display", "block");
        $("#abortBtn").css("display", "none");
        $("#loading").css("display", "none");

        $("#followingTick, #followingTick+label").slideDown();
    }

    // '_f' means 'following' option is enabled
    else if (status === "doneByParams_f") {
        $("#submitBtn").css("display", "none");
        $("#abortBtn").css("display", "block");
        $("#loading").css("display", "none");
    }

    else if (status === "abort") {
        $("#submitBtn").css("display", "block");
        $("#abortBtn").css("display", "none");
        $("#loading").css("display", "none");

        $("#followingTick, #followingTick+label").slideDown();
    }
}


// convert timestamp to time(hh:mm:ss)
function convetTimestampToTime(ts) 
{  
    let date = new Date(ts);

    let hour = date.getHours();
    let minute = date.getMinutes();
    let second = date.getSeconds();
    
    let time = hour + ":" + minute + ":" + second;
    return time;
}
