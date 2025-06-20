var brandlist = new Array("Porsche","Volkswagen","Audi","BMW");

function newClient(){
	var preference = Math.floor((Math.random()*4));
	var time = Math.floor((Math.random()*10000)+1);
	var client = Math.floor((Math.random()*10)+1);

	// $("#clients_queue").append('<div class="client client_'+client+' draggable"><span class="preference">Client for '+brandlist[preference]+'</span></div>');

	const $client = $('<div>', {
						class: `client client_${client} draggable`
					}).append(
						$('<span>', {
							class: 'preference',
							text: `Client for ${brandlist[preference]}`
						})
					);

	if ($("#clients_queue").children().length < 10) {
		$("#clients_queue").append($client);
		$("#client_in_queue").html($("#clients_queue").children().length);

		
		$(".draggable").draggable({
			revert: "invalid",
			helper: "clone",
		})

		updateDraggableQueue();
	}
	
	setTimeout(function(){newClient();},time);
}

function updateDraggableQueue() {
	// Disable semua dulu
	$("#clients_queue .client").draggable("disable");

	// Aktifkan yang pertama sahaja
	$("#clients_queue .client:first").draggable("enable");
}


$("document").ready(function(e) {
	let clientServed, carsSold, amount;

	$("#clients_served").html(clientServed);
	$("#cars_sold").html(carsSold);
	$("#amount").html(amount);

	newClient();

});
