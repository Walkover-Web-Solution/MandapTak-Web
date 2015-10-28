var _ = require('underscore');

Parse.Cloud.define("getMatchedProfile", function (request, response) {
    Parse.Cloud.useMasterKey();
    var profileList = [];
    var profileId = request.params.profileId;
    //console.log("profile id that we get is : " + profileId);
    if (profileId === "" || profileId === undefined)
    {
        response.error("Profile Id should not be empty.");
    }
    else {
        var query = new Parse.Query("LikedProfile");
        query.equalTo("likeProfileId", { "__type": "Pointer", "className": "Profile", "objectId": profileId });
        query.each(function (resultObj) {
            //console.log(resultObj);
            var promise = Parse.Promise.as();
            promise = promise.then(function () {
                //console.log("finding matching profile for : " + profileId);
                //console.log("and like profile id is : " + resultObj.get('profileId'));
                var likeProfiles = new Parse.Query("LikedProfile");
                likeProfiles.equalTo("profileId", { "__type": "Pointer", "className": "Profile", "objectId": profileId });
                likeProfiles.equalTo("likeProfileId", resultObj.get('profileId'));
                likeProfiles.include("likeProfileId");
                likeProfiles.include("likeProfileId.currentLocation.Parent.Parent");
                likeProfiles.include("likeProfileId.placeOfBirth.Parent.Parent");
                likeProfiles.include("likeProfileId.industryId");
                likeProfiles.include("likeProfileId.education1.degreeId.degreeTypeId");
                likeProfiles.include("likeProfileId.education1.eduBranchId");
                likeProfiles.include("likeProfileId.education2.degreeId.degreeTypeId");
                likeProfiles.include("likeProfileId.education2.eduBranchId");
                likeProfiles.include("likeProfileId.education3.degreeId.degreeTypeId");
                likeProfiles.include("likeProfileId.education3.eduBranchId");
                likeProfiles.include("likeProfileId.religionId");
                likeProfiles.include("likeProfileId.casteId.religionId");
                likeProfiles.include("likeProfileId.gotraId.casteId.religionId");
                return likeProfiles.each(function (likeProfile) {
                    //console.log("liked profiles : " + likeProfile);
                    profileList.push(likeProfile.get('likeProfileId'));
                });
            });
            return promise;
        }).then(function () {
            //return profileList;
            response.success(profileList);
        }, function (error) {
            //return error;
            response.error("Error " + error.message);
        });
    }
});

Parse.Cloud.define("filterProfileLive", function (request, status) {
    var userProfile = new Parse.Object();
    var userPreference = new Parse.Object();
    var userLocationPreference = [];
    var userEducationPreferences = [];
    var userRCGPreferences = [];
    var finalProfiles = [];
    var showThisProfile = [];
    var male = true;
    var varProfileId = "";
    var kanyaProfileId = "";
    //console.log(request.params.oid);
    var query = new Parse.Query("Profile");
    query.equalTo("objectId", request.params.oid);
    query.include("currentLocation.Parent.Parent");
    query.include("placeOfBirth.Parent.Parent");
    query.include("industryId");
    query.include("education1.degreeId");
    query.include("education1.eduBranchId");
    query.include("education2.degreeId");
    query.include("education2.eduBranchId");
    query.include("education3.degreeId");
    query.include("education3.eduBranchId");
    query.find().then(function (uProfile) {
        //console.log(query);
        //console.log("user profile");
        //console.log(uProfile);
        userProfile = uProfile[0];
        var query3 = new Parse.Query("Preference");
        query3.equalTo("profileId", { "__type": "Pointer", "className": "Profile", "objectId": uProfile[0].id });
        query3.find(function (uPreference) {
            //console.log("user preference");
            //console.log(uPreference);
            if (uPreference != undefined) {
                userPreference = uPreference[0];
                //console.log(userPreference.get('profileId'));
            }
            //return uPreference;
        }).then(function () {
            var LPQuery = new Parse.Query("LocationPreferences");
            if (userPreference != undefined) {
                LPQuery.equalTo("preferenceId", { "__type": "Pointer", "className": "Preference", "objectId": userPreference.id });
            }
            LPQuery.include("cityId.Parent.Parent");
            LPQuery.include("countryId");
            LPQuery.include("stateId.Parent");
            LPQuery.find(function (ulPreference) {
                //console.log("user location preference");
                userLocationPreference = ulPreference;
            }).then(function () {
                var EPQuery = new Parse.Query("DegreePreferences");
                if (userPreference != undefined) {
                    EPQuery.equalTo("preferenceId", { "__type": "Pointer", "className": "Preference", "objectId": userPreference.id });
                }
                EPQuery.include("degreeId.degreeTypeId");
                EPQuery.include("degreeTypeId");
                EPQuery.find(function (udPreference) {
                    //console.log("user degree preference");
                    //console.log(udPreference);
                    //console.log(udPreference[0].get('degreeTypeId').get('typeOfDegree'));
                    userEducationPreferences = udPreference;
                }).then(function () {
                    //console.log("ready to read profiles");
                    if (userProfile.get('gender') !== "Male") {
                        male = false;
                    }
                    var query2 = new Parse.Query("Profile");
                    query2.notEqualTo("gender", userProfile.get('gender'));
                    query2.equalTo("isComplete", true);
                    if (userPreference != undefined) {
                        var setManglik = userPreference.get('manglik');
                        if (setManglik != 0) {
                            console.log("setting manglik to : " + setManglik);
                            query2.equalTo("manglik", 0);
                            query2.equalTo("manglik", setManglik);
                        }
                        if (userPreference.get('ageFrom') != undefined) {
                            if (userPreference.get('ageFrom') != 0) {
                                console.log("setting age from : " + userPreference.get('ageFrom'));
                                query2.greaterThanOrEqualTo("age", userPreference.get('ageFrom'));
                            }
                        }
                        if (userPreference.get('ageTo') != undefined) {
                            if (userPreference.get('ageTo') != 0) {
                                console.log("setting age to : " + userPreference.get('ageTo'));
                                query2.lessThanOrEqualTo("age", userPreference.get('ageTo'));
                            }
                        }
                        if (userPreference.get('minIncome') != undefined) {
                            if (userPreference.get('minIncome') != 0) {
                                console.log("setting package : " + userPreference.get('minIncome'));
                                query2.greaterThanOrEqualTo("package", userPreference.get('minIncome'));
                            }
                        }
                        if (userPreference.get('minHeight') != undefined) {
                            if (userPreference.get('minHeight') != 0) {
                                console.log("setting minHeight : " + userPreference.get('minHeight'));
                                query2.greaterThanOrEqualTo("height", userPreference.get('minHeight'));
                            }
                        }
                        if (userPreference.get('maxHeight') != undefined) {
                            if (userPreference.get('maxHeight') != 0) {
                                console.log("setting maxHeight : " + userPreference.get('maxHeight'));
                                query2.lessThanOrEqualTo("height", userPreference.get('maxHeight'));
                            }
                        }
                        if (userPreference.get('working') != undefined) {
                            if (userPreference.get('working') != 0) {
                                console.log("setting working : " + userPreference.get('working'));
                                query2.equalTo("workAfterMarriage", 0);
                                query2.equalTo("workAfterMarriage", userPreference.get('working'));
                            }
                        }
                    }
                    //query2.equalTo("religionId",userProfile.get('religionId'));
                    //query2.equalTo("casteId",userProfile.get('casteId'));
                    query2.include("currentLocation.Parent.Parent");
                    query2.include("placeOfBirth.Parent.Parent");
                    query2.include("industryId");
                    query2.include("education1.degreeId.degreeTypeId");
                    query2.include("education1.eduBranchId");
                    query2.include("education2.degreeId.degreeTypeId");
                    query2.include("education2.eduBranchId");
                    query2.include("education3.degreeId.degreeTypeId");
                    query2.include("education3.eduBranchId");
                    query2.include("religionId");
                    query2.include("casteId.religionId");
                    query2.include("gotraId.casteId.religionId");
                    query2.each(function (oppProfile) {
                        var removedOrNot = false;
                        //console.log(oppProfile);
                        showThisProfile.push(oppProfile);
                        var promise = Parse.Promise.as();
                        promise = promise.then(function () {
                            //console.log("searching for liked profile.");
                            var likeProfiles = new Parse.Query("LikedProfile");
                            likeProfiles.equalTo("profileId", { "__type": "Pointer", "className": "Profile", "objectId": userProfile.id });
                            likeProfiles.equalTo("likeProfileId", { "__type": "Pointer", "className": "Profile", "objectId": oppProfile.id });
                            return likeProfiles.each(function (likeProfile) {
                                showThisProfile.pop(oppProfile);
                                //console.log("already liked, removing profile of");
                                //console.log(oppProfile.get('name'));
                                removedOrNot = true;
                            });
                        });
                        promise = promise.then(function () {
                            //console.log("searching for disliked profile.");
                            var disLikeProfiles = new Parse.Query("DislikeProfile");
                            disLikeProfiles.equalTo("profileId", { "__type": "Pointer", "className": "Profile", "objectId": userProfile.id });
                            disLikeProfiles.equalTo("dislikeProfileId", { "__type": "Pointer", "className": "Profile", "objectId": oppProfile.id });
                            return disLikeProfiles.each(function (dislikeProfile) {
                                showThisProfile.pop(oppProfile);
                                //console.log("already disliked, removing profile of");
                                //console.log(oppProfile.get('name'));
                                removedOrNot = true;
                            });
                        });
                        promise = promise.then(function () {
                            //console.log("searching for pinned profile.");
                            var pinnedProfiles = new Parse.Query("PinnedProfile");
                            pinnedProfiles.equalTo("profileId", { "__type": "Pointer", "className": "Profile", "objectId": userProfile.id });
                            pinnedProfiles.equalTo("pinnedProfileId", { "__type": "Pointer", "className": "Profile", "objectId": oppProfile.id });
                            return pinnedProfiles.each(function (dislikeProfile) {
                                showThisProfile.pop(oppProfile);
                                //console.log("already pinned, removing profile of");
                                //console.log(oppProfile.get('name'));
                                removedOrNot = true;
                            });
                        });
                        promise = promise.then(function () {
                            //degree match section
                            if (!removedOrNot) {
                                var matchedornot = false;
                                //console.log("user ki education preferences : " + userEducationPreferences.length);
                                for (var i = 0; i < userEducationPreferences.length; i++) {
                                    var uep = userEducationPreferences[i];
                                    if (uep != undefined) {
                                        if (userEducationPreferences[i].get('degreeId') != undefined) {
                                            //console.log("checking degree id");
                                            //console.log(uep.get('degreeId').id);
                                            //console.log(oppProfile.get('education1').get('degreeId').id);
                                            try {
                                                if (oppProfile.get('education1').get('degreeId').id == uep.get('degreeId').id || oppProfile.get('education1').get('degreeId').id == uep.get('degreeId').id || oppProfile.get('education1').get('degreeId').id == uep.get('degreeId').id) {
                                                    matchedornot = true;
                                                    //console.log("degreeId matched.");
                                                    break;
                                                }
                                            }
                                            catch (err) { }
                                        }
                                        if (uep.get('degreeTypeId') != undefined) {
                                            //console.log("checking degree type id");
                                            //console.log(uep.get('degreeTypeId').id);
                                            //console.log(oppProfile.get('education1').get('degreeId').get('degreeTypeId').id);
                                            try {
                                                if (oppProfile.get('education1').get('degreeId').get('degreeTypeId').id == uep.get('degreeTypeId').id || oppProfile.get('education1').get('degreeId').get('degreeTypeId').id == uep.get('degreeTypeId').id || oppProfile.get('education1').get('degreeId').get('degreeTypeId').id == uep.get('degreeTypeId').id) {
                                                    matchedornot = true;
                                                    //console.log("degreeTypeId matched.");
                                                    break;
                                                }
                                            }
                                            catch (err) { //console.log(err);
                                            }
                                        }
                                    }

                                }
                                if (!matchedornot && userEducationPreferences.length > 0) {
                                    removedOrNot = true;
                                    //console.log("Not matched to degree criteria, So removing profile.");
                                    showThisProfile.pop(oppProfile);
                                }
                                else {
                                    //console.log("Degree preferences are not set.");
                                }
                            }
                        });
                        promise = promise.then(function () {
                            //location match section
                            if (!removedOrNot) {
                                for (var i = 0; i < userLocationPreference.length; i++) {
                                    var matchedOrNot = false;
                                    var ulp = userLocationPreference[i];
                                    if (ulp != undefined) {
                                        if (ulp.get('cityId') != undefined) {
                                            //console.log("checking city");
                                            //console.log(ulp.get('cityId').id);
                                            //console.log(oppProfile.get('currentLocation').id);
                                            try {
                                                if (ulp.get('cityId').id == oppProfile.get('currentLocation').id) {
                                                    matchedOrNot = true;
                                                    //console.log("city matched.");
                                                    break;
                                                }
                                            }
                                            catch (err) { }
                                        }
                                        else if (ulp.get('stateId') != undefined) {
                                            //console.log("checking state");
                                            //console.log(ulp.get('stateId').id);
                                            //console.log(oppProfile.get('currentLocation').get('Parent').id);
                                            try {
                                                if (ulp.get('stateId').id == oppProfile.get('currentLocation').get('Parent').id) {
                                                    matchedOrNot = true;
                                                    //console.log("state matched.");
                                                    break;
                                                }
                                            }
                                            catch (err) { }
                                        }
                                        else if (ulp.get('countryId') != undefined) {
                                            //console.log("checking country");
                                            //console.log(ulp.get('countryId').id);
                                            //console.log(oppProfile.get('currentLocation').get('Parent').get('Parent').id)
                                            try {
                                                if (ulp.get('countryId').id == oppProfile.get('currentLocation').get('Parent').get('Parent').id) {
                                                    matchedOrNot = true;
                                                    //console.log("country matched.");
                                                    break;
                                                }
                                            }
                                            catch (err) { }
                                        }
                                    }
                                }
                                if (!matchedOrNot && userLocationPreference.length > 0) {
                                    removedOrNot = true;
                                    //console.log("Not matched to location criteria, So removing profile.");
                                    //console.log(matchedOrNot);
                                    showThisProfile.pop(oppProfile);
                                }
                                else {
                                    //console.log("Location preferences are not set.");
                                }
                            }
                        });
                        return promise;
                    }).then(function () {
                        //console.log("found profile count : ");
                        //console.log(showThisProfile.length);
                        var promise = Parse.Promise.as();
                        var promises = [];
                        var i = 0;
                        var count = showThisProfile.length;
                        _.each(showThisProfile, function (proffile) {
                            promises.push(Parse.Cloud.run("crossCheckProfiles1", { uid: proffile.id, oid: userProfile.id, count: i }, {
                                success: function (result) {
                                    //console.log("after cross check profile : " + result);
                                    //if (result) {
                                    //console.log("adding profile to final array : " + result);
                                    finalProfiles.push(showThisProfile[result]);
                                    count--;
                                    //console.log(showThisProfile[i]);                                    
                                    //}
                                },
                                error: function (error) {
                                    //console.log("got an error here : " + error);
                                    count--;
                                }
                            }));
                            i++;
                        });
                        Parse.Promise.when(promises).then(function (result) {
                            //console.log("count value is : " + count);
                            //console.log("final filtered profile count : ");
                            console.log(finalProfiles.length);
                            //console.log(finalProfiles);
                            status.success(finalProfiles);
                        },
                            function (err) {
                                console.log("error in promises when.");
                                status.error(err);
                            });
                    });
                });
            });
        });
    });
});

Parse.Cloud.define("crossCheckProfiles1", function (request, response) {
    Parse.Cloud.useMasterKey();
    //console.log("We are here to cross check profile.");
    var requestU = request.params.uid;
    var requestO = request.params.oid;
    var loopCount = request.params.count;
    var oppProfile = new Parse.Object();
    var userProfile = new Parse.Object();
    var userPreference = new Parse.Object();
    var userLocationPreference = [];
    var userEducationPreferences = [];
    var userRCGPreferences = [];
    var promiseHope = Parse.Promise.as();
    promiseHope = promiseHope.then(function () {
        var query3 = new Parse.Query("Preference");
        query3.equalTo("profileId", { "__type": "Pointer", "className": "Profile", "objectId": requestU });
        query3.find(function (uPreference) {
            //console.log("Got user preference n its objectId");
            //console.log(uPreference);
            if (uPreference === undefined || uPreference === null || uPreference.length === 0) {
                //console.log("user preference is undefined for : " + loopCount);
                response.success(loopCount);
                //return true;
            }
            userPreference = uPreference[0];
            //console.log(userPreference.get('profileId'));
            //return uPreference;
        }).then(function () {
            if (userPreference === undefined) {
                //console.log("if user preference is undefined than y we are here.");
                //response.success(loopCount);
            }
            else {
                var RCGQuery = new Parse.Query("RCGPreferences");
                RCGQuery.equalTo("profile", requestU);
                RCGQuery.include("religionId");
                RCGQuery.include("casteId");
                RCGQuery.include("gotraId");
                RCGQuery.find(function (urcgPreference) {
                    //console.log("O user religion caste and gotra preference");
                    userRCGPreferences = urcgPreference;
                }).then(function () {
                    var LPQuery = new Parse.Query("LocationPreferences");
                    LPQuery.equalTo("preferenceId", { "__type": "Pointer", "className": "Preference", "objectId": userPreference.id });
                    LPQuery.include("cityId.Parent.Parent");
                    LPQuery.include("countryId");
                    LPQuery.include("stateId.Parent");
                    LPQuery.find(function (ulPreference) {
                        //console.log("O user location preference");
                        userLocationPreference = ulPreference;
                    }).then(function () {
                        var EPQuery = new Parse.Query("DegreePreferences");
                        EPQuery.equalTo("preferenceId", { "__type": "Pointer", "className": "Preference", "objectId": userPreference.id });
                        EPQuery.include("degreeId.degreeTypeId");
                        EPQuery.include("degreeTypeId");
                        EPQuery.find(function (udPreference) {
                            //console.log("O user degree preference");
                            //console.log(udPreference);
                            //console.log(udPreference[0].get('degreeTypeId').get('typeOfDegree'));
                            userEducationPreferences = udPreference;
                        }).then(function () {
                            var promise = Parse.Promise.as();
                            promise = promise.then(function () {
                                //console.log("getting profiles");
                                var query = new Parse.Query("Profile");
                                query.equalTo("objectId", requestU);
                                query.find(function (uProfile) {
                                    userProfile = uProfile;
                                    //console.log("got user profile : " + userProfile.id);
                                });
                                var oQuery = new Parse.Query("Profile");
                                oQuery.equalTo("objectId", requestO);
                                oQuery.find(function (oProfile) {
                                    oppProfile = oProfile;
                                    //console.log("got opposite profile : " + oppProfile.id);
                                });
                            });
                            promise = promise.then(function () {
                                var disLikeProfiles = new Parse.Query("DislikeProfile");
                                disLikeProfiles.equalTo("profileId", { "__type": "Pointer", "className": "Profile", "objectId": userProfile.id });
                                disLikeProfiles.equalTo("dislikeProfileId", { "__type": "Pointer", "className": "Profile", "objectId": oppProfile.id });
                                disLikeProfiles.each(function (dislikeProfile) {
                                    console.log("O already disliked, removing profile of");
                                    //console.log(oppProfile.get('name'));
                                    response.error(false);
                                    //return false;
                                });
                            });
                            promise = promise.then(function () {
                                var matchedornot = false;
                                for (var i = 0; i < userEducationPreferences.length; i++) {
                                    var uep = userEducationPreferences[i];
                                    if (userEducationPreferences[i].get('degreeId') != undefined) {
                                        //console.log("checking degree id");
                                        //console.log(uep.get('degreeId').id);
                                        //console.log(oppProfile.get('education1').get('degreeId').id);
                                        try {
                                            if (oppProfile.get('education1').get('degreeId').id == uep.get('degreeId').id || oppProfile.get('education2').get('degreeId').id == uep.get('degreeId').id || oppProfile.get('education3').get('degreeId').id == uep.get('degreeId').id) {
                                                matchedornot = true;
                                                //console.log("degreeId matched.");
                                                break;
                                            }
                                        } catch (ex) {
                                            matchedornot = true;
                                            break;
                                        }
                                    }
                                    if (uep.get('degreeTypeId') != undefined) {
                                        try {
                                            if (oppProfile.get('education1').get('degreeId').get('degreeTypeId').id == uep.get('degreeTypeId').id || oppProfile.get('education2').get('degreeId').get('degreeTypeId').id == uep.get('degreeTypeId').id || oppProfile.get('education3').get('degreeId').get('degreeTypeId').id == uep.get('degreeTypeId').id) {
                                                matchedornot = true;
                                                console.log("degreeTypeId matched.");
                                                break;
                                            }
                                        } catch (ex) {
                                            matchedornot = true;
                                            break;
                                        }
                                    }

                                }
                                if (!matchedornot && userEducationPreferences.length > 0) {
                                    //removedOrNot = true;
                                    console.log("Opposite not matched to degree criteria, So removing profile.");
                                    response.error(false);
                                    //return false;
                                }
                                else {
                                    console.log("Opposite degree preferences not set.");
                                }
                            });
                            promise = promise.then(function () {
                                for (var i = 0; i < userLocationPreference.length; i++) {
                                    var matchedOrNot = false;
                                    var ulp = userLocationPreference[i];
                                    if (ulp.get('cityId') != undefined) {
                                        //console.log("O checking city");
                                        //console.log(ulp.get('cityId').id);
                                        //console.log(oppProfile.get('currentLocation').id);
                                        try {
                                            if (ulp.get('cityId').id == oppProfile.get('currentLocation').id) {
                                                matchedOrNot = true;
                                                //console.log("city matched.");
                                                break;
                                            }
                                        }
                                        catch (ex) {
                                            matchedOrNot = true;
                                            break;
                                        }
                                    }
                                    else if (ulp.get('stateId') != undefined) {
                                        try {
                                            if (ulp.get('stateId').id == oppProfile.get('currentLocation').get('Parent').id) {
                                                matchedOrNot = true;
                                                break;
                                            }
                                        }
                                        catch (ex) {
                                            matchedOrNot = true;
                                            break;
                                        }
                                    }
                                    else if (ulp.get('countryId') != undefined) {
                                        try {
                                            if (ulp.get('countryId').id == oppProfile.get('currentLocation').get('Parent').get('Parent').id) {
                                                matchedOrNot = true;
                                                break;
                                            }
                                        }
                                        catch (ex) {
                                            matchedOrNot = true;
                                            break;
                                        }
                                    }
                                }
                                if (!matchedOrNot && userLocationPreference.length > 0) {
                                    console.log("Not matched to location criteria, So removing profile.");
                                    response.error(false);
                                }
                                else {
                                    console.log("Location preferences not set.");
                                }
                            });

                            promise = promise.then(function () {
                                if (userPreference.get('manglik') !== 0) {
                                    if (oppProfile.get('manglik') !== undefined) {
                                        if (oppProfile.get('manglik') !== userPreference.get('manglik')) {
                                            console.log("manglik status not matched.")
                                            response.error(false);
                                        }
                                    }
                                }
                            })
                        }).then(function () {
                            response.success(loopCount);
                        });
                    });
                })
            };
        });
    });
});

Parse.Cloud.define("getLatLngForCity", function (request, response) {
    Parse.Cloud.useMasterKey();
    var cityid = request.params.cityId;
    var cityQuery = new Parse.Query("City");
    cityQuery.equalTo("objectId", cityid);
    cityQuery.include("Parent.Parent");
    cityQuery.first({
        success: function (cityResult) {
            if (cityResult.get('latitude') === undefined || cityResult.get('longitude') === undefined) {
                var urlText = cityResult.get('name') + "," + cityResult.get('Parent').get('name') + "," + cityResult.get('Parent').get('Parent').get('name');
                urlText = urlText.replace(new RegExp(" ", "g"), "%20");
                console.log("lat lng url : " + urlText);
                var promise = Parse.Promise.as();
                promise = promise.then(function () {
                    Parse.Cloud.httpRequest({
                        method: "GET",
                        url: "https://maps.googleapis.com/maps/api/geocode/json?address=" + urlText
                        //params: "'address=" + cityResult.get('name') + "'"
                    }).then(function (httpResponse) {
                        //console.log(httpResponse.text);
                        var cityresponse = JSON.parse(httpResponse.text);
                        if (cityresponse.results.length > 0) {
                            //console.log(cityresponse.results[0].geometry.location.lat);
                            cityResult.set("latitude", cityresponse.results[0].geometry.location.lat);
                            cityResult.set("longitude", cityresponse.results[0].geometry.location.lng);
                            cityResult.save(null, {
                                success: function (city) {
                                    console.log("successfully save city.");
                                    response.success(city);
                                }
                            });
                        }
                        else {
                            response.error("Unable to get latitude and longitude of " + cityResult.get('name'));
                        }
                    },
                function (httpResponse) {
                    //console.log(httpResponse.text);
                    //console.log('Request failed with response code ' + httpResponse.status);
                    response.error('Request failed with response code ' + httpResponse.status);
                })
                });
            }
            else {
                console.log("City already have lat and long.");
                response.success("City already have lat and long.");
            }
        },
        error: function (error) {
            console.log("Unable to find city");
            response.error(error);
        }
    });
});

Parse.Cloud.define("getProfile", function (request, response) {
    Parse.Cloud.useMasterKey();
    var profileid = request.params.profileId;
    var varQuery = new Parse.Query("Profile");
    varQuery.equalTo("objectId", profileid);
    varQuery.include("placeOfBirth.Parent.Parent");
    varQuery.include("currentLocation.Parent.Parent");
    varQuery.include("userId");
    varQuery.first({
        success: function (varprofile) {
            //console.log("we got profile here");            
            //console.log(varprofile);
            response.success(varprofile);
        },
        error: function (error) {
            //console.log("Unable to find profile of boy.");
            response.error(error);
        }
    });
});

Parse.Cloud.define("matchKundli", function (request, response) {
    Parse.Cloud.useMasterKey();
    var City = Parse.Object.extend("City");
    var varCity = new City();
    var kanyaCity = new City();
    var varProfileid = request.params.boyProfileId;
    var kanyaProfileid = request.params.girlProfileId;
    var varProfile = new Parse.Object();
    var kanyaProfile = new Parse.Object();
    var promises = [];
    promises.push(Parse.Cloud.run("getProfile", { profileId: varProfileid }, {
        success: function (successResult) {
            varProfile = successResult;
        },
        error: function (error) {
            console.log("var profile is undefined.");
            response.error("Unable to find profile." + error.message);
        }
    }));
    promises.push(Parse.Cloud.run("getProfile", { profileId: kanyaProfileid }, {
        success: function (successResult) {
            kanyaProfile = successResult;
        },
        error: function (error) {
            console.log("var profile is undefined.");
            response.error("Unable to find profile." + error.message);
        }
    }));
    Parse.Promise.when(promises).then(function () {
        var promises1 = [];
        console.log("we get place of birth for boy : ");
        console.log(varProfile);
        if (varProfile.get('placeOfBirth').get('latitude') === undefined || varProfile.get('placeOfBirth').get('longitude') === undefined) {
            promises1.push(Parse.Cloud.run("getLatLngForCity", { cityId: varProfile.get('placeOfBirth').id }, {
                success: function (cResult) {
                    varCity = cResult;
                },
                error: function (error) {
                    console.log(error);
                    response.error(error);
                }
            }));
        }
        else {
            varCity = varProfile.get('placeOfBirth');
        }
        if (kanyaProfile.get('placeOfBirth').get('latitude') === undefined || kanyaProfile.get('placeOfBirth').get('longitude') === undefined) {
            promises1.push(Parse.Cloud.run("getLatLngForCity", { cityId: kanyaProfile.get('placeOfBirth').id }, {
                success: function (cResult) {
                    console.log("kanya city is : ");
                    console.log(cResult);
                    kanyaCity = cResult;
                },
                error: function (error) {
                    console.log(error);
                    response.error(error);
                }
            }));
        }
        else {
            kanyaCity = kanyaProfile.get('placeOfBirth');
        }
        //kBirthDate=23-10-1990&kActualBirthDate=23-10-1990&kLat=23.3341&kLng=75.03763&ktz=+5.5&kBirthTime=01:25:00&vBirthDate=22-04-1989&vActualBirthDate=22-04-1989&vLat=22.7195&vLng=75.8577&vtz=+5.5&vBirthTime=08:25:00
        Parse.Promise.when(promises1).then(function () {
            console.log(kanyaCity);
            var kDob = parseInt(kanyaProfile.get('dob').getMonth()) + 1;
            var urlText = "http://webcall.phone91.com/astro/index.php?kBirthDate=" + kanyaProfile.get('dob').getDate() + "-" + kDob + "-" + kanyaProfile.get('dob').getFullYear() + "&kActualBirthDate=" + kanyaProfile.get('dob').getDate() + "-" + kDob + "-" + kanyaProfile.get('dob').getFullYear() + "&kLat=" + kanyaCity.get('latitude') + "&kLng=" + kanyaCity.get('longitude') + "&ktz=+5.5&kBirthTime=" + kanyaProfile.get('tob').getHours() + ":" + kanyaProfile.get('tob').getMinutes() + ":" + kanyaProfile.get('tob').getSeconds() + "&vBirthDate=" + varProfile.get('dob').getDate() + "-" + (parseInt(varProfile.get('dob').getMonth()) + 1) + "-" + varProfile.get('dob').getFullYear() + "&vActualBirthDate=" + varProfile.get('dob').getDate() + "-" + (parseInt(varProfile.get('dob').getMonth()) + 1) + "-" + varProfile.get('dob').getFullYear() + "&vLat=" + varCity.get('latitude') + "&vLng=" + varCity.get('longitude') + "&vtz=+5.5&vBirthTime=" + varProfile.get('tob').getHours() + ":" + varProfile.get('tob').getMinutes() + ":" + varProfile.get('tob').getSeconds();
            console.log("url : " + urlText);
            Parse.Cloud.httpRequest({
                method: "GET",
                url: urlText
            }).then(function (httpResponse) {
                console.log("kundli response is : ");
                try {
                    var kundliResponse = JSON.parse(httpResponse.text);
                    console.log("kundli response is : ");
                    console.log(kundliResponse.total);
                    response.success(kundliResponse.total);
                }
                catch (err) {
                    console.log(err);
                    response.success("0");
                }
            }, function (httpResponse) {
                console.log('Request failed with response code ' + httpResponse.text);
                response.error('Request failed with response code ' + httpResponse.text);
            });
        });
    });
});