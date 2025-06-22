var brandlist = new Array("Porsche","Volkswagen","Audi","BMW");
let brands = {
		Porsche: { count: 4, price: 650000 },
		Volkswagen: { count: 6, price: 180000 },
		Audi: { count: 5, price: 300000 },
		BMW: { count: 3, price: 250000 }
	};

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

function generateCars() {
	for (let brand in brands) {
		let brandLower = brand.toLowerCase();
		let container = $(`.cars-list.${brandLower}`);

		for (let i = 1; i <= brands[brand].count; i++) {
			container.append(`
				<div class="car">
					<img src="./images/${brand}_${i}.jpg" alt="">
					<div class="client-drop">
						Drop client here
					</div>
				</div>
			`);
		}

		$(`#stock_${brandLower}`).text(brands[brand].count);
		$(`#price_${brandLower}`).text(
			brands[brand].price.toLocaleString("en-MY", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2
			})
		);
	}
}

$("document").ready(function(e) {
	let clientServed, carsSold, amount;

	$("#clients_served").html(clientServed);
	$("#cars_sold").html(carsSold);
	$("#amount").html(amount);

	newClient();
	exit();
	generateCars();
});
