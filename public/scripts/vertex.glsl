#version 300 es

precision highp float;

in vec3 a_pos;
in vec3 a_normal;
in vec2 a_tex_coords;

out vec2 v_tex_coords;
out vec3 v_normal;
out vec3 v_pos;

uniform mat4 u_view_mat;
uniform mat4 u_model_mat;
uniform mat4 u_proj_mat;
uniform mat3 u_model_normal;

void main() {
    gl_Position = u_proj_mat * u_view_mat * u_model_mat * vec4(a_pos, 1.0);
    v_tex_coords = a_tex_coords;
    v_normal = u_model_normal * a_normal;
    v_pos = vec3(u_model_mat * vec4(a_pos, 1.0));
}
