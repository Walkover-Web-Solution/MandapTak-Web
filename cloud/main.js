require('cloud/app.js');
require('cloud/admin.js');

//require('cloud/agent.js');
var registerUser = require("cloud/registerUser.js");
var filterProfileObj = require("cloud/filterProfiles.js");
var profileObj = require("cloud/profiles.js");
var agentObj = require("cloud/agent.js");
require("cloud/transactions.js");
require("cloud/mandrillTemplateSend.js");
var fs = require('fs');
var layer = require('cloud/layer-parse-module/layer-module.js');
var layerProviderID = 'layer:///providers/029e1ec6-45b7-11e5-b6b1-55c9da086561';  // Should have the format of layer:///providers/<GUID>
var layerKeyID = 'layer:///keys/a0d65cd2-513f-11e5-8095-7f0ce21e7c8f';   // Should have the format of layer:///keys/<GUID>
var privateKey = fs.readFileSync('cloud/layer-parse-module/keys/layer-key.js');
layer.initialize(layerProviderID, layerKeyID, privateKey);

var deductCredit = 10;

Parse.Cloud.afterSave("User", function (request) {
    console.log("New user saved");
});

Parse.Cloud.define("generateToken", function (request, response) {
    var currentUser = request.user;
    if (!currentUser) throw new Error('You need to be logged in!');
    var userID = currentUser.id;
    var nonce = request.params.nonce;
    if (!nonce) throw new Error('Missing nonce parameter');
    response.success(layer.layerIdentityToken(userID, nonce));
});


Parse.Cloud.define("likeAndFind", function (request, response) {
    var userProfileid = request.params.userProfileId;
    var likeProfileid = request.params.likeProfileId;
    var userName = request.params.userName;
    var matchFound = new Parse.Object();
    var matchFoundArray = [];
    var foundMatch = "";
    var LikedProfile = Parse.Object.extend("LikedProfile");
    var likeQuery = new LikedProfile();
    likeQuery.set("profileId", {"__type": "Pointer", "className": "Profile", "objectId": userProfileid});
    likeQuery.set("likeProfileId", {"__type": "Pointer", "className": "Profile", "objectId": likeProfileid});
    //likeQuery.setACL(new Parse.ACL(request.user));
    likeQuery.save(null, {
        success: function (likeResult) {
            console.log("successfully saved entry to db.");
            console.log("now searching for matching or not.");
            var findMatch = new Parse.Query("LikedProfile");
            findMatch.equalTo("profileId", {"__type": "Pointer", "className": "Profile", "objectId": likeProfileid});
            findMatch.equalTo("likeProfileId", {
                "__type": "Pointer",
                "className": "Profile",
                "objectId": userProfileid
            });
            findMatch.first({
                success: function (matchResult) {
                    if (matchResult === undefined) {
                        console.log("Successfully saved entry.");
                        var pinnedProfiles = new Parse.Query("PinnedProfile");
                        pinnedProfiles.equalTo("profileId", {
                            "__type": "Pointer",
                            "className": "Profile",
                            "objectId": userProfileid
                        });
                        pinnedProfiles.equalTo("pinnedProfileId", {
                            "__type": "Pointer",
                            "className": "Profile",
                            "objectId": likeProfileid
                        });
                        pinnedProfiles.find().then(function (pinnProfiles) {
                            console.log("We found pinned profile : " + pinnProfiles.length);
                            Parse.Object.destroyAll(pinnProfiles).then(function (success) {
                                response.success(likeResult.id);
                            }, function (error) {
                                response.error("Unable to delete pinned profiles." + error.message);
                            });
                        }, function (error) {
                            response.success(likeResult.id);
                        });
                    }
                    else {
                        matchFoundArray.push(matchResult);
                        matchFound = likeResult;
                        console.log("both liked each other.");
                        var userProfileQuery = new Parse.Query("UserProfile");
                        userProfileQuery.equalTo("profileId", {
                            "__type": "Pointer",
                            "className": "Profile",
                            "objectId": likeProfileid
                        });
                        userProfileQuery.notEqualTo("relation", "Agent");
                        userProfileQuery.include("userId");
                        userProfileQuery.each(function (userProfile) {
                            console.log("user profiles we get here for : " + likeProfileid + " are :");
                            console.log(userProfile.get('userId'));
                            var pushQuery = new Parse.Query(Parse.Installation);
                            pushQuery.equalTo("user", {
                                "__type": "Pointer",
                                "className": "_User",
                                "objectId": userProfile.get('userId').id
                            });

                            // Send push notification to query
                            Parse.Push.send({
                                where: pushQuery,
                                data: {
                                    alert: userName + " liked you back!",
                                    username: userName,
                                    profileid: userProfileid
                                }
                            }, {
                                success: function (result) {
                                    // Push was successful
                                    console.log("Push was successful : " + result);
                                },
                                error: function (error) {
                                    // Handle error
                                    console.log("error in push. : " + error.message);
                                }
                            });
                        }).then(function () {
                            console.log("push has been sent successfully to ");
                            var pinnedProfiles = new Parse.Query("PinnedProfile");
                            pinnedProfiles.equalTo("profileId", {
                                "__type": "Pointer",
                                "className": "Profile",
                                "objectId": userProfileid
                            });
                            pinnedProfiles.equalTo("pinnedProfileId", {
                                "__type": "Pointer",
                                "className": "Profile",
                                "objectId": likeProfileid
                            });
                            pinnedProfiles.find().then(function (pinnProfiles) {
                                console.log("We found pinned profile : " + pinnProfiles.length);
                                Parse.Object.destroyAll(pinnProfiles).then(function (success) {
                                    response.success(matchFound);
                                }, function (error) {
                                    response.error("Unable to delete pinned profiles." + error.message);
                                });
                            }, function (error) {
                                response.success(matchFound);
                            });
                        });
                    }
                },
                error: function (error) {
                    console.log("there is some error in match profile.");
                    response.success("Successfully saved entry.");
                }
            });
        },
        error: function (error) {
            response.error(error);
        }
    });
});


//Create new user for bachelor
Parse.Cloud.define("givePermissiontoNewUser", function (request, response) {
    Parse.Cloud.useMasterKey();
    var mobileNo = request.params.mobile;
    var profileId = request.params.profileId;
    var relationWprofile = request.params.relation;
    if (mobileNo == null || mobileNo.length < 10 || mobileNo.length > 10) {
        response.error("Enter proper mobile number.");
    }
    else {
        var query = new Parse.Query(Parse.User);
        query.equalTo("username", mobileNo);
        query.find(function (user) {
            console.log(user);
            if (user.length > 0) {
                if (request.user.id === user[0].id) {
                    response.error("You can't give permission to yourself");
                }
                else {
                    var GameScore = Parse.Object.extend("UserProfile");
                    var gameScore = new GameScore();
                    gameScore.set("profileId", {"__type": "Pointer", "className": "Profile", "objectId": profileId});
                    gameScore.set("userId", user[0]);
                    gameScore.set("relation", relationWprofile);
                    gameScore.set("isPrimary", false);
                    gameScore.save(null, {
                        success: function (gameScore) {
                            console.log("User already exists so we are giving permission for profile.")
                            console.log("Now we are deducting balance from caller.")
                            var query = new Parse.Query("UserCredits");
                            query.equalTo("userId", {
                                "__type": "Pointer",
                                "className": "_User",
                                "objectId": request.user.id
                            });
                            query.first({
                                success: function (sResult) {
                                    if (sResult.get('credits') < 10) {
                                        sResult.destroy({
                                            success: function (dResult) {
                                                console.log("Insufficient balance.");
                                                //response.success("Insufficient balance.");
                                            },
                                            error: function (error) {
                                                console.log("Unable to destroy.Credit not deducted.");
                                                //response.error(error);
                                            }
                                        }).then(function () {
                                            gameScore.destroy({
                                                success: function (dResult) {
                                                    console.log("Removed permission.");
                                                    response.error("Insufficient balance.");
                                                },
                                                error: function (error) {
                                                    console.log("UserProfile deleting. : " + error.message);
                                                    response.error("Error : " + error);
                                                }
                                            })
                                        });
                                    }
                                    else {
                                        sResult.increment(deductCredit * -1);
                                        sResult.save(null, {
                                            success: function (dResult) {
                                                console.log("Credit deducted successfully.");
                                                response.success("Permission given successfully.");
                                                //we have to write a code here to make an entry in transaction table to keep record.
                                                Parse.Cloud.run("transactionEntry", {
                                                    from: request.user.id,
                                                    to: user[0].id,
                                                    amount: deductCredit,
                                                    purpose: "permission"
                                                }, {
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
                                                console.log("Unable to deduct credit.");
                                                response.error(error);
                                            }
                                        })
                                    }
                                },
                                error: function (error) {
                                    console.log("Unable to find credit for user. " + error.message);
                                    response.error(error);
                                }
                            });
                            // Execute any logic that should take place after the object is saved.
                            console.log('New object created with objectId: ' + gameScore.id);
                            //response.success('New object created with objectId: ' + gameScore.id);
                        },
                        error: function (gameScore, error) {
                            // Execute any logic that should take place if the save fails.
                            // error is a Parse.Error with an error code and message.
                            console.log('Failed to create new object, with error code: ' + error.message);
                            response.error('Failed to create new object, with error code: ' + error.message);
                        }
                    });
                }
            }
            else {
                var user = new Parse.User();
                user.set("username", mobileNo);
                user.set("phoneNo", parseInt(mobileNo));
                user.set("password", mobileNo);
                user.set("isActive", true);
                user.set("roleId", {"__type": "Pointer", "className": "Role", "objectId": "ZURrJTBWwl"});
                user.signUp(null, {
                    success: function (user) {
                        var UserProfile = Parse.Object.extend("UserProfile");
                        var uProfile = new UserProfile();
                        uProfile.set("profileId", {"__type": "Pointer", "className": "Profile", "objectId": profileId});
                        uProfile.set("userId", user);
                        uProfile.set("relation", relationWprofile);
                        uProfile.set("isPrimary", false);
                        uProfile.save(null, {
                            success: function (uProfile) {
                                console.log("User already exists so we are giving permission for profile.")
                                console.log("Now we are deducting balance from caller.")
                                var query = new Parse.Query("UserCredits");
                                query.equalTo("userId", {
                                    "__type": "Pointer",
                                    "className": "_User",
                                    "objectId": request.user.id
                                });
                                query.first({
                                    success: function (sResult) {
                                        if (sResult.get('credits') < 10) {
                                            sResult.destroy({
                                                success: function (dResult) {
                                                    console.log("Insufficient balance.");
                                                    //response.success("Insufficient balance.");
                                                },
                                                error: function (error) {
                                                    console.log("Unable to destroy.Credit not deducted.");
                                                    //response.error(error);
                                                }
                                            }).then(function () {
                                                uProfile.destroy({
                                                    success: function (dResult) {
                                                        console.log("Removed permission.");
                                                        //response.error("Insufficient balance.");
                                                    },
                                                    error: function (error) {
                                                        console.log("UserProfile deleting. : " + error.message);
                                                        //response.error("Error : " + error);
                                                    }
                                                });
                                            }).then(function () {
                                                console.log("User dont have sufficient balance.");
                                                user.destroy({
                                                    success: function (dResult) {
                                                        response.error("Insufficient credit. Please contat your agent.");
                                                    },
                                                    error: function (error) {
                                                        response.error(error);
                                                    }
                                                });
                                            });
                                        }
                                        else {
                                            sResult.increment(deductCredit * -1);
                                            sResult.save(null, {
                                                success: function (dResult) {
                                                    console.log("Credit deducted successfully.");
                                                    Parse.Cloud.run("transactionEntry", {
                                                        from: request.user.id,
                                                        to: user.id,
                                                        amount: deductCredit,
                                                        purpose: "permission"
                                                    }, {
                                                        success: function (result) {
                                                            console.log("do transaction transactionEntry result : " + result);
                                                            //response.success(result);
                                                            response.success("Permission given successfully.");
                                                        },
                                                        error: function (error) {
                                                            console.log("error in transaction entry. : " + error);
                                                            response.error(error);
                                                        }
                                                    });
                                                },
                                                error: function (error) {
                                                    console.log("Unable to deduct credit.");
                                                    response.error(error);
                                                }
                                            })
                                        }
                                    },
                                    error: function (error) {
                                        console.log("Unable to find credit for user. " + error.message);
                                        response.error(error);
                                    }
                                });
                                // Execute any logic that should take place after the object is saved.
                                console.log('New object created with objectId: ' + uProfile.id);
                                //response.success('New object created with objectId: ' + uProfile.id);
                            },
                            error: function (uProfile, error) {
                                // Execute any logic that should take place if the save fails.
                                // error is a Parse.Error with an error code and message.
                                console.log('Failed to create new object, with error code: ' + error.message);
                                response.error("User already exist.");
                            }
                        });
                        // Hooray! Let them use the app now.
                    },
                    error: function (user, error) {
                        // Show the error message somewhere and let the user try again.
                        response.error(error.message);
                    }
                });
            }
        });
    }
});

Parse.Cloud.job("getLatLong", function (request, response) {
    Parse.Cloud.useMasterKey();
    var query = new Parse.Query("City");
    query.include("Parent.Parent");
    query.find().then(function (cities) {
        console.log(cities[0]);
        var promise = Parse.Promise.as();
        promise = promise.then(function () {
            for (var i = 0; i < 10; i++) {
                Parse.Cloud.httpRequest({
                    method: "GET",
                    url: "https://maps.googleapis.com/maps/api/geocode/json?address=" + cities[i].get('name') + "," + cities[i].get('Parent').get('name') + "," + cities[i].get('Parent').get('Parent').get('name')
                }).then(function (httpResponse) {
                    var cityresponse = JSON.parse(httpResponse.text);
                    city.set("latitude", cityresponse[0].geometry.location.lat);
                    city.set("longitude", cityresponse[0].geometry.location.lng);
                    //return city.save();
                }, function (httpResponse) {
                    console.log('Request failed with response code ' + httpResponse.text);
                    //response.error('Request failed with response code ' + httpResponse.status);
                });
            }
        });
        return promise;
    }, function (err) {
        console.log(err);
    }).then(function () {
        response.success("lat lng set successfully.");
    }, function (res, error) {
        response.error("unable to set lat n lng " + res + " " + error);
    });
});

Parse.Cloud.job("setAgeOfProfile", function (request, status) {
    Parse.Cloud.useMasterKey();
    // Query for all users
    var query = new Parse.Query("Profile");
    query.each(function (user) {
        //console.log(user.get("dob"));
        var today = new Date();
        if (user.get('dob') != undefined) {
            var birthDate = user.get('dob');
            var age = today.getFullYear() - birthDate.getFullYear();
            var m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            // Set and save the change
            user.set("age", age);
            return user.save();
        }
    }).then(function () {
        // Set the job's success status
        console.log("Migration completed successfully.");
        status.success("Migration completed successfully.");
    }, function (error) {
        // Set the job's error status
        console.log("Uh oh, something went wrong.");
        status.error("Uh oh, something went wrong.");
    });
});


Parse.Cloud.define("deleteDuplicateInstallations", function (request, response) {
    Parse.Cloud.useMasterKey();
    var userId = request.params.userid;
    var query = new Parse.Query(Parse.Installation);
    query.descending("createdAt");
    query.equalTo("user", {"__type": "Pointer", "className": "_User", "objectId": userId})
    query.include("user");
    query.find({
        success: function (installations) {
            console.log(installations);
            var deviceTokens = {};
            var userss = {};
            var count = 0;
            for (var i = 0; i < installations.length; i++) {
                var installation = installations[i];
                var deviceToken = installation.get("deviceToken");
                var username = installation.get("user");
                //if (deviceTokens.hasOwnProperty(deviceToken)) {
                //    console.log("did delete installation " + installation);
                //    installation.destroy();
                //    count++;
                //} else {
                //    console.log("added token " + deviceToken);
                //    deviceTokens[deviceToken] = true;
                //}
                if (userss.hasOwnProperty(username)) {
                    console.log("did delete installation user " + installation);
                    installation.destroy();
                    count++;
                } else {
                    console.log("added token user " + username);
                    userss[username] = true;
                }
            }
            console.log("deleted " + count + " installations");
            response.success(true);
        },
        error: function (error) {
            response.error(error.message);
        }
    });
});
Parse.Cloud.define("reportUser", function (request, response) {
    Parse.Cloud.useMasterKey();
    console.log(request.params);
    var reportedProfile = request.params.reportedProfile;
    var profileId = request.params.profileId;
    var reason = request.params.reason;
    var ReportProfile = Parse.Object.extend("ReportAbuse");
    var reportQuery = new ReportProfile();
    reportQuery.set("profileId", {"__type": "Pointer", "className": "Profile", "objectId": profileId});
    reportQuery.set("reportedProfile", {"__type": "Pointer", "className": "Profile", "objectId": reportedProfile});
    reportQuery.set("reason", reason);
    reportQuery.save(null, {
        success: function (reportResult) {
            var DisLikeProfile = Parse.Object.extend("DislikeProfile");
            var dislikeQuery = new DisLikeProfile();
            dislikeQuery.set("profileId", {"__type": "Pointer", "className": "Profile", "objectId": profileId});
            dislikeQuery.set("dislikeProfileId", {
                "__type": "Pointer",
                "className": "Profile",
                "objectId": reportedProfile
            });
            dislikeQuery.save(null, {
                success: function (dislikeResult) {
                    var mandrill = require("mandrill");
                    mandrill.initialize("UVSN4grTxE94d1j3mZGCxQ");
                    mandrill.sendEmail({
                        message: {
                            text: "Hello World!",
                            subject: "Using Cloud Code and Mandrill is great!",
                            from_email: "rakshit@hostnsoft.com",
                            from_name: "Cloud Code",
                            to: [
                                {
                                    email: "rakshit@walkover.in",
                                    name: "Hi Raks Name"
                                }
                            ]
                        },
                        async: true
                    }, {
                        success: function (httpResponse) {
                            response.success("Email sent!");
                            console.log("Email sent!");
                        },
                        error: function (httpResponse) {
                            response.error("Uh oh, something went wrong");
                            console.log("Uh oh, something went wrongl");

                        }
                    });
                    //var Mandrill = require('cloud/mandrillTemplateSend.js');
                    //
                    //Mandrill.initialize('UVSN4grTxE94d1j3mZGCxQ');
                    //Mandrill.sendTemplate({
                    //    template_name: request.params.templateName,
                    //    template_content: [{
                    //        name: "example name",
                    //        content: "example content" //Those are required but they are ignored
                    //    }],
                    //    message: {
                    //        to: [{
                    //            email: "rakshit@walkover.in",
                    //            name: "Rakshit"
                    //        }],
                    //        important: true
                    //    },
                    //    async: false
                    //}, {
                    //    success: function (httpResponse) {
                    //        console.log(httpResponse);
                    //        response.success("Email sent!");
                    //    },
                    //    error: function (httpResponse) {
                    //        console.error(httpResponse);
                    //        console.error(httpResponse);
                    //        response.error("Uh oh, something went wrong");
                    //    }
                    //});
                },
                error: function (error) {
                    response.error(error);
                }
            });
        },
        error: function (error) {
            console.log("last one" + error.message + " " + error.code);
            response.error(error);
        }
    });
});