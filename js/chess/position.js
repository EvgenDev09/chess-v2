class ChessPosition {
	board;
	moveColor = 0;
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
								if (j > 0 && this.board[i+1][j-1] < 0) {
									moves.push([[i, j], [i+1, j-1]]);
								}
								if (j < 7 && this.board[i+1][j+1] < 0) {
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
								if (j > 0 && this.board[i-1][j-1] > 0) {
									moves.push([[i, j], [i-1, j-1]]);
								}
								if (j < 7 && this.board[i-1][j+1] > 0) {
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

	copyPosition() {
		let newPosition = new ChessPosition();
		for (let i=0; i<8; i++) {
			for (let j=0; j<8; j++) {
				newPosition.board[i][j] = this.board[i][j];
			}
		}
		newPosition.moveColor = this.moveColor;
		return newPosition;
	}

	makeMove(fromX, fromY, toX, toY) {
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