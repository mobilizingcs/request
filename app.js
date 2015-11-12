$(function(){

    //initiate the client
    var oh = Ohmage("/app", "setup-request");
    var userdata;

    //debug
    window.oh = oh;

    //global error handler. In ohmage 200 means unauthenticated
    oh.callback("error", function(msg, code, req){
        (code == 200) ? window.location.replace("/#login") : message("<strong>Error! </strong>" + msg);
    });

    //
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

			if(userdata.permissions.admin){
				
			}

			if(userdata.permissions.user_setup){
				alert("You have setup privileges!");
				//location.replace("/");
			}

			oh.request.read(username);


			//alert(JSON.stringify(userdata))
		});
    });

	function message(msg, type){
		// type must be one of success, info, warning, danger
		type = type || "danger"
		$("#errordiv").append('<div class="alert alert-' + type + '"><a href="#" class="close" data-dismiss="alert">&times;</a>' + msg + '</div>');
		$('html, body').animate({
			scrollTop: 100
		}, 200);
	}    
});
