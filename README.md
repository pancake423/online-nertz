1. Files of interest
There is a lot of code here, and only some of it is directly related to the assignment. Most of it is
for the Nertz implementation and not the AI model.

The following folders and files contain relevant code:
learning_agent: this contains all the code for the rule-based agent, genetic algorithm, and training procedure.
shared: This folder contains the logical implementation of Nertz rules.
analysis: This folder contains python scripts that are used to create the charts in the report.
data: This folder contains the raw data logs from training the AI.

2. Setup and running programs
This project was written on linux and uses Node.js and Python. The game itself is played on the web,
so it requires a browser. The development environment is listed below. Other versions of Linux and other browsers
will most likely work, but haven't been tested.

Environment:
OS: Linux Mint 22
Browser: Firefox
Python: v3.12
Node.js: v18

Setup:
run "npm install" to install the project's dependencies.


There are a few different programs that may be of interest to run.

Web server and game:
run "npm run start" to start the web server.
The game will be available at the address "localhost:3000/".
There is also a tool for replaying matches from game logs at "localhost:3000/replay/html"

Learning agent:
This is the program that trains the agents using a genetic algorithm.
run "npm run train" to run the training program. This can take a long time, especially on slower machines.
