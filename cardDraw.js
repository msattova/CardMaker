
const CardTypes = Object.freeze({
  kin: "kin",
  power: "power",
  relic: "relic",
  territory: "territory",
  fragment: "fragment"
});

const canvas_template = document.querySelector("#card-template");
const container = document.querySelector("#cards-container");
const canvas_base = canvas_template.content.firstElementChild;

const oneLineChar = 18;

const initValues = (canvas) => {

  canvas.style.width = `${canvas.width}px`;
  canvas.style.height = `${canvas.height}px`;

  const scale = window.devicePixelRatio;

  canvas.width = Math.floor(canvas.width * scale);
  canvas.height = Math.floor(canvas.height * scale);

  const width = canvas.width;
  const height = canvas.height;

  const textSize = {
    header: width * 0.11,
    normal: width * 0.05,
    small: width * 0.04,
  };

  return [width, height, textSize];
}

const initCanvas = (canvas_base, num, name) => {
  const canvas = canvas_base.cloneNode();
  canvas.setAttribute("id", `card-${num}`);
  canvas.setAttribute("data-cardname", name)
  container.appendChild(canvas);

  const ctx = canvas.getContext("2d");

  return ctx;
};

const baseLayout = (ctx) => {
  // カード枠
  ctx.beginPath();
  ctx.roundRect(0, 0, width, height, [20]);
  ctx.clip();

  // カード全面塗りつぶし&枠線
  ctx.fillStyle = "#eee";
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#333";
  ctx.fillRect(0, 0, width, height);
  ctx.stroke();

  // 効果テキスト枠
  ctx.lineWidth = 1;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.fillRect(width * 0.03, height * 0.18, width * 0.94, height - height * 0.25);
  ctx.strokeRect(
    width * 0.03,
    height * 0.18,
    width * 0.94,
    height - height * 0.25
  );

  // カード名枠
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.fillRect(0, 0, width, height * 0.1);

  // カード種類枠
  ctx.fillStyle = "#222";
  ctx.beginPath();
  ctx.roundRect(
    width * 0.02,
    height * 0.156,
    textSize.small * 7,
    textSize.small * 1.8,
    [10, 30]
  );
  ctx.fill();

  return ctx;
};

const makeDisplayText = (text) => {
  const textArr = (typeof text === "string") ? text.split(/\r?\n/) : text;
  const arrSlice = (str) => {
    const arr = Array.from(str);
    const len = Math.ceil(arr.length / oneLineChar);
    return new Array(len).fill().map((_, idx) => {
      return arr.slice(idx * oneLineChar, (idx+1)*oneLineChar).join("");
    });
  };
  return textArr.map(el => (el.length >= oneLineChar)? arrSlice(el) : el ).flat(Infinity);

}

const drawText = (text, ctx) => {
  const draw = (line, lineNum) => ctx.fillText(line, width * 0.06, height * 0.25 + (textSize.normal*1.2*lineNum), textSize.normal * oneLineChar);
  const displayText = makeDisplayText(text);
  displayText.forEach((el, idx) => {
    draw(el, idx);
  });

};

const baseComponents = (ctx, name, type, text) => {
  // カード名
  ctx.font = `${textSize.header}px serif`;
  ctx.textAlign = "center";
  ctx.fillStyle = "#dfdfdf";
  ctx.fillText(name, width / 2, height * 0.08, width - width * 0.08);

  // カード種類
  ctx.font = `bold ${textSize.small*1.1}px sans-serif`;
  ctx.textAlign = "center";
  ctx.fillStyle = "#fff";
  ctx.fillText(type, width * 0.16, height * 0.185, textSize.small * 7);

  // 効果
  ctx.font = `${textSize.normal}px serif`;
  ctx.textAlign = "left";
  ctx.fillStyle = "#222";
  drawText(text, ctx);
}

const drawPower = (ctx, power) => {
  //戦闘力描画
  ctx.font = `bold ${textSize.header}px sans-serif`;
  ctx.textAlign = "right";
  ctx.fillStyle = "#333";
  ctx.fillText(power, width * 0.95, height * 0.99, textSize.header * 6);
};

const makeCreature = (ctx, data) => {

  if (data.text == null){
    return;
  }

  baseComponents(ctx, data.name, "眷属", data.text);

  //種族
  ctx.font = `bold ${textSize.normal}px sans-serif`;
  ctx.textAlign = "center";
  ctx.fillStyle = "#333";
  ctx.fillText(data.race, width/2, height * 0.14, width*0.8);

  // 戦闘力
  drawPower(ctx, data.power);

};

const makeLeader = (ctx, data) => {

  if (data.text == null){
    return;
  }

  baseComponents(ctx, data.name, "真祖の断片", data.text);

  // 登場条件マーク背景
  ctx.lineWidth = 1;
  ctx.fillStyle = "#b11d2c";
  ctx.beginPath();
  ctx.fillRect(width * 0.05, height * 0.75, textSize.small*1.2*4, textSize.small*1.6);

  // 登場条件マーク
  ctx.font = `bold ${textSize.small}px sans-serif`;
  ctx.textAlign = "center";
  ctx.fillStyle = "#fff";
  ctx.fillText("登場条件", width * 0.15, height * 0.78, textSize.small*1.2 * 4);

  // 登場条件テキスト
  ctx.font = `bold ${textSize.normal}px serif`;
  ctx.textAlign = "left";
  ctx.fillStyle = "#000";
  const displayText = makeDisplayText(data.condition);
  displayText.forEach((el, idx) => {
    ctx.fillText(el, width * 0.06, height * 0.84 + textSize.normal*1.5*idx, textSize.normal * oneLineChar);
  });

  // 戦闘力
  drawPower(ctx, data.power);

};

const makeTerritory = (ctx, data) => {

  if (data.text == null){
    return;
  }

  baseComponents(ctx, data.name, "領地", data.text);

};

const makeRelic = (ctx, data) => {

  if (data.text == null){
    return;
  }

  baseComponents(ctx, data.name, "秘宝", data.text);

};

const makePower = (ctx, data) => {

  if (data.text == null){
    return;
  }

  baseComponents(ctx, data.name, "権能", data.text);

};

const makeCard = (num, data) => {
  let ctx = initCanvas(canvas_base, num, data.name);
  ctx = baseLayout(ctx);
  if (data.type === CardTypes.kin){
    makeCreature(ctx, data);
  } else if (data.type === CardTypes.power){
    makePower(ctx, data);
  } else if (data.type === CardTypes.relic){
    makeRelic(ctx, data);
  } else if (data.type === CardTypes.territory){
    makeTerritory(ctx, data);
  } else if (data.type === CardTypes.fragment){
    makeLeader(ctx, data);
  }
}

const [width, height, textSize] = initValues(canvas_base);

