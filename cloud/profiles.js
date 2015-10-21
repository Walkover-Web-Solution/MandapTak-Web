var _ = require('underscore');

Parse.Cloud.define("deletePermission", function (request, response) {
    var mobileNo = request.params.mobile;
    var profileId = request.params.profileId;
    console.log("username : " + mobileNo);
    if (mobileNo.length < 10 || mobileNo.length > 10) {
        response.error("ERROR : Number should not be less than 10 digits");
    }
    else {
        Parse.Cloud.useMasterKey();
        var query = new Parse.Query(Parse.User);
        query.equalTo("username", mobileNo);
        query.first({
            success: function (user) {
                console.log(user);
                if (user !== undefined) {
                    /*find list from UserProfile table if there is only one entry then remove that entry from UserProfile table
                    and then remove that user from User table 
                    */
                    //get all from UserProfile table where userId = user.id
                    //now if result length is greater than one then remove entry where userId = user.id and profileId = profileId
                    //else remove entry and also remove user from _User table
                    console.log("This user exists, now we are looking for its profiles.")
                    var deleteUser = false;
                    var userProfiles = new Parse.Query("UserProfile");
                    userProfiles.equalTo("userId", { "__type": "Pointer", "className": "_User", "objectId": user.id });
                    userProfiles.find().then(function (uProfiles) {
                        if (uProfiles.length == 1) {
                            //We have to delete user
                            deleteUser = true;
                        }
                        var userprofile = new Parse.Query("UserProfile");
                        userprofile.equalTo("userId", { "__type": "Pointer", "className": "_User", "objectId": user.id });
                        userprofile.equalTo("profileId", { "__type": "Pointer", "className": "Profile", "objectId": profileId });
                        userprofile.find().then(function (usProfile) {
                            if (usProfile.length > 0) {
                                console.log(usProfile);
                                usProfile[0].destroy({
                                    success: function (myObject) {
                                        // The object was deleted from the Parse Cloud.
                                        if (deleteUser) {
                                            user.destroy({
                                                success: function (myObject) {
                                                    response.success("Permissions removed successfully.");
                                                    // The object was deleted from the Parse Cloud.
                                                },
                                                error: function (myObject, error) {
                                                    response.error("Unable to delete user." + error.message);
                                                    // The delete failed.
                                                    // error is a Parse.Error with an error code and message.
                                                }
                                            });
                                        }
                                        else {
                                            response.success("Permissions removed successfully.");
                                        }
                                    },
                                    error: function (myObject, error) {
                                        response.error("Unable to delete user profile." + error.message);
                                        // The delete failed.
                                        // error is a Parse.Error with an error code and message.
                                    }
                                });
                            }
                        });
                    }, function (error) {
                        response.error(error);
                    });
                }
                else {
                    response.error("User not found. Please contact your nearest agent.");
                }
            },
            error: function () {
                response.error("User not found. Please contact your nearest agent.");
            }
        });
    }
});

Parse.Cloud.define("resetProfiles", function (request, response) {
    Parse.Cloud.useMasterKey();
    var profileId = request.params.oid;
    var promises = [];
    var removeUnmatched = [];
    var promise = Parse.Promise.as();
    //promise = promise.then(function () {
        var likedProfiles = new Parse.Query("LikedProfile");
        likedProfiles.equalTo("profileId", { "__type": "Pointer", "className": "Profile", "objectId": profileId });
        likedProfiles.include("likeProfileId");
        likedProfiles.find().then(function (likedprofile) {
            _.each(likedprofile, function (profilee) {
                console.log("What we have here : " + profileId);
                console.log(likedprofile);
                promises.push(Parse.Cloud.run("matchingOrNot", { likeProfileId: profileId, profileid: profilee.get('likeProfileId').id }, {
                    success: function (fResult) {
                        if (fResult) {
                            console.log(profilee);
                            removeUnmatched.push(profilee);
                        }
                    },
                    error: function (error) {
                        console.log("reset exce")
                        //response.error(err);
                    }
                }));
            });            
        })
        //return promise;
    .then(function () {
        Parse.Promise.when(promises).then(function (result) {
            console.log("ready to destroy. " + removeUnmatched.length);
            Parse.Object.destroyAll(removeUnmatched).then(function (success) {
                console.log("successfully destroyed.");
                //response.success("Successfully deleted unmatched profile.");
            }, function (error) {
                response.error(error);
            });
        }, function (err) {
            response.error(err);
        }).then(function () {
            var dislikedProfiles = new Parse.Query("DislikeProfile");
            dislikedProfiles.equalTo("profileId", { "__type": "Pointer", "className": "Profile", "objectId": profileId });
            dislikedProfiles.find().then(function (dislikeProfiles) {
                Parse.Object.destroyAll(dislikeProfiles).then(
                    function (success) {
                    console.log("successfully destroyed disliked profile");
                    var pinnedProfiles = new Parse.Query("PinnedProfile");
                    pinnedProfiles.equalTo("profileId", { "__type": "Pointer", "className": "Profile", "objectId": profileId });
                    pinnedProfiles.find().then(function (pinnProfiles) {
                        console.log("We found pinned profiles : " + pinnProfiles.length);
                        Parse.Object.destroyAll(pinnProfiles).then(function (success) {
                            response.success("Profile reset successfully");
                        }, function (error) {
                            response.error("Unable to delete pinned profiles." + error.message);
                        });
                    }, function (error) {
                        response.error("Unable to find pinned profiles." + error.message);
                    });
                }, function (error) {
                    response.error("Unable to delete disliked profiles." + error.message);
                });
            },
                function (error) {
                    response.error("Unable to find disliked profiles." + error.message);
                });
        });
    });
});

Parse.Cloud.define("matchingOrNot", function (request, response) {
    var likeProfileid = request.params.likeProfileId;
    var profileId = request.params.profileid;
    var matchProfile = new Parse.Query("LikedProfile");
    matchProfile.equalTo("likeProfileId", { "__type": "Pointer", "className": "Profile", "objectId": likeProfileid });
    matchProfile.equalTo("profileId", { "__type": "Pointer", "className": "Profile", "objectId": profileId });
    matchProfile.first({
        success: function (matchedProfile) {
            console.log("matched profile or not?");
            console.log(matchedProfile);
            if (matchedProfile !== undefined) {
                response.success(false);
            }
            else {
                response.success(true);
            }
        },
        error: function (err) {
            console.log("reset exce")
            response.error(err);
        }
    });
})

Parse.Cloud.define("resetExceptMatched", function (request, response) {
    Parse.Cloud.useMasterKey();
    var profileId = request.params.oid;
    var removeUnmatched = [];
    var promises = [];
    console.log("proile id we get here : " + profileId);
    var promise = Parse.Promise.as();
    promise = promise.then(function () {

    });
    
});