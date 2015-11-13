$(function(){

	//hide buttons
	$("button, .statuslabel").hide();

    //initiate the client
    var oh = Ohmage("/app", "setup-request");
    var uuid;

    //debug
    window.oh = oh;

    //global error handler. In ohmage 200 means unauthenticated
    oh.callback("error", function(msg, code, req){
    	(code == 200) ? window.location.replace("/#login") : message("<strong>Error! </strong>" + msg);
    });

    //init app
    oh.user.whoami().done(function(username){

	    //prevent timeout
	    oh.keepalive();
	    $("#subtitle").text(username);

	    //user info
	    oh.user.read({user:username}).done(function(data){
	    	//prefill some form fields
	    	var userdata = data[username];
	    	$("#form_name").val(userdata.first_name + " " + userdata.last_name);
	    	$("#form_org").val(userdata.organization);

	    	//test user privileges
	    	if(userdata.permissions.admin){
	    		alert("You are admin, silly!");
	    	} 

	    	if(userdata.permissions.user_setup){
	    		alert("You have setup privileges!");
				location.replace("/");
			} else {
				oh.request.read(username).done(function(data){
					var keys = Object.keys(data)
					if(keys.length > 0){
						uuid = keys[0]
						var reqdata = data[uuid];
						var content = JSON.parse(reqdata.content)
						$.each(content.request, function(i, obj){
							var name = Object.keys(obj)[0];
							var val = obj[name];
							$("#form_" + name).val(val);
						});
						$("#form_email").val(reqdata.email_address);
						$("#update_button,#delete_button").show();
						if(reqdata.status == "pending"){
							$("#pendinglabel").show();
						} else if(reqdata.status = "rejected"){
							$("#rejectedlabel").show();
						}
					} else {
						$("#form_email").val(userdata.email_address);
						$("#submit_button").show();
					}
				});
			}
		});
	});

	$("#submit_button").click(function(e){
		e.preventDefault();
		var btn = $(this).attr("disabled", "disabled");
		var email = $("#form_email").val();
		var content = contentfields();
		oh.request.create(email, content).done(function(){
			window.location.reload();
		}).always(function(){
			btn.removeAttr("disabled");
		});
	});

	$("#update_button").click(function(e){
		e.preventDefault();	
		var btn = $(this).attr("disabled", "disabled");
		var email = $("#form_email").val();
		var content = contentfields();
		oh.request.update(uuid, email, content).always(function(){
			btn.removeAttr("disabled");
		});
	});

	$("#delete_button").click(function(e){
		e.preventDefault();
		var btn = $(this).attr("disabled", "disabled");
		oh.request.delete(uuid).done(function(){
			alert("Request deleted!");
			window.location.reload();
		}).always(function(){
			btn.removeAttr("disabled");
		});
	});		

	function contentfields(){
		var el = $("#contentfields input,#contentfields textarea");
		return $.map(el, function(field, i){
			var name = $(field).attr("id").substring(5);
			var out = {};
			out[name] = $(field).val()
			return out;
		});
	}

	function message(msg, type){
		// type must be one of success, info, warning, danger
		type = type || "danger"
		$("#errordiv").append('<div class="alert alert-' + type + '"><a href="#" class="close" data-dismiss="alert">&times;</a>' + msg + '</div>');
		$('html, body').animate({
			scrollTop: 100
		}, 200);
	}  
});
