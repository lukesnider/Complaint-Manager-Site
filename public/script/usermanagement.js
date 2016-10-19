var userGroup;
var userName;
var listeningFirebaseRefs = [];
var listeningFirebaseComplaintsRefs = [];

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

}




function userProfile(){


    var userId = firebase.auth().currentUser.uid;
    var userGroupRef = firebase.database().ref('Users/' + userId);
        userGroupRef.once('value', function(snapshot) {
            var data = snapshot.val();
            userGroup = data['userGroup'];
            userName = data['username'];
            getUsers(userGroup);

            $('#usergroup_header').text(userGroup);
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

function addLocation(key, location){
    var storeName = location.name+'';
    var complainthtml = '<li id="'+key+'"><a id="'+location.name+'" href="#'+location.name+'" onClick="getComplaintsByLocation(this.id)">'+location.name+'</a></li>';
    var dashboardhtml = '<li id="dashboard_'+key+'">'+location.name+'</li>';
       if (!$('#dashboard_'+key).length){
            $('#dashboard_location_list').append(dashboardhtml);
       }
       if (!$('#'+key).length){
            $('#complaints_location_list').append(complainthtml);
       }


}
function getLocations(userg){
    var userLocationsRef = firebase.database().ref('Groups/'+userg+'/Locations');

    userLocationsRef.on('child_added',function(data){
            var key = data.key;
            var location = data.val();
            addLocation(key,location);

    });

    listeningFirebaseRefs.push(userLocationsRef);

}



function getUsers(userg){
    var data =[];
    var usersRef = firebase.database().ref('Users/').orderByChild('userGroup').equalTo(userg);
    getLocations(userg);
    usersRef.on('child_added', function(data) {
        var key = data.key;

        if ($('#'+key).length){

        }else{
            var user = data.val();
            var html = "<li id='"+data.key+"'>"+user.username+"</li>";
            $('#user_list').append(html);
        }
    });
    
    usersRef.on('child_changed', function(data) {
        var user = data.val();
        var key = data.key;
        var html = "<li id='"+data.key+"'>"+user.username+"<br>Complaints: "+user.numberComplaints+"</li>";
        $('#'+key).fadeOut(400, function(){
            $(this).remove();
        });
        $('#user_list').append(html);
    });
    listeningFirebaseRefs.push(usersRef);
    
}   



//var currentUID;
function onAuthStateChanged(user) {

    if (user) {
        console.log("user state.");
        userProfile();


  } else {

  }
}
$(document).ready(main);
