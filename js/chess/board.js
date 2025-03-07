let mainContainer = $("#main");
let chessBoard = $("#chess-board");

function setBoardSize() {
  if (mainContainer.width() > mainContainer.height()) {
    chessBoard.width('auto');
    chessBoard.height('100%');
  } else {
    chessBoard.width('100%');
    chessBoard.height('auto');
  }
}

$(document).ready(setBoardSize);
$(window).on("resize", setBoardSize);