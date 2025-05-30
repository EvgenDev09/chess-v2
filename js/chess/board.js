let chessSquares = $("#chess-squares");
let chessPieces = $("#chess-pieces");
let chessPromotion = $("#chess-promotion");
let chessEnding = $("#chess-ending");
let startingPosition = new ChessPosition();
let position = startingPosition.copyPosition();
let lastPiece = [-1, -1];
let promotionMove = [0, -1, -1, -1, -1];
let pieceElements = [];
let draggedIt = false;
let moveNumber = 0;
let computerActivated = [false, false];
let engines = [new DepthEngine(), new DepthEngine()];

let moveChanges = [];
// 0 - Move (piece, fromX, fromY, toX, toY)
// 1 - Destroy (piece)
// 2 - Promote (piece, newPiece)
// 3 - Check
let currentMoveChange = [];

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function getPieceClass(piece) {
	let pieceClasses = ["pawn", "knight", "bishop", "rook", "queen", "king"];
	return ((piece < 0) ? "dark" : "light") + "-" + pieceClasses[Math.abs(piece)-1];
}

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
		if (computerActivated[position.moveColor]) return;
		if (lastPiece[0] == row && lastPiece[1] == column)
			unhighlightDroppableSquares();
		else
			highlightDroppableSquares(row, column);
	}
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

	$(".chess-piece").draggable({
		containment: "parent",
		delay: 0,
		cursorAt: [0, 0],
		start: function(event, ui) {
			if (promotionMove[0] != 0) return false;
			let row = Math.round($(this).css("--row"));
			let column = Math.round($(this).css("--column"));
			if ((position.moveColor == 0) != (position.board[row][column] > 0)) return false;
			if (computerActivated[position.moveColor]) return false;
			highlightDroppableSquares(row, column);
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

	$(".chess-piece").on('click', function(event) {
		if (!("ontouchstart" in window))
			chessPieceClick(event);
	});
	$(".chess-piece").on('touchend', chessPieceClick);

	resizePieces();
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

function makeMove(fromX, fromY, toX, toY, piece=0) {
	currentMoveChange = [];
	currentMoveChange.push([0, pieceElements[fromX][fromY].index(), fromX, fromY, toX, toY]);

	pieceElements[fromX][fromY].css({"--row": toX, "--column": toY});
	if (pieceElements[toX][toY]) {
		pieceElements[toX][toY].css({"display": "none"});
	}
	if (Math.abs(position.board[fromX][fromY]) == 6) {
		if (toY - fromY == 2) {
			currentMoveChange.push([0, pieceElements[toX][7].index(), toX, 7, toX, 5]);
			pieceElements[toX][7].css({"--row": toX, "--column": 5});
			pieceElements[toX][5] = pieceElements[toX][7];
			pieceElements[toX][7] = null;
		}
		if (toY - fromY == -2) {
			currentMoveChange.push([0, pieceElements[toX][0].index(), toX, 0, toX, 3]);
			pieceElements[toX][0].css({"--row": toX, "--column": 3});
			pieceElements[toX][3] = pieceElements[toX][0];
			pieceElements[toX][0] = null;
		}
	}
	if (position.board[toX][toY] != 0) {
		currentMoveChange.push([1, pieceElements[toX][toY].index()]);
	}
	if ((position.board[fromX][fromY] == 1 && toX == 7) || (position.board[fromX][fromY] == -1 && toX == 0)) {
		promotionMove = [position.board[fromX][fromY], fromX, fromY, toX, toY];
		if (piece == 0) {
			$(`#chess-promotion-${(position.board[fromX][fromY] > 0) ? "white" : "black"}`).css({
				"display": "flex",
				"--column": toY
			});
		} else {
			makePromotion(piece);
		}
	} else {
		let moveStr = position.getMoveNotation(fromX, fromY, toX, toY);
		addMoveInfo(moveStr);
		position.makeMove(fromX, fromY, toX, toY);
		endMakingMove(fromX, fromY, toX, toY);
	}
}

function engineMakeMove() {
	let move = engines[position.moveColor].getBestMove(position);
	if (move.length == 3) makeMove(move[0][0], move[0][1], move[1][0], move[1][1], move[2]);
	else makeMove(move[0][0], move[0][1], move[1][0], move[1][1]);
}

function endMakingMove(fromX, fromY, toX, toY) {
	pieceElements[toX][toY] = pieceElements[fromX][fromY];
	pieceElements[fromX][fromY] = null;
	$(".chess-square").removeClass("chess-square-highlighted");
	$(".chess-square").eq((7-fromX)*8 + fromY).addClass("chess-square-highlighted");
	$(".chess-square").eq((7-toX)*8 + toY).addClass("chess-square-highlighted");
	if (fromY != toY && pieceElements[fromX][toY] && position.board[fromX][toY] == 0) {
		currentMoveChange.push([1, pieceElements[fromX][toY].index()]);
		pieceElements[fromX][toY].css({"display": "none"});
		pieceElements[fromX][toY] = null;
	}
	checkCheck();
	if (position.isCheckmated()) {
		endGame(position.moveColor*2-1, "Checkmate");
	} else if (position.isStalemated()) {
		endGame(0, "Stalemate");
	} else if (position.isThreefoldRepetition()) {
		endGame(0, "Threefold Repetition");
	} else if (position.hasNoSufficientMaterial()) {
		endGame(0, "Insufficient Material");
	} else if (position.is50MoveRule()) {
		endGame(0, "50-Move Rule");
	} else {
		if (computerActivated[position.moveColor]) {
			sleep(100).then(() => { engineMakeMove(); });
		 	//engineMakeMove();
		}
	}
} 

function makePromotion(piece) {
	$(`#chess-promotion-${(position.board[promotionMove[1]][promotionMove[2]] > 0) ? "white" : "black"}`).css({"display": "none"});
	let moveStr = position.getMoveNotation(promotionMove[1], promotionMove[2], promotionMove[3], promotionMove[4], piece);
	addMoveInfo(moveStr);
	currentMoveChange.push([2, pieceElements[promotionMove[1]][promotionMove[2]].index(), position.board[promotionMove[1]][promotionMove[2]], piece]);
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
	let movesContainer = $("#chess-info-moves-container");
	let isAtBottom = (movesContainer.scrollTop() + movesContainer.height() >= movesContainer.prop("scrollHeight"));
	movesContainer.append($(`<div class="chess-info-move">${moveStr}</div>`));
	if (isAtBottom) {
		movesContainer.scrollTop(movesContainer.prop("scrollHeight"));
	}
}

function checkCheck() {
	let color = 0;
	if (position.isChecked()) {
		color = 1 - position.moveColor*2;
	}
	setCheck(color);

	currentMoveChange.push([3, color]);
	let curMoveChange = [];
	currentMoveChange.forEach(move => {
		curMoveChange.push(move);
	});
	moveChanges.push(curMoveChange);
}

function setCheck(color) {
	if (color == 0) {
		$("#chess-check-square").css({
			"display": "none"
		});
	} else {
		let piece = ".chess-piece.dark-king";
		if (color > 0) {
			piece = ".chess-piece.light-king";
		}
		$("#chess-check-square").detach().prependTo(piece);
		$("#chess-check-square").css({
			"display": "block"
		});
	}
}

function endGame(side, reason) {
	let result = ((side == 0) ? "Draw" : ((side > 0) ? "White Won" : "Black Won"));
	$("#chess-info-process-text").text(result);
	$("#chess-ending-text").html(
		`Game Ended.<br>${reason}.<br>${result}.<br><br>Tap to see the board.`
	);
	$("#chess-ending").css({"pointer-events": "all"});
	$("#chess-ending").addClass("chess-ending-visible");
}

function boardStart() {
	for (let i=8-1; i>=0; i--) {
		for (let j=0; j<8; j++) {
			chessSquares.append($(`<div class="chess-square ${((i+j) % 2 == 0) ? "dark" : "light"}-square"></div>`));
		}
	}
	chessPieces.append($(`<div id="chess-check-square"></div>`));
	setPosition(startingPosition);
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
	
	chessEnding.append($(
		`<div id="chess-ending-text">Game Ended.<br><br>Tap to see the board.</div>`
	));
	chessEnding.on("click", function(event) {
		if ($(this).hasClass("chess-ending-visible")) {
			$(this).removeClass("chess-ending-visible");
		} else {
			$(this).addClass("chess-ending-visible");
		}
	})
	
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
	$("#chess-ending-text").css({
		"font-size": `${$(".chess-square").eq(0).width()/1.5}px`
	})
}

function activateComputerMode(color) {
	if (computerActivated[color]) {
		computerActivated[color] = false;
		$(`#chess-info-players .chess-info-player:nth-child(${color+1}) .chess-info-computer`).removeClass("chess-computer-activated");
	} else {
		computerActivated[color] = true;
		$(`#chess-info-players .chess-info-player:nth-child(${color+1}) .chess-info-computer`).addClass("chess-computer-activated");
		if (position.moveColor == color)
			engineMakeMove();
	}
}

$(`#chess-info-players .chess-info-player:nth-child(1) .chess-info-computer`).on("click", function(event) {activateComputerMode(0);});
$(`#chess-info-players .chess-info-player:nth-child(2) .chess-info-computer`).on("click", function(event) {activateComputerMode(1);});

$(`#chess-info-rotate-board`).on("click", function(event) {
	if ($(`#chess-board`).hasClass('chess-board-rotated'))
		$(`#chess-board`).removeClass('chess-board-rotated');
	else
		$(`#chess-board`).addClass('chess-board-rotated');
});

$(`#chess-info-rotate-pieces`).on("click", function(event) {
	if ($(`#chess-board`).hasClass('chess-board-rot-pieces-all')) {
		$(`#chess-board`).removeClass('chess-board-rot-pieces-all');
		$(`#chess-board`).addClass('chess-board-rot-pieces-opp');
	} else if ($(`#chess-board`).hasClass('chess-board-rot-pieces-opp'))
		$(`#chess-board`).removeClass('chess-board-rot-pieces-opp');
	else
		$(`#chess-board`).addClass('chess-board-rot-pieces-all');
});

$(`#chess-info-restart`).on("click", function(event) {
	$("#chess-info-moves-container").empty();
	$("#chess-pieces").empty();
	$("#chess-ending").removeClass("chess-ending-visible");
	position = startingPosition.copyPosition();
	setPosition(position);
	currentMoveChange = [];
	moveChanges = [];
	unhighlightDroppableSquares();
	$(".chess-square").removeClass("chess-square-highlighted");
	$("#chess-ending").css({"pointer-events": ""});
	$("#chess-info-process-text").text("Game in process...");
	moveNumber = 0;
	if (computerActivated[0])
		engineMakeMove();
});