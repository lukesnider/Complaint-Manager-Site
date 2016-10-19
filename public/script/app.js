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

    $('.new_complaint').click(function(){
        newComplaintBox();
    });


}

function userProfile(){


    var userId = firebase.auth().currentUser.uid;
    var userGroupRef = firebase.database().ref('Users/' + userId);
        userGroupRef.once('value', function(snapshot) {
            var data = snapshot.val();
            userGroup = data['userGroup'];
            userName = data['username'];
            $('#usergroup_header').text(userGroup);
            getComplaintsByLocation('allComplaints');
            getUsers(userGroup);
            $('#username_header').text(userName);
            if(data['role'] >= 30){
                locationhtml = '<li id="add_new_location_link"><a href="#location" onClick="showAddLocationBox()">Add</a></li>';
                usermanagementhtml = '<li id="user_management_link"><a href="#usermanagementlink">Manage Users</a></li>';
                $('#dashboard_location_list').append(locationhtml);
                $('#nav_links').append(usermanagementhtml);
                
            }

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

function getComplaintsByLocation(location){


    
    var userComplaints;
    var userId = firebase.auth().currentUser.uid;
    if (location === 'allComplaints'){
        var userComplaints = firebase.database().ref('Groups/' + $('#usergroup_header').text()+'/Complaints').orderByChild('dateTime');

    }else{
        var userComplaints = firebase.database().ref('Groups/' + $('#usergroup_header').text()+'/Complaints').orderByChild('location').equalTo(location);

    }
    listeningFirebaseComplaintsRefs.forEach(function(ref) {
        ref.off();
    });
    listeningFirbaseComplaintsRefs = [];

    $('#resolved_complaint_list').empty();
    $('#unresolved_complaint_list').empty();
    $('.complaint_headers').fadeIn(400);

    userComplaints.on('child_added', function(data) {
        var key = data.key;
        if ($('#'+key).length){

        }else {
        var mydata = data.val();
        formatComplaint(mydata,key);

        }
        

    });

    userComplaints.on('child_changed', function(data) {

        var mydata = data.val();
        var key = data.key;
        var updatedComplaint = mydata.complaint;
        $('#'+key).fadeOut(400, function(){
            $('#'+key).remove();
            if (!$('#'+key).length){
                formatComplaint(mydata,key);


            }

        });



    });

    userComplaints.on('child_removed', function(data) {
        $('#'+data.key).fadeOut(400, function(){
            $(this).remove();
        });
    });
    listeningFirbaseComplaintsRefs.push(userComplaints);

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


function cleanupUi(){
    listeningFirebaseRefs.forEach(function(ref){
        ref.off();
    });
    listeningFirebaseRefs = [];
    listeningFirebaseComplaintsRefs.forEach(function(ref) {
        ref.off();
    });
    listeningFirbaseComplaintsRefs = [];
    
    $('#resolved_complaint_list').empty();
    $('#unresolved_complaint_list').empty();
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
   // console.log(formattedD);

    return formattedD;
}

function timeStampFormat(timestamp){
    var date =  new Date(timestamp);
 
    var isoString = date.toISOString();
    var begining = isoString.substring(0,11);
    var ending = isoString.substring(11,13);
    if (ending >12){
        return begining+(ending-12)+':00';
    }else{
        return begining+'0'+ending+':00';
    }
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
                '<p id="'+key+'_dateTime">'+complaintDate(complaint.dateTime)+'</p>'+
                '<p id="'+key+'_location">'+complaint.location+'</p>'+
                '<p id="'+key+'_complaintType">'+complaint.complaintType+'</p>'+
                '<p id="'+key+'_name">'+complaint.name+'</p>'+
                '<p id="'+key+'_complaint">'+complaint.complaint+'</p>'+
                '<p id="'+key+'_resolution">Resolution: '+resolutionNullText+'</p>'+ 
                '<p id="'+key+'_authorizedSig">Complaint taken by: '+complaint.authorizedSig+'</p>'+ 
                '<button class="delete_complaint_button" id="'+key+'" onClick="replyClick_delete_complaint(this.id)">Remove</button>'+ 
                '<button class="edit_complaint_button" id="'+key+'" onClick="showEditComplaintBox(this.id,('+complaint.isResolved+'),'+complaint.dateTime+')">Edit</button>'+             
            '</div>';

            if(complaint.isResolved){
                $('#resolved_complaint_list').append(html);
                $('#'+key).fadeIn(400);

            }
            if(!complaint.isResolved){
                $('#unresolved_complaint_list').append(html);
                $('#'+key).fadeIn(400);


            }


}

function replyClick_delete_complaint(clicked_id){
    var ref = firebase.database().ref('Groups/' + userGroup+'/Complaints');
    ref.child(clicked_id).remove();

}

function goHome(){
    redirectLink = 'home.html';
    if (window.location.pathname.indexOf('home.html') === -1){
        window.location.href = redirectLink;
    }
}

function newComplaintBox(){


    var html = 
        '<div class="new_complaint_box">'+

            '<div class="new_complaint_box_content">'+
            
                '<span class="new_complaint_close" onClick="close_new_complaint_box()">x</span>'+
                '<div class="new_complaint_form">'+
                    'Name (Customer contact info): <br>'+
                    '<input id="name" type"text" name"Name"><br><br>'+
                    'Location: <br>'+
                    '<select id="location_select"></select><br><br>'+
                    'Complaint: <br>'+
                    '<textarea id="complaint" type"text" name"complaint" cols="40" rows="5"></textarea><br><br>'+
                    '<input  id="isResolved" type="checkbox" name"isResolved">Complaint resolved<br><br>'+
                    'Resolution: <br>'+
                    '<textarea id="resolution" type"text" name"resolution" cols="40" rows="5"></textarea><br><br>'+
                    'Date and time: (Leave blank for current date and time)<br>'+
                    '<input id="dateInput" type="datetime-local" name"complaintDate" value="1991-10-11T11:11"><br><br>'+
                    'Complaint Type: <br>'+
                    '<select id="complaint_type_select">'+
                        '<option value="1">Food order mistake</option>'+
                        '<option value="2">Customer service complaint</option>'+
                        '<option value="3">Customer mistake</option>'+
                    
                    '</select><br><br>'+
                    'Authorized Signature: <br>'+
                    '<input id="authorizedSig" type="text" name"authorizedSig"><br><br>'+
                    '<button onClick="addNewComplaint()">Submit</button>'+
                '</div>'+
            '</div>'+
        
        '</div>';

    $('.new_complaint_container').append(html);
    var getLocationsRef = firebase.database().ref('Groups/'+$('#usergroup_header').text()+'/Locations');
    getLocationsRef.on('child_added',function(data){
        var mydata = data.val();
        var location = mydata.name;
        $('#location_select').append('<option>'+location+'</option>');

    });
    listeningFirebaseRefs.push(getLocationsRef);

}

function close_new_complaint_box(){
    $('.new_complaint_box').remove();
}

function addNewComplaint(){
    var currentDateTime = new Date();
    var dateTime = $('#dateInput').val().toString();
    var parsedDateTime = Date.parse(dateTime+':00');
    if (parsedDateTime ===687179460000){
        parsedDateTime = currentDateTime.getTime();
    }

    writeNewComplaint($('#name').val().toString(),$("#location_select option:selected").text(),$('#complaint').val().toString(),
    $('#resolution').val().toString(),parsedDateTime,$('#isResolved').is(':checked'),$('#complaint_type_select option:selected').text(),$('#authorizedSig').val().toString());

    $('.new_complaint_box').remove();
}

function writeNewComplaint(name,location,complaint,resolution,dateTime,isResolved,complaintType,authorizedSig) {
    var postData = {
        name: name,
        location: location,
        complaint: complaint,
        resolution: resolution,
        dateTime: dateTime,
        isResolved: isResolved,
        complaintType: complaintType,
        authorizedSig: authorizedSig,
        userId: firebase.auth().currentUser.uid
  };
  firebase.database().ref('Groups/'+$('#usergroup_header').text()+'/Complaints').push(postData);
}

function showEditComplaintBox(key,isResolved, timestamp){
    var name = $('#'+key+'_name').text();
    var currentLocation = $('#'+key+'_location').text();
    var complaint = $('#'+key+'_complaint').text();
    var isChecked = "checked";
    if(isResolved === false){
        var isChecked = "";
    }  
     
    var res = $('#'+key+'_resolution').text();
    var resolution = res.replace('Resolution: ', '');
    var dateInput=timeStampFormat(timestamp);

    var Sig = $('#'+key+'_authorizedSig').text();
    var authorizedSig = Sig.replace('Complaint taken by: ','');
    var userId = firebase.auth().currentUser.uid;
    var html = 
        '<div class="edit_complaint_box">'+

            '<div class="edit_complaint_box_content">'+
            
                '<span class="edit_complaint_close" onClick="close_edit_complaint_box()">x</span>'+
                '<div class="edit_complaint_form">'+
                    'Name (Customer contact info): <br>'+
                    '<input id="edit_name" type"text" name"Name" value="'+name+'"><br><br>'+
                    'Location: <br>'+
                    '<select id="edit_location_select"><option>'+currentLocation+'</option></select><br><br>'+
                    'Complaint: <br>'+
                    '<textarea id="edit_complaint" type"text" name"complaint" cols="40" rows="5">'+complaint+'</textarea><br><br>'+
                    '<input  id="edit_isResolved" type="checkbox" name"isResolved" '+isChecked+'>Complaint resolved<br><br>'+
                    'Resolution: <br>'+
                    '<textarea id="edit_resolution" type"text" name"resolution" cols="40" rows="5">'+resolution+'</textarea><br><br>'+
                    'Date and time: (Leave blank for current date and time)<br>'+
                    '<input id="edit_dateInput" type="datetime-local" name"complaintDate" value="'+dateInput+'"><br><br>'+
                    'Complaint Type: <br>'+
                    '<select id="edit_complaint_type_select">'+
                        '<option value="1">Food order mistake</option>'+
                        '<option value="2">Customer service complaint</option>'+
                        '<option value="3">Customer mistake</option>'+
                    
                    '</select><br><br>'+
                    'Authorized Signature: <br>'+
                    '<input id="edit_authorizedSig" type="text" name"authorizedSig" value="'+authorizedSig+'"><br><br>'+
                    '<button id="'+key+'" onClick="editComplaint(this.id)">Save</button>'+
                '</div>'+
            '</div>'+
        
        '</div>';

    $('.edit_complaint_container').append(html);
    var getEditLocationsRef = firebase.database().ref('Groups/'+$('#usergroup_header').text()+'/Locations');
    getEditLocationsRef.on('child_added',function(data){
        var mydata = data.val();
        var location = mydata.name;
        if(location != currentLocation){
            $('#edit_location_select').append('<option>'+location+'</option>');

        }

    });
    var userComplaintTypeRef = firebase.database().ref('Groups/' + $('#usergroup_header').text()+'/Complaints/'+key);
    userComplaintTypeRef.once('value',function(data){
        var type = data.complaintType;

    });
    listeningFirebaseRefs.push(getEditLocationsRef);


}
function close_edit_complaint_box(){
    $('.edit_complaint_box').remove();
}
//Edit complaint function
function editComplaint(complaintKey){
    var dateTime = $('#edit_dateInput').val().toString();
    var parsedDateTime = Date.parse(dateTime+':00');
    var postData = {
        name: $('#edit_name').val().toString(),
        location: $("#edit_location_select option:selected").text(),
        complaint: $('#edit_complaint').val().toString(),
        resolution: $('#edit_resolution').val().toString(),
        dateTime: parsedDateTime,
        isResolved: $('#edit_isResolved').is(':checked'),
        complaintType: $('#edit_complaint_type_select option:selected').text(),
        authorizedSig: $('#edit_authorizedSig').val().toString(),
        userId: firebase.auth().currentUser.uid
  };
  $('#'+complaintKey).remove();

  firebase.database().ref('Groups/'+$('#usergroup_header').text()+'/Complaints/'+complaintKey).set(postData);
      $('.edit_complaint_box').remove();



}

function showAddLocationBox(){
        var html = 
        '<div class="add_location_box">'+

            '<div class="add_location_box_content">'+
            
                '<span class="add_location_close" onClick="close_add_location_box()">x</span>'+
                '<div class="edit_complaint_form">'+
                    'Name: <br>'+
                    '<input id="location_name" type"text" name="Name"><br><br>'+
                    '<button id="add_location_button" onClick="addNewLocation()">Save</button>'+
                '</div>'+
            '</div>'+
        
        '</div>';

        $('.add_location_container').append(html);
}
function close_add_location_box(){
    $('.add_location_box').remove();
}
function addNewLocation(name){
    var name = $('#location_name').val().toString();
    var postData = {
        name: name
  };
  firebase.database().ref('Groups/'+$("#usergroup_header").text()+'/Locations').push(postData);
    $('.add_location_box').remove();

}
$(document).ready(main);


