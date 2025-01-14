const roomId = document.getElementById("room-id").value;
let startPoint = "";
let endPoint = "";
let movablePosition = [];
let startPointCheck = false;

$(".grid-item").click(function (event) {
    let element = event.target;
    if (element.tagName === "IMG") {
        element = element.parentNode;
    }
    const clickedSection = element.id;
    turnCheck(clickedSection);
});

function turnCheck(clickedSection) {
    $.ajax({
        url: "/rooms/" + roomId + "/positions/" + clickedSection + "/turn",
        contentType: "application/json",
        method: "GET",
        dataType: "json"
    }).done(function (turn) {
        if (startPoint === "") {
            getMovablePosition(clickedSection, turn);
        }
        if (startPoint !== "" && endPoint === "") {
            moveOrCancle(clickedSection);
        }
    }).error(function (response) {
        location.href = "/error-page/" + response.status;
    });
}

function getMovablePosition(clickedSection, turn) {
    if (turn) {
        $.ajax({
            url: "/rooms/" + roomId + "/positions/" + clickedSection + "/movable-positions",
            contentType: "application/json",
            method: "GET",
            dataType: "json"
        }).done(function (positions) {
            movablePosition = positions;
            showMovablePositions(clickedSection, positions);
            startPoint = clickedSection;
            startPointCheck = true;
        }).error(function (response) {
            location.href = "/error-page/" + response.status;
        });
    }
}

function showMovablePositions(clickedSection, positions) {
    const startPoint = document.getElementById(clickedSection);
    startPoint.classList.add("selected");
    const imgUrl = startPoint.children[0].src
    for (let i = 0; i < positions.length; i++) {
        const position = positions[i];
        const section = document.getElementById(position);
        section.style.backgroundImage = "url(" + imgUrl + ")";
        section.classList.add("movable");
    }
}

function moveOrCancle(clickedSection) {
    if (clickedSection === startPoint) {
        const point = document.getElementById(clickedSection);
        removeAllMovablePosition(point);
        startPoint = "";
        movablePosition = [];
    }
    if (clickedSection !== startPoint) {
        moveWhenCanGo(clickedSection);
    }
}

function removeAllMovablePosition(point) {
    point.classList.remove("selected");
    const movable = Array.prototype.slice.call(document.querySelectorAll(".movable"));
    movable.forEach(function (section) {
        section.classList.remove("movable");
        section.removeAttribute("style");
    });
}

function moveWhenCanGo(clickedSection) {
    if (movablePosition.includes(clickedSection)) {
        endPoint = clickedSection;
        move();
    }
}

function move() {
    $.ajax({
        url: "/rooms/" + roomId + "/piece/move",
        data: JSON.stringify({
            startPoint: startPoint,
            endPoint: endPoint
        }),
        contentType: "application/json",
        method: "POST",
        dataType: "json"
    }).done(function (currentStatus) {
        const start = document.getElementById(startPoint);
        const end = document.getElementById(endPoint);
        const image = start.children[0];
        if (end.hasChildNodes()) {
            end.removeChild(end.children[0]);
        }
        end.appendChild(image);
        removeAllMovablePosition(start);
        updateStatus(currentStatus);
        checkEndGame(currentStatus);
        initialize();
    }).error(function (response) {
        location.href = "/error-page/" + response.status;
    });
}

function updateStatus(currentStatus) {
    const blackScore = document.getElementById("black-score");
    const whiteScore = document.getElementById("white-score");
    const turn = document.getElementById("turn");

    blackScore.innerText = currentStatus.blackScore;
    whiteScore.innerText = currentStatus.whiteScore;
    turn.removeChild(turn.children[0]);
    if (currentStatus.turn === "BLACK") {
        turn.insertAdjacentHTML("beforeend", "<img src=\"../../img/black_turn.png\">");
    } else {
        turn.insertAdjacentHTML("beforeend", "<img src=\"../../img/white_turn.png\">");
    }
}

function checkEndGame(currentStatus) {
    if (!currentStatus.ends) {
        alert(currentStatus.winner + " WIN!!");
        gameInitialize(currentStatus.winner, currentStatus.loser);
    }
}

function gameInitialize(winner, loser) {
    $.ajax({
        url: "/rooms/" + roomId + "/end",
        data: JSON.stringify({
            winner: winner,
            loser: loser
        }),
        contentType: "application/json",
        method: "POST",
        dataType: "json"
    }).done(function (success) {
        if (success) {
            window.location.href = "/";
        }
    }).error(function (response) {
        location.href = "/error-page/" + response.status;
    });
}

function initialize() {
    startPoint = "";
    endPoint = "";
    startPointCheck = false;
    movablePosition = [];
}