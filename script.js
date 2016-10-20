(function() {

    var STATUS_URL = "https://slack.com/api/users.getPresence?token="+ slackkey +"&user=";

    var IMAGE_CONTAINER_SELECTOR = ".imageContainer",
        SLACK_CONTAINER_SELECTOR = ".slackContainer",
        GUIDE_UL_SELECTOR = ".guide-ul",
        BISHOP_ID = "Bishop",
        CARLOUGH_ID = "Carlough",
        HOWARD_ID = "Howard",
        RUIZ_ID = "Ruiz",
        WEAVER_ID = "Weaver",
        BISHOP_SLACK = "U2612DAJK",
        CARLOUGH_SLACK = "U0AF1P7BR",
        HOWARD_SLACK = "U03M3J4MP",
        RUIZ_SLACK = "U0AHRPE3B",
        WEAVER_SLACK = "U0K5JA464";

    var SLACK_LIST = [{"name": BISHOP_ID, "user": BISHOP_SLACK, "color": "#d1f9ff"},
                    {"name": CARLOUGH_ID, "user": CARLOUGH_SLACK, "color": "#feff86"},
                    {"name": HOWARD_ID, "user": HOWARD_SLACK, "color": "#e8a6ff"},
                    {"name": RUIZ_ID, "user": RUIZ_SLACK, "color": "#ff9797"},
                    {"name": WEAVER_ID, "user": WEAVER_SLACK, "color": "#9aff91"}],
        COORDINATE_MAP = {
            "Bishop": {"x": "27%", "y": "31%"}, //18
            "Carlough": {"x": "76%", "y": "82%"}, //95
            "Howard": {"x": "55%", "y": "40%"}, //42 or 40
            "Ruiz": {"x": "20%", "y": "90%"}, //14
            "Weaver": {"x": "44%", "y": "94%"}, //48
            "10front": {"x": "14%", "y": "66%"},
            "11back": {"x": "0%", "y": "0%"},
            "11mid": {"x": "10%", "y": "50%"},
        },
        CALENDAR_MAP = {
            "10front": "meetup.com_33383337313533302d373236@resource.calendar.google.com",
            "sushidog": "meetup.com_363534363636383838@resource.calendar.google.com",
            "readingroom": "meetup.com_33303231363532343633@resource.calendar.google.com",
            "pride": "meetup.com_2d3930303636323736323837@resource.calendar.google.com",
            "11back": "meetup.com_2d363231343931382d323732@resource.calendar.google.com",
            "11mid": "meetup.com_31383438323937312d383133@resource.calendar.google.com",
            "poodle": "meetup.com_2d3830303134353936373838@resource.calendar.google.com",
            "bobross": "meetup.com_3334353237323633313737@resource.calendar.google.com",
            "pairingstation": "meetup.com_2d37383634383431322d353730@resource.calendar.google.com",
        };
        
    

    function createPerson(currentWill) {
        // for map
        var $person = $("<div class='person " + currentWill.name + "' id='" + currentWill.name + "'></div>");
        $person.css("background-color", currentWill.color);
        var $personForGuide = $person.clone();
        $person.addClass("position--absolute");
        $(IMAGE_CONTAINER_SELECTOR).append($person);
        
        // for guide
        var $li = $("<li></li>");
        $personForGuide.attr("id", "");
        $personForGuide.addClass("display--inlineBlock");
        $li.append($personForGuide);
        $li.append("<div class='display--inlineBlock'>Will " + currentWill.name + "</div>");
        $(GUIDE_UL_SELECTOR).append($li); 
        
        checkSlackStatus(currentWill);
    }

    function checkSlackStatus(currentWill) {
        var willStatusUrl = STATUS_URL + currentWill.user;
        //API call
        $.ajax({
                url: willStatusUrl,
                dataType: "json",
                success:
                    function(data) {
                        var name = currentWill.name,
                            status = data.presence,
                            autoAwayStatus = data.auto_away;

                        switch(status) {
                            case "active":
                                $(SLACK_CONTAINER_SELECTOR).append("<div>Will " + name + " is active.</div>");
                                break;
                            case "away":
                                if (autoAwayStatus) {
                                    $(SLACK_CONTAINER_SELECTOR).append("<div>Will " + name + " is gone.</div>");
                                } else {
                                    $(SLACK_CONTAINER_SELECTOR).append("<div>Will " + name + " is away on purpose.</div>");
                                }
                                break;
                        }

                        $("#" + name).css("left", COORDINATE_MAP[name].x);
                        $("#" + name).css("top", COORDINATE_MAP[name].y);
                }
        });
    }

    function checkGoogleCalendar() {
        // TODO
    }

    function slackPick() {
        for (var i = 0; i <SLACK_LIST.length; i++){
            createPerson(SLACK_LIST[i]);
        }
    }

    $(document).ready(slackPick);
})();