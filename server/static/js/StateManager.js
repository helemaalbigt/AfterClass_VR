var Game = {};
var connectionValid = false;
var startRan = false;
var connectedUserId;
var timeConnected;
var userIndex = 0;
var connectedUsers = new Array();

var isPresenter = false;
var askedQuestion = false;
var hasPermission = false;

Game.fps = 10;

//set up user id and the time the user was created
window.onload = function () {
    connectedUserId = RandomString(8);
    timeConnected = new Date().getTime();
    console.log("new user " + connectedUserId + ", created at " + timeConnected);
};

Game.run = function () {
    Game.update();
};

// Start the game loop
Game._intervalId = setInterval(Game.run, 1000 / Game.fps);

//game loop
Game.update = function () {
    if (NAF.connection.isConnected()) {
        //clearInterval(Game._intervalId);

        // console.log("connected " + connectedUserId);
        NAF.connection.broadcastDataGuaranteed("ping", "");
        NAF.connection.subscribeToDataChannel("ping", TestPing);
        NAF.connection.subscribeToDataChannel("pong", TestPong);

        NAF.connection.subscribeToDataChannel("pingConnectedUsers", ReplyToPing);
        NAF.connection.subscribeToDataChannel("pingReply", IncreaseIndex);

        if (connectionValid && !startRan) {
            Start();
        }

        UpdatePermissions();
        UpdateMic();
    }
};

function TestPing() {
    NAF.connection.broadcastDataGuaranteed("pong", "");
}
function TestPong() {
    connectionValid = true;
}


function Start() {
    //console.log("start");

    ToggleMic(false);
    startRan = true;
    NAF.connection.broadcastDataGuaranteed("pingConnectedUsers", "");
}

function ReplyToPing(e) {
    var userInfo = { uid: connectedUserId, time: timeConnected };
    NAF.connection.broadcastDataGuaranteed("pingReply", userInfo);
}

function IncreaseIndex(message, channel, data) {
    if (connectedUsers.indexOf(data.uid) == -1) {
        connectedUsers.push(data.uid);
        if (data.time < timeConnected) {
            userIndex++;
        }
    }
    console.log(userIndex);
}

function ToggleMic(value) {
    //console.log("turn mic to "+ value);
    easyrtc.enableMicrophone(value);
}

function RandomString(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

function UpdatePermissions() {
    if (userIndex > 0) {
        isPresenter = false;
    } else {
        isPresenter = true;
    }
}

function UpdateMic() {
    if (isPresenter || hasPermission) {
        ToggleMic(true);
    } else {
        ToggleMic(false);
    }
}


function ClickedOnOther() {
    console.log("clicked on other");
}

function ClickedOnByOther() {
    console.log("clicked on other");
}



/*****
Key Bindings
*****/

window.onkeyup = function (e) {
    var key = e.keyCode ? e.keyCode : e.which;

    if (key == 38) {
        //console.log("turn mic on");
        ToggleMic(true);
        //NAF.connection.broadcastDataGuaranteed(dataType, data);
    } else if (key == 40) {
        //console.log("turn mic off");
        ToggleMic(false);
    } else if (key == 75) {
        ClickedOnOther();
    } else if (key == 79) {
        ClickedOnByOther();
    }
}