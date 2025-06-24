var brandlist = ["Porsche", "Volkswagen", "Audi", "BMW"];
let brands = {
	Porsche: { count: 4, price: 650000 },
	Volkswagen: { count: 6, price: 180000 },
	Audi: { count: 5, price: 300000 },
	BMW: { count: 3, price: 250000 }
};

function newClient() {
	var preference = Math.floor(Math.random() * 4);
	var time = Math.floor(Math.random() * 10000) + 1;
	var client = Math.floor(Math.random() * 10) + 1;

	const $client = $('<div>', {
		class: `client client_${client} draggable`,
		'data-client-id': client,
		'data-preference': brandlist[preference]
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
			helper: function () {
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

	setTimeout(() => newClient(), time);
}

function updateDraggableQueue() {
	$("#clients_queue .client").draggable("disable");
	$("#clients_queue .client:first").draggable("enable");
}

function exit() {
	$("#exit").droppable({
		accept: ".client",
		over: function () {
			$(this).addClass("highlight-dropzone");
		},
		out: function () {
			$(this).removeClass("highlight-dropzone");
		},
		drop: function (event, ui) {
			$(this).removeClass("highlight-dropzone");
			const clientId = ui.draggable.data("client-id");

			const $originalClient = $(`#clients_queue .client[data-client-id='${clientId}']`);
			if ($originalClient.length) {
				$originalClient.remove();
			} else {
				const $parentDropzone = ui.draggable.closest(".client-drop");
				$parentDropzone.empty().html("Drop client here").removeClass("highlight-dropzone");
			}

			let clientsServed = parseInt($("#clients_served").text()) || 0;
			clientsServed++;
			$("#clients_served").text(clientsServed);

			$("#client_in_queue").html($("#clients_queue").children().length);
			updateDraggableQueue();
		}
	});
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

function makeCarsDraggableWithClientOnly() {
	$(".car").each(function () {
		const $car = $(this);
		const $client = $car.find(".client");

		if ($client.length > 0) {
			$car.draggable({
				revert: "invalid",
				helper: "clone",
				containment: "body"
			});
		} else {
			if ($car.hasClass("ui-draggable")) {
				$car.draggable("destroy");
			}
		}
	});
}

function setupClientDropzones() {
	$(".client-drop").droppable({
		accept: function (draggable) {
			const clientPreference = draggable.data("preference");
			const dropBrand = $(this).data("brand");

			if (clientPreference === dropBrand) return true;

			const totalCars = brands[clientPreference]?.count || 0;
			const emptySlots = $(`.client-drop[data-brand='${clientPreference}']`).filter(function () {
				return $(this).children(".client").length === 0;
			}).length;

			if (emptySlots === 0 || totalCars === 0) {
				return true;
			}
			return false;
		},
		over: function () {
			$(this).addClass("highlight-dropzone");
		},
		out: function () {
			$(this).removeClass("highlight-dropzone");
		},
		drop: function (event, ui) {
			$(this).removeClass("highlight-dropzone");

			const $dropzone = $(this);
			const dropBrand = $dropzone.data("brand");
			const clientId = ui.draggable.data("client-id");

			const fromQueue = $(`#clients_queue .client[data-client-id='${clientId}']`).length > 0;

			let $client = fromQueue
				? $(`#clients_queue .client[data-client-id='${clientId}']`)
				: ui.draggable;

			// Remove dari queue jika ada
			if (fromQueue) {
				$client.remove();
				$("#client_in_queue").html($("#clients_queue").children().length);
				updateDraggableQueue();
			}

			// Remove mana-mana client lain dalam dropzone
			$dropzone.find(".client").remove();

			// Remove mana-mana duplicate client dari tempat lain
			$(`.client-drop .client[data-client-id='${clientId}']`).each(function () {
				const $oldDropzone = $(this).closest('.client-drop');
				$(this).remove();
				$oldDropzone.html("Drop client here");
			});

			// Buang span preference
			$client.find(".preference").remove();

			// Styling & draggable semula
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

			// Letak dalam dropzone
			$dropzone.empty().append($client);

			makeCarsDraggableWithClientOnly();
		}
	});
}

function cashier() {
	$("#cashier").droppable({
		accept: ".car",
		over: function () {
			$(this).addClass("highlight-dropzone");
		},
		out: function () {
			$(this).removeClass("highlight-dropzone");
		},
		drop: function (event, ui) {
			$(this).removeClass("highlight-dropzone");

			const $car = ui.draggable;
			const $client = $car.find(".client");

			if ($client.length === 0) return;

			const $dropzone = $car.find(".client-drop");
			const brand = $dropzone.data("brand");
			const brandLower = brand.toLowerCase();

			if ($dropzone.length) {
				$dropzone.empty().html("Drop client here");
			}

			$car.remove();

			brands[brand].count--;
			$(`#stock_${brandLower}`).text(brands[brand].count);

			let clientsServed = parseInt($("#clients_served").text()) || 0;
			let carsSold = parseInt($("#cars_sold").text()) || 0;
			let amount = parseFloat($("#amount").text().replace(/,/g, "")) || 0;

			clientsServed++;
			carsSold++;
			amount += brands[brand].price;

			$("#clients_served").text(clientsServed);
			$("#cars_sold").text(carsSold);
			$("#amount").text(amount.toLocaleString("en-MY", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2
			}));
		}
	});
}

$(document).ready(function () {
	$("#clients_served").html("0");
	$("#cars_sold").html("0");
	$("#amount").html("0.00");

	newClient();
	exit();
	generateCars();
	setupClientDropzones();
	cashier();
});
