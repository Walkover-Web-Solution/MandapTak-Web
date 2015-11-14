
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
/*Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});*/

function randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
}
var rString = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
var applicationKey = "FVcK6LQzzO73Ksuh5cSBu-nSWeqEnBsIu09l4vGY9SsOO9aDlUlSeR4i7W5o1zjZo0GMhA6np5JNaka4jVYip_8E_O-NnsMqdwS60Nih7tKVPvE6IPiemhKl6q44dmTrX9HdJEPcXzzyXcFRV1wpMw==";//"87RaldWeHiaHUiVbvGjYW7L0TyZj1Bxl2aYgiwTjXXmTk_x4AqHv78XFzlGl2TzDH2nG-Z2SaZ7ynYv92nxwnZ1JMp66Uy6M6bsVW1nasxJcueRtOwvf2hyIXLLcthqmNLe2uFFT0EsXRRkEeliL0g==";
var deductCredit = 0;

Parse.Cloud.define("verifyNumberTest", function (request, response) {
    var mobileNo = request.params.mobile;
    var otp = request.params.otp;
    console.log(otp.length);
    Parse.Cloud.useMasterKey();
    var passwordGenerate = randomString(8, rString);
    console.log("Password generated : " + passwordGenerate);
    var promise = Parse.Promise.as();
    promise = promise.then(function () {
        var query = new Parse.Query(Parse.User);
        query.equalTo("username", mobileNo);
        query.find(function (user) {
            console.log(user);
            var pUser = new Parse.User();
            pUser = user[0];
            console.log(pUser);
            pUser.set("password", passwordGenerate);
            pUser.save(null, {
                success: function (user) {
                    // This succeeds, since the user was authenticated on the device
                    console.log("This succeeds, since the user was authenticated on the device");
                    response.success(passwordGenerate);
                },
                error: function (err) {
                    response.error(err);
                }
            });
        });
    });
});

Parse.Cloud.define("verifyNumber", function (request, response) {
    var mobileNo = request.params.mobile;
    var otp = request.params.otp;
    console.log(otp.length);
    if (otp == null || otp.length < 4) {
        response.error("Verification code is incorrect.");
    }
    else if (mobileNo.length < 10 || mobileNo.length > 10) {
        response.error("Number should not be less than 10 digits");
    }
    else {
        Parse.Cloud.useMasterKey();
        Parse.Cloud.httpRequest({
            method: "POST",
            url: "http://sendotp.msg91.com/api/verifyOTP",
            headers: {
                'application-Key': applicationKey,
                'Referer': 'www.mandaptak.com'
            },
            body: '{"countryCode":"91", "mobileNumber": "' + mobileNo + '", "oneTimePassword":"' + otp + '"}'
        }).then(function (httpResponse) {
            //generate password here save to user table and send it to device
            var passwordGenerate = randomString(8, rString);
            console.log("Password generated : ");
            var promise = Parse.Promise.as();
            promise = promise.then(function () {
                var query = new Parse.Query(Parse.User);
                query.equalTo("username", mobileNo);
                query.find(function (user) {
                    console.log(user);
                    var pUser = new Parse.User();
                    pUser = user[0];
                    pUser.set("password", passwordGenerate);
                    pUser.save(null, {
                        success: function (user) {
                            // This succeeds, since the user was authenticated on the device
                            console.log("This succeeds, since the user was authenticated on the device");
                            response.success(passwordGenerate);
                        }
                    });
                });
            });
            console.log(httpResponse.text);
            //response.success("Success : verified");
        }, function (httpResponse) {
            console.log('Request failed with response code ' + httpResponse.text);
            response.error('Request failed with response code ' + httpResponse.status);
        });
    }
});

Parse.Cloud.define("sendOtp", function (request, response) {
    var mobileNo = request.params.mobile;
    if (mobileNo.length < 10 || mobileNo.length > 10) {
        response.error("ERROR : Number should not be less than 10 digits");
    }
    else {
        Parse.Cloud.useMasterKey();
        console.log(mobileNo);
        var query = new Parse.Query(Parse.User);
        query.equalTo("username", mobileNo);
        query.find(function (user) {
            console.log(user);
            if (user.length > 0) {
                var jxr = Parse.Cloud.httpRequest({
                    method: "POST",
                    url: "http://sendotp.msg91.com/api/generateOTP",
                    headers: {
                        'application-Key': applicationKey,
                        'Referer': 'www.mandaptak.com'
                    },
                    body: '{"countryCode":"91", "mobileNumber": "' + mobileNo + '"}'
                }).then(function (httpResponse) {
                    console.log(httpResponse.text);
                    //var objJSON = eval("(function(){return " + httpResponse.text + ";})()");
                    //console.log(objJSON.result);
                    response.success("Verification code has been sent on " + mobileNo);
                }, function (httpResponse) {
                    console.log('Request failed with response code ' + httpResponse.text);
                    response.error('Request failed with response code ' + httpResponse.status);
                });
                console.log(jxr);
            }
            else {
                response.error("User not found. Please contact your nearest agent.");
            }
        },
		function () {
		    response.error("User not found. Please contact your nearest agent.");
		});
    }
});

