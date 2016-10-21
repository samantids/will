(function() {
    
    var STATUS_URL = "https://slack.com/api/users.getPresence?token="+ slackkey +"&user=";

    var IMAGE_CONTAINER_SELECTOR = ".imageContainer",
        SLACK_CONTAINER_SELECTOR = ".slackContainer",
        GUIDE_UL_SELECTOR = ".guide-ul",
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
        WEAVER_SLACK = "U0K5JA464";

    var WILL_LIST = [{"name": BISHOP_ID, "user": BISHOP_SLACK, "color": "#d1f9ff", "email": "wbishop@meetup.com"},
                    {"name": CARLOUGH_ID, "user": CARLOUGH_SLACK, "color": "#feff86", "email": "wcarlough@meetup.com"},
                    {"name": HOWARD_ID, "user": HOWARD_SLACK, "color": "#e8a6ff", "email": "whoward@meetup.com"},
                    {"name": RUIZ_ID, "user": RUIZ_SLACK, "color": "#ff9797", "email": "willr@meetup.com"},
                    {"name": WEAVER_ID, "user": WEAVER_SLACK, "color": "#9aff91", "email": "wweaver@meetup.com"}],
        COORDINATE_MAP = {
            "Bishop": {"x": "27%", "y": "31%"}, //18
            "Carlough": {"x": "76%", "y": "82%"}, //95
            "Howard": {"x": "55%", "y": "40%"}, //42 or 40
            "Ruiz": {"x": "20%", "y": "90%"}, //14
            "Weaver": {"x": "44%", "y": "94%"}, //48
            "10th Floor Meeting Room": {"x": "14%", "y": "66%"},
            "Sushi Dog": {"x": "0%", "y": "0%"},
            "Reading Room": {"x": "0%", "y": "0%"},
            "Pride": {"x": "0%", "y": "0%"},
            "11th - Back": {"x": "0%", "y": "0%"},
            "11th - Middle": {"x": "10%", "y": "50%"},
            "Poodle": {"x": "0%", "y": "0%"},
            "BobRoss": {"x": "0%", "y": "0%"},
            "Pairing Station": {"x": "0%", "y": "0%"},
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
    }

    function checkSlackStatus(currentWill) {
        var willStatusUrl = STATUS_URL + currentWill.user;
        //API call
        $.ajax({
                url: willStatusUrl,
                dataType: "json",
                success: function(data) {
                    var name = currentWill.name,
                        status = data.presence,
                        autoAwayStatus = data.auto_away;

                    switch(status) {
                        case "active":
                            //$(SLACK_CONTAINER_SELECTOR).append("<div>Will " + name + " is active.</div>");
                            console.log("Will " + name + " is active.");
                            break;
                        case "away":
                            if (autoAwayStatus) {
                                //$(SLACK_CONTAINER_SELECTOR).append("<div>Will " + name + " is gone.</div>");
                                console.log("Will " + name + " is gone.");
                            } else {
                                //$(SLACK_CONTAINER_SELECTOR).append("<div>Will " + name + " is away on purpose.</div>");
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
                    } else {
                        $("#" + name).css("left", COORDINATE_MAP[name].x);
                        $("#" + name).css("top", COORDINATE_MAP[name].y);
                    }
                }
        });
    }

    function createPeople() {
        for (var i = 0; i <WILL_LIST.length; i++){
            createPerson(WILL_LIST[i]);
        }
    }
    
    

    // Your Client ID can be retrieved from your project in the Google
    // Developer Console, https://console.developers.google.com
    var CLIENT_ID = ;

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

            loadCalendarApi();
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
    function loadCalendarApi() {
        gapi.client.load('calendar', 'v3', populateGcalList);
    }

    /**
     * Print the summary and start datetime/date of the next ten events in
     * the authorized user's calendar. If no events are found an
     * appropriate message is printed.
     */
    function populateGcalList() {
        for (var calendar in CALENDAR_MAP) {
            CUR_CAL_NUM++;
            var nowMinusTwoHours = new Date(),
                currentHours = nowMinusTwoHours.getHours();
            nowMinusTwoHours.setHours(currentHours - 4);
            var calendarId = CALENDAR_MAP[calendar],
                request = gapi.client.calendar.events.list({
                    'calendarId': calendarId,
                    'timeMin': nowMinusTwoHours.toISOString(),
                    'showDeleted': false,
                    'singleEvents': true,
                    'maxResults': 10,
                    'orderBy': 'startTime'
                });
            request.execute(handleEventListResponse);
        }
    }

    function handleEventListResponse(resp) {
        var events = resp.items;

        if (events.length > 0) {
            for (var i = 0; i < events.length; i++) {
                var event = events[i],
                    startTime = event.start.dateTime,
                    endTime = event.end.dateTime,
                    start = new Date(startTime),
                    end = new Date(endTime),
                    isHappeningNow = isEventHappeningNow(startTime, endTime);

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
                    for (var will in WILL_LIST) {
                        for (var a in event.attendees) {
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
            }
        }
    }

    function isEventHappeningNow(startTime, endTime) {
        var now = new Date(),
            start = new Date(startTime),
            end = new Date(endTime);
        return now <= end && now >= start;
    }
    
    function hoverEvent(){
        $(".Bishop").hover(function(){
            $(this).css("background-color", "red");
            }, function(){
            $(this).css("background-color", "black");
        });
        $(".Carlough").hover(function(){
            $(this).css("background-color", "red");
            }, function(){
            $(this).css("background-color", "black");
        });
        $(".Howard").hover(function(){
            $(this).css("background-color", "red");
            }, function(){
            $(this).css("background-color", "black");
        });
        $(".Ruiz").hover(function(){
            $(this).css("background-color", "red");
            }, function(){
            $(this).css("background-color", "black");
        });
        $(".Weaver").hover(function(){
            $(this).css("background-color", "red");
            }, function(){
            $(this).css("background-color", "black");
        });
        
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
    }

    function init() {
        bindEvents();
        createPeople();
        hoverEvent();
    }


    $(document).ready(init);
})();
