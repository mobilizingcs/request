$(function(){

	//hide buttons
	$("button, .statuslabel").hide();

	//initiate the client
	var oh = Ohmage("/app", "setup-request");
	var uuid;

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
			var first_name = userdata.first_name || "";
			var last_name = userdata.last_name || "";

			//test user privileges
			if(userdata.permissions.admin){
				//alert("You are admin, silly!");
			} 

			if(userdata.permissions.can_setup_users){
				alert("You have setup privileges!");
				//location.replace("/");
			}

			//Form defaults
			$("#form_name").val(first_name + " " + last_name);
			$("#form_org").val(userdata.organization);
			$("#form_email").val(userdata.email_address);

			//Load existing requests
			oh.request.read(username).done(function(data){
				var pending;
				$.each(data, function(key, reqdata){
					var tr = $("<tr />").appendTo("#requesttable");
					tr.append(td(reqdata.creation_time));
					tr.append(td(reqdata.user));
					tr.append(td(reqdata.email_address));
					tr.append(td(reqdata.type));
					tr.append(td(makelabel(reqdata.status)));
					if(reqdata.status == "pending"){
						uuid = key
						pending = reqdata;
						//tr.addClass("info")
					}
				});
				if(pending){
					populateForm(pending);
					$("#update_button").show();
				} else {
					$("#submit_button").show();
				}
			});
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
		}).done(function(){
			alert("Request updated!");
		})
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

	function populateForm(reqdata){
		$.each(reqdata.content.request, function(i, obj){
			var name = Object.keys(obj)[0];
			var val = obj[name];
			$("#form_" + name).val(val);
		});
		$("#form_email").val(reqdata.email_address);
		if(reqdata.status == "pending"){
			$("#pendinglabel").show();
		} 
		$("#" + reqdata.status + "label").show();
	}

	function validate(el){
		if(el.val()){
			return 
		} else {

		}
	}

	function contentfields(){
		var el = $("#contentfields input,#contentfields textarea");
		return $.map(el, function(field, i){
			var name = $(field).attr("id").substring(5);
			var out = {};
			out[name] = $(field).val()
			return out;
		});
	}

	function td(el){
		return $("<td />").append(el);
	}

	function makelabel(status){
		var label = $("<span />").addClass("label").text(status);
		if(status == "approved"){
			label.addClass("label-success");
		} else if(status == "rejected"){
			label.addClass("label-danger");
		} else {
			label.addClass("label-primary");
		}
		return label;
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
