class Engine {
	evaluatePosition(position) {
        throw new Error("Engine class cannot be instantiated directly.");
    }
    
	getBestMove(position) {
        throw new Error("Engine class cannot be instantiated directly.");
    }
}

class FirstMoveEngine extends Engine {
    evaluatePosition(position) {
        return 0.0;
    }
    
    getBestMove(position) {
        let moves = position.getPossibleMovesWithPromotion();
        return moves[0];
    }
}

function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}
class RandomMoveEngine extends Engine {
    evaluatePosition(position) {
        return 0.0;
    }
    
    getBestMove(position) {
        let moves = position.getPossibleMovesWithPromotion();
        return moves[getRandomInt(0, moves.length)];
    }
}

class GreedyEngine extends Engine {
    evaluatePosition(position) {
        if (position.isCheckmated()) {
            return Infinity*(position.moveColor*2-1);
        }
        if (position.isDraw()) {
            return 0.0;
        }
        let difference = 0.0;
        let pieceCost = [0.0, 1.0, 3.0, 3.0, 5.0, 9.0, 300.0];
        for (let i=0; i<8; i++) {
            for (let j=0; j<8; j++) {
                difference += pieceCost[Math.abs(position.board[i][j])] * (position.board[i][j] > 0 ? 1 : -1);
            }
        }
        return difference;
    }
    
    getBestMove(position) {
        let moves = position.getPossibleMovesWithPromotion();
        let bestMove = null;
        let bestScore = 0.0;
        moves.forEach(move => {
            let newPosition = position.copyPosition();
            if (move.length == 3) newPosition.makeMove(move[0][0], move[0][1], move[1][0], move[1][1], move[2]);
            else newPosition.makeMove(move[0][0], move[0][1], move[1][0], move[1][1]);
            let curScore = this.evaluatePosition(newPosition);
            if (bestMove == null || (bestScore - curScore) * (position.moveColor*2-1) >= 0.0) {
                bestMove = move;
                bestScore = curScore;
            }
        });
        return bestMove;
    }
}

class PositionalEngine extends Engine {
    evaluatePosition(position) {
        if (position.isCheckmated()) {
            return Infinity*(position.moveColor*2-1);
        }
        if (position.isDraw()) {
            return 0.0;
        }
        let pieceTables = [
            [
                [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
                [0.95, 0.95, 0.9, 1.0, 1.0, 0.9, 0.95, 0.95],
                [1.0, 1.0, 1.0, 0.9, 0.9, 1.0, 1.0, 1.0],
                [1.05, 1.05, 1.1, 1.2, 1.2, 1.1, 1.05, 1.05],
                [1.1, 1.1, 1.2, 1.4, 1.4, 1.2, 1.1, 1.1],
                [1.4, 1.4, 1.6, 1.75, 1.75, 1.6, 1.4, 1.4],
                [2.2, 2.3, 2.35, 2.35, 2.35, 2.3, 2.2],
                [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
            ],
            [
                [0.5, 0.6, 0.75, 0.75, 0.75, 0.75, 0.6, 0.5],
                [0.6, 0.8, 1.0, 1.02, 1.02, 1.0, 0.8, 0.6],
                [0.75, 1.05, 1.1, 1.15, 1.15, 1.1, 1.05, 0.75],
                [0.75, 1.05, 1.15, 1.24, 1.24, 1.15, 1.05, 0.75],
                [0.75, 1.05, 1.15, 1.24, 1.24, 1.15, 1.05, 0.75],
                [0.75, 1.05, 1.1, 1.15, 1.15, 1.1, 1.05, 0.75],
                [0.6, 0.8, 1.0, 1.05, 1.05, 1.0, 0.8, 0.6],
                [0.5, 0.6, 0.75, 0.75, 0.75, 0.75, 0.6, 0.5]
            ],
            [
                [0.8, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.8],
                [0.9, 1.05, 1.0, 1.0, 1.0, 1.0, 1.05, 0.9],
                [0.9, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 0.9],
                [0.9, 1.0, 1.1, 1.15, 1.15, 1.1, 1.0, 0.9],
                [0.9, 1.05, 1.05, 1.1, 1.1, 1.05, 1.05, 0.9],
                [0.9, 1.0, 1.05, 1.1, 1.1, 1.05, 1.0, 0.9],
                [0.9, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.9],
                [0.8, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.8]
            ],
            [
                [1.0, 1.0, 1.0, 1.05, 1.05, 1.0, 1.0, 1.0],
                [0.95, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.95],
                [0.95, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.95],
                [0.95, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.95],
                [0.95, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.95],
                [0.95, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.95],
                [1.08, 1.24, 1.24, 1.24, 1.24, 1.24, 1.24, 1.08],
                [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]
            ],
            [
                [0.8, 0.9, 0.9, 0.95, 0.95, 0.9, 0.9, 0.8],
                [0.9, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.9],
                [0.9, 1.0, 1.05, 1.05, 1.05, 1.05, 1.0, 0.9],
                [0.95, 1.0, 1.05, 1.1, 1.1, 1.05, 1.0, 0.95],
                [0.95, 1.0, 1.05, 1.1, 1.1, 1.05, 1.0, 0.95],
                [0.9, 1.0, 1.05, 1.05, 1.05, 1.05, 1.0, 0.9],
                [0.9, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.9],
                [0.8, 0.9, 0.9, 0.95, 0.95, 0.9, 0.9, 0.8]
            ],
            [
                [0.9, 1.0, 1.05, -0.1, 0.0, 0.2, 1.05, 0.9],
                [0.7, 0.6, 0.0, -0.5, -0.6, 0.0, 0.6, 0.7],
                [0.0, -0.2, -0.5, -0.9, -0.9, -0.5, -0.2, 0.0],
                [-0.5, -0.9, -1.3, -1.7, -1.7, -1.3, -0.9, -0.5],
                [-0.9, -1.3, -2.0, -2.0, -2.0, -2.0, -1.3, -0.9],
                [-1.3, -2.2, -2.2, -2.2, -2.2, -2.2, -2.2, -1.3],
                [-2.4, -2.4, -2.4, -2.4, -2.4, -2.4, -2.4, -2.4],
                [-3.0, -3.0, -3.0, -3.0, -3.0, -3.0, -3.0, -3.0]
            ],
            [
                [-0.5, -0.4, -0.3, -0.2, -0.2, -0.3, -0.4, -0.5],
                [-0.3, -0.2, -0.1, 0.0, 0.0, -0.1, -0.2, -0.3],
                [-0.3, -0.1, 0.2, 0.3, 0.3, 0.2, -0.1, -0.3],
                [-0.3, -0.1, 0.3, 0.4, 0.4, 0.3, -0.1, -0.3],
                [-0.3, -0.1, 0.3, 0.4, 0.4, 0.3, -0.1, -0.3],
                [-0.3, -0.1, 0.2, 0.3, 0.3, 0.2, -0.1, -0.3],
                [-0.3, -0.3, 0.0, 0.0, 0.0, 0.0, -0.3, -0.3],
                [-0.5, -0.3, -0.3, -0.3, -0.3, -0.3, -0.3, -0.5]
            ],
        ];
        let pieceSum = [0.0, 0.0];
        let pieceCost = [0.0, 1.0, 3.2, 3.3, 5.0, 9.0, 1.0];
        let difference = 0.0;
        for (let i=0; i<8; i++) {
            for (let j=0; j<8; j++) {
                pieceSum[position.board[i][j] > 0 ? 0 : 1] += pieceCost[Math.abs(position.board[i][j])];
            }
        }
        for (let i=0; i<8; i++) {
            for (let j=0; j<8; j++) {
                let piece = position.board[i][j];
                let pieceColor = (piece > 0 ? 1 : -1);
                let pieceI = (piece > 0 ? i : 7-i);
                if (Math.abs(piece) == 6) {
                    difference += pieceCost[6] * (pieceTables[5][pieceI][j] * pieceSum[1 - position.moveColor] + pieceTables[6][pieceI][j] * (43.0-pieceSum[1 - position.moveColor])) / 43.0 * pieceColor;
                } else if (piece != 0) {
                    difference += pieceCost[Math.abs(piece)] * pieceTables[Math.abs(piece)-1][pieceI][j] * pieceColor;
                }
            }
        }
        return difference;
    }
    
    getBestMove(position) {
        let moves = position.getPossibleMovesWithPromotion();
        let bestMove = null;
        let bestScore = 0.0;
        moves.forEach(move => {
            let newPosition = position.copyPosition();
            if (move.length == 3) newPosition.makeMove(move[0][0], move[0][1], move[1][0], move[1][1], move[2]);
            else newPosition.makeMove(move[0][0], move[0][1], move[1][0], move[1][1]);
            let curScore = this.evaluatePosition(newPosition);
            if (bestMove == null || (bestScore - curScore) * (position.moveColor*2-1) >= 0.0) {
                bestMove = move;
                bestScore = curScore;
            }
        });
        return bestMove;
    }
}

class DepthEngine extends PositionalEngine {
    evaluatePosition(position) {
        return super.evaluatePosition(position);
    }
    
    getBestMove(position) {
        let moves = position.getPossibleMovesWithPromotion();
        let bestMove = null;
        let bestScore = 0.0;
        moves.forEach(move => {
            let newPosition = position.copyPosition();
            if (move.length == 3) newPosition.makeMove(move[0][0], move[0][1], move[1][0], move[1][1], move[2]);
            else newPosition.makeMove(move[0][0], move[0][1], move[1][0], move[1][1]);
            let curScore = this.evaluatePositionInDepth(newPosition);
            if (bestMove == null || (bestScore - curScore) * (position.moveColor*2-1) >= 0.0) {
                bestMove = move;
                bestScore = curScore;
            }
        });
        return bestMove;
    }
    
    evaluatePositionInDepth(position, maxDepth=1) {
        if (maxDepth <= 0) return this.evaluatePosition(position);
        if (position.isCheckmated()) return Infinity*(position.moveColor*2-1);
        if (position.isDraw()) return 0.0;
        let moves = position.getPossibleMovesWithPromotion();
        let bestMove = null;
        let bestScore = 0.0;
        moves.forEach(move => {
            let newPosition = position.copyPosition();
            if (move.length == 3) newPosition.makeMove(move[0][0], move[0][1], move[1][0], move[1][1], move[2]);
            else newPosition.makeMove(move[0][0], move[0][1], move[1][0], move[1][1]);
            let curScore = this.evaluatePositionInDepth(newPosition, maxDepth-1);
            if (bestMove == null || (bestScore - curScore) * (position.moveColor*2-1) >= 0.0) {
                bestMove = move;
                bestScore = curScore;
            }
        });
        return bestScore;
    }
}