let chessSquares = $("#chess-squares");
let chessPieces = $("#chess-pieces");
let position = new ChessPosition();

function setPosition(pos) {
	let pieceClasses = ["pawn", "knight", "bishop", "rook", "queen", "king"];
	for (let i=0; i<8; i++) {
		for (let j=0; j<8; j++) {
			if (pos.board[i][j] != 0) {
				let piece = $(`<div class="chess-piece ${(pos.board[i][j] < 0) ? "dark" : "light"}-${pieceClasses[Math.abs(pos.board[i][j])-1]}"></div>`);
				piece.css({"--row": i, "--column": j});
				chessPieces.append(piece);
			}
		}
	}
}

$(document).ready(function() {
	for (let i=8-1; i>=0; i--) {
		for (let j=0; j<8; j++) {
			chessSquares.append($(`<div class="chess-square ${((i+j) % 2 == 0) ? "dark" : "light"}-square"></div>`));
		}
	}
	setPosition(position);
});