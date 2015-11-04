/**
 * Created by utkarsh on 11/2/2015.
 */
var selectedProfile, uid, count = 0, order = 0;
var picFile;
var currentPageNo;
Parse.initialize("Uj7WryNjRHDQ0O3j8HiyoFfriHV8blt2iUrJkCN0", "owBEWHkWBEEmmaukvUiKSOJhuSaQcOrKqhzqGNyi");
function jsfunction(operation) {
    profileCount(order);
    var val = document.getElementById("pageno").value;
    if (operation == 1 && val < Math.ceil(count / 10)) {
        document.getElementById("pageno").value = ++val;

    }
    else if (operation == 0 && val != 1) {
        document.getElementById("pageno").value = --val;
    }
    getAllProfiles(val, order);
}

function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#blah')
                .attr('src', e.target.result)
                .width(150)
                .height(200);
        };

        reader.readAsDataURL(input.files[0]);
    }
}
function navigateToPage() {
    var pageToNavigate = document.getElementById("pageno").value;
    if (pageToNavigate > 0 && pageToNavigate <= Math.ceil(count / 10))
        getAllProfiles(document.getElementById("pageno").value);
    else
        alert("Not a valid page.Page Limit " + Math.ceil(count / 10));
}
function sortByCompleteProfile() {
    order = parseInt(document.getElementById("sorted").value);
    profileCount(order);
    document.getElementById("pageno").value = 1;
    getAllProfiles(1, order);
}
function login() {
    Parse.Cloud.run('authenticate', {username: '0000000007', password: '12345678'}, {
        success: function (result) {
            window.alert(result.get("username"));
            document.getElementById("result").innerHTML = result.get("username");
        },
        error: function (error) {

        }
    });
}

function profileCount(order) {
    Parse.Cloud.run('getProfileCount', {order: order}, {
        success: function (result) {
            count = result;
        },
        error: function (error) {

        }
    });
}

function getAllProfiles(pageNo, order) {
    show("Loading...");
    currentPageNo = pageNo;
    Parse.Cloud.run('getAllProfiles', {pageno: pageNo, order: order}, {
        success: function (result) {
            var html = "";
            for (var i = 0; i < result.length; i++) {
                html += "<tr><td>" + result[i].get("userId").get("username") + "</td><td>" + result[i].get("name") +
                    "</td><td>" + result[i].get("isComplete") + "</td><td><button class='btn btn-primary' data-toggle='modal' data-target='#myModal' onclick='editProfile(" + JSON.stringify(result[i]) + ")'>EDIT</button></td></tr>";
            }
            close();
            document.getElementById("profileTable").innerHTML = html;
        },
        error: function (error) {

        }
    });
}
function addZero(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}
function editProfile(profile) {
    var dateSet;
    console.log(profile.objectId);
    var objectId = profile.objectId;


    Parse.Cloud.run("getProfile", {profileId: objectId}, {
            success: function (result) {
                console.log(result.get("userId").get("username"));
                selectedProfile = result;
                document.getElementById("name").value = selectedProfile.get("name");
                document.getElementById("weight").value = selectedProfile.get("weight");
                document.getElementById("height").value = selectedProfile.get("height");
                dateSet = selectedProfile.get("dob");
                if (dateSet != undefined)
                    document.getElementById("dob").value = dateSet.getFullYear() + "-" + addZero((dateSet.getMonth() + 1)) + "-" + addZero(dateSet.getDate());//Date(selectedProfile.get("dob"));
                var timeSet = selectedProfile.get("tob");
                if (timeSet != undefined) {
                    timeSet.setMinutes(timeSet.getMinutes() - 330);
                    var hrs = timeSet.getHours();
                    var mins = timeSet.getMinutes();
                    document.getElementById("tob").value = addZero(hrs) + ":" + addZero(mins) + ":" + addZero(timeSet.getSeconds());
                }
                if (selectedProfile.get("religionId") != null)
                    document.getElementById("rel").value = selectedProfile.get("religionId").get("name");
                if (selectedProfile.get("casteId") != null)
                    document.getElementById("caste").value = selectedProfile.get("casteId").get("name");
                if (selectedProfile.get("industryId") != null)
                    document.getElementById("work").value = selectedProfile.get("industryId").get("name");
                if (selectedProfile.get("placeOfBirth") != null)
                    document.getElementById("bp").value = selectedProfile.get("placeOfBirth").get("name") + "," + selectedProfile.get("placeOfBirth").get("Parent").get("name") + "," + selectedProfile.get("placeOfBirth").get("Parent").get("Parent").get("name");
                if (selectedProfile.get("currentLocation") != null)
                    document.getElementById("cl").value = selectedProfile.get("currentLocation").get("name") + "," + selectedProfile.get("currentLocation").get("Parent").get("name") + "," + selectedProfile.get("currentLocation").get("Parent").get("Parent").get("name");
                if (selectedProfile.get("education1") != null) {
                    document.getElementById("spe").value = selectedProfile.get("education1").get("name");
                    document.getElementById("edu").value = selectedProfile.get("education1").get("degreeId").get("name");
                }
                document.getElementById("desig").value = selectedProfile.get("designation");
                document.getElementById("income").value = selectedProfile.get("package");
                document.getElementById("comp").value = selectedProfile.get("placeOfWork");
                document.getElementById("comp").value = selectedProfile.get("placeOfWork");

            }
        }
    );
//    function myFun(dateSet){
//        (function () {
//            var date = Date.parse(dateSet);
//           //alert(date);
//            var d=new Date(date);
//            var day= d.getDate();
//            var month= d.getMonth();
//            var year= d.getFullYear();
//            var str=year+"-"+month+"-"+
//            field = document.querySelector('#dob');
//            field.value =
//            console.log(field.value);
//
//        })()

}

var doweUpdateAnything = false;
function saveProfile() {
    doweUpdateAnything = true;
    //to validate if user has filled complete form
    var ifFilled = required();
    // var parseFile = new Parse.File(picFile.name, picFile);
    if (ifFilled) {
        show("Saving...");
        var profileObj = {};
        profileObj.id = selectedProfile.id;
        profileObj.name = document.getElementById("name").value;
        profileObj.gender = document.getElementById("genderSelect").value;
        profileObj.dob = document.getElementById("dob").value;
        profileObj.tob = document.getElementById("tob").value;
        profileObj.birthPlace = document.getElementById("bpobj").value;
        profileObj.currentLocation = document.getElementById("clobj").value;
        profileObj.weight = document.getElementById("weight").value;
        profileObj.height = document.getElementById("height").value;
        profileObj.religion = document.getElementById("relobj").value;
        profileObj.caste = document.getElementById("casteobj").value;
        profileObj.manglik = document.getElementById("manglikSelect").value;
        profileObj.industry = document.getElementById("indusobj").value;
        //alert(typeof profileObj.industry);
        profileObj.designation = document.getElementById("desig").value;
        profileObj.company = document.getElementById("comp").value;
        profileObj.package = document.getElementById("income").value;
        profileObj.education = document.getElementById("speobj").value;
        profileObj.wantToWork = document.getElementById("workSelect").value;
        var profileSaved = new Parse.Object.extend("Profile");
        Parse.Cloud.run("saveProfile", {profiletosave: profileObj}, {
                success: function (result) {
                    console.log(result);
                    profileSaved = result;
                },
                error: function (error) {
                    console.log("inside cloud function error");
                    console.log(error);
                }
            }
        ).then(function () {

                var promises = $('.images').map(function (index, element) {
                    var deferred = $.Deferred();
                    var src = $(element).attr('src');
                    var canvas = document.createElement('CANVAS');
                    var ctx = canvas.getContext('2d');
                    var img = new Image;
                    img.crossOrigin = 'Anonymous';
                    img.onload = function () {
                        canvas.height = img.height;
                        canvas.width = img.width;
                        ctx.drawImage(img, 0, 0);
                        var base64Img = canvas.toDataURL('image/png');
                        // Clean up
                        canvas = null;
                        deferred.resolve(base64Img);
                    };
                    img.src = element.src;
                    return deferred;
                });

                $.when.apply($, promises).then(function () {
                    var file;
                    for (var i = 0; i < 1; i++) {
                        file = new Parse.File("profile.jpg", {base64: arguments[i]}); // this part actually saves the image file to parse
                        profileSaved.set("profilePic", file); // set this image to the corosponding column on our object
                    }

                    profileSaved.set("isComplete", true);

                    // save the user object
                    profileSaved.save(null, {
                        success: function (user) {
                            selectedProfile = user;
                            close();

                            $('#myModal').modal('hide');
                            //alert("Profile Saved");
                        },
                        error: function (user, error) {
                            console.log('Failed to create new object, with error code: ' + error.message);
                        }
                    }).then(function () {
                        getAllProfiles(document.getElementById("pageno").value);
                    });
                });
//                    try {
//                        var fileUploadControl = $("#profilePhotoFileUpload")[0];
//                        if (fileUploadControl.files.length > 0) {
//                            console.log("inside if condition");
//                            var file = fileUploadControl.files[0];
//                            var name = "photo.jpg";
//
//                            var parseFile = new Parse.File(name, file);
//
//                            profileObj.picture = parseFile;
//                        }
//                    }
//                    catch (exp) {
//                        console.log("exception here");
//                        console.log(exp.message);
//                    }
            });
    }
}


$(function () {

    $('#myModal').on('hidden.bs.modal', function () {
        console.log("event called");
        // do something…
        if (doweUpdateAnything) {
            doweUpdateAnything = false;
            if (selectedProfile.get("name") != undefined && selectedProfile.get("name") != null && selectedProfile.get("name") != "") {
                console.log("we are in");
                Parse.Cloud.run("ProfilePhotoSave", {"profile": selectedProfile.id}, {
                    success: function (result) {
                        console.log("finally done");

                    },
                    error: function (err) {
                        console.log("still there");
                    }
                });
            }
        }
    })


    $("#bp").autocomplete({
        source: function (request, response) {
            Parse.Cloud.run("getCities", {"searchThis": request.term}, {
                success: function (result) {
                    showThisResult = [];
                    for (var i = 0; i < result.length; i++) {
                        var obj = {};
                        obj.label = result[i].get("name") + "," + result[i].get("Parent").get("name") + "," + result[i].get("Parent").get("Parent").get("name");
                        obj.value = obj.label;
                        obj.jsonS = JSON.stringify(result[i]);
                        showThisResult.push(obj);
                        console.log(result[i].get("name"));
                    }
                    response(showThisResult);
                },
                error: function (error) {
                    alert("birth place field not working");
                }
            })
        },
        minLength: 2,
        select: function (event, ui) {

            console.log(ui ?
            "Selected: " + ui.item.value :
            "Nothing selected, input was " + this.value);
            //this.value = ui.item.value.get("name") + "," + ui.item.value.get("Parent").get("name") + "," + ui.item.value.get("Parent").get("Parent").get("name");
            var bpId = JSON.parse(ui.item.jsonS);
            document.getElementById("bpobj").value = bpId["objectId"];
            return ui.item.label;
        }
    });


    $("#cl").autocomplete({
        source: function (request, response) {
            Parse.Cloud.run("getCities", {"searchThis": request.term}, {
                success: function (result) {
                    showThisResult = [];
                    for (var i = 0; i < result.length; i++) {
                        var obj = {};
                        obj.label = result[i].get("name") + "," + result[i].get("Parent").get("name") + "," + result[i].get("Parent").get("Parent").get("name");
                        obj.value = obj.label;
                        obj.jsonS = JSON.stringify(result[i]);
                        showThisResult.push(obj);
                        console.log(result[i].get("name"));
                    }
                    response(showThisResult);
                },
                error: function (error) {
                    alert("current location field not working");
                }
            })
        },
        minLength: 2,
        select: function (event, ui) {

            console.log(ui ?
            "Selected: " + ui.item.value :
            "Nothing selected, input was " + this.value);
            //this.value = ui.item.value.get("name") + "," + ui.item.value.get("Parent").get("name") + "," + ui.item.value.get("Parent").get("Parent").get("name");
            var clId = JSON.parse(ui.item.jsonS);
            document.getElementById("clobj").value = clId["objectId"];
            return ui.item.label;
        }
    });

    //    Religion auto-complete
    $("#rel").autocomplete({

        source: function (request, response) {
            Parse.Cloud.run("getReligion", {"searchThis": request.term}, {
                success: function (result) {
                    showThisResult = [];
                    for (var i = 0; i < result.length; i++) {
                        var obj = {};
                        obj.label = result[i].get("name");// + "," + result[i].get("Parent").get("name") + "," + result[i].get("Parent").get("Parent").get("name");
                        obj.value = obj.label;
                        obj.jsonS = JSON.stringify(result[i]);
                        showThisResult.push(obj);
                        console.log(result[i].get("name"));
                    }
                    response(showThisResult);
                },
                error: function (error) {
                    alert("Religion field not working");
                }
            })
        },
        minLength: 2,
        select: function (event, ui) {

            console.log(ui ?
            "Selected: " + ui.item.value :
            "Nothing selected, input was " + this.value);
            //this.value = ui.item.value.get("name") + "," + ui.item.value.get("Parent").get("name") + "," + ui.item.value.get("Parent").get("Parent").get("name");
            var relId = JSON.parse(ui.item.jsonS);
            document.getElementById("relobj").value = relId["objectId"];
            return ui.item.label;
        }
    });
    $("#caste").autocomplete({

        source: function (request, response) {
            var religionId = document.getElementById("relobj").value;
            console.log(religionId);
            Parse.Cloud.run("getCaste", {"searchThis": request.term, religion: religionId}, {
                success: function (result) {
                    showThisResult = [];
                    for (var i = 0; i < result.length; i++) {
                        var obj = {};
                        obj.label = result[i].get("name");// + "," + result[i].get("Parent").get("name") + "," + result[i].get("Parent").get("Parent").get("name");
                        obj.value = obj.label;
                        obj.jsonS = JSON.stringify(result[i]);
                        showThisResult.push(obj);
                        console.log(result[i].get("name"));
                    }
                    response(showThisResult);
                },
                error: function (error) {
                    alert("Caste field not working");
                }
            })
        },
        minLength: 2,
        select: function (event, ui) {

            console.log(ui ?
            "Selected: " + ui.item.value :
            "Nothing selected, input was " + this.value);
            //this.value = ui.item.value.get("name") + "," + ui.item.value.get("Parent").get("name") + "," + ui.item.value.get("Parent").get("Parent").get("name");
            var casteId = JSON.parse(ui.item.jsonS);
            document.getElementById("casteobj").value = casteId["objectId"];
            return ui.item.label;
        }
    });

    $("#work").autocomplete({
        source: function (request, response) {
            Parse.Cloud.run("getIndustry", {"searchThis": request.term}, {
                success: function (result) {
                    showThisResult = [];
                    for (var i = 0; i < result.length; i++) {
                        var obj = {};
                        obj.label = result[i].get("name");// + "," + result[i].get("Parent").get("name") + "," + result[i].get("Parent").get("Parent").get("name");
                        obj.value = obj.label;
                        obj.jsonS = JSON.stringify(result[i]);
                        showThisResult.push(obj);
                        console.log(result[i].get("name"));
                    }
                    response(showThisResult);
                },
                error: function (error) {
                    alert("Industry field not working");
                }
            })
        },
        minLength: 1,
        select: function (event, ui) {

            console.log(ui ?
            "Selected: " + ui.item.value :
            "Nothing selected, input was " + this.value);
            //this.value = ui.item.value.get("name") + "," + ui.item.value.get("Parent").get("name") + "," + ui.item.value.get("Parent").get("Parent").get("name");
            var indusId = JSON.parse(ui.item.jsonS);
            document.getElementById("indusobj").value = indusId["objectId"];
            return ui.item.label;
        }
    });

    $("#edu").autocomplete({
        source: function (request, response) {
            Parse.Cloud.run("getEducation", {"searchThis": request.term}, {
                success: function (result) {
                    showThisResult = [];
                    for (var i = 0; i < result.length; i++) {
                        var obj = {};
                        obj.label = result[i].get("name");// + "," + result[i].get("Parent").get("name") + "," + result[i].get("Parent").get("Parent").get("name");
                        obj.value = obj.label;
                        obj.jsonS = JSON.stringify(result[i]);
                        showThisResult.push(obj);
                        console.log(result[i].get("name"));
                    }
                    response(showThisResult);
                },
                error: function (error) {
                    alert("Education field not working");
                }
            })
        },
        minLength: 1,
        select: function (event, ui) {

            console.log(ui ?
            "Selected: " + ui.item.value :
            "Nothing selected, input was " + this.value);
            //this.value = ui.item.value.get("name") + "," + ui.item.value.get("Parent").get("name") + "," + ui.item.value.get("Parent").get("Parent").get("name");
            var eduId = JSON.parse(ui.item.jsonS);
            document.getElementById("eduobj").value = eduId["objectId"];
            return ui.item.label;
        }
    });

    $("#spe").autocomplete({

        source: function (request, response) {
            var eduId = document.getElementById("eduobj").value;
            console.log(eduId);
            Parse.Cloud.run("getSpecial", {"searchThis": request.term, education: eduId}, {
                success: function (result) {
                    showThisResult = [];
                    for (var i = 0; i < result.length; i++) {
                        var obj = {};
                        obj.label = result[i].get("name");// + "," + result[i].get("Parent").get("name") + "," + result[i].get("Parent").get("Parent").get("name");
                        obj.value = obj.label;
                        obj.jsonS = JSON.stringify(result[i]);
                        showThisResult.push(obj);
                        console.log(result[i].get("name"));
                    }
                    response(showThisResult);
                },
                error: function (error) {
                    alert("Caste field not working");
                }
            })
        },
        minLength: 1,
        select: function (event, ui) {

            console.log(ui ?
            "Selected: " + ui.item.value :
            "Nothing selected, input was " + this.value);
            //this.value = ui.item.value.get("name") + "," + ui.item.value.get("Parent").get("name") + "," + ui.item.value.get("Parent").get("Parent").get("name");
            var special = JSON.parse(ui.item.jsonS);
            document.getElementById("speobj").value = special["objectId"];
            return ui.item.label;
        }
    });
    $("#searchByNumber").autocomplete({
        source: function (request, response) {
            var userid = document.getElementById("forAgents").value;
            Parse.Cloud.run("getUserName", {"searchThis": request.term, "userid": userid}, {
                success: function (result) {
                    showThisResult = [];
                    if(result.length==0)alert("No result for this number");
                    for (var i = 0; i < result.length; i++) {
                        var obj = {};
                        obj.label = result[i].get("profileId").get("userId").get("username");
                        obj.value = obj.label;
                        obj.jsonS = JSON.stringify(result[i].get("profileId").get("userId"));
                        showThisResult.push(obj);
                        console.log(result[i].get("profileId").get("userId").get("username"));
                    }
                    response(showThisResult);
                },
                error: function (error) {
                    alert("user field not working");
                }
            });
        },
        minLength: 1,
        select: function (event, ui) {

            console.log(ui ?
            "Selected: " + ui.item.value :
            "Nothing selected, input was " + this.value);
            var userIdForAgent = JSON.parse(ui.item.jsonS);
            document.getElementById("requiredUserId").value = userIdForAgent["objectId"];// got the profile Id.
            return ui.item.label;
        }
    });

});


function addAnUser() {
    var name = document.getElementById("name").value;
    var mob = document.getElementById("mob").value;
    var gender = document.getElementById("sex").value;

    var birthDay = document.getElementById("bday").value;
    var birthTime = document.getElementById("btime").value;

    var birthPlace = document.getElementById("bplace").value;
    var currentLocation = document.getElementById("location").value;

    var weigth = document.getElementById("weight").value;
    var height = document.getElementById("height").value;

    var religion = document.getElementById("religion").value;
    var caste = document.getElementById("caste").value;
    var manglikStatus = document.getElementById("manglik").value;

    var work = document.getElementById("working").value;
    var designation = document.getElementById("designation").value;

    var company = document.getElementById("company").value;
    var ctc = document.getElementById("ctc").value;

    var edu1 = document.getElementById("edu1").value;
    var edu2 = document.getElementById("edu2").value;

    var edu3 = document.getElementById("edu3").value;
    var wam = document.getElementById("wam").value;
    Parse.Cloud.run('addUsers', {
        username: name,
        number: mob,
        gender: gender,
        dob: birthDay,
        tob: birthTime,
        bplace: birthPlace,
        currloc: currentLocation,
        weight: weigth,
        height: height,
        religion: religion,
        caste: caste,
        manglik: manglikStatus,
        working: work,
        desig: designation,
        comp: company,
        income: ctc,
        edu1: edu1,
        edu2: edu2,
        edu3: edu3,
        wam: wam,
        adminId: '2BohswJjfi',
        relation: 'Admin'
    }, {
        success: function (result) {
            alert("Aded");
        },
        error: function (error) {
            alert("Not added.");
        }
    });
}
function searchProfileForAgent()
{
    var number=document.getElementById("searchByNumber").value;
    document.getElementById("pageno").value = 1;
    getProfileForAgent(number);

}

//function getUserIdForGivenProfle(pid)
//{
//    Parse.Cloud.run('getUserId', {pid:pid}, {
//        success: function (result) {
//            uid=result[0].get("userId")["id"];
//
//        },
//        error: function (error) {
//            console.log("User id not found");
//        }
//    });
//}
function getProfileForAgent(number)
{
    show("Loading...");
    var pId=document.getElementById("requiredUserId").value;// this is profileID in table UserProfile, Need userId
    Parse.Cloud.run('getProfileForAgent', {userId:pId}, {
        success: function (result) {
            var html = "";
            for (var i = 0; i < result.length; i++) {
                html += "<tr><td>" + result[i].get("userId").get("username") + "</td><td>" + result[i].get("name") +
                    "</td><td>" + result[i].get("isComplete") + "</td><td><button class='btn btn-primary' data-toggle='modal' data-target='#myModal' onclick='editProfile(" + JSON.stringify(result[i]) + ")'>EDIT</button></td></tr>";
            }
            close();
            document.getElementById("profileTable").innerHTML = html;
        },
        error: function (error) {

        }
    });
}

function show(message) {
    $('#pleaseWaitDialog').modal();
    document.getElementById("textToShow").innerHTML = message;
    setTimeout(5000);
}

function close() {
    $('#pleaseWaitDialog').modal('hide');
}
function reset() {
    location.reload();
}