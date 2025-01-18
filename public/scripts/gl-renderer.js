import {
  initProgram,
  initBuffer,
  getUniformLocations,
} from "/scripts/gl-utils.js";

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
  "u_tex1",
  "u_tex2",
  "u_tex3",
  "u_tex4",
];
/*
returns a promise that resolves when both the fragment shader
and vertex shader have been loaded and compiled.
*/
function init(canvas) {
  GL = canvas.getContext("webgl");
  let vs;
  let fs;
  return fetch("scripts/vertex.glsl")
    .then((res) => res.text())
    .then((text) => (vs = text))
    .then((_) => fetch("scripts/fragment.glsl"))
    .then((res) => res.text())
    .then((text) => (fs = text))
    .then((_) => {
      PROGRAM = initProgram(GL, vs, fs);
      UNIFORM_LOC = getUniformLocations(GL, PROGRAM, UNIFORM_NAMES);
    });
}

/*
loads the supplied spritesheets into webGL.
texInfo indicates the dimensions that sprites are packed into
the spritesheets with.
*/
function loadTextures(texList, texInfo) {}

/*
draws a playing card with the specified position and rotation.
faceLoc and backLoc specify which texture location to get the images from.
*/
function drawCard(pos, rot, faceLoc, backLoc) {}

/*
sets up the camera (orthographic projection matrix)
with the given window size. Window size varies based on the number of players
and therefore the number of cards we need to fit on screen.
*/
function setCamera(windowSize) {}

export { init, drawCard, setCamera, loadTextures };
