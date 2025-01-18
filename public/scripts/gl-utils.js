function createShader(gl, type, source) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

function combineShaders(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

function initProgram(gl, vs, fs) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vs);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fs);
  const program = combineShaders(gl, vertexShader, fragmentShader);
  gl.useProgram(program);
  return program;
}

// note: assumes that buffer data is a 2d array. The number of items per entry in the
// actual flat buffer is calculated based on the size of the inner arrays.
function initBuffer(gl, program, attribName, bufferData) {
  const attributeLocation = gl.getAttribLocation(program, attribName);
  const buffer = gl.createBuffer();
  const flatData = [];
  const itemSize = bufferData[0].length;
  bufferData.forEach((d) => flatData.push(...d));

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flatData), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(attributeLocation);
  gl.vertexAttribPointer(attributeLocation, itemSize, gl.FLOAT, false, 0, 0);
}

function getUniformLocations(gl, program, uniformNames) {
  let uniforms = {};
  uniformNames.forEach((name) => {
    uniforms[name] = gl.getUniformLocation(program, name);
  });
  return uniforms;
}

export { initProgram, initBuffer, getUniformLocations };
