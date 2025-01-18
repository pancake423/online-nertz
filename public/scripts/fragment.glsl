precision highp float;

varying vec2 v_tex_coords;
varying vec3 v_normal;

uniform vec3 u_front_tex_idx;
uniform vec3 u_back_tex_idx;

uniform sampler2D u_tex1;
uniform sampler2D u_tex2;
uniform sampler2D u_tex3;
uniform sampler2D u_tex4;

void main() {
    gl_FragColor = vec4(1, 1, 1, 1);
}
