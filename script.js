(function() {
    var STATUS_URL = "https://slack.com/api/users.getPresence?token="+ slackkey +"&user=";

    var IMAGE_CONTAINER_SELECTOR = ".imageContainer",
        SLACK_CONTAINER_SELECTOR = ".slackContainer",
        DISPLAY_NONE_CLASS = "display--none",
        DISPLAY_INLINE_CLASS = "display--inline",
        GCAL_ACCEPTED_STATUS = "accepted",
        CUR_CAL_NUM = 0,
        BISHOP_ID = "Bishop",
        CARLOUGH_ID = "Carlough",
        HOWARD_ID = "Howard",
        RUIZ_ID = "Ruiz",
        WEAVER_ID = "Weaver",
        BISHOP_SLACK = "U2612DAJK",
        CARLOUGH_SLACK = "U0AF1P7BR",
        HOWARD_SLACK = "U03M3J4MP",
        RUIZ_SLACK = "U0AHRPE3B",
        WEAVER_SLACK = "U0K5JA464",
        FULL_OPACITY = 1,
        ACTIVE_OPACITY = 0.85;

    var WILL_LIST = [{"name": BISHOP_ID, "user": BISHOP_SLACK, "color": "#d1f9ff", "email": "wbishop@meetup.com"},
                    {"name": CARLOUGH_ID, "user": CARLOUGH_SLACK, "color": "#feff86", "email": "wcarlough@meetup.com"},
                    {"name": HOWARD_ID, "user": HOWARD_SLACK, "color": "#e8a6ff", "email": "whoward@meetup.com"},
                    {"name": RUIZ_ID, "user": RUIZ_SLACK, "color": "#ff9797", "email": "communityleads@meetup.com"},
                    {"name": WEAVER_ID, "user": WEAVER_SLACK, "color": "#9aff91", "email": "wweaver@meetup.com"}],
        COORDINATE_MAP = {
            "Bishop": {"x": "66.5%", "y": "45%"}, //18
            "Carlough": {"x": "15%", "y": "79%"}, //95
            "Howard": {"x": "47%", "y": "44%"}, //42 or 40
            "Ruiz": {"x": "82%", "y": "75%"}, //14
            "Weaver": {"x": "59%", "y": "70%"}, //48
            "10th Floor Meeting Room": {"x": "88%", "y": "88%"},
            "Sushi Dog": {"x": "71%", "y": "88%"},
            "Reading Room": {"x": "64%", "y": "88%"},
            "Pride": {"x": "57%", "y": "88%"},
            "11th - Back": {"x": "4%", "y": "46%"},
            "11th - Middle": {"x": "47%", "y": "59%"},
            "Poodle": {"x": "71%", "y": "59%"},
            "BobRoss": {"x": "64%", "y": "59%"},
            "Pairing Station": {"x": "5%", "y": "71%"},
        },
        CALENDAR_MAP = {
            "10th Floor Meeting Room": "meetup.com_33383337313533302d373236@resource.calendar.google.com",
            "Sushi Dog": "meetup.com_363534363636383838@resource.calendar.google.com",
            "Reading Room": "meetup.com_33303231363532343633@resource.calendar.google.com",
            "Pride": "meetup.com_2d3930303636323736323837@resource.calendar.google.com",
            "11th - Back": "meetup.com_2d363231343931382d323732@resource.calendar.google.com",
            "11th - Middle": "meetup.com_31383438323937312d383133@resource.calendar.google.com",
            "Poodle": "meetup.com_2d3830303134353936373838@resource.calendar.google.com",
            "BobRoss": "meetup.com_3334353237323633313737@resource.calendar.google.com",
            "Pairing Station": "meetup.com_2d37383634383431322d353730@resource.calendar.google.com",
        },
        GCAL_CURRENT_EVENTS_LIST = []; // name, room, Bishop, Carlough, Howard, Ruiz, Weaver 
        
    

    function createPerson(currentWill) {
        // for map
        var $person = $("<div class='person " + currentWill.name + "' id='" + currentWill.name + "'></div>");
        var $img = $("<img class='light'></img>");
        $img.attr("src", "images/lights/" + currentWill.name + "-Light.png");
        $person.append($img);
        $person.addClass("position--fixed");
        $(IMAGE_CONTAINER_SELECTOR).append($person);
    }

    function checkSlackStatus(currentWill) {
        var willStatusUrl = STATUS_URL + currentWill.user;
        $.ajax({
                url: willStatusUrl,
                dataType: "json",
                success: function(data) {
                    var name = currentWill.name,
                        status = data.presence,
                        autoAwayStatus = data.auto_away;

                    for (var i = 0; i < WILL_LIST.length; i++) {
                        if (WILL_LIST[i].name == name) {
                            WILL_LIST[i]["slackStatus"] = status;
                        }
                    }

                    switch(status) {
                        case "active":
                            console.log("Will " + name + " is active.");
                            break;
                        case "away":
                            if (autoAwayStatus) {
                                console.log("Will " + name + " is gone.");
                            } else {
                                console.log("Will " + name + " is away on purpose.");
                            }
                            break;
                    }

                    var willHasGcalEvent = false,
                        gcalEvent = null;
                    for (var ev in GCAL_CURRENT_EVENTS_LIST) {
                        if (ev[currentWill] === true) {
                            willHasGcalEvent = true;
                            gcalEvent = ev;
                        }
                    }

                    // decide whether to use slack or gcal location
                    if (willHasGcalEvent && gcalEvent !== null) {
                        $("#" + name).css("left", COORDINATE_MAP[gcalEvent.room].x);
                        $("#" + name).css("top", COORDINATE_MAP[gcalEvent.room].y);
                        addToPopup(currentWill, true, gcalEvent);
                    } else {
                        $("#" + name).css("left", COORDINATE_MAP[name].x);
                        $("#" + name).css("top", COORDINATE_MAP[name].y);
                        addToPopup(currentWill, false, null);
                    }
                }
        });
    }

    function addToPopup(currentWill, isGoogle, event) {
        var $popup = $("." + currentWill.name + ".popup");
        if (isGoogle) {
            // popup to show gcal event
            $popup.html("<div class='popupText'>Will " + currentWill.name + " is at " + event.name + " in " + event.room +".</div>");
            //$popup.html("<p>" + event.name + "</p> <p>" + event.room + "</p>");
        } else {
            // popup to show slack status
            var status = currentWill["slackStatus"];
            switch(status) {
                case "active":
                    $popup.html("<div class='popupText'>Will " + currentWill.name + " is available.</div>");
                    break;
                case "away":
                    $popup.html("<div class='popupText'>Will " + currentWill.name + " is unavailable.<div>");
                    break;
            }
        }
    }

    function createPeople() {
        for (var i = 0; i <WILL_LIST.length; i++){
            createPerson(WILL_LIST[i]);
        }
    }
    
    

    // Your Client ID can be retrieved from your project in the Google
    // Developer Console, https://console.developers.google.com
    var CLIENT_ID = "";

    var SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];

    /**
     * Check if current user has authorized this application.
     */
    function checkAuth() {
        gapi.auth.authorize({
            'client_id': CLIENT_ID,
            'scope': SCOPES,
            'immediate': true
        }, handleAuthResult);
    }

    /**
     * Initiate auth flow in response to user clicking authorize button.
     *
     * @param {Event} e Button click event.
     */
    function handleAuthClick(e) {
        gapi.auth.authorize({
            client_id: CLIENT_ID,
            scope: SCOPES,
            immediate: false
        }, handleAuthResult);
        return false;
    }

    /**
     * Handle response from authorization server.
     *
     * @param {Object} authResult Authorization result.
     */
    function handleAuthResult(authResult) {
        var $authorizeDiv = $('#authorize-div');
        if (authResult && !authResult.error) {
            // Hide auth UI, then load client library.
            $authorizeDiv.addClass(DISPLAY_NONE_CLASS);
            $authorizeDiv.removeClass(DISPLAY_INLINE_CLASS);

            loadCalendarApi(null);
        } else {
            // Show auth UI, allowing the user to initiate authorization by
            // clicking authorize button.
            $authorizeDiv.addClass(DISPLAY_INLINE_CLASS);
            $authorizeDiv.removeClass(DISPLAY_NONE_CLASS);
        }
    }

    /**
     * Load Google Calendar client library. List upcoming events
     * once client library is loaded.
     */
    function loadCalendarApi(time) {
        gapi.client.load('calendar', 'v3', function() {
            populateGcalList(time);
        });
    }

    /**
     * Print the summary and start datetime/date of the next ten events in
     * the authorized user's calendar. If no events are found an
     * appropriate message is printed.
     */
    function populateGcalList(time) {
        for (var calendar in CALENDAR_MAP) {
            CUR_CAL_NUM++;
            var theDate = null;
            if (time === null) {
                var d = new Date(),
                currentHours = d.getHours();
                d.setHours(currentHours - 4);
                theDate = d;
            } else {
                var t = new Date();
                t.setMonth(time.month - 1);
                t.setDate(time.day);
                t.setFullYear(time.year);
                t.setHours(time.hours);
                t.setMinutes(time.mins);
                theDate = t;
            }
            var calendarId = CALENDAR_MAP[calendar],
                request = gapi.client.calendar.events.list({
                    'calendarId': calendarId,
                    'timeMin': theDate.toISOString(),
                    'showDeleted': false,
                    'singleEvents': true,
                    'maxResults': 10,
                    'orderBy': 'startTime'
                });
            request.execute(function(resp){
                handleEventListResponse(resp, time);
            });
        }
    }

    function handleEventListResponse(resp, time) {
        var events = resp.items;

        if (events.length > 0) {
            for (var i = 0; i < events.length; i++) {
                var event = events[i],
                    startTime = event.start.dateTime,
                    endTime = event.end.dateTime,
                    start = new Date(startTime),
                    end = new Date(endTime),
                    isHappeningNow = isEventHappeningNow(startTime, endTime) || time !== null;

                var date = (start.getMonth() + 1) + '/' + start.getDate() + '/' + start.getFullYear(),
                    timeRange = start.getHours() + ':' + start.getMinutes() + ' - ' + end.getHours() + ':' + end.getMinutes(),
                    happening = isHappeningNow ? 'happening now' : 'NOT happening now';

                console.log(event.summary + ' (' + date + ' @ ' + timeRange + ', ' + happening + ')');
                
                if (isHappeningNow && event.attendees !== undefined) {
                    var name = event.summary,
                        room = event.location,
                        bAttending = false,
                        cAttending = false,
                        hAttending = false,
                        rAttending = false,
                        wAttending = false;
                    for (var z = 0; z < WILL_LIST.length; z++) {
                        var will = WILL_LIST[z];
                        for (var w = 0; w < event.attendees.length; w++) {
                            var a = event.attendees[w];
                            if (a.email == will.email && a.responseStatus == GCAL_ACCEPTED_STATUS) {
                                switch(will.name) {
                                    case BISHOP_ID:
                                        bAttending = true;
                                        break;
                                    case CARLOUGH_ID:
                                        cAttending = true;
                                        break;
                                    case HOWARD_ID:
                                        hAttending = true;
                                        break;
                                    case RUIZ_ID:
                                        rAttending = true;
                                        break;
                                    case WEAVER_ID:
                                        wAttending = true;
                                        break;
                                }
                            }
                        }
                    }
                    GCAL_CURRENT_EVENTS_LIST.push({
                        "name": name,
                        "room": room,
                        "Bishop": bAttending,
                        "Carlough": cAttending,
                        "Howard": hAttending,
                        "Ruiz": rAttending,
                        "Weaver": wAttending
                    });
                }
            }
            console.log(GCAL_CURRENT_EVENTS_LIST);
        }
        if (CUR_CAL_NUM == 9) {
            for(var j = 0; j <WILL_LIST.length; j++) {
                checkSlackStatus(WILL_LIST[j]);
                hoverEvent();
            }
        }
    }

    function isEventHappeningNow(startTime, endTime) {
        var now = new Date(),
            start = new Date(startTime),
            end = new Date(endTime);
        return now <= end && now >= start;
    }
    
    function hoverEvent() {
        $(".Bishop").hover(function(){
            $(".Bishop").find(".light").css("opacity", FULL_OPACITY);
            $(".Bishop.button").attr("src", "images/buttons/WillBishop-ActiveBtn.png" );
            var left = $("#Bishop").css("left"),
                top = $("#Bishop").css("top");
            $(".Bishop.popup").css("left", left);
            $(".Bishop.popup").css("top", (parseInt(top.substring(0, top.length - 2), 10) - 40) + "px");
            $(".Bishop.popup").removeClass(DISPLAY_NONE_CLASS);
            }, function(){
            $(".Bishop").find(".light").css("opacity", ACTIVE_OPACITY);
            $(".Bishop.button").attr("src", "images/buttons/WillBishop-DisabledBtn.png" );
            $(".Bishop.popup").addClass(DISPLAY_NONE_CLASS);
        });
        $(".Carlough").hover(function(){
            $(".Carlough").find(".light").css("opacity", FULL_OPACITY);
            $(".Carlough.button").attr("src", "images/buttons/WillCarlough-ActiveBtn.png" );
            var left = $("#Carlough").css("left"),
                top = $("#Carlough").css("top");
            $(".Carlough.popup").css("left", left);
            $(".Carlough.popup").css("top", (parseInt(top.substring(0, top.length - 2), 10) - 40) + "px");
            $(".Carlough.popup").removeClass(DISPLAY_NONE_CLASS);
            }, function(){
            $(".Carlough").find(".light").css("opacity", ACTIVE_OPACITY);
            $(".Carlough.button").attr("src", "images/buttons/WillCarlough-DisabledBtn.png" );
            $(".Carlough.popup").addClass(DISPLAY_NONE_CLASS);
        });
        $(".Howard").hover(function(){
            $(".Howard").find(".light").css("opacity", FULL_OPACITY);
            $(".Howard.button").attr("src", "images/buttons/WillHoward-ActiveBtn.png" );
            var left = $("#Howard").css("left"),
                top = $("#Howard").css("top");
            $(".Howard.popup").css("left", left);
            $(".Howard.popup").css("top", (parseInt(top.substring(0, top.length - 2), 10) - 40) + "px");
            $(".Howard.popup").removeClass(DISPLAY_NONE_CLASS);
            }, function(){
            $(".Howard").find(".light").css("opacity", ACTIVE_OPACITY);
            $(".Howard.button").attr("src", "images/buttons/WillHoward-DisabledBtn.png" );
            $(".Howard.popup").addClass(DISPLAY_NONE_CLASS);
        });
        $(".Ruiz").hover(function(){
            $(".Ruiz").find(".light").css("opacity", FULL_OPACITY);
            $(".Ruiz.button").attr("src", "images/buttons/WillRuiz-ActiveBtn.png" );
            var left = $("#Ruiz").css("left"),
                top = $("#Ruiz").css("top");
            $(".Ruiz.popup").css("left", left);
            $(".Ruiz.popup").css("top", (parseInt(top.substring(0, top.length - 2), 10) - 40) + "px");
            $(".Ruiz.popup").removeClass(DISPLAY_NONE_CLASS);
            }, function(){
            $(".Ruiz").find(".light").css("opacity", ACTIVE_OPACITY);
            $(".Ruiz.button").attr("src", "images/buttons/WillRuiz-DisabledBtn.png" );
            $(".Ruiz.popup").addClass(DISPLAY_NONE_CLASS);
        });
        $(".Weaver").hover(function(){
            $(".Weaver").find(".light").css("opacity", FULL_OPACITY);
            $(".Weaver.button").attr("src", "images/buttons/WillWeaver-ActiveBtn.png" );
            var left = $("#Weaver").css("left"),
                top = $("#Weaver").css("top");
            $(".Weaver.popup").css("left", left);
            $(".Weaver.popup").css("top", (parseInt(top.substring(0, top.length - 2), 10) - 40) + "px");
            $(".Weaver.popup").removeClass(DISPLAY_NONE_CLASS);
            }, function(){
            $(".Weaver").find(".light").css("opacity", ACTIVE_OPACITY);
            $(".Weaver.button").attr("src", "images/buttons/WillWeaver-DisabledBtn.png" );
            $(".Weaver.popup").addClass(DISPLAY_NONE_CLASS);
        });
        
    }

    function doTimeMachine(e) {
        /*CUR_CAL_NUM = 0;
        var month = parseInt($("#month").val()),
            day = parseInt($("#day").val()),
            year = parseInt($("#year").val()),
            time = $("#time").val().split(":"),
            timeObj = {
                "month": month,
                "day": day,
                "year": year,
                "hours": parseInt(time[0]),
                "mins": parseInt(time[1])
            };
        loadCalendarApi(timeObj);*/
        $("#Bishop").css("left", COORDINATE_MAP["11th - Back"].x);
        $("#Bishop").css("top", COORDINATE_MAP["11th - Back"].y);
        $(".Bishop.popup").html("<div class='popupText'>Will Bishop is at Community Experience Meeting in 11th - Back.</div>");
        return false;
    }

    /**
    * Append an element to the output div containing the given message.
    *
    * @param {string} message Text to be placed in output element.
    */
    function appendToOutput(message) {
        var $output = $("#output");
        $output.append("<div>" + message + "\n");
    }

    function bindEvents() {
        $("#authorize-button").on("click", handleAuthClick);
        $("#time-machine").on("click", doTimeMachine);
    }

    function init() {
        bindEvents();
        createPeople();
    }


    $(document).ready(init);
})();
