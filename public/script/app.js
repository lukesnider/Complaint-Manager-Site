var userGroup;
var userName;
var listeningFirebaseRefs = [];
var main = function(){
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyA92n5utpdG4yzejz6WGFwsJF3FDPUljWA",
    authDomain: "complaint-manager-ec3fd.firebaseapp.com",
    databaseURL: "https://complaint-manager-ec3fd.firebaseio.com",
    storageBucket: "complaint-manager-ec3fd.appspot.com",
  };
  firebase.initializeApp(config);
  firebase.auth().onAuthStateChanged(onAuthStateChanged);

    $('#create-button').click(function(){
        $('#name').toggle();
        return false;
    });

    $('#login-button').click(function(){
        firebase.auth().signInWithEmailAndPassword($('#email').val(), $('#password').val()).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(errorCode+". "+errorMessage);
            // ...
        });
        return false;
    });

    $('#logout-button').click(function(){
        firebase.auth().signOut().then(function() {
        // Sign-out successful.
        cleanupUi();
        goToIndex();

        }, function(error) {
        // An error happened.
        });
    });
    $('#complaint_link').click(function(){
        $('.dashboard').hide();
        $('.complaints').fadeIn('slow');
    });
    $('#dashboard_link').click(function(){
        $('.complaints').hide();
        $('.dashboard').fadeIn('slow');
    });
}

function userProfile(){


    var userId = firebase.auth().currentUser.uid;
    var userGroupRef = firebase.database().ref('Users/' + userId);
        userGroupRef.on('value', function(snapshot) {
            var data = snapshot.val();
            userGroup = data['userGroup'];
            userName = data['username'];
            $('#usergroup_header').text(userGroup);
            getComplaints(userGroup);
            $('#username_header').text(userName);
    });

    userGroupRef.on('child_added', function(data) {

    });

    userGroupRef.on('child_changed', function(data) {
    });

    userGroupRef.on('child_removed', function(data) {
    });
    listeningFirebaseRefs.push(userGroupRef);
}


function getComplaints(userg){
    var userId = firebase.auth().currentUser.uid;
    var userComplaints = firebase.database().ref('Groups/' + userg).orderByChild('dateTime');

    userComplaints.on('child_added', function _add(data) {
        var mydata = data.val();
        var key = data.key;
        formatComplaint(mydata);


    });

    userComplaints.on('child_changed', function(data) {
        var mydata = data.val();
        var key = data.key;
        var updatedComplaint = mydata.complaint;
        $('#'+key).text(updatedComplaint);

    });

    userComplaints.on('child_removed', function(data) {
    });
    listeningFirebaseRefs.push(userComplaints);

}

function goToHome(){
    //redirectLocation = "file:///C:/Users/luke9/Documents/GitHub/Complaint-Manager-Site/public/home.html";
    redirectLocation = "/home.html";
    if (window.location.href !== redirectLocation) {
            window.location.replace(redirectLocation);

    }
}
function goToIndex(){
    //redirectLocation = "file:///C:/Users/luke9/Documents/GitHub/Complaint-Manager-Site/public/index.html";
    redirectLocation = "/index.html";
    if (window.location.href !== redirectLocation) {
            window.location.replace(redirectLocation);
    }
}
function cleanupUi(){
    listeningFirebaseRefs.forEach(function(ref){
        ref.off();
    });
    listeningFirebaseRefs = [];
}

var currentUID;
function onAuthStateChanged(user) {
      if(user === currentUID){
          console.log('user id matches');
          return;
      }
    currentUID = firebase.auth().currentUser.uid;
    if (user) {
    // User is signed in.
        goToHome();
        userProfile();      
  } else {
    // No user is signed in.

  }
}

//Convert complaint UNIX timestamp to simple date
function complaintDate(date){
    var d = new Date(date);
    var formattedD = d.toDateString();
    return formattedD;
}
function formatComplaint(complaint){

    var html =
        '<div id="complaint_div">'+
            '<p id="dateTime">'+complaintDate(complaint.dateTime)+'</p>'+
            '<p id="name">'+complaint.name+'</p>'+
            '<p id="complaint">'+complaint.complaint+'</p>'+

        '</div>';


        $('#complaint-list').append(html);
}

$(document).ready(main);


