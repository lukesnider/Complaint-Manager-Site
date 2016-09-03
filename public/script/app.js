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



    $('#login_button').click(function(){
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
        window.location.href = 'index.html';

        }, function(error) {
        // An error happened.
        console.log('error logging out');
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
    var userComplaints = firebase.database().ref('Groups/' + userg +'/').orderByChild('dateTime');
    var complaints = [];


    userComplaints.on('child_added', function(data) {
        var key = data.key;

        if ($('#'+key).length){

        }else {
        var mydata = data.val();

        //complaints.push(mydata);
        formatComplaint(mydata,key);

        }

    });

    userComplaints.on('child_changed', function(data) {
        var mydata = data.val();
        var key = data.key;
        var updatedComplaint = mydata.complaint;
        $('#'+key).text(updatedComplaint);

    });

    userComplaints.on('child_removed', function(data) {
        $('#'+data.key).fadeOut(400, function(){
            $(this).remove();
        });
    });
    listeningFirebaseRefs.push(userComplaints);

}


function cleanupUi(){
    listeningFirebaseRefs.forEach(function(ref){
        ref.off();
    });
    listeningFirebaseRefs = [];
    $('#complaint-list').empty();
    console.log('ui cleanedup');
}

//var currentUID;
function onAuthStateChanged(user) {

    if (user) {
        userProfile();
        goHome();

  } else {

  }
}

//Convert complaint UNIX timestamp to simple date
function complaintDate(date){
    var d = new Date(date);
    var formattedD = d.toDateString();
    var timeDate = new Date(date*1000);
    var hours = timeDate.getHours();
    var minutes = timeDate.getMinutes();
    var formattedTime = hours+':'+minutes;

    return formattedD;
}
function formatComplaint(complaint,key){
    var resolutionNullText;
    if (complaint.resolution === null || complaint.resolution === ""){
        resolutionNullText = "Not yet resolved.";
    }else{
        resolutionNullText = complaint.resolution;
    }

            var html =
            '<div id="'+key+'">'+
                '<p id="dateTime">'+complaintDate(complaint.dateTime)+'</p>'+
                '<p id="name">'+complaint.name+'</p>'+
                '<p id="location">'+complaint.location+'</p>'+
                '<p id="complaint">'+complaint.complaint+'</p>'+
                '<p id="resolution">Resolution: '+resolutionNullText+'</p>'+ 
                '<p id="authorizedSig">Complaint taken by: '+complaint.authorizedSig+'</p>'+ 
                '<button id="'+key+'" onClick="replyClick_delete_complaint(this.id)">Remove</button>'+              
            '</div>';


            $('#complaint-list').append(html);
            //$('#'+key).fadeIn('slow');


}

function replyClick_delete_complaint(clicked_id){
    var ref = firebase.database().ref('Groups/' + userGroup);
    ref.child(clicked_id).remove();

}

function goHome(){
    redirectLink = 'home.html';
    if (window.location.pathname.indexOf('home.html') === -1){
        window.location.href = redirectLink;
    }
}



$(document).ready(main);


