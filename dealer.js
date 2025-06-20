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

	$("#clients_queue").append($client);
	
	setTimeout(function(){newClient();},time);
}

$("document").ready(function(e) {
	let clientServed, carsSold, amount, clientInQueue = 0;

	$("#clients_served").html(clientServed);

	newClient();
});
