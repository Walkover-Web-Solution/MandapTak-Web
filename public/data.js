Parse.Cloud.define("averageHeight", function(request, response) {
    Parse.Cloud.useMasterKey();
    console.log("function called");
    var query = new Parse.Query("Profile");
    query.equalTo("height", request.params.height);
    query.find({
        success: function(results) {
            var sum = 0;
            for (var i = 0; i < results.length; ++i) {
                sum += results[i].get("stars");
            }
            response.success(sum / results.length);
        },
        error: function() {
            response.error("height lookup failed");
        }
    });
});