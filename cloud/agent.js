var deductCreditAgent = 20;
var deductCreditUser = 10;
var agentDefaultCredit = 1000;
//For agent 
//create user
Parse.Cloud.define("getConfigParameter", function (request,response) {
    Parse.Config.get().then(function (config) {
        console.log("configuration we get : ");
        console.log(config);
        deductCreditAgent = config.get("deductCreditAgent");
        deductCreditUser = config.get("deductCreditUser");
        agentDefaultCredit = config.get("agentDefaultCredit");
        response.success("Successfull");
    }, function (error) {
        // Something went wrong (e.g. request timed out)
        console.log("Error in getting config.");
        response.error(error);
    });
});

Parse.Cloud.define("creditsUser", function (request, response) {
    Parse.Cloud.useMasterKey();
    var userid = request.params.userId;
    var addOrNot = request.params.addOrNot;
    var UserCredits = Parse.Object.extend("UserCredits");
    var usercredit = new UserCredits();
    if (deductCreditUser === 0) {
        var promise = Parse.Promise.as();
        promise = Parse.Cloud.run("getConfigParameter", {}, {
            success: function () {
                var message = "Yay! Agent number is " + deductCreditUser + "!";
                console.log(message);
            },
            error: function (err) {
                console.log("some problem while getting config parameter.");
                response.error(err);
            }
        });
        return promise;
    }
    //check whether agent have sufficient balance or not
    var agentCreditQuery = new Parse.Query("UserCredits");
    agentCreditQuery.equalTo("userId", { "__type": "Pointer", "className": "_User", "objectId": userid });
    agentCreditQuery.first({
        success: function (userCredit) {
            if (userCredit === undefined) {
                console.log("agent credits are not available.Lets add.");
                promise = Parse.Cloud.run("addUserToCreditTable", { userId: userid }, {
                    success: function (userResult) {
                        usercredit = userResult;
                    },
                    error: function (err) {
                        console.log("Unable to add user credit. Reason : " + err);
                        response.error(err);
                    }
                });
                return promise;
            } else {
                console.log("we found user in userCredits : ");
                usercredit = userCredit;
                console.log(usercredit);
            }
        },
        error: function (error) {
            console.log("unable to find user credits");
            response.error("Unable to get user credits.");
        }
    }).then(function () {
        if (usercredit.get('credits') < deductCreditUser && addOrNot === false) {
            console.log("To give permission to new user you atleast need 10 credits.");
            response.error("Insufficient balance in account.");
        } else {
            var amount = deductCreditUser;
            if (!addOrNot) {
                amount = deductCreditUser * -1;                
            }
            console.log("amount for increment. : " + amount);
            usercredit.increment("credits",amount);
            usercredit.save(null, {
                success: function () {
                    var message = "Credit deducted from user profile.";
                    if (addOrNot)
                        message = "Credit added to user.";
                    console.log(message);
                    response.success(message);
                },
                error: function (error) {
                    console.log("unable to delete credit of user. Reason : " + error);
                    response.error(error);
                }
            });
        }
    });
});

Parse.Cloud.define("deductFromAgent", function (request, response) {
    Parse.Cloud.useMasterKey();
    var agentid = request.params.agentId;
    var UserCredits = Parse.Object.extend("UserCredits");
    var agentcredit = new UserCredits();
    var promise = Parse.Promise.as();
    if (agentDefaultCredit === 0) {        
        promise = Parse.Cloud.run("getConfigParameter", {}, {
            success: function () {
                var message = "Yay! Agent number is " + deductCreditAgent + "!";
                console.log(message);
            },
            error: function (err) {
                console.log("some problem while getting config parameter.");
                response.error(err);
            }
        });
        return promise;
    }
    //check whether agent have sufficient balance or not
    console.log("checking whether agent have sufficient balance or not.");
    var agentCreditQuery = new Parse.Query("UserCredits");
    agentCreditQuery.equalTo("userId", { "__type": "Pointer", "className": "_User", "objectId": agentid });
    agentCreditQuery.first({
        success: function (agentCredit) {
            console.log("user credit query for agent.");
            if (agentCredit === undefined) {
                console.log("agent credits are not available.Lets add.");
                promise = Parse.Cloud.run("addAgentToCreditTable", { agentId: agentid }, {
                    success: function (agentResult) {
                        agentcredit = agentResult;
                    },
                    error: function (err) {
                        console.log("Unable to add agent credit. Reason : " + err);
                        response.error(err);
                    }
                });
                return promise;
            } else {
                console.log("found agent credits.");
                console.log(agentCredit);
                agentcredit = agentCredit;
            }
        },
        error: function (error) {
            console.log("unable to find agent credits");
            response.error("Unable to find agents credits.");
        }
    }).then(function () {
        if (agentcredit.get('credits') < deductCreditAgent) {
            console.log("To add new user you atleast need 20 credits.");
            response.error("Insufficient balance in account.");
        } else {
            console.log("agent have sufficient balance.");
            agentcredit.increment("credits",deductCreditAgent * -1);
            agentcredit.save(null, {
                success: function () {
                    console.log("Successfully deducted credit from agent account.");
                    response.success("Credit deducted from agent profile.");
                },
                error: function (error) {
                    console.log("unable to delete credit of agent. Reason : " + error);
                    response.error(error);
                }
            });
        }
    });
});

Parse.Cloud.define("addAgentToCreditTable", function (request, response) {
    var agentid = request.params.agentId;
    var UserCredits = Parse.Object.extend("UserCredits");
    var usercredit = new UserCredits();
    usercredit.set("userId", { "__type": "Pointer", "className": "_User", "objectId": agentid });
    usercredit.set("credits", agentDefaultCredit);
    usercredit.save(null, {
        success: function (agentCredit) {
            response.success(agentCredit);
        },
        error: function (err) {
            response.error(err);
        }
    });
});

Parse.Cloud.define("addUserToCreditTable", function (request, response) {
    var userid = request.params.userId;
    var UserCredits = Parse.Object.extend("UserCredits");
    var usercredit = new UserCredits();
    usercredit.set("userId", { "__type": "Pointer", "className": "_User", "objectId": userid });
    usercredit.set("credits", 0);
    usercredit.save(null, {
        success: function (agentCredit) {
            response.success(agentCredit);
        },
        error: function (err) {
            response.error(err);
        }
    });
});

Parse.Cloud.define("addCreditToUserAccount", function (request, response) {
    console.log("add credit to user.");
    Parse.Cloud.useMasterKey();
    var agentid = request.params.agentId;
    var userid = request.params.userId;
    var _amount = request.params.amount;
    console.log("now we will call another function deduct from agent.");
    var promise = Parse.Promise.as();
    promise = Parse.Cloud.run("deductFromAgent", { agentId: agentid }, {
        success: function (result) {
            console.log("deduct from agent : " + result);
            var promise1 = Parse.Promise.as();
            promise1 = Parse.Cloud.run("creditsUser", { userId: userid, addOrNot: true }, {
                success: function (result) {
                    console.log("Deducted from agent and added to user. " + result);
                    response.success(result);
                },
                error: function (error) {
                    console.log("credit user function error : " + error);
                    response.error(error);
                }
            });
            return promise1;
        },
        error: function (error) {
            console.log("deduct from agent error.");
            response.error(error);
        }
    });
    return promise;
    console.log("after call deduct from agent and creditsUser");
});

Parse.Cloud.define("transactionEntry", function (request, response) {
    var fromId = request.params.from;
    var toId = request.params.to;
    var amt = request.params.amount;
    var purpose = request.params.purpose;
    var Transactions = Parse.Object.extend("Transactions");
    var transact = new Transactions();
    transact.set("from", { "__type": "Pointer", "className": "_User", "objectId": fromId });
    transact.set("to", { "__type": "Pointer", "className": "_User", "objectId": toId });
    transact.set("amount", amt);
    transact.set("purpose", purpose);
    transact.save(null, {
        success: function (tran) {
            console.log("successfully save transaction.");
            response.success("Transaction done.");
        },
        error: function (error) {
            console.log("error while transaction saving. " + error.message);
            response.error(error);
        }
    });
});

Parse.Cloud.define("addNewUserForAgent", function (request, response) {
    Parse.Cloud.useMasterKey();
    var mobileNo = request.params.mobile;
    var agentid = request.params.agentId;
    var relation = request.params.relation;
    if (mobileNo == null || mobileNo.length < 10 || mobileNo.length > 10) {
        response.error("Enter proper mobile number.");
    }
    else {
        var query = new Parse.Query(Parse.User);
        query.equalTo("username", mobileNo);
        query.find(function (user) {
            console.log(user);
            if (user.length > 0) {
                var userProfile = new Parse.Query("UserProfile");
                userProfile.equalTo("userId", user[0]);
                userProfile.equalTo("isPrimary", true);                
                userProfile.include("profileId");
                userProfile.first().then(function (uProfile) {
                    console.log("found primary profile for user");
                    console.log(uProfile);
                    var profile = uProfile.get('profileId');
                    if (!profile.get('isActive')) {
                        profile.set("isActive", true);
                        //profile.set("userId", { "__type": "Pointer", "className": "_User", "objectId": agentId });
                        profile.save(null, {
                            success: function (profi) {
                                //deduct balance here
                                var agentUserProfile = new Parse.Query("UserProfile");
                                agentUserProfile.equalTo("relation", "Agent");
                                agentUserProfile.equalTo("profileId", profile);
                                agentUserProfile.include("userId");
                                agentUserProfile.first().then(function (agentUProfile) {
                                    if (agentUProfile.get('userId').id === agentid) {
                                        console.log("same agent is activating user.");
                                        var promise = Parse.Promise.as();
                                        promise = Parse.Cloud.run("doTransaction", { agentId: agentid, userId: profile.id, amount: '10' },
                                        {
                                            success: function () {
                                                console.log("Everything is done");
                                                response.success("Yipee! user created successfully.");
                                            },
                                            error: function (error) {
                                                console.log("error while calling function." + error.message);
                                                response.success("all done except transaction");
                                            }
                                        });
                                        return promise;
                                    }
                                    else {
                                        console.log("user have different agent.");
                                        agentUProfile.set("userId", { "__type": "Pointer", "className": "_User", "objectId": agentid });
                                        agentUProfile.save(null, {
                                            success: function (agentUProfile) {
                                                console.log("successfully change the agent.");
                                                var promise = Parse.Promise.as();
                                                promise = Parse.Cloud.run("doTransaction", { agentId: agentid, userId: profile.id, amount: '10' },
                                                {
                                                    success: function () {
                                                        console.log("Everything is done");
                                                        response.success("Yipee! user created successfully.");
                                                    },
                                                    error: function (error) {
                                                        console.log("error while calling function." + error.message);
                                                        response.success("all done except transaction");
                                                    }
                                                });
                                                return promise;
                                            },
                                            error: function (error) {
                                                console.log("unable to change agent.");
                                                response.error("Unable to change agent.");
                                            }
                                        })
                                    }
                                },
                                function (error) {
                                    console.log("Unable to find user profile.")
                                    response.error(error);
                                });
                                //response.success("User activated successfully.");
                            },
                            error: function (err) {
                                console.log("unable to save isactive for profile.");
                                response.error(err.message);
                            }
                        });
                    } else {
                        console.log("user already exists and active.");
                        response.error("User already exists and active.");
                    }
                }, function (error) {
                    console.error(error);
                    response.error(error.message);
                });
                //console.log("User already exists.");
                //response.error("User already exists.");
            }
            else {
                var user = new Parse.User();
                user.set("username", mobileNo);
                user.set("phoneNo", parseInt(mobileNo));
                user.set("password", mobileNo);
                user.set("roleId", { "__type": "Pointer", "className": "Role", "objectId": "ZURrJTBWwl" });
                user.signUp(null, {
                    success: function (user) {
                        console.log("User created successfully." + user.id);
                        var Profile = Parse.Object.extend("Profile");
                        var useProfile = new Profile();
                        useProfile.set("userId", user);
                        useProfile.set("isComplete", false);
                        useProfile.set("isActive", true);
                        useProfile.set("isBudgetVisible", true);
                        useProfile.save(null, {
                            success: function (usProfile) {
                                console.log("Profile has been created for user : " + user.id + " profile id is : " + usProfile.id);
                                // Execute any logic that should take place after the object is saved.
                                //alert('New object created with objectId: ' + gameScore.id);
                                var UserProfile = Parse.Object.extend("UserProfile");
                                var uProfile = new UserProfile();
                                uProfile.set("profileId", { "__type": "Pointer", "className": "Profile", "objectId": usProfile.id });
                                uProfile.set("userId", user);
                                uProfile.set("relation", relation);
                                uProfile.set("isPrimary", true);
                                uProfile.save(null, {
                                    success: function (uProfile) {
                                        console.log("entry done to userProfile table for user : " + user.id + " n its id is : " + uProfile.id);
                                        var aProfile = new UserProfile();
                                        aProfile.set("profileId", { "__type": "Pointer", "className": "Profile", "objectId": usProfile.id });
                                        aProfile.set("userId", { "__type": "Pointer", "className": "_User", "objectId": agentid });
                                        aProfile.set("relation", "Agent");
                                        aProfile.set("isPrimary", false);
                                        aProfile.save(null, {
                                            success: function (agentUP) {
                                                console.log("entry done to userProfile table for agent : " + agentid + " n its id is : " + agentUP.id);
                                                var UserCredits = Parse.Object.extend("UserCredits");
                                                var usercredit = new UserCredits();
                                                usercredit.set("userId", { "__type": "Pointer", "className": "_User", "objectId": user.id });
                                                usercredit.set("credits", parseInt("0"));
                                                usercredit.save(null, {
                                                    success: function (ucredit) {
                                                        console.log("Entry done to user credit table for user.");
                                                        var promise = Parse.Promise.as();
                                                        promise = Parse.Cloud.run("doTransaction", { agentId: request.user.id, userId: user.id, amount: '10' },
                                                        {
                                                            success: function () {
                                                                console.log("Everything is done");
                                                                response.success("Yipee! user created successfully.");
                                                            },
                                                            error: function (error) {
                                                                console.log("error while calling function." + error.message);
                                                                response.success("all done except transaction");
                                                            }
                                                        });
                                                        return promise;
                                                    },
                                                    error: function (error) {
                                                        response.error("Unable to create user credit. " + error.message);
                                                    }
                                                });
                                            },
                                            error: function (agentUP, error) {
                                                console.log('Failed to create new object for agent, with error code: ' + error.message);
                                                response.error('Failed to create new object, with error code: ' + error.message);
                                            }
                                        });
                                    },
                                    error: function (uProfile, error) {
                                        // Execute any logic that should take place if the save fails.
                                        // error is a Parse.Error with an error code and message.
                                        console.log('Failed to create new object for user userProfile, with error code: ' + error.message);
                                        response.error("User already exist.");
                                    }
                                });
                            },
                            error: function (gameScore, error) {
                                // Execute any logic that should take place if the save fails.
                                // error is a Parse.Error with an error code and message.
                                console.log('Failed to create new object for profile, with error code: ' + error.message)
                                response.error('Failed to create new object, with error code: ' + error.message);
                            }
                        });
                        // Hooray! Let them use the app now.
                    },
                    error: function (user, error) {
                        // Show the error message somewhere and let the user try again.
                        console.log('Failed to create new object for user, with error code: ' + error.message)
                        response.error(error.message);
                    }
                });
            }
        });
    }
});

Parse.Cloud.define("addCreditToUser", function (request, response) {
    Parse.Cloud.useMasterKey();
    var userId = request.params.userId;
    var creditToadd = request.params.credit;
    var query = new Parse.Query(Parse.User);
    query.equalTo("objectId", userId);
    query.find(function (users) {
        if (users.length > 0) {
            var user = users[0];
            var creditQuery = new Parse.Query("UserCredits");
            creditQuery.equalTo("userId", { "__type": "Pointer", "className": "_User", "objectId": userId });
            creditQuery.first({
                success: function (object) {
                    // Successfully retrieved the object.
                    object.increment("credits", parseInt(creditToadd));
                    object.save(null, {
                        success: function (usercredit) {
                            //deduct credit of agent here
                            response.success(true);
                        },
                        error: function (usercredit, error) {
                            response.error(error);
                        }
                    });
                },
                error: function (error) {
                    console.log("Error: " + error.code + " " + error.message);
                }
            });
        }
        else {
            response.error("User does not exists.");
        }
    });
});

Parse.Cloud.define("doTransaction", function (request, response) {
    var agentid = request.params.agentId;
    var userid = request.params.userId;
    var amt = parseInt(request.params.amount);
    console.log("agentId : " + agentid + ", userId : " + userid + ", amt : " + amt);
    console.log("in do transaction function.");
    var promise = Parse.Promise.as();    
    promise = Parse.Cloud.run("addCreditToUserAccount", { agentId: agentid, userId: userid }, {
        success: function (result) {
            console.log("do transaction addCreditToUserAccount result : " + result);
            promise = Parse.Cloud.run("transactionEntry", { from: agentid, to: userid, amount: amt, purpose: "new user" }, {
                success: function (result) {
                    console.log("do transaction transactionEntry result : " + result);
                    response.success(result);
                },
                error: function (error) {
                    console.log("error in transaction entry. : " + error);
                    response.error(error);
                }
            });
        },
        error: function (error) {
            response.error(error);
        }
    });
    return promise;
    //deduct amount from UserCredit for agent and then user
    
    //create an entry in transaction table where from = agentId and to = userId and amount = amount
});
