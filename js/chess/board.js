let chessSquares = $("#chess-squares");
let chessPieces = $("#chess-pieces");
let chessPromotion = $("#chess-promotion");
let position = new ChessPosition();
let lastPiece = [-1, -1];
let promotionMove = [0, -1, -1, -1, -1];
let pieceElements = [];
let draggedIt = false;
let moveNumber = 0;

function getPieceClass(piece) {
	let pieceClasses = ["pawn", "knight", "bishop", "rook", "queen", "king"];
	return ((piece < 0) ? "dark" : "light") + "-" + pieceClasses[Math.abs(piece)-1];
}

function setPosition(pos) {
	pieceElements = [];
	for (let i=0; i<8; i++) {
		pieceElementsRow = [];
		for (let j=0; j<8; j++) {
			if (pos.board[i][j] != 0) {
				let piece = $(`<div class="chess-piece ${getPieceClass(pos.board[i][j])}"><div></div></div>`);
				piece.css({"--row": i, "--column": j});
				chessPieces.append(piece);
				pieceElementsRow.push(piece);
			} else {
				pieceElementsRow.push(null);
			}
		}
		pieceElements.push(pieceElementsRow);
	}
	checkCheck();
}

function unhighlightDroppableSquares() {
	$(".chess-square").removeClass("chess-square-droppable");
	$(".chess-square").removeClass("chess-square-highlighted-current");
	lastPiece = [-1, -1];
}

function highlightDroppableSquares(i, j) {
	unhighlightDroppableSquares();
	lastPiece = [i, j];
	let moves = position.getPossibleMoves();
	$(".chess-square").eq((7-i)*8 + j).addClass("chess-square-highlighted-current");
	moves.forEach(move => {
		if (move[0][0] == i && move[0][1] == j) {
			$(".chess-square").eq((7-move[1][0])*8 + move[1][1]).addClass("chess-square-droppable");
		}
	});
}

function makeMove(fromX, fromY, toX, toY) {
	pieceElements[fromX][fromY].css({"--row": toX, "--column": toY});
	if (pieceElements[toX][toY]) {
		pieceElements[toX][toY].css({"display": "none"});
	}
	if (Math.abs(position.board[toX][toY]) == 6) {
		if (toY - fromY == 2) {
			pieceElements[toX][7].css({"--row": toX, "--column": 5});
			pieceElements[toX][5] = pieceElements[toX][7];
			pieceElements[toX][7] = null;
		}
		if (toY - fromY == -2) {
			pieceElements[toX][0].css({"--row": toX, "--column": 3});
			pieceElements[toX][3] = pieceElements[toX][0];
			pieceElements[toX][0] = null;
		}
	}
	if ((position.board[fromX][fromY] == 1 && toX == 7) || (position.board[fromX][fromY] == -1 && toX == 0)) {
		promotionMove = [position.board[fromX][fromY], fromX, fromY, toX, toY];
		$(`#chess-promotion-${(position.board[fromX][fromY] > 0) ? "white" : "black"}`).css({
			"display": "flex",
			"--column": toY
		});
	} else {
		let moveStr = position.getMoveNotation(fromX, fromY, toX, toY);
		addMoveInfo(moveStr);
		position.makeMove(fromX, fromY, toX, toY);
		endMakingMove(fromX, fromY, toX, toY);
	}
}

function endMakingMove(fromX, fromY, toX, toY) {
	pieceElements[toX][toY] = pieceElements[fromX][fromY];
	pieceElements[fromX][fromY] = null;
	$(".chess-square").removeClass("chess-square-highlighted");
	$(".chess-square").eq((7-fromX)*8 + fromY).addClass("chess-square-highlighted");
	$(".chess-square").eq((7-toX)*8 + toY).addClass("chess-square-highlighted");
	checkCheck();
	if (fromY != toY && pieceElements[fromX][toY] && position.board[fromX][toY] == 0) {
		pieceElements[fromX][toY].css({"display": "none"});
		pieceElements[fromX][toY] = null;
	}
} 

function makePromotion(piece) {
	$(`#chess-promotion-${(position.board[promotionMove[1]][promotionMove[2]] > 0) ? "white" : "black"}`).css({"display": "none"});
	let moveStr = position.getMoveNotation(promotionMove[1], promotionMove[2], promotionMove[3], promotionMove[4], piece);
	addMoveInfo(moveStr);
	pieceElements[promotionMove[1]][promotionMove[2]].removeClass(
		getPieceClass(position.board[promotionMove[1]][promotionMove[2]])
	);
	position.makeMove(promotionMove[1], promotionMove[2], promotionMove[3], promotionMove[4], piece);
	pieceElements[promotionMove[1]][promotionMove[2]].addClass(
		getPieceClass(piece)
	);
	endMakingMove(promotionMove[1], promotionMove[2], promotionMove[3], promotionMove[4]);
	promotionMove = [0, -1, -1, -1, -1];
}

function cancelPromotion() {
	$(`#chess-promotion-${(position.board[promotionMove[1]][promotionMove[2]] > 0) ? "white" : "black"}`).css({"display": "none"});
	pieceElements[promotionMove[1]][promotionMove[2]].css({"--row": promotionMove[1], "--column": promotionMove[2]});
	if (pieceElements[promotionMove[3]][promotionMove[4]]) {
		pieceElements[promotionMove[3]][promotionMove[4]].css({"display": ""});
	}
	promotionMove = [0, -1, -1, -1, -1];
}

function addMoveInfo(move) {
	let moveStr = move;
	if (moveNumber % 2 == 0) {
		moveStr = `${Math.round(moveNumber / 2) + 1}. ${moveStr}`;
	}
	moveNumber += 1;
	$("#chess-info-moves-container").append($(`<div class="chess-info-move">${moveStr}</div>`));
}

function checkCheck() {
	if (position.isChecked()) {
		let piece = ".chess-piece.dark-king";
		if (position.moveColor == 0) {
			piece = ".chess-piece.light-king";
		}
		$("#chess-check-square").detach().prependTo(piece);
		$("#chess-check-square").css({
			"display": "block"
		});
	} else {
		$("#chess-check-square").css({
			"display": "none"
		});
	}
}

function boardStart() {
	for (let i=8-1; i>=0; i--) {
		for (let j=0; j<8; j++) {
			chessSquares.append($(`<div class="chess-square ${((i+j) % 2 == 0) ? "dark" : "light"}-square"></div>`));
		}
	}
	chessPieces.append($(`<div id="chess-check-square"></div>`));
	setPosition(position);
	chessPromotion.append($(
		`<div id="chess-promotion-white">
			<div class="chess-promotion-piece chess-promotion-queen"></div>
			<div class="chess-promotion-piece chess-promotion-rook"></div>
			<div class="chess-promotion-piece chess-promotion-bishop"></div>
			<div class="chess-promotion-piece chess-promotion-knight"></div>
			<div class="chess-promotion-cancel"></div>
		</div>`
	));
	chessPromotion.append($(
		`<div id="chess-promotion-black">
			<div class="chess-promotion-piece chess-promotion-queen"></div>
			<div class="chess-promotion-piece chess-promotion-rook"></div>
			<div class="chess-promotion-piece chess-promotion-bishop"></div>
			<div class="chess-promotion-piece chess-promotion-knight"></div>
			<div class="chess-promotion-cancel"></div>
		</div>`
	));
	$("#chess-promotion-white .chess-promotion-piece").on("click", function(event) {
		makePromotion(5-$(this).index());
	});
	$("#chess-promotion-black .chess-promotion-piece").on("click", function(event) {
		makePromotion(-5+$(this).index());
	});
	$(".chess-promotion-cancel").on("click", function(event) {
		cancelPromotion();
	});

	$(".chess-piece").draggable({
		containment: "parent",
		delay: 0,
		cursorAt: [0, 0],
		start: function(event, ui) {
			if (promotionMove[0] != 0) return false;
			let row = Math.round($(this).css("--row"));
			let column = Math.round($(this).css("--column"));
			if ((position.moveColor == 0) != (position.board[row][column] > 0)) {
				unhighlightDroppableSquares();
			} else {
				highlightDroppableSquares(row, column);
			}
		},
		stop: function(event, ui) {
			$(this).css({"left": "", "top": ""});
		},
		revert: function(event) {
			if (!event) return true;
			if (promotionMove[0] != 0) return true;
			if ($(event).hasClass("chess-square-droppable")) {
				unhighlightDroppableSquares();
				let squareIndex = $(event).index();
				let row = Math.round($(this).css("--row"));
				let column = Math.round($(this).css("--column"));
				let toX = Math.floor(squareIndex / 8);
				let toY = squareIndex % 8;
				makeMove(row, column, 7-toX, toY);
				draggedIt = false;
				return false;
			}
			if ($(event).hasClass("chess-square-highlighted-current")) {
				if (draggedIt) {
					unhighlightDroppableSquares();
				}
				draggedIt = !draggedIt;
				return true;
			}
			draggedIt = true;
			return true;
		},
		revertDuration: 0,
		scope: "chess",
		stack: ".chess-piece"
	});

	function chessPieceClick(event) {
		if (promotionMove[0] != 0) return;
		let row = Math.round($(event.target).css("--row"));
		let column = Math.round($(event.target).css("--column"));
		if ((position.moveColor == 0) != (position.board[row][column] > 0)) {
			if ($(".chess-square").eq((7-row)*8 + column).hasClass("chess-square-droppable")) {
				makeMove(lastPiece[0], lastPiece[1], row, column);
			}
			unhighlightDroppableSquares();
		} else {
			if (lastPiece[0] == row && lastPiece[1] == column)
				unhighlightDroppableSquares();
			else
				highlightDroppableSquares(row, column);
		}
	}

	$(".chess-piece").on('click', function(event) {
		if (!("ontouchstart" in window))
			chessPieceClick(event);
	});
	$(".chess-piece").on('touchend', chessPieceClick);
	
	$(".chess-square").droppable({
		scope: "chess"
	});
	
	$(".chess-square").on('click', function(event) {
		if (promotionMove[0] != 0) return;
		if ($(this).hasClass("chess-square-droppable")) {
			let squareIndex = $(this).index();
			let toX = Math.floor(squareIndex / 8);
			let toY = squareIndex % 8;
			makeMove(lastPiece[0], lastPiece[1], 7-toX, toY);
			unhighlightDroppableSquares();
		}
	});
}

function resizePieces() {
	$(".chess-piece").each(function() {
		$(this).draggable("option", "cursorAt", {
			left: Math.floor($(this).width() / 2),
			top: Math.floor($(this).height() / 2)
		});
	});
	$("#chess-check-square").css({
		"box-shadow": `0px 0px ${$(".chess-square").eq(0).width()/Math.sqrt(8)}px ${$(".chess-square").eq(0).width()/Math.sqrt(8)}px red`
	});
}