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
						'data-preference': brandlist[preference],
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
			containment: "body",
			helper: function() {
				const $clone = $(this).clone();
				$clone.css({
					width: "100px",
					height: "100px",
					backgroundSize: "cover",
					backgroundPosition: "center",
					borderRadius: "10px",
					boxShadow: "0 0 5px rgba(0,0,0,0.5)",
					zIndex: 9999
				});
				return $clone;
			}
		});

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

			// Cari dalam queue
			const $originalClient = $(`#clients_queue .client[data-client-id='${clientId}']`);

			if ($originalClient.length) {
				// Kalau client masih dalam queue, buang dari queue
				$originalClient.remove();
			} else {
				// Kalau client dari dalam kereta
				const $parentDropzone = ui.draggable.closest(".client-drop");
				
				// Kosongkan dropzone dan tambah balik teks asal
				$parentDropzone.empty().html("Drop client here");
			}

			// Update bilangan client dalam queue
			$("#client_in_queue").html($("#clients_queue").children().length);

			// Aktifkan client baru dalam queue
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
					<div class="client-drop" data-brand="${brand}">
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

function setupClientDropzones() {
	$(".client-drop").droppable({
		accept: function(draggable) {
			const clientPreference = draggable.data("preference");
			const dropBrand = $(this).data("brand");
			return clientPreference === dropBrand;
		},
		over: function(event, ui) {
			$(this).addClass("highlight-dropzone");
		},
		out: function(event, ui) {
			$(this).removeClass("highlight-dropzone");
		},
		drop: function(event, ui) {
			$(this).removeClass("highlight-dropzone");

			const $dropzone = $(this);
			const dropBrand = $dropzone.data("brand");
			const clientId = ui.draggable.data("client-id");

			// Check dari queue ke tak
			const fromQueue = $(`#clients_queue .client[data-client-id='${clientId}']`).length > 0;

			// Kalau dropzone dah ada client lain
			const $existingClient = $dropzone.children(".client");

			if ($existingClient.length > 0) {
				if (fromQueue) {
					// Client dari queue tak boleh drop kalau tempat dah ada orang
					ui.draggable.draggable("option", "revert", true);
					return;
				}

				// === SWAP ===

				// Cari dropzone asal client yang sedang ditarik
				const $sourceDropzone = ui.draggable.closest(".client-drop");

				// Swap antara dua dropzone
				$sourceDropzone.empty().append($existingClient);
				$dropzone.empty().append(ui.draggable);

				// Reset gaya dua-dua client
				[$existingClient, ui.draggable].forEach($client => {
					$client
						.addClass("draggable")
						.css({
							position: "static",
							width: "100%",
							height: "100%",
							backgroundSize: "cover",
							backgroundPosition: "center"
						})
						.find("span").css({
							fontSize: "0.8rem",
							color: "#fff",
							textAlign: "center"
						});

					$client.draggable({
						revert: "invalid",
						helper: "clone",
						containment: "body"
					});
				});

				return;
			}

			// === NORMAL DROP (tempat kosong) ===

			// Ambil dari queue atau kereta
			let $client = $(`#clients_queue .client[data-client-id='${clientId}']`);
			if ($client.length === 0) {
				$client = ui.draggable;
			}

			// Kosongkan dropzone lama kalau bukan dari queue
			const $oldDropzone = $client.closest(".client-drop");
			if (!fromQueue && !$oldDropzone.is($dropzone)) {
				$oldDropzone.empty().text("Drop client here");
			}

			$client.find(".preference").remove();

			$client
				.addClass("draggable")
				.css({
					position: "static",
					width: "100%",
					height: "100%",
					backgroundSize: "cover",
					backgroundPosition: "center"
				})
				.find("span").css({
					fontSize: "0.8rem",
					color: "#fff",
					textAlign: "center"
				});

			$dropzone.empty().append($client);

			$client.draggable({
				revert: "invalid",
				helper: "clone",
				containment: "body"
			});

			// Kalau dari queue, buang dari queue
			if (fromQueue) {
				// Cari semula client asal dalam queue dan buang dia dari situ
				const $queuedClient = $(`#clients_queue .client[data-client-id='${clientId}']`);
				$queuedClient.remove();

				$("#client_in_queue").html($("#clients_queue").children().length);
				updateDraggableQueue();
			}
		}
	});
}

$("document").ready(function(e) {
	let clientServed, carsSold, amount;

	$("#clients_served").html(clientServed);
	$("#cars_sold").html(carsSold);
	$("#amount").html(amount);

	newClient();
	exit();
	generateCars();
	setupClientDropzones();
});
