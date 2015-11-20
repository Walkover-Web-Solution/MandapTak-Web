// added by Utkarsh

Parse.Cloud.define("authenticate", function (request, response) {
    //Parse.Cloud.useMasterKey();
    Parse.User.logIn(request.params.username, request.params.password, {
        success: function (user) {
            // Do stuff after successful login.
            console.log("logged in");
            response.success(user);
        },
        error: function (user, error) {
            console.log("not loged in");
            // The login failed. Check error to see why.
            response.error(error);
        }
    });
});

Parse.Cloud.define("getAllProfiles", function (request, response) {
    Parse.Cloud.useMasterKey();
    var pageNo = request.params.pageno;
    var order=request.params.order;
    var query = new Parse.Query("Profile");
    query.include("userId");
    var isTrue;
    if(order==1)
    query.equalTo("isComplete",true);
    else if(order==2)
    query.equalTo("isComplete",false);
    query.limit(10);
    query.skip((pageNo - 1) * 10);
    query.find().then(function (result) {
        response.success(result);
    });
});
Parse.Cloud.define("getProfileForAgent", function (request, response) {
    Parse.Cloud.useMasterKey();
    var userId=request.params.userId;
    var query = new Parse.Query("Profile");
    query.include("userId");
    query.equalTo("userId",{"__type": "Pointer", "className": "_User", "objectId": userId});
    query.find().then(function (result) {
        response.success(result);
    });
});
//Parse.Cloud.define("getUserIdForAgent", function (request, response) {
//    Parse.Cloud.useMasterKey();
//    var number=request.params.userNumber;
//    var query = new Parse.Query("_User");
//    query.equalTo("username",number);
//    query.find().then(function (result) {
//        response.success(result);
//    });
//});

Parse.Cloud.define("getAllAgents", function (request, response) {
    Parse.Cloud.useMasterKey();
    var query = new Parse.Query("_User");
    query.equalTo("roleId",{"__type": "Pointer", "className": "Role", "objectId": "eT9dNTffJi"});
    query.find().then(function (result) {
        response.success(result);
    });
});
Parse.Cloud.define("getProfileCount", function (request, response) {
    Parse.Cloud.useMasterKey();
    var order=parseInt(request.params.order);
    var query = new Parse.Query("Profile");
    query.include("userId");
    if(order==1)
        query.equalTo("isComplete",true);
    else if(order==2)
    query.equalTo("isComplete",false);
    query.find().then(function (result) {
        response.success(result.length);
    });
});

Parse.Cloud.define("addUsers", function (request, response) {
    Parse.Cloud.useMasterKey();
    var name = request.params.username;
    var gender = request.params.gender;
    var dob = request.params.dob;
    var tob = request.params.tob;
    var birthPlace = request.params.bplace;
    var currentLocation = request.params.currloc;
    var weight = request.params.weight;
    var height = request.params.height;
    var religion = request.params.religion;
    var caste = request.params.caste;
    var manglikStatus = request.params.manglik;
    var work = request.params.working;
    var designation = request.params.desig;
    var compamny = request.params.comp;
    var income = request.params.income;
    var edu1 = request.params.edu1;
    var edu2 = request.params.edu2;
    var edu3 = request.params.edu3;
    var wam = request.params.wam;


    var mobileNo = request.params.number;
    var agentid = request.params.adminId;
    var relation = request.params.relation;
    if (mobileNo == null || mobileNo.length < 10 || mobileNo.length > 10) {
        alert("mob num is" + mobileNo);
        response.error("Enter proper mobile number.");
    }
    else {
        var query = new Parse.Query(Parse.User);
        query.equalTo("username", mobileNo);
        query.find(function (user) {
            console.log(user);
            if (user.length > 0) {
                console.log("User already exists.");
                //response.error("User already exists.");
            }
            else {
                var user = new Parse.User();
                user.set("username", mobileNo);
                user.set("phoneNo", parseInt(mobileNo));
                user.set("password", mobileNo);
                user.set("roleId", {"__type": "Pointer", "className": "Role", "objectId": "ZURrJTBWwl"});
                user.signUp(null, {
                    success: function (user) {
                        console.log("User created successfully." + user.id);
                        var Profile = Parse.Object.extend("Profile");
                        var useProfile = new Profile();
                        useProfile.set("userId", user);
                        useProfile.set("isComplete", false);
                        useProfile.set("isActive", true);
                        //newly added

                        useProfile.set("name", name);
                        useProfile.set("designation", designation);
                        useProfile.set("dob", new Date(dob));
                        useProfile.set("tob", new Date(tob));
                        useProfile.set("gender", gender);

                        useProfile.set("height", parseInt(height));
                        useProfile.set("weight", parseInt(weight));
                        if (manglikStatus == "Yes")
                            useProfile.set("manglik", 1);
                        else
                            useProfile.set("manglik", 0);
                        if (wam == "Yes")
                            useProfile.set("workAfterMarriage", 1);
                        else
                            useProfile.set("workAfterMarriage", 0);
                        if (work == "Yes")
                            useProfile.set("working", 1);
                        else
                            useProfile.set("working", 0);
                        //newly added

                        useProfile.set("isBudgetVisible", true);

                        // search for state and city

                        //var addressUser=currentLocation.split(',');       //(/[\s,]+/);

                        var query = new Parse.Query('State');
                        //query.matches("name", addressUser[k], "i");
                        query.find({
                                success: function (object) {
                                    console.log(object.length + "->");
                                    for (var i = 0; i < object.length; i++)console.log(object[i].get("name") + "->");
                                    response.success("states retrieved");

                                },
                                error: function (error) {
                                    response.success("States not retrieved");
                                    alert(("not working"));
                                }
                            }
                        )
                        //

                        useProfile.save(null, {
                            success: function (usProfile) {
                                console.log("Profile has been created for user : " + user.id + " profile id is : " + usProfile.id);
                                // Execute any logic that should take place after the object is saved.
                                //alert('New object created with objectId: ' + gameScore.id);
                                var UserProfile = Parse.Object.extend("UserProfile");
                                var uProfile = new UserProfile();
                                uProfile.set("profileId", {
                                    "__type": "Pointer",
                                    "className": "Profile",
                                    "objectId": usProfile.id
                                });
                                uProfile.set("userId", user);
                                uProfile.set("relation", relation);
                                uProfile.set("isPrimary", true);
                                uProfile.save(null, {
                                    success: function (uProfile) {
                                        console.log("entry done to userProfile table for user : " + user.id + " n its id is : " + uProfile.id);
                                        var aProfile = new UserProfile();
                                        aProfile.set("profileId", {
                                            "__type": "Pointer",
                                            "className": "Profile",
                                            "objectId": usProfile.id
                                        });
                                        //aProfile.set("userId", { "__type": "Pointer", "className": "_User", "objectId": agentid });
                                        aProfile.set("userId", {
                                            "__type": "Pointer",
                                            "className": "_User",
                                            "objectId": agentid
                                        });
                                        // aProfile.set("relation", "Agent");
                                        aProfile.set("relation", "Admin");
                                        aProfile.set("isPrimary", false);
                                        aProfile.save(null, {
                                            success: function (agentUP) {
                                                console.log("entry done to userProfile table for agent : " + agentid + " n its id is : " + agentUP.id);
                                                //var UserCredits = Parse.Object.extend("UserCredits");
                                                // var usercredit = new UserCredits();
                                                // usercredit.set("userId", { "__type": "Pointer", "className": "_User", "objectId": user.id });
                                                //usercredit.set("credits", parseInt("0"));
                                                /* usercredit.save(null, {
                                                 success: function (ucredit) {
                                                 console.log("Entry done to user credit table for user.");
                                                 var promise = Parse.Promise.as();
                                                 //promise = Parse.Cloud.run("doTransaction", { agentId: request.user.id, userId: user.id, amount: '10' },
                                                 promise = Parse.Cloud.run("doTransaction", { agentId: user.id, userId: user.id, amount: '10' },
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
                                                 */
                                                response.success("Yipee! user created successfully.");
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

Parse.Cloud.define("getCities", function (request, response) {
    Parse.Cloud.useMasterKey();
    var searchthis = request.params.searchThis;
    var query = new Parse.Query("City");
    query.startsWith("name", searchthis);
    query.include("Parent.Parent");
    query.find().then(function (result) {
        response.success(result);
    });
});
Parse.Cloud.define("getReligion", function (request, response) {
    Parse.Cloud.useMasterKey();
    var searchthis = request.params.searchThis;
    var query = new Parse.Query("Religion");
    query.startsWith("name", searchthis);
    //query.include("Parent.Parent");
    query.find().then(function (result) {
        response.success(result);
    });
});
Parse.Cloud.define("getCaste", function (request, response) {
    Parse.Cloud.useMasterKey();
    var searchthis = request.params.searchThis;
    var religion = request.params.religion;
    var query = new Parse.Query("Caste");
    query.equalTo("religionId", {"__type": "Pointer", "className": "Religion", "objectId": religion});
    query.startsWith("name", searchthis);
    query.find().then(function (result) {
        response.success(result);
    });
});

Parse.Cloud.define("getIndustry", function (request, response) {
    Parse.Cloud.useMasterKey();
    var searchthis = request.params.searchThis;
    var query = new Parse.Query("Industries");
    query.startsWith("name", searchthis);
    //query.include("Parent.Parent");
    query.find().then(function (result) {
        response.success(result);
    });
});
Parse.Cloud.define("getEducation", function (request, response) {
    Parse.Cloud.useMasterKey();
    var searchthis = request.params.searchThis;
    var query = new Parse.Query("Degree");
    query.startsWith("name", searchthis);
    //query.include("Parent.Parent");
    query.find().then(function (result) {
        response.success(result);
    });
});

Parse.Cloud.define("getSpecial", function (request, response) {
    Parse.Cloud.useMasterKey();
    var searchthis = request.params.searchThis;
    var edu = request.params.education;
    var query = new Parse.Query("Specialization");
    query.equalTo("degreeId", {"__type": "Pointer", "className": "Degree", "objectId": edu});
    query.startsWith("name", searchthis);
    query.find().then(function (result) {
        response.success(result);
    });
});
Parse.Cloud.define("getUserName1", function (request, response) {
    Parse.Cloud.useMasterKey();

    var searchthis = request.params.searchThis;
    var query = new Parse.Query("_User");
    query.startsWith("username", searchthis);
    //query.include("Parent.Parent");
    query.find().then(function (result) {
        response.success(result);
    });
});

Parse.Cloud.define("getUserId", function(request,response){
    Parse.Cloud.useMasterKey();
    var pid=request.params.pid;
    var query=new Parse.Query("Profile");
    query.equalTo("objectId",pid);
    query.find().then(function(result){
       response.success(result);
    });
});
Parse.Cloud.define("getUserName", function (request, response) {
    Parse.Cloud.useMasterKey();
    var searchthis = request.params.searchThis;
    var userId=request.params.userid;
    var query = new Parse.Query("_User");
    query.startsWith("username", searchthis);

    var innerQuery=new Parse.Query("Profile");
    innerQuery.matchesQuery("userId",query);
    var outerQuery=new Parse.Query("UserProfile");
    outerQuery.matchesQuery("profileId",innerQuery);
    outerQuery.include("profileId.userId");
    outerQuery.equalTo("userId",{"__type": "Pointer", "className": "_User", "objectId": userId});
    outerQuery.find().then(function (result) {
        //outerQuery.find().then(function (result) {
            response.success(result);
        //});
    });

});


Parse.Cloud.define("saveProfile", function (request, response) {
    Parse.Cloud.useMasterKey();
    var profileDetails = request.params.profiletosave;
    console.log(profileDetails.picture);
    var Profile = Parse.Object.extend("Profile");
    var profile = new Profile();
    profile.set("objectId", profileDetails.id);
    profile.set("name", profileDetails.name);
    profile.set("gender", profileDetails.gender);
    profile.set("dob", new Date(profileDetails.dob));
    profile.set("tob", new Date(profileDetails.dob + "T" + profileDetails.tob));
    //profile.set("placeOfBirth", profileDetails.birthPlace);
    profile.set("placeOfBirth", {"__type": "Pointer", "className": "City", "objectId": profileDetails.birthPlace});
    //profile.set("currentLocation", profileDetails.currentLocation);
    profile.set("currentLocation", {
        "__type": "Pointer",
        "className": "City",
        "objectId": profileDetails.currentLocation
    });

    profile.set("weight", parseInt(profileDetails.weight));
    profile.set("height", parseInt(profileDetails.height));

    profile.set("religionId", {"__type": "Pointer", "className": "Religion", "objectId": profileDetails.religion});

    profile.set("casteId", {"__type": "Pointer", "className": "Caste", "objectId": profileDetails.caste});

    profile.set("manglik", parseInt(profileDetails.manglik));

    //profile.set("industryId", profileDetails.industry);
    if(profileDetails.industry!=="")
        profile.set("industryId", {"__type": "Pointer", "className": "Industries", "objectId": profileDetails.industry});

    profile.set("designation", profileDetails.designation);

    profile.set("placeOfWork", profileDetails.company);

    profile.set("package", parseInt(profileDetails.package));

    //profile.set("education1", (profileDetails.education));
    profile.set("education1", {
        "__type": "Pointer",
        "className": "Specialization",
        "objectId": profileDetails.education
    });

    profile.set("workAfterMarriage", parseInt(profileDetails.wantToWork));
    profile.set("isComplete", false);

    //profile.set("placeOfBirth", {"__type": "Pointer", "className": "City", "objectId": profileDetails.birthPlace});
    profile.save().then(
        function (result) {
            console.log(result);
            response.success(result);
        },
        function (error) {
            console.log(error);
            response.error(error);
        }
    );
});

Parse.Cloud.define("ProfilePhotoSave", function (request, response) {
    var profileId = request.params.profile;
    var promises = [];
    var selectedProfile;
    promises.push(
        Parse.Cloud.run("getProfile", {profileId: profileId}, {
                success: function (result) {
                    console.log(result.get("userId").get("username"));
                    selectedProfile = result;
                }
            }
        ));
    Parse.Promise.when(promises).then(function (result) {
        var movieId = selectedProfile.get("profilePic");
        var Photo = new Parse.Object.extend("Photo");
        var photu = new Photo();
        var query = new Parse.Query("Photo");
        query.equalTo("isPrimary", true);
        query.equalTo("profileId", {
            "__type": "Pointer",
            "className": "Profile",
            "objectId": selectedProfile.id
        });
        query.first({
            success: function (result) {
                if (result != undefined ) {
                    console.log("file already exist");
                    response.success("success");
                }
                else {
                    photu.set("profileId", {
                        "__type": "Pointer",
                        "className": "Profile",
                        "objectId": selectedProfile.id
                    });
                    photu.set("isPrimary", true);
                    photu.set("file", movieId);
                    photu.save(null, {
                        success: function (user) {
                            console.log("saved successfully");
                            response.success(user);
                        },
                        error: function (user, error) {
                            console.log('Failed to create new object, with error code: ' + error.message);
                            response.error(error);
                        }
                    });
                }
            },
            error: function (err) {
                console.log("unable to find photo");
                response.error(err);
            }
        });
    });
});

Parse.Cloud.define("savePhoto", function (request, response) {
    Parse.Cloud.useMasterKey();
    var userObjectId = request.params.uOId;
    var fileTosave = request.params.filee;
    var photu = new Parse.Object.extend("Photo");
    photu.set("profileId", {"__type": "Pointer", "className": "Profile", "objectId": userObjectId});
    photu.set("isPrimary", true);
    photu.set("file", fileTosave);
    console.log("saving pic in photo");
    photu.save(null, {
        success: function (user) {
            response.success(user);
        },
        error: function (user, error) {
            console.log('Failed to create new object, with error code: ' + error.message);
            response.error(error);
        }
    });
});

Parse.Cloud.define("changeUserNameAndUserRelation",function(request,response){
    var userId=request.params.userId;
    var profileId=request.params.profileId;
    var username=request.params.username;
    var relation=request.params.relation;
    Parse.Cloud.useMasterKey();

    var query = new Parse.Query("_User");
    query.equalTo("objectId",userId);
    query.find().then(function (result) {
        result[0].set("username",username);
        result[0].save(null,{
            success: function (user) {
                var query2=new Parse.Query("UserProfile");
                query2.equalTo("profileId",{"__type": "Pointer", "className": "Profile", "objectId": profileId});
                query2.equalTo("userId",{"__type": "Pointer", "className": "_User", "objectId": userId});
                query2.find().then(function (result) {
                    result[0].set("relation",relation);
                    result[0].save(null,{
                        success:function(){
                            response.success("success");
                        },
                        error: function (error) {
                            response.error(error);
                        }
                    });
                });
            },
            error: function (user, error) {
                console.log('Failed to change username, with error code: ' + error.message);
                response.error(error);
            }
        });
    });

});
Parse.Cloud.define("getImages", function (request,response) {
    Parse.Cloud.useMasterKey();
    var pid=request.params.profileId;
    var query=new Parse.Query("Photo");
    query.equalTo("profileId",{"__type": "Pointer", "className": "Profile", "objectId": pid});
    query.find().then(function (result) {
        response.success(result);
    });
});
Parse.Cloud.define("deleteImages", function (request,response) {
    Parse.Cloud.useMasterKey();
    var pid=request.params.profileId;
    var imageObjectToDelete=request.params.imageObjectToDelete;
    var query = new Parse.Query("Photo");
    query.equalTo("profileId",{"__type": "Pointer", "className": "Profile", "objectId": pid});
    query.equalTo("objectId",imageObjectToDelete);
    query.notEqualTo("isPrimary",true);
    query.find({
        success: function(result) {
            result[0].destroy({
                success: function(object) {
                    alert('Delete Successful');
                    response.success("deleted");
                },
                error: function(object, error) {
                    response.error(error);
                    alert('Delete failed');
                }
            });
        },
        error: function(error) {
            response.error(error);
            alert('Error in delete query');
        }
    });

});
//added by Utkarsh