let body = $("body");
let boardRadius = body.css("--board-radius");
let mainContainer = $("#main");
let chessContainer = $("#container");
let chessInfo = $("#chess-info");
let header = $("#header");
let footer = $("#footer");
let headerHeight = header.height();
let headerFont = header.css("font-size");
let footerFont = footer.css("font-size");
let chessGap1 = chessContainer.css("gap");
let chessGap2 = "20px";
let background = $("#background");
let bgGap1 = background.css("gap");
setChessGap();
let chessAspectRatio = chessContainer.width() / chessContainer.height();
setHeaderSize();

function setChessGap() {
	let chessChangeRatio = chessContainer.height() / 800;
	let chessGap = `calc(${mainContainer.hasClass("is-vertical") ? chessGap2 : chessGap1} * ${chessChangeRatio})`;
	let bgGap = `calc(${mainContainer.hasClass("is-vertical") ? "0" : bgGap1} * ${chessChangeRatio})`;
	chessContainer.css({"gap": chessGap});
	background.css({"gap": bgGap});
}

function setHeaderSize() {
	let windowRatio = $(window).height() / 950;
	header.height(`calc(${headerHeight}px * ${windowRatio})`);
	header.css({"font-size": `calc(${headerFont} * ${windowRatio})`});
	footer.height(`calc(${headerHeight}px * ${windowRatio})`);
	footer.css({"font-size": `calc(${footerFont} * ${windowRatio})`});
}

function setChessSize() {
	setHeaderSize();
	chessContainer.height('0');
	chessInfo.css({"--size-ratio": `0`});
	let mainAspectRatio = mainContainer.width() / mainContainer.height();
	if (mainAspectRatio < 4/5) {
		mainContainer.addClass("is-vertical");
		chessContainer.width('100%');
		chessContainer.height('100%');
		body.css({"--board-radius": "0"});
	} else {
		mainContainer.removeClass("is-vertical");
		chessContainer.width('');
		if (mainAspectRatio > chessAspectRatio) {
			chessContainer.height('100%');
		} else {
			chessContainer.height(`calc(100% * ${mainAspectRatio / chessAspectRatio})`);
		}
		body.css({"--board-radius": `calc(${boardRadius} * ${chessContainer.height() / 800})`});
		chessInfo.css({"--size-ratio": `${chessContainer.height() / 800}`});
	}
	setChessGap();
	resizePieces();
}

function recalculateStyle() {
	document.documentElement.className = 'reflow_' + (new Date()).getTime();
}

$(function() {
	boardStart();
	setChessSize();
	recalculateStyle();
	setChessSize();
});
$(window).on("resize", function() {
	setChessSize();
	recalculateStyle();
	setChessSize();
});