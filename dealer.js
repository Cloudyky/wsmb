var brandlist = new Array("Porsche","Volkswagen","Audi","BMW");
var carList = [
	{ brand: "Porsche", stock: 4, price: 650000 },
	{ brand: "Volkswagen", stock: 6, price: 180000 },
	{ brand: "Audi", stock: 5, price: 300000 },
	{ brand: "BMW", stock: 3, price: 250000 }
];

function newClient(){
	var preference = Math.floor((Math.random()*4));
	var time = Math.floor((Math.random()*10000)+1);
	var client = Math.floor((Math.random()*10)+1);

	// $("#clients_queue").append('<div class="client client_'+client+' draggable"><span class="preference">Client for '+brandlist[preference]+'</span></div>');

	const $client = $('<div>', {
						class: `client client_${client} draggable`,
						'data-client-id': client,
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
			containment: "body",
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

function exit(){
	$("#exit").droppable({
		accept: ".client",
		over: function(event, ui) {
			$(this).addClass("highlight-dropzone");
		},
		out: function(event, ui) {
			$(this).removeClass("highlight-dropzone");
		},
		drop: function(event, ui) {
			$(this).removeClass("highlight-dropzone"); 
			const clientId = ui.draggable.data("client-id");

			// Cari client asal ikut ID dalam queue
			const $originalClient = $(`#clients_queue .client[data-client-id='${clientId}']`);

			// Padam client asal dari DOM
			$originalClient.remove();

			// Update bilangan client dalam queue
			$("#client_in_queue").html($("#clients_queue").children().length);

			// Aktifkan client baru untuk drag
			updateDraggableQueue();

			console.log("Client exited.");
		}
	})
}

$("document").ready(function(e) {
	let clientServed, carsSold, amount;

	$("#clients_served").html(clientServed);
	$("#cars_sold").html(carsSold);
	$("#amount").html(amount);

	newClient();
	exit();
});
