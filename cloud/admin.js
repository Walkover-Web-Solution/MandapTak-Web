// added by Utkarsh

Parse.Cloud.define("authenticate", function(request, response) {
    //Parse.Cloud.useMasterKey();
    Parse.User.logIn(request.params.username, request.params.password, {
        success: function(user) {
            // Do stuff after successful login.
            response.success(user);
        },
        error: function(user, error) {
            // The login failed. Check error to see why.
            response.error(error);
        }
    });
});

Parse.Cloud.define("getAllProfiles", function(request, response) {
    Parse.Cloud.useMasterKey();
    var query = new Parse.Query("Profile");
    query.equalTo("isComplete", request.params.oid);
    query.find().then(function(result){
        response.success(result);
    });
});


//added by Utkarsh