class ChessPosition {
	board;
	moveColor = 0;
	enPassant = -1;
	castling = [true, true, true, true];
	#possibleMoves = [];
	calculatedMoves = false;
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
		this.enPassant = -1;
		this.castling = [true, true, true, true];
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

	isChecked() {
		return this.#isChecked(this.moveColor); 
	}

	copyPosition() {
		let newPosition = new ChessPosition();
		for (let i=0; i<8; i++) {
			for (let j=0; j<8; j++) {
				newPosition.board[i][j] = this.board[i][j];
			}
		}
		newPosition.moveColor = this.moveColor;
		newPosition.enPassant = this.enPassant;
		for (let i=0; i<4; i++) {
			newPosition.castling[i] = this.castling[i];
		}
		return newPosition;
	}

	makeMove(fromX, fromY, toX, toY) {
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
		this.board[fromX][fromY] = 0;
		this.moveColor = (1 - this.moveColor);
		this.calculatedMoves = false;
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