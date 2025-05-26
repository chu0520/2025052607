let video;
let facemesh;
let handpose;
let predictions = [];
let handPredictions = [];
let circleColor = [255, 0, 0]; // 預設紅色
let circlePosition = [0, 0]; // 預設圓圈位置

function setup() {
  createCanvas(640, 480).position(
    (windowWidth - 640) / 2,
    (windowHeight - 480) / 2
  );
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  facemesh = ml5.facemesh(video, modelReady);
  facemesh.on('predict', results => {
    predictions = results;
  });

  handpose = ml5.handpose(video, modelReady);
  handpose.on('predict', results => {
    handPredictions = results;
  });
}

function modelReady() {
  console.log("Model Loaded!");
}

function draw() {
  image(video, 0, 0, width, height);

  if (predictions.length > 0) {
    const keypoints = predictions[0].scaledMesh;

    // 根據手勢改變圓圈的位置和顏色
    if (handPredictions.length > 0) {
      const hand = handPredictions[0];
      const gesture = detectGesture(hand);

      if (gesture === "scissors") {
        circlePosition = keypoints[13]; // 嘴巴
        circleColor = [255, 0, 0]; // 紅色
      } else if (gesture === "rock") {
        circlePosition = keypoints[10]; // 額頭
        circleColor = [0, 255, 0]; // 綠色
      } else if (gesture === "paper") {
        circlePosition = keypoints[159]; // 右眼
        circleColor = [128, 0, 128]; // 紫色
      }
    }

    // 畫圓圈
    const [x, y] = circlePosition;
    noFill();
    stroke(...circleColor);
    strokeWeight(4);
    ellipse(x, y, 100, 100);
  }
}

// 偵測手勢
function detectGesture(hand) {
  const landmarks = hand.landmarks;

  // 簡單的手勢判斷邏輯
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];

  const indexMiddleDist = dist(
    indexTip[0],
    indexTip[1],
    middleTip[0],
    middleTip[1]
  );

  if (indexMiddleDist > 50) {
    return "scissors"; // 剪刀
  } else if (
    dist(thumbTip[0], thumbTip[1], pinkyTip[0], pinkyTip[1]) < 50 &&
    dist(indexTip[0], indexTip[1], middleTip[0], middleTip[1]) < 50
  ) {
    return "rock"; // 石頭
  } else {
    return "paper"; // 布
  }
}