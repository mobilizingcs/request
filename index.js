$(function(){
	//initiate the client
	var oh = Ohmage("/app", "setup-request");

	//global error handler. In ohmage 200 means unauthenticated
	oh.callback("error", function(msg, code, req){
		(code == 200) ? window.location.replace("/#login") : alert(msg);
	});

	//init app
	oh.user.whoami().done(function(username){
		oh.user.read().done(function(data){
			var userdata = data[username];
			if(userdata.permissions.admin){
				location.replace("admin.html");
			} else {
				location.replace("form.html");
			}
		});
	});
});
