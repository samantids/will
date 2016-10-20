var statusUrl = "https://slack.com/api/users.getPresence?token="+ slackkey +"&user=";

var bishopSlack = "U2612DAJK";
var carloughSlack = "U0AF1P7BR";
var howardSlack = "U03M3J4MP";
var ruizSlack = "U0AHRPE3B";
var weaverSlack = "U0K5JA464";

var slackList = [{"name":"Bishop", "user":"U2612DAJK"}, 
{"name":"Carlough", "user":"U0AF1P7BR"}, 
{"name":"Howard", "user":"U03M3J4MP"}, 
{"name":"Ruiz", "user":"U0AHRPE3B"}, 
{"name":"Weaver", "user":"U0K5JA464"}];

function slackStatus(willStatusUrl, currentWill){
        console.log("test test");
        
        //API call
        
        $.ajax({
                url: willStatusUrl,
                dataType: "json",
                success:
                    //console.log("api connected")
                    function(data){
                        var status = data.presence;
                        var autoAwayStatus = data.auto_away;
                        //console.log(status);
                        
                        switch(status){
                            case "active": 
                                $(".slack-container").append("<p>Will " + currentWill.name + " is active.</p>");
                                break;
                            case "away":
                                if (autoAwayStatus){
                                    $(".slack-container").append("<p>Will " + currentWill.name + " is gone.</p>");
                                } else {
                                    $(".slack-container").append("<p>Will " + currentWill.name + " is away on purpose.</p>");
                                }
                                break;
                        }
                }
                
        });
} 

function slackPick(){
    for (var i = 0; i <slackList.length; i++){
        var willStatusUrl = statusUrl + slackList[i].user;
        //slackStatus();
        
        slackStatus(willStatusUrl, slackList[i]);
    }
}
    
$(document).ready(slackPick);