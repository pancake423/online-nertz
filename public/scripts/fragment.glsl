#version 300 es

precision highp float;

in vec2 v_tex_coords;
in vec3 v_normal;
in vec3 v_pos;

const vec3 eye_pos = vec3(0, 0, 0);
const float EPSILON = 0.0;

// specifies where to find the front and back textures
// for the card. [texture, u, v]
uniform vec3 u_front_tex_idx;
uniform vec3 u_back_tex_idx;

// the fraction of the total texure that
// each card takes up per axis
uniform float u_x_scale;
uniform float u_y_scale;

uniform sampler2D u_tex1;
uniform sampler2D u_tex2;
uniform sampler2D u_tex3;
uniform sampler2D u_tex4;

out vec4 outputColor;

void main() {
    // figure out if the card is facing towards or away from the camera
    vec3 tex_idx = u_front_tex_idx;
    if (dot(v_normal, eye_pos - v_pos) < 0.0) {
        tex_idx = u_back_tex_idx;
    }
    // figure out the coordinates within the texture to sample the pixel from
    float u = (v_tex_coords[0] + tex_idx[1]) * u_x_scale;
    float v = (v_tex_coords[1] + tex_idx[2]) * u_y_scale;
    //float u = v_tex_coords[0];
    //float v = v_tex_coords[1];

    // select the correct texture to sample from
    if (tex_idx[0] == 0.0) {
        outputColor = texture(u_tex1, vec2(u, v));
    } else if (tex_idx[0] == 1.0) {
        outputColor = texture(u_tex2, vec2(u, v));
    } else if (tex_idx[0] == 2.0) {
        outputColor = texture(u_tex3, vec2(u, v));
    } else {
        outputColor = texture(u_tex4, vec2(u, v));
    }
    if (outputColor.a < EPSILON) {
        gl_FragDepth = 0.99; // do not draw transparent pixels over top of other pixels
        outputColor = vec4(0, 0, 0, 0);
    }
}
