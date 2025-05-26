let video;
let facemesh;
let handpose;
let predictions = [];
let handPredictions = [];
let gesture = ""; // 儲存辨識到的手勢

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
    detectGesture();
  });
}

function modelReady() {
  console.log("模型載入完成");
}

function draw() {
  image(video, 0, 0, width, height);

  if (predictions.length > 0) {
    const keypoints = predictions[0].scaledMesh;

    let x, y;
    if (gesture === "scissors") {
      // 剪刀：圓圈移動到額頭（第10點）
      [x, y] = keypoints[10];
    } else if (gesture === "rock") {
      // 石頭：圓圈移動到鼻子（第1點）
      [x, y] = keypoints[1];
    } else if (gesture === "paper") {
      // 布：圓圈移動到左臉頰（第234點）
      [x, y] = keypoints[234];
    } else {
      // 預設：圓圈移動到下巴（第152點）
      [x, y] = keypoints[152];
    }

    if (x && y) {
      // 繪製圓圈，增加顏色和大小的對比
      noFill();
      stroke(0, 255, 0); // 綠色圓圈
      strokeWeight(6); // 更粗的圓圈邊框
      ellipse(x, y, 50, 50); // 圓圈大小調整為 50
    }
  }
}

function detectGesture() {
  if (handPredictions.length > 0) {
    const annotations = handPredictions[0].annotations;
    const thumb = annotations.thumb;
    const indexFinger = annotations.indexFinger;

    if (indexFinger.length > 0 && thumb.length > 0) {
      const thumbTip = thumb[3];
      const indexTip = indexFinger[3];

      const distance = dist(
        thumbTip[0],
        thumbTip[1],
        indexTip[0],
        indexTip[1]
      );

      if (distance < 50) {
        gesture = "rock"; // 石頭
      } else {
        gesture = "scissors"; // 剪刀
      }
    }
  }
}
