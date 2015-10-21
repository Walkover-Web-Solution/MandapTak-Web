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