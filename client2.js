$(document).ready(function() {

    var conn;
    var name;
    var localVideo = document.querySelector('#localVideo');
    var remoteVideo = document.querySelector('#remoteVideo');
    var yourConn;
    var stream;
    var otherconn;

    //----------------------------------------------------------------------------------------------

    //----------------------------------------------------------------------------------------------

    /*conn.onmessage = function(e) {
        console.log(e.data);
        var data = JSON.parse(e.data);

        switch (data.meta) {
            case 'login':
                login(data);
                break;
                //----------------------------------------------------------------------------------------------
            case 'invaliduser':
                otherconn = null;
                $('#callBtn').prop('disabled', false);
                alert(data.extra + ' Error!! User not exist');
                break;
                //----------------------------------------------------------------------------------------------
            case 'handlecandidate':
                handleCandidate(data.candidate);
                break;
                //----------------------------------------------------------------------------------------------
            case 'handleoffer':
                handleOffer(data.offer, data.sender);
                break;
                //----------------------------------------------------------------------------------------------
            case 'handleanswer':
                handleAnswer(data.answer);
                break;
                //----------------------------------------------------------------------------------------------
            case 'handleleave':
                handleLeave();
                break;
                //----------------------------------------------------------------------------------------------     
            case 'error':
                error();
                break;
                //----------------------------------------------------------------------------------------------
            default:
                error();
                break;

        }

    };*/

    function insertUser(name) {
        var ref = firebase.database().ref().child(name);
        ref.remove();
        ref.child("init").set("Initiate").then(function() {
            addSelfListener(name);
            login({ status: 'true', name: name });
        });
    }

    function addSelfListener(name) {
        var ref = firebase.database().ref().child(name);
        ref.child("offer").on('value', function(childSnapshot, prevChildKey) {
            if (childSnapshot.val())
                handleOffer({ "type": "offer", "sdp": childSnapshot.val().des });
        });
        ref.child("remotecandidate").on('value', function(childSnapshot, prevChildKey) {
            if (childSnapshot.val())
                handleCandidate(childSnapshot.val());
        });
        ref.child("leave").on('value', function(childSnapshot, prevChildKey) {
            if (childSnapshot.val() && childSnapshot.val().leave)
                handleLeave();
        });
    }

    function addRemoteListener(rname) {
        var ref = firebase.database().ref().child(rname);
        ref.child("answer").on('value', function(childSnapshot, prevChildKey) {
            if (childSnapshot.val())
                handleAnswer({ "type": "answer", "sdp": childSnapshot.val().des });
        });
        ref.child("localcandidate").on('value', function(childSnapshot, prevChildKey) {
            if (childSnapshot.val())
                handleCandidate(childSnapshot.val());
        });
        ref.child("leave").on('value', function(childSnapshot, prevChildKey) {
            if (childSnapshot.val() && childSnapshot.val().leave)
                handleLeave();
        });
    }

    function insertOffer(name, des) {
        if (des)
            firebase.database().ref().child(name).child("offer").child("des").set(des);
    }

    function insertAnswer(name, des) {
        if (des)
            firebase.database().ref().child(name).child("answer").child("des").set(des);
    }

    function insertLocalCandidate(name, cand) {
        if (cand)
            firebase.database().ref().child(name).child("localcandidate").set({
                candidate: cand.candidate,
                sdpMid: cand.sdpMid,
                sdpMLineIndex: cand.sdpMLineIndex
            });
    }

    function insertRemoteCandidate(name, cand) {
        if (cand)
            firebase.database().ref().child(name).child("remotecandidate").set({
                candidate: cand.candidate,
                sdpMid: cand.sdpMid,
                sdpMLineIndex: cand.sdpMLineIndex
            });
    }

    function leave(name, flag) {
        firebase.database().ref().child(name).child("leave").child("leave").set(flag);
    }

    //----------------------------------------------------------------------------------------------

    //----------------------------------------------------------------------------------------------

    $('#join').click(function() {

        var iname = $("#name").val();
        if (iname !== "") {
            $('#join').prop('disabled', true);
            insertUser(iname);
        }
    });

    //----------------------------------------------------------------------------------------------

    function login(data) {

        if (data.status === 'true') {

            $("#login_page").hide();
            $("#chat_room").show();
            name = data.name;

            //starting a peer connection
            start_peer_conn();

        } else {

            alert("oops..try a different username");
            $('#join').prop('disabled', false);
        }
    }

    //----------------------------------------------------------------------------------------------

    function hasUserMedia() {
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia || navigator.msGetUserMedia;
        return !!navigator.getUserMedia;
    }

    //----------------------------------------------------------------------------------------------

    function start_peer_conn() {
        if (hasUserMedia()) {

            //using Google public stun server 
            var configuration = {
                "iceServers": [{ url: "stun:stun2.1.google.com:19302" }, {
                    url: 'turn:35.225.250.3:3478',
                    credential: 'Abhi',
                    username: 'Abhi'
                }]
            };

            yourConn = new webkitRTCPeerConnection(configuration);

            //when a remote user adds stream to the peer connection, we display it 
            yourConn.onaddstream = function(e) {
                remoteVideo.srcObject = (e.stream);
                $('#callBtn').prop('disabled', true);
            };

            // Setup ice handling 
            yourConn.onicecandidate = function(event) {

                if (event.candidate) {
                    insertLocalCandidate(name, event.candidate);
                    if (otherconn)
                        insertRemoteCandidate(otherconn, event.candidate);
                }

            };

            //getting local video stream 
            navigator.webkitGetUserMedia({ video: true, audio: false }, function(myStream) {
                stream = myStream;

                //displaying local video stream on the page 
                localVideo.srcObject = myStream;
                //localVideo.src = window.URL.createObjectURL(stream);
                //localVideo.play();

                // setup stream listening 
                if (stream)
                    yourConn.addStream(stream);


            }, function(error) {
                alert('something went wrong !!');
            });

        } else {
            alert("Your browser does not support video streaming !!");
        }

    }

    //----------------------------------------------------------------------------------------------

    // when we got an ice candidate from a remote user 
    function handleCandidate(candidate) {

        yourConn.addIceCandidate(new RTCIceCandidate({
            sdpMLineIndex: candidate.sdpMLineIndex,
            candidate: candidate.candidate,
            sdpMid: candidate.sdpMid
        }));
    };

    //----------------------------------------------------------------------------------------------

    //when somebody sends us an offer 
    function handleOffer(offer) {
        yourConn.setRemoteDescription(new RTCSessionDescription(offer));

        //create an answer to an offer 
        yourConn.createAnswer(function(answer) {
            yourConn.setLocalDescription(answer);
            insertAnswer(name, answer.sdp);

        }, function(error) {
            alert("Error when creating an answer");
            $('#callBtn').prop('disabled', false);
        });
    };

    //----------------------------------------------------------------------------------------------
    //when we got an answer from a remote user 
    function handleAnswer(answer) {
        yourConn.setRemoteDescription(new RTCSessionDescription(answer));
    };

    //----------------------------------------------------------------------------------------------

    function error() {
        $("#login_page").show();
        $("#chat_room").hide();
        alert('something went wrong on our side');
    }

    //----------------------------------------------------------------------------------------------

    function send(data) {
        if (otherconn) {
            data.connecteduser = otherconn;
            data.user = name;
            conn.send(JSON.stringify(data));
        }
    }

    //----------------------------------------------------------------------------------------------

    $('#callBtn').click(function() {

        var name = $("#callToUsernameInput").val();
        if (name !== "") {
            $('#callBtn').prop('disabled', true);
            otherconn = name;
            // create an offer
            addRemoteListener(name);
            yourConn.createOffer(function(offer) {

                insertOffer(name, offer.sdp);
                yourConn.setLocalDescription(offer);

            }, function(error) {
                alert("Error when creating an offer");
                $('#callBtn').prop('disabled', false);
            });
        }

    });

    //---------------------------------------------------------------------------------------------

    $('#hangUpBtn').click(function() {
        if (otherconn) {
            leave(name, true);
            if (otherconn)
                leave(otherconn, true);
        }
    });

    function handleLeave() {
        otherconn = null;
        remoteVideo.src = null;

        yourConn.close();
        yourConn.onicecandidate = null;
        yourConn.onaddstream = null;
        conn.close();
        location.reload();
    };
    //----------------------------------------------------------------------------------------------
});