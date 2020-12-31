<!DOCTYPE html>
<html>

<head>
    <title>Webrtc</title>
    <style type="text/css">
        body {
            background: #eee;
            padding: 2% 0;
        }
        
        video {
            background: black;
            border: 1px solid gray;
        }
        
        #chat_room {
            position: relative;
            display: block;
            margin: 0 auto;
            width: 500px;
            height: 500px;
        }
        
        #localVideo {
            width: 150px;
            height: 150px;
            position: absolute;
            top: 15px;
            right: 15px;
        }
        
        #remoteVideo {
            width: 500px;
            height: 500px;
        }
    </style>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
</head>

<body>
    <div id="login_page">
        <center>
            <h3 style="margin-top: 100px;">Webrtc video chat</h3>
        </center>
        <center>
            <form action="index.php" method="POST">

                <input type="text" name="name" id="name" placeholder="Enter name" style="width: 30%;padding: 10px;margin: 10px;border-width: 2px;border-radius: 5px" /></br>

                <button type="button" id="join" style="width: 32%;padding: 10px;margin: 10px;background-color: #262;color: #ffffff;font-size: 15px;border-width: 2px;border-radius: 5px">join video chat !!</button></br>

            </form>
        </center>
    </div>

    <div id="chat_room" style="display: none;">
        <video id="localVideo" autoplay></video>
        <video id="remoteVideo" autoplay></video>

        <div>
            <div>
                <input id="callToUsernameInput" type="text" placeholder="username to call" />
                <button id="callBtn" style="background-color: #00ff00;">Call</button>
                <button id="hangUpBtn" style="background-color: #ff0000;">Hang Up</button>
            </div>
        </div>

    </div>

    <!-- The core Firebase JS SDK is always required and must be listed first -->
    <script src="https://www.gstatic.com/firebasejs/8.2.1/firebase-app.js"></script>

    <!-- TODO: Add SDKs for Firebase products that you want to use
     https://firebase.google.com/docs/web/setup#available-libraries -->
    <script src="https://www.gstatic.com/firebasejs/8.2.1/firebase-database.js"></script>

    <script>
        // Your web app's Firebase configuration
        var firebaseConfig = {
            apiKey: "AIzaSyDMRvSFE3r3Dr91K5V4Xru8lAqvKDStCQI",
            authDomain: "webrtc-d060b.firebaseapp.com",
            databaseURL: "https://webrtc-d060b.firebaseio.com",
            projectId: "webrtc-d060b",
            storageBucket: "webrtc-d060b.appspot.com",
            messagingSenderId: "964695950198",
            appId: "1:964695950198:web:fbd8d54c2d3d368801b057"
        };
        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
    </script>
    <script src="client2.js"></script>

</body>

</html>