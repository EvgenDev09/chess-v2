class ChessPosition {
	board;
	moveColor = 0;
	move50 = 0;
	enPassant = -1;
	castling = [true, true, true, true];
	#possibleMoves = [];
	calculatedMoves = false;
	lastPositions;
	constructor() {
		this.board = [
			[4, 2, 3, 5, 6, 3, 2, 4],
			[1, 1, 1, 1, 1, 1, 1, 1],
			[0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0],
			[-1, -1, -1, -1, -1, -1, -1, -1],
			[-4, -2, -3, -5, -6, -3, -2, -4],
		]
		this.moveColor = 0;
		this.move50 = 0;
		this.enPassant = -1;
		this.castling = [true, true, true, true];
		this.#possibleMoves = [];
		this.calculatedMoves = false;
		this.lastPositions = new Map();
		this.lastPositions.set(this.getShortFEN(), 1);
	}

	#calculateAllMoves(color) {
		let moves = [];
		for (let i=0; i<8; i++) {
			for (let j=0; j<8; j++) {
				if (this.board[i][j] == 0) continue;
				if ((color == 0) != (this.board[i][j] > 0)) continue;
				switch (Math.abs(this.board[i][j])) {
					case 1:
						if (color == 0) {
							if (i < 7) {
								if (this.board[i+1][j] == 0) {
									moves.push([[i, j], [i+1, j]]);
									if (i == 1 && this.board[i+2][j] == 0) {
										moves.push([[i, j], [i+2, j]]);
									}
								}
								if (j > 0 && (this.board[i+1][j-1] < 0 || (this.enPassant == j-1 && i==4))) {
									moves.push([[i, j], [i+1, j-1]]);
								}
								if (j < 7 && (this.board[i+1][j+1] < 0 || (this.enPassant == j+1 && i==4))) {
									moves.push([[i, j], [i+1, j+1]]);
								}
							}
						} else {
							if (i > 0) {
								if (this.board[i-1][j] == 0) {
									moves.push([[i, j], [i-1, j]]);
									if (i == 6 && this.board[i-2][j] == 0) {
										moves.push([[i, j], [i-2, j]]);
									}
								}
								if (j > 0 && (this.board[i-1][j-1] > 0 || (this.enPassant == j-1 && i==3))) {
									moves.push([[i, j], [i-1, j-1]]);
								}
								if (j < 7 && (this.board[i-1][j+1] > 0 || (this.enPassant == j+1 && i==3))) {
									moves.push([[i, j], [i-1, j+1]]);
								}
							}
						}
						break;
					case 2:
						for (let x=1; x<=2; x++) {
							for (let y=-1; y<=1; y+=2) {
								for (let z=-1; z<=1; z+=2) {
									let i2 = i + x*y;
									let j2 = j + (3-x)*z;
									if (i2 < 0 || i2 >= 8) continue;
									if (j2 < 0 || j2 >= 8) continue;
									if (
										this.board[i2][j2] == 0 ||
										((color == 0) != (this.board[i2][j2] > 0))
									) moves.push([[i, j], [i2, j2]]);
								}
							}
						}
						break;
					case 3:
						for (let y=-1; y<=1; y+=2) {
							for (let z=-1; z<=1; z+=2) {
								for (let x=1; true; x++) {
									let i2 = i + x*y;
									let j2 = j + x*z;
									if (i2 < 0 || i2 >= 8) break;
									if (j2 < 0 || j2 >= 8) break;
									if (
										this.board[i2][j2] == 0 ||
										((color == 0) != (this.board[i2][j2] > 0))
									) moves.push([[i, j], [i2, j2]]);
									if (this.board[i2][j2] != 0) break;
								}
							}
						}
						break;
					case 4:
						for (let y=0; y<=1; y++) {
							for (let z=-1; z<=1; z+=2) {
								for (let x=1; true; x++) {
									let i2 = i + x*y*z;
									let j2 = j + x*(1-y)*z;
									if (i2 < 0 || i2 >= 8) break;
									if (j2 < 0 || j2 >= 8) break;
									if (
										this.board[i2][j2] == 0 ||
										((color == 0) != (this.board[i2][j2] > 0))
									) moves.push([[i, j], [i2, j2]]);
									if (this.board[i2][j2] != 0) break;
								}
							}
						}
						break;
					case 5:
						for (let y=-1; y<=1; y++) {
							for (let z=-1; z<=1; z++) {
								if (y == 0 && z == 0) continue;
								for (let x=1; true; x++) {
									let i2 = i + x*y;
									let j2 = j + x*z;
									if (i2 < 0 || i2 >= 8) break;
									if (j2 < 0 || j2 >= 8) break;
									if (
										this.board[i2][j2] == 0 ||
										((color == 0) != (this.board[i2][j2] > 0))
									) moves.push([[i, j], [i2, j2]]);
									if (this.board[i2][j2] != 0) break;
								}
							}
						}
						break;
					case 6:
						for (let y=-1; y<=1; y++) {
							for (let z=-1; z<=1; z++) {
								if (y == 0 && z == 0) continue;
								let i2 = i + y;
								let j2 = j + z;
								if (i2 < 0 || i2 >= 8) continue;
								if (j2 < 0 || j2 >= 8) continue;
								if (
									this.board[i2][j2] == 0 ||
									((color == 0) != (this.board[i2][j2] > 0))
								) moves.push([[i, j], [i2, j2]]);
							}
						}
						if (color == 0) {
							if (this.castling[0]) {
								if (this.board[0][5] == 0 && this.board[0][6] == 0) {
									this.board[0][5] = this.board[0][6] = 6;
									if (!this.#isChecked(color)) {
										moves.push([[i, j], [0, 6]]);
									}
									this.board[0][5] = this.board[0][6] = 0;
								}
							}
							if (this.castling[1]) {
								if (this.board[0][1] == 0 && this.board[0][2] == 0 && this.board[0][3] == 0) {
									this.board[0][2] = this.board[0][3] = 6;
									if (!this.#isChecked(color)) {
										moves.push([[i, j], [0, 2]]);
									}
									this.board[0][2] = this.board[0][3] = 0;
								}
							}
						} else {
							if (this.castling[2]) {
								if (this.board[7][5] == 0 && this.board[7][6] == 0) {
									this.board[7][5] = this.board[7][6] = -6;
									if (!this.#isChecked(color)) {
										moves.push([[i, j], [7, 6]]);
									}
									this.board[7][5] = this.board[7][6] = 0;
								}
							}
							if (this.castling[3]) {
								if (this.board[7][1] == 0 && this.board[7][2] == 0 && this.board[7][3] == 0) {
									this.board[7][2] = this.board[7][3] = -6;
									if (!this.#isChecked(color)) {
										moves.push([[i, j], [7, 2]]);
									}
									this.board[7][2] = this.board[7][3] = 0;
								}
							}
						}
						break;
				}
			}
		}
		return moves;
	}

	#isChecked(color) {
		let moves = this.#calculateAllMoves(1-color);
		return moves.some((move) => (this.board[move[1][0]][move[1][1]] == 6 * ((1-color)*2 - 1)));
	}

	getShortFEN() {
		let pieceChar = ["p", "n", "b", "r", "q", "k"];
		let fen = "";
		for (let i=8-1; i>=0; i--) {
			for (let j=0; j<8; j++) {
				if (this.board[i][j] == 0) {
					let space = 0;
					while (j<8 && this.board[i][j] == 0) {
						space++;
						j++;
					}
					j--;
					fen += space.toString();
				} else {
					if (this.board[i][j] > 0) {
						fen += pieceChar[this.board[i][j]-1].toUpperCase();
					} else {
						fen += pieceChar[-this.board[i][j]-1];
					}
				}
			}
			if (i > 0) fen += "/";
		}
		fen += ((this.moveColor == 0) ? " w " : " b ");
		let castlingChar = ["K", "Q", "k", "q"];
		let anyCastling = false;
		for (let i=0; i<4; i++) {
			if (this.castling[i]) {
				fen += castlingChar[i];
				anyCastling = true;
			}
		}
		if (!anyCastling) fen += "-";
		fen += " ";
		if (this.enPassant == -1) {
			fen += "-";
		} else {
			let fileStr = ["a", "b", "c", "d", "e", "f", "g", "h"];
			fen += fileStr[this.enPassant];
			fen += ((this.moveColor == 0) ? "6" : "3");
		}
		return fen;
	}

	isChecked() {
		return this.#isChecked(this.moveColor); 
	}

	hasLegalMoves() {
		return this.getPossibleMoves().length != 0;
	}

	isCheckmated() {
		return this.isChecked() && !this.hasLegalMoves();
	}

	isStalemated() {
		return !this.isChecked() && !this.hasLegalMoves();
	}

	isThreefoldRepetition() {
		let fen = this.getShortFEN();
		return this.lastPositions.has(fen) && this.lastPositions.get(fen) >= 3;
	}

	is50MoveRule() {
		return this.move50 >= 100;
	}

	hasNoSufficientMaterial() {
		let material = [0, 0, 0, 0];
		for (let i=0; i<8; i++) {
			for (let j=0; j<8; j++) {
				if (this.board[i][j] == 0 || Math.abs(this.board[i][j]) == 6) continue;
				if (this.board[i][j] == 2) material[0] += 1;
				else if (this.board[i][j] == 3) material[1] += 1;
				else if (this.board[i][j] == -2) material[2] += 1;
				else if (this.board[i][j] == -3) material[3] += 1;
				else return false;
			}
		}
		if (material[0] + material[1] <= 1 && material[2] + material[3] <= 1) return true;
		if (material[0] == 2 && material[1] + material[2] + material[3] == 0) return true;
		if (material[2] == 2 && material[1] + material[0] + material[3] == 0) return true;
		return false;
	}

	copyPosition() {
		let newPosition = new ChessPosition();
		for (let i=0; i<8; i++) {
			for (let j=0; j<8; j++) {
				newPosition.board[i][j] = this.board[i][j];
			}
		}
		newPosition.moveColor = this.moveColor;
		newPosition.move50 = this.move50;
		newPosition.enPassant = this.enPassant;
		for (let i=0; i<4; i++) {
			newPosition.castling[i] = this.castling[i];
		}
		newPosition.lastPositions = new Map(this.lastPositions);
		return newPosition;
	}

	makeMove(fromX, fromY, toX, toY, become=0) {
		this.move50++;
		if (Math.abs(this.board[fromX][fromY]) == 1 || this.board[toX][toY] != 0) {
			this.move50 = 0;
		}
		if (Math.abs(this.board[fromX][fromY]) == 1 && fromY != toY && this.board[toX][toY] == 0) {
			this.board[fromX][toY] = 0;
		}
		if (Math.abs(this.board[fromX][fromY]) == 1 && Math.abs(fromX - toX) == 2) {
			this.enPassant = fromY;
		} else {
			this.enPassant = -1;
		}
		if (this.board[fromX][fromY] == 4) {
			if (fromX == 0 && fromY == 7)
				this.castling[0] = false;
			if (fromX == 0 && fromY == 0)
				this.castling[1] = false;
		}
		if (this.board[fromX][fromY] == -4) {
			if (fromX == 7 && fromY == 7)
				this.castling[2] = false;
			if (fromX == 7 && fromY == 0)
				this.castling[3] = false;
		}
		if (this.board[fromX][fromY] == 6) {
			this.castling[0] = this.castling[1] = false;
			if (toY - fromY == 2) {
				this.board[toX][7] = 0;
				this.board[toX][5] = 4;
			}
			if (toY - fromY == -2) {
				this.board[toX][0] = 0;
				this.board[toX][3] = 4;
			}
		}
		if (this.board[fromX][fromY] == -6) {
			this.castling[2] = this.castling[3] = false;
			if (toY - fromY == 2) {
				this.board[toX][7] = 0;
				this.board[toX][5] = -4;
			}
			if (toY - fromY == -2) {
				this.board[toX][0] = 0;
				this.board[toX][3] = -4;
			}
		}
		this.board[toX][toY] = this.board[fromX][fromY];
		if (become != 0) {
			this.board[toX][toY] = become;
		}
		this.board[fromX][fromY] = 0;
		this.moveColor = (1 - this.moveColor);
		this.calculatedMoves = false;
		let fen = this.getShortFEN();
		if (this.lastPositions.has(fen)) {
			this.lastPositions.set(fen, this.lastPositions.get(fen)+1);
		} else {
			this.lastPositions.set(fen, 1);
		}
	}

	getMoveNotation(fromX, fromY, toX, toY, become=0) {
		if (Math.abs(this.board[fromX][fromY]) == 6) {
			if (toY - fromY == 2) return "0-0";
			if (toY - fromY == -2) return "0-0-0";
		}
		let pieceSymbols = ["", "♞", "♝", "♜", "♛", "♚"];
		let columnSymbols = ["a", "b", "c", "d", "e", "f", "g", "h"];
		let rowSymbols = ["1", "2", "3", "4", "5", "6", "7", "8"];
		let moveStr = pieceSymbols[Math.abs(this.board[fromX][fromY]) - 1];
		if (Math.abs(this.board[fromX][fromY]) == 1) {
			if (fromY != toY) {
				moveStr += columnSymbols[fromY] + "x" + columnSymbols[toY] + rowSymbols[toX];
			} else {
				moveStr += columnSymbols[toY] + rowSymbols[toX];
			}
		} else {
			let moves = this.#calculateAllMoves(this.moveColor);
			let hasOtherMoves = false, hasSameColumn = false, hasSameRow = false;
			for (let i=0; i<moves.length; i++) {
				if (toX != moves[i][1][0] || toY != moves[i][1][1]) continue;
				if (this.board[fromX][fromY] != this.board[moves[i][0][0]][moves[i][0][1]]) continue;
				if (fromX == moves[i][0][0] && fromY == moves[i][0][1]) continue;
				hasOtherMoves = true;
				if (fromX == moves[i][0][0]) hasSameRow = true;
				if (fromY == moves[i][0][1]) hasSameColumn = true;
				if (hasSameRow && hasSameColumn) break;
			}
			if (hasOtherMoves) {
				if (hasSameColumn) {
					if (hasSameRow) moveStr += columnSymbols[fromY];
					moveStr += rowSymbols[fromX];
				} else {
					moveStr += columnSymbols[fromY];
				}
			}
			if (this.board[toX][toY] != 0) {
				moveStr += "x";
			}
			moveStr += columnSymbols[toY] + rowSymbols[toX];
		}
		if (become != 0) {
			moveStr += "=" + pieceSymbols[Math.abs(become)-1];
		}
		let newPosition = this.copyPosition();
		newPosition.makeMove(fromX, fromY, toX, toY, become);
		if (newPosition.isChecked()) {
			if (newPosition.isCheckmated()) {
				moveStr += "#";
			} else {
				moveStr += "+";
			}
		}
		return moveStr;
	}

	getPossibleMoves() {
		if (this.calculatedMoves) return this.#possibleMoves;
		this.#possibleMoves = [];
		let movesOld = this.#calculateAllMoves(this.moveColor);
		movesOld.forEach(move => {
			let oldPiece = this.board[move[1][0]][move[1][1]];
			this.board[move[1][0]][move[1][1]] = this.board[move[0][0]][move[0][1]];
			this.board[move[0][0]][move[0][1]] = 0;
			if (!this.#isChecked(this.moveColor)) this.#possibleMoves.push(move);
			this.board[move[0][0]][move[0][1]] = this.board[move[1][0]][move[1][1]];
			this.board[move[1][0]][move[1][1]] = oldPiece;
		});
		this.calculatedMoves = true;
		return this.#possibleMoves;
	}
}