let chessSquares = $("#chess-squares");
let chessPieces = $("#chess-pieces");
let position = new ChessPosition();
let lastPiece = [-1, -1];
let pieceElements = [];

function setPosition(pos) {
	let pieceClasses = ["pawn", "knight", "bishop", "rook", "queen", "king"];
	pieceElements = [];
	for (let i=0; i<8; i++) {
		pieceElementsRow = [];
		for (let j=0; j<8; j++) {
			if (pos.board[i][j] != 0) {
				let piece = $(`<div class="chess-piece ${(pos.board[i][j] < 0) ? "dark" : "light"}-${pieceClasses[Math.abs(pos.board[i][j])-1]}"></div>`);
				piece.css({"--row": i, "--column": j});
				chessPieces.append(piece);
				pieceElementsRow.push(piece);
			} else {
				pieceElementsRow.push(null);
			}
		}
		pieceElements.push(pieceElementsRow);
	}
}

function unhighlightDroppableSquares() {
	$(".chess-square").removeClass("chess-square-droppable");
	if (lastPiece[0] > -1)
		$(".chess-square").eq((7-lastPiece[0])*8 + lastPiece[1]).removeClass("chess-square-highlighted");
	lastPiece = [-1, -1];
}

function highlightDroppableSquares(i, j) {
	unhighlightDroppableSquares();
	lastPiece = [i, j];
	let moves = position.getPossibleMoves();
	$(".chess-square").eq((7-i)*8 + j).addClass("chess-square-highlighted");
	moves.forEach(move => {
		if (move[0][0] == i && move[0][1] == j) {
			$(".chess-square").eq((7-move[1][0])*8 + move[1][1]).addClass("chess-square-droppable");
		}
	});
}

function makeMove(fromX, fromY, toX, toY) {
	$(".chess-square").removeClass("chess-square-highlighted");
	$(".chess-square").eq((7-fromX)*8 + fromY).addClass("chess-square-highlighted");
	$(".chess-square").eq((7-toX)*8 + toY).addClass("chess-square-highlighted");
	position.makeMove(fromX, fromY, toX, toY);
	pieceElements[fromX][fromY].css({"left": "", "top": ""});
	pieceElements[fromX][fromY].css({"--row": toX, "--column": toY});
	if (pieceElements[toX][toY]) {
		pieceElements[toX][toY].css({"display": "none"});
	}
	pieceElements[toX][toY] = pieceElements[fromX][fromY];
	pieceElements[fromX][fromY] = null;
}

function boardStart() {
	for (let i=8-1; i>=0; i--) {
		for (let j=0; j<8; j++) {
			chessSquares.append($(`<div class="chess-square ${((i+j) % 2 == 0) ? "dark" : "light"}-square"></div>`));
		}
	}
	setPosition(position);

	$(".chess-piece").draggable({
		containment: "parent",
		delay: 0,
		start: function(event) {
			let row = Math.round($(this).css("--row"));
			let column = Math.round($(this).css("--column"));
			if ((position.moveColor == 0) != (position.board[row][column] > 0)) {
				unhighlightDroppableSquares();
			} else {
				highlightDroppableSquares(row, column);
			}
		},
		revert: function(event) {
			if (!event) return true;
			if ($(event).hasClass("chess-square-droppable")) {
				unhighlightDroppableSquares();
				let squareIndex = $(event).index();
				let row = Math.round($(this).css("--row"));
				let column = Math.round($(this).css("--column"));
				let toX = Math.floor(squareIndex / 8);
				let toY = squareIndex % 8;
				makeMove(row, column, 7-toX, toY);
				return false;
			}
			if ($(event).hasClass("chess-square-highlighted")) {
				unhighlightDroppableSquares();
				return true;
			}
			return true;
		},
		revertDuration: 0,
		scope: "chess",
		stack: ".chess-piece"
	});

	$(".chess-piece").on('click', function(event) {
		let row = Math.round($(this).css("--row"));
		let column = Math.round($(this).css("--column"));
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
	});
	
	$(".chess-square").droppable({
		scope: "chess"
	});
	
	$(".chess-square").on('click', function(event) {
		if ($(this).hasClass("chess-square-droppable")) {
			let squareIndex = $(this).index();
			let toX = Math.floor(squareIndex / 8);
			let toY = squareIndex % 8;
			makeMove(lastPiece[0], lastPiece[1], 7-toX, toY);
			unhighlightDroppableSquares();
		}
	});
}