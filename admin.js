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

	var table = $('#requesttable').DataTable({
		"dom" : '<"pull-right"l><"pull-left"f>tip',
		'bPaginate': false,
		"aoColumnDefs": [
			{ 'bSortable': false, 'aTargets': [  ] },
			{ 'bSearchable': false, 'aTargets': [  ] },
			{ 'bVisible' : false, 'aTargets' : [  ] } 				
		]
	});

	//expand table row
	$('#requesttable').on('click', "tbody td:not('.buttontd')", function () {
		var tr = $(this).parent()
		var row = table.row(tr);
		if(tr.attr("role") != "row") return;
		if ( row.child.isShown() ) {
			// This row is already open - close it
			row.child.hide();
			tr.removeClass('shown');
		} else {
			// Open this row
			row.child( expand(row.data(), tr.data("requestdata"))).show();
			tr.addClass('shown');
		}
	});	

	//init app
	oh.user.whoami().done(function(username){

		//prevent timeout
		oh.keepalive();

		//user info
		oh.user.read().done(function(data){
			//prefill some form fields
			var userdata = data[username];
			if(!userdata.permissions.admin){
				alert("You are not admin!");
				location.replace(".");
			}
		});

		//find outstanding requests
		oh.request.read().done(function(data){
			$.each(data, function(uuid, val){
				var tr = $("<tr />")
					.append(td(val["creation_time"]))
					.append(td(val["user"]))
					.append(td(val["email_address"]))
					.append(td(makelabel(val["status"])));

				tr.data("requestdata", JSON.parse(val.content).request);
				table.row.add(tr).draw(false);
			});
		});
	});

	function expand(classdata, requestdata) {
		var row = $('<div />').addClass('row').addClass("response-row");
		var col = $("<div />").addClass("col-md-12").appendTo(row);
		var ul = $("<ul />").appendTo(col)
		$.each(requestdata, function(i, obj){
			var name = Object.keys(obj)[0];
			var value = obj[name];
			row.append('<li class="list-unstyled"><b>' + name + ':</b> <i>' + value + '</i></li>');
		});
		return row;
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
