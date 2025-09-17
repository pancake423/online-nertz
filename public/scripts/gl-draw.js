import { initProgram, initBuffer, getUniformLocations } from "scripts/gl-utils.js";

import { mat3, mat4, quat, vec3 } from "gl-matrix/index.js";
import { CARD_W, CARD_H } from "scripts/card-renderer.js";

let GL;
let PROGRAM;
let UNIFORM_LOC;
let UNIFORM_NAMES = [
  "u_view_mat",
  "u_model_mat",
  "u_proj_mat",
  "u_model_normal",
  "u_front_tex_idx",
  "u_back_tex_idx",
  "u_x_scale",
  "u_y_scale",
  "u_tex1",
  "u_tex2",
  "u_tex3",
  "u_tex4",
];
/*
returns a promise that resolves when both the fragment shader
and vertex shader have been loaded and compiled.
*/
async function init(canvas) {
  GL = canvas.getContext("webgl2");
  GL.enable(GL.DEPTH_TEST);
  GL.depthFunc(GL.LEQUAL);
  GL.enable(GL.BLEND);
  GL.blendFunc(GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA);
  GL.clearColor(0, 0, 0, 0);
  GL.clearDepth(1);

  const w = CARD_W / CARD_H;
  const h = 1;
  const normalData = [
    [0, 0, -1],
    [0, 0, -1],
    [0, 0, -1],
    [0, 0, -1],
  ];
  const vertexData = [
    [-w / 2, -h / 2, 0],
    [w / 2, -h / 2, 0],
    [w / 2, h / 2, 0],
    [-w / 2, h / 2, 0],
  ];
  const uvData = [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
  ];

  let vs = await fetch("scripts/vertex.glsl").then((res) => res.text());
  let fs = await fetch("scripts/fragment.glsl").then((res) => res.text());

  PROGRAM = initProgram(GL, vs, fs);
  UNIFORM_LOC = getUniformLocations(GL, PROGRAM, UNIFORM_NAMES);
  // load data into buffers
  initBuffer(GL, PROGRAM, "a_pos", vertexData);
  initBuffer(GL, PROGRAM, "a_normal", normalData);
  initBuffer(GL, PROGRAM, "a_tex_coords", uvData);
}

/*
loads the supplied spritesheets into webGL.
texInfo indicates the dimensions that sprites are packed into
the spritesheets with.
*/
function loadTextures(texList, sheetDimensions) {
  /*
  needs to set uniforms:
  u_tex1
  u_tex2
  u_tex3
  u_tex4
  u_x_scale
  u_y_scale
  */
  // pad each sprite sheet into a power of two image
  // figure out the fraction of total u and v that each card takes up
  //
  const xScale = 1 / sheetDimensions[0];
  const yScale = 1 / sheetDimensions[1];
  GL.uniform1f(UNIFORM_LOC["u_x_scale"], xScale);
  GL.uniform1f(UNIFORM_LOC["u_y_scale"], yScale);

  for (let i = 0; i < texList.length; i++) {
    const [texUnit, uniformLoc] = getTexInfo(i);
    GL.activeTexture(texUnit);
    loadTexture(texList[i]);
    GL.uniform1i(uniformLoc, i);
  }
}

function getTexInfo(i) {
  switch (i) {
    case 0:
      return [GL.TEXTURE0, UNIFORM_LOC["u_tex1"]];
    case 1:
      return [GL.TEXTURE1, UNIFORM_LOC["u_tex2"]];
    case 2:
      return [GL.TEXTURE2, UNIFORM_LOC["u_tex3"]];
    case 3:
      return [GL.TEXTURE3, UNIFORM_LOC["u_tex4"]];
  }
}

function loadTexture(image) {
  const texture = GL.createTexture();
  GL.bindTexture(GL.TEXTURE_2D, texture);

  const level = 0;
  const internalFormat = GL.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = GL.RGBA;
  const srcType = GL.UNSIGNED_BYTE;
  GL.texImage2D(
    GL.TEXTURE_2D,
    level,
    internalFormat,
    srcFormat,
    srcType,
    image,
  );
  GL.generateMipmap(GL.TEXTURE_2D);
  GL.texParameteri(
    GL.TEXTURE_2D,
    GL.TEXTURE_MIN_FILTER,
    GL.LINEAR_MIPMAP_LINEAR,
  );
  return texture;
}

/*
draws a playing card with the specified position and rotation.
rotation is applied about the origin.
faceLoc and backLoc specify which texture location to get the images from.

TODO: consider refactoring, making a separate drawCard that accepts a pre-computed transformation matrix?
in case this isn't sufficient for more complex cases down the line
*/
function drawCard(pos, rot, origin, faceLoc, backLoc) {
  /*
  needs to set uniforms:
  u_model_mat
  u_model_normal
  u_front_tex_idx
  u_back_tex_idx
  */
  const q = quat.fromEuler(quat.create(), ...rot);
  let modelMat = mat4.fromRotationTranslationScaleOrigin(
    mat4.create(),
    q,
    pos,
    [1, 1, 1],
    origin,
  );
  let modelNormal = mat3.normalFromMat4(mat3.create(), modelMat);

  GL.uniform3fv(UNIFORM_LOC["u_front_tex_idx"], faceLoc);
  GL.uniform3fv(UNIFORM_LOC["u_back_tex_idx"], backLoc);
  GL.uniformMatrix3fv(UNIFORM_LOC["u_model_normal"], false, modelNormal);
  GL.uniformMatrix4fv(UNIFORM_LOC["u_model_mat"], false, modelMat);

  GL.drawArrays(GL.TRIANGLE_FAN, 0, 4);
}

function clear() {
  GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
}

/*
sets up the camera (orthographic projection matrix)
with the given window size. Window size varies based on the number of players
and therefore the number of cards we need to fit on screen.

windowSize is the number of cards tall that the playing area needs to be.
*/
function setCamera(fov, maxDepth) {
  /*
  needs to set uniforms:
  u_view_mat
  u_proj_mat
  */
  const viewMat = mat4.create();
  mat4.lookAt(viewMat, [0, 0, 0], [0, 0, 1], [0, 1, 0]);

  const projMat = mat4.perspective(mat4.create(), fov, 1, 1, maxDepth);

  GL.uniformMatrix4fv(UNIFORM_LOC["u_view_mat"], false, viewMat);
  GL.uniformMatrix4fv(UNIFORM_LOC["u_proj_mat"], false, projMat);
}

function updateWindowSize() {
  GL.viewport(0, 0, GL.canvas.width, GL.canvas.height);
}

export { init, drawCard, setCamera, loadTextures, clear, updateWindowSize };
