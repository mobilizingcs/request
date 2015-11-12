$(function(){

    //initiate the client
    var oh = Ohmage("/app", "setup-request");
    var userdata;

    //global error handler. In ohmage 200 means unauthenticated
    oh.callback("error", function(msg, code, req){
        (code == 200) ? window.location.replace("/#login") : message("<strong>Error! </strong>" + msg);
    });

    oh.user.whoami().done(function(username){

	    //prevent timeout
	    oh.keepalive();

	    $("#subtitle").text(username);

	    //user info
	    oh.user.read({user:username}).done(function(data){
			userdata = data[username];
			$("#form_name").val(userdata.first_name + " " + userdata.last_name);
			$("#form_org").val(userdata.organization);
			$("#form_email").val(userdata.email_address);
		});
    });
});
