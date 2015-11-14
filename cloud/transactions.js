var agentObj = require("cloud/agent.js");

Parse.Cloud.define("deductAgentCredit", function (request, response) {
    Parse.Cloud.useMasterKey();
    var agentid = request.params.agentid;
    var creditQuery = new Parse.Query("UserCredits");
    creditQuery.equalTo("userId", { "__type": "Pointer", "className": "_User", "objectId": agentid });
    creditQuery.first({
        success: function (object) {
            if (object === undefined) {
                console.log("agent credits not found.")
            }
            else {
                // Successfully retrieved the object.
                object.increment("credits", parseInt(creditToadd) * -1);
                object.save(null, {
                    success: function (usercredit) {
                        //deduct credit of agent here

                    },
                    error: function (usercredit, error) {

                    }
                });
            }
        },
        error: function (error) {
            console.log("Error: " + error.code + " " + error.message);
        }
    });
});


Parse.Cloud.define("checkBalance", function (request, response) {
    var userid = request.params.id;
    var mustBalance = parseInt(request.params.balance);
    var creditQuery = new Parse.Query("UserCredits");
    creditQuery.equalTo("userId", { "__type": "Pointer", "className": "_User", "objectId": userid });
    creditQuery.first({
        success: function (result) {
            if (result != undefined) {
                if (result.get("credits") > mustBalance) {
                    response.success(true);
                }
                else {
                    response.success(false);
                }
            }
            else {
                response.error("There are no credit entry for user.");
            }
        },
        error: function (error) {
            response.error(error);
        }
    });
});

Parse.Cloud.define("addDeductCredit", function (request, response) {
    var userid = request.params.id;
    var amt = parseInt(request.params.amount);
    var addCredit = request.params.addCredit;
    var creditQuery = new Parse.Query("UserCredits");
    creditQuery.equalTo("userId", { "__type": "Pointer", "className": "_User", "objectId": userid });
    creditQuery.first({
        success: function (result) {
            if (result != undefined) {
                var newAmt = amt;
                if (!addCredit) {
                    newAmt = amt * -1;
                }
                result.increment("credits", newAmt);
                result.save(null, {
                    success: function (usercredit) {
                        //deduct credit of agent here
                        var message = "Credit added successfully.";
                        if (!addCredit) {
                            message = "Credit deducted successfully.";
                        }
                        response.success(message);
                    },
                    error: function (usercredit, error) {
                        response.error(error);
                    }
                });
            }
            else {
                response.error("There are no credit entry for user.");
            }
        },
        error: function (error) {
            response.error(error);
        }
    });
});

Parse.Cloud.define("fundTransfer", function (request, response) {
    Parse.Cloud.useMasterKey();
    var agentid = request.params.agentid;
    var userid = request.params.userid;
    var amt = parseInt(request.params.amount);
    var purpose = "transfer";
    //what we want to do is that mobile will send amount to deduct from agent credit and add it to user credits
    //so first we have to check whether agent have sufficient balance or not 
    //but it will be checked on user device we don't need to check it on cloud function
    //once balance is checked then we will proceed to deduct amount from credits using addDeductCredit function
    //after balance has been added or deducted we have to make an entry in transaction table so that we can keep record for that
    //we have already created method for transaction entry in agent.js
    var promises = [];
    promises.push(Parse.Cloud.run("addDeductCredit", { id: agentid, amount: amt, addCredit: false }, {
        success: function (result) {
            
        },
        error: function (error) { }
    }));
    promises.push(Parse.Cloud.run("addDeductCredit", { id: userid, amount: amt, addCredit: true }, {
        success: function (result) { },
        error: function (error) { }
    }));
    Parse.Promise.when(promises).then(function () {
        Parse.Cloud.run("transactionEntry", { from: agentid, to: userid, amount: amt, purpose: "transfer" }, {
            success: function (result) {
                console.log("do transaction transactionEntry result : " + result);
                response.success(result);
            },
            error: function (error) {
                console.log("error in transaction entry. : " + error);
                response.error(error);
            }
        });
    });
});

Parse.Cloud.define("agentGivingPermission", function (request, response) {
    var purpose = "";
});

Parse.Cloud.define("userGivingPermission", function (request, response) {
    Parse.Cloud.useMasterKey();
    var agentid = request.params.agentid;
    var userid = request.params.userid;
    var amt = parseInt(request.params.amount);
    var purpose = "transfer";
    //what we want to do is that mobile will send amount to deduct from agent credit and add it to user credits
    //so first we have to check whether agent have sufficient balance or not 
    //but it will be checked on user device we don't need to check it on cloud function
    //once balance is checked then we will proceed to deduct amount from credits using addDeductCredit function
    //after balance has been added or deducted we have to make an entry in transaction table so that we can keep record for that
    //we have already created method for transaction entry in agent.js
    var promises = [];
    promises.push(Parse.Cloud.run("addDeductCredit", { id: agentid, amount: amt, addCredit: false }, {
        success: function (result) {

        },
        error: function (error) { }
    }));
    promises.push(Parse.Cloud.run("addDeductCredit", { id: userid, amount: amt, addCredit: true }, {
        success: function (result) { },
        error: function (error) { }
    }));
    Parse.Promise.when(promises).then(function () {
        Parse.Cloud.run("transactionEntry", { from: agentid, to: userid, amount: amt, purpose: "transfer" }, {
            success: function (result) {
                console.log("do transaction transactionEntry result : " + result);
                response.success(result);
            },
            error: function (error) {
                console.log("error in transaction entry. : " + error);
                response.error(error);
            }
        });
    });
});

